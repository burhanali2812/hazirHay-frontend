import React from 'react';
import { useNavigate } from "react-router-dom";

function Login() {
  const navigate = useNavigate();

  return (
    <div className='container'>
      <i 
        className="fa-solid fa-arrow-left-long mt-3 mx-3" 
        style={{ fontSize: "1.6rem", cursor: "pointer" }} 
        onClick={() => navigate("/")}
      ></i>

    <div style={{marginTop: "85px"}}>
          <h1 className='mt-4 mx-3 fw-bold' style={{letterSpacing: "1px"}}>Let's Sign You In</h1>
      <h3 className='mx-3 fw-bold' style={{color: '#ff6600'}}>Welcome back!</h3>
     <p className='mx-3 '>You've been missed. Let’s get you signed in to continue your journey.</p>
 <div className="form-floating  mx-3 mt-4">
        <input 
          type="email" 
          className="form-control" 
          id="floatingEmail" 
          placeholder="name@example.com"
          style={{width:"99%"}}
        />
        <label htmlFor="floatingEmail">Email address</label>
      </div>

      {/* Floating Password Input */}
      <div className="form-floating mt-3 mx-3">
        <input 
          type="password" 
          className="form-control" 
          id="floatingPassword" 
          placeholder="Password"
          style={{width:"99%"}}
        />
        <label htmlFor="floatingPassword">Password</label>
      </div>
      <div>
        <p className='d-flex justify-content-end mx-3 mt-2  text-secondary' style={{cursor: "pointer"}}>Forgot Password ?</p>
      </div>

      <div class="dropdown">
  <button
    class="btn btn-primary dropdown-toggle mx-3 mt-2"
    type="button"
    id="dropdownMenuButton"
    data-bs-toggle="dropdown"
    aria-expanded="false"
    style={{width:"90%"}}
  >
    Choose Your Role
  </button>

  <ul class="dropdown-menu" aria-labelledby="dropdownMenuButton" style={{width:"90%"}}>
    <li><a class="dropdown-item" href="#">Admin</a></li>
    <li><a class="dropdown-item" href="#">Shop Kepper</a></li>
    <li><a class="dropdown-item" href="#">User</a></li>
  </ul>
</div>
<div style={{marginTop: "50px"}}>
    <p className=' text-center'>Don't have an account? <strong className='text-primary' style={{cursor: "pointer"}}>Register</strong></p>
</div>
<button type='button' className='btn btn-dark rounded mt- mx-3' style={{ width: "90%", height: "45px" }} onClick={()=>navigate("/login")}>
      <i className="fa-solid fa-right-to-bracket me-2"></i>
      Login
    </button>
    </div>

    </div>
  );
}

export default Login;
