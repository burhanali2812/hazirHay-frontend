import React, { useState, useEffect } from "react";
import Swal from "sweetalert2";
import notify from "../images/notify.png";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { IoNavigateCircleSharp } from "react-icons/io5";

function Notification({
  notification,
  onDelete,
  setNotification,
  setUnSeenNotification,
  setKey,
}) {
  const [expandedIds, setExpandedIds] = useState({});
  const role = localStorage.getItem("role");
  const user = JSON.parse(localStorage.getItem("user"));
  const navigate = useNavigate();
  const toggleExpand = (id) => {
    setExpandedIds((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };
  useEffect(() => {
    setKey("notification");
  }, []);

  const iconsList = {
    complete: {
      color: "text-success",
      icon: "fa-solid fa-circle-check",
    },
    accept: {
      color: "text-success",
      icon: "fa-solid fa-circle-check",
    },
    fail: {
      color: "text-danger",
      icon: "fa-solid fa-circle-xmark",
    },
    info: {
      color: "text-primary",
      icon: "fa-solid fa-circle-info",
    },
    newOrder: {
      color: "text-success",
      icon: "fa-solid fa-circle-down",
    },
    inProgress: {
      color: "text-primary",
      icon: "fa-solid fa-circle-down",
    },
  };

  // 🎯 Swirl confirmation alert before delete
  const clearAllNotifications = async () => {
    const result = await Swal.fire({
      title: "Clear All Notifications?",
      text: "You won't be able to undo this action.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#6c757d",
      confirmButtonText: "Yes, clear all!",
      background: "#f9f9f9",
      customClass: {
        popup: "swirl-popup",
      },
    });

    if (result.isConfirmed) {
      try {
        const response = await axios.delete(
          `https://hazir-hay-backend.vercel.app/notification/clearAllNotifications/${user?._id}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
            params: { t: Date.now() },
          }
        );

        if (response.data.success) {
          setNotification([]);
          setUnSeenNotification([]);

          Swal.fire({
            title: "Cleared!",
            text: "All notifications have been cleared.",
            icon: "success",
            timer: 900,
            showConfirmButton: false,
            background: "#f9f9f9",
            customClass: {
              popup: "swirl-popup",
            },
          });
        }
      } catch (error) {
        Swal.fire({
          title: "Error!",
          text: "Something went wrong while clearing notifications.",
          icon: "error",
          background: "#f9f9f9",
          customClass: {
            popup: "swirl-popup",
          },
        });
        console.error("Error clearing notifications:", error);
      }
    }
  };

  const handleNotificationClick = (id) => {
    Swal.fire({
      title: "Delete Notification?",
      text: "You won't be able to undo this action.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#6c757d",
      confirmButtonText: "Yes, delete it!",
      background: "#f9f9f9",
      customClass: {
        popup: "swirl-popup",
      },
    }).then((result) => {
      if (result.isConfirmed) {
        onDelete(id);
        Swal.fire({
          title: "Deleted!",
          text: "Notification removed successfully.",
          icon: "success",
          timer: 900,
          showConfirmButton: false,
          background: "#f9f9f9",
          customClass: {
            popup: "swirl-popup",
          },
        });
      }
    });
  };

  const handleTrackNow = (notification) => {
    const orderId = notification.message
      .match(/\(ORD-[A-Z0-9-]+\)/)?.[0]
      .replace(/[()]/g, "");
    const checkOutId = notification.checkoutId;
    navigate("/admin/user/tracking", {
      state: { orderId: orderId, checkOutId: checkOutId },
    });
  };

  return (
    <div className="overflow-auto mb-4">
      <div className="d-flex justify-content-between align-items-center bg-light w-100 px-3 py-3 ">
        <h5 className="mb-0 fw-semibold text-secondary d-flex align-items-center gap-2">
          Notifications
          <span className="badge bg-secondary ms-1">{notification.length}</span>
        </h5>

        {notification.length > 0 && (
          <button
            className="btn btn-danger btn-sm rounded-pill d-flex align-items-center gap-2 px-3"
            onClick={clearAllNotifications}
          >
            <i className="fa-solid fa-trash"></i>
            <span>Clear All</span>
          </button>
        )}
      </div>

      {notification.length > 0 ? (
        <div className="container">
          <div className="text-center mt-1 mb-3">
            <span
              style={{
                backgroundColor: "#fff5f5",
                color: "#d9534f",
                padding: "10px 16px",
                borderRadius: "8px",
                fontSize: "14px",
                fontWeight: "500",
                boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                display: "inline-block",
              }}
            >
              <i className="fa-solid fa-info-circle me-2"></i>
              <strong>Note:</strong> Tap a notification to delete it.
            </span>
          </div>

          {notification.map((notifi) => {
            const icon = iconsList[notifi.type] || {};
            const isExpanded = expandedIds[notifi._id] || false;

            return (
              <div
                key={notifi._id}
                className="card mb-3 shadow-sm border-0 rounded-3 w-100"
                style={{
                  background: "#f9f9f9",
                  transition: "transform 0.2s ease-out",
                  cursor: "pointer",
                }}
              >
                <div className="card-body d-flex align-items-center justify-content-between">
                  {icon === "inProgress" ? (
                    <IoNavigateCircleSharp />
                  ) : (
                    <i
                      className={`${icon.icon} ${icon.color}`}
                      style={{ fontSize: "2.2rem", minWidth: "40px" }}
                    ></i>
                  )}

                  <div
                    className="flex-grow-1 ms-3 d-flex flex-column justify-content-center mt-1"
                    onClick={() => handleNotificationClick(notifi._id)}
                  >
                    <p className="mb-0">
                      {notifi.message.length > 50 && !isExpanded ? (
                        <>
                          {notifi.message.slice(0, 50)}...
                          <span
                            className="text-primary"
                            style={{ cursor: "pointer" }}
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleExpand(notifi._id);
                            }}
                          >
                            Show more
                          </span>
                        </>
                      ) : (
                        <>
                          {notifi.message}
                          <b> {notifi.checkoutId}</b>{" "}
                          {notifi.message.length > 55 && (
                            <span
                              className="text-primary"
                              style={{ cursor: "pointer" }}
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleExpand(notifi._id);
                              }}
                            >
                              Show less
                            </span>
                          )}
                        </>
                      )}
                    </p>
                  </div>

                  <button
                    className="btn btn-sm btn-outline-danger d-none d-md-block"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleNotificationClick(notifi._id);
                    }}
                  >
                    <i className="fa-solid fa-trash"></i>
                  </button>
                </div>

                <small
                  className="text-muted text-end me-4 mb-2"
                  style={{ marginTop: "-19px" }}
                >
                  {new Date(notifi.createdAt).toLocaleString()}
                </small>
                <div className="container mb-2">
                  {notifi.type === "accept" && role === "user" && (
                    <button
                      className="btn btn-primary btn-sm w-100 "
                      onClick={() => handleTrackNow(notifi)}
                    >
                      Track Now
                      <i class="fa-solid fa-magnifying-glass-location ms-1"></i>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div
          className="d-flex flex-column justify-content-center align-items-center text-center"
          style={{ height: "75vh" }}
        >
          <img
            src={notify}
            alt="No Data"
            className="mb-3"
            style={{ width: "180px", height: "auto" }}
          />
          <h4 className="fw-bold text-warning mb-2">No Notifications Found</h4>
          <p
            className="text-muted"
            style={{ maxWidth: "380px", fontSize: "15px" }}
          >
            Currently, there are no notifications. Please check back later or
            refresh the page.
          </p>
        </div>
      )}
    </div>
  );
}

export default Notification;
