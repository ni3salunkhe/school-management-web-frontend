import React, { useEffect, useState } from 'react';
import { AlertCircle, Scan } from 'lucide-react';
import apiService from '../services/api.service';



function ExpirationAlert({ contactNumber = "9889283902", userName = "वापरकर्ता" }) {
  const [data, setData] = useState({});

  useEffect(() => {
    const fetchData = async () => {
      const data = await apiService.getdata(`developer/getPhoneOrQr/1`);
      setData(data.data);
    }
    fetchData();
  }, []);

  return (
    <div className="  bg-opacity-10 d-flex align-items-center justify-content-center p-3">
      <div className="card shadow-lg border-0 w-100" style={{ maxWidth: '500px', }}>
        {/* Gradient top border */}
        <div className="card-header p-0" style={{
          height: '5px',
          background: 'linear-gradient(to right, #dc3545, #fd7e14, #ffc107)'
        }}></div>

        <div className="card-body p-4 p-md-5 text-center">
          {/* QR Code Section */}
          <div className="mb-4 position-relative">
            <div className="d-inline-block position-relative">
              <div className="position-absolute top-0 start-0 w-100 h-100 bg-danger bg-opacity-10 rounded-3 animate-pulse"></div>
              <div className="position-relative bg-gradient bg-danger rounded-3 bg-opacity-10 p-4 shadow">
                {data.qrCode ? (
                  <img
                    src={data.qrCode}
                    alt="QR Code"
                    className="img-fluid rounded"
                    style={{ width: '200px', height: '200px', objectFit: 'contain', border: '2px solid white' }}
                  />
                ) : (
                  <div className="d-flex align-items-center justify-content-center rounded bg-light"
                    style={{ width: '200px', height: '200px', border: '2px solid #dee2e6' }}>
                    <Scan size={40} className="text-secondary" />
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Heading Section */}
          <div className="mb-2">
            <div className="d-flex align-items-center justify-content-center mb-3">
              <div className="bg-danger rounded-circle p-2 me-3 shadow">
                <AlertCircle size={24} className="text-white" />
              </div>
              <h4 className="h3 fw-bold text-danger mb-0">
                प्रवेश मर्यादित आहे
              </h4>
            </div>

            {/* Decorative line */}
            <div className="mx-auto" style={{
              width: '80px',
              height: '3px',
              background: 'linear-gradient(to right, #dc3545, #fd7e14)',
              borderRadius: '3px'
            }}></div>
          </div>

          {/* Message Section */}
          <div className="mb-4">
            <p className="text-muted">
              कृपया सॉफ्टवेअर सेवा पुरवठादाराशी संपर्क साधा. संपर्कासाठी खालील मोबाईल क्रमांक वापरा.
            </p>
          </div>

          {/* Contact Section */}
          <div className="bg-warning bg-opacity-10 border-start border-warning border-4 rounded p-3 mb-4">
            <div className="d-flex align-items-center justify-content-center">
              <span className="fw-semibold text-warning me-2">📞 संपर्क करा:</span>
              <a
                // href={`tel:${contactNumber}`}
                className="text-primary fw-bold fs-5 text-decoration-none hover-underline"
              >
                {data.phone || contactNumber}
              </a>
            </div>
          </div>

          {/* Animated dots */}
          <div className="d-flex justify-content-center">
            {[0, 0.1, 0.2].map((delay, i) => (
              <div key={i} className="rounded-circle bg-danger bg-opacity-50 me-2"
                style={{
                  width: '10px',
                  height: '10px',
                  animation: 'bounce 1s infinite',
                  animationDelay: `${delay}s`
                }}></div>
            ))}
          </div>
        </div>
      </div>

      {/* Add bounce animation */}
      <style>{`
        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        .hover-underline:hover {
          text-decoration: underline !important;
          text-underline-offset: 4px;
        }
        .bg-gradient {
          background-image: var(--bs-gradient);
        }
      `}</style>
    </div>
  );
}

export default ExpirationAlert;