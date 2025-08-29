import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import login from "../images/login.png";
import "animate.css";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import axios from "axios";
import "../components/adminFooter.css";
function Login() {
  const navigate = useNavigate();
  const [role, setRole] = useState("");
  const [roleText, setRoleText] = useState("Choose Your Role");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [isChecked, setIsChecked] = useState(false);

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
      if (role === "") {
        toast.warning("Choose a role");
        setLoading(false);
        return;
      }

      // Payload
      const loginPayload = {
        email,
        password,
        role: role,
      };

      console.log(loginPayload);

      const response = await axios.post(
        "https://hazir-hay-backend.wckd.pk/admin/",
        loginPayload
      );
      if (response.status === 200) {
        toast.success(response.data.message || "Login successful!");
        localStorage.setItem("token", response.data.token);
        console.log("role", role);
        sessionStorage.setItem("user", JSON.stringify(response.data.user));

        sessionStorage.setItem("role", role);

        if (role === "shopKepper") {
          setTimeout(() => {
            navigate("/admin/shopKepper/dashboard");
          }, 1500);
        }
        if (role === "user") {
          setTimeout(() => {
            navigate("/admin/user/dashboard");
          }, 1500);
        } else if (role === "admin") {
          setTimeout(() => {
            navigate("/admin/dashboard");
          }, 1500);
        }
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
    <div className="container animate__animated animate__fadeInDown animate__delay-0s py-4">
      <ToastContainer />

      <i
        className="fa-solid fa-arrow-left-long mb-3"
        style={{ fontSize: "1.6rem", cursor: "pointer" }}
        onClick={() => navigate("/")}
      ></i>

      <div className="row justify-content-center">
        <div className="col-12 col-md-8 col-lg-6">
          <h1 className="fw-bold">Let's Sign You In</h1>
          <h3 className="fw-bold" style={{ color: "#ff6600" }}>
            Welcome back!
          </h3>
          <p>
            You've been missed. Let’s get you signed in to continue your
            journey.
          </p>

          <div className="text-center animate__animated animate__fadeInLeft mb-4">
            <img
              src={login}
              alt="Login"
              className="img-fluid"
              style={{ maxWidth: "230px" }}
            />
          </div>

          <div className="form-floating animate__animated animate__fadeInUp mb-3">
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

          <div className="form-floating animate__animated animate__fadeInUp mb-2">
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

          <div className="dropdown mb-3">
            <button
              className="btn btn-primary dropdown-toggle w-100"
              type="button"
              id="dropdownMenuButton"
              data-bs-toggle="dropdown"
              aria-expanded="false"
            >
              {roleText}
            </button>

            <ul
              className="dropdown-menu w-100"
              aria-labelledby="dropdownMenuButton"
            >
              <li>
                <button
                  className="dropdown-item"
                  onClick={() => {
                    setRoleText("Admin");
                    setRole("admin");
                  }}
                >
                  <i className="fa-solid fa-user-shield me-2"></i>Admin
                </button>
              </li>
              <li>
                <button
                  className="dropdown-item"
                  onClick={() => {
                    setRoleText("Service Provider");
                    setRole("shopKepper");
                  }}
                >
                  <i className="fa-solid fa-screwdriver-wrench me-2"></i>Service
                  Provider
                </button>
              </li>
              <li>
                <button
                  className="dropdown-item"
                  onClick={() => {
                    setRoleText("User");
                    setRole("user");
                  }}
                >
                  <i className="fa-solid fa-user me-2"></i>User
                </button>
              </li>
            </ul>
          </div>

          <p className="text-center">
            Don't have an account?{" "}
            <strong
              className="text-primary"
              style={{ cursor: "pointer" }}
              onClick={() => navigate("/")}
            >
              Register
            </strong>
          </p>

          <button
            type="button"
            className="btn btn-dark rounded w-100 animate__animated animate__fadeInUp animate__delay-0s"
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
  );
}

export default Login;
