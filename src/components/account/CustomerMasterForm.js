// src/components/account/Masters/CustomerMasterForm.js
import React, { useState, useEffect } from 'react';
import { Edit, Trash2, Save, XCircle, UserPlus, Search as SearchIcon } from 'lucide-react';
// import { getCustomers, saveCustomer, updateCustomer, deleteCustomer } from '../../../services/accountApi';
import { Link } from 'react-router-dom';
import apiService from '../../services/api.service';
import Swal from 'sweetalert2';
import CombinedDropdownInput from '../CombinedDropdownInput';

const initialFormData = {
  custName: '',
  customerType: '', // Default for a school
  contactPerson: '',
  mobileNo: '',
  eMail: '',
  schoolUdise:'',
  custAddress: '',
  city: '',
  pinCode: '',
  gstin: '', // Important for vendors
  panNo: '',
  // openingBalance: '',
  // balanceType: 'Debit', 
  // status: 'Active'
};

const CustomerMasterForm = () => {
  const [formData, setFormData] = useState(initialFormData);
  const [customerList, setCustomerList] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [partyType, setPartyType] = useState([]);
  const [partyTypeId, setPartyId] = useState();

  useEffect(() => {
    fetchCustomers();
  }, []);

  useEffect(() => {
    const fetchCustomerType = async () => {
      setLoading(true);
      try {
        const response = await apiService.getdata("customertype/");
        console.log(response.data);

        if (response && response.data) {
          setPartyType(response.data.map(item => item.customerTypeName) || [])
        }
        else {
          setPartyType(["कोणतीही माहिती मिळाली नाही "]);

        }
      }
      catch (Error) {
        console.error("Error fetching reasons:", Error);
        Swal.fire('Error', 'Failed to load predefined reasons.', 'error');
      }
      finally {
        setLoading(false);
      }
    }

    fetchCustomerType();
  }, [])

  const fetchCustomers = async () => {
    setLoading(true);
    setError(null);
    try {
      // const data = await getCustomers();
      // setCustomerList(data || []);
      // --- MOCK DATA ---

      const mockCustomers = [
        { id: 'cust001', customerName: 'Aarav Sharma (S/O Ramesh)', customerType: 'Student', mobileNo: '9876543210', email: 'aarav@example.com', openingBalance: 5000, balanceType: 'Debit', status: 'Active', gstin: '', panNo: 'ABCDE1234F' },
        { id: 'cust002', customerName: 'Priya Singh (Parent of Ananya)', customerType: 'Parent', mobileNo: '9123456789', email: 'priya.parent@example.com', openingBalance: 0, balanceType: 'Debit', status: 'Active', gstin: '' },
        { id: 'cust003', customerName: 'Modern Stationers', customerType: 'Vendor', mobileNo: '9988776655', email: 'sales@modernstationers.com', openingBalance: 15000, balanceType: 'Credit', status: 'Active', gstin: '22AAAAA0000A1Z5', panNo: 'FGHIJ5678K' },
        { id: 'cust004', customerName: 'Rajesh Kumar (Staff)', customerType: 'Staff', mobileNo: '9000011111', email: 'rajesh.staff@example.com', openingBalance: 0, balanceType: 'Debit', status: 'Inactive', gstin: '' },
      ];
      setCustomerList(mockCustomers);
      // --- END MOCK DATA ---
    } catch (err) {
      setError(`Failed to fetch customers: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // const handleInputChange = (e) => {
  //   const { name, value } = e.target;

  //   setFormData({ ...formData, [name]: value });
  //   setError(null);
  //   setSuccess(null);
  // };


  const handleInputChange = (eOrId, value) => {
    if (typeof eOrId === 'string') {
      // Called from CombinedDropdownInput
      const name = eOrId;
      setFormData(prev => ({ ...prev, [name]: value }));
    } else {
      // Regular input change event
      const { name, value } = eOrId.target;
      setFormData(prev => ({ ...prev, [name]: value }));
    }
    setError(null);
    setSuccess(null);
  };


  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.custName || !formData.mobileNo) {
      setError("Customer Name and Mobile No. are required.");
      return;
    }
    if (formData.customerType === 'Vendor' && !formData.gstin && !formData.panNo) {
      // setError("For Vendors, either GSTIN or PAN No. is recommended.");
      // return; // Or make it a soft warning
      console.warn("GSTIN/PAN not provided for Vendor.");
    }

    setLoading(true);
    try {
      const trimmedCustomerType = formData.customerType.trim();

      const isNewCustomerType = !partyType.some(option => option.toLowerCase() === trimmedCustomerType.toLowerCase())

      if (isNewCustomerType) {
        const payload = {
          customerTypeName: trimmedCustomerType
        }

        const customerTypeResponse = await apiService.post("customertype/", payload);
        console.log(customerTypeResponse);

        setPartyId(customerTypeResponse.data.id);
      }
    }
    catch (error) {
      console.error("Error:", error);
    }

    // setLoading(true);
    setError(null);
    setSuccess(null);
    // try {
    //   let response;
    //   if (isEditing && formData.id) {
    //     // response = await updateCustomer(formData.id, formData);
    //     console.log('Updating Customer (Mock):', formData);
    //     response = { ...formData, id: formData.id };
    //     setSuccess(`Customer "${formData.customerName}" updated successfully!`);
    //   } else {
    //     // response = await saveCustomer(formData);
    //     console.log('Saving New Customer (Mock):', formData);
    //     response = { ...formData, id: `cust00${customerList.length + 1}` };
    //     setSuccess(`Customer "${formData.customerName}" saved successfully!`);
    //   }
    //   handleClear();
    //   fetchCustomers();
    // } catch (err) {
    //   setError(`Operation Failed: ${err.message}`);
    // } finally {
    //   setLoading(false);
    // }
    try {

      // setFormData(prev => ({ ...prev, customerType: partyTypeId }));
      const payload={
        ...formData,custTypeID:partyTypeId
      }

      const response = await apiService.post("customermaster/", formData);

      console.log(response);

    }
    catch (err) {
      setError(`Operation Failed: ${err.message}`);
    }
    finally {
      setLoading(false)
    }
  };

  const handleEdit = (customer) => {
    setIsEditing(true);
    setFormData({ ...customer, openingBalance: customer.openingBalance || '' });
    setError(null);
    setSuccess(null);
    window.scrollTo(0, 0);
  };

  const handleDelete = async (customerId, customerName) => {
    if (window.confirm(`Are you sure you want to delete customer "${customerName}"? This may affect linked transactions.`)) {
      setLoading(true);
      setError(null);
      setSuccess(null);
      try {
        // await deleteCustomer(customerId);
        console.log('Deleting customer ID (Mock):', customerId);
        setSuccess(`Customer "${customerName}" deleted successfully!`);
        fetchCustomers();
      } catch (err) {
        setError(`Failed to delete customer: ${err.message}`);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleClear = () => {
    setFormData(initialFormData);
    setIsEditing(false);
    setError(null);
    setSuccess(null);
  };

  const filteredCustomerList = customerList.filter(cust =>
    cust.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cust.mobileNo.includes(searchTerm) ||
    (cust.email && cust.email.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="container-fluid py-5">
      <div className="row mb-3">
        <div className="col-md-12">
          <h3 className='fw-bold' style={{
            fontFamily: '"Noto Serif Devanagari", serif',
            fontOpticalSizing: 'auto',
            fontStyle: 'normal',
          }}>ग्राहक नोंद </h3>
          {/* <nav aria-label="breadcrumb">
            <ol className="breadcrumb">
              <li className="breadcrumb-item"><Link to="/account/dashboard">Masters</Link></li>
              <li className="breadcrumb-item active" aria-current="page">Party Master</li>
            </ol>
          </nav> */}
        </div>
      </div>

      {error && <div className="alert alert-danger" role="alert">{error}</div>}
      {success && <div className="alert alert-success" role="alert">{success}</div>}

      <div className="card mb-4">
        <div className="card-header">
          <h5 className="mb-0">
            {isEditing ? 'Edit Party Details' : <><UserPlus size={20} className="me-2" /> नवीन ग्राहक नोंद करा </>}
          </h5>
        </div>
        <div className="card-body">
          <form onSubmit={handleSubmit}>
            <div className="row g-3 mb-3">
              <div className="col-md-5">
                <label htmlFor="custName" className="form-label">ग्राहक नाव  *</label>
                <input type="text" id="custName" name="custName" className="form-control" value={formData.custName} onChange={handleInputChange} placeholder="कृपया पूर्ण नाव भरा" required />
              </div>
              <div className="col-md-3">
                {/* <label htmlFor="customerType" className="form-label">Party Type *</label>
                <select id="customerType" name="customerType" className="form-select" value={formData.customerType} onChange={handleInputChange} required>
                  <option value="Student">Student</option>
                  <option value="Parent">Parent</option>
                  <option value="Vendor">Vendor/Supplier</option>
                  <option value="Staff">Staff Member</option>
                  <option value="Other">Other</option>
                </select> */}
                <CombinedDropdownInput
                  label="ग्राहक प्रकार  "
                  id="customerType"
                  name="customerType"
                  value={formData.customerType}
                  onChange={handleInputChange}
                  required={true}
                  options={partyType}
                  className="col-lg-12"
                />
              </div>
              <div className="col-md-4">
                <label htmlFor="contactPerson" className="form-label">Contact Person (if any)</label>
                <input type="text" id="contactPerson" name="contactPerson" className="form-control" value={formData.contactPerson} onChange={handleInputChange} placeholder="e.g., Accounts Dept." />
              </div>
            </div>

            <div className="row g-3 mb-3">
              <div className="col-md-4">
                <label htmlFor="mobileNo" className="form-label">मोबाईल नंबर *</label>
                <input type="tel" id="mobileNo" name="mobileNo" className="form-control" value={formData.mobileNo} onChange={handleInputChange} placeholder="कृपया मोबाईल नंबर भरा " required pattern="[0-9]{10}" title="Enter 10 digit mobile number" />
              </div>
              <div className="col-md-4">
                <label htmlFor="email" className="form-label">ई-मेल</label>
                <input type="email" id="email" name="email" className="form-control" value={formData.email} onChange={handleInputChange} placeholder="कृपया ईमेल भरा" />
              </div>
              {/* <div className="col-md-4">
                <label htmlFor="status" className="form-label">Status</label>
                <select id="status" name="status" className="form-select" value={formData.status} onChange={handleInputChange}>
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                  <option value="Blocked">Blocked</option>
                </select>
              </div> */}
            </div>

            <div className="row g-3 mb-3">
              <div className="col-md-12">
                <label htmlFor="address" className="form-label">पूर्ण पत्ता</label>
                <textarea id="address" name="address" className="form-control" rows="2" value={formData.address} onChange={handleInputChange} placeholder="कृपया पूर्ण पत्ता भरा"></textarea>
              </div>
            </div>
            <div className="row g-3 mb-3">
              {/* <div className="col-md-4">
                <label htmlFor="city" className="form-label">City</label>
                <input type="text" id="city" name="city" className="form-control" value={formData.city} onChange={handleInputChange} placeholder="Enter city" />
              </div> */}
              <div className="col-md-2">
                <label htmlFor="pincode" className="form-label">पिनकोड</label>
                <input type="text" id="pincode" name="pincode" className="form-control" value={formData.pincode} onChange={handleInputChange} placeholder="e.g., 110001" pattern="[0-9]{6}" title="Enter 6 digit pincode" />
              </div>
              <div className="col-md-3">
                <label htmlFor="gstin" className="form-label">GSTIN  (जर लागू असेल तर)</label>
                <input type="text" id="gstin" name="gstin" className="form-control" value={formData.gstin} onChange={handleInputChange} placeholder="15-digit GSTIN" />
              </div>
              <div className="col-md-3">
                <label htmlFor="panNo" className="form-label">PAN No. (जर लागू असेल तर)</label>
                <input type="text" id="panNo" name="panNo" className="form-control" value={formData.panNo} onChange={handleInputChange} placeholder="10-digit PAN" />
              </div>
            </div>

            {/* 
            <div className="row g-3 mb-3">
              <div className="col-md-4">
                <label htmlFor="openingBalance" className="form-label">Book Opening Balance (Optional)</label>
                <input type="number" id="openingBalance" name="openingBalance" className="form-control" value={formData.openingBalance} onChange={handleInputChange} placeholder="0.00" step="0.01" />
              </div>
              <div className="col-md-4">
                <label htmlFor="balanceType" className="form-label">Balance Type</label>
                <select id="balanceType" name="balanceType" className="form-select" value={formData.balanceType} onChange={handleInputChange}>
                  <option value="Debit">Debit (Receivable)</option>
                  <option value="Credit">Credit (Payable/Advance)</option>
                </select>
              </div>
            </div> */}

            <div className="d-flex gap-2">
              <button type="submit" className="btn btn-primary" disabled={loading}>
                <Save size={16} className="me-1" />
                {loading ? (isEditing ? 'Updating...' : 'Saving...') : (isEditing ? 'Update Party' : 'Save Party')}
              </button>
              <button type="button" className="btn btn-secondary" onClick={handleClear} disabled={loading}>
                <XCircle size={16} className="me-1" />
                {isEditing ? 'Cancel Edit' : 'Clear Form'}
              </button>
            </div>
          </form>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <div className="d-flex justify-content-between align-items-center">
            <h5 className="mb-0">Existing Parties</h5>
            <div className="input-group w-auto">
              <input
                type="text"
                className="form-control form-control-sm"
                placeholder="Search by name, mobile, email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <button className="btn btn-outline-secondary btn-sm" type="button"><SearchIcon size={16} /></button>
            </div>
          </div>
        </div>
        <div className="card-body p-0">
          {loading && customerList.length === 0 ? <div className="text-center p-3"><div className="spinner-border spinner-border-sm"></div> Loading...</div> :
            filteredCustomerList.length === 0 ? <p className="p-3 text-center text-muted">No parties found.</p> :
              (
                <div className="table-responsive">
                  <table className="table table-hover table-striped mb-0">
                    <thead>
                      <tr>
                        <th>Party Name</th>
                        <th>Type</th>
                        <th>Mobile No.</th>
                        <th>Email</th>
                        <th>GSTIN</th>
                        <th className="text-end">Op. Balance</th>
                        <th>Status</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredCustomerList.map(cust => (
                        <tr key={cust.id}>
                          <td>{cust.customerName}</td>
                          <td>{cust.customerType}</td>
                          <td>{cust.mobileNo}</td>
                          <td>{cust.email || '-'}</td>
                          <td>{cust.gstin || '-'}</td>
                          <td className="text-end">
                            {cust.openingBalance ? `₹${Number(cust.openingBalance).toLocaleString('en-IN')} ${cust.balanceType === 'Debit' ? 'Dr' : 'Cr'}` : '-'}
                          </td>
                          <td>
                            <span className={`badge ${cust.status === 'Active' ? 'bg-success' : cust.status === 'Inactive' ? 'bg-secondary' : 'bg-danger'}`}>
                              {cust.status}
                            </span>
                          </td>
                          <td>
                            <div className="btn-group btn-group-sm">
                              <button className="btn btn-outline-primary" onClick={() => handleEdit(cust)} title="Edit"><Edit size={14} /></button>
                              <button className="btn btn-outline-danger" onClick={() => handleDelete(cust.id, cust.customerName)} title="Delete"><Trash2 size={14} /></button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
        </div>
        {filteredCustomerList.length > 0 && <div className="card-footer text-muted small">
          Showing {filteredCustomerList.length} of {customerList.length} parties.
        </div>}
      </div>
    </div>
  );
};

export default CustomerMasterForm;