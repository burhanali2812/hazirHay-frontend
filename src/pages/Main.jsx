import React, { useState, useEffect } from 'react';
import logo2 from "../images/logo5.png";
import 'animate.css';
import { useNavigate} from "react-router-dom";

function Main() {
      const navigate = useNavigate();
      const[registerModal, setRegisterModal] = useState(false)

      const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showInstallButton, setShowInstallButton] = useState(false);

  useEffect(() => {
    const handler = (e) => {
      e.preventDefault(); 
      setDeferredPrompt(e); 
      setShowInstallButton(true); 
    };

    window.addEventListener('beforeinstallprompt', handler);

    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt(); // Show the install prompt
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        console.log('User accepted install');
      } else {
        console.log('User dismissed install');
      }
      setDeferredPrompt(null);
      setShowInstallButton(false);
    }
  };


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
   <div className="container vh-100 d-flex align-items-center justify-content-center ">
  <div className="row align-items-center w-100">
    
    <div className="col-md-6 text-center  mb-md-0">
      <img 
        src={logo2} 
        alt="HazirHay Logo"
        className="img-fluid "
        style={{ maxHeight: "230px" }}
      />
    </div>

  
    <div className="col-md-6 text-center text-md-start ">
      <h1 className="fw-bolder mb-0 " 
        style={{ fontSize: '2.2rem', color: '#001b35'}}>
        WELCOME TO
      </h1>

      <h2 className="fw-bold mt-0 " 
        style={{ fontSize: '1.9rem', color: '#ff6600' }}>
        HAZIRHAY
      </h2>

      <p className="text-muted mt-2 " 
        style={{ fontSize: '1rem' }}>
        Your one-stop solution for doorstep services — Fast, Reliable, and Hassle-Free.
      </p>

      <div className="d-flex flex-column flex-sm-row gap-2 mt-3">
        <button 
          type="button" 
          className="btn btn-dark flex-fill " 
          style={{ height: "45px" }} 
          onClick={() => navigate("/login")}
        >
          <i className="fa-solid fa-right-to-bracket me-2"></i>
          Login
        </button>

        <button 
          type="button" 
          className="btn btn-info flex-fill " 
          style={{ height: "45px" }} 
          onClick={() => setRegisterModal(true)}
        >
          <i className="fa-solid fa-user-plus me-2"></i>
          Register
        </button>
      </div>
      {
        showInstallButton && (
                 <button
          className="btn btn-primary shadow-sm btn-sm"
          onClick={handleInstallClick}
          style={{marginTop : "50px"}}
        >
          <i className="fas fa-download me-2"></i>Install This App
        </button>
        )
      }
      <p className='text-center text-muted' style={{marginTop : showInstallButton ? "5px" : "20px"}}>(v-1.0.3.3)</p>
    </div>

  </div>
</div>

    
    
    {registerModal && (
  <div
    className="modal fade show d-block  "
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
