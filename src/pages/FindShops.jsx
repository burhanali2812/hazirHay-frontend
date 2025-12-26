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

function FindShops() {
  const {
    selectedArea,
    localShopData,
    setSelectedViewLocalShop,
    selectedCategory,
    setSelectedCategory,
    searchType,
    setSearchType,
    searchQuery,
    setSearchQuery,
    searchData,
    setSearchData,
    sortOrder,
    setSortOrder,
    localShopNames,
    localShopServices,
    setFinalSearchData,
  } = useAppContext();

  const [filterModal, setFilterModal] = useState(false);
  const [filterLoading, setFilterLoading] = useState(false);
  const [suggestionLoading, setSuggestionLoading] = useState(false);
  const [categorySearch, setCategorySearch] = useState("");
  const [isLoadingShops, setIsLoadingShops] = useState(false);
  const [displayedShops, setDisplayedShops] = useState([]);
  const [searchInputLoading, setSearchInputLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);

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

  // Handle quick access click
  const handleQuickAccess = useCallback(
    (category) => {
      setIsLoadingShops(true);

      setSelectedCategory(category);
      setSearchQuery("");
      setSearchData([]);
      setShowSuggestions(false);
      setSuggestionLoading(true);
      console.log("Quick Access Category:", category);
      console.log("localshops:", localShopData);
    },
    [
      setSelectedCategory,
      setSearchType,
      setSearchQuery,
      setSearchData,
      setFinalSearchData,
      localShopData,
    ]
  );
  useEffect(() => {
    // setDisplayedShops(localShopData);
    setIsLoadingShops(false);
  }, [localShopData]);

  // Memoize filtered categories
  const filteredCategories = useMemo(() => {
    return ShopServices?.filter((item) =>
      item.toLowerCase().includes(categorySearch.toLowerCase())
    );
  }, [categorySearch]);

  const handleSelectCategory = useCallback(
    (cat) => {
      setSelectedCategory(cat);
      console.log("Selected Category:", cat);
    },
    [setSelectedCategory]
  );

  const finalSearchSuggestion = useMemo(
    () => (searchType === "shopName" ? localShopNames : localShopServices),
    [searchType, localShopNames, localShopServices]
  );

  // Debounced search handler with loading state
  const handleChange = useCallback(
    (e) => {
      const value = e.target.value.toLowerCase();
      setSearchQuery(value);

      if (value?.length === 0) {
        setSearchInputLoading(false);
        setSearchData([]);
        setShowSuggestions(false);
        return;
      }

      setSearchInputLoading(true);

      // Debounce search for better performance
      const timer = setTimeout(() => {
        let data = finalSearchSuggestion?.filter((shop) => {
          const nameMatch = shop?.toLowerCase().includes(value);
          return nameMatch;
        });

        setSearchData(data);
        setSearchInputLoading(false);
        setShowSuggestions(true);
      }, 300);

      return () => clearTimeout(timer);
    },
    [finalSearchSuggestion, setSearchQuery, setSearchData]
  );

  const openGoogleMaps = useCallback(
    (shopCoords) => {
      const url = `https://www.google.com/maps/dir/?api=1&origin=${selectedArea?.lat},${selectedArea?.lng}&destination=${shopCoords[1]},${shopCoords[0]}&travelmode=driving`;
      window.open(url, "_blank");
    },
    [selectedArea]
  );

  const applyFilter = useCallback(() => {
    setFilterLoading(true);

    // Simulate async operation
    setTimeout(() => {
      let sortedData = [...displayedShops];

      if (sortOrder === "low-to-high") {
        sortedData.sort(
          (a, b) => parseFloat(a.fixedDistance) - parseFloat(b.fixedDistance)
        );
      } else if (sortOrder === "high-to-low") {
        sortedData.sort(
          (a, b) => parseFloat(b.fixedDistance) - parseFloat(a.fixedDistance)
        );
      }

      setDisplayedShops(sortedData);
      setFilterLoading(false);
      setFilterModal(false);
    }, 400);
  }, [displayedShops, sortOrder]);

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

          {/* 2. SIMPLE SEARCH TYPE DROPDOWN */}
          <div className="dropdown">
            <button
              className="btn btn-outline-primary btn-sm px-2 rounded-pill dropdown-toggle"
              data-bs-toggle="dropdown"
            >
              <i class="fa-brands fa-searchengin me-1"></i>
              {searchType === ""
                ? "Search By"
                : searchType === "shopName"
                ? "Shop Name"
                : "Services"}
            </button>

            <ul className="dropdown-menu">
              <li>
                <button
                  className="dropdown-item"
                  onClick={() => setSearchType("shopName")}
                >
                  Shop Name
                </button>
              </li>
              <li>
                <button
                  className="dropdown-item"
                  onClick={() => setSearchType("services")}
                >
                  Services
                </button>
              </li>
            </ul>
          </div>
        </div>

        <form className="d-flex position-relative w-100" role="search">
          {/* SEARCH INPUT */}
          <div className="position-relative w-100 mt-3">
            <input
              type="search"
              className={`form-control rounded-pill ps-5 shadow-sm 
      ${!(selectedCategory && searchType) ? "bg-light" : ""}`}
              placeholder={`Search ${
                selectedCategory ? selectedCategory : "shops/services"
              } by ${
                searchType === "shopName"
                  ? "Shop Name"
                  : searchType === "services"
                  ? "Services"
                  : "..."
              }`}
              disabled={!(selectedCategory && searchType)}
              value={searchQuery}
              onChange={handleChange}
            />

            {/* Search Icon */}
            <span className="position-absolute top-50 start-0 translate-middle-y ps-3 text-muted">
              <i className="fa-solid fa-magnifying-glass"></i>
            </span>

            {/* Loading Spinner */}
            {searchInputLoading && (
              <span className="position-absolute top-50 end-0 translate-middle-y pe-3">
                <div
                  className="spinner-border spinner-border-sm text-primary"
                  role="status"
                >
                  <span className="visually-hidden">Searching...</span>
                </div>
              </span>
            )}

            {/* SUGGESTION DROPDOWN */}
            {searchQuery?.length > 0 &&
              searchData?.length > 0 &&
              !searchInputLoading &&
              showSuggestions && (
                <div
                  className="position-absolute w-100 bg-white shadow-lg mt-2"
                  style={{
                    top: "100%",
                    zIndex: 9999,
                    maxHeight: "260px",
                    overflowY: "auto",
                    borderRadius: "12px",
                    border: "1px solid #e5e7eb",
                  }}
                >
                  {searchData.map((suggestion, index) => (
                    <div key={index}>
                      <button
                        type="button"
                        className="w-100 d-flex align-items-center text-start border-0 bg-white suggestion-item"
                        onClick={() => {
                          setSearchQuery(suggestion);
                          setSuggestionLoading(true);
                          setShowSuggestions(false);
                          let filtered = finalSearchSuggestion?.filter(
                            (shop) =>
                              shop.toLowerCase() === suggestion.toLowerCase()
                          );
                          setFinalSearchData(filtered);
                        }}
                        style={{
                          padding: "10px 14px",
                          fontSize: "15px",
                          width: "100%",
                          cursor: "pointer",
                        }}
                      >
                        <i className="fa-regular fa-clock me-2 text-muted"></i>
                        {suggestion}
                      </button>

                      {/* Divider (Google style) */}
                      {index !== searchData?.length - 1 && (
                        <div
                          style={{ borderBottom: "1px solid #f1f1f1" }}
                        ></div>
                      )}
                    </div>
                  ))}
                </div>
              )}
          </div>
        </form>

        <div className="mt-4 mb-4">
          <div className="d-flex justify-content-between mb-4">
            <h6 className="fw-bold mx-2">Filtered shops</h6>
            <i
              className="fa-solid fa-filter me-2 text-primary"
              onClick={() => setFilterModal(true)}
            ></i>
          </div>
          {isLoadingShops ? (
            // Loading spinner
            <div className="text-center mt-5">
              <div
                className="spinner-border text-primary"
                role="status"
                style={{ width: "3rem", height: "3rem" }}
              >
                <span className="visually-hidden">Loading...</span>
              </div>
              <p className="text-muted mt-3 fw-semibold">
                Finding nearby shops...
              </p>
            </div>
          ) : !suggestionLoading ? (
            // Loading animation while fetching
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
          ) : localShopData?.length > 0 ? (
            // Show shop cards only if data exists
            localShopData?.map((shop, ind) => (
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
                      <h6 className="fw-bold mb-0" style={{ fontSize: "15px" }}>
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
            ))
          ) : (
            // Empty state when no data
            <div className="text-center mt-4">
              <h5 className="fw-bold text-secondary">No Shops Found</h5>
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
                  <div className="mb-3">
                    <label className="form-label fw-semibold">
                      Filter By Status
                    </label>

                    <div className="d-flex gap-2 text-center justify-content-center">
                      <button
                        className="btn btn-outline-primary btn-sm rounded-pill px-4"
                        onClick={() => setSortOrder("all")}
                      >
                        All
                      </button>

                      <button
                        className={`btn btn${
                          sortOrder === "low-to-high" ? "" : "-outline"
                        }-primary btn-sm rounded-pill px-2`}
                        onClick={() => setSortOrder("low-to-high")}
                      >
                        <RiWifiFill className="me-2" />
                        Online
                      </button>
                      <button
                        className={`btn btn${
                          sortOrder === "high-to-low" ? "" : "-outline"
                        }-primary btn-sm rounded-pill px-2`}
                        onClick={() => setSortOrder("high-to-low")}
                      >
                        <RiWifiOffFill className="me-2" />
                        Offline
                      </button>
                    </div>
                  </div>
                  <div className=" mb-3 mt-3">
                    <label className="form-label fw-semibold">
                      Sort by Distance
                    </label>

                    <div className="d-flex gap-2 text-center justify-content-center">
                      <button
                        className="btn btn-outline-primary btn-sm rounded-pill px-4"
                        onClick={() => setSortOrder("all")}
                      >
                        All
                      </button>

                      <button
                        className={`btn btn${
                          sortOrder === "low-to-high" ? "" : "-outline"
                        }-primary btn-sm rounded-pill px-2`}
                        onClick={() => setSortOrder("low-to-high")}
                      >
                        <i class="fa-solid fa-arrow-up-wide-short me-2"></i>
                        low-to-high
                      </button>
                      <button
                        className={`btn btn${
                          sortOrder === "high-to-low" ? "" : "-outline"
                        }-primary btn-sm rounded-pill px-2`}
                        onClick={() => setSortOrder("high-to-low")}
                      >
                        <i class="fa-solid fa-arrow-down-wide-short me-2"></i>
                        high-to-low
                      </button>
                    </div>
                  </div>
                  <button
                    className="btn btn-outline-dark w-100"
                    onClick={applyFilter}
                    disabled={filterLoading}
                  >
                    {filterLoading ? (
                      <>
                        <span
                          className="spinner-border spinner-border-sm me-2"
                          role="status"
                        ></span>
                        Applying Filters...
                      </>
                    ) : (
                      <>
                        Apply Filter<i className="fa-solid fa-filter ms-2"></i>
                      </>
                    )}
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
