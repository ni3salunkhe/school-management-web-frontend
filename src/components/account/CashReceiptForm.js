// src/components/account/Transactions/Forms/CashReceiptForm.js
import React, { useState, useEffect } from 'react';
import { Plus, FileText, XCircle } from 'lucide-react';
import { data, Link, useNavigate } from 'react-router-dom';
import apiService from '../../services/api.service';
import { jwtDecode } from 'jwt-decode';
import { BiIdCard } from 'react-icons/bi';
import Swal from 'sweetalert2';

const initialFormData = {
  createDate: new Date().toISOString().split('T')[0],
  custId: '',
  headId: null,
  subheadId: null,
  amount: '',
  narr: '',
  debitAccountId: 'CASH_IN_HAND',
  tranType: 'Cash Receipt',
  year: ''
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
  const navigate = useNavigate();


  const schoolUdise = jwtDecode(sessionStorage.getItem('token'))?.udiseNo;

  const fetchInitialData = async () => {
    setLoading(true);
    try {
      if (!schoolUdise) {
        setCustomers([]);
        return;
      }

      const headname = "Sundry Debtors"
      const customersData = await apiService.getdata(`customermaster/getcustomerbyheadname/${headname}/${schoolUdise}`);
      const leadgerData = await apiService.getdata(`generalledger/${schoolUdise}`)

      let selectedOpn = []

      for (let i = 0; i < leadgerData.data.length; i++) {
        selectedOpn.push(leadgerData.data[i].subhead && leadgerData.data[i].subhead.subheadId)
      }

      const filtered = (customersData.data || []).filter(
        party => selectedOpn.includes(party.custId)
      );
      const customersData1 = await apiService.getdata(`customermaster/getcustomerbyheadname/Cash%20In%20Hand/${schoolUdise}`);
      const recordMain = (customersData1.data || []).find(c => c.custName === "Cash In Hand" && selectedOpn.includes(c.subheadId.subheadId));

      if (!recordMain) {
        Swal.fire({
          icon: "error",
          title: "Oops...",
          text: "जनरल लेजर मध्ये ताळेबंद मधील एंट्री भरा!",
        });
        navigate('/clerk/dashboard');
        return;
      }

      setCustomers(filtered || []);
      setMainHead({
        headName: recordMain.custName,
        headId: recordMain.headId.headId,
        subheadId: recordMain.subheadId.subheadId
      })

      const init = async () => {
        const datas = await apiService.getdata('generalledger/');
        const openBalance = (datas.data || []).find(
          b => b.entryType === "Opening Balance" && (b.custId && Number(b.custId.custId)) === Number(recordMain.custId)
        );
        // console.log(opnNBalance.drAmt)
        const transBalance = (datas.data || []).filter(
          b => b.entryType === "Cash Receipt" ||
            b.entryType === "Expense Payment" && (b.custId && Number(b.custId.custId)) === Number(recordMain.custId)
        );
        const transBalance2 = (datas.data || []).filter(
          b => b.entryType === "Cash Payment" ||
            b.entryType === "Expense Payment" && (b.custId && Number(b.custId.custId)) === Number(recordMain.custId)
        )
        let trans = 0;
        transBalance2.map(a => trans += a.crAmt);

        console.log(recordMain.custId);

        console.log(datas.data);

        const transAmt = (datas.data || []).filter(b => (b.entryType === "Cash Payment" || b.entryType === "Cash Receipt" || b.entryType === "Contra Payment") && (b.custId && Number(b.custId.custId)) === Number(recordMain.custId));

        let drTransaction = 0;
        let crTransaction = 0;

        console.log(transAmt);

        transAmt.forEach(a => {
          drTransaction += a.drAmt || 0;
          crTransaction += a.crAmt || 0;
        });

        setMainHeadBalance((openBalance.drAmt + drTransaction) - crTransaction);

        setYear();
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

  const setYear = () => {
    const calculatefinancialYear = () => {
      const currentDate = new Date();
      const currentYear = currentDate.getFullYear();
      const currentMonth = currentDate.getMonth(); // 0-11 (Jan-Dec)

      // If current month is June (5) or later, academic year is currentYear-nextYear
      if (currentMonth >= 3) {
        return `${currentYear}-${currentYear + 1}`;
      }
      return `${currentYear - 1}-${currentYear}`;
    };

    if (calculatefinancialYear) {
      setFormData((prev) => ({ ...prev, year: calculatefinancialYear() }))
    }
  }

  useEffect(() => {

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
        console.log(customerData.data);
        console.log(selectedCustomer);


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
        const datas = await apiService.getdata(`generalledger/${schoolUdise}`);

        const opnNBalance = (datas.data || []).find(
          b => b.entryType === "Opening Balance" &&
            b.custId && Number(b.custId && b.custId.custId) === Number(selectedCustomer.subheadId.subheadId)
        );

        const transBalance = (datas.data || []).filter(
          b => (b.entryType === "Cash Receipt" || b.entryType === "Bank Receipt" || b.entryType === "Journal Payment") &&
            b.subhead && Number(b.subhead.subheadId) === Number(selectedCustomer.subheadId.subheadId)
        );

        const openingAmt = opnNBalance?.drAmt || 0;

        let transactionAmt = 0;
        transBalance.forEach(a => transactionAmt += a.crAmt || 0);

        let drtransaction = 0;
        transBalance.forEach(a => drtransaction += a.drAmt || 0);

        const balance = (openingAmt - transactionAmt) + drtransaction;
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

    const payload = {
      ...formData,
      amount: parseFloat(formData.amount),
      schoolUdise: schoolUdise,
      entryDate: formData.createDate,
    };

    setLoading(true);

    try {
      // Check if balance is less than amount
      if (payload.amount > currentBalance) {
        const result = await Swal.fire({
          title: "रक्कम उपलब्ध शिल्लकीपेक्षा जास्त आहे. तरीही स्वीकारायची आहे का?",
          showDenyButton: true,
          showCancelButton: true,
          confirmButtonText: "होय, जतन करा",
          denyButtonText: "नको, बदल जतन करू नका"
        });

        if (result.isConfirmed) {
          await apiService.post("cashreceipt/", payload);
          handleClear();
          Swal.fire("जतन झाले!", "", "success");
          fetchInitialData();
        } else if (result.isDenied) {
          Swal.fire("बदल जतन केले गेले नाहीत.", "", "info");
          handleClear();
        }

        return; // prevent continuing to the default save logic
      }

      // Normal save (if amount is not > balance)
      await apiService.post("cashreceipt/", payload);
      Swal.fire("यशस्वी", "यशस्वीरीत्या जतन केले!", "success");
      handleClear();
      fetchInitialData();

    } catch (err) {
      console.error(err);
      setError(`ऑपरेशन अयशस्वी: ${err.message}`);
    } finally {
      setLoading(false);
      setYear();
    }
  };


  const handleClear = () => {
    setFormData(prev => ({ ...initialFormData, voucherNo: isEditMode ? prev.voucherNo : prev.voucherNo, date: new Date().toISOString().split('T')[0] }));
    setCurrentBalance(null)
    setError(null);
    setSuccess(null);
    setYear();
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