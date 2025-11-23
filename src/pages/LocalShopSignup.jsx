import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";

function LocalShopSignup() {
  const [formData, setFormData] = useState({
    shopName: "",
    position: "",
    shopAddress: "",
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
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  // Handle input change
  const handleChange = (e, index) => {
    if (e.target.name === "services") {
      const newServices = [...formData.services];
      newServices[index].name = e.target.value;
      setFormData({ ...formData, services: newServices });
    } else {
      setFormData({ ...formData, [e.target.name]: e.target.value });
    }
  };

  // Add a new service field
  const addService = () => {
    setFormData({
      ...formData,
      services: [...formData.services, { name: "" }],
    });
  };

  // Remove service field
  const removeService = (index) => {
    const newServices = formData.services.filter((_, i) => i !== index);
    setFormData({ ...formData, services: newServices });
  };

  // Handle form submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const data = new FormData();
      data.append("shopName", formData.shopName);
      data.append("position", formData.position);
      data.append("shopAddress", formData.shopAddress);
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

      <form onSubmit={handleSubmit}>
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
          <label htmlFor="shopName">Shop Name</label>
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
            <option value="Ground Floor">Ground Floor</option>
            <option value="1st Floor">1st Floor</option>
            <option value="2nd Floor">2nd Floor</option>
            <option value="3rd Floor">3rd Floor</option>
            <option value="4th Floor">4th Floor</option>
            <option value="5th Floor">5th Floor</option>
          </select>
          <label htmlFor="position">Shop Floor</label>
        </div>

        <div className="form-floating mb-3">
          <input
            type="text"
            className="form-control"
            id="shopAddress"
            name="shopAddress"
            placeholder="Shop Address"
            value={formData.shopAddress}
            onChange={handleChange}
            required
          />
          <label htmlFor="shopAddress">Shop Address</label>
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
          <label htmlFor="email">Email</label>
        </div>

        <div className="form-floating mb-3">
          <input
            type="password"
            className="form-control"
            id="password"
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            required
          />
          <label htmlFor="password">Password</label>
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
          />
          <label htmlFor="phone">Phone Number</label>
        </div>

        {/* Services */}
        <label className="form-label mt-3">Services Offered</label>
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
          className="btn btn-secondary mb-3"
          onClick={addService}
        >
          Add Service
        </button>

        {/* Location */}
        <div className="form-floating mb-3">
          <input
            type="text"
            className="form-control"
            id="area"
            name="area"
            placeholder="Area"
            value={formData.area}
            onChange={handleChange}
            required
          />
          <label htmlFor="area">Area</label>
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

        {/* File uploads */}
        <div className="mb-3">
          <label className="form-label">Shop Picture</label>
          <input
            type="file"
            className="form-control"
            onChange={(e) => setShopPicture(e.target.files[0])}
            accept="image/*"
          />
        </div>

        <div className="mb-3">
          <label className="form-label">Payment Screenshot</label>
          <input
            type="file"
            className="form-control"
            onChange={(e) => setPaymentPic(e.target.files[0])}
            accept="image/*"
            required
          />
        </div>

        <button
          type="submit"
          className="btn btn-primary w-100"
          disabled={loading}
        >
          {loading ? "Submitting..." : "Sign Up"}
        </button>
      </form>
    </div>
  );
}

export default LocalShopSignup;
