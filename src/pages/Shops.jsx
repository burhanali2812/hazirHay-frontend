import React, { useState } from "react";
import imageCompression from "browser-image-compression";

function Shops() {
  const [profilePicture, setProfilePicture] = useState(null);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);

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

      // Example API call
      // await fetch("/api/shops", { method: "POST", body: formData });

      console.log("Form submitted:", { name, phone, profilePicture });
      alert("Shop added successfully!");
    } catch (error) {
      console.error("Error saving shop:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <form className="shadow p-4 rounded bg-white" onSubmit={handleSubmit}>
        {/* Profile Picture */}
        <div className="mb-3 text-center">
          <label htmlFor="profilePicture" className="form-label fw-bold">
            Profile Picture
          </label>
          <div
            className="d-flex justify-content-center mb-2"
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
              margin: "auto",
            }}
          >
            {profilePicture ? (
              <img
                src={URL.createObjectURL(profilePicture)}
                alt="Profile Preview"
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
            ) : (
              <i
                className="fa-solid fa-user"
                style={{ fontSize: "68px", color: "#aaa" }}
              ></i>
            )}
          </div>
          <input
            type="file"
            className="form-control mt-3"
            name="profilePicture"
            accept="image/*"
            onChange={handleChange}
          />
        </div>

        {/* Name */}
        <div className="form-floating mb-3">
          <input
            type="text"
            className="form-control"
            id="nameInput"
            placeholder="Enter your name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
          <label htmlFor="nameInput">Name</label>
        </div>

        {/* Phone */}
        <div className="form-floating mb-3">
          <input
            type="tel"
            className="form-control"
            id="contactInput"
            placeholder="Enter your contact number"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            required
          />
          <label htmlFor="contactInput">Contact</label>
        </div>

        {/* Submit */}
        <button
          type="submit"
          className="btn btn-primary w-100 fw-bold"
          disabled={loading}
        >
          {loading ? (
            <>
              <span>Please Wait... Saving your data</span>
              <span
                className="spinner-grow spinner-grow-sm ms-2"
                aria-hidden="true"
              ></span>
            </>
          ) : (
            <>
              <i className="fa-solid fa-right-to-bracket me-2"></i>
              Sign Up
            </>
          )}
        </button>
      </form>
    </div>
  );
}

export default Shops;
