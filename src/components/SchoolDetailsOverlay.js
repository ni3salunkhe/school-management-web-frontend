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

    return (
        <div className="details-overlay-react" onClick={handleBackdropClick}>
            <div className="details-content-box-react">
                <button className="close-details-btn-react" onClick={onClose} aria-label="Close details">
                    ×
                </button>
                <h2>{school.name}</h2>
                <div>
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