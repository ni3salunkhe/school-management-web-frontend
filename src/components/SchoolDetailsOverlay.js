// SchoolDetailsOverlay.js
import React, { useEffect } from 'react';
import '../styling/SchoolDetailsOverlay.css'; // Import the CSS

const SchoolDetailsOverlay = ({ school, onClose, isOpen }) => {
    useEffect(() => {
        // Prevent body scroll when overlay is open
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'auto';
        }
        // Cleanup function to restore scroll on unmount
        return () => {
            document.body.style.overflow = 'auto';
        };
    }, [isOpen]);

    useEffect(() => {
        // Optional: Close overlay with Escape key
        const handleEscKey = (event) => {
            if (event.key === 'Escape' && isOpen) {
                onClose();
            }
        };
        window.addEventListener('keydown', handleEscKey);
        return () => {
            window.removeEventListener('keydown', handleEscKey);
        };
    }, [isOpen, onClose]);


    if (!isOpen || !school) {
        return null; // Don't render anything if not open or no school data
    }

    // Optional: Close overlay if user clicks on the backdrop
    const handleBackdropClick = (event) => {
        if (event.target === event.currentTarget) { // Clicked on the backdrop itself
            onClose();
        }
    };

    console.log(school)
    return (
        <div className="details-overlay-react" onClick={handleBackdropClick}>
            <div className="details-content-box-react">
                <button className="close-details-btn-react" onClick={onClose} aria-label="Close details">
                    ×
                </button>
                <h2>{school.name}</h2>
                <div>
                    {/* board
: 
"कोल्हापूर बोर्ड"
boardDivision
: 
"कोल्हापूर"
boardIndexNo
: 
"676767"
createdAt
: 
null
district
: 
{id: 1, districtName: 'वाराणसी ', state: {…}}
headMasterMobileNo
: 
"9234567890"
headMasterPassword
: 
"shantaram"
headMasterUserName
: 
"rupeshmane"
logo
: 
"/9j/4AAQSkZJRgABAQEASABIAAD/2wBDAAMCAgMCAgMDAwMEA
medium
: 
"इंग्लिश "
pinCode
: 
"416003"
role
: 
null

: 
"कासेगऑन संस्था"
schoolApprovalNo
: 
"9999"
schoolEmailId
: 
"rupeshmane@gmail.com"
schoolName
: 
"आदर्श बालक मंदिर "
schoolPlace
: 
null
schoolSlogan
: 
"मुलगी शिकली प्रगती झाली"
state
: 
{id: 1, stateName: 'बिहार'}
tehsil
: 
{id: 1, tehsilName: 'करवीर', district: {…}}
udiseNo
: 
1111 */}
                    <p><strong>संस्थेचे नाव:</strong> {school.sansthaName}</p>
                    <p><strong>मुख्याध्यापक:</strong> {school.headMasterUserName}</p>
                    <p><strong>संपर्क:</strong> {school.schoolEmailId} || {school.headMasterMobileNo}</p>
                    {school.description && <p><strong>Description:</strong> {school.description}</p>}
                </div>
            </div>
        </div>
    );
};

export default SchoolDetailsOverlay;