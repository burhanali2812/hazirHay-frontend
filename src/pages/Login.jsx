import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import login from "../images/login.png";
import "react-toastify/dist/ReactToastify.css";
import axios from "axios";
import Swal from "sweetalert2";
import "../components/adminFooter.css";
import { checkBlockedStatus } from "../components/loginCheckBlocked";
import {toast, Toaster} from "react-hot-toast"
function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [isChecked, setIsChecked] = useState(false);
  const role = localStorage.getItem("role");

  const handleLogin = async () => {
    try {
      setLoading(true);
      if (email.trim() === "") {
        toast.error("Email field cannot be empty!");
        setLoading(false);
        return;
      }
      const isEmail = /\S+@\S+\.\S+/.test(email);
const isPhone = /^\d{10,15}$/.test(email); 
if (!isEmail && !isPhone) {
  toast.error("Please enter a valid email or phone number!");
  setLoading(false);
  return;
}
      if (password.trim() === "") {
        toast.error("Password cannot be empty!");
        setLoading(false);
        return;
      }
      if(role === null){
         toast.error("Select the role from privious screen");
        setLoading(false);
        return;
      }
   

      const loginPayload = {
        email,
        password,
        role,
      };

      console.log(loginPayload);

      const response = await axios.post(
        "https://hazir-hay-backend.vercel.app/admin/",
        loginPayload
      );
      if (response.status === 200) {
        toast.success("Successfully login!")
        const role = response.data.role

        localStorage.setItem("token", response.data.token);
        localStorage.setItem("user", JSON.stringify(response.data.user));
        localStorage.setItem("role", role)


        if (role === "shopKepper") {
          const notBlocked = await checkBlockedStatus(
            response.data.token,
            navigate,
            response.data.user.name
          );
          if (!notBlocked) return;
          setTimeout(() => {
            navigate("/admin/shopKepper/dashboard");
          }, 800);
        }
        if (role === "user") {
          setTimeout(() => {
            navigate("/admin/user/dashboard");
          }, 800);
        } else if (role === "admin") {
          setTimeout(() => {
            navigate("/admin/dashboard");
          }, 800);
        } else if (role === "worker") {
          setTimeout(() => {
            navigate("/worker/dashboard");
          }, 800);
        }
        else if (role === "shop") {
          setTimeout(() => {
            navigate("/localShop/dashboard");
          }, 800);
        }
      }
    } catch (error) {
      if (error.response) {

        toast.error(error.response.data.message || "Login failed!")
      } 
    } finally {
      setLoading(false);
    }
  };

  return (
 <>
  <Toaster />

  {/* Back Button */}
  <div
    className="position-absolute"
    style={{ top: "15px", left: "15px", zIndex: 1000 }}
  >
    <i
      className="fa-solid fa-arrow-left-long"
      style={{ fontSize: "1.6rem", cursor: "pointer", color: "#333" }}
      onClick={() => {navigate("/roles"); localStorage.clear()}}
    ></i>
  </div>

  <div className="container vh-100 d-flex justify-content-center align-items-center">
    <div className="row justify-content-center w-100">
      <div className="col-12 col-md-8 col-lg-6">
        <h2 className="fw-bold">Let's Sign You In</h2>
        <h4 className="fw-bold" style={{ color: "#ff6600" }}>Welcome back!</h4>
        <p>You've been missed. Let’s get you signed in to continue your journey.</p>

        <div className="text-center mb-4">
          <img
            src={login}
            alt="Login"
            className="img-fluid"
            style={{ maxWidth: "180px" }}
          />
        </div>

        {/* Email */}
        <div className="form-floating mb-3">
          <input
            type="email"
            className="form-control"
            id="floatingEmail"
            placeholder="name@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <label htmlFor="floatingEmail">Email address</label>
        </div>

        {/* Password */}
        <div className="form-floating mb-2">
          <input
            type={isChecked ? "text" : "password"}
            className="form-control"
            id="floatingPassword"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <label htmlFor="floatingPassword">Password</label>
        </div>

        <div className="d-flex justify-content-between align-items-center mb-3">
          <div className="form-check m-0">
            <input
              type="checkbox"
              className="form-check-input"
              id="exampleCheck"
              checked={isChecked}
              onChange={(e) => setIsChecked(e.target.checked)}
            />
            <label className="form-check-label" htmlFor="exampleCheck">
              Show Password
            </label>
          </div>
          <p className="m-0 text-secondary" style={{ cursor: "pointer" }}>
            Forgot Password?
          </p>
        </div>

        <p className="text-center">
          Don't have an account?{" "}
          <strong
            className="text-primary"
            style={{ cursor: "pointer" }}
            onClick={() => {navigate("/"); localStorage.clear()}}
          >
            Register
          </strong>
        </p>

        {/* Login Button */}
        <button
          type="button"
          className="btn btn-dark rounded w-100"
          style={{ height: "45px" }}
          onClick={handleLogin}
        >
          {loading ? (
            <>
              Verifying you...
              <div
                className="spinner-border spinner-border-sm text-light ms-2"
                role="status"
              ></div>
            </>
          ) : (
            <>
              <i className="fa-solid fa-right-to-bracket me-2"></i>
              Login
            </>
          )}
        </button>
      </div>
    </div>
  </div>
</>

  );
}

export default Login;
