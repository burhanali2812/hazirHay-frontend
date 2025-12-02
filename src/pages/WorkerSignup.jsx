import React, { useState, useEffect } from "react";
import imageCompression from "browser-image-compression";
import axios from "axios";
import { useCheckBlockedStatus } from "../components/useCheckBlockedStatus";
import { useAppContext } from "../context/AppContext";
import { useNavigate } from "react-router-dom";
function WorkerSignup() {
  const { getShopKepperWorkers } = useAppContext();
  const [profilePicture, setProfilePicture] = useState(null);
  const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem("user"));
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
    const token = localStorage.getItem("token");

   useCheckBlockedStatus(token)
    useEffect(()=>{
     if(!user.isShop){
       return;
     }
     else if(!user?.isVerified){
        navigate("/shopKepper/sh&un&Ve&ri&fi&ed@sh@op$");
     }
    })

  const handleChange = async (e) => {
    const { name, files } = e.target;

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
          setProfilePicture(compressedFile);
        } catch (error) {
          console.error("Compression failed:", error);
        }
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("name", name);
      formData.append("phone", phone);
      if (profilePicture) formData.append("profilePicture", profilePicture);

      const res = await axios.post(
        "https://hazir-hay-backend.vercel.app/worker/saveWorker",
        formData,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
            "Content-Type": "multipart/form-data",
          },
          params: { t: Date.now() },
        }
      );

      if (res.data.success) {
        getShopKepperWorkers();
        alert(res.data.message || "Worker created successfully!");
        setName("");
        setPhone("");
        setProfilePicture(null);
        console.log("Saved Worker:", res.data.worker);
      } else {
        alert(res.data.message || "Unexpected response from server.");
      }
    } catch (error) {
  console.error("Error saving worker:", error);

  if (error.response) {
    const status = error.response.status;
    const msg = error.response.data?.message;

    if (status === 400) {
      alert("This phone number is already registered. Try a different one.");
    }
    else {
      alert(msg || "Something went wrong on the server.");
    }

    console.log("Backend error:", error.response.data);
  } 
  else if (error.request) {
    alert("No response from server. Check your internet or backend URL.");
  } 
  else {
    alert("Error: " + error.message);
  }
}
 finally {
      setLoading(false);
    }
  };

return (
  <div className="container py-4" >
  {/* Back Button */}
  <div
    className="d-flex align-items-center  ms-1"
    style={{ cursor: "pointer", width: "fit-content" }}
    onClick={() => window.history.back()}
  >
    <i className="fa-solid fa-arrow-left me-2" style={{ fontSize: "20px" }}></i>
  </div>

  {/* Centered Form */}
  <div className="d-flex flex-column justify-content-center align-items-center">
    <div className="p-3" style={{ maxWidth: "450px", width: "100%" }}>
      {/* Header */}
      <div className="text-center mb-3">
        <h4 className="fw-bold text-dark mt-3">Create Your Worker Account</h4>
        <p className="text-muted small">
          Enter your worker details to start your journey with us.
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        {/* Profile Picture */}
        <div className="text-center mb-4">
          <div
            className="mx-auto position-relative"
            style={{
              width: "130px",
              height: "130px",
              borderRadius: "50%",
              overflow: "hidden",
              border: "3px solid #e0e0e0",
              backgroundColor: "#f9f9f9",
              transition: "0.3s ease",
            }}
          >
            {profilePicture ? (
              <img
                src={URL.createObjectURL(profilePicture)}
                alt="Profile Preview"
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
            ) : (
              <div className="d-flex justify-content-center align-items-center h-100">
                <i className="fa-solid fa-user text-secondary" style={{ fontSize: "60px" }}></i>
              </div>
            )}
          </div>

          <label
            htmlFor="profilePicture"
            className="btn btn-outline-primary btn-sm mt-3 rounded-pill px-3"
          >
            <i className="fa-solid fa-upload me-1"></i> Upload Picture
          </label>
          <input
            type="file"
            id="profilePicture"
            className="d-none"
            name="profilePicture"
            accept="image/*"
            onChange={handleChange}
          />
        </div>

        {/* Name Field */}
        <div className="form-floating mb-3">
          <input
            type="text"
            className="form-control rounded-3"
            id="nameInput"
            placeholder="Enter your name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
          <label htmlFor="nameInput">Full Name</label>
        </div>

        {/* Phone Field */}
        <div className="form-floating mb-4">
          <input
            type="tel"
            className="form-control rounded-3"
            id="phoneInput"
            placeholder="Enter your phone number"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            required
          />
          <label htmlFor="phoneInput">Phone Number</label>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          className="btn btn-primary w-100 py-2 fw-semibold rounded-3"
          disabled={loading}
          style={{ letterSpacing: "0.5px" }}
        >
          {loading ? (
            <>
              <span>Creating...</span>
              <span className="spinner-grow spinner-grow-sm ms-2" aria-hidden="true"></span>
            </>
          ) : (
            <>
              <i className="fa-solid fa-right-to-bracket me-2"></i> Create
            </>
          )}
        </button>
      </form>
    </div>
  </div>
</div>
);


}

export default WorkerSignup;
