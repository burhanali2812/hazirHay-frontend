import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import block from "../images/block.png";

function Blocked() {
  const navigate = useNavigate();
  const location = useLocation();
  const rDays = location.state?.days || 0;

  const logOut = () => {
    if (!window.confirm("Are you sure you want to log out?")) return;
    localStorage.clear();
    navigate("/login");
  };

  return (
    <div
      className="d-flex flex-column justify-content-center align-items-center text-center vh-100"
      style={{
        background: "linear-gradient(135deg, #f3f0ff, #e6e0ff, #faf9ff)",
        padding: "20px",
      }}
    >
      {/* Image */}
      <img
        src={block}
        alt="Blocked"
        className="img-fluid "
        style={{ width: "250px", height: "250px", objectFit: "contain" }}
      />

      {/* Title */}
      <h5 className="fw-bold text-danger mb-3">
        <i className="fa-solid fa-lock me-2"></i> Account Temporarily Blocked
      </h5>

      {/* Message */}
      <p
        className="text-secondary mb-2"
        style={{
          maxWidth: "500px",
          fontSize: "14px",
          lineHeight: "1.6",
        }}
      >
        Your account has been temporarily blocked due to exceeding the cancel
        request limit. Please wait until your account is automatically restored.
      </p>

      {/* Remaining Days */}
      <p className="text-muted mb-4" style={{ fontSize: "14px" }}>
        Access will be restored in{" "}
        <strong className="text-dark">
          {rDays} day{rDays !== 1 && "s"}
        </strong>
        .
      </p>

      {/* Logout Button */}
      <button
        className="btn btn-outline-danger rounded-pill px-4 py-2"
        onClick={logOut}
      >
        <i className="fa-solid fa-right-from-bracket me-2"></i> Logout
      </button>
    </div>
  );
}

export default Blocked;
