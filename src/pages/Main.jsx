import React, { useState, useEffect } from 'react';
import logo2 from "../images/logo5.png";
import 'animate.css';
import { useNavigate} from "react-router-dom";
import { useAppContext } from '../context/AppContext';
function Main() {
      const navigate = useNavigate();
      const {setMethod} = useAppContext();

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
           onClick={()=> {setMethod("login");   navigate("/roles")}}
        >
          <i className="fa-solid fa-right-to-bracket me-2"></i>
          Login
        </button>

        <button 
          type="button" 
          className="btn btn-info flex-fill " 
          style={{ height: "45px" }} 
          onClick={()=> {setMethod("register"); navigate("/roles")}}
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

    

    </>
 

  );
}

export default Main;
