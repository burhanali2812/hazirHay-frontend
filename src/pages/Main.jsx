import React, { useState } from 'react';
import logo2 from "../images/logo5.png";
import 'animate.css';
import { useNavigate} from "react-router-dom";

function Main() {
      const navigate = useNavigate();
      const[registerModal, setRegisterModal] = useState(false)

      const signUpByRole = (role)=>{
        if(role === "service"){
          localStorage.setItem("role", role)
           navigate("/signup")
          return;
        }else{
          localStorage.setItem("role", role)
           navigate("/signup")
        }
      }
  return (

    <>
     <div className='container text-center animate__animated animate__fadeInDown' style={{ marginTop: "130px" }}>
  <div className="py-4 px- animate__animated animate__zoomIn">
    <img 
      src={logo2} 
      alt="HazirHay Logo"
      className='d-block mx-auto mb-3 animate__animated animate__pulse animate__delay-0s ' 
      style={{ height: "230px", width: "230px" }} 
    />

    <h1 className="fw-bolder mb-0 animate__animated animate__fadeInUp" style={{ fontSize: '2.2rem', color: '#001b35', marginTop: "-30px",  fontFamily : "Josefin Sans"}}>
      WELCOME TO
    </h1>

    <h2 className="fw-bold mt-0 animate__animated animate__fadeInUp animate__delay-0s" style={{ fontSize: '1.9rem', color: '#ff6600',  fontFamily : "Josefin Sans" }}>
      HAZIRHAY
    </h2>

    <p className='text-muted mt-2 text-center animate__animated animate__fadeIn animate__delay-0s' style={{ fontSize: '1rem' }}>
      Your one-stop solution for doorstep services — Fast, Reliable, and Hassle-Free.
    </p>

    <button type='button' className='btn btn-dark rounded mt-2 animate__animated animate__fadeInUp animate__delay-1s' style={{ width: "90%", height: "45px" }} onClick={()=>navigate("/login")}>
      <i className="fa-solid fa-right-to-bracket me-2"></i>
      Login
    </button>

    <button type='button' className='btn btn-info rounded mt-2 animate__animated animate__fadeInUp animate__delay-1s' style={{ width: "90%", height: "45px" }} onClick={()=>setRegisterModal(true)}>
      <i className="fa-solid fa-user-plus me-2"></i>
      Register
    </button>
  </div>

    
</div>
    
    
    {registerModal && (
  <div
    className="modal fade show d-block animate__animated animate__fadeIn "
    tabIndex="-1"
    style={{
      backgroundColor: "rgba(0, 0, 0, 0.6)",
      backdropFilter: "blur(0px)",
    }}
  >
    <div className="modal-dialog modal-sm modal-dialog-centered">
      <div
        className="modal-content shadow"
        style={{ borderRadius: "10px" }}
      >
        {/* Header */}
        <div
          className="modal-header text-light py-2 px-3"
          style={{ backgroundColor: "#1e1e2f" }}
        >
          <h6 className="modal-title m-0">Choose Your Role</h6>
          <button
            type="button"
            className="btn-close btn-close-white"
            aria-label="Close"
            onClick={() => setRegisterModal(false)}
          ></button>
        </div>

        {/* Body */}
        <div className="modal-body text-center">
        <p className="mb-3">
  Are you here to <strong>offer services</strong> or <strong>find one</strong>?
</p>

          
          <button
            className="btn btn-primary w-100 mb-2"
            onClick={()=>signUpByRole("service")}
          >
            <i className="fa-solid fa-screwdriver-wrench me-2"></i>
            I’m a Service Provider
          </button>

          <button
            className="btn btn-primary w-100"
            onClick={() => {
              signUpByRole("user");
            }}
          >
            <i className="fa-solid fa-user me-2"></i>
            I’m a User
          </button>
        </div>
      </div>
    </div>
  </div>
)}

    </>
 

  );
}

export default Main;
