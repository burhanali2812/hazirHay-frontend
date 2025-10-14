import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import block from "../images/block.png";

function Blocked() {
  const navigate = useNavigate();
  const location = useLocation();
  const rDays = location.state?.days || 0;
  const name = location.state?.name || "User";

  const logOut = () => {
    if (!window.confirm("Are you sure you want to log out?")) return;
    localStorage.clear();
    navigate("/login");
  };

  const requestAdmin = () => {
    alert("Your request has been sent to the admin for review.");
    // 👉 later you can integrate backend request API here
  };

  return (
    <div className="d-flex flex-column justify-content-center align-items-center text-center vh-100 container">
      {/* Image */}
      <img
        src={block}
        alt="Blocked"
        className="img-fluid "
        style={{ width: "230px", height: "230px", objectFit: "contain" }}
      />

      {/* Title */}
      <h3 className="fw-bold text-primary mb-2">Hi, {name}</h3>
      <h5 className="fw-bold text-danger mb-3">Account Temporarily Blocked</h5>

      {/* Message */}
      <p
        className="text-secondary mb-2"
        style={{ maxWidth: "520px", fontSize: "14px", lineHeight: "1.6" }}
      >
        Your account has been temporarily blocked due to exceeding the cancel
        request limit. Please wait until it is automatically restored or request
        instant access by contacting the admin and paying a fine.  <a
        href="/fine-policy"

        style={{ fontSize: "14px" }}
      >
        View Fine Policy
      </a>
      </p>

      {/* Remaining Days */}
      <p className="text-muted mb-3" style={{ fontSize: "14px" }}>
        Access will be restored in{" "}
        <strong className="text-dark">
          {rDays} day{rDays !== 1 && "s"}
        </strong>
        .
      </p>

      {/* Fine Policy Link */}
    

      {/* Buttons */}
      <div className="d-flex gap-3">
        <button
          className="btn btn-outline-primary rounded-pill px-4 py-1"
          onClick={requestAdmin}
        >
          <i className="fa-solid fa-envelope me-2"></i> Request Admin
        </button>
        <button
          className="btn btn-danger rounded-pill px-4 py-1"
          onClick={logOut}
        >
          <i className="fa-solid fa-right-from-bracket me-2"></i> Logout
        </button>
      </div>
    </div>
  );
}

export default Blocked;
