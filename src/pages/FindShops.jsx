import React, { useState } from "react";
import puncture from "../images/puncture.png";
import petrol from "../images/petrol.png";
import mechanic from "../images/mechanic.png";
import processing from "../videos/processing.mp4";
import { useAppContext } from "../context/AppContext";
import { useNavigate } from "react-router-dom";
function FindShops() {
  const {areaName, localShopData, localShopWithDistance} = useAppContext();
  const [searchQuery, setSearchQuery] = useState("")
  const [searchData,setSearchData] = useState([])
  const navigate = useNavigate();
  console.log("localWithDistance", localShopWithDistance);
  
  const quickData = [
    { img: puncture, label: "Puncture" },
    { img: petrol, label: "Petrol Pump" },
    { img: mechanic, label: "Mechanic" },
  ];

const handleChange = (e) => {
  const value = e.target.value.toLowerCase(); 
  setSearchQuery(value);
  console.log("words", value.length);

  if (value.length === 0) {
     setSearchData([]);
     setSearchQuery("")
    return;
  }

  const data = localShopWithDistance?.filter((shop) => {
    // check shopName
    const nameMatch = shop.shopName?.toLowerCase().includes(value);

    // check services array
    const serviceMatch = shop.services?.some((service) =>
      service.name?.toLowerCase().includes(value)
    );

    return nameMatch || serviceMatch;
  });

  console.log("search", data);
   setSearchData(data);
};

  return (
<>
<div className="bg-light py-3">
<div
          className="d-flex align-items-center bg-white rounded-pill mx-3 px-3 w-auto "
          style={{
            height : "35px",
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
         {areaName ? areaName : "Select Your Location"}
          </span>
        </div>
</div>

    <div className="container">
      <form className="d-flex " role="search" style={{ width: "auto" }}>
        <div className="position-relative w-100 mt-4">
          <input
            type="search"
            className="form-control bg-light rounded-pill ps-5 pe-5"
            placeholder="Eg:- Puncture, Mechanic"
            aria-label="Search"
            //disabled={localShopWithDistance?.length === 0}
             value={searchQuery}
             onChange={handleChange}
          />

          {/* Search Icon (left inside input) */}
          <span className="position-absolute top-50 start-0 translate-middle-y ps-3 text-muted">
            <i className="fa-solid fa-magnifying-glass"></i>
          </span>
        </div>
      </form>
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
                      width: "120px",
                      height: "100px",
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
                        width: "120px",
                        height: "80px",
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
      <div className="mt-4 mb-4">
        <div className="d-flex justify-content-between mb-4">
          <h6 className="fw-bold mx-2">Filtered shops</h6>
        <i class="fa-solid fa-filter me-2 text-primary"></i>
        </div>
              {
                searchData?.length === 0 ? (
                  <>
                    <div className="d-flex justify-content-center align-items-center mt-4">
          <video
            src={processing}
            autoPlay
            loop
            muted
            playsInline
            style={{ width: "160px", height: "160px", objectFit: "contain" }}
          />
           </div>

          <div className="text-center mt-3">
            <h5 className="fw-bold" style={{ letterSpacing: "1px" }}>
              Find What You Need
            </h5>

            <h6 className="fw-bold" style={{ color: "#ff6600" }}>
              Type it, tap it — let the magic begin! 
            </h6>

            <p className="text-secondary mx-auto" style={{ maxWidth: "600px" }}>
              Looking for a shop, a service, or a place everyone talks about?
              Just type the name — we’ll locate it quicker than you can say
              <span style={{ color: "#ff6600" }}>"Found it!"</span> 😄
            </p>
          </div>
                  </>
                ):(
                searchData?.map((shop, ind) => (
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
          <i className="fa-solid fa-shop" style={{ fontSize: "30px", color: "#aaa" }}></i>
        )}
      </div>

      {/* RIGHT SIDE DETAILS */}
      <div className="ms-3 flex-grow-1">
        <h6 className="fw-bold mb-1">{shop?.shopName}</h6>

        {/* Distance + EST */}
        <div className="d-flex align-items-center text-secondary small gap-3">
          <span>
            <i className="fa-solid fa-location-dot text-danger me-1"></i>
            {shop?.distance} km
          </span>

          <span>
            <i className="fa-solid fa-clock text-primary me-1"></i>
            {shop?.duration} mins
          </span>
        </div>

        <hr className="mt-2 mb-2" />

        {/* CTA BUTTONS */}
        <div className="d-flex justify-content-between align-items-center">

          {/* CALL */}
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

          {/* WHATSAPP */}
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

          {/* LOCATION BUTTON */}
          <button
            className="btn  "
            style={{
               background: "#a7ffb0ff",
              padding: "7px 10px",
              borderRadius: "10px",
            }}
          >
            <i className="fas fa-map-marker-alt text-danger"></i>
          </button>
            <button
            className="btn  "
            style={{
               background: "#a7ffb0ff",
              padding: "7px 10px",
              borderRadius: "10px",
            }}
          >
            <i className="fa-solid fa-angle-right text-danger"></i>
          </button>
        </div>
      </div>
    </div>
  </div>
))

                )
              }
       
      </div>
    </div>
</>
  );
}

export default FindShops;
