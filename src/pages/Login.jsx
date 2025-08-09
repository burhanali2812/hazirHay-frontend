import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import login from "../images/login.png";
import 'animate.css';
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import axios from "axios";
function Login() {
  const navigate = useNavigate();
  const[role,setRole] = useState("Choose Your Role");
  const[email,setEmail] = useState("");
  const[password,setPassword] = useState("");
  const[loading,setLoading] = useState(false);

const handleLogin = async () => {
  try {
    setLoading(true);
    if (email.trim() === "") {
      toast.warning("Email field cannot be empty!");
      setLoading(false);
      return;
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
      toast.warning("Valid Email is required!");
      setLoading(false);
      return;
    }
    if (password.trim() === "") {
      toast.warning("Password cannot be empty!");
      setLoading(false);
      return;
    }
    if(role === ""){
      toast.warning("Choose a role");
      setLoading(false);
      return;
    }

    // Payload
    const loginPayload = {
      email,
      password,
      role : role.toLowerCase()
    };

    // API request
    const response = await axios.post(
      "https://hazir-hay-backend.vercel.app/admin/",
      loginPayload
    );

    // If login is successful
    if (response.status === 200) {
      toast.success(response.data.message || "Login successful!");
      localStorage.setItem("token", response.data.token);
      localStorage.setItem("user", JSON.stringify(response.data.user));
      setTimeout(()=>{
        navigate("/admin/dashboard")
      }, 1500)
    }
  } catch (error) {
  
    if (error.response) {
      toast.error(error.response.data.message || "Login failed!");
    } else {
      toast.error("Something went wrong! Please try again.");
    }
  } finally {
    setLoading(false);
  }
};

  

  

  return ( 
   
    <div className="container  animate__animated animate__fadeInDown animate__delay-0s">
       <ToastContainer/>
      <i
        className="fa-solid fa-arrow-left-long mt-3 mx-2"
        style={{ fontSize: "1.6rem", cursor: "pointer" }}
        onClick={() => navigate("/")}
      ></i>

      <div style={{ marginTop: "10px" }}>
        <h1 className=" mx-3 fw-bold ">
          Let's Sign You In
        </h1>
        <h3 className="mx-3 fw-bold" style={{ color: "#ff6600" }}>
          Welcome back!
        </h3>
        <p className="mx-3 ">
          You've been missed. Let’s get you signed in to continue your journey.
        </p>
        <div className="text-center animate__animated animate__fadeInLeft">
          <img src={login} style={{ width: "230px", height: "230px" }} />
        </div>
        <div className="form-floating  mx-3  animate__animated animate__fadeInUp">
          <input
            type="email"
            className="form-control"
            id="floatingEmail"
            placeholder="name@example.com"
            value={email}
            style={{ width: "99%" }}
            onChange={(e)=> setEmail(e.target.value)}
          />
          <label htmlFor="floatingEmail">Email address</label>
        </div>

        {/* Floating Password Input */}
        <div className="form-floating mt-3 mx-3 animate__animated animate__fadeInUp">
          <input
            type="password"
            className="form-control"
            id="floatingPassword"
            placeholder="Password"
            value={password}
            onChange={(e)=>setPassword(e.target.value)}
            style={{ width: "99%" }}
          />
          <label htmlFor="floatingPassword">Password</label>
        </div>
        <div>
          <p
            className="d-flex justify-content-end mx-3 mt-2  text-secondary"
            style={{ cursor: "pointer" }}
          >
            Forgot Password ?
          </p>
        </div>

        <div class="dropdown">
          <button
            class="btn btn-primary dropdown-toggle mx-3"
            type="button"
            id="dropdownMenuButton"
            data-bs-toggle="dropdown"
            aria-expanded="false"
            style={{ width: "90%" }}
          >
            {role}
          </button>

          <ul
            class="dropdown-menu"
            aria-labelledby="dropdownMenuButton"
            style={{ width: "90%" }}
          >
            <li>
              <a class="dropdown-item" href="#" onClick={()=>setRole("Admin")}>
                Admin
              </a>
            </li>
            <li>
              <a class="dropdown-item" href="#" onClick={()=>setRole("Shop Kepper")}>
                Shop Kepper
              </a>
            </li>
            <li>
              <a class="dropdown-item" href="#" onClick={()=>setRole("User")}>
                User
              </a>
            </li>
          </ul>
        </div>
        <div style={{ marginTop: "20px" }}>
          <p className=" text-center">
            Don't have an account?{" "}
            <strong className="text-primary" style={{ cursor: "pointer" }}>
              Register
            </strong>
          </p>
        </div>
        <button
          type="button"
          className="btn btn-dark rounded w-90 mx-3 animate__animated animate__fadeInUp  animate__delay-0s"
          style={{ width: "90%", height: "45px" }}
          onClick={handleLogin}
        >
          {loading === false ? (
                    <>
                       <i className="fa-solid fa-right-to-bracket me-2"></i>
          Login
                    </>
                  ) : ( 
                    <>
                      Verifying you...
                      <div
                        className="spinner-border spinner-border-sm text-light ms-2"
                        role="status"
                      ></div>
                    </>
                  )}
         
        </button>
      </div>
    </div>
  );
}

export default Login;
