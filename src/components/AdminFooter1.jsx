import axios from "axios";
import React, { useEffect, useState } from "react";
import { useNavigate, Outlet } from "react-router-dom";
import "./adminFooter.css";

function AdminFooter({ topText, setUpdate, setShopKepperStatus }) {
  const navigate = useNavigate();
  const [active, setActive] = useState(localStorage.getItem("key") || "home");
  const [showOffcanvas, setShowOffcanvas] = useState(false);
  const currentUser = JSON.parse(localStorage.getItem("user"));
  const role = sessionStorage.getItem("role");
  const user = JSON.parse(sessionStorage.getItem("user"));
  const token = localStorage.getItem("token");
  const [isOnline, setIsOnline] = useState(false);
  const [loading, setLoading] = useState(false);
  const getShopkepperStatus = async () => {
    try {
      const response = await axios.get(
        `https://hazir-hay-backend.wckd.pk/shopKeppers/getShopKepperStatus/${user._id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
          params: { t: Date.now() }, // prevents caching
        }
      );

      if (response.status === 200) {
        console.log("Current Status:", response.data.data);
        setIsOnline(response.data.data); // update state with isLive value
        localStorage.setItem("shopKepperStatus", response.data.data);
      }
    } catch (error) {
      console.error("Error fetching status:", error);
      alert(error.response?.data?.message || "Failed to fetch status!");
    }
  };

  useEffect(() => {
    console.log(role);

    if (role !== "admin" && role !== "user") getShopkepperStatus();
  }, [role]);

  const toggleStatus = async (e) => {
    //setIsOnline(e.target.value);
    setLoading(true);
    try {
      const newStatus = !isOnline;

      const payLoad = {
        isLive: newStatus,
      };

      const response = await axios.put(
        "https://hazir-hay-backend.wckd.pk/shopKeppers/update-live",
        payLoad,
        {
          headers: { Authorization: `Bearer ${token}` },
          params: { t: Date.now() },
        }
      );

      if (response.status === 200) {
        //setShopKepperStatus(!isOnline);
        if (!isOnline) {
          localStorage.setItem("shopKepperStatus", true);
        } else {
          localStorage.removeItem("shopKepperStatus");
        }
        setLoading(false);
        alert(response.data.message || "Status updated successfully!");
        setUpdate(true);
        setIsOnline(newStatus); // update UI state
      } else {
        alert("Failed to update status!");
      }
    } catch (error) {
      console.error("Error updating status:", error);
      alert(error.response?.data?.message || "Something went wrong!");
    } finally {
      setLoading(false);
    }
  };

  // Menu configuration for roles
  const menus = {
    admin: [
      {
        key: "home",
        icon: "fas fa-home",
        label: "Home",
        path: "/admin/dashboard",
      },
      {
        key: "requests",
        icon: "fas fa-envelope-open-text",
        label: "Requests",
        path: "/admin/requests",
      },
      {
        key: "complaints",
        icon: "fas fa-frown",
        label: "Complaints",
        action: () => alert("Complaints"),
      },
      {
        key: "setting",
        icon: "fa-solid fa-ellipsis-vertical",
        label: "More",
        action: () => setShowOffcanvas(true),
      },
    ],
    shopKepper: [
      {
        key: "home",
        icon: "fas fa-home",
        label: "Home",
        path: "/admin/shopKepper/dashboard",
      },
      {
        key: "requests",
        icon: "fas fa-envelope-open-text",
        label: "Requests",
        path: "/admin/shopKepper/requests",
      },
      {
        key: "notification",
        icon: "fa-solid fa-bell",
        label: "Notifications",
        action: () => alert("Notifications"),
      },
      {
        key: "setting",
        icon: "fa-solid fa-ellipsis-vertical",
        label: "More",
        action: () => setShowOffcanvas(true),
      },
    ],
    user: [
      {
        key: "home",
        icon: "fas fa-home",
        label: "Home",
        path: "/user/dashboard",
      },
      {
        key: "cart",
        icon: "fas fa-shopping-cart",
        label: "Cart",
        path: "/user/cart",
      },
      {
        key: "favorites",
        icon: "fas fa-heart",
        label: "Favorites",
        path: "/user/favorites",
      },
      {
        key: "setting",
        icon: "fa-solid fa-ellipsis-vertical",
        label: "More",
        action: () => setShowOffcanvas(true),
      },
    ],
  };

  const currentMenu = menus[role] || menus.user;

  // Handle navigation or action
  const handleClick = (key, actionOrPath) => {
    localStorage.setItem("key", key);
    setActive(key);

    if (typeof actionOrPath === "string") {
      navigate(actionOrPath);
    } else if (typeof actionOrPath === "function") {
      actionOrPath();
    }
  };

  const logOut = () => {
    if (!window.confirm("Are you sure you want to log out?")) return;
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("key");
    localStorage.removeItem("shopKepperStatus");
    navigate("/login");
  };

  return (
    <>
      {/* Top Header */}
      {role === "user" ? (
        ""
      ) : (
        <div className="admin-header fixed-top d-flex justify-content-between align-items-center px-2">
          <div className="d-flex align-items-center gap-2">
            <div className="icon-btn bg-primary" onClick={() => navigate(-1)}>
              <i className="fa-solid fa-arrow-left text-white"></i>
            </div>
            <h1 className="header-title mb-0">{topText}</h1>
          </div>

          {role === "shopKepper" ? (
            <>
              <button
                className={`btn ${
                  isOnline ? "btn-success" : "btn-danger"
                } fw-bold `}
                onClick={toggleStatus}
              >
                {loading ? (
                  <>
                    Updating...
                    <span className="spinner-border spinner-border-sm ms-2"></span>
                  </>
                ) : isOnline ? (
                  <>
                    <i class="fa-solid fa-power-off me-1"></i>
                    Online
                  </>
                ) : (
                  <>
                    <i class="fa-solid fa-power-off me-1"></i>
                    Offline
                  </>
                )}
              </button>
              <button className="btn btn-primary" onClick={logOut}>
                Log Out
              </button>
            </>
          ) : (
            <div className="d-flex gap-2">
              <div
                className="icon-btn bg-secondary"
                onClick={() => navigate("/driver/dashboard")}
              >
                <i className="fa-solid fa-home text-white"></i>
              </div>
              <div
                className="icon-btn bg-secondary"
                onClick={() => navigate(0)}
              >
                <i className="fa-solid fa-bell text-white"></i>
              </div>
              <div className="icon-btn bg-danger" onClick={logOut}>
                <i className="fa-solid fa-right-from-bracket text-white"></i>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Bottom Navigation */}
      <div
        className="card fixed-bottom py-1"
        style={{
          background: "white",
          borderTop: "2px solid  #ff6600", // Top border
          boxShadow: "none",
        }}
      >
        <div className="card-body d-flex justify-content-around p-2">
          {currentMenu.map((item) => (
            <span
              key={item.key}
              className={`nav-item ${active === item.key ? "active" : ""}`}
              onClick={() =>
                handleClick(item.key, item.path ? item.path : item.action)
              }
              style={{ cursor: "pointer" }}
            >
              <i className={item.icon}></i>
              <small>{item.label}</small>
            </span>
          ))}
        </div>
      </div>

      {/* Content */}
      <div  style={{paddingTop: role === "user" ? "0px" : "70px" }}>
        <Outlet />
      </div>

      {/* Offcanvas Settings */}
      <div className={`custom-offcanvas ${showOffcanvas ? "show" : ""}`}>
        {/* Offcanvas Header */}
        <div className="offcanvas-header">
          <button
            type="button"
            className="btn-close"
            aria-label="Close"
            onClick={() => setShowOffcanvas(false)}
          ></button>
          <h5 className="mb-0 ms-2 mt-1">Settings</h5>
        </div>

        {/* Offcanvas Body */}
        <div className="offcanvas-body">
          {/* Profile Image */}
          <div className="d-flex justify-content-center mt-4">
            <div
              style={{
                width: "90px",
                height: "90px",
                borderRadius: "50%",
                overflow: "hidden",
                border: "2px solid #ddd",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: "#f8f9fa",
              }}
            >
              {currentUser?.profilePicture ? (
                <img
                  src={currentUser.profilePicture}
                  alt="Profile Preview"
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                  }}
                />
              ) : (
                <i
                  className="fa-solid fa-user"
                  style={{ fontSize: "40px", color: "#aaa" }}
                ></i>
              )}
            </div>
          </div>

          {/* User / Admin Info */}
          {(role === "user" || role === "admin") && (
            <>
              <div className="d-flex justify-content-center align-items-center">
                <h5 className="fw-bold mt-2 mb-0">{currentUser?.name}</h5>
                <i
                  className="fa-solid fa-circle-check ms-1 mt-2"
                  style={{ color: "#28a745", fontSize: "18px" }}
                ></i>
              </div>

              <div className="d-flex justify-content-center">
                <span className="badge rounded-pill bg-primary">
                  {role === "user" ? (
                    <>
                      <i className="fa-solid fa-user small ms-2"></i> User
                    </>
                  ) : (
                    <>
                      <i className="fa-solid fa-user-shield ms-2"></i> Admin
                    </>
                  )}
                </span>

                <button className="mt-2 btn btn-primary" onClick={logOut}>
                  Logout
                </button>
              </div>
            </>
          )}

          {/* ShopKeeper Info */}
          {role === "shopKepper" && (
            <>
              <div className="d-flex justify-content-center align-items-center">
                <h5 className="fw-bold mb-0 ">{currentUser?.name}</h5>
                <i
                  className={`${
                    currentUser?.isVerified
                      ? "fa-solid fa-circle-check"
                      : "fa-solid fa-circle-xmark"
                  } ms-1`}
                  style={{
                    color: currentUser?.isVerified ? "#28a745" : "#dc3545",
                    fontSize: "18px",
                  }}
                ></i>
              </div>

              <div className="d-flex justify-content-center">
                <span className="badge rounded-pill bg-primary">
                  <i className="fa-solid fa-user-tie ms-2"></i> Service Provider
                </span>
              </div>

              <button className="mt-2 btn btn-primary" onClick={logOut}>
                Logout
              </button>
            </>
          )}
        </div>
      </div>

      {/* Backdrop */}
      {showOffcanvas && (
        <div
          className="offcanvas-backdrop fade show"
          onClick={() => setShowOffcanvas(false)}
        ></div>
      )}
    </>
  );
}

export default AdminFooter;
