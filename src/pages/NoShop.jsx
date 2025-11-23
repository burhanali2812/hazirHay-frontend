import React from "react";
import { useNavigate } from "react-router-dom";

function NoShop() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));
  return (
    <div
      className="d-flex justify-content-center align-items-center"
      style={{ minHeight: "70vh" }}
    >
      <div
        className="card shadow-sm p-4 text-center"
        style={{ maxWidth: "430px", borderRadius: "15px" }}
      >
        <div className="mb-3">
          <i
            className="fas fa-store-slash"
            style={{ fontSize: "50px", color: "#6c757d" }}
          ></i>
        </div>

        <h5 className="fw-bold mb-2">No Shop Registered</h5>

        <p className="text-muted mb-4" style={{ fontSize: "15px" }}>
          You have no shop registered yet, so you cannot get any orders and your
          profile is not visible to any user. <br />
          <strong>Please register your shop.</strong>
        </p>

        <button
          className="btn btn-primary w-100 fw-semibold"
          style={{ borderRadius: "10px" }}
          onClick={() => navigate("/shop", { state: { id: user._id } })}
        >
          <i className="fas fa-plus-circle me-2"></i>
          Get Registered
        </button>
      </div>
    </div>
  );
}

export default NoShop;
