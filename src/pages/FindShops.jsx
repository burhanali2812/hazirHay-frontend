import React, { useState, useEffect, useMemo, useCallback } from "react";
import puncture from "../images/puncture.png";
import petrol from "../images/petrol.png";
import mechanic from "../images/mechanic.png";
import pharmacy from "../images/pharmacy.png";
import processing from "../videos/processing.mp4";
import { useAppContext } from "../context/AppContext";
import { useNavigate } from "react-router-dom";
import { ShopServices } from "../components/ShopServices";
import { RiWifiFill, RiWifiOffFill } from "react-icons/ri";
import axios from "axios";

function FindShops() {
  const {
    selectedArea,
    setSelectedViewLocalShop,
    selectedCategory,
    setSelectedCategory,
    calculateApproxDistance,
    token,
    allShops,
    setAllShops,
  } = useAppContext();

  const [filterModal, setFilterModal] = useState(false);
  const [categorySearch, setCategorySearch] = useState("");
  const [isLoadingShops, setIsLoadingShops] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const [kmRange, setKmRange] = useState(10);
  const [localSearchQuery, setLocalSearchQuery] = useState("");
  const shopsPerPage = 5;

  const navigate = useNavigate();

  // Memoize quickData to prevent recreation on every render
  const quickData = useMemo(
    () => [
      { img: puncture, label: "Puncture", category: "Puncture" },
      { img: petrol, label: "Petrol Pump", category: "Petrol / CNG Station" },
      { img: mechanic, label: "Mechanic", category: "Car Repair / Mechanic" },
      {
        img: pharmacy,
        label: "Pharmacy",
        category: "Pharmacy / Medical Store",
      },
    ],
    []
  );

  const getTopTenLocalShops = async (cat) => {
    try {
      const res = await axios.get(
        `https://hazir-hay-backend.vercel.app/localShop/getAllVerifiedLiveLocalShops`,
        {
          params: {
            category: cat || selectedCategory,
            type: "",
            name: "",
            t: Date.now(),
          },
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const shopsWithDistance = res.data.shops.map((shop) => {
        const shopCoords = shop.location?.coordinates; // [lng, lat]
        if (shopCoords && selectedArea?.lat && selectedArea?.lng) {
          return {
            ...shop,
            fixedDistance: calculateApproxDistance(shopCoords),
          };
        }
        return {
          ...shop,
          fixedDistance: "N/A",
        };
      });

      // Sort by distance and get top 15 nearest shops
      const sortedShops = shopsWithDistance
        .filter((shop) => shop.fixedDistance !== "N/A") // Filter out shops without valid distance
        .sort(
          (a, b) => parseFloat(a.fixedDistance) - parseFloat(b.fixedDistance)
        )
        .slice(0, 15); // Get only top 15 nearest shops

      setAllShops(sortedShops);
      setIsLoadingShops(false);
    } catch (error) {
      console.log("local shop getting err", error);
      setIsLoadingShops(false);
      if (error.response?.status === 404) {
        setAllShops([]);
      }
    }
  };

  // Handle quick access click
  const handleQuickAccess = useCallback(
    (category) => {
      setIsLoadingShops(true);
      setSelectedCategory(category);
      setCurrentPage(1);
      getTopTenLocalShops(category);
    },
    [selectedArea]
  );
  // Filter shops by km range and search query
  const filteredShops = useMemo(() => {
    let filtered = allShops.filter(
      (shop) => parseFloat(shop.fixedDistance) <= kmRange
    );

    // Apply search filter if search query exists
    if (localSearchQuery.trim()) {
      const query = localSearchQuery.toLowerCase();
      filtered = filtered.filter((shop) => {
        const shopName = shop.shopName?.toLowerCase() || "";
        const services = shop.services?.join(" ").toLowerCase() || "";
        const address = shop.address?.toLowerCase() || "";
        return (
          shopName.includes(query) ||
          services.includes(query) ||
          address.includes(query)
        );
      });
    }

    return filtered;
  }, [allShops, kmRange, localSearchQuery]);

  // Pagination logic
  const indexOfLastShop = currentPage * shopsPerPage;
  const indexOfFirstShop = indexOfLastShop - shopsPerPage;
  const currentShops = filteredShops.slice(indexOfFirstShop, indexOfLastShop);
  const totalPages = Math.ceil(filteredShops.length / shopsPerPage);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Memoize filtered categories
  const filteredCategories = useMemo(() => {
    return ShopServices?.filter((item) =>
      item.toLowerCase().includes(categorySearch.toLowerCase())
    );
  }, [categorySearch]);

  const handleSelectCategory = useCallback(
    (cat) => {
      setSelectedCategory(cat);
      setIsLoadingShops(true);
      setCurrentPage(1);
      getTopTenLocalShops(cat);
    },
    [selectedArea]
  );

  const applyKmFilter = useCallback(() => {
    setCurrentPage(1);
    setFilterModal(false);
  }, []);

  const openGoogleMaps = useCallback(
    (shopCoords) => {
      const url = `https://www.google.com/maps/dir/?api=1&origin=${selectedArea?.lat},${selectedArea?.lng}&destination=${shopCoords[1]},${shopCoords[0]}&travelmode=driving`;
      window.open(url, "_blank");
    },
    [selectedArea]
  );

  const navigateToShop = useCallback(
    (shop) => {
      setSelectedViewLocalShop(shop);
      navigate("/admin/user/localShop/viewLocalShop");
    },
    [setSelectedViewLocalShop, navigate]
  );

  return (
    <>
      <div className="bg-light py-3">
        <div
          className="d-flex align-items-center bg-white rounded-pill mx-3 px-3 w-auto "
          style={{
            height: "35px",
            cursor: "pointer",
            transition: "0.2s",
          }}
          onClick={() => navigate("/admin/user/dashboard")}
          title="View on map"
        >
          <i className="fas fa-map-marker-alt text-danger me-2"></i>
          <span
            className="text-muted small fw-semibold"
            style={{
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
              flex: 1,
            }}
          >
            {selectedArea?.areaName
              ? selectedArea?.areaName
              : "Select Your Location"}
          </span>
        </div>
      </div>

      <div className="container" style={{ marginBottom: "55px" }}>
        <div className="mt-3">
          <h6 className="fw-bold mx-2">Quick Access</h6>

          <div style={{ overflowX: "auto", whiteSpace: "nowrap" }}>
            <div
              className="d-flex gap-2 flex-nowrap p-2"
              style={{ width: "max-content" }}
            >
              {quickData?.length > 0 &&
                quickData?.map((data, ind) => {
                  return (
                    <div
                      className="card bg-light shadow-sm"
                      key={ind}
                      style={{
                        width: "100px",
                        height: "100px",
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "center",
                        alignItems: "center",
                        textAlign: "center",
                        cursor: "pointer",
                        transition: "all 0.3s ease",
                      }}
                      onClick={() => handleQuickAccess(data.category)}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = "translateY(-4px)";
                        e.currentTarget.style.boxShadow =
                          "0 4px 12px rgba(0,0,0,0.15)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = "translateY(0)";
                        e.currentTarget.style.boxShadow = "";
                      }}
                    >
                      <img
                        src={data.img}
                        alt={data.label}
                        style={{
                          width: "65px",
                          height: "85px",
                          objectFit: "contain",
                          pointerEvents: "none",
                        }}
                      />
                      <h6 className="fw-bold" style={{ fontSize: "15px" }}>
                        {data.label}
                      </h6>
                    </div>
                  );
                })}
            </div>
          </div>
        </div>

        <div className="d-flex justify-content-between align-items-center mt-4 mx-1">
          {/* 1. SEARCHABLE CATEGORY DROPDOWN */}
          <div className="dropdown">
            <button
              className="btn btn-outline-primary btn-sm px-2 rounded-pill dropdown-toggle"
              data-bs-toggle="dropdown"
            >
              <i class="fa-solid fa-list me-1"></i>
              {selectedCategory === null ? "Select Category" : selectedCategory}
            </button>

            <div className="dropdown-menu p-2" style={{ width: "250px" }}>
              {/* Search Input */}
              <input
                type="text"
                className="form-control form-control-sm mb-2"
                placeholder="Search category..."
                onChange={(e) => setCategorySearch(e.target.value)}
              />

              {/* List */}
              <div style={{ maxHeight: "250px", overflowY: "auto" }}>
                {filteredCategories?.length > 0 ? (
                  filteredCategories?.map((item, i) => (
                    <button
                      key={i}
                      className="dropdown-item"
                      onClick={() => handleSelectCategory(item)}
                    >
                      {item}
                    </button>
                  ))
                ) : (
                  <div className="text-center text-muted py-2">
                    <small>No categories found</small>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Filter Button */}
          <button
            className="btn btn-outline-primary btn-sm px-3 rounded-pill"
            onClick={() => setFilterModal(true)}
          >
            <i className="fa-solid fa-filter me-1"></i>
            Filter ({kmRange} km)
          </button>
        </div>

        {/* Search Input */}
        {allShops.length > 0 && (
          <div className="position-relative mt-3">
            <input
              type="text"
              className="form-control rounded-pill ps-5 pe-5 shadow-sm"
              placeholder="Search by shop name, services, or address..."
              value={localSearchQuery}
              onChange={(e) => {
                setLocalSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              style={{
                fontSize: "14px",
                border: "1px solid #e0e0e0",
              }}
            />
            <span className="position-absolute top-50 start-0 translate-middle-y ps-3 text-muted">
              <i className="fa-solid fa-magnifying-glass"></i>
            </span>
            {localSearchQuery && (
              <button
                className="btn btn-sm position-absolute top-50 end-0 translate-middle-y me-2 p-0"
                onClick={() => {
                  setLocalSearchQuery("");
                  setCurrentPage(1);
                }}
                style={{
                  background: "none",
                  border: "none",
                  color: "#999",
                  fontSize: "18px",
                }}
              >
                <i className="fa-solid fa-times-circle"></i>
              </button>
            )}
          </div>
        )}

        <div className="mt-4 mb-4">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h6 className="fw-bold mx-2">
              {selectedCategory ? `${selectedCategory} Shops` : "Nearby Shops"}
              {filteredShops.length > 0 && (
                <span className="text-muted ms-2" style={{ fontSize: "13px" }}>
                  ({filteredShops.length} found)
                </span>
              )}
            </h6>
          </div>
          {isLoadingShops ? (
            <div className="text-center mt-5">
              <div
                className="spinner-border text-primary"
                role="status"
                style={{ width: "3rem", height: "3rem" }}
              >
                <span className="visually-hidden">Loading...</span>
              </div>
              <p className="text-muted mt-3 fw-semibold">
                Finding nearest shops...
              </p>
            </div>
          ) : !selectedCategory ? (
            <>
              <div className="d-flex justify-content-center align-items-center mt-3">
                <video
                  src={processing}
                  autoPlay
                  loop
                  muted
                  playsInline
                  style={{
                    width: "160px",
                    height: "160px",
                    objectFit: "contain",
                  }}
                />
              </div>
              <div className="text-center mt-3">
                <h5 className="fw-bold" style={{ letterSpacing: "1px" }}>
                  {" "}
                  Find What You Need{" "}
                </h5>
                <h6 className="fw-bold" style={{ color: "#ff6600" }}>
                  {" "}
                  Type it, tap it — let the magic begin!{" "}
                </h6>
                <p
                  className="text-secondary mx-auto"
                  style={{ maxWidth: "600px" }}
                >
                  {" "}
                  Looking for a shop, a service, or a place everyone talks
                  about? Just type the name — we’ll locate it quicker than you
                  can say <span style={{ color: "#ff6600" }}>
                    "Found it!"
                  </span>{" "}
                  😄{" "}
                </p>
              </div>
            </>
          ) : allShops.length > 0 ? (
            <>
              {currentShops?.map((shop, ind) => (
                <div
                  key={ind}
                  className="card border-0 shadow-sm mb-3 px-2"
                  style={{
                    borderRadius: "18px",
                    background: "#ffffff",
                  }}
                >
                  <div className="d-flex p-3">
                    {/* LEFT IMAGE */}
                    <div
                      style={{
                        width: "65px",
                        height: "65px",
                        borderRadius: "12px",
                        overflow: "hidden",
                        background: "#f1f1f1",
                        border: "1px solid #eee",
                        flexShrink: 0,
                      }}
                    >
                      {shop?.shopPicture ? (
                        <img
                          src={shop.shopPicture}
                          alt="Shop"
                          style={{
                            width: "100%",
                            height: "100%",
                            objectFit: "cover",
                          }}
                        />
                      ) : (
                        <div className="d-flex justify-content-center align-items-center h-100">
                          <i
                            className="fa-solid fa-shop text-muted"
                            style={{ fontSize: "28px" }}
                          ></i>
                        </div>
                      )}
                    </div>

                    {/* RIGHT CONTENT */}
                    <div className="ms-3 flex-grow-1">
                      {/* NAME + ONLINE STATUS */}
                      <div className="d-flex justify-content-between align-items-center">
                        <h6
                          className="fw-bold mb-0"
                          style={{ fontSize: "15px" }}
                        >
                          {shop.shopName}
                        </h6>

                        <span
                          className="badge rounded-pill"
                          style={{
                            background: shop.isLive ? "#d4f8da" : "#ffe6e6",
                            color: shop.isLive ? "#0a8a2a" : "#b10000",
                            fontSize: "11px",
                          }}
                        >
                          {shop.isLive ? "Online" : "Offline"}
                        </span>
                      </div>

                      {/* DISTANCE */}
                      <div className="text-secondary small mt-1">
                        <i className="fa-solid fa-location-dot text-danger me-1"></i>
                        {shop.fixedDistance} km away
                      </div>

                      {/* ADDRESS */}
                      <div
                        className="text-muted small mt-1"
                        style={{
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          maxWidth: "200px",
                          fontSize: "12px",
                        }}
                      >
                        {shop?.shopAddress}
                      </div>
                    </div>
                  </div>

                  <div className="d-flex w-100 justify-content-between mb-3">
                    {/* CALL */}
                    <a
                      href={`tel:${shop.phone}`}
                      className="btn btn-light shadow-sm flex-fill mx-1 d-flex align-items-center justify-content-center"
                      style={{ borderRadius: "12px", padding: "10px 0" }}
                    >
                      <i className="fa-solid fa-phone text-primary me-1"></i>
                      <span style={{ fontSize: "12px" }}>Call</span>
                    </a>

                    {/* WHATSAPP */}
                    <a
                      href={`https://wa.me/${shop.phone}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-light shadow-sm flex-fill mx-1 d-flex align-items-center justify-content-center"
                      style={{ borderRadius: "12px", padding: "10px 0" }}
                    >
                      <i className="fa-brands fa-whatsapp text-success me-1 fa-lg"></i>
                      <span style={{ fontSize: "12px" }}>WhatsApp</span>
                    </a>

                    {/* MAP */}
                    <button
                      className="btn btn-light shadow-sm flex-fill mx-1 d-flex align-items-center justify-content-center"
                      style={{ borderRadius: "12px", padding: "10px 0" }}
                      onClick={() => openGoogleMaps(shop.location?.coordinates)}
                    >
                      <i className="fa-solid fa-map-location-dot text-danger me-1"></i>
                      <span style={{ fontSize: "12px" }}>Map</span>
                    </button>

                    {/* DETAILS */}
                    <button
                      className="btn btn-light shadow-sm flex-fill mx-1 d-flex align-items-center justify-content-center"
                      style={{ borderRadius: "12px", padding: "10px 0" }}
                      onClick={() => navigateToShop(shop)}
                    >
                      <i className="fa-solid fa-chevron-right text-danger me-1"></i>
                      <span style={{ fontSize: "12px" }}>Details</span>
                    </button>
                  </div>
                </div>
              ))}

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="d-flex justify-content-center mt-4 mb-3">
                  <nav>
                    <ul className="pagination pagination-sm">
                      <li
                        className={`page-item ${
                          currentPage === 1 ? "disabled" : ""
                        }`}
                      >
                        <button
                          className="page-link"
                          onClick={() => handlePageChange(currentPage - 1)}
                          disabled={currentPage === 1}
                        >
                          Previous
                        </button>
                      </li>
                      {[...Array(totalPages)].map((_, index) => (
                        <li
                          key={index}
                          className={`page-item ${
                            currentPage === index + 1 ? "active" : ""
                          }`}
                        >
                          <button
                            className="page-link"
                            onClick={() => handlePageChange(index + 1)}
                          >
                            {index + 1}
                          </button>
                        </li>
                      ))}
                      <li
                        className={`page-item ${
                          currentPage === totalPages ? "disabled" : ""
                        }`}
                      >
                        <button
                          className="page-link"
                          onClick={() => handlePageChange(currentPage + 1)}
                          disabled={currentPage === totalPages}
                        >
                          Next
                        </button>
                      </li>
                    </ul>
                  </nav>
                </div>
              )}
            </>
          ) : (
            // Empty state when no data
            <div className="text-center mt-4">
              <h5 className="fw-bold text-secondary">No Shops Found</h5>
              <p className="text-muted">Try adjusting your km range filter</p>
            </div>
          )}
        </div>
        {filterModal && (
          <div
            className="modal fade show d-block"
            tabIndex="-1"
            style={{
              backgroundColor: "rgba(0, 0, 0, 0.6)",
              backdropFilter: "blur(2px)",
            }}
          >
            <div
              className="modal-dialog modal-sm"
              style={{
                position: "fixed",
                bottom: "0",
                left: "50%",
                transform: "translateX(-50%)",
                margin: 0,
                width: "100%",
                maxWidth: "400px",
                animation: "slideUp 0.3s ease",
              }}
            >
              <div
                className="modal-content shadow-lg border-0"
                style={{
                  borderRadius: "15px 15px 0 0",
                  overflow: "hidden",
                }}
              >
                {/* Header */}
                <div
                  className="modal-header text-light py-2 px-3"
                  style={{
                    backgroundColor: "#1e1e2f",
                  }}
                >
                  <h6 className="modal-title m-0">Filter</h6>
                  <button
                    type="button"
                    className="btn-close btn-close-white"
                    aria-label="Close"
                    onClick={() => setFilterModal(false)}
                  ></button>
                </div>

                {/* Body */}
                <div className="modal-body text-start container">
                  <div className="mb-4">
                    <label className="form-label fw-semibold">
                      Distance Range (KM)
                    </label>
                    <div className="d-flex align-items-center gap-3">
                      <input
                        type="range"
                        className="form-range flex-grow-1"
                        min="1"
                        max="50"
                        value={kmRange}
                        onChange={(e) => setKmRange(Number(e.target.value))}
                      />
                      <span
                        className="badge bg-primary fs-6"
                        style={{ minWidth: "60px" }}
                      >
                        {kmRange} km
                      </span>
                    </div>
                    <div className="d-flex justify-content-between mt-2">
                      <small className="text-muted">1 km</small>
                      <small className="text-muted">50 km</small>
                    </div>
                  </div>

                  <button
                    className="btn btn-primary w-100 rounded-pill"
                    onClick={applyKmFilter}
                  >
                    Apply Filter<i className="fa-solid fa-check ms-2"></i>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

export default FindShops;
