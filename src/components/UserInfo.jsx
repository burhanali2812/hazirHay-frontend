import React from "react";

function UserInfoModal({ singleUserData, setDetailsModal }) {
  if (!singleUserData) return null; // Don't render if no data

  return (
    <div
      className="modal d-block"
      tabIndex="-1"
      style={{
        backgroundColor: "rgba(0,0,0,0.5)",
      }}
      onClick={() => setDetailsModal(false)} // click outside to close
    >
      <div
        className="modal-dialog modal-dialog-centered"
        onClick={(e) => e.stopPropagation()} // prevent closing when clicking inside
      >
        <div className="modal-content">
          <div className="modal-header bg-primary text-white">
            <h5 className="modal-title">
              <i className="fa-solid fa-user me-1"></i> User Information
            </h5>
            <button
              type="button"
              className="btn-close"
              onClick={() => setDetailsModal(false)}
            ></button>
          </div>
          <div className="modal-body text-center">
            <div
              style={{
                width: "120px",
                height: "120px",
                borderRadius: "50%",
                overflow: "hidden",
                border: "3px solid #007bff",
                margin: "auto",
              }}
            >
              {singleUserData.profilePicture ? (
                <img
                  src={singleUserData.profilePicture}
                  alt="Shopkeeper"
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
              ) : (
                <i
                  className="fa-solid fa-user"
                  style={{ fontSize: "70px", color: "#aaa" }}
                ></i>
              )}
            </div>
            <h5 className="mt-3 fw-bold">{singleUserData?.name}</h5>
            <p className="text-muted">
              Created: {new Date(singleUserData?.createdAt).toLocaleString()}
            </p>
            <p className="text-muted">
              Last Active: {new Date(singleUserData?.lastActive).toLocaleString()}
            </p>

            <div className="text-start mt-3">
              <p>
                <i className="fa-solid fa-envelope me-1"></i>
                <strong>Email:</strong> {singleUserData?.email}
              </p>
              <p>
                <i className="fa-solid fa-phone me-1"></i>
                <strong>Phone:</strong> {singleUserData?.phone}
              </p>
              <p>
                <i className="fa-solid fa-location-dot me-1"></i>
                <strong>Address:</strong> {singleUserData?.address}
              </p>
            </div>
          </div>
          <div className="modal-footer">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setDetailsModal(false)}
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default UserInfoModal;
