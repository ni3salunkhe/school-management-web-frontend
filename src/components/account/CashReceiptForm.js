// src/components/account/Transactions/Forms/CashReceiptForm.js
import React, { useState, useEffect } from 'react';
import { Plus, FileText, XCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import apiService from '../../services/api.service';
import { jwtDecode } from 'jwt-decode';
import { BiIdCard } from 'react-icons/bi';

const initialFormData = {
  createDate: new Date().toISOString().split('T')[0],
  custId: '',
  headId: null,
  subheadId: null,
  amount: '',
  narr: '',
  debitAccountId: 'CASH_IN_HAND',
  tranType: 'Cash Receipt'
};

const CashReceiptForm = ({ isEditMode = false, transactionId = null }) => {
  const [mainHead, setMainHead] = useState({})
  const [formData, setFormData] = useState(initialFormData);
  const [creditAccounts, setCreditAccounts] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [selectCustomer, setSelectCustomer] = useState({});
  const [mainHeadBalance, setMainHeadBalance] = useState(0);
  const [currentBalance, setCurrentBalance] = useState(null);


  const schoolUdise = jwtDecode(sessionStorage.getItem('token'))?.udiseNo;

  useEffect(() => {
    const fetchInitialData = async () => {
      setLoading(true);
      try {
        if (!schoolUdise) {
          setCustomers([]);
          return;
        }

        const headname = "Sundry Debtors"
        const customersData = await apiService.getdata(`customermaster/getcustomerbyheadname/${headname}/${schoolUdise}`);
        // setCustomers(customersData.data || []);

        const customersData1 = await apiService.getdata(`customermaster/getcustomerbyheadname/Cash%20In%20Hand/${schoolUdise}`);
        const recordMain = (customersData1.data || []).find(c => c.custName === "Cash In Hand") || customersData.data


        const leadgerData = await apiService.getdata(`generalledger/${schoolUdise}`)

        let selectedOpn = []

        for (let i = 0; i < leadgerData.data.length - 1; i++) {
          selectedOpn.push(leadgerData.data[i].subhead && leadgerData.data[i].subhead.subheadId)
        }

        const filtered = (customersData.data || []).filter(
          party => selectedOpn.includes(party.subheadId.subheadId)
        );
        // console.log(recordMain);

        setCustomers(filtered || []);
        setMainHead({
          headName: recordMain.custName,
          headId: recordMain.headId.headId,
          subheadId: recordMain.subheadId.subheadId
        })

        const init = async () => {
          const datas = await apiService.getdata('generalledger/');
          const opnNBalance = (datas.data || []).find(
            b => b.entryType === "Opening Balance" && (b.custId && Number(b.custId.custId)) === Number(recordMain.custId)
          );
          // console.log(opnNBalance.drAmt)
          const transBalance = (datas.data || []).filter(
            b => b.entryType === "Cash Receipt" && (b.custId && Number(b.custId.custId)) === Number(recordMain.custId)
          );
          // console.log(+transBalance)

          const transBalance2 = (datas.data || []).filter(
            b => b.entryType === "Cash Payment" && (b.custId && Number(b.custId.custId)) === Number(recordMain.custId)
          )
          // console.log( "transaction balance 2"+transBalance2);
          let trans = 0;
          transBalance2.map(a => trans += a.crAmt);
          // console.log(opnNBalance.drAmt - trans);
          // setMainHeadBalance(opnNBalance.drAmt - trans)
          // console.log(mainHeadBalance);


          let transactionAmt = 0;
          transBalance.map(a => transactionAmt += a.drAmt)
          const amt = (opnNBalance.drAmt + transactionAmt) - trans;
          setMainHeadBalance(amt)
          // setMainHeadBalance(opnNBalance.drAmt + transactionAmt)
        }

        init();

        if (isEditMode && transactionId) {
          console.log("Edit mode for transaction ID:", transactionId);
        } else {
          setFormData(prev => ({ ...prev }));
        }

      } catch (err) {
        setError(`प्रारंभिक डेटा लोड करण्यात अयशस्वी: ${err.message}`);
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchInitialData();
  }, [isEditMode, transactionId]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    setError(null);
    setSuccess(null);
  };

  const handleCustomerChange = async (e) => {
    const customerId = e.target.value;

    const fetchAndSetCustomer = async () => {
      try {
        const customerData = await apiService.getbyid("customermaster/", customerId);
        const selectedCustomer = customerData.data;

        if (!selectedCustomer || !selectedCustomer.subheadId || !selectedCustomer.subheadId.subheadId) {
          console.error("Invalid customer data or missing subheadId");
          setError("निवडलेल्या खात्याची माहिती अपूर्ण आहे.");
          return;
        }

        setSelectCustomer(selectedCustomer);
        setFormData(prev => ({
          ...prev,
          custId: customerId,
          headId: selectedCustomer.headId.headId || '',
          subheadId: selectedCustomer.subheadId.subheadId || "",
        }));

        // Now fetch ledger balance
        const datas = await apiService.getdata('generalledger/');

        const opnNBalance = (datas.data || []).find(
          b => b.entryType === "Opening Balance" &&
            b.custId && Number(b.custId.custId) === Number(selectedCustomer.subheadId.subheadId)
        );

        const transBalance = (datas.data || []).filter(
          b => (b.entryType === "Cash Receipt" || b.entryType === "Bank Receipt") &&
            b.custId && Number(b.custId.custId) === Number(selectedCustomer.subheadId.subheadId)
        );


        let transactionAmt = 0;
        transBalance.forEach(a => transactionAmt += a.crAmt || 0);

        const openingAmt = opnNBalance?.drAmt || 0;
        console.log(openingAmt);

        const balance = openingAmt - transactionAmt;
        setCurrentBalance(balance);


      } catch (err) {
        console.error("Error fetching customer or ledger data", err);
        setError("पक्षाची माहिती किंवा शिल्लक मिळवताना त्रुटी आली.");
      }
    };

    fetchAndSetCustomer();
  };


  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      setError("रक्कम शून्यापेक्षा जास्त असणे आवश्यक आहे.");
      return;
    }
    if (!formData.receivedFromName && !formData.custId) {
      setError("कृपया रक्कम कोणाकडून प्राप्त झाली ते निर्दिष्ट करा.");
      return;
    }
    if (!formData.narr.trim()) {
      setError("निरूपण/उद्देश आवश्यक आहे.");
      return;
    }

    setLoading(true);
    try {
      if (!formData.custId) {
        return;
      }

      const payload = { ...formData, amount: parseFloat(formData.amount), schoolUdise: schoolUdise, entryDate: formData.createDate };
      const response = await apiService.post("cashreceipt/", payload);
      console.log(response.data);

      console.log('Submitting Data:', payload);
      setSuccess(`यशस्वीरित्या ${isEditMode ? 'अपडेट' : 'जतन'} केले!`);
      if (!isEditMode) {
        const nextVoucher = `CR-${new Date().getFullYear().toString().slice(-2)}${(new Date().getMonth() + 1).toString().padStart(2, '0')}-00${Math.floor(Math.random() * 100) + 1}`;
      }

    } catch (err) {
      setError(`ऑपरेशन अयशस्वी: ${err.message}`);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setFormData(prev => ({ ...initialFormData, voucherNo: isEditMode ? prev.voucherNo : prev.voucherNo, date: new Date().toISOString().split('T')[0] }));
    setError(null);
    setSuccess(null);
  };

  if (loading && !formData.voucherNo && !isEditMode) {
    return <div className="text-center p-5"><div className="spinner-border"></div><p>फॉर्म लोड होत आहे...</p></div>;
  }

  return (
    <div className="container-fluid py-3">
      <div className="row mb-3">
        <div className="col-12">
          <h3>{isEditMode ? 'रोख पावती संपादित करा' : 'नवीन रोख पावती'}</h3>
          <nav aria-label="breadcrumb">
            <ol className="breadcrumb">
              <li className="breadcrumb-item"><Link to="/account/transactions/cash-receipts">व्यवहार</Link></li>
              <li className="breadcrumb-item active" aria-current="page">{isEditMode ? 'संपादन' : 'नवीन'} रोख पावती</li>
            </ol>
          </nav>
        </div>
      </div>

      {error && <div className="alert alert-danger" role="alert">{error}</div>}
      {success && <div className="alert alert-success" role="alert">{success}</div>}

      <div className="card">
        <div className="card-header">
          <h5 className="mb-0">रोख पावतीचा तपशील प्रविष्ट करा</h5>
        </div>
        <div className="card-body">
          <form onSubmit={handleSubmit}>
            <div className="row g-3 mb-3">
              <div className="col-md-4">
                <label htmlFor="createDate" className="form-label">तारीख *</label>
                <input
                  type="date" id="createDate" name="createDate" className="form-control"
                  value={(formData.createDate || '')} onChange={handleInputChange} required
                />
              </div>
            </div>

            <div className="mb-4 bg-light p-3 rounded">
              <h5 className="border-bottom pb-2 mb-3 fw-bold">
                <BiIdCard className="me-2" />
                देयकर्ता खाते माहिती
              </h5>
              <div className="row g-3 mb-3">
                <div className="col-md-4">
                  <label htmlFor="custId" className="form-label">पक्षकार *</label>
                  <select
                    id="custId" name="custId" className="form-select"
                    value={formData.custId} onChange={handleCustomerChange} required
                  >
                    <option value="">पक्ष/ग्राहक निवडा</option>
                    {customers.map(cust => <option key={cust.custId} value={cust.custId || ''}>{cust.custName}</option>)}
                  </select>
                </div>

                <div className="col-md-2">
                  <label className="form-label">खाते क्र.</label>
                  <input type="text" className="form-control" value={formData.custId || ''} name='headId' readOnly disabled />
                </div>

                <div className="col-md-4">
                  <label className="form-label">वर्तमान शिल्लक</label>
                  <input type="text" className="form-control" value={currentBalance || ''} readOnly disabled />
                </div>
              </div>
            </div>

            <div className="mb-4 bg-light p-3 rounded">
              <h5 className="border-bottom pb-2 mb-3 fw-bold">
                <BiIdCard className="me-2" />
                प्राप्तकर्ता खाते माहिती
              </h5>
              <div className="row g-3 mb-3">
                <div className="col-md-4">
                  <label className="form-label">जमा खाते</label>
                  <input type="text" className="form-control" value={mainHead.headName} readOnly disabled />
                </div>

                <div className="col-md-2">
                  <label className="form-label">खाते क्र.</label>
                  <input type="text" className="form-control" value={mainHead.headId} name='headId' readOnly disabled />
                </div>

                <div className="col-md-4">
                  <label className="form-label">वर्तमान शिल्लक</label>
                  <input type="text" className="form-control" value={mainHeadBalance} readOnly disabled />
                </div>
              </div>
            </div>

            {/* <div className="row g-3 mb-3">
              <div className="col-md-6">
                <label htmlFor="custId" className="form-label">प्राप्तकर्ता (पक्ष) *</label>
                <select
                  id="custId" name="custId" className="form-select"
                  value={formData.custId} onChange={handleCustomerChange} required
                >
                  <option value="">पक्ष/ग्राहक निवडा</option>
                  {customers.map(cust => <option key={cust.custId} value={cust.custId}>{cust.custName}</option>)}
                </select>
              </div>

              <div className="col-md-6">
                <label className="form-label">डेबिट खाते</label>
                <input type="text" className="form-control" value="रोख जमा (डीफॉल्ट)" readOnly disabled />
              </div>
            </div> */}

            <h5 className='fw-bold border-top pt-4'>रोख तपशील</h5>
            <div className="row g-3 mb-3">
              <div className="col-md-3">
                <label htmlFor="amount" className="form-label">रक्कम *</label>
                <input
                  type="number" id="amount" name="amount" className="form-control"
                  value={formData.amount} onChange={handleInputChange}
                  placeholder="०.००" step="0.01" min="0.01" required
                />
              </div>

              <div className="col-md-9">
                <label htmlFor="narr" className="form-label">निरूपण/उद्देश *</label>
                <input
                  type="text" id="narr" name="narr" className="form-control"
                  value={formData.narr} onChange={handleInputChange}
                  placeholder="उदा., इयत्ता X साठी शिक्षण शुल्क - जुलै, क्रीडा कार्यक्रमासाठी अग्रिम" required
                />
              </div>
            </div>

            <div className="d-flex gap-2 mt-4">
              <button type="submit" className="btn btn-primary" disabled={loading}>
                <Plus size={16} className="me-1" />
                {loading ? (isEditMode ? 'अपडेट करत आहे...' : 'जतन करत आहे...') : (isEditMode ? 'पावती अपडेट करा' : 'पावती जतन करा')}
              </button>
              <button type="button" className="btn btn-info" disabled={loading || !formData.amount}>
                <FileText size={16} className="me-1" />
                पावती छापा
              </button>
              <button type="button" className="btn btn-secondary" onClick={handleClear} disabled={loading}>
                <XCircle size={16} className="me-1" /> साफ करा
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CashReceiptForm;