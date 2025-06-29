import React, { useState, useEffect } from 'react';
import { Plus, DollarSign, CreditCard, Building, FileText, TrendingUp, Settings } from 'lucide-react';
import { Link } from 'react-router-dom';
import apiService from '../../services/api.service';

const Dashboard = () => {
  const [creditAmount, setCreditAmount] = useState(5000);
  const [debitAmount, setDebitAmount] = useState(5000);

  useEffect(() => {
    const fetchSumofCrDr = async () => {
      const response = await apiService.getdata(`openingbal/sum`);
      setCreditAmount(response.data.totalCr);
      setDebitAmount(response.data.totalDr);
    };

    fetchSumofCrDr();
  }, [creditAmount, debitAmount]);

  const quickActions = [
    {
      to: "cash-receipt",
      icon: <DollarSign size={20} />,
      text: "कॅश पावती तयार करा",
      color: "text-primary",
      bgColor: "bg-primary-subtle"
    },
    {
      to: "cash-payment",
      icon: <DollarSign size={20} />,
      text: "कॅश पेमेंट तयार करा",
      color: "text-success",
      bgColor: "bg-success-subtle"
    },
    {
      to: "bank-receipt",
      icon: <Building size={20} />,
      text: "बँक पावती तयार करा",
      color: "text-info",
      bgColor: "bg-info-subtle"
    },
    {
      to: "bank-payment",
      icon: <Building size={20} />,
      text: "बँक पेमेंट तयार करा",
      color: "text-warning",
      bgColor: "bg-warning-subtle"
    },
    {
      to: "contra-payment",
      icon: <CreditCard size={20} />,
      text: "कॉण्ट्रा पेमेंट तयार करा",
      color: "text-danger",
      bgColor: "bg-danger-subtle"
    },
    {
      to: "journal",
      icon: <FileText size={20} />,
      text: "जर्नल व्हाउचर तयार करा",
      color: "text-info",
      bgColor: "bg-info-subtle"
    },
    {
      to: "expense",
      icon: <TrendingUp size={20} />,
      text: "खर्चाची नोंद करा",
      color: "text-purple",
      bgColor: "bg-light"
    }
  ];

  return (
    <div className="container-fluid bg-light min-vh-100 py-4">
      <div className="container">
        {/* Header */}
        <div className="row mb-4">
          <div className="col-12">
            <div className="d-flex align-items-center justify-content-between flex-wrap">
              <div>
                <h1 className="display-6 fw-bold text-primary mb-2">
                  <i className="bi bi-speedometer2 me-2"></i>
                  लेखा डॅशबोर्ड
                </h1>
                <p className="lead text-muted mb-0">शाळा व्यवस्थापन प्रणाली</p>
              </div>
            </div>
          </div>
        </div>

        {/* Balance Status */}
        <div className="row mb-4">
          <div className="col-12">
            {(creditAmount === debitAmount) && (creditAmount > 0 && debitAmount > 0) ? (
              <div className="alert alert-success d-flex align-items-center shadow-sm border-0" role="alert">
                <div className="alert-icon me-3">
                  <i className="bi bi-check-circle-fill fs-4"></i>
                </div>
                <div className="flex-grow-1">
                  <h6 className="alert-heading mb-1">खाते संतुलित आहे</h6>
                  <small className="mb-0">क्रेडिट: ₹{creditAmount.toLocaleString('en-IN')} | डेबिट: ₹{debitAmount.toLocaleString('en-IN')}</small>
                </div>
              </div>
            ) : (
              <div className="alert alert-warning d-flex align-items-center shadow-sm border-0" role="alert">
                <div className="alert-icon me-3">
                  <i className="bi bi-exclamation-triangle-fill fs-4"></i>
                </div>
                <div className="flex-grow-1">
                  <h6 className="alert-heading mb-1">संतुलन आवश्यक आहे</h6>
                  <small className="mb-0">कृपया क्रेडिट आणि डेबिट रक्कम संतुलित करा</small>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="row">
          <div className="col-12">
            <div className="card shadow-sm border-0 h-100">
              <div className="card-header bg-white border-bottom">
                <div className="d-flex align-items-center justify-content-between">
                  <h5 className="card-title mb-0 d-flex align-items-center">
                    <i className="bi bi-lightning-charge-fill text-warning me-2"></i>
                    जलद क्रिया
                  </h5>
                  <span className="badge bg-light text-dark">
                    {creditAmount === debitAmount && (creditAmount > 0 && debitAmount > 0) ? 'Ready' : 'Locked'}
                  </span>
                </div>
              </div>

              <div className="card-body p-4">
                {creditAmount === debitAmount && (creditAmount > 0 && debitAmount > 0) ? (
                  <div className="row g-3">
                    {quickActions.map((action, index) => (
                      <div key={index} className="col-12 col-sm-6 col-lg-4">
                        <Link to={action.to} className="text-decoration-none">
                          <div className="card h-100 border-0 shadow-sm action-card position-relative overflow-hidden">
                            <div className="card-body d-flex align-items-center p-3">
                              <div className={`rounded-circle p-2 me-3 ${action.bgColor}`}>
                                <span className={action.color}>
                                  {action.icon}
                                </span>
                              </div>
                              <div className="flex-grow-1">
                                <h6 className="card-title mb-0 text-dark">
                                  {action.text}
                                </h6>
                              </div>
                              <div className="ms-2">
                                <i className="bi bi-arrow-right text-muted"></i>
                              </div>
                            </div>
                            <div className="position-absolute top-0 end-0 w-100 h-100 opacity-0 bg-primary transition-opacity"></div>
                          </div>
                        </Link>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div>कृपया आधी क्रेडिट व डेबिट रक्कम संतुलित करा</div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .action-card {
          transition: all 0.3s ease;
          cursor: pointer;
        }

        .action-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.15) !important;
        }

        .action-card:hover .position-absolute {
          opacity: 0.05;
        }

        .transition-opacity {
          transition: opacity 0.3s ease;
        }

        .text-purple {
          color: #6f42c1 !important;
        }

        .bg-primary-subtle {
          background-color: rgba(13, 110, 253, 0.1) !important;
        }

        .bg-success-subtle {
          background-color: rgba(25, 135, 84, 0.1) !important;
        }

        .bg-info-subtle {
          background-color: rgba(13, 202, 240, 0.1) !important;
        }

        .bg-warning-subtle {
          background-color: rgba(255, 193, 7, 0.1) !important;
        }

        .bg-danger-subtle {
          background-color: rgba(220, 53, 69, 0.1) !important;
        }

        @media (max-width: 576px) {
          .display-6 {
            font-size: 1.75rem;
          }

          .lead {
            font-size: 1rem;
          }
        }
      `}</style>
    </div>
  );
};

export default Dashboard;
