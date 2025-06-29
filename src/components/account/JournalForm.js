import React, { useEffect, useState } from 'react';
import apiService from '../../services/api.service';
import { jwtDecode } from 'jwt-decode';
import Swal from 'sweetalert2';

function JournalForm() {
    const [formData, setFormData] = useState({
        debitaccount: '',
        tranType: 'Journal Payment',
        date: new Date().toISOString().split('T')[0],
        createDate: new Date().toISOString().split('T')[0],
        entryDate: new Date().toISOString().split('T')[0],
        dramount: '',
        narr: '',
        year: '',
        entries: [
            { creditAccount: '', amount: '' }
        ]
    });

    const [totals, setTotals] = useState(0);
    const udiseNo = jwtDecode(sessionStorage.getItem('token'))?.udiseNo;
    const [parties, setParties] = useState([]);
    const [selectedDebitAccount, setSelecteddebitAccount] = useState('');
    const [leadgerData, setLeadgerData] = useState([]);
    const [currentBalance, setCurrentBalance] = useState(0);

    useEffect(() => {

        fetchData();
    }, [udiseNo]);
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

        const transactionKey = await apiService.getdata("journal/transactionkey");
        // console.log(transactionKey.data);

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

        setFormData((prev) => ({ ...prev, year: calculatefinancialYear() }))
    };

    const filteredParties = parties.filter(p => String(p.subheadId) !== String(selectedDebitAccount));

    const getAvailableSubheadsForEntry = (index) => {
        return filteredParties.filter(p => {
            const subheadIdStr = String(p.subheadId);
            const isAlreadySelected = formData.entries.some((ent, i) =>
                i !== index && String(ent.creditAccount) === subheadIdStr
            );
            return !isAlreadySelected;
        });
    };

    const handlePartyChange = (e) => {
        const { name, value } = e.target;
        setSelecteddebitAccount(value);

        const data = parties.find(p => p.subheadId === Number(value));

        console.log(data);

        const openingbalence = leadgerData.find(b => b.entryType === "Opening Balance" && b.subhead.subheadId === data.subheadId);

        let opnBalance = 0;

        const jrtransbalance = leadgerData.filter(b =>
            (["Journal Payment", "Bank Payment", "Cash Payment", "Cash Receipt", "Bank Receipt"].includes(b.entryType)) &&
            b.subhead.subheadId === data.subheadId
        );

        let crjrtransBal = 0;
        jrtransbalance.map(a => crjrtransBal += a.crAmt);

        let drjrtranBal = 0;
        jrtransbalance.map(a => drjrtranBal += a.drAmt);


        if (data.headId.bookSideMaster.booksideName === "Liabilities") {
            opnBalance = openingbalence.crAmt;
            if (data.headId.headName === "Sundry Creditors") {
                setCurrentBalance(Number((opnBalance + crjrtransBal) - drjrtranBal))
            }
            else {
                setCurrentBalance(Number((opnBalance + crjrtransBal) - drjrtranBal))
            }

        }

        if (data.headId.bookSideMaster.booksideName === "Asset") {
            opnBalance = openingbalence.drAmt;

            if (data.headId.headName === "Sundry Debtors") {
                setCurrentBalance(Number((opnBalance + drjrtranBal) - crjrtransBal))
            }
            else {
                setCurrentBalance(Number((opnBalance + drjrtranBal) - crjrtransBal))

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
        if (parseFloat(formData.dramount) !== totals) {
            alert('Debit and Credit totals must be equal!');
            return;
        }
        if (formData.entries.some(entry => !entry.creditAccount || !entry.amount)) {
            alert('Please fill all debit entries');
            return;
        }

        if (formData.dramount > currentBalance) {
            Swal.fire({
                icon: "error",
                title: "पेमेंट अयशस्वी...",
                text: "निवडलेल्या पक्षासाठी पुरेशी शिल्लक उपलब्ध नाही. कृपया रक्कम तपासा!",
            });
            resetForm();
            return;
        }

        const payload = { ...formData, schoolUdise: udiseNo }
        await apiService.post("journal/", payload);

        fetchData();

        resetForm();
        Swal.fire({
            icon: "success",
            title: "Journal Voucher saved successfully!",
            showConfirmButton: false,
            timer: 1500
        });
    };

    const resetForm = () => {
        setFormData({
            debitaccount: '',
            tranType: 'Journal Payment',
            createDate: new Date().toISOString().split('T')[0],
            entryDate: new Date().toISOString().split('T')[0],
            dramount: '',
            narr: '',
            entries: [
                { creditAccount: '', amount: '' }
            ]
        });
        setSelecteddebitAccount('');
        setTotals(0);
        setCurrentBalance(0);
    };

    const isBalanced = parseFloat(formData.dramount) === totals && totals > 0;

    const areEntriesValid = formData.entries.every(entry => entry.creditAccount && entry.amount);
    const isFormSubmittable = isBalanced && areEntriesValid;

    return (
        <div className="container mt-4">
            <div className="row justify-content-center">
                <div className="col-lg-10">
                    <div className="card shadow">
                        <div className="card-header bg-primary text-white">
                            <h3 className="card-title mb-0">
                                <i className="fas fa-file-invoice me-2"></i>
                                जर्नल व्हाउचर
                            </h3>
                        </div>

                        <div className="card-body">
                            <form onSubmit={handleSubmit}>
                                <div className="row mb-4">
                                    <div className="col-md-6">
                                        <div className="mb-3">
                                            <label htmlFor="date" className="form-label fw-bold">
                                                तारीख <span className="text-danger">*</span>
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
                                            <label htmlFor="debitaccount" className="form-label">क्रेडिट खाते (पक्ष) *</label>
                                            <select
                                                id="debitaccount"
                                                name="debitaccount"
                                                className="form-select"
                                                value={formData.debitaccount}
                                                onChange={handlePartyChange}
                                                required
                                            >
                                                <option value="">पक्ष निवडा</option>
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
                                                name='dramount'
                                                className='form-control'
                                                value={formData.dramount}
                                                onChange={handleInputChange}
                                                required
                                            />
                                        </div>

                                        <div className="col-md-4">
                                            <label className="form-label">चालू शिल्लक</label>
                                            <input type="text" className="form-control" value={currentBalance} readOnly disabled />
                                        </div>
                                    </div>
                                </div>

                                <div className="mb-4">
                                    <div className="d-flex justify-content-between align-items-center mb-3">
                                        <h5 className="mb-0">डेबिट नोंदी</h5>
                                        <button
                                            type="button"
                                            className="btn btn-success btn-sm"
                                            onClick={addEntry}
                                        >
                                            <i className="fas fa-plus me-1"></i>
                                            नोंद जोडा
                                        </button>
                                    </div>

                                    <div className="table-responsive">
                                        <table className="table table-bordered table-hover">
                                            <thead className="table-light">
                                                <tr>
                                                    <th style={{ width: '50%' }}>खाते</th>
                                                    <th style={{ width: '25%' }}>रक्कम</th>
                                                    <th style={{ width: '25%' }}>क्रिया</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {formData.entries.map((entry, index) => (
                                                    <tr key={index}>
                                                        <td>
                                                            <select
                                                                className="form-select"
                                                                value={entry.creditAccount}
                                                                onChange={(e) => handleEntryChange(index, 'creditAccount', e.target.value)}
                                                            >
                                                                <option value="">खाते निवडा</option>
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
                                                                placeholder="०.००"
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
                                                                    title="ही नोंद काढून टाका"
                                                                >
                                                                    <i className="fas fa-trash me-1"></i>
                                                                    काढून टाका
                                                                </button>
                                                            )}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                            <tfoot className="table-secondary">
                                                <tr>
                                                    <td className="fw-bold text-end">एकूण:</td>
                                                    <td className="fw-bold text-end">₹{totals.toFixed(2)}</td>
                                                    <td></td>
                                                </tr>
                                            </tfoot>
                                        </table>
                                    </div>
                                </div>

                                <div className="mb-4">
                                    <label htmlFor="narr" className="form-label fw-bold">
                                        स्पष्टीकरण
                                    </label>
                                    <textarea
                                        className="form-control"
                                        id="narr"
                                        name="narr"
                                        rows="3"
                                        value={formData.narr}
                                        onChange={handleInputChange}
                                        placeholder="या जर्नल नोंदीसाठी स्पष्टीकरण प्रविष्ट करा..."
                                    />
                                </div>

                                <div className="d-flex justify-content-between">
                                    <button
                                        type="button"
                                        className="btn btn-secondary"
                                        onClick={resetForm}
                                    >
                                        <i className="fas fa-undo me-1"></i>
                                        रीसेट करा
                                    </button>

                                    <button
                                        type="submit"
                                        className="btn btn-primary"
                                        disabled={!isFormSubmittable}
                                    >
                                        <i className="fas fa-check me-1"></i>
                                        नोंद जतन करा
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
