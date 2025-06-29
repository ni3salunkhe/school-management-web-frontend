import React, { useEffect, useState } from "react";
import { Routes, Route, useLocation, useNavigate } from "react-router-dom";
import Login from "./pages/Login";
import HeadmasterDashboard from "./pages/HeadmasterDashboard";
import TeacherDashboard from "./pages/TeacherDashboard";
import ClerkDashboard from "./pages/ClerkDashboard";
import ProtectedRoute from "./components/ProtectedRoute";
import "bootstrap/dist/css/bootstrap.min.css";
import Layout from "./components/Layout";
import Developer from "./pages/Developer";
import Account from "./modules/Account";
import { authService } from "./services/authService";
import { jwtDecode } from "jwt-decode";
import { getSidebarItems } from "./utils/SidebarConfig";
import ExpirationAlert from "./components/ExpirationAlert";
import DeveloperSubscription from "./components/DeveloperSubScription";
import apiService from "./services/api.service";

function NavigationBlocker() {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const token = sessionStorage.getItem("token");
    const isLoginPage = location.pathname === "/";

    // If we're on login page and there's no token, prevent back navigation
    if (
      isLoginPage &&
      (!token || typeof token !== "string" || token.trim() === "")
    ) {
      // Add a state to history to prevent going back to protected routes
      window.history.pushState(null, null, window.location.pathname);

      const handlePopState = (event) => {
        // Prevent going back from login page when not authenticated
        window.history.pushState(null, null, window.location.pathname);
      };

      window.addEventListener("popstate", handlePopState);

      return () => {
        window.removeEventListener("popstate", handlePopState);
      };
    }

    // Handle link clicks on login page
    const handleLinkClick = (e) => {
      const link = e.target.closest("a");
      if (link && link.href && isLoginPage) {
        const targetPath = new URL(link.href).pathname;
        if (targetPath !== "/") {
          e.preventDefault();
          alert("Navigation from root is blocked.");
        }
      }
    };

    document.addEventListener("click", handleLinkClick);

    return () => {
      document.removeEventListener("click", handleLinkClick);
    };
  }, [location.pathname, navigate]);

  return null;
}

function App() {
  const location = useLocation();
  const navigate = useNavigate();
  const [components, setComponents] = useState([]);
  useEffect(() => {
    const checkAndRedirect = async () => {
      const authenticated = authService.isAuthenticated();
      const hasToken = sessionStorage.getItem("token");
      const isLoginPage = location.pathname === "/";
      const isValidSubscription =
        await authService.checkDeveloperSubscription();
      console.log(isValidSubscription);

      // If user is NOT authenticated and NOT on login page, redirect to login
      if ((!authenticated || !hasToken) && !isLoginPage) {
        navigate("/", { replace: true });
        return;
      }
      const token = sessionStorage.getItem("token");
      if (!token || typeof token !== "string" || token.trim() === "") {
        sessionStorage.removeItem("token");
        navigate("/", { replace: true });
        return;
      }
      const decodedToken = jwtDecode(token);
      const modules = await fetchModules(decodedToken.udiseNo);
      const userRoleDev=decodedToken.role
      // Optional: If you want to check if subscription is valid here
      if ((!modules || modules.length === 0) && userRoleDev !== "DEVELOPER") {
        navigate("/expiry", { replace: true });
        return;
      } else {
        const moduleNames = modules
          .map((item) => item.moduleId?.moduleName)
          .filter(Boolean);
        setComponents(moduleNames);
      }

      // If user IS authenticated and IS on login page, redirect to appropriate dashboard
      if (authenticated && hasToken && isLoginPage && !isValidSubscription) {
        try {
          const userRole = decodedToken.role || decodedToken.authorities?.[0];
          // Redirect based on role
          switch (userRole) {
            case "DEVELOPER":
              navigate("/developer", { replace: true });
              break;
            case "HEADMASTER":
              navigate("/headmaster", { replace: true });
              break;
            case "CLERK":
              navigate("/clerk", { replace: true });
              break;
            case "TEACHER":
              navigate("/teacher", { replace: true });
              break;
            default:
              // If role is unknown, stay on login page or handle as needed
              console.warn("Unknown user role:", userRole);
              break;
          }
        } catch (error) {
          console.error("Error decoding token:", error);
          // If token is invalid, clear it and stay on login
          sessionStorage.removeItem("token");
        }
      }
    };
    checkAndRedirect();
  }, [location.pathname, navigate]);

  const fetchModules = async (udiseNo) => {
    try {
      const response = await apiService.getdata(
        `api/subscription/modules/${udiseNo}`
      );
      console.log("Modules:", response.data);
      return response.data;
    } catch (err) {
      console.error("Failed to fetch modules:", err);
      return [];
    }
  };

  const isLoginPage =
    location.pathname === "/" ||
    location.pathname === "/developer-subscription" ||
    location.pathname === "/expiry";

  console.log(components);

  const componentMap = components; // dynamically from backend
  console.log(componentMap);
  
  const { sidebarItemsHm, sidebarItemsClerk, sidebarItemsTeacher } =
    getSidebarItems(componentMap);

  return (
    <div>
      {!isLoginPage && <div style={{ minHeight: "45px" }}></div>}

      <NavigationBlocker />
      <Routes>
        <Route path="/" element={<Login />} />
        <Route
          path="/developer-subscription"
          element={<DeveloperSubscription />}
        />
        <Route path="/expiry" element={<ExpirationAlert />} />
        <Route
          path="/developer/*"
          element={
            <ProtectedRoute allowedRoles={["DEVELOPER"]}>
              <Layout role="DEVELOPER" sidebarItems={sidebarItemsHm}>
                <Developer />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/headmaster/*"
          element={
            <ProtectedRoute allowedRoles={["HEADMASTER"]}>
              <Layout role="headmaster" sidebarItems={sidebarItemsHm}>
                <HeadmasterDashboard
                  componentMap={componentMap}
                  role="HEADMASTER"
                />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/clerk/*"
          element={
            <ProtectedRoute allowedRoles={["CLERK"]}>
              <Layout role="clerk" sidebarItems={sidebarItemsClerk}>
                <ClerkDashboard componentMap={componentMap} role="CLERK" />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/teacher/*"
          element={
            <ProtectedRoute allowedRoles={["TEACHER"]}>
              <Layout role="teacher" sidebarItems={sidebarItemsTeacher}>
                <TeacherDashboard componentMap={componentMap} role="TEACHER" />
              </Layout>
            </ProtectedRoute>
          }
        />
      </Routes>
    </div>
  );
}

export default App;
