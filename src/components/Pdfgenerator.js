import React, { useEffect, useState } from 'react';
import html2pdf from 'html2pdf.js';
import apiService from '../services/api.service';

const PdfGenerator = () => {
    const [isGenerating, setIsGenerating] = useState(false);
    const [error, setError] = useState(null);
    const [data,setdata]=useState([]);

    useEffect(()=>{
        apiService.getdata("classteacher/").then((response)=>{
            setdata(response.data);
        })
    },[])

    console.log(data);
    

    const generatePdf = () => {
        setIsGenerating(true);
        setError(null);

        try {
            // Get the content element
            const content = document.getElementById('pdf-content');

            // Configure html2pdf options
            const options = {
                margin: 10,
                filename: 'marathi-document.pdf',
                image: { type: 'jpeg', quality: 0.98 },
                html2canvas: {
                    scale: 2,
                    useCORS: true,
                    letterRendering: true,
                    // Force font rendering
                    onclone: function (clonedDoc) {
                        const style = clonedDoc.createElement('style');
                        style.innerHTML = `
              @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+Devanagari:wght@400;700&display=swap');
              #pdf-content * {
                font-family: 'Noto Sans Devanagari', sans-serif !important;
              }
            `;
                        clonedDoc.head.appendChild(style);
                    }
                },
                jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
            };

            // Generate PDF
            html2pdf().from(content).set(options).save().then(() => {
                setIsGenerating(false);
            }).catch(err => {
                console.error('PDF generation error:', err);
                setError('PDF generation failed: ' + err.message);
                setIsGenerating(false);
            });
        } catch (error) {
            console.error('Error generating PDF:', error);
            setError('PDF generation failed: ' + error.message);
            setIsGenerating(false);
        }
    };

    return (
        <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
            <h1>मराठी PDF जनरेटर</h1>

            {/* Content to be included in the PDF */}
            <div
                id="pdf-content"
                style={{
                    marginBottom: '20px',
                    padding: '20px',
                    border: '1px solid #ddd',
                    borderRadius: '5px',
                    fontFamily: "'Noto Sans Devanagari', Arial, sans-serif"
                }}
            >
                <h2 style={{ fontFamily: "'Noto Sans Devanagari', sans-serif" }}>मराठी PDF चाचणी</h2>
                <p style={{ fontFamily: "'Noto Sans Devanagari', sans-serif" }}>हे एक मराठी PDF चाचणी दस्तऐवज आहे.</p>
                <p style={{ fontFamily: "'Noto Sans Devanagari', sans-serif" }}>यामध्ये मराठी भाषेतील मजकूर समाविष्ट आहे.</p>
                <p style={{ fontFamily: "'Noto Sans Devanagari', sans-serif" }}>अधिक माहितीसाठी संपर्क करा.</p>
                
                    {data.map(singledata=>(
                        <>
                        <p>{singledata.division.name}  {singledata.schoolUdiseNo.schoolName}</p>
                        <h1>Teacher Name :</h1> <h3>{singledata.staff.fname} {singledata.staff.fname}</h3>
                        </>
                    ))}
               
           
            </div>

            <button
                onClick={generatePdf}
                disabled={isGenerating}
                style={{
                    padding: '10px 15px',
                    fontSize: '16px',
                    backgroundColor: isGenerating ? '#cccccc' : '#4CAF50',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: isGenerating ? 'not-allowed' : 'pointer'
                }}
            >
                {isGenerating ? 'जनरेट होत आहे...' : 'PDF डाउनलोड करा'}
            </button>

            {error && (
                <div style={{ marginTop: '15px', color: 'red' }}>
                    {error}
                </div>
            )}
        </div>

    );
};

export default PdfGenerator;