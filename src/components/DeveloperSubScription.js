import React, { useEffect, useState } from "react";
// 1. Cleaned up imports - removed unused icons
import {
  Lock,
  ArrowLeft,
  Send,
  Check,
  LoaderCircle,
  CalendarDays,
} from "lucide-react";
import apiService from "../services/api.service";
import axios from "axios";
import showAlert from "../services/alert";
import helper from "../services/helper.service";
import { jwtDecode } from "jwt-decode";
import { authService } from "../services/authService";

function DeveloperSubscription() {
  // State for authentication and form data
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const token = sessionStorage.getItem("token");
  const expiryDate = async (token) => {
    const accountExpiryDate = await axios
      .get(`http://localhost:8080/developer/expiry-date-by-name/Developer96`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .catch((err) => {
        console.log(err);
      });
    console.log(accountExpiryDate.data);
    setFormData({ accountExpiryDate: accountExpiryDate.data });
    return accountExpiryDate.data;
  };

  // 2. Corrected formData state to only include the field that is actually in the form
  const [formData, setFormData] = useState({
    accountExpiryDate: "", // Only 'accountExpiryDate' is needed now
    active: true,
  });

  // This function now correctly updates the simplified state
  const handleInputChange = (e) => {
    const { name, value } = e.target;

    if (name === "accountExpiryDate") {
      const selectedDate = new Date(value);
      const today = new Date();
      if (selectedDate <= today) {
        alert("कृपया आजच्या तारखेपेक्षा पुढची तारीख निवडा.");
        return;
      }
    }

    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const DEVELOPER_PASSWORD = "dev123";

  // --- LOGIC ---
  const handlePasswordSubmit = async () => {
    try {
      // First authenticate the user
      const credentials = {
        username: "PulsesAdmin96",
        password: password,
        userType: "DEVELOPER",
      };
      await authService.login("public/authenticate", credentials);
      const token = sessionStorage.getItem("token");
      if (token) {
        const decoded = jwtDecode(token);
        console.log(decoded.name);
        expiryDate(token);
        setIsAuthenticated(true);
      }else {
        setPasswordError("Invalid password. Please try again.");
        setPassword("");
      }
    } catch (err) {
      console.warn(err);
    }
    if (!password) {
      setPasswordError("Please enter a password");
      return;
    }
    setIsLoading(true);
    setPasswordError("");
    // Simulate network delay
    setTimeout(() => {
      if (password === DEVELOPER_PASSWORD) {
        // Switch to the subscription page
      } else {
        setPasswordError("Invalid password. Please try again.");
        setPassword("");
      }
      setIsLoading(false);
    }, 800);
  };

  // 3. Fixed submission logic
  const handleSubscriptionSubmit = async (e) => {
    e.preventDefault();
    // Removed the check for 'terms' as it no longer exists
    if (!formData.accountExpiryDate) {
      alert("Please select a start date.");

      return;
    }
    await axios.put(
      `http://localhost:8080/developer/renew/1/${formData.accountExpiryDate}`,
       {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    // The expiryDate will now be included in the submitted data
    console.log("Submitting form data:", formData);
    const date = await expiryDate();
    showAlert.sweetAlert(
      "Success",
      `Subscription untill ${helper.formatISODateToDMY(date, "/")}`,
      "success"
    );
  };

  const handleGoBackToLogin = () => {
    setIsAuthenticated(false);
    setPassword("");
    setPasswordError("");
  };

  // --- RENDER LOGIC ---
  // If the user is NOT authenticated, show the full-page login form.
  if (!isAuthenticated) {
    return (
      <div
        className="bg-dark text-light min-vh-100 d-flex align-items-center justify-content-center"
        data-bs-theme="dark"
      >
        <div className="col-11 col-sm-8 col-md-6 col-lg-4 col-xl-3">
          <div className="card border-secondary shadow-lg">
            <div className="card-header text-center p-4">
              <Lock size={28} className="text-primary mb-3" />
              <h4 className="card-title fw-bold">Developer Access</h4>
            </div>
            <div className="card-body p-4">
              <p className="text-center text-white-50">
                Enter the password to proceed.
              </p>
              <div className="mb-3">
                <label
                  htmlFor="passwordInput"
                  className="form-label visually-hidden"
                >
                  Password
                </label>
                <input
                  id="passwordInput"
                  type="password"
                  className={`form-control form-control-lg ${
                    passwordError ? "is-invalid" : ""
                  }`}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyPress={(e) =>
                    e.key === "Enter" && handlePasswordSubmit()
                  }
                  placeholder="Password"
                  autoFocus
                />
                {passwordError && (
                  <div className="invalid-feedback mt-2 text-center">
                    {passwordError}
                  </div>
                )}
              </div>

              <button
                className="btn btn-primary btn-lg w-100 mb-3 bg-gradient"
                onClick={handlePasswordSubmit}
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <LoaderCircle
                      size={20}
                      className="me-2 spinner-border spinner-border-sm"
                    />{" "}
                    Validating...
                  </>
                ) : (
                  "Continue"
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // If the user IS authenticated, show the subscription form page.
  return (
    <div className="bg-light">
      <div className="container py-5">
        <div className="row justify-content-center">
          <div className="col-lg-8 col-xl-7">
            <div className="alert alert-success d-flex align-items-center alert-dismissible fade show shadow-sm">
              <Check size={24} className="me-3 flex-shrink-0" />
              <div>
                <strong>Access Granted!</strong> Set the subscription date
                below.
              </div>
              <button
                type="button"
                className="btn-close"
                onClick={handleGoBackToLogin}
              ></button>
            </div>

            <form
              onSubmit={handleSubscriptionSubmit}
              className="card border-0 shadow-lg"
            >
              <div className="card-header bg-primary bg-gradient text-white p-4">
                <h3 className="card-title mb-0 fw-bold">
                  Set Subscription Date
                </h3>
              </div>

              <div className="card-body p-4 p-md-5">
                <div className="row g-3">
                  <div className="col-12">
                    <label
                      htmlFor="accountExpiryDate"
                      className="form-label fw-bold text-muted"
                    >
                      Subscription End Date *
                    </label>
                    <div className="input-group">
                      {/* 4. Corrected Icon */}
                      <span className="input-group-text">
                        <CalendarDays size={18} />
                      </span>
                      <input
                        type="date"
                        id="accountExpiryDate"
                        name="accountExpiryDate"
                        className="form-control"
                        value={formData.accountExpiryDate}
                        required
                        onChange={handleInputChange}
                      />
                    </div>
                  </div>
                </div>

                <hr className="my-4" />

                <div className="d-flex justify-content-between align-items-center">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={handleGoBackToLogin}
                  >
                    <ArrowLeft size={16} className="me-1" /> Back to Login
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary px-4 ms-2 bg-gradient"
                  >
                    <Send size={18} className="me-2" /> Save Date
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DeveloperSubscription;
