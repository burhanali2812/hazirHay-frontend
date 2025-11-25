import React from "react";
import puncture from "../images/puncture.png";
import petrol from "../images/petrol.png";
import mechanic from "../images/mechanic.png";
import processing from "../videos/processing.mp4";
function FindShops() {
  const quickData = [
    { img: puncture, label: "Puncture" },
    { img: petrol, label: "Petrol Pump" },
    { img: mechanic, label: "Mechanic" },
  ];
  return (
    <div className="container">
      <form className="d-flex " role="search" style={{ width: "auto" }}>
        <div className="position-relative w-100 mt-4">
          <input
            type="search"
            className="form-control bg-light rounded-pill ps-5 pe-5"
            placeholder="Eg:- Puncture, Mechanic"
            aria-label="Search"
            // value={searchQuery}
            // onChange={handleChange}
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
      <div className="mt-3">
        <h6 className="fw-bold mx-2">Filtered shops</h6>
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
       
      </div>
    </div>
  );
}

export default FindShops;
