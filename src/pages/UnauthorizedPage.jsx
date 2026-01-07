import React from "react";
import { useNavigate } from "react-router-dom";
const UnauthorizedPage = () => {
  const navigate = useNavigate();
  return (
  <div className="container">
      <div
      className="d-flex justify-content-center align-items-center"
      style={{
        height: "100vh",
        background: "linear-gradient(135deg, #f5f7fa, #e3e8ee)"
      }}
    >
      <div
        className="text-center p-5 rounded-4 shadow-lg"
        style={{
          background: "white",
          width: "100%",
          maxWidth: "420px",
        }}
      >
        <div
          className="rounded-circle d-flex justify-content-center align-items-center mx-auto mb-4"
          style={{
            width: "70px",
            height: "70px",
            background: "#ffe8e8"
          }}
        >
          <i
            className="fa-solid fa-lock"
            style={{ fontSize: "30px", color: "#d9534f" }}
          ></i>
        </div>

        <h2 className="fw-bold mb-2" style={{ color: "#333" }}>
          Unauthorized Access
        </h2>

        <p className="text-muted mb-4" style={{ lineHeight: "1.6" }}>
          You don’t have permission to view this page.
          <br /> Please return to the previous screen.
        </p>

        <button
          className="btn btn-dark px-4 py-2 rounded-3"
          style={{ fontSize: "15px" }}
          onClick={() => navigate("/login")}
        >
          Login Again
        </button>
      </div>
    </div>
  </div>
  );
};

export default UnauthorizedPage;
