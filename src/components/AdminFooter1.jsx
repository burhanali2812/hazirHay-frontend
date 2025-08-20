import React, { useState } from "react";
import { useNavigate, Outlet } from "react-router-dom";
import "./adminFooter.css";

function AdminFooter1({ topText }) {
  const navigate = useNavigate();
  const [active, setActive] = useState(localStorage.getItem("key") || "home");
  const [showOffcanvas, setShowOffcanvas] = useState(false);
  const currentUser = JSON.parse(localStorage.getItem("user"));
  const role = localStorage.getItem("role");

  const handleClick = (key, action) => {
    localStorage.setItem("key", key);
    setActive(key);
    action();
    console.log("curent", role);
  };

  const logOut = () => {
    if (!window.confirm("Are you sure you want to log out?")) return;
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("key");
    navigate("/login");
  };

  return (
    <>
      <div className="admin-header fixed-top">
        <div className="d-flex align-items-center gap-2">
          <div className="icon-btn bg-primary" onClick={() => navigate(-1)}>
            <i className="fa-solid fa-arrow-left text-white"></i>
          </div>
          <h1 className="header-title">{topText}</h1>
        </div>

        <div className="d-flex gap-2">
          <div
            className="icon-btn bg-secondary"
            onClick={() => navigate("/driver/dashboard")}
          >
            <i className="fa-solid fa-home text-white"></i>
          </div>
          <div className="icon-btn bg-secondary" onClick={() => navigate(0)}>
            <i className="fa-solid fa-bell text-white"></i>
          </div>
          <div className="icon-btn bg-danger" onClick={logOut}>
            <i className="fa-solid fa-right-from-bracket text-white"></i>
          </div>
        </div>
      </div>

      <div className="admin-footer card fixed-bottom">
        <div className="card-body d-flex justify-content-around p-2">
          <span
            className={`nav-item ${active === "home" ? "active" : ""}`}
            onClick={() =>
              handleClick("home", () => navigate("/admin/dashboard"))
            }
          >
            <i className="fas fa-home"></i>
            <small>Home</small>
          </span>

          <span
            className={`nav-item ${active === "requests" ? "active" : ""}`}
            onClick={() =>
              handleClick("requests", () => navigate("/admin/requests"))
            }
          >
            <i className="fas fa-envelope-open-text"></i>
            <small>Requests</small>
          </span>

          <span
            className={`nav-item ${active === "complaints" ? "active" : ""}`}
            onClick={() => handleClick("complaints", () => alert("Complaints"))}
          >
            <i className="fas fa-frown"></i>
            <small>Complaints</small>
          </span>

          <span
            className={`nav-item ${active === "setting" ? "active" : ""}`}
            onClick={() => handleClick("setting", () => setShowOffcanvas(true))}
          >
            <i className="fa-solid fa-ellipsis-vertical"></i>
            <small>More</small>
          </span>
        </div>
      </div>

      <div className="admin-content">
        <Outlet />
      </div>

      <div className={`custom-offcanvas ${showOffcanvas ? "show" : ""}`}>
        <div className="offcanvas-header">
          <button
            type="button"
            className="btn-close"
            aria-label="Close"
            onClick={() => setShowOffcanvas(false)}
          ></button>
          <h5 className="mb-0 ms-2 mt-1">Settings</h5>
        </div>
        <div className="offcanvas-body">
          
          <div className="d-flex justify-content-center mt-4">
            <div
              style={{
                width: "90px",
                height: "90px",
                borderRadius: "50%",
                overflow: "hidden",
                border: "2px solid #ddd",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: "#f8f9fa",
              }}
            >
              {currentUser.profilePicture ? (
                <img
                  src={currentUser.profilePicture}
                  alt="Profile Preview"
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                  }}
                />
              ) : (
                <i
                  className="fa-solid fa-user"
                  style={{ fontSize: "40px", color: "#aaa" }}
                ></i>
              )}
            </div>
          </div>

          {role === "user" ||
            (role === "Admin" && (
              <>
                <div className="d-flex justify-content-center align-items-center">
                  <h5 className="fw-bold mt-2 mb-0">{currentUser?.name}</h5>
                  <i
                    class="fa-solid fa-circle-check ms-1 mt-2"
                    style={{ color: "#28a745", fontSize: "18px" }}
                  ></i>
                </div>
                <div className="d-flex justify-content-center">
                  <span
                    className="badge rounded-pill bg-primary"
                  
                  >
                    {role === "User" ? (
                      <>
                        <i className="fa-solid fa-user small ms-2"></i>User
                      </>
                    ) : (
                      <>
                        <i class="fa-solid fa-user-shield ms-2"></i> Admin
                      </>
                    )}
                  </span>
                </div>
              </>
            ))}

          {role === "Service Provider" && (
            <>
              <div className="d-flex justify-content-center align-items-center">
                <h5 className="fw-bold mb-0">{currentUser?.name}</h5>
                <i
                  class={`${
                    currentUser.isVerified
                      ? "fa-solid fa-circle-check"
                      : "fa-solid fa-circle-xmark "
                  } ms-1`}
                  style={{
                    color: currentUser.isVerified ? "#28a745" : "#dc3545",
                    fontSize: "18px",
                  }}
                ></i>
              </div>
              <div className="d-flex justify-content-center">
                <span
                  className="badge rounded-pill bg-primary"
                  
                >
                      <i class="fa-solid fa-user-tie ms-2"></i> Service Provider
                   
                </span>
              </div>
            </>
          )}
        </div>
      </div>

      {showOffcanvas && (
        <div
          className="offcanvas-backdrop fade show"
          onClick={() => setShowOffcanvas(false)}
        ></div>
      )}
    </>
  );
}

export default AdminFooter1;
