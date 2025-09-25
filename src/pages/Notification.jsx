import React, { useState } from "react";
import {
  SwipeableList,
  SwipeableListItem,
  SwipeAction,
  TrailingActions,
} from "react-swipeable-list";
import "react-swipeable-list/dist/styles.css";
import notify from "../images/notify.png";

function Notification({ notification, onDelete }) {
  const [expandedIds, setExpandedIds] = useState({}); // store expanded state per ID

  const toggleExpand = (id) => {
    setExpandedIds((prev) => ({
      ...prev,
      [id]: !prev[id], // toggle only the clicked one
    }));
  };

  const iconsList = {
    success: {
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
  };

  // define trailing (right swipe) action
  const trailingActions = (id) => (
    <TrailingActions>
      <SwipeAction
        destructive={true}
        onClick={() => {
          onDelete(id);
        }}
      >
        <div
          className="d-flex justify-content-center align-items-center bg-danger rounded-3 text-white fw-bold w-100"
          style={{ height: "85%", minWidth: "100px" }}
        >
          Delete
        </div>
      </SwipeAction>
    </TrailingActions>
  );

  return (
    <div className="overflow-auto mb-4">
      <h5 className="mb-3 fw-semibold text-secondary bg-light w-100 p-3">
        Notifications{" "}
        <span className="badge bg-secondary">{notification.length}</span>
      </h5>
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
              <strong>Note:</strong> Swipe left to delete a notification.
            </span>
          </div>

          <SwipeableList>
            {notification.map((notifi) => {
              const icon = iconsList[notifi.type] || {};
              const isExpanded = expandedIds[notifi._id] || false;

              return (
                <SwipeableListItem
                  key={notifi._id}
                  trailingActions={trailingActions(notifi._id)}
                >
                  <div
                    className="card mb-3 shadow-sm border-0 rounded-3 w-100"
                    style={{ background: "#f9f9f9" }}
                  >
                    <div className="card-body d-flex align-items-center justify-content-between">
                      {/* Icon */}
                      <i
                        className={`${icon.icon} ${icon.color}`}
                        style={{ fontSize: "2.2rem", minWidth: "40px" }}
                      ></i>

                      {/* Message */}
                      <div className="flex-grow-1 ms-3 d-flex flex-column justify-content-center mt-1">
                        <p>
                          {notifi.message.length > 55 && !isExpanded ? (
                            <>
                              {notifi.message.slice(0, 40)}...
                              <span
                                className="text-primary"
                                style={{ cursor: "pointer" }}
                                onClick={() => toggleExpand(notifi._id)}
                              >
                                Show more
                              </span>
                            </>
                          ) : (
                            <>
                              {notifi.message}
                              <b> {notifi.checkoutId}</b>{" "}
                              {notifi.message.length > 55 ? (
                                <span
                                  className="text-primary"
                                  style={{ cursor: "pointer" }}
                                  onClick={() => toggleExpand(notifi._id)}
                                >
                                  Show less
                                </span>
                              ) : (
                                ""
                              )}
                            </>
                          )}
                        </p>
                      </div>

                      {/* Delete button (desktop) */}
                      <button
                        className="btn btn-sm btn-outline-danger d-none d-md-block"
                        onClick={() => {
                          if (
                            window.confirm(
                              "Are you sure you want to delete this notification?"
                            )
                          ) {
                            onDelete(notifi._id);
                          }
                        }}
                      >
                        <i className="fa-solid fa-trash"></i>
                      </button>
                    </div>

                    {/* Date */}
                    <small
                      className="text-muted text-end me-4 mb-2"
                      style={{ marginTop: "-19px" }}
                    >
                      {new Date(notifi.createdAt).toLocaleString()}
                    </small>
                  </div>
                </SwipeableListItem>
              );
            })}
          </SwipeableList>
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
