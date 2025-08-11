import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "animate.css";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import axios from "axios";
import imageCompression from "browser-image-compression";
function Signup() {
  const role = localStorage.getItem("role");
  const navigate = useNavigate();
  const [formData1, setFormData] = useState({
    profilePicture: null,
    name: "",
    email: "",
    contact: "",
    address: "",
    password: "",
    confirmPassword: "",
  });
  const [isChecked, setIsChecked] = useState(false);
  const [loading, setLoading] = useState(false);
  const [latitude, setLatitude] = useState(null);
  const [longitude, setLongitude] = useState(null);
  const [areaName, setAreaName] = useState("");

  useEffect(() => {
    const fetchLocation = async () => {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;

          setLatitude(lat);
          setLongitude(lng);

          try {
            const response = await axios.get(
              "https://nominatim.openstreetmap.org/reverse",
              {
                params: {
                  lat: lat,
                  lon: lng,
                  format: "json",
                },
              }
            );

            const name =
              response.data.address.city ||
              response.data.address.town ||
              response.data.address.village ||
              response.data.address.suburb ||
              "Unknown Area";

            setAreaName(name);
          } catch (error) {
            console.error("Error fetching area name:", error);
          }
        },
        (error) => {
          console.error("Error getting location:", error);
        }
      );
    };

    fetchLocation();
  }, []);

  const handleChange = async (e) => {
    const { name, files, value } = e.target;

    if (name === "profilePicture") {
      const file = files[0];
      if (file) {
        try {
          const options = {
            maxSizeMB: 0.6,
            maxWidthOrHeight: 800,
            useWebWorker: true,
          };

          const compressedFile = await imageCompression(file, options);

          // Directly set compressed file into formData
          setFormData({ ...formData1, profilePicture: compressedFile });
        } catch (error) {
          console.error("Compression failed:", error);
        }
      }
    } else {
      setFormData({ ...formData1, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    setLoading(true);
    e.preventDefault();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRegex = /^\+?\d{10,15}$/;

    if (!formData1.profilePicture) {
      toast.error("Please upload a profile picture");
      setLoading(false);
      return;
    }
    if (!formData1.name.trim()) {
      toast.error("Name cannot be empty");
      setLoading(false);
      return;
    }
    if (!formData1.email.trim()) {
      toast.error("Email cannot be empty");
      setLoading(false);
      return;
    }
    if (!emailRegex.test(formData1.email)) {
      toast.error("Please enter a valid email address");
      setLoading(false);
      return;
    }
    if (!formData1.contact.trim()) {
      toast.error("Contact number cannot be empty");
      setLoading(false);
      return;
    }
    if (!phoneRegex.test(formData1.contact)) {
      toast.error("Please enter a valid mobile number (11 digits)");
      setLoading(false);
      return;
    }
    if (!formData1.address.trim()) {
      toast.error("Address cannot be empty");
      setLoading(false);
      return;
    }
    if (!formData1.password) {
      toast.error("Password cannot be empty");
      setLoading(false);
      return;
    }
    if (formData1.password.length < 6) {
      toast.error("Password must be at least 6 characters long");
      setLoading(false);
      return;
    }
    if (!formData1.confirmPassword) {
      toast.error("Please confirm your password");
      setLoading(false);
      return;
    }
    if (formData1.password !== formData1.confirmPassword) {
      toast.error("Passwords do not match");
      setLoading(false);
      return;
    }

    const finalRole = role === "user" ? "user" : "shopKepper";

    const formData = new FormData();
    formData.append("name", formData1.name);
    formData.append("email", formData1.email);
    formData.append("password", formData1.password);
    formData.append("phone", formData1.contact);
    formData.append("address", formData1.address);
    formData.append("role", finalRole);
    formData.append("profilePicture", formData1.profilePicture);

    try {
      const response = await axios.post(
        "https://hazir-hay-backend.vercel.app/admin/saveUser",
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );

      if (response.status === 200) {
        toast.success(response.data.message || "Signup successful!");
        console.log("Signup response:", response.data);

        if (response.data?.user?.id) {
          localStorage.setItem("userId", response.data.user.id);
        } else {
          console.warn("No user ID returned from backend");
        }

        if (role === "user") {
          setTimeout(() => navigate("/login"), 300);
        } else {
          setTimeout(() => navigate("/shop"), 300);
        }
      }
    } catch (error) {
      console.error("Signup failed:", error.response?.data || error.message);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container  animate__animated animate__fadeInLeft animate__delay-0s">
      <ToastContainer />
      <i
        className="fa-solid fa-arrow-left-long mt-3 mx-1"
        style={{ fontSize: "1.6rem", cursor: "pointer" }}
        onClick={() => navigate("/")}
      ></i>
      {role &&
        (role === "user" ? (
          <>
            <h1 className="mx-3 fw-bold mt-4">Your Future Starts Here</h1>
            <h3 className="mx-3 fw-bold" style={{ color: "#ff6600" }}>
              Find Exactly What You Need
            </h3>
            <p className="mx-3">
              Join today to discover trusted services — connect with top
              providers and bring your ideas to life.
            </p>
          </>
        ) : (
          <>
            <h1 className="mx-3 fw-bold">Your Future Starts Here</h1>
            <h3 className="mx-3 fw-bold" style={{ color: "#ff6600" }}>
              Turn Skills Into Success
            </h3>
            <p className="mx-3">
              Join today to showcase your expertise — connect with the right
              clients, expand your network, and achieve more.
            </p>
          </>
        ))}

      <form className="shadow p-4 rounded bg-white">
        {/* Profile Picture Preview */}
        <div className="mb-3 text-center">
          <label htmlFor="profilePicture" className="form-label fw-bold">
            Profile Picture
          </label>
          <div className="d-flex justify-content-center mb-2">
            <div
              style={{
                width: "130px",
                height: "130px",
                borderRadius: "50%",
                overflow: "hidden",
                border: "2px solid #ddd",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: "#f8f9fa",
              }}
            >
              {formData1.profilePicture ? (
                <img
                  src={URL.createObjectURL(formData1.profilePicture)}
                  alt="Profile Preview"
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                  }}
                />
              ) : (
                <i
                  className="fa-solid fa-user"
                  style={{ fontSize: "68px", color: "#aaa" }}
                ></i>
              )}
            </div>
          </div>
          <input
            type="file"
            className="form-control mt-3"
            name="profilePicture"
            accept="image/*"
            onChange={handleChange}
          />
        </div>

        <div className="form-floating mb-3">
          <input
            type="text"
            className="form-control"
            name="name"
            id="nameInput"
            placeholder="Enter your name"
            value={formData1.name}
            onChange={handleChange}
            required
          />
          <label htmlFor="nameInput">Name</label>
        </div>

        <div className="form-floating mb-3">
          <input
            type="email"
            className="form-control"
            name="email"
            id="emailInput"
            placeholder="Enter your email"
            value={formData1.email}
            onChange={handleChange}
            required
          />
          <label htmlFor="emailInput">Email</label>
        </div>

        <div className="form-floating mb-3">
          <input
            type="tel"
            className="form-control"
            name="contact"
            id="contactInput"
            placeholder="Enter your contact number"
            value={formData1.contact}
            onChange={handleChange}
            required
          />
          <label htmlFor="contactInput">Contact</label>
        </div>

        <div className="form-floating mb-3">
          <textarea
            className="form-control"
            name="address"
            id="addressInput"
            placeholder="Enter your address"
            value={formData1.address}
            onChange={handleChange}
            style={{ height: "100px" }}
            required
          ></textarea>
          <label htmlFor="addressInput">Address</label>
        </div>

        <div className="form-floating  mb-2">
          <input
            type={isChecked ? "text" : "password"}
            className="form-control"
            name="password"
            id="passwordInput"
            placeholder="Enter your password"
            value={formData1.password}
            onChange={handleChange}
            required
          />
          <label htmlFor="passwordInput">Password</label>
        </div>
        <div className="form-check mb-3">
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

        <div className="form-floating mb-4">
          <input
            type="password"
            className="form-control"
            name="confirmPassword"
            id="confirmPasswordInput"
            placeholder="Re-enter your password"
            value={formData1.confirmPassword}
            onChange={handleChange}
            required
          />
          <label htmlFor="confirmPasswordInput">Confirm Password</label>
        </div>

        {role === "user" ? (
          <button
            type="submit"
            className="btn btn-primary w-100 fw-bold"
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading ? (
              <>
                <span role="status">Please Wait Saving your data...</span>
                <span
                  className="spinner-grow spinner-grow-sm ms-2"
                  aria-hidden="true"
                ></span>
              </>
            ) : (
              <>
                <i class="fa-solid fa-right-to-bracket me-2"></i>
                Sign Up
              </>
            )}
          </button>
        ) : (
          <button
            type="submit"
            className="btn btn-primary w-100 fw-bold"
            disabled={loading}
            onClick={handleSubmit}
          >
            {loading ? (
              <>
                <span role="status">Please Wait Saving your data...</span>
                <span
                  className="spinner-grow spinner-grow-sm ms-2"
                  aria-hidden="true"
                ></span>
              </>
            ) : (
              <>
                <i className="fa-solid fa-shop me-2"></i>
                Continue For Shop Details
              </>
            )}
          </button>
        )}
      </form>
    </div>
  );
}

export default Signup;
