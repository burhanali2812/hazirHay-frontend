import axios from "axios";
import React, { useEffect, useState } from "react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useNavigate} from "react-router-dom";
function Dashboard({ setTopText , totalUser, totalShopkepper, totalActiveShopkepper, totalLiveShopkepper, setUpdate}) {
  const token = localStorage.getItem("token");
  const navigate = useNavigate();


  const [totalShops, setTotalShops] = useState([]);

  useEffect(()=>{
    setUpdate(true)
  },[])






   const getAllShop = async () => {
    try {
      const response = await axios.get(
        "https://hazir-hay-backend.vercel.app/shops/getAllShops",
        {
          headers: { Authorization: `Bearer ${token}` },
          params: { t: Date.now() },
        }
      );

      if (response.data.success) {
        setTotalShops(response.data.data || []);
      } else {
        console.warn("No Shops found:", response.data.message);
        setTotalShops([]);
      }
    } catch (error) {
      console.error(
        "Error fetching Shops:",
        error.response?.data?.message || error.message
      );
      toast.error("Failed to fetch Shops. Please try again.");
      setTotalShops([]);
    }
  };

  useEffect(() => {
    if (token) {
      getAllShop();
    }
  }, [token]);

  useEffect(() => {
    setTopText("Dashboard");
  }, [setTopText]);
  const target = 10;

  return (
    <div className="container">
      <ToastContainer />

      <div className="card shadow-sm border-0 rounded-4 p-0">
        <div className="card-body">
          <div className="d-flex align-items-center mb-3">
            <div
              className="rounded-circle bg-primary bg-opacity-10 d-flex align-items-center justify-content-center"
              style={{ width: "45px", height: "45px" }}
            >
              <i className="fa-solid fa-users-rays text-primary fs-5"></i>
            </div>
            <div className="ms-3">
              <h6 className="fw-bold mb-1">Live Shopkeepers</h6>
              <div
                className="d-flex justify-content-between"
                style={{ width: "160px" }}
              >
                <p className="text-muted fw-semibold small mb-0">
                  Total:{" "}
                  <span className="text-dark">
                    {totalActiveShopkepper.length}
                  </span>
                </p>
                <p className="text-muted fw-semibold small mb-0">
                  Live:{" "}
                  <span className="text-success">
                    {totalLiveShopkepper.length}
                  </span>
                </p>
              </div>
            </div>
          </div>

          <hr />
          <div className="d-flex align-items-center justify-content-between w-100 gap-2">
            <p
              className="mb-0 fw-bold text-muted"
              style={{ minWidth: "45px", textAlign: "right" }}
            >
              {Math.round((totalLiveShopkepper.length / totalActiveShopkepper.length) * 100)}%
            </p>

            <div
              className="progress flex-grow-1"
              role="progressbar"
              aria-label="Live Shopkeepers Progress"
              aria-valuenow={(totalLiveShopkepper.length / totalActiveShopkepper.length) * 100}
              aria-valuemin="0"
              aria-valuemax={target}
              style={{ height: "10px" }}
            >
              <div
                className="progress-bar progress-bar-striped progress-bar-animated bg-success"
                style={{
                  width: `${(totalLiveShopkepper.length / totalActiveShopkepper.length) * 100}%`,
                }}
              ></div>
            </div>

            <button className="btn btn-sm btn-light border rounded-pill ms-1 px-3" disabled={totalLiveShopkepper.length === 0}>
              <i
                className="fa-solid fa-circle text-success me-1"
                style={{ fontSize: "10px" }}
              ></i>
              View
            </button>
          </div>
        </div>
      </div>

      <h5 className="fw-bold" style={{ marginTop: "25px" }}>
        Managements
      </h5>

      <div className="d-flex justify-content-between mt-3">
        <div className="text-center">
          <button
            className="btn btn-primary rounded-circle d-flex align-items-center justify-content-center"
            style={{ width: "40px", height: "40px" }}
            onClick={()=>navigate("/admin/users")}
          >
            <i className="fa-solid fa-user"></i>
          </button>
          <p className="mt-1 small text-muted fw-bold">Users</p>
        </div>

        <div className="text-center">
          <button
            className="btn btn-primary rounded-circle  align-items-center justify-content-center"
            style={{ width: "40px", height: "40px" }}
          >
            <i className="fa-solid fa-user-tie"></i>
          </button>
          <p className="mt-1 small text-muted fw-bold">Shopkeepers</p>
        </div>

        <div className="text-center">
          <button
            className="btn btn-primary rounded-circle d-flex align-items-center justify-content-center"
            style={{ width: "40px", height: "40px" }}
          >
            <i className="fa-solid fa-shop"></i>
          </button>
          <p className="mt-1 small text-muted fw-bold">Shops</p>
        </div>

        <div className="text-center ms-3">
          <button
            className="btn btn-primary rounded-circle align-items-center justify-content-center"
            style={{ width: "40px", height: "40px" }}
          >
        
            <i className="fa-solid fa-calendar-check"></i>
          </button>
          <p className="mt-1 small text-muted fw-bold">Booking</p>
        </div>
      </div>
      <div className="card shadow-sm border-0 rounded-4 p-3 mt-2">
  {/* Total Users */}
  <div className="d-flex align-items-center mb-3">
    <div className="me-2 text-primary">
      <i className="fa-solid fa-user fs-6"></i>
    </div>
    <div className="flex-grow-1">
      <div className="d-flex justify-content-between mb-1">
        <span className="fw-semibold small text-muted">Total Users</span>
        <span className="fw-bold small">{totalUser.length}</span>
      </div>
      <div
        className="progress"
        style={{ height: "12px" }}
        role="progressbar"
        aria-valuenow={totalUser.length}
        aria-valuemin="0"
        aria-valuemax={target}
      >
        <div
          className="progress-bar progress-bar-striped progress-bar-animated bg-primary d-flex align-items-center justify-content-center fw-semibold"
          style={{ width: `${(totalUser.length / target) * 100}%` }}
        >
          {Math.round((totalUser.length / target) * 100)}%
        </div>
      </div>
    </div>
  </div>
  


  {/* <div className="d-flex align-items-center mb-3">
    <div className="me-2 text-success">
      <i className="fa-solid fa-user-tie fs-6"></i>
    </div>
    <div className="flex-grow-1">
      <div className="d-flex justify-content-between mb-1">
        <span className="fw-semibold small text-muted">Shopkeepers</span>
        <span className="fw-bold small">{totalShopkepper.length}</span>
      </div>
      <div
        className="progress"
        style={{ height: "12px" }}
        role="progressbar"
        aria-valuenow={totalShopkepper.length}
        aria-valuemin="0"
        aria-valuemax={target}
      >
        <div
          className="progress-bar progress-bar-striped progress-bar-animated bg-success d-flex align-items-center justify-content-center fw-semibold"
          style={{ width: `${(totalShopkepper.length / target) * 100}%` }}
        >
          {Math.round((totalShopkepper.length / target) * 100)}%
        </div>
      </div>
    </div>
  </div> */}
  <div className="d-flex align-items-center">
    <div className="me-2 text-warning">
      <i className="fa-solid fa-user-check fs-6"></i>
    </div>
    <div className="flex-grow-1">
      <div className="d-flex justify-content-between mb-1">
        <span className="fw-semibold small text-muted">Active Shopkeepers</span>
        <span className="fw-bold small">{totalActiveShopkepper.length}</span>
      </div>
      <div
        className="progress"
        style={{ height: "12px" }}
        role="progressbar"
        aria-valuenow={totalActiveShopkepper.length}
        aria-valuemin="0"
        aria-valuemax={target}
      >
        <div
          className="progress-bar progress-bar-striped progress-bar-animated bg-warning d-flex align-items-center justify-content-center fw-semibold"
          style={{ width: `${(totalActiveShopkepper.length / target) * 100}%` }}
        >
          {Math.round((totalActiveShopkepper.length / target) * 100)}%
        </div>
      </div>
    </div>
  </div>

    <div className="d-flex align-items-center mt-3">
    <div className="me-2 text-info">
      <i className="fa-solid fa-shop fs-6"></i>
    </div>
    <div className="flex-grow-1">
      <div className="d-flex justify-content-between mb-1">
        <span className="fw-semibold small text-muted">Total Shops</span>
        <span className="fw-bold small">{totalShops.length}</span>
      </div>
      <div
        className="progress"
        style={{ height: "12px" }}
        role="progressbar"
        aria-valuenow={totalShops.length}
        aria-valuemin="0"
        aria-valuemax={target}
      >
        <div
          className="progress-bar progress-bar-striped progress-bar-animated bg-info text-dark d-flex align-items-center justify-content-center fw-semibold"
          style={{ width: `${(totalShops.length / target) * 100}%` }}
        >
          {Math.round((totalShops.length / target) * 100)}%
        </div>
      </div>
    </div>
  </div>
</div>

     

    </div>
  );
}

export default Dashboard;
