import React, { useState } from "react";
import puncture from "../images/puncture.png";
import petrol from "../images/petrol.png";
import mechanic from "../images/mechanic.png";
import pharmacy from "../images/pharmacy.png";
import processing from "../videos/processing.mp4";
import { useAppContext } from "../context/AppContext";
import { useNavigate } from "react-router-dom";
import { ShopServices } from "../components/ShopServices";
function FindShops() {
  const { selectedArea, localShopData, localShopWithDistance , setSelectedViewLocalShop,
     selectedCategory,setSelectedCategory ,searchType, setSearchType,searchQuery, setSearchQuery,
      searchData, setSearchData,sortOrder, setSortOrder, localShopNames,localShopServices, setFinalSearchData} =
    useAppContext();


  const [filterModal, setFilterModal] = useState(false);
  const [filterLoading, setFilterLoading] = useState(false);
  const [suggestionLoading, setSuggestionLoading] = useState(false);
  const [categorySearch, setCategorySearch] = useState("");


const handleSelectCategory = (cat) => {
  setSelectedCategory(cat);
  console.log("Selected Category:", cat);
};



  const navigate = useNavigate();
  console.log("localWithDistance", localShopWithDistance);

  const quickData = [
    { img: puncture, label: "Puncture" },
    { img: petrol, label: "Petrol Pump" },
    { img: mechanic, label: "Mechanic" },
    { img: pharmacy, label: "Pharmacy" },
  ];


    const finalSearchSuggestion = searchType === "shopName" ? localShopNames : localShopServices;

  const handleChange = (e) => {
    setSuggestionLoading(false);
    const value = e.target.value.toLowerCase();
    setSearchQuery(value);

    if (value.length === 0) {
      setSuggestionLoading(false);
      setSearchData([]);
      return;
    }

    let data = finalSearchSuggestion.filter((shop) => {
      const nameMatch = shop?.toLowerCase().includes(value);
      return nameMatch;
    });

    // data = data.map((shop) => ({
    //   ...shop,
    //   fixedDistance:
    //     shop.fixedDistance ??
    //     calculateApproxDistance(shop.location.coordinates),
    // }));

    setSearchData(data);
    setSuggestionLoading(false);
  };


  const openGoogleMaps = (shopCoords) => {
    const url = `https://www.google.com/maps/dir/?api=1&origin=${selectedArea?.lat},${selectedArea?.lng}&destination=${shopCoords[1]},${shopCoords[0]}&travelmode=driving`;

    window.open(url, "_blank");
  };

  
  const applyFilter = () => {
    setFilterLoading(true);
    let sortedData = [...searchData];

    if (sortOrder === "low-to-high") {
      sortedData.sort(
        (a, b) => parseFloat(a.fixedDistance) - parseFloat(b.fixedDistance)
      );
    } else if (sortOrder === "high-to-low") {
      sortedData.sort(
        (a, b) => parseFloat(b.fixedDistance) - parseFloat(a.fixedDistance)
      );
    }
    else if(sortOrder === "all"){
      sortedData = [...searchData];
    }
    setSearchData(sortedData);
    setFilterLoading(false);
    setFilterModal(false);
  };
  const navigateToShop = (shop) => {
    setSelectedViewLocalShop(shop);
    navigate("/admin/user/localShop/viewLocalShop");
  }

  

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

      <div className="container" style={{marginBottom : "55px"}}>


        <div className="mt-3">
          <h6 className="fw-bold mx-2">Quick Access</h6>

          <div style={{ overflowX: "auto", whiteSpace: "nowrap" }}>
            <div
              className="d-flex gap-2 flex-nowrap p-2"
              style={{ width: "max-content" }}
            >
              {quickData.length > 0 &&
                quickData.map((data, ind) => {
                  return (
                    <div
                      className="card bg-light  shadow-sm"
                      key={ind}
                      style={{
                        width: "100px",
                        height: "120px",
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "center",
                        alignItems: "center",
                        textAlign: "center",
                      }}
                    >
                      <img
                        src={data.img}
                        alt={data.label}
                        style={{
                          width: "80px",
                          height: "100px",
                          objectFit: "contain",
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
        {ShopServices.filter((item) =>
          item.toLowerCase().includes(categorySearch.toLowerCase())
        ).map((item, i) => (
          <button
            key={i}
            className="dropdown-item"
            onClick={() => handleSelectCategory(item)}
          >
            {item}
          </button>
        ))}
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
      {searchType === "" ? "Search By" : searchType === "shopName" ? "Shop Name" : "Services"}
    </button>

    <ul className="dropdown-menu">
      <li>
        <button className="dropdown-item" onClick={() => setSearchType("shopName")}>
          Shop Name
        </button>
      </li>
      <li>
        <button className="dropdown-item" onClick={() => setSearchType("services")}>
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
      placeholder={`Search ${selectedCategory ? selectedCategory : "shops/services"} by ${
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

    {/* SUGGESTION DROPDOWN */}
   {searchQuery?.length > 0 && searchData?.length > 0 && !suggestionLoading && (
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
            let filtered = finalSearchSuggestion.filter(
              (shop) => shop.toLowerCase() === suggestion.toLowerCase()
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
        {index !== searchData.length - 1 && (
          <div style={{ borderBottom: "1px solid #f1f1f1" }}></div>
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
            <i className="fa-solid fa-filter me-2 text-primary" onClick={() => setFilterModal(true)}></i>
          </div>
        {!suggestionLoading ? (
  // Loading animation while fetching
  <>
  <div className="d-flex justify-content-center align-items-center mt-4">
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
  <h5 className="fw-bold" style={{ letterSpacing: "1px" }}> Find What You Need </h5> 
  <h6 className="fw-bold" style={{ color: "#ff6600" }}> Type it, tap it — let the magic begin! </h6>
   <p className="text-secondary mx-auto" style={{ maxWidth: "600px" }} > Looking for a shop, a service, or a place everyone talks about? Just type the name — we’ll locate it quicker than you can say <span style={{ color: "#ff6600" }}>"Found it!"</span> 😄 </p> 
   </div>
  </>
) : localShopData?.length > 0 ? (
  // Show shop cards only if data exists
  localShopData.map((shop, ind) => (
    <div
      className="card bg-light border-0 shadow-sm p-3 mb-3"
      key={ind}
      style={{ borderRadius: "15px" }}
    >
      <div className="d-flex">
        {/* LEFT: Picture */}
        <div
          style={{
            width: "70px",
            height: "70px",
            borderRadius: "50%",
            overflow: "hidden",
            border: "2px solid #ddd",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "#f8f9fa",
          }}
        >
          {shop?.shopPicture ? (
            <img
              src={shop?.shopPicture}
              alt="Shop"
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
              }}
            />
          ) : (
            <i
              className="fa-solid fa-shop"
              style={{ fontSize: "30px", color: "#aaa" }}
            ></i>
          )}
        </div>

        {/* RIGHT SIDE DETAILS */}
        <div className="ms-3 flex-grow-1">
          <h6 className="fw-bold mb-1">{shop?.shopName}</h6>

          <div className="d-flex align-items-center text-secondary small gap-3">
            <span>
              <i className="fa-solid fa-location-dot text-danger me-1"></i>
              {shop?.fixedDistance} km away
            </span>
          </div>

          <hr className="mt-2 mb-2" />

          <div className="d-flex justify-content-between align-items-center">
            <a
              href={`tel:${shop?.phone}`}
              className="text-decoration-none"
              style={{
                background: "#a7ffb0ff",
                padding: "7px 10px",
                borderRadius: "10px",
              }}
            >
              <i className="fa-solid fa-phone text-primary"></i>
            </a>

            <a
              href={`https://wa.me/${shop?.phone}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-decoration-none"
              style={{
                background: "#a7ffb0ff",
                padding: "7px 8px",
                borderRadius: "10px",
              }}
            >
              <i className="fa-brands fa-whatsapp text-success fa-lg"></i>
            </a>

            <button
              className="btn"
              style={{
                background: "#a7ffb0ff",
                padding: "7px 10px",
                borderRadius: "10px",
              }}
              onClick={() => openGoogleMaps(shop?.location?.coordinates)}
            >
              <i className="fas fa-map-marker-alt text-danger"></i>
            </button>

            <button
              className="btn"
              style={{
                background: "#a7ffb0ff",
                padding: "7px 10px",
                borderRadius: "10px",
              }}
              onClick={() => navigateToShop(shop)}
            >
              <i className="fa-solid fa-angle-right text-danger"></i>
            </button>
          </div>
        </div>
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
                <h6 className="modal-title m-0">Sort By Distance</h6>
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
                  <label className="form-label fw-semibold">Sort by Distance</label>

                  <div className="d-flex gap-2 text-center justify-content-center">
                                      <button className="btn btn-outline-primary btn-sm rounded-pill px-4" onClick={() => setSortOrder("all")}>All</button>

                  <button className="btn btn-outline-primary btn-sm rounded-pill px-2" onClick={() => setSortOrder("low-to-high")}><i class="fa-solid fa-arrow-up-wide-short me-2"></i>low-to-high</button>
                   <button className="btn btn-outline-primary btn-sm rounded-pill px-2" onClick={() => setSortOrder("high-to-low")}><i class="fa-solid fa-arrow-down-wide-short me-2"></i>high-to-low</button>
                </div>
                </div>
                <button
                  className="btn btn-outline-dark w-100"
                  onClick={applyFilter}
                >
                  {filterLoading ? (
                    <>
                      Applying...
                      <div
                        className="spinner-border spinner-border-sm text-light ms-2"
                        role="status"
                      ></div>
                    </>
                  ) : (
                    <>
                      Apply Filter<i class="fa-solid fa-filter ms-2"></i>
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
