import React, { useState } from "react";
import { useNavigate, Outlet } from "react-router-dom";
import "./adminFooter.css";

function AdminFooter1({ topText }) {
  const navigate = useNavigate();
  const [active, setActive] = useState("home");
  const [showOffcanvas, setShowOffcanvas] = useState(false);

  const handleClick = (key, action) => {
    setActive(key);
    action();
  };

  const logOut = () => {
    const confirm = window.confirm("Are you sure to log out?");
    if (!confirm) {
      return;
    }
    localStorage.removeItem("token"); // or whatever key stores your auth
    localStorage.removeItem("user");
    navigate("/login");
  };

  return (
    <>
      <div
        className="fixed-top border-bottom border-secondary bg-white d-flex align-items-center justify-content-between px-3"
        style={{ height: "55px", zIndex: 1030 }}
      >
        {/* Back Button */}
        <div className="d-flex align-items-center gap-2">
          <div
            className="bg-primary d-flex align-items-center justify-content-center rounded-circle"
            style={{ width: "35px", height: "35px", cursor: "pointer" }}
            onClick={() => navigate(-1)}
          >
            <i className="fa-solid fa-arrow-left text-white"></i>
          </div>
          <h1
            className="m-0 fw-semibold mt-1"
            style={{ fontSize: "1.25rem", color: "#ff6600" }}
          >
            {topText}
          </h1>
        </div>

        {/* Right Actions */}
        <div className="d-flex gap-2">
          {/* Home */}
          <div
            className="bg-primary d-flex align-items-center justify-content-center rounded-circle"
            style={{ width: "35px", height: "35px", cursor: "pointer" }}
            onClick={() => navigate("/driver/dashboard")}
          >
            <i className="fa-solid fa-home text-white"></i>
          </div>

          {/* Refresh */}
          <div
            className="bg-primary d-flex align-items-center justify-content-center rounded-circle"
            style={{ width: "35px", height: "35px", cursor: "pointer" }}
            onClick={() => navigate(0)}
          >
            <i className="fa-solid fa-rotate text-white"></i>
          </div>

          {/* Logout */}
          <div
            className="bg-primary d-flex align-items-center justify-content-center rounded-circle"
            style={{ width: "35px", height: "35px", cursor: "pointer" }}
            onClick={logOut}
          >
            <i className="fa-solid fa-right-from-bracket text-white"></i>
          </div>
        </div>
      </div>

      <div
        className="card fixed-bottom border-0 rounded-0 border-top border-secondary"
        style={{
          background: "white",
          zIndex: 1030,
        }}
      >
        <div className="card-body d-flex  p-2">
          <span
            className={`text-center flex-fill ${
              active === "home" ? "text-primary zoom" : "text-secondary"
            }`}
            onClick={() =>
              handleClick("home", () => navigate("/admin/dashboard"))
            }
          >
            <i className="fas fa-home d-block mb-0 mt-2"></i>
            <small>Home</small>
          </span>

          <span
            className={`text-center flex-fill ${
              active === "requests" ? "text-primary zoom" : "text-secondary"
            }`}
            onClick={() =>
              handleClick("requests", () => navigate("/admin/requests"))
            }
          >
            <i className="fas fa-envelope-open-text d-block mb-0 mt-2"></i>
            <small>Requests</small>
          </span>
          <span
            className={`text-center flex-fill ${
              active === "complaints" ? "text-primary zoom" : "text-secondary"
            }`}
            onClick={() => handleClick("complaints", () => alert("Complaints"))}
          >
            <i className="fas fa-frown d-block mb-0 mt-2"></i>

            <small>Complaints</small>
          </span>

          <span
            className={`text-center flex-fill ${
              active === "setting" ? "text-primary zoom" : "text-secondary"
            }`}
            onClick={() => handleClick("setting", () => setShowOffcanvas(true))}
          >
            <i className="fas fa-cog d-block mb-0 mt-2"></i>
            <small>Setting</small>
          </span>
        </div>
      </div>

      <div style={{ paddingTop: "70px", paddingBottom: "80px" }}>
        <Outlet />
      </div>

      <div className="container mt-5">
        <div
          className={`offcanvas offcanvas-end custom-offcanvas ${
            showOffcanvas ? "show" : ""
          }`}
          tabIndex="-1"
           style={{
    visibility: showOffcanvas ? "visible" : "hidden",
    transition: "transform 0.8s ease-in-out",
    transform: showOffcanvas ? "translateX(0)" : "translateX(100%)"
  }}
        >
          <div
            className="offcanvas-header d-flex align-items-center"
            style={{ marginRight: "125px" }}
          >
            <button
              type="button"
              className="btn-close me-2"
              aria-label="Close"
              onClick={() => setShowOffcanvas(false)}
            ></button>
            <h5 className="offcanvas-title mb-0">Setting</h5>
          </div>

          <div className="offcanvas-body">
            <p>This is an empty offcanvas. Add your content here.</p>
          </div>
        </div>

        {showOffcanvas && (
          <div
            className="offcanvas-backdrop fade show"
            onClick={() => setShowOffcanvas(false)}
          ></div>
        )}
      </div>
    </>
  );
}

export default AdminFooter1;
