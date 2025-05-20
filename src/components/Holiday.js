import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import React, { useEffect, useState } from 'react';
import Swal from 'sweetalert2';
import apiService from '../services/api.service';
import helper from '../services/helper.service';

const Modal = React.memo(({
    showModal,
    selectedDate,
    reason,
    setReason,
    handleSubmit,
    isLoading,
    onClose
}) => {
    const [errors, setErrors] = useState('')
    if (!showModal) return null;

    return (
        <div className="modal d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
            <div className="modal-dialog modal-dialog-centered">
                <div className="modal-content">
                    <div className="modal-header">
                        <h5 className="modal-title">Add Holiday</h5>
                        <button
                            type="button"
                            className="btn-close"
                            onClick={onClose}
                            aria-label="Close"
                            disabled={isLoading}
                        />
                    </div>
                    <form onSubmit={(e) => {
                        e.preventDefault();
                        console.log(errors);
                        if(errors.holidayReason != ''){
                            return Swal.fire({
                                       icon: 'error',
                                       title: 'Invalid Input',
                                       text: 'कृपया केवळ मराठी भाषा वापरा. भाषा बदलण्यासाठी windows key + स्पेसबार दबा', // "Please enter only in Marathi"
                                       confirmButtonText: 'ठीक आहे' // "OK" in Marathi
                                   });
                        }
                        handleSubmit();
                    }}>
                        <div className="modal-body">
                            <p>Selected Date: {helper.formatISODateToDMY(selectedDate, "-")}</p>
                            <div className="mb-3">
                                <label htmlFor="holidayReason" className="form-label">Holiday Reason:</label>
                                <input
                                    type="text"
                                    className={`form-control ${errors.holidayReason ? 'is-invalid' : ''}`}
                                    id="holidayReason"
                                    name="holidayReason"
                                    value={reason}
                                    onChange={(e) => {
                                        const value = e.target.value;
                                        const newErrors = { ...errors };

                                        // Check if input contains only Marathi characters (Unicode range for Devanagari)
                                        if (/^[\u0900-\u097F\s]+$/.test(value) || value === "") {
                                            setReason(value);
                                            newErrors.holidayReason = ''; // Clear error if valid
                                        } else {
                                            setReason(value);
                                            newErrors.holidayReason = 'कृपया केवळ मराठी भाषा वापरा. भाषा बदलण्यासाठी windows key + स्पेसबार दबा'; // Set Marathi error message
                                        }
                                        setErrors(newErrors);
                                    }}
                                    placeholder="सुट्टीचे कारण प्रविष्ट करा" // Marathi placeholder
                                    required
                                    disabled={isLoading}
                                    autoFocus
                                />
                                {errors.holidayReason && (
                                    <div className="invalid-feedback d-block">
                                        {errors.holidayReason}
                                    </div>
                                )}
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button
                                type="button"
                                className="btn btn-secondary"
                                onClick={onClose}
                                disabled={isLoading}
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="btn btn-custom-primary"
                                disabled={!reason.trim() || isLoading}
                            >
                                {isLoading ? 'Saving...' : 'Save'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
});

const Holiday = () => {
    const [year, setYear] = useState(new Date().getFullYear());
    const [selectedDate, setSelectedDate] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [holidays, setHolidays] = useState({});
    const [reason, setReason] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });
    const [viewMode, setViewMode] = useState('year'); // 'year' or 'month'
    const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
    const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
    const [showTooltip, setShowTooltip] = useState(false);
    const [activeTooltipContent, setActiveTooltipContent] = useState('');
    const [isFetching, setIsFetching] = useState(false);

    const token = sessionStorage.getItem('token');
    const decodedToken = token ? jwtDecode(token) : {};
    const udiseNo = decodedToken?.udiseNo;
    const id = decodedToken?.id;
    const [holidayData, setHolidayData] = useState([]);

    const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
    const [currentYear, setCurrentYear] = useState(new Date().getFullYear());

    // Helper function to check if date is in current month
    const isCurrentMonth = (month, year) => {
        return month === currentMonth && year === currentYear;
    };

    // Helper function to check if date is weekend
    const isWeekend = (day, month) => {
        const date = new Date(year, month, day);
        const dayOfWeek = date.getDay();
        return dayOfWeek === 0 || dayOfWeek === 6; // 0 is Sunday, 6 is Saturday
    };

    // Helper function to check if date is today
    const isToday = (day, month) => {
        const today = new Date();
        return day === today.getDate() && 
               month === today.getMonth() && 
               year === today.getFullYear();
    };

    // Update current month/year when year changes
    useEffect(() => {
        const now = new Date();
        setCurrentMonth(now.getMonth());
        setCurrentYear(now.getFullYear());
    }, [year]);

    // Fetch holidays when component mounts or udiseNo/year changes
    useEffect(() => {
        const fetchHolidays = async () => {
            if (!udiseNo) return;

            try {
                setIsFetching(true);
                const response = await apiService.getdata(`holiday/byudise/${udiseNo}`);
                if (response.data) {
                    setHolidayData(response.data);

                    // Convert array to object for easier lookup
                    const holidaysObj = response.data.reduce((acc, holiday) => {
                        acc[holiday.holidayDate] = {
                            reason: holiday.reason,
                            date: holiday.holidayDate
                        };
                        return acc;
                    }, {});

                    setHolidays(holidaysObj);
                }
            } catch (error) {
                console.error("Error fetching holidays:", error);
                Swal.fire('Error', 'Failed to fetch holidays', 'error');
            } finally {
                setIsFetching(false);
            }
        };

        fetchHolidays();
    }, [udiseNo, year]);


    // Month names array
    const months = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ];

    // Helper to get days in month
    const getDaysInMonth = (month, year) => {
        return new Date(year, month + 1, 0).getDate();
    };

    // Helper to get first day of month (0 = Sunday, 1 = Monday, etc.)
    const getFirstDayOfMonth = (month, year) => {
        return new Date(year, month, 1).getDay();
    };

    // Handle date click
    const handleDateClick = (day, month) => {
        if (!isCurrentMonth(month, year)) {
            Swal.fire({
                icon: 'warning',
                title: 'Cannot Add Holiday',
                text: 'You can only add holidays for the current month',
            });
            return;
        }

        const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        setSelectedDate(dateStr);
        const selectedHoliday = holidays[dateStr];
        setReason(selectedHoliday?.reason || '');

        setShowModal(true);
    };

    // Handle mouse enter for tooltip
    const handleMouseEnter = (day, month, event) => {
        const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        const holiday = holidays[dateStr];

        if (holiday) {
            const rect = event.currentTarget.getBoundingClientRect();
            setTooltipPosition({
                x: rect.left + window.scrollX + rect.width / 2,
                y: rect.top + window.scrollY - 10
            });
            setActiveTooltipContent(holiday.reason);
            setShowTooltip(true);
        }
    };

    const handleMouseLeave = () => {
        setShowTooltip(false);
    };

    // Handle form submission
    const handleSubmit = async (e) => {
        if (e) e.preventDefault();

        if (reason.trim()) {
            setHolidays({
                ...holidays,
                [selectedDate]: { reason, date: selectedDate }
            });
        }

        setIsLoading(true);

        const holidayDto = {
            createdBy: id,
            holidayDate: selectedDate,
            reason: reason.trim(),
            udise: udiseNo,
        };

        try {
            await axios.post(`http://localhost:8080/api/attendance/mark-holiday/school/${udiseNo}/${holidayDto.holidayDate}`, {}, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${sessionStorage.getItem('token')}`
                }
            });

            await axios.post('http://localhost:8080/holiday/', holidayDto, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${sessionStorage.getItem('token')}`
                }
            });

            setMessage({ type: 'success', text: 'सुट्टी यशस्वीरित्या जतन केली गेली!' });
            Swal.fire('यशस्वी', 'यशस्वीरित्या सुट्टी नोंद करण्यात आली.', 'success');

            await new Promise(resolve => setTimeout(resolve, 1500));

        } catch (error) {
            console.error("Error saving holiday:", error);
            Swal.fire('त्रुटी!', 'डेटा जतन करण्यात अडचण आली.', 'error');
        } finally {
            setIsLoading(false);
            setMessage("");
            setShowModal(false);
            setReason('');
        }
    };

    // Check if a date is a holiday
    const isHoliday = (day, month) => {
        const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        return holidays[dateStr] !== undefined;
    };

    // Get holiday reason for a date
    const getHolidayReason = (day, month) => {
        const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        return holidays[dateStr]?.reason || '';
    };

    // Render calendar for a specific month
    const renderMonth = (monthIndex) => {
        const daysInMonth = getDaysInMonth(monthIndex, year);
        const firstDay = getFirstDayOfMonth(monthIndex, year);

        // Create blank spaces for days before the first day of month
        const blanks = Array(firstDay).fill(null).map((_, i) => (
            <td key={`blank-${i}`} className="calendar-day"></td>
        ));

        const days = [];
        for (let d = 1; d <= daysInMonth; d++) {
            const isHolidayDate = isHoliday(d, monthIndex);
            const holidayReason = getHolidayReason(d, monthIndex);
            const isCurrMonth = isCurrentMonth(monthIndex, year);
            const isWeekendDay = isWeekend(d, monthIndex);
            const isTodayDate = isToday(d, monthIndex);

            days.push(
                <td 
                    key={`day-${d}`} 
                    className={`calendar-day ${isWeekendDay ? 'weekend-day' : ''} ${isTodayDate ? 'today-highlight' : ''}`}
                >
                    <div className={`day-container ${!isCurrMonth ? 'non-current-month' : ''}`}>
                        <div
                            className={`day-content ${isHolidayDate ? 'holiday-day' : ''}`}
                            onClick={!isHolidayDate && isCurrMonth ? () => handleDateClick(d, monthIndex) : null}
                            onMouseEnter={(e) => handleMouseEnter(d, monthIndex, e)}
                            onMouseLeave={handleMouseLeave}
                            title={holidayReason}
                        >
                            <span className="day-number">{d}</span>
                            {isHolidayDate && (
                                <small className="holiday-reason">{holidayReason}</small>
                            )}
                        </div>
                        {!isCurrMonth && (
                            <div className="month-restriction-overlay"></div>
                        )}
                    </div>
                </td>
            );
        }

        // Combine blanks and days
        const totalCells = [...blanks, ...days];

        // Create calendar rows
        const rows = [];
        let cells = [];

        totalCells.forEach((cell, i) => {
            if (i % 7 === 0 && i > 0) {
                rows.push(<tr key={`row-${i}`}>{cells}</tr>);
                cells = [];
            }
            cells.push(cell);
        });

        // Add remaining cells
        if (cells.length > 0) {
            while (cells.length < 7) {
                cells.push(<td key={`empty-${cells.length}`} className="calendar-day"></td>);
            }
            rows.push(<tr key={`row-last`}>{cells}</tr>);
        }

        return (
            <div className="mb-4" key={`month-${monthIndex}`}>
                <h3 className="text-center mb-3 fs-4 fw-bold month-header">{months[monthIndex]} {year}</h3>
                <table className="table table-bordered calendar-table">
                    <thead className="bg-light">
                        <tr>
                            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                                <th key={day} className="text-center">
                                    {day}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {rows}
                    </tbody>
                </table>
            </div>
        );
    };

    // CSS styles to make the calendar look better
    const calendarStyles = `
    .calendar-container {
        background-color: #f8f9fa;
        border-radius: 8px;
        padding: 20px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.05);
    }
    
    .calendar-header {
        background: linear-gradient(135deg, #6a11cb 0%, #2575fc 100%);
        color: white;
        padding: 15px;
        border-radius: 6px;
        margin-bottom: 25px;
        box-shadow: 0 4px 8px rgba(0,0,0,0.1);
    }
    
    .calendar-table {
        table-layout: fixed;
        border-radius: 8px;
        overflow: hidden;
        border-collapse: separate;
        border-spacing: 0;
        border: 1px solid #dee2e6;
        box-shadow: 0 2px 8px rgba(0,0,0,0.05);
    }
    
    .calendar-table thead {
        background: linear-gradient(to right, #5e72e4, #825ee4);
        color: white;
        font-weight: 500;
    }
    
    .calendar-table th {
        padding: 12px 5px;
        text-align: center;
        border: none;
        font-size: 0.9rem;
    }
    
    .calendar-day {
        height: 90px;
        padding: 0 !important;
        vertical-align: top;
        position: relative;
        border: 1px solid #dee2e6;
    }
    
    .day-container {
        height: 100%;
        position: relative;
    }
    
    .day-content {
        height: 100%;
        padding: 6px;
        transition: all 0.2s ease;
        overflow: hidden;
        display: flex;
        flex-direction: column;
        position: relative;
        z-index: 1;
    }
    
    .day-content:not(.holiday-day):hover {
        background-color: rgba(94, 114, 228, 0.1);
        cursor: pointer;
        transform: scale(0.98);
    }
    
    .day-number {
        font-weight: 600;
        font-size: 1rem;
        margin-bottom: 3px;
    }
    
    /* Holiday styles */
    .holiday-day {
        background: linear-gradient(135deg, #ff9a9e 0%, #fad0c4 99%, #fad0c4 100%);
        border-left: 3px solid #e63946;
        cursor: default !important;
    }
    
    .weekend-day {
        background-color: #f8f9fa;
    }
    
    .today-highlight {
        background-color: rgba(94, 114, 228, 0.15);
    }
    
    .holiday-reason {
        font-size: 0.75rem;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        margin-top: 2px;
        color: #d32f2f;
        font-weight: 500;
    }
    
    .tooltip-custom {
        position: absolute;
        background-color: #343a40;
        color: white;
        padding: 8px 12px;
        border-radius: 4px;
        font-size: 14px;
        z-index: 100;
        pointer-events: none;
        transform: translate(-50%, -100%);
        box-shadow: 0 4px 8px rgba(0,0,0,0.2);
        max-width: 220px;
    }
    
    .tooltip-custom::after {
        content: "";
        position: absolute;
        top: 100%;
        left: 50%;
        margin-left: -5px;
        border-width: 5px;
        border-style: solid;
        border-color: #343a40 transparent transparent transparent;
    }
    
    .non-current-month {
        opacity: 0.65;
    }
    
    .month-restriction-overlay {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background-color: rgba(255, 255, 255, 0.7);
        z-index: 2;
    }
    
    /* Holiday List styles */
    .holidays-list-container {
        background-color: white;
        border-radius: 8px;
        padding: 15px;
        margin-top: 30px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.05);
    }
    
    .holidays-list-container h2 {
        color: #5e72e4;
        border-bottom: 2px solid #5e72e4;
        padding-bottom: 10px;
        margin-bottom: 20px;
    }
    
    .holidays-table {
        border-radius: 8px;
        overflow: hidden;
    }
    
    .holidays-table thead {
        background: linear-gradient(to right, #5e72e4, #825ee4);
        color: white;
    }
    
    .btn-custom-primary {
        background: linear-gradient(to right, #5e72e4, #825ee4);
        border: none;
        color: white;
        transition: all 0.3s ease;
    }
    
    .btn-custom-primary:hover {
        transform: translateY(-2px);
        box-shadow: 0 7px 14px rgba(50, 50, 93, 0.1), 0 3px 6px rgba(0, 0, 0, 0.08);
    }
    
    /* Month header styling */
    .month-header {
        background: linear-gradient(to right, #5e72e4, #825ee4);
        color: white;
        padding: 10px;
        border-radius: 6px;
        margin-bottom: 15px;
        box-shadow: 0 4px 6px rgba(50, 50, 93, 0.11);
    }
    
    /* Modal styling */
    .modal-header {
        background: linear-gradient(to right, #5e72e4, #825ee4);
        color: white;
    }
    
    .modal-title {
        font-weight: 600;
    }
    
    .btn-close {
        filter: brightness(0) invert(1);
    }
    
    /* Controls styling */
    .year-controls {
        background-color: white;
        border-radius: 8px;
        padding: 15px;
        box-shadow: 0 4px 6px rgba(50, 50, 93, 0.11);
    }
    
    /* Loading state */
    .calendar-loading {
        position: relative;
        min-height: 300px;
    }
    
    .loading-overlay {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background-color: rgba(255, 255, 255, 0.7);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 10;
    }
    
    /* Responsive adjustments */
    @media (max-width: 768px) {
        .calendar-day {
            height: 70px;
        }
        
        .day-number {
            font-size: 0.9rem;
        }
        
        .holiday-reason {
            font-size: 0.65rem;
        }
    }
    `;

    return (
        <div className="container py-4">
            <style>{calendarStyles}</style>

            <div className="calendar-container">
                <div className="calendar-header">
                    <div className="row mb-4 align-items-center">
                        <div className="col-md-6">
                            <h1 className="display-6 fw-bold mb-0">Holiday Calendar {year}</h1>
                        </div>
                        <div className="col-md-6">
                            <div className="d-flex flex-wrap justify-content-md-end gap-2">
                                <div className="btn-group me-2">
                                    <button
                                        className="btn btn-custom-primary"
                                        onClick={() => setYear(year - 1)}
                                    >
                                        Previous Year
                                    </button>
                                    <button
                                        className="btn btn-custom-primary"
                                        onClick={() => setYear(year + 1)}
                                    >
                                        Next Year
                                    </button>
                                </div>

                                <div className="d-flex">
                                    <select
                                        className="form-select me-2"
                                        value={viewMode}
                                        onChange={(e) => setViewMode(e.target.value)}
                                    >
                                        <option value="year">Full Year</option>
                                        <option value="month">Single Month</option>
                                    </select>

                                    {viewMode === 'month' && (
                                        <select
                                            className="form-select"
                                            value={selectedMonth}
                                            onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
                                        >
                                            {months.map((month, index) => (
                                                <option key={month} value={index}>{month}</option>
                                            ))}
                                        </select>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="calendar-content position-relative">
                    {isFetching && (
                        <div className="loading-overlay">
                            <div className="spinner-border text-primary" role="status">
                                <span className="visually-hidden">Loading...</span>
                            </div>
                        </div>
                    )}

                    <div className="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4">
                        {viewMode === 'year'
                            ? Array(12).fill(null).map((_, i) => (
                                <div className="col" key={`month-col-${i}`}>
                                    {renderMonth(i)}
                                </div>
                            ))
                            : (
                                <div className="col-12">
                                    {renderMonth(selectedMonth)}
                                </div>
                            )
                        }
                    </div>
                </div>
            </div>

            <Modal
                showModal={showModal}
                selectedDate={selectedDate}
                reason={reason}
                setReason={setReason}
                handleSubmit={handleSubmit}
                isLoading={isLoading}
                onClose={() => {
                    setShowModal(false);
                    setReason('');
                }}
            />

            {showTooltip && (
                <div
                    className="tooltip-custom"
                    style={{
                        top: `${tooltipPosition.y}px`,
                        left: `${tooltipPosition.x}px`
                    }}
                >
                    {activeTooltipContent}
                </div>
            )}

            {Object.keys(holidays).length > 0 && (
                <div className="holidays-list-container">
                    <h2 className="fs-3 fw-bold mb-3">Holidays List</h2>
                    <div className="table-responsive">
                        <table className="table table-striped table-hover holidays-table">
                            <thead>
                                <tr>
                                    <th>Date</th>
                                    <th>Reason</th>
                                </tr>
                            </thead>
                            <tbody>
                                {Object.values(holidays).map(holiday => (
                                    <tr key={holiday.date}>
                                        <td>{helper.formatISODateToDMY(holiday.date, "-")}</td>
                                        <td>{holiday.reason}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Holiday;