import React,{useState} from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
const WorkersPage = ({ shopKepperWorkers, setShopKepperWorkers }) => {
  const token = localStorage.getItem("token");
  const[deleteLoading, setDeleteLoading] = useState(null);
  const navigate = useNavigate();

    const onDeleteWorker = async (workerId) => {
        setDeleteLoading(workerId);
      if (!window.confirm("Are you sure you want to delete this worker?")) {
        setDeleteLoading(null);
        return;
      }
        try {
            const response = await axios.delete(
                `https://hazir-hay-backend.vercel.app/worker/deleteWorker/${workerId}`,
                {
                    headers: { Authorization: `Bearer ${token}` },
                    params: { t: Date.now() },
                }
            );
            if (response.status === 200) {
                alert("Worker deleted successfully");
                setDeleteLoading(null);
                setShopKepperWorkers((prevWorkers) =>
                    prevWorkers.filter((worker) => worker._id !== workerId)
                );
            }
        } catch (error) {
            console.error("Error deleting worker:", error);
            alert("Failed to delete worker");
            setDeleteLoading(null);
        }
    };

  return (
    <div className="container my-4">
      <h2 className="text-center fw-bold mb-4"><i class="fa-solid fa-users-line me-2"></i>Workers List</h2>
<div className="d-flex justify-content-end mb-3 me-1">
  <button className="btn btn-primary btn-sm" onClick={()=>navigate("/admin/shopKepper/worker/signup")}>
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
                      width: "65px",
                      height: "65px",
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
                        marginLeft : "-1px"
                      }}
                    >
                      {worker.isBusy ? "Busy" : "Available"}
                    </span>
                  </div>

                
                  <div className="d-flex align-items-center gap-2">
                  
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
                          fontSize: "22px",
                          color: "#22c55e",
                          cursor: "pointer",
                        }}
                      ></i>
                    </a>
                    {deleteLoading === worker._id ? (
                      <div className="spinner-border text-danger" role="status" style={{width: "18px", height: "18px"}}>
                        <span className="visually-hidden">Loading...</span>
                      </div>
                    ) :   <i
                      className="fa-solid fa-trash"
                      style={{
                        fontSize: "18px",
                        color: "#ef4444",
                        cursor: "pointer",
                      }}
                       onClick={() => onDeleteWorker(worker._id)}
                    ></i>}     
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
