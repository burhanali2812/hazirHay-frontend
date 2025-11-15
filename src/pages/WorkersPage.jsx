import React from "react";

const WorkersPage = ({ shopKepperWorkers, onDeleteWorker }) => {
  return (
    <div className="container my-4">
      <h2 className="text-center fw-bold mb-4"><i class="fa-solid fa-users-line me-2"></i>Workers List</h2>
<div className="d-flex justify-content-end mb-3">
  <button className="btn btn-primary">
    <i className="fa-solid fa-user-plus me-2"></i>Add New Worker
  </button>
</div>

      <div className="row">
        {shopKepperWorkers && shopKepperWorkers.length > 0 ? (
          shopKepperWorkers.map((worker) => (
            <div key={worker._id} className="col-12 col-md-6 mb-3">
              <div
                className="card shadow-lg border-0"
                style={{
                  borderRadius: "16px",
                  padding: "14px 16px",
                }}
              >
                <div className="d-flex align-items-center">

              
                  <img
                    src={worker.profilePicture || "/avatar.png"}
                    alt="worker"
                    className="rounded-circle"
                    style={{
                      width: "58px",
                      height: "58px",
                      objectFit: "cover",
                      border: "2px solid #e5e7eb",
                    }}
                  />

                 
                  <div className="ms-3 flex-grow-1">
                    <h6 className="fw-bold mb-1" style={{ fontSize: "15px" }}>
                      {worker.name}
                    </h6>

                 
                    <span
                      className={`badge px-3 py-1 rounded-pill`}
                      style={{
                        backgroundColor: worker.isBusy ? "#ffe5e5" : "#e7ffe9",
                        color: worker.isBusy ? "#d9534f" : "#28a745",
                        fontWeight: 600,
                        fontSize: "12px",
                      }}
                    >
                      {worker.isBusy ? "Busy" : "Available"}
                    </span>
                  </div>

                
                  <div className="d-flex align-items-center gap-3">
                  
                    <a href={`tel:${worker.phone}`}>
                      <i
                        className="fa-solid fa-phone"
                        style={{
                          fontSize: "18px",
                          color: "#3b82f6",
                          cursor: "pointer",
                        }}
                      ></i>
                    </a>

              
                    <a
                      href={`https://wa.me/${worker.phone}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <i
                        className="fa-brands fa-whatsapp"
                        style={{
                          fontSize: "20px",
                          color: "#22c55e",
                          cursor: "pointer",
                        }}
                      ></i>
                    </a>

             
                    <i
                      className="fa-solid fa-trash"
                      style={{
                        fontSize: "18px",
                        color: "#ef4444",
                        cursor: "pointer",
                      }}
                      // onClick={() => onDeleteWorker(worker._id)}
                    ></i>
                  </div>

                </div>
              </div>
            </div>
          ))
        ) : (
          <p className="text-center">No workers found.</p>
        )}
      </div>

    </div>
  );
};

export default WorkersPage;
