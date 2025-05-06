import React, { useState, useEffect } from 'react'
import { Table, Form, Button, Alert } from 'react-bootstrap'
import apiService from '../services/api.service'
import { jwtDecode } from 'jwt-decode';

const AttendanceEntryForm = ({ udiseNo, selectedClass }) => {
    const id = jwtDecode(sessionStorage.getItem('token'))?.id;
    const [students, setStudents] = useState([])
    const [selectedStudents, setSelectedStudents] = useState([])
    const [standard, setStandard] = useState([]);
    const [errors, setErrors] = useState({})
    const [loading, setLoading] = useState(false)
    const [noStudentsMessage, setNoStudentsMessage] = useState('')
    const [studClass, setStudClass] = useState(null)
    
    const now = new Date()
    const monthnyear = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`

    useEffect(() => {
        if (udiseNo && selectedClass) {
            fetchStudents()
        }
    }, [udiseNo, selectedClass])

    const fetchStudents = async () => {
        try {
            setLoading(true)
            setNoStudentsMessage('')
            
            // Get class information
            const res1 = await apiService.getdata(`classteacher/getbyid/${selectedClass}`)
            const standard = res1.data.standardMaster.standard
            setStandard(standard + " " + res1.data.division.name);
            setStudClass(standard);
            
            // Get all students in the class
            const allStudentsResponse = await apiService.getdata(`student/byclass/${selectedClass}`)
            const allStudents = Array.isArray(allStudentsResponse.data) ? allStudentsResponse.data : []
            
            // Get all students with attendance records for the month
            const attendanceResponse = await apiService.getdata(`api/attendance/by-udise-std-monthnyear/${udiseNo}/${standard}/${monthnyear}`)
            
            if (Array.isArray(attendanceResponse.data)) {
                // Extract register numbers of students who already have attendance records for this month
                const existingRegisterNumbers = attendanceResponse.data.map(record => record.registerNumber)
                
                // Filter out students who already have attendance records for this month
                const filteredStudents = allStudents.filter(
                    student => !existingRegisterNumbers.includes(student.registerNumber)
                )
                
                setStudents(filteredStudents)
                
                if (filteredStudents.length === 0) {
                    setNoStudentsMessage('सर्व विद्यार्थ्यांची या महिन्यासाठी उपस्थिती आधीच नोंदवली आहे.')
                }
                
                console.log('Filtered students:', filteredStudents)
            } else {
                // If no attendance data is returned, show all students
                setStudents(allStudents)
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

    const handleSubmit = async (e) => {
        e.preventDefault()

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
                staffId: id,
                teacherQualification: "B.Ed",
                division: "A",
                medium: "English",
                monthnyear,
                std: studClass,
                stdInWords: "First" // Optional: convert number to word if needed
            }

            await apiService.post(`api/attendance/bulk`, attendanceData)
            alert('👉 विद्यार्थ्यांची नोंदणी यशस्वीरित्या पूर्ण झाली आहे!')
            setSelectedStudents([])
            fetchStudents() // Refresh the list after submission
        } catch (error) {
            console.error("Error submitting attendance:", error)
            setErrors({ submit: '🔄 विद्यार्थ्यांची नोंदणी करण्यात अपयश आले' })
        } finally {
            setLoading(false)
        }
    }

    return (
        <Form onSubmit={handleSubmit}>
            <div className='d-flex justify-content-between align-items-center mb-3'>
                <h5>👩‍🏫 विद्यार्थ्यांची उपस्थिती नोंदवा ({monthnyear})</h5>
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
                                        <td>{student.studentName}</td>
                                        <td>{student.registerNumber}</td>
                                        <td>{standard || 'unavailable'}</td>
                                        <td>
                                            {isSelected
                                                ? <span className="text-success">✅ उपस्थित</span>
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
                            variant="primary"
                            className="px-4 py-2 rounded-pill"
                            disabled={loading || !udiseNo || !selectedClass || selectedStudents.length === 0}
                        >
                            {loading ? 'प्रक्रिया चालू आहे...' : 'नोंदणी करा'}
                        </Button>
                    </div>
                </>
            ) : (
                <Alert variant="warning">
                    या वर्गासाठी कोणतेही विद्यार्थी उपलब्ध नाहीत किंवा सर्व विद्यार्थ्यांची या महिन्यासाठी उपस्थिती आधीच नोंदवली आहे.
                </Alert>
            )}
        </Form>
    )
}

export default AttendanceEntryForm
