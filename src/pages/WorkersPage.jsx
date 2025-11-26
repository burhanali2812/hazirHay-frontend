import React,{useState, useEffect} from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useAppContext } from "../context/AppContext";
import { useCheckBlockedStatus } from "../components/useCheckBlockedStatus";

const WorkersPage = () => {
  const {shopKepperWorkers, setShopKepperWorkers} = useAppContext();
    const user = JSON.parse(localStorage.getItem("user"));
  const token = localStorage.getItem("token");
  const[deleteLoading, setDeleteLoading] = useState(null);
  const navigate = useNavigate();
   useCheckBlockedStatus(token)
   useEffect(()=>{
    if(!user.isShop){
      return;
    }
    else if(!user?.isVerified){
       navigate("/shopKepper/sh&un&Ve&ri&fi&ed@sh@op$");
    }
   })

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
{/* Back Button */}
<div className="mb-3">
  <button
    className="btn btn-outline-secondary d-flex align-items-center"
    onClick={() => window.history.back()}
  >
    <i className="fa-solid fa-arrow-left me-2"></i> Back
  </button>
</div>

{/* Title */}
<h4 className="text-center fw-bold mb-1">
  <i className="fa-solid fa-users-line me-2"></i>Workers List
</h4>

{/* Subtitle */}
<p className="text-center text-muted mb-4" style={{ fontSize: "13px" }}>
  Manage all workers, check availability, and contact them instantly.
</p>

{/* Add Button */}
<div className="d-flex justify-content-end mb-3 me-1">
  <button
    className="btn btn-primary btn-sm"
    onClick={() => navigate("/admin/shopKepper/worker/signup")}
  >
    <i className="fa-solid fa-user-plus me-2"></i>Add Worker
  </button>
</div>


    {/* Workers List */}
    <div className="row g-3">
      {shopKepperWorkers?.length > 0 ? (
        shopKepperWorkers.map((worker) => (
          <div key={worker._id} className="col-12 col-md-6 col-lg-4">
            <div
              className="card border-0 shadow-sm h-100"
              style={{ borderRadius: "14px" }}
            >
              <div className="card-body d-flex align-items-center gap-3">

                {/* Profile Image */}
                <img
                  src={worker.profilePicture || "/avatar.png"}
                  alt="worker"
                  className="rounded-circle"
                  style={{
                    width: "58px",
                    height: "58px",
                    objectFit: "cover",
                    border: "2px solid #f1f1f1",
                  }}
                />

                {/* Worker Info */}
                <div className="flex-grow-1">
                  <h6 className="fw-semibold mb-1" style={{ fontSize: "14px" }}>
                    {worker.name}
                  </h6>

                  {/* Status */}
                  <span
                    className="badge rounded-pill px-2"
                    style={{
                      backgroundColor: worker.isBusy ? "#ffeaea" : "#eaffea",
                      color: worker.isBusy ? "#d9534f" : "#28a745",
                      fontSize: "11px",
                      fontWeight: 600,
                    }}
                  >
                    {worker.isBusy ? "Busy" : "Available"}
                  </span>

                  {/* Orders */}
                  <p className="mb-0 mt-1 text-muted" style={{ fontSize: "12px" }}>
                    Orders: <strong>{worker.orderCount}</strong>
                  </p>
                </div>

                {/* Action Buttons */}
               <div
  className="d-flex align-items-center gap-2"
  style={{ minWidth: "110px", justifyContent: "flex-end" }}
>

  {/* Call */}
  <a
    href={`tel:${worker.phone}`}
    className="text-decoration-none"
    style={{
      background: "#eef5ff",
      padding: "7px 9px",
      borderRadius: "10px",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
    }}
  >
    <i className="fa-solid fa-phone" style={{ fontSize: "15px", color: "#3b82f6" }}></i>
  </a>

  {/* WhatsApp */}
  <a
    href={`https://wa.me/${worker.phone}`}
    target="_blank"
    rel="noopener noreferrer"
    className="text-decoration-none"
    style={{
      background: "#e7fbe9",
      padding: "7px 9px",
      borderRadius: "10px",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
    }}
  >
    <i className="fa-brands fa-whatsapp" style={{ fontSize: "17px", color: "#22c55e" }}></i>
  </a>

  {/* Delete */}
  {deleteLoading === worker._id ? (
    <div
      className="spinner-border text-danger"
      style={{ width: "16px", height: "16px" }}
    ></div>
  ) : (
    <div
      onClick={() => onDeleteWorker(worker._id)}
      style={{
        background: "#ffe9e9",
        padding: "7px 9px",
        borderRadius: "10px",
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <i className="fa-solid fa-trash" style={{ fontSize: "15px", color: "#ef4444" }}></i>
    </div>
  )}

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
