import React, { useEffect, useState } from 'react';
import apiService from '../../services/api.service';
import { jwtDecode } from 'jwt-decode';

function JournalForm() {
    const [formData, setFormData] = useState({
        creditAccount: '',
        tranType: 'Journal Payment',
        date: new Date().toISOString().split('T')[0],
        createDate: new Date().toISOString().split('T')[0],
        entryDate: new Date().toISOString().split('T')[0],
        cramount: '',
        narr: '',
        entries: [
            { debitaccount: '', amount: '' }
        ]
    });

    const [totals, setTotals] = useState(0);
    const udiseNo = jwtDecode(sessionStorage.getItem('token'))?.udiseNo;
    const [parties, setParties] = useState([]);
    const [selectedCreditAccount, setSelectedCreditAccount] = useState('');
    const [leadgerData, setLeadgerData] = useState([]);
    const [currentBalance, setCurrentBalance] = useState(0);

    useEffect(() => {
        const fetchData = async () => {
            const response = await apiService.getdata(`subheadmaster/getbyudise/${udiseNo}`);
            const filtered = response.data.filter(item => {
                const headName = item.headId?.headName;
                return headName !== "Bank Accounts" &&
                    headName !== "Bank OCC A/c" &&
                    headName !== "Bank OD A/c." &&
                    item.subheadName !== "Cash In Hand";
            });
            setParties(filtered);
            const generalLeadger = await apiService.getdata(`generalledger/${udiseNo}`);
            setLeadgerData(generalLeadger.data);

            const transactionKey=await apiService.getdata("journal/transactionkey");
            console.log(transactionKey.data);
            
        };
        fetchData();
    }, [udiseNo]);

    const filteredParties = parties.filter(p => String(p.subheadId) !== String(selectedCreditAccount));

    const getAvailableSubheadsForEntry = (index) => {
        return filteredParties.filter(p => {
            const subheadIdStr = String(p.subheadId);
            const isAlreadySelected = formData.entries.some((ent, i) =>
                i !== index && String(ent.debitaccount) === subheadIdStr
            );
            return !isAlreadySelected;
        });
    };

    const handlePartyChange = (e) => {
        const { name, value } = e.target;
        setSelectedCreditAccount(value);

        const data = parties.find(p => p.subheadId === Number(value));

        const openingbalence = leadgerData.find(b => b.entryType === "Opening Balance" && b.subhead.subheadId === data.subheadId);

        let opnBalance = 0;

        const jrtransbalance = leadgerData.filter(b => b.entryType === "Journal Payment" && b.subhead.subheadId === data.subheadId);

        let crjrtransBal = 0;
        jrtransbalance.map(a => crjrtransBal += a.crAmt);

        let drjrtranBal = 0;
        jrtransbalance.map(a => drjrtranBal += a.drAmt);


        if (data.headId.bookSideMaster.booksideName === "Liabilities") {
            opnBalance = openingbalence.crAmt;
            let sctrans = 0;
            if (data.headId.headName === "Sundry Creditors") {
                const transbal = leadgerData.filter(b => (b.entryType === "Cash Payment" || b.entryType === "Bank Payment") && b.subhead.subheadId === data.subheadId)

                transbal.map(a => sctrans += a.drAmt);
                setCurrentBalance((Number(opnBalance - sctrans) + crjrtransBal) - drjrtranBal);
            }
            else {
                setCurrentBalance((opnBalance + crjrtransBal) - drjrtranBal);
            }

        }

        if (data.headId.bookSideMaster.booksideName === "Asset") {
            opnBalance = openingbalence.drAmt;

            let sdtrans = 0;
            if (data.headId.headName === "Sundry Debtors") {
                const tranbal = leadgerData.filter(b => (b.entryType === "Cash Receipt" || b.entryType === "Bank Receipt") && b.subhead.subheadId === data.subheadId)

                tranbal.map(a => sdtrans += a.crAmt);

                setCurrentBalance(((opnBalance + sdtrans) - crjrtransBal) + drjrtranBal);
            }
            else {
                setCurrentBalance((opnBalance - crjrtransBal) + drjrtranBal);
            }

        }

        if (data.headId.bookSideMaster.booksideName === "Profit And Loss") {
            opnBalance = openingbalence.drAmt;
            setCurrentBalance(opnBalance - crjrtransBal);
        }

        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleEntryChange = (index, field, value) => {
        const updatedEntries = [...formData.entries];
        updatedEntries[index][field] = value;

        setFormData(prev => ({
            ...prev,
            entries: updatedEntries
        }));

        calculateTotals(updatedEntries);
    };

    const calculateTotals = (entries) => {
        const totalAmount = entries.reduce((sum, entry) => {
            return sum + (parseFloat(entry.amount) || 0);
        }, 0);
        setTotals(totalAmount);
    };

    const addEntry = () => {
        setFormData(prev => ({
            ...prev,
            entries: [...prev.entries, { debitaccount: '', amount: '' }]
        }));
    };

    const removeEntry = (index) => {
        if (formData.entries.length > 1) {
            const updatedEntries = formData.entries.filter((_, i) => i !== index);
            setFormData(prev => ({
                ...prev,
                entries: updatedEntries
            }));
            calculateTotals(updatedEntries);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (parseFloat(formData.cramount) !== totals) {
            alert('Debit and Credit totals must be equal!');
            return;
        }
        if (formData.entries.some(entry => !entry.debitaccount || !entry.amount)) {
            alert('Please fill all debit entries');
            return;
        }
        const payload = { ...formData, schoolUdise: udiseNo }
        const response = await apiService.post("journal/", payload);

        resetForm();

        alert('Journal Voucher saved successfully!');
    };

    const resetForm = () => {
        setFormData({
            creditAccount: '',
            createDate: new Date().toISOString().split('T')[0],
            entryDate: new Date().toISOString().split('T')[0],
            cramount: '',
            narr: '',
            entries: [
                { debitaccount: '', amount: '' },
                { debitaccount: '', amount: '' }
            ]
        });
        setSelectedCreditAccount('');
        setTotals(0);
        setCurrentBalance(0);
    };

    const isBalanced = parseFloat(formData.cramount) === totals && totals > 0;

    const areEntriesValid = formData.entries.every(entry => entry.debitaccount && entry.amount);
    const isFormSubmittable = isBalanced && areEntriesValid;

    return (
        <div className="container mt-4">
            <div className="row justify-content-center">
                <div className="col-lg-10">
                    <div className="card shadow">
                        <div className="card-header bg-primary text-white">
                            <h3 className="card-title mb-0">
                                <i className="fas fa-file-invoice me-2"></i>
                                Journal Voucher
                            </h3>
                        </div>

                        <div className="card-body">
                            <form onSubmit={handleSubmit}>
                                <div className="row mb-4">
                                    <div className="col-md-6">
                                        <div className="mb-3">
                                            <label htmlFor="date" className="form-label fw-bold">
                                                Date <span className="text-danger">*</span>
                                            </label>
                                            <input
                                                type="date"
                                                className="form-control"
                                                id="createDate"
                                                name="createDate"
                                                value={formData.createDate}
                                                onChange={handleInputChange}
                                                required
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="mb-4 bg-light p-3 rounded">
                                    <h5 className="border-bottom pb-2 mb-3 fw-bold">
                                        देयकर्ता खाते माहिती
                                    </h5>
                                    <div className="row g-3 mb-3">
                                        <div className="col-md-5">
                                            <label htmlFor="creditAccount" className="form-label">यांच्याकडून प्राप्त (पक्ष) *</label>
                                            <select
                                                id="creditAccount"
                                                name="creditAccount"
                                                className="form-select"
                                                value={formData.creditAccount}
                                                onChange={handlePartyChange}
                                                required
                                            >
                                                <option value="">पक्ष/जमाकर्ता निवडा</option>
                                                {parties.map(p => (
                                                    <option key={p.subheadId} value={p.subheadId}>
                                                        {p.subheadName}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>

                                        <div className="col-md-3">
                                            <label className='form-label'>रक्कम</label>
                                            <input
                                                type='number'
                                                name='cramount'
                                                className='form-control'
                                                value={formData.cramount}
                                                onChange={handleInputChange}
                                                required
                                            />
                                        </div>

                                        <div className="col-md-4">
                                            <label className="form-label">वर्तमान शिल्लक</label>
                                            <input type="text" className="form-control" value={currentBalance} readOnly disabled />
                                        </div>
                                    </div>
                                </div>

                                <div className="mb-4">
                                    <div className="d-flex justify-content-between align-items-center mb-3">
                                        <h5 className="mb-0">Journal Entries</h5>
                                        <button
                                            type="button"
                                            className="btn btn-success btn-sm"
                                            onClick={addEntry}
                                        >
                                            <i className="fas fa-plus me-1"></i>
                                            Add Entry
                                        </button>
                                    </div>

                                    <div className="table-responsive">
                                        <table className="table table-bordered table-hover">
                                            <thead className="table-light">
                                                <tr>
                                                    <th style={{ width: '50%' }}>Account</th>
                                                    <th style={{ width: '25%' }}>Amount</th>
                                                    <th style={{ width: '25%' }}>Action</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {formData.entries.map((entry, index) => (
                                                    <tr key={index}>
                                                        <td>
                                                            <select
                                                                className="form-select"
                                                                value={entry.debitaccount}
                                                                onChange={(e) => handleEntryChange(index, 'debitaccount', e.target.value)}
                                                            >
                                                                <option value="">पक्ष/जमाकर्ता निवडा</option>
                                                                {getAvailableSubheadsForEntry(index).map(p => (
                                                                    <option key={p.subheadId} value={p.subheadId}>
                                                                        {p.subheadName}
                                                                    </option>
                                                                ))}
                                                            </select>
                                                        </td>

                                                        <td>
                                                            <input
                                                                type="number"
                                                                className="form-control form-control-sm text-end"
                                                                placeholder="0.00"
                                                                step="0.01"
                                                                value={entry.amount}
                                                                onChange={(e) => handleEntryChange(index, 'amount', e.target.value)}
                                                            />
                                                        </td>
                                                        <td className="text-center">
                                                            {formData.entries.length > 1 && (
                                                                <button
                                                                    type="button"
                                                                    className="btn btn-danger btn-sm"
                                                                    onClick={() => removeEntry(index)}
                                                                    title="Remove entry"
                                                                >
                                                                    delete
                                                                    <i className="fas fa-trash"></i>
                                                                </button>
                                                            )}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                            <tfoot className="table-secondary">
                                                <tr>
                                                    <td className="fw-bold text-end">Total:</td>
                                                    <td className="fw-bold text-end">₹{totals.toFixed(2)}</td>
                                                    <td></td>
                                                </tr>
                                            </tfoot>
                                        </table>
                                    </div>
                                </div>

                                <div className="mb-4">
                                    <label htmlFor="narr" className="form-label fw-bold">
                                        Narration
                                    </label>
                                    <textarea
                                        className="form-control"
                                        id="narr"
                                        name="narr"
                                        rows="3"
                                        value={formData.narr}
                                        onChange={handleInputChange}
                                        placeholder="Enter narration or explanation for this journal entry..."
                                    />
                                </div>

                                <div className="d-flex justify-content-between">
                                    <button
                                        type="button"
                                        className="btn btn-secondary"
                                        onClick={resetForm}
                                    >
                                        <i className="fas fa-undo me-1"></i>
                                        Reset
                                    </button>

                                    <button
                                        type="submit"
                                        className="btn btn-primary"
                                        disabled={!isFormSubmittable}
                                    >
                                        <i className="fas fa-check me-1"></i>
                                        Post Entry
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default JournalForm;
