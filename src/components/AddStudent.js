import React, { useEffect, useState } from 'react'
import { BiMap, BiInfoCircle, BiUserCircle, BiBook, BiHome } from 'react-icons/bi';
import apiService from '../services/api.service';
import CombinedDropdownInput from './CombinedDropdownInput';
import { jwtDecode } from 'jwt-decode';


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
    const [warningMessage, setWarningMessage] = useState('');

    const school = jwtDecode(sessionStorage.getItem('token'))?.udiseNo;
    // const registerNumber=78272827287;

    const [formData, setFormData] = useState({
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
    });

    useEffect(() => {
        apiService.getdata('state/').then((response) => {
            setStates(response.data);
        });
        apiService.getdata('district/').then((response) => {
            setDistricts(response.data);
        });
        apiService.getdata('tehsil/').then((response) => {
            setTehsils(response.data);
        });
        apiService.getdata('village/').then((response) => {
            setVillages(response.data);
        });
        apiService.getbyid('standardmaster/getbyudise/', school).then((response) => {
            setStandards(response.data);
        });
        // apiService.getbyid(`student/byudise/${school}/byregister/`,registerNumber).then((response)=>{
        //     console.log(response.data);
        // });
        apiService.getbyid('student/byudise/', school).then((response) => {
            console.log(response.data);
            setStudents(response.data);
        })
    }, [])

    console.log(students);


    useEffect(() => {
        if (formData.stateOfBirth) {
            const filtered = districts.filter(d => d.state.id === parseInt(formData.stateOfBirth));
            setFilterDistrict(filtered);
        } else {
            setFilterDistrict([]);
        }
    }, [formData.stateOfBirth, districts]);

    useEffect(() => {
        if (formData.districtOfBirth) {
            const filtered = tehsils.filter(t => t.district.id === parseInt(formData.districtOfBirth));
            setFilteredTehsils(filtered);
        } else {
            setFilteredTehsils([]);
        }
    }, [formData.districtOfBirth, tehsils]);

    useEffect(() => {
        if (formData.tehasilOfBirth) {
            const filtered = villages.filter(v => v.tehsil.id === parseInt(formData.tehasilOfBirth));
            setFilteredVillages(filtered);
        } else {
            setFilteredVillages([]);
        }
    }, [formData.tehasilOfBirth, villages]);

    const handleSubmit = (e) => {
        e.preventDefault();
        // Submit logic here
        const payload = { ...formData, school }
        apiService.postdata("student/", payload).then((response) => {
            alert("Data Added Successfully");
            console.log(response);
            setFormData({
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
            })
        })
        console.log('Form submitted:', payload);
    }

    const handleChange = (e) => {
        const { id, value } = e.target;
        if (id === 'registerNumber') {
            const isavailable = students.some(
                (item) => item.registerNumber.toString() === value && item.school.udiseNo === school
            )
            if (isavailable) {
                setWarningMessage("कृपया नोंद: प्रत्येक विद्यार्थ्यासाठी नोंदणी क्रमांक अद्वितीय असणे आवश्यक आहे. हा क्रमांक आधीच वापरात आहे.");
            } else {
                setWarningMessage('');
            }
        }
        setFormData(prev => ({
            ...prev,
            [id]: value
        }));
    }

    return (
        <div className="container py-3">
            <div className="row justify-content-center">
                <div className="col-lg-11">
                    {/* Main Card */}
                    <div className="card shadow-sm border-0 rounded-3 overflow-hidden">
                        {/* Header */}
                        <div className="card-header bg-primary bg-gradient text-white p-3">
                            <div className="d-flex justify-content-center align-items-center">
                                <i className="bi bi-person-plus fs-4 me-2"></i>
                                <h3 className="mb-0 text-center fw-bold fs-3 heading-font">विद्यार्थी नोंदणी फॉर्म</h3>
                            </div>
                        </div>

                        {/* Form Body */}
                        <div className="card-body p-44">
                            <form onSubmit={handleSubmit} className="fs-5">
                                {/* Section 1: Registration Information */}
                                <div className="card mb-4 border-0 bg-light">
                                    <div className="card-body p-3">
                                        <h5 className="card-title border-bottom pb-2 mb-3 fs-5 fw-bold">
                                            <BiBook className="me-2" />
                                            नोंदणी माहिती
                                        </h5>
                                        <div className="row g-3">
                                            <div className="col-md-4 mb-2">
                                                <label htmlFor="registerNumber" className="form-label fw-semibold small">नोंदणी क्रमांक *</label>
                                                <input
                                                    type="text"
                                                    className="form-control form-control-sm"
                                                    id="registerNumber"
                                                    value={formData.registerNumber}
                                                    onChange={handleChange}
                                                    required
                                                    placeholder="नोंदणी क्रमांक"
                                                />
                                                {warningMessage && (
                                                    <div className="form-text text-danger mt-1">
                                                        {warningMessage}
                                                    </div>
                                                )}
                                            </div>
                                            <div className="col-md-4 mb-2">
                                                <label htmlFor="apparId" className="form-label fw-semibold small">अपार आयडी</label>
                                                <input
                                                    type="text"
                                                    className="form-control form-control-sm"
                                                    id="apparId"
                                                    value={formData.apparId}
                                                    onChange={handleChange}
                                                    pattern="[0-9]{10}"
                                                    placeholder="अपार आयडी"
                                                />
                                            </div>
                                            <div className="col-md-4 mb-2">
                                                <label htmlFor="studentId" className="form-label fw-semibold small">विद्यार्थी आयडी</label>
                                                <input
                                                    type="text"
                                                    className="form-control form-control-sm"
                                                    id="studentId"
                                                    value={formData.studentId}
                                                    onChange={handleChange}
                                                    pattern="[0-9]{19}"
                                                    placeholder='विद्यार्थी आयडी'
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Section 2: Personal Information */}
                                <div className="card mb-4 border-0 bg-light">
                                    <div className="card-body p-3">
                                        <h5 className="card-title border-bottom pb-2 mb-3 fs-5 fw-bold">
                                            <BiUserCircle className="me-2" />
                                            वैयक्तिक माहिती
                                        </h5>
                                        <div className="row g-3">
                                            <div className="col-md-3 mb-2">
                                                <label htmlFor="studentName" className="form-label fw-semibold small">विद्यार्थ्याचे नाव *</label>
                                                <input
                                                    type="text"
                                                    className="form-control form-control-sm"
                                                    id="studentName"
                                                    value={formData.studentName}
                                                    onChange={handleChange}
                                                    required
                                                    placeholder="विद्यार्थ्याचे नाव"
                                                />
                                            </div>
                                            <div className="col-md-3 mb-2">
                                                <label htmlFor="fatherName" className="form-label fw-semibold small">वडिलांचे नाव *</label>
                                                <input
                                                    type="text"
                                                    className="form-control form-control-sm"
                                                    id="fatherName"
                                                    value={formData.fatherName}
                                                    onChange={handleChange}
                                                    required
                                                    placeholder="वडिलांचे नाव"
                                                />
                                            </div>
                                            <div className="col-md-3 mb-2">
                                                <label htmlFor="surName" className="form-label fw-semibold small">आडनाव *</label>
                                                <input
                                                    type="text"
                                                    className="form-control form-control-sm"
                                                    id="surName"
                                                    value={formData.surName}
                                                    onChange={handleChange}
                                                    required
                                                    placeholder="आडनाव"
                                                />
                                            </div>
                                            <div className="col-md-3 mb-2">
                                                <label htmlFor="motherName" className="form-label fw-semibold small">आईचे नाव *</label>
                                                <input
                                                    type="text"
                                                    className="form-control form-control-sm"
                                                    id="motherName"
                                                    value={formData.motherName}
                                                    onChange={handleChange}
                                                    required
                                                    placeholder="आईचे नाव"
                                                />
                                            </div>

                                            <div className="col-md-3 mb-2">
                                                <label htmlFor="dateOfBirth" className="form-label fw-semibold small">जन्मतारीख *</label>
                                                <input
                                                    type="date"
                                                    className="form-control form-control-sm"
                                                    id="dateOfBirth"
                                                    value={formData.dateOfBirth}
                                                    onChange={handleChange}
                                                    required
                                                />
                                            </div>
                                            <div className="col-md-3 mb-2">
                                                <label htmlFor="dateOfBirthInWord" className="form-label fw-semibold small">तारीख (शब्दात)</label>
                                                <input
                                                    type="text"
                                                    className="form-control form-control-sm"
                                                    id="dateOfBirthInWord"
                                                    value={formData.dateOfBirthInWord}
                                                    onChange={handleChange}
                                                    placeholder="एक जानेवारी दोन हजार एक"
                                                />
                                            </div>
                                            <div className="col-md-3 mb-2">
                                                <label htmlFor="gender" className="form-label fw-semibold small">लिंग *</label>
                                                <select
                                                    className="form-select form-select-sm"
                                                    id="gender"
                                                    value={formData.gender}
                                                    onChange={handleChange}
                                                    required
                                                >
                                                    <option value="">-- निवडा --</option>
                                                    <option value="पुरुष">पुरुष</option>
                                                    <option value="स्त्री">स्त्री</option>
                                                    <option value="इतर">इतर</option>
                                                </select>
                                            </div>

                                            <CombinedDropdownInput
                                                id="nationality"
                                                label="राष्ट्रीयत्व "
                                                value={formData.nationality}
                                                onChange={(id, value) => setFormData(prev => ({ ...prev, [id]: value }))}
                                                required={true}
                                                options={["भारतीय"]}
                                            />

                                            <CombinedDropdownInput
                                                id="motherTongue"
                                                label="मातृभाषा"
                                                value={formData.motherTongue}
                                                onChange={(id, value) => setFormData(prev => ({ ...prev, [id]: value }))}
                                                required={true}
                                                options={["हिंदी", "मराठी", "उर्दू"]}
                                            />
                                            <CombinedDropdownInput
                                                id="religion"
                                                label="धर्म"
                                                value={formData.religion}
                                                onChange={(id, value) => setFormData(prev => ({ ...prev, [id]: value }))}
                                                required={true}
                                                options={["हिंदू", "मुस्लिम", "ख्रिश्चन", "बौद्ध", "जैन"]}
                                            />
                                            <div className="col-md-3 mb-2">
                                                <label htmlFor="subCast" className="form-label fw-semibold small">उपजात</label>
                                                <input
                                                    type="text"
                                                    className="form-control form-control-sm"
                                                    id="subCast"
                                                    value={formData.subCast}
                                                    onChange={handleChange}
                                                    placeholder="जात"
                                                />
                                            </div>
                                            <CombinedDropdownInput
                                                id="caste"
                                                label="प्रवर्ग"
                                                value={formData.caste}
                                                onChange={(id, value) => setFormData(prev => ({ ...prev, [id]: value }))}
                                                required={true}
                                                options={["अनुसूचित जाती", "अनुसूचित जमाती", "इतर मागास वर्ग", "खुला"]}
                                            />
                                            
                                        </div>
                                    </div>
                                </div>

                                {/* Section 3: Birth Place Information */}
                                <div className="card mb-4 border-0 bg-light">
                                    <div className="card-body p-3">
                                        <h5 className="card-title border-bottom pb-2 mb-3 fs-5 fw-bold">
                                            <BiMap className="me-2" />
                                            जन्मस्थान माहिती
                                        </h5>
                                        <div className="row g-3">
                                            <div className="col-md-6 mb-2">
                                                <label htmlFor="subCast" className="form-label fw-semibold small">जन्म स्थळ</label>
                                                <input
                                                    type="text"
                                                    className="form-control form-control-sm"
                                                    id="birthPlace"
                                                    value={formData.birthPlace}
                                                    onChange={handleChange}
                                                    placeholder="जन्म स्थळ"
                                                />
                                            </div>
                                            <div className="col-md-6 mb-2">
                                                <label htmlFor="stateOfBirth" className="form-label fw-semibold small">राज्य *</label>
                                                <select
                                                    className="form-select form-select-sm"
                                                    id="stateOfBirth"
                                                    value={formData.stateOfBirth}
                                                    onChange={handleChange}
                                                    required
                                                >
                                                    <option value="">-- राज्य निवडा --</option>
                                                    {states.map(state => (
                                                        <option key={state.id} value={state.id}>{state.stateName}</option>
                                                    ))}
                                                </select>
                                            </div>
                                            <div className="col-md-4 mb-2">
                                                <label htmlFor="districtOfBirth" className="form-label fw-semibold small">जिल्हा *</label>
                                                <select
                                                    className="form-select form-select-sm"
                                                    id="districtOfBirth"
                                                    value={formData.districtOfBirth}
                                                    onChange={handleChange}
                                                    disabled={!formData.stateOfBirth}
                                                    required
                                                >
                                                    <option value="">-- जिल्हा निवडा --</option>
                                                    {filterdistrict.map(district => (
                                                        <option key={district.id} value={district.id}>{district.districtName}</option>
                                                    ))}
                                                </select>
                                            </div>
                                            <div className="col-md-4 mb-2">
                                                <label htmlFor="tehasilOfBirth" className="form-label fw-semibold small">तालुका *</label>
                                                <select
                                                    className="form-select form-select-sm"
                                                    id="tehasilOfBirth"
                                                    value={formData.tehasilOfBirth}
                                                    onChange={handleChange}
                                                    disabled={!formData.districtOfBirth}
                                                    required
                                                >
                                                    <option value="">-- तालुका निवडा --</option>
                                                    {filteredTehsils.map(tehsil => (
                                                        <option key={tehsil.id} value={tehsil.id}>{tehsil.tehsilName}</option>
                                                    ))}
                                                </select>
                                            </div>
                                            <div className="col-md-4 mb-2">
                                                <label htmlFor="villageOfBirth" className="form-label fw-semibold small">गाव *</label>
                                                <select
                                                    className="form-select form-select-sm"
                                                    id="villageOfBirth"
                                                    value={formData.villageOfBirth}
                                                    onChange={handleChange}
                                                    disabled={!formData.tehasilOfBirth}
                                                    required
                                                >
                                                    <option value="">-- गाव निवडा --</option>
                                                    {filteredVillages.map(village => (
                                                        <option key={village.id} value={village.id}>{village.villageName}</option>
                                                    ))}
                                                </select>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Section 4: Contact Information */}
                                <div className="card mb-4 border-0 bg-light">
                                    <div className="card-body p-3">
                                        <h5 className="card-title border-bottom pb-2 mb-3 fs-5 fw-bold">
                                            <BiHome className="me-2" />
                                            संपर्क माहिती
                                        </h5>
                                        <div className="row g-3">
                                            <div className="col-md-6 mb-2">
                                                <label htmlFor="residentialAddress" className="form-label fw-semibold small">निवासी पत्ता *</label>
                                                <textarea
                                                    className="form-control form-control-sm"
                                                    id="residentialAddress"
                                                    value={formData.residentialAddress}
                                                    onChange={handleChange}
                                                    required
                                                    rows={3}
                                                    placeholder="पूर्ण पत्ता"
                                                />
                                            </div>
                                            <div className="col-md-6 mb-2">
                                                <label htmlFor="mobileNo" className="form-label fw-semibold small">मोबाईल नंबर *</label>
                                                <input
                                                    type="tel"
                                                    className="form-control form-control-sm"
                                                    id="mobileNo"
                                                    value={formData.mobileNo}
                                                    onChange={handleChange}
                                                    required
                                                    pattern="[0-9]{10}"
                                                    placeholder="987543210"
                                                />
                                                <small className="text-muted">10 अंकी नंबर प्रविष्ट करा</small>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Section 5: Academic Information */}
                                <div className="card mb-4 border-0 bg-light">
                                    <div className="card-body p-3">
                                        <h5 className="card-title border-bottom pb-2 mb-3 fs-5 fw-bold">
                                            <BiBook className="me-2" />
                                            शैक्षणिक माहिती
                                        </h5>
                                        <div className="row g-3">
                                            <div className="col-md-4 mb-2">
                                                <label htmlFor="lastSchoolUdiseNo" className="form-label fw-semibold small">मागील शाळेचा UDISE नंबर</label>
                                                <input
                                                    type="text"
                                                    className="form-control form-control-sm"
                                                    id="lastSchoolUdiseNo"
                                                    value={formData.lastSchoolUdiseNo}
                                                    onChange={handleChange}
                                                    placeholder="UDISE नंबर"
                                                />
                                            </div>
                                            <div className="col-md-4 mb-2">
                                                <label htmlFor="admissionDate" className="form-label fw-semibold small">प्रवेश तारीख *</label>
                                                <input
                                                    type="date"
                                                    className="form-control form-control-sm"
                                                    id="admissionDate"
                                                    value={formData.admissionDate}
                                                    onChange={handleChange}
                                                    required
                                                />
                                            </div>
                                            <div className="col-md-4 mb-2">
                                                <label htmlFor="whichStandardAdmitted" className="form-label fw-semibold small">प्रवेश इयत्ता *</label>
                                                <select
                                                    className="form-select form-select-sm"
                                                    id="whichStandardAdmitted"
                                                    value={formData.whichStandardAdmitted}
                                                    onChange={handleChange}
                                                    required
                                                >
                                                    <option value="">-- इयत्ता निवडा --</option>
                                                    {
                                                        standards.map(standard => (
                                                            <option key={standard.id} value={standard.value}>{standard.standard}</option>
                                                        ))
                                                    }
                                                </select>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Section 6: Additional Information */}
                                <div className="card mb-5  border-0 bg-light">
                                    <div className="card-body p-3 pb-5">
                                        <h5 className="card-title border-bottom pb-2 mb-3 fs-5 fw-bold">
                                            <BiInfoCircle className="me-2" />
                                            अतिरिक्त माहिती
                                        </h5>
                                        <div className="row g-3">
                                            <div className="col-md-3 mb-2">
                                                <label htmlFor="adhaarNumber" className="form-label fw-semibold small">आधार कार्ड नंबर</label>
                                                <input
                                                    type="text"
                                                    className="form-control form-control-sm"
                                                    id="adhaarNumber"
                                                    value={formData.adhaarNumber}
                                                    onChange={handleChange}
                                                    pattern="[0-9]{12}"
                                                    placeholder="१२ अंकी आधार नंबर"
                                                />
                                            </div>

                                            <CombinedDropdownInput
                                                id="ebcInformation"
                                                label="EBC माहिती "
                                                value={formData.ebcInformation}
                                                onChange={(id, value) => setFormData(prev => ({ ...prev, [id]: value }))}
                                                required={false}
                                                options={["PAY", "BCF", "E.B.C.", "E.B.C.BC", "P.T.", "M.T."]}
                                            />

                                            <CombinedDropdownInput
                                                id="casteCategory"
                                                label="जात प्रवर्ग"
                                                value={formData.casteCategory}
                                                onChange={(id, value) => setFormData(prev => ({ ...prev, [id]: value }))}
                                                required={false}
                                                options={["GENERAL", "S.C.", "S.T.", "VJ(A)", "N.T.(B)", "N.T.(C)", "N.T.(D)", "O.B.C.", "S.B.C.", "ESBC"]}
                                            />

                                            <CombinedDropdownInput
                                                id="minorityInformation"
                                                label="अल्पसंख्याक माहिती"
                                                value={formData.minorityInformation}
                                                onChange={(id, value) => setFormData(prev => ({ ...prev, [id]: value }))}
                                                required={false}
                                                options={["Non Minority", "Jain Minority", "MinorityMuslim Minority", "Boudha Minority"]}
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Submit Button */}
                                <div className="d-flex justify-content-center mt-4">
                                    <button type="submit" className="btn btn-primary btn-lg px-5 py-2 rounded-pill shadow-sm">
                                        <i className="bi bi-check-circle me-2"></i>
                                        नोंदणी सबमिट करा
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default AddStudent