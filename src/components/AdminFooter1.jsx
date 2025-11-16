import axios from "axios";
import React, { useEffect, useState } from "react";
import { useNavigate, Outlet } from "react-router-dom";
import "./adminFooter.css";

function AdminFooter({
  topText,
  setUpdate,
  setShopKepperStatus,
  unSeenNotification,
  onUpdate,
  cartData,
  shopKepperStatus2,
  pageKey,
}) {
  const navigate = useNavigate();

  const [showOffcanvas, setShowOffcanvas] = useState(false);
  const currentUser = JSON.parse(localStorage.getItem("user"));
  const role = localStorage.getItem("role");

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
        path: shopKepperStatus2
          ? "/admin/user/orderWithJourney"
          : "/admin/shopKepper/requests",
      },
      {
        key: "notification",
        icon: "fa-solid fa-bell",
        label: "Notifica...",
        path: "/admin/user/notification",
      },
      {
        key: "shop",
        icon: "fa-solid fa-shop",
        label: "Shop",
        path: "/admin/shopKepper/worker/signup",
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
        path: "/admin/user/contact",
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

    shopKepper: [
      {
        key: "dashboard",
        icon: "fa-solid fa-gauge",
        label: "Dashboard",
        path: "/admin/shopKepper/dashboard",
      },
      {
        key: "workers",
        icon: "fa-solid fa-users-line",
        label: "Workers",
        path: "/admin/shopKepper/workersList",
      },
      {
        key: "shop",
        icon: "fa-solid fa-shop",
        label: "My Shop",
        path: "/admin/shopKepper/myShop",
      },
      {
        key: "transactions",
        icon: "fa-solid fa-receipt",
        label: "Transaction History",
        path: "/admin/shopKepper/transactions",
      },
      {
        key: "switch",
        icon: "fa-solid fa-shuffle",
        label: "Worker Mode",
        path: "/admin/shopKepper/transactions",
      },

      {
        key: "contact",
        icon: "fa-solid fa-address-book",
        label: "Contact Us",
        path: "/admin/user/contact",
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
  const handleClick = (actionOrPath) => {
    console.log("key fro footer", pageKey ? pageKey : "loading....");

    if (typeof actionOrPath === "string") {
      navigate(actionOrPath);
    } else if (typeof actionOrPath === "function") {
      actionOrPath();
    }
  };

  const logOut = () => {
    if (!window.confirm("Are you sure you want to log out?")) return;
    localStorage.clear();
    localStorage.clear();
    navigate("/login");
  };

  return (
    <>
      {/* Bottom Navigation */}
      {role === "worker" ? (
        ""
      ) : (
        <div
          className="card fixed-bottom "
          style={{
            background: "white",
            //borderTop: "2px solid black", // Top border
            boxShadow: "none",
          }}
        >
          <div className="card-body d-flex justify-content-between p-2">
            {currentMenu.map((item) => (
              <span
                key={item.key}
                className={`nav-item position-relative ${
                  pageKey === item.key ? "active" : ""
                }`}
                onClick={() => handleClick(item.path ? item.path : item.action)}
                style={{ cursor: "pointer" }}
              >
                {item.key === "notification" ? (
                  <>
                    <div
                      className="position-relative d-inline-block"
                      onClick={onUpdate}
                    >
                      <i className={item.icon}></i>
                      {unSeenNotification?.length !== 0 && (
                        <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
                          {unSeenNotification?.length}
                          <span className="visually-hidden">
                            unread messages
                          </span>
                        </span>
                      )}
                    </div>
                    <small className="d-block" onClick={onUpdate}>
                      {item.label}
                    </small>
                  </>
                ) : item.key === "cart" ? (
                  <>
                    <div className="position-relative d-inline-block">
                      <i className={item.icon}></i>
                      <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
                        {cartData?.items?.length || 0}
                        <span className="visually-hidden">unread messages</span>
                      </span>
                    </div>
                    <small className="d-block">{item.label}</small>
                  </>
                ) : (
                  <>
                    <i className={item.icon}></i>
                    <small className="d-block">{item.label}</small>
                  </>
                )}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Content */}
      <div>
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

          {(role === "user" || role === "admin" || role === "shopKepper") && (
            <>
              <div className="text-center mb-4">
                <h5 className="fw-bold mb-1 d-inline-flex align-items-center">
                  {currentUser?.name}
                  {role === "shopKepper" ? (
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
                  ) : (
                    <i
                      className="fa-solid fa-circle-check ms-2"
                      style={{ color: "#4caf50", fontSize: "16px" }}
                    ></i>
                  )}
                </h5>

                <div>
                  <span className="badge rounded-pill bg-light text-dark border px-3 py-1 mt-2">
                    {role === "user" ? (
                      <>
                        <i className="fa-solid fa-user me-1 text-primary"></i>{" "}
                        User
                      </>
                    ) : role === "admin" ? (
                      <>
                        <i className="fa-solid fa-user-shield me-1 text-danger"></i>{" "}
                        Admin
                      </>
                    ) : (
                      <>
                        <i className="fa-solid fa-user-tie me-1 text-dark"></i>{" "}
                        Service Provider
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
