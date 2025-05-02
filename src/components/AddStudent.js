import React, { useEffect, useState, useCallback } from 'react';
import { BiMap, BiInfoCircle, BiUserCircle, BiBook, BiHome, BiUserPlus } from 'react-icons/bi';
import apiService from '../services/api.service';
import CombinedDropdownInput from './CombinedDropdownInput'; // Assuming this component can handle error/validationClass props
import { jwtDecode } from 'jwt-decode';
import Swal from 'sweetalert2';
import Next from './Next';
import { useNavigate } from 'react-router-dom';

// --- Marathi Date Conversion Helpers ---
const marathiDays = [
    "", "एक", "दोन", "तीन", "चार", "पाच", "सहा", "सात", "आठ", "नऊ", "दहा",
    "अकरा", "बारा", "तेरा", "चौदा", "पंधरा", "सोळा", "सतरा", "अठरा", "एकोणवीस", "वीस",
    "एकवीस", "बावीस", "तेवीस", "चोवीस", "पंचवीस", "सव्वीस", "सत्तावीस", "अठ्ठावीस", "एकोणतीस", "तीस",
    "एकतीस"
];

const marathiMonths = [
    "जानेवारी", "फेब्रुवारी", "मार्च", "एप्रिल", "मे", "जून",
    "जुलै", "ऑगस्ट", "सप्टेंबर", "ऑक्टोबर", "नोव्हेंबर", "डिसेंबर"
];

// Corrected Marathi Year words lookup
const marathiYearWordsLookup = {
    1980: "एकोणीसशे ऐंशी", 1981: "एकोणीसशे एक्याऐंशी", 1982: "एकोणीसशे ब्याऐंशी", 1983: "एकोणीसशे त्र्याऐंशी", 1984: "एकोणीसशे चौऱ्याऐंशी", 1985: "एकोणीसशे पंच्याऐंशी", 1986: "एकोणीसशे शहाऐंशी", 1987: "एकोणीसशे सत्याऐंशी", 1988: "एकोणीसशे अठ्ठ्याऐंशी", 1989: "एकोणीसशे एकोणनव्वद",
    1990: "एकोणीसशे नव्वद", 1991: "एकोणीसशे एक्याण्णव", 1992: "एकोणीसशे ब्याण्णव", 1993: "एकोणीसशे त्र्याण्णव", 1994: "एकोणीसशे चौऱ्याण्णव", 1995: "एकोणीसशे पंच्याण्णव", 1996: "एकोणीसशे शहाण्णव", 1997: "एकोणीसशे सत्याण्णव", 1998: "एकोणीसशे अठ्ठ्याण्णव", 1999: "एकोणीसशे नव्याण्णव",
    2000: "दोन हजार", 2001: "दोन हजार एक", 2002: "दोन हजार दोन", 2003: "दोन हजार तीन", 2004: "दोन हजार चार", 2005: "दोन हजार पाच", 2006: "दोन हजार सहा", 2007: "दोन हजार सात", 2008: "दोन हजार आठ", 2009: "दोन हजार नऊ",
    2010: "दोन हजार दहा", 2011: "दोन हजार अकरा", 2012: "दोन हजार बारा", 2013: "दोन हजार तेरा", 2014: "दोन हजार चौदा", 2015: "दोन हजार पंधरा", 2016: "दोन हजार सोळा", 2017: "दोन हजार सतरा", 2018: "दोन हजार अठरा", 2019: "दोन हजार एकोणीस",
    2020: "दोन हजार वीस", 2021: "दोन हजार एकवीस", 2022: "दोन हजार बावीस", 2023: "दोन हजार तेवीस", 2024: "दोन हजार चोवीस", 2025: "दोन हजार पंचवीस", 2026: "दोन हजार सव्वीस", 2027: "दोन हजार सत्तावीस", 2028: "दोन हजार अठ्ठावीस", 2029: "दोन हजार एकोणतीस",
    2030: "दोन हजार तीस", 2031: "दोन हजार एकतीस", 2032: "दोन हजार बत्तीस", 2033: "दोन हजार तेहतीस", 2034: "दोन हजार चौतीस", 2035: "दोन हजार पस्तीस"
};


function getMarathiDateWords(dateStr) {
    if (!dateStr) return '';
    try {
        const date = new Date(dateStr);
        if (isNaN(date.getTime())) return '';

        
        const day = date.getDate();
        const month = date.getMonth(); // 0-indexed
        const year = date.getFullYear();

        const dayText = marathiDays[day];
        const monthText = marathiMonths[month];
        const yearText = marathiYearWordsLookup[year] || year.toString(); // Use the lookup

        if (!dayText || !monthText || yearText === year.toString()) {
            console.warn("Could not convert date parts to Marathi", { day, month, year });
            return ""; // Return empty if any part failed
        }

        return `${dayText} ${monthText} ${yearText}`;

    } catch (error) {
        console.error("Error converting date to Marathi:", error);
        return "";
    }
}
// --- End Helpers ---


function AddStudent() {
    const [states, setStates] = useState([]);
    const [districts, setDistricts] = useState([]);
    const [tehsils, setTehsils] = useState([]);
    const [villages, setVillages] = useState([]);
    const [filterdistrict, setFilterDistrict] = useState([]);
    const [filteredTehsils, setFilteredTehsils] = useState([]);
    const [filteredVillages, setFilteredVillages] = useState([]);
    const [standards, setStandards] = useState([]);
    const [students, setStudents] = useState([]);
    const [errors, setErrors] = useState({}); // Combined state for immediate feedback and submit errors
    const navigate=useNavigate();
    // Removed separate warningMessage state, integrated into errors

    const school = jwtDecode(sessionStorage.getItem('token'))?.udiseNo;

    const initialFormData = {
        // Registration Information
        registerNumber: '',
        apparId: '',
        studentId: '',
        // Personal Information
        gender: '',
        surName: '',
        studentName: '',
        fatherName: '',
        motherName: '',
        nationality: '',
        motherTongue: '',
        religion: '',
        caste: '',
        subCast: '',
        dateOfBirth: '',
        dateOfBirthInWord: '',
        // Contact Information
        residentialAddress: '',
        mobileNo: '',
        // Birth Place Information
        birthPlace: '',
        villageOfBirth: '',
        tehasilOfBirth: '',
        districtOfBirth: '',
        stateOfBirth: '',
        // Academic Information
        lastSchoolUdiseNo: '',
        admissionDate: '',
        whichStandardAdmitted: '',
        // Additional Information
        adhaarNumber: '',
        ebcInformation: '',
        minorityInformation: '',
        casteCategory: ''
    };

    const [formData, setFormData] = useState(initialFormData);

    // --- Data Fetching useEffect ---
    useEffect(() => {
        apiService.getdata('state/').then((response) => setStates(response.data));
        apiService.getdata('district/').then((response) => setDistricts(response.data));
        apiService.getdata('tehsil/').then((response) => setTehsils(response.data));
        apiService.getdata('village/').then((response) => setVillages(response.data));
        if (school) {
            apiService.getbyid('standardmaster/getbyudise/', school).then((response) => setStandards(response.data));
            apiService.getbyid('student/byudise/', school).then((response) => setStudents(response.data));
        } else {
            console.error("School UDISE number not found in token.");
            // Handle error appropriately, maybe redirect or show message
        }
    }, [school]);

    // --- Dropdown Filtering useEffects ---
    useEffect(() => {
        if (formData.stateOfBirth) {
            const filtered = districts.filter(d => d.state.id === parseInt(formData.stateOfBirth));
            setFilterDistrict(filtered);
            if (formData.districtOfBirth && !filtered.some(d => d.id === parseInt(formData.districtOfBirth))) {
                setFormData(prev => ({ ...prev, districtOfBirth: '', tehasilOfBirth: '', villageOfBirth: '' }));
                setFilteredTehsils([]); setFilteredVillages([]);
            }
        } else { setFilterDistrict([]); }
    }, [formData.stateOfBirth, districts, formData.districtOfBirth]);

    useEffect(() => {
        if (formData.districtOfBirth) {
            const filtered = tehsils.filter(t => t.district.id === parseInt(formData.districtOfBirth));
            setFilteredTehsils(filtered);
            if (formData.tehasilOfBirth && !filtered.some(t => t.id === parseInt(formData.tehasilOfBirth))) {
                setFormData(prev => ({ ...prev, tehasilOfBirth: '', villageOfBirth: '' }));
                setFilteredVillages([]);
            }
        } else { setFilteredTehsils([]); }
    }, [formData.districtOfBirth, tehsils, formData.tehasilOfBirth]);

    useEffect(() => {
        if (formData.tehasilOfBirth) {
            const filtered = villages.filter(v => v.tehsil.id === parseInt(formData.tehasilOfBirth));
            setFilteredVillages(filtered);
            if (formData.villageOfBirth && !filtered.some(v => v.id === parseInt(formData.villageOfBirth))) {
                setFormData(prev => ({ ...prev, villageOfBirth: '' }));
            }
        } else { setFilteredVillages([]); }
    }, [formData.tehasilOfBirth, villages, formData.villageOfBirth]);


    // --- Validation Function (for Submit) ---
    const validateForm = useCallback(() => {
        const newErrors = {};
        const nameRegex = /^[a-zA-Z\s\u0900-\u097F.]+$/; // Allows letters, spaces, Marathi chars, dots
        const mobileRegex = /^\d{10}$/;
        const adhaarRegex = /^\d{12}$/;
        const apparIdRegex = /^\d{10}$/;
        const studentIdRegex = /^\d{19}$/;
        const registerNumRegex = /^\S+$/; // Basic check: no whitespace allowed

        // Helper for uniqueness check
        const isTaken = (field, value) => {
            if (!value) return false; // Don't check empty strings
            return students.some(
                (item) => item[field]?.toString().trim() === value.toString().trim() && item.school?.udiseNo === school
            );
        };

        // ** Registration Info **
        if (!formData.registerNumber.trim()) newErrors.registerNumber = 'नोंदणी क्रमांक आवश्यक आहे.';
        else if (!registerNumRegex.test(formData.registerNumber)) newErrors.registerNumber = 'नोंदणी क्रमांकात स्पेस नसावी.';
        else if (isTaken('registerNumber', formData.registerNumber)) newErrors.registerNumber = 'हा नोंदणी क्रमांक आधीच वापरात आहे.';

        if (formData.apparId && !apparIdRegex.test(formData.apparId)) newErrors.apparId = 'अपार आयडी १० अंकी असावा.';
        else if (formData.apparId && isTaken('apparId', formData.apparId)) newErrors.apparId = 'हा अपार आयडी आधीच अस्तित्वात आहे.';

        if (formData.studentId && !studentIdRegex.test(formData.studentId)) newErrors.studentId = 'विद्यार्थी आयडी १९ अंकी असावा.';
        else if (formData.studentId && isTaken('studentId', formData.studentId)) newErrors.studentId = 'हा विद्यार्थी आयडी आधीच अस्तित्वात आहे.';

        // ** Personal Info **
        if (!formData.gender) newErrors.gender = 'लिंग निवडणे आवश्यक आहे.';
        if (!formData.surName.trim()) newErrors.surName = 'आडनाव आवश्यक आहे.';
        else if (!nameRegex.test(formData.surName)) newErrors.surName = 'आडनावात फक्त अक्षरे/स्पेस/मराठी/नुक्ते असू शकतात.';
        if (!formData.studentName.trim()) newErrors.studentName = 'विद्यार्थ्याचे नाव आवश्यक आहे.';
        else if (!nameRegex.test(formData.studentName)) newErrors.studentName = 'नावात फक्त अक्षरे/स्पेस/मराठी/नुक्ते असू शकतात.';
        if (!formData.fatherName.trim()) newErrors.fatherName = 'वडिलांचे नाव आवश्यक आहे.';
        else if (!nameRegex.test(formData.fatherName)) newErrors.fatherName = 'नावात फक्त अक्षरे/स्पेस/मराठी/नुक्ते असू शकतात.';
        if (!formData.motherName.trim()) newErrors.motherName = 'आईचे नाव आवश्यक आहे.';
        else if (!nameRegex.test(formData.motherName)) newErrors.motherName = 'नावात फक्त अक्षरे/स्पेस/मराठी/नुक्ते असू शकतात.';
        if (!formData.nationality.trim()) newErrors.nationality = 'राष्ट्रीयत्व आवश्यक आहे.';
        if (!formData.motherTongue.trim()) newErrors.motherTongue = 'मातृभाषा आवश्यक आहे.';
        if (!formData.religion.trim()) newErrors.religion = 'धर्म आवश्यक आहे.';
        if (!formData.caste.trim()) newErrors.caste = 'प्रवर्ग आवश्यक आहे.';
        if (!formData.dateOfBirth) newErrors.dateOfBirth = 'जन्मतारीख आवश्यक आहे.';
        // dateOfBirthInWord is auto-generated or read-only

        // ** Contact Info **
        if (!formData.residentialAddress.trim()) newErrors.residentialAddress = 'निवासी पत्ता आवश्यक आहे.';
        if (!formData.mobileNo.trim()) newErrors.mobileNo = 'मोबाईल नंबर आवश्यक आहे.';
        else if (!mobileRegex.test(formData.mobileNo)) newErrors.mobileNo = 'मोबाईल नंबर १० अंकी असावा.';

        // ** Birth Place Info **
        if (!formData.stateOfBirth) newErrors.stateOfBirth = 'राज्य निवडणे आवश्यक आहे.';
        if (!formData.districtOfBirth) newErrors.districtOfBirth = 'जिल्हा निवडणे आवश्यक आहे.';
        if (!formData.tehasilOfBirth) newErrors.tehasilOfBirth = 'तालुका निवडणे आवश्यक आहे.';
        if (!formData.villageOfBirth) newErrors.villageOfBirth = 'गाव निवडणे आवश्यक आहे.';

        // ** Academic Info **
        if (!formData.admissionDate) newErrors.admissionDate = 'प्रवेश तारीख आवश्यक आहे.';
        if (!formData.whichStandardAdmitted) newErrors.whichStandardAdmitted = 'प्रवेश इयत्ता निवडणे आवश्यक आहे.';

        // ** Additional Info **
        if (formData.adhaarNumber && !adhaarRegex.test(formData.adhaarNumber)) newErrors.adhaarNumber = 'आधार कार्ड नंबर १२ अंकी असावा.';

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    }, [formData, students, school]);


    // --- Handle Change with Immediate Feedback ---
    const handleChange = (e) => {
        const { id, value } = e.target;
        let val = null;
        let currentErrors = { ...errors }; // Copy current errors
        delete currentErrors[id]; // Clear error for the field being changed

        // --- Update Form Data State ---
        // Special handling for date
        if (["studentName", "fatherName", "surName", "motherName"].includes(id)) {
            val = value.trim();
        }

        if (id === "dateOfBirth") {
            const marathiDate = getMarathiDateWords(value);
            setFormData(prev => ({
                ...prev,
                dateOfBirth: value,
                dateOfBirthInWord: marathiDate
            }));
            // Clear DOB word error if it exists
            delete currentErrors.dateOfBirthInWord;
        } else {
            // Handle all other fields
            val = val ?? value
            setFormData(prev => ({
                ...prev,
                [id]: val
            }));
        }


        // --- Immediate Validation for Specific Fields ---
        const checkUniqueness = (fieldId, fieldValue) => {
            if (!fieldValue) return false; // Skip check if value is empty
            return students.some(
                (item) => item[fieldId]?.toString().trim() === fieldValue.toString().trim() && item.school?.udiseNo === school
            );
        };

        // Register Number (Check uniqueness - length check is less strict here)
        if (id === 'registerNumber') {
            if (value && checkUniqueness('registerNumber', value)) {
                currentErrors.registerNumber = "हा नोंदणी क्रमांक आधीच वापरात आहे.";
            }
            // Basic format check (optional immediate check)
            else if (value && /\s/.test(value)) {
                currentErrors.registerNumber = "नोंदणी क्रमांकात स्पेस नसावी.";
            }
        }

        // Appar ID (Check length and uniqueness)
        if (id === 'apparId') {
            if (value && value.length !== 10) {
                currentErrors.apparId = "अपार आयडी १० अंकी असावा.";
            } else if (value && checkUniqueness('apparId', value)) {
                currentErrors.apparId = "हा अपार आयडी आधीच अस्तित्वात आहे.";
            }
        }

        // Student ID (Check length and uniqueness)
        if (id === 'studentId') {
            if (value && value.length !== 19) {
                currentErrors.studentId = "विद्यार्थी आयडी १९ अंकी असावा.";
            } else if (value && checkUniqueness('studentId', value)) {
                currentErrors.studentId = "हा विद्यार्थी आयडी आधीच अस्तित्वात आहे.";
            }
        }

        // Mobile No (Check length)
        if (id === 'mobileNo') {
            if (value && value.length !== 10) {
                currentErrors.mobileNo = "मोबाईल नंबर १० अंकी असावा.";
            }
            // You could add regex test here too for immediate feedback if desired
            // else if (value && !/^\d+$/.test(value)) {
            //    currentErrors.mobileNo = "मोबाईल नंबरमध्ये फक्त अंक असावेत.";
            // }
        }

        if (value) {
            const birthDate = new Date(value);
            const today = new Date();
            const minBirthDate = new Date(today.getFullYear() - 6, today.getMonth(), today.getDate());

            if (birthDate > minBirthDate) {
                currentErrors.dateOfBirth = 'विद्यार्थ्याचे वय किमान ६ वर्षे असणे आवश्यक आहे.';
            } else {
                delete currentErrors.dateOfBirth;
            }
        }
        // Aadhaar No (Check length) - Optional immediate check
        if (id === 'adhaarNumber') {
            if (value && value.length !== 12) {
                currentErrors.adhaarNumber = "आधार कार्ड नंबर १२ अंकी असावा.";
            }
        }


        // Update the errors state with immediate feedback
        setErrors(currentErrors);
    };


    // --- Handle Change for Combined Dropdown ---
    const handleCombinedChange = (id, value) => {
        // Clear specific error when user changes the value
        let currentErrors = { ...errors };
        delete currentErrors[id];
        setErrors(currentErrors);

        setFormData(prev => ({ ...prev, [id]: value }));
    };


    // --- Handle Submit ---
    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) {
            // Find the first error and scroll to it
            const firstErrorField = Object.keys(errors)[0];
            if (firstErrorField) {
                const element = document.getElementById(firstErrorField);
                element?.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
            console.log('Validation Failed:', errors);
            alert("कृपया फॉर्ममधील सर्व आवश्यक (*) माहिती भरा आणि त्रुटी तपासा.");
            return;
        }

        // --- Submit Logic ---
        const payload = { ...formData, school };

        const result = await Swal.fire({
            title: 'जिल्हा जतन करायचे आहे का?',
            icon: 'question',
            showCancelButton: true,
            showDenyButton: true,
            confirmButtonText: 'जतन करा',
            denyButtonText: 'जतन करा आणि पुढे चला',
            cancelButtonText: 'रद्द करा'
        });

        if (result.isConfirmed || result.isDenied) {
            try {
                await apiService.postdata("student/", payload)

                await Swal.fire('यशस्वी!', 'विद्यार्थी माहिती जतन झाली.', 'success');

                if (school) {
                    apiService.getbyid('student/byudise/', school).then((res) => setStudents(res.data));
                }
                setFormData(initialFormData); // Reset form
                setErrors({}); // Clear errors

                if (result.isDenied) {
                    navigate('/clerk/classteacher');
                }

            } catch (error) {
                console.error("Error:", error);
                let errorMsg = "माहिती सबमिट करताना त्रुटी आली. कृपया पुन्हा प्रयत्न करा.";
                if (error.response && error.response.data) {
                    // Try to extract backend error message
                    const backendError = error.response.data.message || error.response.data.error || JSON.stringify(error.response.data);
                    errorMsg = `त्रुटी: ${backendError}`;
                    // Map specific backend errors to form fields if possible
                    if (typeof error.response.data === 'object' && error.response.data.field) {
                        setErrors(prev => ({ ...prev, [error.response.data.field]: backendError }));
                    } else if (error.response.data?.registerNumber) { // Example check
                        setErrors(prev => ({ ...prev, registerNumber: error.response.data.registerNumber }));
                    }
                }
                Swal.fire('त्रुटी!', errorMsg, 'error');

            }
        }
    }

    // Helper to get validation class
    const getValidationClass = (fieldName) => {
        return errors[fieldName] ? 'is-invalid' : '';
    }


    // --- Render ---
    return (
        <div className="container py-3">
            <div className="row justify-content-center">
                <div className="col-lg-11">
                    <div className="card shadow-sm border-0 rounded-3 overflow-hidden">
                        {/* Header */}
                        <div className="card-header bg-primary bg-gradient text-white p-3 position-relative">
                        <div className="position-absolute top-0 end-0 m-2">
                                <Next classname={'btn bg-danger text-white btn-sm'} path={'/clerk/list'} placeholder={'X'}></Next>
                            </div>
                            <div className="d-flex justify-content-center align-items-center">
                                {/* <BiUserCircle className="fs-4 me-2" />  */}
                                <BiUserPlus className="fs-2 me-2" />
                                <h3 className="mb-0 text-center fw-bold fs-3 heading-font">विद्यार्थी नोंदणी फॉर्म</h3>
                            </div>
                        </div>

                        {/* Form Body */}
                        <div className="card-body p-4"> {/* Consistent padding */}
                            <form onSubmit={handleSubmit} className="fs-5" noValidate>
                                {/* Section 1: Registration Information */}
                                <div className="card mb-4 border-0 bg-light">
                                    <div className="card-body p-3">
                                        <h5 className="card-title border-bottom pb-2 mb-3 fs-5 fw-bold"><BiBook className="me-2" />नोंदणी माहिती</h5>
                                        <div className="row g-3">
                                            <div className="col-md-4 mb-2">
                                                <label htmlFor="registerNumber" className="form-label fw-semibold small">नोंदणी क्रमांक *</label>
                                                <input
                                                    type="text"
                                                    className={`form-control form-control-sm ${getValidationClass('registerNumber')}`}
                                                    id="registerNumber"
                                                    value={formData.registerNumber}
                                                    onChange={handleChange}
                                                    required
                                                    placeholder="नोंदणी क्रमांक"
                                                    aria-describedby="registerNumberError"
                                                />
                                                {/* Shows immediate or submit error */}
                                                {errors.registerNumber && (
                                                    <div id="registerNumberError" className="invalid-feedback">
                                                        {errors.registerNumber}
                                                    </div>
                                                )}
                                            </div>
                                            <div className="col-md-4 mb-2">
                                                <label htmlFor="apparId" className="form-label fw-semibold small">अपार आयडी</label>
                                                <input
                                                    type="text" // Keep as text to handle potential leading zeros input
                                                    inputMode='numeric' // Hint for numeric keyboard on mobile
                                                    className={`form-control form-control-sm ${getValidationClass('apparId')}`}
                                                    id="apparId"
                                                    value={formData.apparId}
                                                    onChange={handleChange}
                                                    maxLength={10} // Enforce max length in UI
                                                    placeholder="१० अंकी अपार आयडी"
                                                    aria-describedby="apparIdError"
                                                />
                                                {errors.apparId && (
                                                    <div id="apparIdError" className="invalid-feedback">
                                                        {errors.apparId}
                                                    </div>
                                                )}
                                            </div>
                                            <div className="col-md-4 mb-2">
                                                <label htmlFor="studentId" className="form-label fw-semibold small">विद्यार्थी आयडी</label>
                                                <input
                                                    type="text"
                                                    inputMode='numeric'
                                                    className={`form-control form-control-sm ${getValidationClass('studentId')}`}
                                                    id="studentId"
                                                    value={formData.studentId}
                                                    onChange={handleChange}
                                                    maxLength={19}
                                                    placeholder='१९ अंकी विद्यार्थी आयडी'
                                                    aria-describedby="studentIdError"
                                                />
                                                {errors.studentId && (
                                                    <div id="studentIdError" className="invalid-feedback">
                                                        {errors.studentId}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Section 2: Personal Information */}
                                <div className="card mb-4 border-0 bg-light">
                                    <div className="card-body p-3">
                                        <h5 className="card-title border-bottom pb-2 mb-3 fs-5 fw-bold"><BiUserCircle className="me-2" />वैयक्तिक माहिती</h5>
                                        <div className="row g-3">
                                            {/* Name Fields */}
                                            <div className="col-md-3 mb-2">
                                                <label htmlFor="studentName" className="form-label fw-semibold small">विद्यार्थ्याचे नाव *</label>
                                                <input type="text" className={`form-control form-control-sm ${getValidationClass('studentName')}`} id="studentName" value={formData.studentName} onChange={handleChange} required placeholder="विद्यार्थ्याचे नाव" aria-describedby="studentNameError" />
                                                {errors.studentName && <div id="studentNameError" className="invalid-feedback">{errors.studentName}</div>}
                                            </div>
                                            <div className="col-md-3 mb-2">
                                                <label htmlFor="fatherName" className="form-label fw-semibold small">वडिलांचे नाव *</label>
                                                <input type="text" className={`form-control form-control-sm ${getValidationClass('fatherName')}`} id="fatherName" value={formData.fatherName} onChange={handleChange} required placeholder="वडिलांचे नाव" aria-describedby="fatherNameError" />
                                                {errors.fatherName && <div id="fatherNameError" className="invalid-feedback">{errors.fatherName}</div>}
                                            </div>
                                            <div className="col-md-3 mb-2">
                                                <label htmlFor="surName" className="form-label fw-semibold small">आडनाव *</label>
                                                <input type="text" className={`form-control form-control-sm ${getValidationClass('surName')}`} id="surName" value={formData.surName} onChange={handleChange} required placeholder="आडनाव" aria-describedby="surNameError" />
                                                {errors.surName && <div id="surNameError" className="invalid-feedback">{errors.surName}</div>}
                                            </div>
                                            <div className="col-md-3 mb-2">
                                                <label htmlFor="motherName" className="form-label fw-semibold small">आईचे नाव *</label>
                                                <input type="text" className={`form-control form-control-sm ${getValidationClass('motherName')}`} id="motherName" value={formData.motherName} onChange={handleChange} required placeholder="आईचे नाव" aria-describedby="motherNameError" />
                                                {errors.motherName && <div id="motherNameError" className="invalid-feedback">{errors.motherName}</div>}
                                            </div>

                                            {/* DOB, Gender */}
                                            <div className="col-md-3 mb-2">
                                                <label htmlFor="dateOfBirth" className="form-label fw-semibold small">जन्मतारीख *</label>
                                                <input type="date" className={`form-control form-control-sm ${getValidationClass('dateOfBirth')}`} id="dateOfBirth" value={formData.dateOfBirth} onChange={handleChange} required aria-describedby="dateOfBirthError" />
                                                {errors.dateOfBirth && <div id="dateOfBirthError" className="invalid-feedback">{errors.dateOfBirth}</div>}
                                            </div>
                                            <div className="col-md-3 mb-2">
                                                <label htmlFor="dateOfBirthInWord" className="form-label fw-semibold small">तारीख (शब्दात)</label>
                                                <input type="text" className="form-control form-control-sm" id="dateOfBirthInWord" value={formData.dateOfBirthInWord} readOnly placeholder="उदा. बारा जानेवारी दोन हजार तीन" aria-describedby="dateOfBirthInWordError" />
                                                {/* Readonly, so error display might not be needed unless validation changes */}
                                            </div>
                                            <div className="col-md-3 mb-2">
                                                <label htmlFor="gender" className="form-label fw-semibold small">लिंग *</label>
                                                <select className={`form-select form-select-sm ${getValidationClass('gender')}`} id="gender" value={formData.gender} onChange={handleChange} required aria-describedby="genderError">
                                                    <option value="">-- निवडा --</option>
                                                    <option value="पुरुष">पुरुष</option>
                                                    <option value="स्त्री">स्त्री</option>
                                                    <option value="इतर">इतर</option>
                                                </select>
                                                {errors.gender && <div id="genderError" className="invalid-feedback">{errors.gender}</div>}
                                            </div>

                                            {/* Combined Dropdowns */}
                                            <CombinedDropdownInput id="nationality" label="राष्ट्रीयत्व " value={formData.nationality} onChange={handleCombinedChange} required={true} options={["भारतीय"]} error={errors.nationality} validationClass={getValidationClass('nationality')} />
                                            <CombinedDropdownInput id="motherTongue" label="मातृभाषा " value={formData.motherTongue} onChange={handleCombinedChange} required={true} options={["हिंदी", "मराठी", "उर्दू"]} error={errors.motherTongue} validationClass={getValidationClass('motherTongue')} />
                                            <CombinedDropdownInput id="religion" label="धर्म " value={formData.religion} onChange={handleCombinedChange} required={true} options={["हिंदू", "मुस्लिम", "ख्रिश्चन", "बौद्ध", "जैन"]} error={errors.religion} validationClass={getValidationClass('religion')} />
                                            <div className="col-md-3 mb-2">
                                                <label htmlFor="subCast" className="form-label fw-semibold small">उपजात</label>
                                                <input type="text" className="form-control form-control-sm" id="subCast" value={formData.subCast} onChange={handleChange} placeholder="उपजात" />
                                            </div>
                                            <CombinedDropdownInput id="caste" label="प्रवर्ग " value={formData.caste} onChange={handleCombinedChange} required={true} options={["अनुसूचित जाती", "अनुसूचित जमाती", "इतर मागास वर्ग", "खुला"]} error={errors.caste} validationClass={getValidationClass('caste')} />
                                        </div>
                                    </div>
                                </div>

                                {/* Section 3: Birth Place Information */}
                                <div className="card mb-4 border-0 bg-light">
                                    <div className="card-body p-3">
                                        <h5 className="card-title border-bottom pb-2 mb-3 fs-5 fw-bold"><BiMap className="me-2" />जन्मस्थान माहिती</h5>
                                        <div className="row g-3">
                                            <div className="col-md-6 mb-2">
                                                <label htmlFor="birthPlace" className="form-label fw-semibold small">जन्म स्थळ</label>
                                                <input type="text" className="form-control form-control-sm" id="birthPlace" value={formData.birthPlace} onChange={handleChange} placeholder="जन्म स्थळ" />
                                            </div>
                                            <div className="col-md-6 mb-2">
                                                <label htmlFor="stateOfBirth" className="form-label fw-semibold small">राज्य *</label>
                                                <select className={`form-select form-select-sm ${getValidationClass('stateOfBirth')}`} id="stateOfBirth" value={formData.stateOfBirth} onChange={handleChange} required aria-describedby="stateOfBirthError">
                                                    <option value="">-- राज्य निवडा --</option>
                                                    {states.map(state => (<option key={state.id} value={state.id}>{state.stateName}</option>))}
                                                </select>
                                                {errors.stateOfBirth && <div id="stateOfBirthError" className="invalid-feedback">{errors.stateOfBirth}</div>}
                                            </div>
                                            <div className="col-md-4 mb-2">
                                                <label htmlFor="districtOfBirth" className="form-label fw-semibold small">जिल्हा *</label>
                                                <select className={`form-select form-select-sm ${getValidationClass('districtOfBirth')}`} id="districtOfBirth" value={formData.districtOfBirth} onChange={handleChange} disabled={!formData.stateOfBirth || filterdistrict.length === 0} required aria-describedby="districtOfBirthError">
                                                    <option value="">-- जिल्हा निवडा --</option>
                                                    {filterdistrict.map(district => (<option key={district.id} value={district.id}>{district.districtName}</option>))}
                                                </select>
                                                {errors.districtOfBirth && <div id="districtOfBirthError" className="invalid-feedback">{errors.districtOfBirth}</div>}
                                            </div>
                                            <div className="col-md-4 mb-2">
                                                <label htmlFor="tehasilOfBirth" className="form-label fw-semibold small">तालुका *</label>
                                                <select className={`form-select form-select-sm ${getValidationClass('tehasilOfBirth')}`} id="tehasilOfBirth" value={formData.tehasilOfBirth} onChange={handleChange} disabled={!formData.districtOfBirth || filteredTehsils.length === 0} required aria-describedby="tehasilOfBirthError">
                                                    <option value="">-- तालुका निवडा --</option>
                                                    {filteredTehsils.map(tehsil => (<option key={tehsil.id} value={tehsil.id}>{tehsil.tehsilName}</option>))}
                                                </select>
                                                {errors.tehasilOfBirth && <div id="tehasilOfBirthError" className="invalid-feedback">{errors.tehasilOfBirth}</div>}
                                            </div>
                                            <div className="col-md-4 mb-2">
                                                <label htmlFor="villageOfBirth" className="form-label fw-semibold small">गाव *</label>
                                                <select className={`form-select form-select-sm ${getValidationClass('villageOfBirth')}`} id="villageOfBirth" value={formData.villageOfBirth} onChange={handleChange} disabled={!formData.tehasilOfBirth || filteredVillages.length === 0} required aria-describedby="villageOfBirthError">
                                                    <option value="">-- गाव निवडा --</option>
                                                    {filteredVillages.map(village => (<option key={village.id} value={village.id}>{village.villageName}</option>))}
                                                </select>
                                                {errors.villageOfBirth && <div id="villageOfBirthError" className="invalid-feedback">{errors.villageOfBirth}</div>}
                                            </div>
                                        </div>
                                    </div>
                                </div>


                                {/* Section 4: Contact Information */}
                                <div className="card mb-4 border-0 bg-light">
                                    <div className="card-body p-3">
                                        <h5 className="card-title border-bottom pb-2 mb-3 fs-5 fw-bold"><BiHome className="me-2" />संपर्क माहिती</h5>
                                        <div className="row g-3">
                                            <div className="col-md-6 mb-2">
                                                <label htmlFor="residentialAddress" className="form-label fw-semibold small">निवासी पत्ता *</label>
                                                <textarea className={`form-control form-control-sm ${getValidationClass('residentialAddress')}`} id="residentialAddress" value={formData.residentialAddress} onChange={handleChange} required rows={3} placeholder="पूर्ण पत्ता" aria-describedby="residentialAddressError" />
                                                {errors.residentialAddress && <div id="residentialAddressError" className="invalid-feedback">{errors.residentialAddress}</div>}
                                            </div>
                                            <div className="col-md-6 mb-2">
                                                <label htmlFor="mobileNo" className="form-label fw-semibold small">मोबाईल नंबर *</label>
                                                <input
                                                    type="tel" // Use tel type for semantics
                                                    inputMode='numeric' // Hint numeric keyboard
                                                    className={`form-control form-control-sm ${getValidationClass('mobileNo')}`}
                                                    id="mobileNo"
                                                    value={formData.mobileNo}
                                                    onChange={handleChange}
                                                    required
                                                    maxLength={10} // Enforce UI max length
                                                    placeholder="१० अंकी मोबाईल नंबर"
                                                    aria-describedby="mobileNoError"
                                                />
                                                {errors.mobileNo ?
                                                    <div id="mobileNoError" className="invalid-feedback">{errors.mobileNo}</div>
                                                    : <small className="text-muted d-block mt-1">१० अंकी नंबर प्रविष्ट करा</small>
                                                }
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Section 5: Academic Information */}
                                <div className="card mb-4 border-0 bg-light">
                                    <div className="card-body p-3">
                                        <h5 className="card-title border-bottom pb-2 mb-3 fs-5 fw-bold"><BiBook className="me-2" />शैक्षणिक माहिती</h5>
                                        <div className="row g-3">
                                            <div className="col-md-4 mb-2">
                                                <label htmlFor="lastSchoolUdiseNo" className="form-label fw-semibold small">मागील शाळेचा UDISE नंबर</label>
                                                <input type="text" className="form-control form-control-sm" id="lastSchoolUdiseNo" value={formData.lastSchoolUdiseNo} onChange={handleChange} placeholder="UDISE नंबर" />
                                                {/* Add validation if UDISE has specific format/length */}
                                                {/* {errors.lastSchoolUdiseNo && <div id="lastSchoolUdiseNoError" className="invalid-feedback">{errors.lastSchoolUdiseNo}</div>} */}
                                            </div>
                                            <div className="col-md-4 mb-2">
                                                <label htmlFor="admissionDate" className="form-label fw-semibold small">प्रवेश तारीख *</label>
                                                <input type="date" className={`form-control form-control-sm ${getValidationClass('admissionDate')}`} id="admissionDate" value={formData.admissionDate} onChange={handleChange} required aria-describedby="admissionDateError" />
                                                {errors.admissionDate && <div id="admissionDateError" className="invalid-feedback">{errors.admissionDate}</div>}
                                            </div>
                                            <div className="col-md-4 mb-2">
                                                <label htmlFor="whichStandardAdmitted" className="form-label fw-semibold small">प्रवेश इयत्ता *</label>
                                                <select className={`form-select form-select-sm ${getValidationClass('whichStandardAdmitted')}`} id="whichStandardAdmitted" value={formData.whichStandardAdmitted} onChange={handleChange} required aria-describedby="whichStandardAdmittedError">
                                                    <option value="">-- इयत्ता निवडा --</option>
                                                    {standards.map(standard => (<option key={standard.id} value={standard.value}>{standard.standard}</option>))}
                                                </select>
                                                {errors.whichStandardAdmitted && <div id="whichStandardAdmittedError" className="invalid-feedback">{errors.whichStandardAdmitted}</div>}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Section 6: Additional Information */}
                                <div className="card mb-5 border-0 bg-light"> {/* Added mb-5 for spacing before button */}
                                    <div className="card-body p-3">
                                        <h5 className="card-title border-bottom pb-2 mb-3 fs-5 fw-bold"><BiInfoCircle className="me-2" />अतिरिक्त माहिती</h5>
                                        <div className="row g-3">
                                            <div className="col-md-3 mb-2">
                                                <label htmlFor="adhaarNumber" className="form-label fw-semibold small">आधार कार्ड नंबर</label>
                                                <input
                                                    type="text"
                                                    inputMode='numeric'
                                                    className={`form-control form-control-sm ${getValidationClass('adhaarNumber')}`}
                                                    id="adhaarNumber"
                                                    value={formData.adhaarNumber}
                                                    onChange={handleChange}
                                                    maxLength={12}
                                                    placeholder="१२ अंकी आधार नंबर"
                                                    aria-describedby="adhaarNumberError"
                                                />
                                                {errors.adhaarNumber && <div id="adhaarNumberError" className="invalid-feedback">{errors.adhaarNumber}</div>}
                                            </div>
                                            {/* Combined dropdowns for optional fields */}
                                            <CombinedDropdownInput id="ebcInformation" label="EBC माहिती" value={formData.ebcInformation} onChange={handleCombinedChange} required={false} options={["PAY", "BCF", "E.B.C.", "E.B.C.BC", "P.T.", "M.T."]} />
                                            <CombinedDropdownInput id="casteCategory" label="जात प्रवर्ग" value={formData.casteCategory} onChange={handleCombinedChange} required={false} options={["GENERAL", "S.C.", "S.T.", "VJ(A)", "N.T.(B)", "N.T.(C)", "N.T.(D)", "O.B.C.", "S.B.C.", "ESBC"]} />
                                            <CombinedDropdownInput id="minorityInformation" label="अल्पसंख्याक माहिती" value={formData.minorityInformation} onChange={handleCombinedChange} required={false} options={["Non Minority", "Jain Minority", "MinorityMuslim Minority", "Boudha Minority"]} />
                                        </div>
                                    </div>
                                </div>

                                {/* Submit Button */}
                                <div className="d-flex justify-content-center mt-4 gap-5">
                                    <button type="submit" className="btn btn-primary btn-lg px-5 py-2 rounded-pill shadow-sm">
                                        <i className="bi bi-check-circle me-2"></i>
                                        नोंदणी सबमिट करा
                                    </button>
                                    {/* <Next classname={'btn btn-success btn-lg px-5 py-2 rounded-pill shadow-sm'} path={'/clerk/classteacher'} placeholder={'पुढे चला'}></Next> */}
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default AddStudent;