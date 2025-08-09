import React from 'react';
import logo2 from "../images/logo5.png";
import 'animate.css';
import { useNavigate} from "react-router-dom";

function Main() {
      const navigate = useNavigate();
  return (
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

    <button type='button' className='btn btn-info rounded mt-2 animate__animated animate__fadeInUp animate__delay-1s' style={{ width: "90%", height: "45px" }}>
      <i className="fa-solid fa-user-plus me-2"></i>
      Register
    </button>
  </div>
</div>

  );
}

export default Main;
