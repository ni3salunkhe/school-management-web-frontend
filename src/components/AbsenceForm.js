import React, { useState, useEffect } from 'react'
import { Table, Form, Button } from 'react-bootstrap'
import apiService from '../services/api.service'

const AbsenceForm = ({ udiseNo, selectedClass }) => {
  const [students, setStudents] = useState([])
  const [selectedStudents, setSelectedStudents] = useState([])
  const [errors, setErrors] = useState({})
  const now = new Date()
  const day = now.toISOString().split('T')[0]
  const monthnyear = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`


  const [formData, setFormData] = useState({
    date: '' || day
  })

  useEffect(() => {
    if (udiseNo && selectedClass) {
      fetchStudents()
    }
  }, [udiseNo, selectedClass])

  const fetchStudents = async () => {
    try {
      const response = await apiService.getdata(`api/attendance/by-udise-std-monthnyear/${udiseNo}/${selectedClass}/${monthnyear}`)
      if (Array.isArray(response.data)) {
        const filtered = response.data.filter(
          student => String(student.std).includes(String(selectedClass))
        )
        setStudents(filtered)
        console.log(response.data)
      }
    } catch (error) {
      console.error("Error fetching students:", error)
    }
  }

  const handleStudentSelection = (registerNumber) => {
    setSelectedStudents(prev =>
      prev.includes(registerNumber)
        ? prev.filter(id => id !== registerNumber)
        : [...prev, registerNumber]
    )
  }

  const handleSelectAll = () => {
    if (selectedStudents.length === students.length) {
      setSelectedStudents([])
    } else {
      setSelectedStudents(students.map(student => student.registerNumber))
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }))
    if (name === 'date') {
      const selectedDate = new Date(value);
      const today = new Date();
      if (selectedDate > today) {
        setErrors(prevState => ({ ...prevState, [name]: 'महाशय तारीख आजपर्यंतचीच निवडू शकता.' }));
        setFormData(prevState => ({
          ...prevState,
          [name]: day
        }))
      } else {
        setErrors(prevState => ({ ...prevState, [name]: '' }));
      }
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (formData.date === '') {
      
      setErrors({ date: 'महाशय तारीख निवडणे आवश्यक आहे.' })
      return
    }
    if (!selectedClass) {
      setErrors({ class: 'Please select a class' })
      return
    }

    if (selectedStudents.length === 0) {
      setErrors({ students: 'Please select at least one student' })
      return
    }
    const today = new Date().toISOString().split('T')[0];
    try {
      const attendanceData = {
        udiseNo,
        studentRegisterId: selectedStudents,
        day: formData.date
      }
      await apiService.putData(`api/attendance/mark-absent`, attendanceData)
      alert('👉 विद्यार्थ्यांची गैरहजेरी यशस्वीरित्या नोंदवली गेली!')
      setSelectedStudents([])
      fetchStudents()
    } catch (error) {
      console.error("Error submitting attendance:", error)
      setErrors({ submit: '🔄 विद्यार्थ्यांची नोंदणी अपूर्ण राहिली आहे. कृपया तपासून पुन्हा प्रयत्न करा.' })
    }
  }

  return (
    <Form onSubmit={handleSubmit}>
      <div className='d-flex justify-content-between align-items-center'>
        <h5>🚫 अनुपस्थित विद्यार्थ्यांची नोंद</h5>
        <div>
          <Form.Group>
            <Form.Label>
              अनुपस्थित तारीख निवडा
            </Form.Label>
            <Form.Control
              name='date'
              type='date'
              value={formData.date}
              onChange={handleChange}
              isInvalid={!!errors.date}
            >
            </Form.Control>
            <Form.Control.Feedback type='invalid' >
              {errors.date}
            </Form.Control.Feedback>
          </Form.Group>
        </div>
      </div>
      <Table bordered hover responsive className="mt-3 text-center">
        <thead className="table-light">
          <tr>
            <th>
              <Form.Check
                type="checkbox"
                checked={selectedStudents.length === students.length}
                onChange={handleSelectAll}
                label=""
              />
            </th>
            <th>👤 नाव</th>
            <th>🆔 रजिस्टर ID</th>
            <th>📚 वर्ग</th>
            <th>स्थिती</th>
          </tr>
        </thead>
        <tbody>
          {students.map(student => {
            const isSelected = selectedStudents.includes(student.registerNumber)
            return (
              <tr key={student.registerNumber}>
                <td>
                  <Form.Check
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => handleStudentSelection(student.registerNumber)}
                  />
                </td>
                <td>{student.studId.studentName}</td>
                <td>{student.registerNumber}</td>
                <td>{student.className || '6A'}</td>
                <td>
                  {isSelected
                    ? <span className="text-danger fw-bold">❌ अनुपस्थित</span>
                    : <span className="text-success">✅ उपस्थित</span>}
                </td>
              </tr>
            )
          })}
        </tbody>
      </Table>

      {errors.students && <div className="text-danger mb-3">{errors.students}</div>}
      {errors.submit && <div className="text-danger mb-3">{errors.submit}</div>}

      <div className="d-flex justify-content-center">
        <Button
          type="submit"
          variant="danger"
          className="px-4 py-2 rounded-pill"
          disabled={!udiseNo || !selectedClass || selectedStudents.length === 0}
        >
          अनुपस्थित नोंदवा
        </Button>
      </div>
    </Form>
  )
}

export default AbsenceForm
