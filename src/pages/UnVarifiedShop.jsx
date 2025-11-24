import React from "react";
import {toast,Toaster} from "react-hot-toast";
import { useNavigate } from "react-router-dom";
function UnVarifiedShop() {
  const navigate = useNavigate();
    const logOut = () => {
    if (!window.confirm("Are you sure you want to log out?")) return;
    toast.success("Successfully Logout!")
        navigate("/login");
    localStorage.clear();

  };
  return (
  <>
    <Toaster/>
    <div
      className="d-flex justify-content-center align-items-center container"
 style={{ minHeight: "100vh", backgroundColor: "#f8f9fa" }}
    >
      <div
        className="card shadow-lg text-center p-4 bg-light "
        style={{
          maxWidth: "550px",
          borderRadius: "20px",
          border: "1px solid #e0e4e8",
        }}
      >
        <div className="mb-4">
          <i
            className="fas fa-hourglass-half animate-spin"
            style={{ fontSize: "60px", color: "#ffb400" }}
          ></i>
        </div>

        <h3 className="fw-bold mb-3" style={{ color: "#343a40" }}>
          Payment Verification in Process
        </h3>

        <p className="text-muted mb-4" style={{ fontSize: "16px", lineHeight: "1.6" }}>
          Your payment is under review and may take <b>2-3 business days</b> to be approved. 
          <br />
          Once verified, you will receive a confirmation email.
          <br />
          Thank you for your patience. We are committed to providing a professional service and will get back to you shortly.
        </p>

        <button
          className="btn btn-danger  px-4"
          onClick={logOut}
        >
          Log Out
        </button>

        <div className="mt-4 text-center text-secondary" style={{ fontSize: "13px" }}>
          <i className="fas fa-lock me-1"></i>
          Secure and Trusted Platform
        </div>
      </div>
    </div>
  </>
  );
}

export default UnVarifiedShop;
