import React, { useState, useEffect } from 'react'
import { Table, Form, Button, Alert } from 'react-bootstrap'
import apiService from '../services/api.service'

const AbsenceForm = ({ udiseNo, selectedClass }) => {
  const [students, setStudents] = useState([])
  const [selectedStudents, setSelectedStudents] = useState([])
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const [noStudentsMessage, setNoStudentsMessage] = useState('')
  
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
  }, [udiseNo, selectedClass, formData.date]) // Added date dependency to refresh when date changes

  const fetchStudents = async () => {
    try {
      setLoading(true)
      setNoStudentsMessage('')
      
      // Get class information
      const res1 = await apiService.getdata(`classteacher/getbyid/${selectedClass}`)
      const standard = res1.data.standardMaster.standard
      
      // Get all students with attendance records for the month
      const response = await apiService.getdata(`api/attendance/by-udise-std-monthnyear/${udiseNo}/${standard}/${monthnyear}`)
      
      if (Array.isArray(response.data)) {
        // Get the day number from the selected date
        const selectedDate = new Date(formData.date)
        const dayNumber = selectedDate.getDate() // Gets the day of the month (1-31)
        const dayKey = `day${dayNumber}` // Creates the key like "day3"
        
        // Filter students who are not already marked as absent for the selected day
        const filtered = response.data.filter(student => {
          // Check if the student has an attendance record for the selected day
          // and if it's not already marked as 'A' (absent)
          return student[dayKey] !== 'A'
        })
        
        setStudents(filtered)
        
        if (filtered.length === 0) {
          setNoStudentsMessage('सर्व विद्यार्थी या तारखेसाठी अनुपस्थित म्हणून चिन्हांकित केले आहेत.')
        }
        
        console.log('Filtered students:', filtered)
      }
    } catch (error) {
      console.error("Error fetching students:", error)
      setErrors({ fetch: 'विद्यार्थ्यांची माहिती आणण्यात त्रुटी आली आहे.' })
    } finally {
      setLoading(false)
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
    const { name, value } = e.target
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }))
    
    if (name === 'date') {
      const selectedDate = new Date(value)
      const today = new Date()
      
      if (selectedDate > today) {
        setErrors(prevState => ({ ...prevState, [name]: 'महाशय तारीख आजपर्यंतचीच निवडू शकता.' }))
        setFormData(prevState => ({
          ...prevState,
          [name]: day
        }))
      } else {
        setErrors(prevState => ({ ...prevState, [name]: '' }))
        // Clear selected students when date changes
        setSelectedStudents([])
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
    
    try {
      setLoading(true)
      const attendanceData = {
        udiseNo,
        studentRegisterId: selectedStudents,
        day: formData.date
      }
      
      await apiService.putData(`api/attendance/mark-absent`, attendanceData)
      alert('👉 विद्यार्थ्यांची गैरहजेरी यशस्वीरित्या नोंदवली गेली!')
      setSelectedStudents([])
      fetchStudents() // Refresh the list after submission
    } catch (error) {
      console.error("Error submitting attendance:", error)
      setErrors({ submit: '🔄 विद्यार्थ्यांची नोंदणी अपूर्ण राहिली आहे. कृपया तपासून पुन्हा प्रयत्न करा.' })
    } finally {
      setLoading(false)
    }
  }

  // Helper function to get attendance status for the selected day
  const getAttendanceStatus = (student) => {
    const selectedDate = new Date(formData.date)
    const dayNumber = selectedDate.getDate()
    const dayKey = `day${dayNumber}`
    
    return student[dayKey] || 'N/A'
  }

  return (
    <Form onSubmit={handleSubmit}>
      <div className='d-flex justify-content-between align-items-center mb-3'>
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
            <Form.Control.Feedback type='invalid'>
              {errors.date}
            </Form.Control.Feedback>
          </Form.Group>
        </div>
      </div>
      
      {errors.fetch && <Alert variant="danger">{errors.fetch}</Alert>}
      
      {loading ? (
        <div className="text-center py-4">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-2">विद्यार्थ्यांची माहिती लोड होत आहे...</p>
        </div>
      ) : noStudentsMessage ? (
        <Alert variant="info">{noStudentsMessage}</Alert>
      ) : students.length > 0 ? (
        <>
          <Table bordered hover responsive className="mt-3 text-center">
            <thead className="table-light">
              <tr>
                <th>
                  <Form.Check
                    type="checkbox"
                    checked={selectedStudents.length === students.length && students.length > 0}
                    onChange={handleSelectAll}
                    label=""
                    disabled={students.length === 0}
                  />
                </th>
                <th>👤 नाव</th>
                <th>🆔 रजिस्टर ID</th>
                <th>📚 वर्ग</th>
                <th>वर्तमान स्थिती</th>
                <th>नवीन स्थिती</th>
              </tr>
            </thead>
            <tbody>
              {students.map(student => {
                const isSelected = selectedStudents.includes(student.registerNumber)
                const currentStatus = getAttendanceStatus(student)
                
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
                    <td>{student.std || '6A'}</td>
                    <td>
                      {currentStatus === 'P' && <span className="text-success">✅ उपस्थित</span>}
                      {currentStatus === 'S' && <span className="text-primary">🔵 रविवार</span>}
                      {currentStatus === 'H' && <span className="text-info">🔷 सुट्टी</span>}
                      {currentStatus === 'N/A' && <span className="text-secondary">⚪ नोंद नाही</span>}
                    </td>
                    <td>
                      {isSelected
                        ? <span className="text-danger fw-bold">❌ अनुपस्थित</span>
                        : <span className="text-secondary">कोणताही बदल नाही</span>}
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
              disabled={loading || !udiseNo || !selectedClass || selectedStudents.length === 0}
            >
              {loading ? 'प्रक्रिया चालू आहे...' : 'अनुपस्थित नोंदवा'}
            </Button>
          </div>
        </>
      ) : (
        <Alert variant="warning">
          या वर्गासाठी कोणतेही विद्यार्थी उपलब्ध नाहीत किंवा सर्व विद्यार्थी आधीच अनुपस्थित म्हणून नोंदवले आहेत.
        </Alert>
      )}
    </Form>
  )
}

export default AbsenceForm
