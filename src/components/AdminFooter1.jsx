import React, { useState } from "react";
import { useNavigate, Outlet } from "react-router-dom";
import "./adminFooter.css";

function AdminFooter1() {
  const navigate = useNavigate();
  const [active, setActive] = useState("home");

  const handleClick = (key, action) => {
    setActive(key);
    action();
  };

  return (
    <>
      <div
        className="card fixed-top shadow"
        style={{
          background: "	#262525ff",
          height: "55px",
            zIndex: 1030,
        }}
      >
        <div className="card-body">
          <h5 className="text-light">Burhan Ali</h5>
        </div>
      </div>
      <div
        className="card fixed-bottom shadow"
        style={{
          background: "	#262525ff",
        }}
      >
        <div className="card-body d-flex  p-2">
          <span
            className={`text-center flex-fill ${
              active === "home" ? "text-light zoom" : "text-secondary"
            }`}
            onClick={() =>
              handleClick("home", () => navigate("/driver/dashboard"))
            }
          >
            <i className="fas fa-home d-block mb-0 mt-2"></i>
            <small>Home</small>
          </span>

          <span
            className={`text-center flex-fill ${
              active === "requests" ? "text-light zoom" : "text-secondary"
            }`}
            onClick={() =>
              handleClick("requests", () => navigate("/driver/assignRoutes"))
            }
          >
            <i className="fas fa-envelope-open-text d-block mb-0 mt-2"></i>
            <small>Requests</small>
          </span>
          <span
            className={`text-center flex-fill ${
              active === "complaints" ? "text-light zoom" : "text-secondary"
            }`}
            onClick={() => handleClick("complaints", () => alert("Complaints"))}
          >
            <i className="fas fa-frown d-block mb-0 mt-2"></i>

            <small>Complaints</small>
          </span>

          <span
            className={`text-center flex-fill ${
              active === "setting" ? "text-light zoom" : "text-secondary"
            }`}
            onClick={() => handleClick("setting", () => alert("setting"))}
          >
            <i className="fas fa-cog d-block mb-0 mt-2"></i>
            <small>Setting</small>
          </span>
        </div>
      </div>

      <div className="flex-grow-1 p-3" style={{ paddingTop: "60px", paddingBottom: "80px" }}>
        <Outlet />
      </div>
      <div style={{ height: "60px" }}></div>
    </>
  );
}

export default AdminFooter1;
