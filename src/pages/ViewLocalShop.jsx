import React from "react";
import { useAppContext } from "../context/AppContext";
import { useNavigate } from "react-router-dom";

function ViewLocalShop() {
  const { selectedViewLocalShop, selectedArea } = useAppContext();
  const navigate = useNavigate();

  if (!selectedViewLocalShop) {
    return (
      <div className="container mt-5 text-center">
        <div className="alert alert-info">
          <h4>No shop selected</h4>
          <p>Please select a shop to view details.</p>
        </div>
      </div>
    );
  }

  const shop = selectedViewLocalShop;
  const shopLat = shop?.location?.coordinates[1];
  const shopLng = shop?.location?.coordinates[0];

  const getGoogleMapsUrl = () => {
    if (selectedArea?.lat && selectedArea?.lng && shopLat && shopLng) {
      return `https://www.google.com/maps/dir/?api=1&origin=${selectedArea.lat},${selectedArea.lng}&destination=${shopLat},${shopLng}&travelmode=driving`;
    }
    return `https://www.google.com/maps/search/?api=1&query=${shopLat},${shopLng}`;
  };

  const viewOnGoogleMaps = () => {
    window.open(getGoogleMapsUrl(), "_blank");
  };

  const handleCall = () => {
    window.location.href = `tel:${shop.phone}`;
  };

  const handleWhatsApp = () => {
    const message = encodeURIComponent(
      `Hi, I found your shop "${shop.shopName}" on HazirHay. I'd like to know more about your services.`
    );
    window.open(
      `https://wa.me/${shop.phone.replace(/\D/g, "")}?text=${message}`,
      "_blank"
    );
  };

  const handleBack = () => {
    navigate(-1);
  };

  return (
    <div className="container py-4" style={{ maxWidth: "950px" }}>
      {/* Header with Back Button */}
      <div className="d-flex align-items-center justify-content-between mb-4">
        <button
          onClick={handleBack}
          className="btn btn-outline-secondary shadow-sm"
          style={{
            borderRadius: "8px",
            padding: "8px 16px",
            fontSize: "14px",
            fontWeight: "500",
          }}
        >
          <i className="fas fa-arrow-left me-2"></i>
          Back
        </button>
        <h2
          className="text-center fw-bold mb-0 flex-grow-1"
          style={{ fontSize: "22px" }}
        >
          Shop Details
        </h2>
        <div style={{ width: "90px" }}></div> {/* Spacer for centering */}
      </div>

      {/* Hero Banner */}
      <div
        className="position-relative rounded overflow-hidden shadow mb-4"
        style={{
          height: "200px",
          backgroundColor: "#e9ecef",
        }}
      >
        {shop.shopPicture ? (
          <img
            src={shop.shopPicture}
            alt={shop.shopName}
            className="w-100 h-100"
            style={{ objectFit: "cover" }}
          />
        ) : (
          <div className="d-flex align-items-center justify-content-center h-100 text-muted">
            <div className="text-center">
              <i className="fas fa-store fa-3x mb-3 opacity-50"></i>
              <p className="mb-0 fw-medium">No Image Available</p>
            </div>
          </div>
        )}
      </div>

      {/* Main Content Card */}
      <div className="card border-0 shadow-sm">
        <div className="card-body p-4 p-md-5">
          {/* Shop Header */}
          <div className="mb-4 pb-3 border-bottom text-center">
            <h1 className="h3 fw-bold mb-2 text-dark">{shop.shopName}</h1>
            <p className="text-primary mb-3 fs-5 fw-medium">{shop.position}</p>

            {/* Status Badges - Centered */}
            <div className="d-flex justify-content-center align-items-center gap-2 mb-3">
              {shop.isLive && (
                <span
                  className="badge bg-success px-3 py-2"
                  style={{ fontSize: "12px" }}
                >
                  <i
                    className="fas fa-circle me-1"
                    style={{ fontSize: "8px" }}
                  ></i>
                  Live Now
                </span>
              )}
              {shop.isVerified && (
                <span
                  className="badge bg-primary px-3 py-2"
                  style={{ fontSize: "12px" }}
                >
                  <i className="fas fa-check-circle me-1"></i>
                  Verified
                </span>
              )}
            </div>

            {/* Distance */}
            {shop.fixedDistance && (
              <div className="d-inline-flex align-items-center text-muted small">
                <i className="fas fa-location-arrow me-2"></i>
                <span>Approximately {shop.fixedDistance} km away</span>
              </div>
            )}
          </div>

          {/* Description */}
          {shop.description && (
            <div className="mb-4">
              <h6 className="fw-semibold text-dark mb-3">
                <i className="fas fa-info-circle text-primary me-2"></i>
                About This Shop
              </h6>
              <p className="text-muted mb-0" style={{ lineHeight: "1.7" }}>
                {shop.description}
              </p>
            </div>
          )}

          {/* Contact Information */}
          <div className="mb-4">
            <h6 className="fw-semibold text-dark mb-3">
              <i className="fas fa-address-book text-primary me-2"></i>
              Contact Details
            </h6>
            <div className="row g-3 mb-3">
              <div className="col-md-6">
                <div className="d-flex align-items-center p-3 bg-light rounded">
                  <div className="me-3">
                    <i className="fas fa-phone-alt text-success fa-lg"></i>
                  </div>
                  <div className="flex-grow-1">
                    <small className="text-muted d-block mb-1">
                      Phone Number
                    </small>
                    <span className="text-dark fw-medium">{shop.phone}</span>
                  </div>
                </div>
              </div>
              <div className="col-md-6">
                <div className="d-flex align-items-center p-3 bg-light rounded">
                  <div className="me-3">
                    <i className="fas fa-envelope text-danger fa-lg"></i>
                  </div>
                  <div className="flex-grow-1">
                    <small className="text-muted d-block mb-1">
                      Email Address
                    </small>
                    <a
                      href={`mailto:${shop.email}`}
                      className="text-decoration-none text-dark fw-medium text-break small"
                    >
                      {shop.email}
                    </a>
                  </div>
                </div>
              </div>
            </div>
            {/* Contact Action Buttons */}
            <div className="row g-2">
              <div className="col-md-6">
                <button
                  onClick={handleCall}
                  className="btn btn-success w-100 shadow-sm"
                  style={{
                    borderRadius: "8px",
                    padding: "10px",
                    fontSize: "14px",
                    fontWeight: "500",
                  }}
                >
                  <i className="fas fa-phone me-2"></i>
                  Call Now
                </button>
              </div>
              <div className="col-md-6">
                <button
                  onClick={handleWhatsApp}
                  className="btn btn-success w-100 shadow-sm"
                  style={{
                    borderRadius: "8px",
                    padding: "10px",
                    fontSize: "14px",
                    fontWeight: "500",
                    backgroundColor: "#25D366",
                    borderColor: "#25D366",
                  }}
                >
                  <i className="fab fa-whatsapp me-2 fa-lg"></i>
                  WhatsApp
                </button>
              </div>
            </div>
            <small className="text-muted d-block text-center mt-2">
              <i className="fas fa-info-circle me-1"></i>
              Quick contact options available
            </small>
          </div>

          {/* Location */}
          <div className="mb-4">
            <h6 className="fw-semibold text-dark mb-3">
              <i className="fas fa-map-marker-alt text-primary me-2"></i>
              Location & Address
            </h6>
            <div className="p-3 bg-light rounded">
              <div className="d-flex align-items-start">
                <i className="fas fa-map-pin text-danger mt-1 me-3"></i>
                <div>
                  <p className="mb-1 fw-medium text-dark">{shop.shopAddress}</p>
                  {shop.location?.area && (
                    <small className="text-muted">{shop.location.area}</small>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Google Maps Button */}
          <div className="mb-4">
            <button
              onClick={viewOnGoogleMaps}
              className="btn btn-primary btn-lg w-100 shadow-sm"
              style={{
                borderRadius: "8px",
                padding: "12px",
                fontSize: "15px",
                fontWeight: "500",
              }}
            >
              <i className="fas fa-directions me-2"></i>
              Get Directions on Google Maps
            </button>
            <small className="text-muted d-block text-center mt-2">
              <i className="fas fa-info-circle me-1"></i>
              Opens in a new tab
            </small>
          </div>

          {/* Services */}
          {shop.services && shop.services.length > 0 && (
            <div className="mb-4">
              <h6 className="fw-semibold text-dark mb-3">
                <i className="fas fa-concierge-bell text-primary me-2"></i>
                Available Services
              </h6>
              <div className="d-flex flex-wrap gap-2">
                {shop.services.map((service, index) => (
                  <span
                    key={index}
                    className="badge bg-white border shadow-sm text-dark px-3 py-2"
                    style={{ fontSize: "13px", fontWeight: "500" }}
                  >
                    <i
                      className="fas fa-check-circle text-success me-2"
                      style={{ fontSize: "11px" }}
                    ></i>
                    {service.name}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Menu Card */}
          {shop.menuCard && (
            <div className="mb-4">
              <h6 className="fw-semibold text-dark mb-3">
                <i className="fas fa-utensils text-primary me-2"></i>
                Menu / Price List
              </h6>
              <div className="border rounded overflow-hidden shadow-sm">
                <img
                  src={shop.menuCard}
                  alt="Menu Card"
                  className="w-100"
                  style={{
                    maxHeight: "600px",
                    objectFit: "contain",
                    backgroundColor: "#f8f9fa",
                  }}
                />
              </div>
            </div>
          )}

          {/* Payment Info */}
          {shop.paymentPic && (
            <div className="mb-4">
              <h6 className="fw-semibold text-dark mb-3">
                <i className="fas fa-credit-card text-primary me-2"></i>
                Payment Information
              </h6>
              <div className="border rounded overflow-hidden shadow-sm">
                <img
                  src={shop.paymentPic}
                  alt="Payment Info"
                  className="w-100"
                  style={{
                    maxHeight: "400px",
                    objectFit: "contain",
                    backgroundColor: "#f8f9fa",
                  }}
                />
              </div>
            </div>
          )}

          {/* Google Maps Embed */}
          {shopLat && shopLng && (
            <div className="mb-4">
              <h6 className="fw-semibold text-dark mb-3">
                <i className="fas fa-map text-primary me-2"></i>
                Shop Location on Map
              </h6>
              <div className="border rounded overflow-hidden shadow-sm">
                <iframe
                  src={`https://maps.google.com/maps?q=${shopLat},${shopLng}&z=15&output=embed`}
                  width="100%"
                  height="400"
                  style={{ border: 0 }}
                  allowFullScreen=""
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="Shop Location"
                ></iframe>
              </div>
              <small className="text-muted d-block text-center mt-2">
                <i className="fas fa-info-circle me-1"></i>
                Interactive map showing exact location
              </small>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ViewLocalShop;
