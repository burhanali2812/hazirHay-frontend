import { useEffect, useState } from "react";
import axios from "axios";

function MyShop({shopKepperWorkers}) {
  const [shop, setShop] = useState(null);
  const user = JSON.parse(localStorage.getItem("user"));
  const token = localStorage.getItem("token");

  const getShopData = async () => {
    try {
      const response = await axios.get(
        `https://hazir-hay-backend.vercel.app/shops/shopData/${user._id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
          params: { t: Date.now() },
        }
      );
      if (response.data.success) {
        setShop(response.data.shop);
      }
    } catch (err) {
      console.error("Error fetching shop data:", err);
    }
  };

  useEffect(() => {
    getShopData();
  }, []);

  return (
    <div className="container my-4 pb-5">
      {/* Back Button */}
      <div className="mb-4">
        <button
          className="btn btn-outline-primary d-flex align-items-center"
          onClick={() => window.history.back()}
        >
          <i className="fas fa-arrow-left me-2"></i> Back
        </button>
      </div>

      {/* Hero Banner */}
      <div
        className="position-relative rounded overflow-hidden shadow-sm"
        style={{
          height: "250px",
          backgroundColor: "#f8f9fa",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontWeight: "bold",
          fontSize: "24px",
          color: "#6c757d",
        }}
      >
        {shop?.shopPicture ? (
          <img
            src={shop.shopPicture}
            alt="Shop Banner"
            className="w-100 h-100"
            style={{ objectFit: "cover" }}
          />
        ) : (
          <span>Shop Banner</span>
        )}

        {/* Edit Icon */}
        <button
          className="btn btn-light position-absolute top-0 end-0 m-3 shadow-sm"
          style={{ borderRadius: "50%" }}
          title="Change Shop Picture"
        >
          <i className="fas fa-pen"></i>
        </button>
      </div>

      {/* Floating Card */}
      <div
        className="card text-center shadow-lg"
        style={{
          marginTop: "-40px",
          borderRadius: "15px",
          padding: "20px",
        }}
      >
        <h3 className="fw-bold">{shop?.shopName || "Shop Name"}</h3>
        <p className="mb-1">
          <i className="fas fa-phone me-2"></i> {shop?.phone || "Not provided"}
        </p>
        <p className="mb-3">
          <i className="fas fa-map-marker-alt me-2"></i>{" "}
          {shop?.location?.area || "Not provided"}
        </p>

        {/* Cancel Requests & Live Status */}
        <div className="d-flex justify-content-center gap-3 mb-4">
          <span className="badge bg-danger px-3 py-2">
            <i className="fas fa-times-circle me-1"></i> Cancel Requests:{" "}
            {shop?.cancelRequest || 0}
          </span>
          <span
            className={`badge px-3 py-2 ${
              shop?.isLive ? "bg-success" : "bg-secondary"
            }`}
          >
            <i
              className={`me-1 ${
                shop?.isLive ? "fas fa-check-circle" : "fas fa-times-circle"
              }`}
            ></i>{" "}
            {shop?.isLive ? "Live" : "Offline"}
          </span>
        </div>

        {/* Two Info Cards */}
        <div className="row g-3">
          {/* Workers Card */}
          <div className="col-md-6">
            <div className="card h-100 shadow-lg text-center hover-shadow bg-light border-0">
              <div className="card-body d-flex flex-column align-items-center justify-content-center">
                <i className="fas fa-users fa-2x text-primary mb-3"></i>
                <h5 className="card-title">Workers</h5>
                <p className="card-text">{shopKepperWorkers?.length || 0} Workers</p>
              </div>
            </div>
          </div>

          {/* Services Card */}
          <div className="col-md-6">
            <div className="card h-100 shadow-lg text-center hover-shadow bg-light border-0">
              <div className="card-body d-flex flex-column align-items-center justify-content-center">
                <i className="fas fa-tools fa-2x text-success mb-3"></i>
                <h5 className="card-title">Services</h5>
                <p className="card-text">
                  {shop?.servicesOffered?.length || 0} Services
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default MyShop;
