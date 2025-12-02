import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast, Toaster } from "react-hot-toast";
import imageCompression from "browser-image-compression";
import { lazy, Suspense } from "react";
const MyMap = lazy(() => import("../components/MyMap"));
function LocalShopSignup() {
  const [formData, setFormData] = useState({
    shopName: "",
    position: "",
    shopAddress: "",
    description: "",
    email: "",
    password: "",
    phone: "",
    area: "",
    latitude: "",
    longitude: "",
    services: [{ name: "" }],
  });

  const [shopPicture, setShopPicture] = useState(null);
  const [paymentPic, setPaymentPic] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isShowPassword, setIsShowPassword] = useState(false);
  const navigate = useNavigate();
  const [mapModal, setMapModal] = useState(false);

  const [selectedArea, setSelectedArea] = useState(null);
  const handleSetLocation = () => {
    if (selectedArea) {
      setFormData({
        ...formData,
        area: selectedArea.areaName,
        latitude: selectedArea.lat,
        longitude: selectedArea.lng,
      });
    }
    setMapModal(false);

  }

  const handleChange = async (e, index) => {
    const { name, value, files } = e.target;

    if (name === "services") {
      const updatedServices = [...formData.services];
      updatedServices[index].name = value;
      setFormData({ ...formData, services: updatedServices });
      return;
    }

    if (name === "shopPicture" || name === "paymentPic") {
      if (files && files[0]) {
        try {
          const options = {
            maxSizeMB: 0.6,
            maxWidthOrHeight: 800,
            useWebWorker: true,
          };

          const compressedFile = await imageCompression(files[0], options);

          if (name === "shopPicture") {
            setShopPicture(compressedFile);
          } else if (name === "paymentPic") {
            setPaymentPic(compressedFile);
          }
        } catch (error) {
          console.error("Image compression failed:", error);
        }
      }
      return;
    }

    setFormData({ ...formData, [name]: value });
  };

  const addService = () => {
    setFormData({
      ...formData,
      services: [...formData.services, { name: "" }],
    });
  };

  const removeService = (index) => {
    const newServices = formData.services.filter((_, i) => i !== index);
    setFormData({ ...formData, services: newServices });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    if (paymentPic === null) {
      toast.error("Please upload payment screenshot!");
      return;
    }

    try {
      const data = new FormData();
      data.append("shopName", formData.shopName);
      data.append("position", formData.position);
      data.append("shopAddress", formData.shopAddress);
      data.append("description", formData.description);
      data.append("email", formData.email);
      data.append("password", formData.password);
      data.append("phone", formData.phone);
      data.append("services", JSON.stringify(formData.services));
      data.append(
        "location",
        JSON.stringify({
          type: "Point",
          coordinates: [
            parseFloat(formData.longitude),
            parseFloat(formData.latitude),
          ],
          area: formData.area,
        })
      );

      if (shopPicture) data.append("shopPicture", shopPicture);
      if (paymentPic) data.append("paymentPic", paymentPic);

      const response = await axios.post(
        "https://hazir-hay-backend.vercel.app/localShop/saveLocalShop",
        data,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );

      toast.success(response.data.message);
      setFormData({
        shopName: "",
        position: "",
        shopAddress: "",
        email: "",
        description: "",
        password: "",
        phone: "",
        area: "",
        latitude: "",
        longitude: "",
        services: [{ name: "" }],
      });
      setShopPicture(null);
      setPaymentPic(null);
    } catch (error) {
      console.error(error);
      toast.error(
        error.response?.data?.message ||
          "Something went wrong. Please try again."
      );
    }

    setLoading(false);
  };

  const fetchCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser.");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const lat = position.coords.latitude;
        const lon = position.coords.longitude;

        try {
          const response = await axios.get(
            `https://hazir-hay-backend.vercel.app/admin/reverse-geocode`,
            {
              params: {
                lat,
                lon,
                format: "json",
              },
            }
          );

          const areaName =
            response.data.display_name ||
            response.data.address.neighbourhood ||
            response.data.address.city ||
            response.data.address.town ||
            "";

          setFormData({
            ...formData,
            latitude: lat,
            longitude: lon,
            area: areaName,
          });
          setSelectedArea({ lat, lng: lon, areaName });
        } catch (error) {
          console.error("Reverse geocoding failed:", error);
          alert("Failed to fetch area name from coordinates.");
        }
      },
      (error) => {
        console.error("Geolocation error:", error);
        alert("Failed to get current location.");
      }
    );
  };
  useEffect(() => {
    fetchCurrentLocation();
  }, []);

  return (
    <div className="container ">
      <Toaster />
      <i
        className="fa-solid fa-arrow-left-long mt-3 mx-1"
        style={{ fontSize: "1.6rem", cursor: "pointer" }}
        onClick={() => navigate("/")}
      ></i>
      <h1 className="mx-3 fw-bold mt-4">Register Your Shop Today</h1>
      <h3 className="mx-3 fw-bold" style={{ color: "#ff6600" }}>
        Grow Your Business with Hazir Hay
      </h3>
      <p className="mx-3">
        Reach more customers, boost your daily orders, and make your shop
        visible to thousands of people in your area. Join now and take your
        business to the next level.
      </p>

      <form onSubmit={handleSubmit} className="shadow-lg p-4 rounded bg-light">
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
              {shopPicture !== null ? (
                <img
                  src={URL.createObjectURL(shopPicture)}
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
            id="shopName"
            name="shopName"
            placeholder="Shop Name"
            value={formData.shopName}
            onChange={handleChange}
            required
          />
          <label htmlFor="shopName">
            Shop Name<b className="text-danger">*</b>
          </label>
        </div>

        <div className="form-floating mb-3">
          <select
            className="form-select"
            id="position"
            name="position"
            value={formData.position}
            onChange={handleChange}
            required
          >
            <option value="">Select Position</option>
            <option value="Basement">Basement</option>
            <option value="Stall">Stall</option>
            <option value="Ground Floor">Ground Floor</option>
            <option value="1st Floor">1st Floor</option>
            <option value="2nd Floor">2nd Floor</option>
            <option value="3rd Floor">3rd Floor</option>
            <option value="4th Floor">4th Floor</option>
            <option value="5th Floor">5th Floor</option>
          </select>
          <label htmlFor="position">
            Shop Floor<b className="text-danger">*</b>
          </label>
        </div>
        <p className="text-muted">
          Enter Shop Address like near kalma chowck or new mobile market, Enter
          clear address of your shop
        </p>
        <div className="form-floating mb-3">
          <input
            type="text"
            className="form-control"
            id="shopAddress"
            name="shopAddress"
            placeholder="Enter Shop Address like near kalma chowck or new mobile market, Enter clear address of your shop"
            value={formData.shopAddress}
            onChange={handleChange}
            required
          />
          <label htmlFor="shopAddress">
            Shop Address<b className="text-danger">*</b>
          </label>
        </div>
        <div className="form-floating mb-3">
          <textarea
            className="form-control"
            id="description"
            name="description"
            placeholder="Area"
            value={formData.description}
            onChange={handleChange}
            style={{ height: "110px" }}
            required
          />
          <label htmlFor="area">
            Describe Your Business Shortly<b className="text-danger">*</b>
          </label>
        </div>

        <div className="form-floating mb-3">
          <input
            type="email"
            className="form-control"
            id="email"
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
            required
          />
          <label htmlFor="email">
            Email<b className="text-danger">*</b>
          </label>
        </div>

        <div className="form-floating mb-3">
          <input
            type="tel"
            className="form-control"
            id="phone"
            name="phone"
            placeholder="Phone Number"
            value={formData.phone}
            onChange={handleChange}
            required
            length={11}
          />
          <label htmlFor="phone">
            Phone Number<b className="text-danger">*</b>
          </label>
        </div>
        <div className="form-floating mb-3">
          <input
            type={isShowPassword ? "text" : "password"}
            className="form-control"
            id="password"
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            required
          />
          <label htmlFor="password">
            Password<b className="text-danger">*</b>
          </label>
        </div>
        <div className="form-check mb-3 mx-1">
          <input
            type="checkbox"
            className="form-check-input"
            id="exampleCheck"
            checked={isShowPassword}
            onChange={(e) => setIsShowPassword(e.target.checked)}
          />
          <label className="form-check-label" htmlFor="exampleCheck">
            Show Password
          </label>
        </div>

        {/* Services */}
        <label className="form-label mt-3">
          Services Offered<b className="text-danger">*</b>
        </label>
        <p className="text-muted">
          Enter your any 5 main services like for food (Biryani, Pulao, Qorma,
          Zarda, Beef)
        </p>
        {formData.services.map((service, index) => (
          <div className="input-group mb-2" key={index}>
            <input
              type="text"
              className="form-control"
              name="services"
              placeholder="Service Name"
              value={service.name}
              onChange={(e) => handleChange(e, index)}
              required
            />
            {formData.services.length > 1 && (
              <button
                type="button"
                className="btn btn-danger"
                onClick={() => removeService(index)}
              >
                Remove
              </button>
            )}
          </div>
        ))}
        <button
          type="button"
          className="btn btn-primary mb-3 w-100"
          onClick={addService}
          disabled={formData.services.length === 5}
        >
          Add Service
        </button>

        {/* Location */}
        <div className="form-floating mb-3">
          <textarea
            className="form-control"
            id="area"
            name="area"
            placeholder="Area"
            value={formData.area}
            style={{ height: "110px" }}
            disabled={true}
            required
          />
          <label htmlFor="area">Current Location (Auto Fetched)</label>
        </div>

        <div className="row mb-3">
          <div className="col">
            <input
              type="number"
              className="form-control"
              name="latitude"
              placeholder="Latitude"
              value={formData.latitude}
              disabled={true}
              step="any"
              required
            />
          </div>
          <div className="col">
            <input
              type="number"
              className="form-control"
              name="longitude"
              placeholder="Longitude"
              value={formData.longitude}
              step="any"
              required
              disabled={true}
            />
          </div>
        </div>
        <div>
          <button
            type="button"
            className="btn btn-primary mb-3 w-100"
            onClick={() => setMapModal(true)}
          >
            <i class="fa-solid fa-map-location-dot me-2"></i>
            Select Location on Map
          </button>
        </div>

        <div className=" mt-4">
          <h5 className="fw-bold mb-3 text-primary">
            Registration Fee: Rs. 500/-
          </h5>

          <p className="text-secondary mb-3">
            To activate your shop on Hazir Hay, please send the one-time
            registration fee (Valid for 1 Year) and upload the payment
            screenshot below.
          </p>

          <div className="p-3 rounded" style={{ background: "#f8f9fa" }}>
            <p className="fw-semibold mb-2">
              <i className="fa-solid fa-wallet me-2 text-primary"></i>
              JazzCash Details
            </p>

            <p className="mb-1">
              <i className="fa-solid fa-phone me-2 text-secondary"></i>
              <strong>0326 6783442</strong>
            </p>

            <p className="mb-0">
              <i className="fa-solid fa-user me-2 text-secondary"></i>
              <strong>Burhan Ali</strong>
            </p>
          </div>

          <p className="mt-3 text-secondary">
            After payment, upload the <strong>payment screenshot</strong> to
            continue.
          </p>
        </div>

        <div className="mb-3 mt-3">
          <label className="form-label">Payment Screenshot</label>
          <input
            type="file"
            className="form-control"
            name="paymentPic"
            id="paymentPic"
            onChange={handleChange}
            accept="image/*"
            required
          />
        </div>
        {paymentPic && (
          <img
            src={URL.createObjectURL(paymentPic)}
            alt="Payment Picture"
            style={{ width: "200px", height: "300px", objectFit: "cover" }}
          />
        )}

        <button
          type="submit"
          className="btn btn-primary w-100 mt-3 mb-3"
          disabled={loading}
        >
          {loading ? "Submitting..." : "Register Shop"}
        </button>
      </form>

        {mapModal && (
        <div
          className="modal fade show d-block "
          tabIndex="-1"
          style={{
            backgroundColor: "rgba(0, 0, 0, 0.6)",
            backdropFilter: "blur(2px)",
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
                <h6 className="modal-title m-0">Select Your Location</h6>
              </div>

              {/* Body */}
              <div className="modal-body">
                 <div className="form-floating mb-3">
          <textarea
            className="form-control"
            id="area"
            name="area"
            placeholder="Area"
            value={selectedArea?.areaName || formData?.area}
            style={{ height: "110px" }}
            disabled={true}
            required
          />
          <label htmlFor="area">Current Location (Auto Fetched)</label>
        </div>
                  <div style={{ height: "420px", width: "100%" }} >
                          <Suspense fallback={<h2>Loading...</h2>}>
                            <MyMap
                            onLocationSelect={setSelectedArea}
                            initialLocation={selectedArea ? selectedArea : null}
                          />
                          </Suspense>
                        </div>
                

                <button
                  className="btn btn-primary w-100  mt-3"
                  onClick={handleSetLocation}
                >
                   Save Location
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default LocalShopSignup;
