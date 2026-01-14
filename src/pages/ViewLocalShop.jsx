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
    <div
      className="min-vh-100"
      style={{
        background: "#f8f9fa",
        paddingBottom: "60px",
      }}
    >
      <div className="container py-4" style={{ maxWidth: "950px" }}>
        {/* Header with Back Button */}
        <div className="d-flex align-items-center justify-content-between mb-4">
          <button
            onClick={handleBack}
            className="btn btn-outline-secondary"
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
            className="text-center fw-bold mb-0 flex-grow-1 text-dark"
            style={{ fontSize: "22px" }}
          >
            Shop Details
          </h2>
          <div style={{ width: "90px" }}></div>
        </div>

        {/* Hero Banner */}
        <div
          className="position-relative rounded overflow-hidden shadow-sm mb-4"
          style={{
            height: "240px",
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
            <div className="d-flex align-items-center justify-content-center h-100 bg-light">
              <div className="text-center text-muted">
                <i className="fas fa-store fa-4x mb-3"></i>
                <p className="mb-0 fw-medium">No Image Available</p>
              </div>
            </div>
          )}
        </div>

        {/* Main Content Card */}
        <div className="card border-0 shadow-sm">
          <div className="card-body p-4 p-md-5">
            {/* Shop Header */}
            <div className="mb-4 pb-3 border-bottom">
              <h1 className="h4 fw-bold mb-2 text-dark">{shop.shopName}</h1>
              <p className="text-muted mb-2" style={{ fontSize: "14px" }}>
                <i className="fas fa-building me-2"></i>
                Floor: {shop.position}
              </p>

              {/* Status Badges */}
              <div className="d-flex align-items-center gap-2 mb-2">
                {shop.isLive && (
                  <span
                    className="badge bg-success px-2 py-1"
                    style={{ fontSize: "11px" }}
                  >
                    <i
                      className="fas fa-circle me-1"
                      style={{ fontSize: "7px" }}
                    ></i>
                    Live Now
                  </span>
                )}
                {shop.isVerified && (
                  <span
                    className="badge bg-primary px-2 py-1"
                    style={{ fontSize: "11px" }}
                  >
                    <i className="fas fa-check-circle me-1"></i>
                    Verified
                  </span>
                )}
              </div>

              {/* Distance */}
              {shop.fixedDistance && (
                <div className="text-muted" style={{ fontSize: "13px" }}>
                  <i className="fas fa-location-arrow me-1"></i>
                  <span>{shop.fixedDistance} km away</span>
                </div>
              )}
            </div>

            {/* Description */}
            {shop.description && (
              <div className="mb-3">
                <h6
                  className="fw-semibold text-dark mb-2"
                  style={{ fontSize: "15px" }}
                >
                  <i className="fas fa-info-circle text-primary me-2"></i>
                  About This Shop
                </h6>
                <p
                  className="text-muted mb-0"
                  style={{ fontSize: "14px", lineHeight: "1.6" }}
                >
                  {shop.description}
                </p>
              </div>
            )}

            {/* Contact Information */}
            <div className="mb-3">
              <h6
                className="fw-semibold text-dark mb-2"
                style={{ fontSize: "15px" }}
              >
                <i className="fas fa-address-book text-primary me-2"></i>
                Contact Details
              </h6>
              <div className="row g-2 mb-2">
                <div className="col-md-6">
                  <div className="d-flex align-items-center p-2 bg-light rounded">
                    <div className="me-2">
                      <i className="fas fa-phone-alt text-success"></i>
                    </div>
                    <div className="flex-grow-1">
                      <small
                        className="text-muted d-block"
                        style={{ fontSize: "11px" }}
                      >
                        Phone Number
                      </small>
                      <span
                        className="text-dark fw-medium"
                        style={{ fontSize: "13px" }}
                      >
                        {shop.phone}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="d-flex align-items-center p-2 bg-light rounded">
                    <div className="me-2">
                      <i className="fas fa-envelope text-danger"></i>
                    </div>
                   
                  </div>
                </div>
              </div>
              {/* Contact Action Buttons */}
              <div className="row g-2">
                <div className="col-md-6">
                  <button
                    onClick={handleCall}
                    className="btn btn-success w-100 btn-sm"
                  >
                    <i className="fas fa-phone me-1"></i>
                    Call Now
                  </button>
                </div>
                <div className="col-md-6">
                  <button
                    onClick={handleWhatsApp}
                    className="btn btn-sm w-100"
                    style={{
                      backgroundColor: "#25D366",
                      color: "white",
                    }}
                  >
                    <i className="fab fa-whatsapp me-1"></i>
                    WhatsApp
                  </button>
                </div>
              </div>
            </div>

            {/* Address */}
            <div className="mb-3">
              <h6
                className="fw-semibold text-dark mb-2"
                style={{ fontSize: "15px" }}
              >
                <i className="fas fa-map-marker-alt text-primary me-2"></i>
                Address
              </h6>
              <div className="p-2 bg-light rounded">
                <p className="mb-0 text-dark" style={{ fontSize: "13px" }}>
                  <i className="fas fa-map-pin text-danger me-2"></i>
                  {shop.shopAddress}
                </p>
              </div>
            </div>

            {/* Services */}
            {shop.services && shop.services.length > 0 && (
              <div className="mb-3">
                <h6
                  className="fw-semibold text-dark mb-2"
                  style={{ fontSize: "15px" }}
                >
                  <i className="fas fa-concierge-bell text-primary me-2"></i>
                  Available Services
                </h6>
                <div className="d-flex flex-wrap gap-2">
                  {shop.services.map((service, index) => (
                    <span
                      key={index}
                      className="badge bg-light text-dark border px-2 py-1"
                      style={{ fontSize: "12px", fontWeight: "500" }}
                    >
                      <i
                        className="fas fa-check-circle text-success me-1"
                        style={{ fontSize: "10px" }}
                      ></i>
                      {service.name}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Price List / Menu */}
            {shop.menuCard && shop.menuCard.length > 0 && (
              <div className="mb-3">
                <h6
                  className="fw-semibold text-dark mb-2"
                  style={{ fontSize: "15px" }}
                >
                  <i className="fas fa-file-invoice text-primary me-2"></i>
                  Price List
                </h6>

                <div
                  id="menuCarousel"
                  className="carousel slide border rounded shadow-sm mx-auto"
                  data-bs-ride="carousel"
                  style={{
                    width: "100%",
                    maxWidth: "450px",
                    backgroundColor: "#f8f9fa",
                  }}
                >
                  {/* Indicators */}
                  {shop.menuCard.length > 1 && (
                    <div className="carousel-indicators">
                      {shop.menuCard.map((_, index) => (
                        <button
                          type="button"
                          key={index}
                          data-bs-target="#menuCarousel"
                          data-bs-slide-to={index}
                          className={index === 0 ? "active" : ""}
                          aria-current={index === 0 ? "true" : undefined}
                          aria-label={`Slide ${index + 1}`}
                        ></button>
                      ))}
                    </div>
                  )}

                  {/* Slides */}
                  <div className="carousel-inner">
                    {shop.menuCard.map((url, index) => (
                      <div
                        className={`carousel-item ${
                          index === 0 ? "active" : ""
                        }`}
                        key={index}
                      >
                        <img
                          src={url}
                          className="d-block w-100"
                          alt={`Price List ${index + 1}`}
                          style={{
                            width: "100%",
                            height: "auto",
                            maxHeight: "450px",
                            objectFit: "contain",
                            backgroundColor: "#f8f9fa",
                          }}
                        />
                      </div>
                    ))}
                  </div>

                  {/* Controls */}
                  {shop.menuCard.length > 1 && (
                    <>
                      <button
                        className="carousel-control-prev"
                        type="button"
                        data-bs-target="#menuCarousel"
                        data-bs-slide="prev"
                      >
                        <span
                          className="carousel-control-prev-icon"
                          aria-hidden="true"
                        ></span>
                        <span className="visually-hidden">Previous</span>
                      </button>
                      <button
                        className="carousel-control-next"
                        type="button"
                        data-bs-target="#menuCarousel"
                        data-bs-slide="next"
                      >
                        <span
                          className="carousel-control-next-icon"
                          aria-hidden="true"
                        ></span>
                        <span className="visually-hidden">Next</span>
                      </button>
                    </>
                  )}
                </div>
              </div>
            )}

            {/* Google Maps Embed */}
            {shopLat && shopLng && (
              <div className="mb-3">
                <h6
                  className="fw-semibold text-dark mb-2"
                  style={{ fontSize: "15px" }}
                >
                  <i className="fas fa-map text-primary me-2"></i>
                  Location on Map
                </h6>
                <div className="border rounded overflow-hidden shadow-sm mb-2">
                  <iframe
                    src={`https://maps.google.com/maps?q=${shopLat},${shopLng}&z=15&output=embed`}
                    width="100%"
                    height="350"
                    style={{ border: 0 }}
                    allowFullScreen=""
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    title="Shop Location"
                  ></iframe>
                </div>
                <button
                  onClick={viewOnGoogleMaps}
                  className="btn btn-primary w-100 btn-sm"
                >
                  <i className="fas fa-directions me-2"></i>
                  Get Directions on Google Maps
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default ViewLocalShop;
