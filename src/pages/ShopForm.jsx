import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import shop from "../images/shop.png";
import { toast, ToastContainer } from "react-toastify";
import imageCompression from "browser-image-compression";
import "react-toastify/dist/ReactToastify.css";
import "animate.css";
import axios from "axios";
function ShopForm() {
  const navigate = useNavigate();
   const [formData1, setFormData] = useState({
      shopPicture: null,
      shopName: "",
      shopAddress: "",
      license: "",
    });
    const [loading, setLoading] = useState(false);
  const handleChange = async (e) => {
  const { name, files, value } = e.target;

  if (name === "shopPicture") {
    const file = files[0];
    if (file) {
      try {
        const options = {
          maxSizeMB: 0.6,
          maxWidthOrHeight: 800,
          useWebWorker: true,
        };

        const compressedFile = await imageCompression(file, options);

        setFormData({ ...formData1, shopPicture: compressedFile });
      } catch (error) {
        console.error("Compression failed:", error);
      }
    }
  } else {
    setFormData({ ...formData1, [name]: value });
  }
};

const handleSubmit = async (e) => {
    const id = localStorage.getItem("userId")
    setLoading(true)
  e.preventDefault();


  if (!formData1.shopPicture) {
    toast.error("Please upload a Shop picture");
     setLoading(false)
    return;
  }
  if (!formData1.shopName.trim()) {
    toast.error("Shop Name cannot be empty");
    setLoading(false)
    return;
  }
  if (!formData1.shopAddress.trim()) {
    toast.error("Shop address cannot be empty");
    setLoading(false)
    return;
  }
  if (!formData1.license.trim()) {
    toast.error("License cannot be empty");
    setLoading(false)
    return;
  }

  try {
    const formData = new FormData();
    formData.append("shopName", formData1.shopName);
    formData.append("shopAddress", formData1.shopAddress);
    formData.append("license", formData1.license);
    formData.append("shopPicture", formData1.shopPicture);

    const response = await axios.post(
      `https://hazir-hay-backend.vercel.app/admin/shopInformation/${id}`,
      formData,
      {
        headers: { "Content-Type": "multipart/form-data" },
      }
    );
    if(response.status === 200){
       

    toast.success(response.data.message || "Shop information saved successfully");
    setLoading(false)
  
    setTimeout(() => {
        navigate("/login")
    }, 1000);
    }
     
     
  } catch (error) {
    setLoading(false)
    console.error("Error submitting shop information:", error);
    toast.error(
      error.response?.data?.message || "Failed to store shop information"
    );
  }
};

  return (
    <div className="container  animate__animated animate__fadeInLeft animate__delay-0s">
        <ToastContainer/>
   

      <h1 className="mx-3 fw-bold mt-3">Your Shop’s Journey Starts Here</h1>
      <h3 className="mx-3 fw-bold" style={{ color: "#ff6600" }}>
        Turn Your Shop Into a Success Story
      </h3>
      <p className="mx-3">
        Share your shop details today — attract the right customers, grow your
        reach, and boost your sales like never before.
      </p>

      <div className="text-center animate__animated animate__fadeInLeft">
        <img src={shop} style={{ width: "230px", height: "230px" }} />
      </div>

      <form className="shadow p-4 rounded bg-white">
        <div className="mb-3 text-center">
          <label htmlFor="profilePicture" className="form-label fw-bold">
            Shop Picture
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
              {formData1.shopPicture ? (
                <img
                  src={URL.createObjectURL(formData1.shopPicture)}
                  alt="Profile Preview"
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                  }}
                />
              ) : (
                <i
               
                  className="fa-solid fa-shop"
                  style={{ fontSize: "68px", color: "#aaa" }}
                ></i>
              )}
            </div>
          </div>
          <input
            type="file"
            className="form-control mt-3"
            name="shopPicture"
            accept="image/*"
            onChange={handleChange}
          />
        </div>

        <div className="form-floating mb-3">
          <input
            type="text"
            className="form-control"
            name="shopName"
            id="nameInput"
            placeholder="Enter your Shop name"
            value={formData1.shopName}
            onChange={handleChange}
            required
          />
          <label htmlFor="nameInput"> Shop Name</label>
        </div>

        <div className="form-floating mb-3">
          <input
            type="number"
            className="form-control"
            name="license"
            id="licenseInput"
            placeholder="Enter your email"
            value={formData1.license}
            onChange={handleChange}
            required
          />
          <label htmlFor="licenseInput">License Number</label>
        </div>

        <div className="form-floating mb-3">
          <textarea
            className="form-control"
            name="shopAddress"
            id="shopAddressInput"
            placeholder="Enter your address"
            value={formData1.shopAddress}
            onChange={handleChange}
            style={{ height: "100px" }}
            required
          ></textarea>
          <label htmlFor="shopAddressInput">Shop Address</label>
        </div>


       
          <button type="submit" className="btn btn-primary w-100 fw-bold" onClick={handleSubmit} disabled={loading}>
            {loading ? (
              <>
                
                <span role="status">Please Wait Saving your Shop...</span>
                <span
                  className="spinner-grow spinner-grow-sm ms-2"
                  aria-hidden="true"
                ></span>
              </>
            ) : (
              <>
                <i class="fa-solid fa-shop me-2"></i>
               Save Shop
              </>
            )}
          </button>
      </form>
    </div>
  );
}

export default ShopForm;
