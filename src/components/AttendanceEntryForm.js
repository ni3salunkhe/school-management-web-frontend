import React, { useState, useEffect } from 'react'
import { Table, Form, Button } from 'react-bootstrap'
import apiService from '../services/api.service'
import { jwtDecode } from 'jwt-decode';

const AttendanceEntryForm = ({ udiseNo, selectedClass }) => {
    const id = jwtDecode(sessionStorage.getItem('token'))?.id;
    const [students, setStudents] = useState([])
    const [selectedStudents, setSelectedStudents] = useState([])
    const [errors, setErrors] = useState({})
    const [existingAttendance, setExistingAttendance] = useState([])
    
    const now = new Date()
    const day = now.toISOString().split('T')[0]
    const monthnyear = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`

    useEffect(() => {
        if (udiseNo && selectedClass) {
            fetchStudents()
        }
    }, [udiseNo, selectedClass])

    const fetchStudents = async () => {
        try {
            const response = await apiService.getdata(`student/byclass/${selectedClass}`)
            if (Array.isArray(response.data)) {
                
                setStudents(response.data)
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
            const attendanceData = {
                udiseNo,
                studentRegisterId: selectedStudents,
                staffId: id,
                teacherQualification: "B.Ed",
                division: "A",
                medium: "English",
                monthnyear,
                std: selectedClass,
                stdInWords: "First" // Optional: convert number to word if needed
            }

            await apiService.post(`api/attendance/bulk`, attendanceData)
            alert('👉 विद्यार्थ्यांची नोंदणी यशस्वीरित्या पूर्ण झाली आहे!')
            setSelectedStudents([])
            fetchStudents()
        } catch (error) {
            console.error("Error submitting attendance:", error)
            setErrors({ submit: '🔄 विद्यार्थ्यांची नोंदणी करण्यात अपयश आले' })
        }
    }

    return (
        <Form onSubmit={handleSubmit}>
            <h5>👩‍🏫 विद्यार्थ्यांची उपस्थिती नोंदवा</h5>

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
                                <td>{student.studentName}</td>
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
                    variant="primary"
                    className="px-4 py-2 rounded-pill"
                    disabled={!udiseNo || !selectedClass || selectedStudents.length === 0}
                >
                    नोंदणी करा
                </Button>
            </div>
        </Form>
    )
}

export default AttendanceEntryForm
