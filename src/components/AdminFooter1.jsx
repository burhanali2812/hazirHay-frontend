import axios from "axios";
import React, { useEffect, useState } from "react";
import { useNavigate, Outlet } from "react-router-dom";
import "./adminFooter.css";

function AdminFooter({ topText, setUpdate, setShopKepperStatus , unSeenNotification, onUpdate}) {
  const navigate = useNavigate();
  const [active, setActive] = useState(localStorage.getItem("key") || "home");
  const [showOffcanvas, setShowOffcanvas] = useState(false);
  const currentUser = JSON.parse(sessionStorage.getItem("user"));
  const role = sessionStorage.getItem("role");
  const user = JSON.parse(sessionStorage.getItem("user"));
  const token = localStorage.getItem("token");
  const [isOnline, setIsOnline] = useState(false);
  const [loading, setLoading] = useState(false);
  const getShopkepperStatus = async () => {
    try {
      const response = await axios.get(
        `https://hazir-hay-backend.vercel.app/shopKeppers/getShopKepperStatus/${user._id}`,
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
        "https://hazir-hay-backend.vercel.app/shopKeppers/update-live",
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
        path: "/admin/user/dashboard",
      },
      {
        key: "cart",
        icon: "fas fa-shopping-cart",
        label: "Cart",
        path: "/admin/user/cart",
      },

      {
        key: "tracking",
        icon: "fa-solid fa-person-biking",
        label: "Tracking",
        path: "/admin/user/tracking",
      },
      {
        key: "notification",
        icon: "fa-solid fa-bell",
        label: "Notification",
        path: "/admin/user/notification",
      },
      {
        key: "setting",
        icon: "fa-solid fa-ellipsis-vertical",
        label: "More",
        action: () => setShowOffcanvas(true),
      },
    ],
  };

  const sideBar = {
    user: [
      {
        key: "dashboard",
        icon: "fa-solid fa-gauge",
        label: "Dashboard",
        path: "/admin/user/dashboard",
      },
      {
        key: "home",
        icon: "fas fa-home",
        label: "Home",
        path: "/admin/user/dashboard",
      },
      {
        key: "cart",
        icon: "fas fa-shopping-cart",
        label: "Cart",
        path: "/admin/user/cart",
      },
      {
        key: "shop",
        icon: "fa-solid fa-magnifying-glass-location",
        label: "Shops",
        path: "/admin/user/findShops",
      },
      {
        key: "tracking",
        icon: "fa-solid fa-person-biking",
        label: "Tracking",
        path: "/admin/user/tracking",
      },
      {
        key: "contact",
        icon: "fa-solid fa-address-book",
        label: "Contact Us",
        path: "/admin/user/tracking",
      },
      {
        key: "about",
        icon: "fa-solid fa-clipboard-user",
        label: "About Us",
        path: "/admin/user/tracking",
      },
      {
        key: "faq",
        icon: "fa-solid fa-file-circle-question",
        label: "FAQs",
        path: "/admin/user/tracking",
      },
      {
        key: "setting",
        icon: "fa-solid fa-user-gear",
        label: "Profile Setting",
        path: "/admin/user/tracking",
      },
    ],
  };

  const currentMenu = menus[role] || menus.user;
  const currentSidebar = sideBar[role] || sideBar.user;

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
        className="card fixed-bottom "
        style={{
          background: "white",
          //borderTop: "2px solid black", // Top border
          boxShadow: "none",
        }}
      >
        <div className="card-body d-flex justify-content-around p-2">
         {currentMenu.map((item) => (
  <span
    key={item.key}
    className={`nav-item position-relative ${active === item.key ? "active" : ""}`}
    onClick={() =>
      handleClick(item.key, item.path ? item.path : item.action)
    }
    style={{ cursor: "pointer" }}
  >
    {item.key === "notification" ? (
      <>
        <i className={item.icon} onClick={onUpdate}></i>
      {
        unSeenNotification.length !== 0 && (
            <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger mt-1 me-3" style={{marginLeft : "-15px"}}>
          {unSeenNotification.length}
          <span className="visually-hidden">unread messages</span>
        </span>
        )
      }
      <small className="d-block" onClick={onUpdate}>{item.label}</small>
      </>
    ) : (
     <>
      <i className={item.icon} ></i>
      <small className="d-block">{item.label}</small>
     </>
    )}
    
  </span>
))}

        </div>
      </div>

      {/* Content */}
      <div style={{ paddingTop: role === "user" ? "0px" : "70px" }}>
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
          <h5 className="mb-0 ms-2 ">More</h5>
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

          {(role === "user" || role === "admin") && (
            <>
              <div className="text-center mb-4">
                <h5 className="fw-bold mb-1 d-inline-flex align-items-center">
                  {currentUser?.name}
                  <i
                    className="fa-solid fa-circle-check ms-2"
                    style={{ color: "#4caf50", fontSize: "16px" }}
                  ></i>
                </h5>

                <div>
                  <span className="badge rounded-pill bg-light text-dark border px-3 py-1 mt-2">
                    {role === "user" ? (
                      <>
                        <i className="fa-solid fa-user me-1 text-primary"></i>{" "}
                        User
                      </>
                    ) : (
                      <>
                        <i className="fa-solid fa-user-shield me-1 text-danger"></i>{" "}
                        Admin
                      </>
                    )}
                  </span>
                </div>
              </div>

              <div className="container">
                <ul className="list-group border-0">
                  {currentSidebar.map((item) => (
                    <li
                      key={item.key}
                      className="list-group-item border-0 d-flex align-items-center p-2 sidebar-item"
                      style={{
                        borderRadius: "10px",
                        transition: "background 0.2s",
                        cursor: "pointer",
                      }}
                      onClick={() => {
                        navigate(item.path);
                        setShowOffcanvas(false);
                      }}
                      onMouseEnter={(e) =>
                        (e.currentTarget.style.background = "#f8f9fa")
                      }
                      onMouseLeave={(e) =>
                        (e.currentTarget.style.background = "transparent")
                      }
                    >
                      <i
                        className={`${item.icon} me-3 text-secondary`}
                        style={{ fontSize: "18px" }}
                      ></i>
                      <span className="fw-semibold text-dark">
                        {item.label}
                      </span>
                    </li>
                  ))}
                </ul>

                <button
                  className="mt-3 btn btn-outline-danger w-100 rounded-pill fw-semibold"
                  onClick={logOut}
                >
                  <i className="fa-solid fa-right-from-bracket me-2"></i> Logout
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
