import React from 'react'
import { useEffect, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import apiService from '../services/api.service';
import axios from 'axios';

function UpdateStudentAcademicYearForm() {
  const { id } = useParams();

  console.log(id);

  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    division: '',
    standardId: '',
    academicYear: '',
    status: ''
  });

  const [divisions, setDivisions] = useState([]);
  const [standards, setStandards] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [singleTeacher, setSingleTeacher] = useState();
  const [classTeacherData, setClassTeacherData] = useState([]);
  const [academicdata, setAcademicData] = useState('');
  const location = useLocation();
  const { selectedStudents } = location.state || { selectedStudents: [] }
  console.log(selectedStudents);

  const schoolUdiseNo = 12345678093;
  const studentId = id;

  useEffect(() => {
    apiService.getbyid("Division/getbyudise/", schoolUdiseNo).then((response) => {
      setDivisions(response.data);
    });
    apiService.getbyid("standardmaster/getbyudise/", schoolUdiseNo).then((response) => {
      setStandards(response.data);
    });
    apiService.getbyid("staff/getbyudise/", schoolUdiseNo).then((response) => {
      setTeachers(response.data);
    });
    apiService.getbyid("classteacher/getbyudise/", schoolUdiseNo).then((response) => {
      // console.log(response.data);
      setClassTeacherData(response.data);
    });
    axios.get("http://localhost:8080/academic/student-school", {
      params: {
        studentId: studentId,
        schoolUdiseNo: schoolUdiseNo
      }
    }).then((response) => {
      console.log(response.data);
      setAcademicData(response.data);
    })
  }, []);

  console.log(teachers);
  console.log(classTeacherData);

  useEffect(() => {
    if (formData.division && formData.standardId) {
      const filter = classTeacherData.find(ct =>
        ct.division.id === parseInt(formData.division) &&
        ct.standardMaster.id === parseInt(formData.standardId)
      );
      setSingleTeacher(filter);
    } else {
      setSingleTeacher(null);
    }
  }, [formData.division, formData.standardId, classTeacherData]);

  function handleChange(event) {
    const { name, value } = event.target;
    const newValue = name === "status" ? value.toLowerCase() : value;
    setFormData({
      ...formData,
      [name]: newValue
    });
  }

  function handleSubmit(event) {
    event.preventDefault();

    if (formData.standardId == academicdata?.standard?.id) {
      alert("इयत्ता बदला (Please change the standard)");
      return;
    }
    else{
      const payload = {
        ...formData,
        studentId: id,
        schoolUdiseNo,
        classTeacher: singleTeacher?.id
      };
      setFormData({
        division: '',
        standardId: '',
        academicYear: ''
      })
      console.log(payload);
  
      apiService.putdata('academic/update-status/', payload, academicdata.id).then((response) => {
        alert("Data Added Succesfully");
      });
  
       navigate(`/updateacademicyearlist`);
    }
  }
  return (
    <div className="container py-3">
      <div className="row justify-content-center">
        <div className="col-lg-6">
          <div className="card shadow-sm border-0 rounded-3">
            <div className="card-header bg-primary bg-gradient text-white p-3 text-center">
              <h3 className="mb-0 fw-bold fs-4 heading-font">वर्गशिक्षक नियुक्ती</h3>
            </div>

            <div className="card-body p-4">
              <form onSubmit={handleSubmit} className="fs-6">
                {/* Division Select */}
                <div className="mb-3">
                  <label className="form-label fw-semibold">तुकडी</label>
                  <select
                    className="form-select form-select-sm"
                    name="division"
                    value={formData.division}
                    onChange={handleChange}
                  >
                    <option value="">-- तुकडी निवडा --</option>
                    {divisions.map(division => (
                      <option key={division.id} value={division.id}>
                        {division.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Staff Select */}
                <div className="mb-3">
                  <label className="form-label fw-semibold">शिक्षक</label>
                  <div className="form-control form-control-sm">
                    {singleTeacher ? `${singleTeacher.staff.fname} ${singleTeacher.staff.lname}` : 'शिक्षक निवडले नाहीत'}
                  </div>
                </div>

                {/* Standard Select */}
                <div className="mb-3">
                  <label className="form-label fw-semibold">इयत्ता</label>
                  <select
                    className="form-select form-select-sm"
                    name="standardId"
                    value={formData.standardId}
                    onChange={handleChange}
                  >
                    <option value="">-- इयत्ता निवडा --</option>
                    {standards.map(standard => (
                      <option key={standard.id} value={standard.id}>
                        {standard.standard}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Academic Year Input */}
                <div className="mb-3">
                  <label className="form-label fw-semibold">शैक्षणिक वर्ष</label>
                  <input
                    className='form-control'
                    name='academicYear'
                    value={formData.academicYear}
                    placeholder='उदा. 2024-25'
                    onChange={handleChange}
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label fw-semibold">status</label>
                  <input
                    className='form-control'
                    name='status'
                    value={formData.status}
                    placeholder='pass'
                    onChange={handleChange}
                  />
                </div>

                <div className="text-center mt-4">
                  <button type="submit" className="btn btn-primary px-4 py-2 rounded-pill shadow-sm">
                    जतन करा
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

export default UpdateStudentAcademicYearForm

