import axios from "axios";
import React, { useEffect, useState } from "react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useNavigate } from "react-router-dom";
import { useAppContext } from "../context/AppContext";
import PieChart from "../components/PieChart";

function Dashboard() {
  const {
    totalUser,
    totalShopkepper,
    totalActiveShopkepper,
    totalLiveShopkepper,
    setKey,
  } = useAppContext();
  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  const [totalShops, setTotalShops] = useState([]);
  const [totalWorkers, setTotalWorkers] = useState([]);
  const [totalLocalShops, setTotalLocalShops] = useState([]);
  const [liveUsers, setLiveUsers] = useState([]);
  const [frequentUsers, setFrequentUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Get all shops
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
      setTotalShops([]);
    }
  };

  // Get all workers
  const getAllWorkers = async () => {
    try {
      const response = await axios.get(
        "https://hazir-hay-backend.vercel.app/worker/getAllWorkers",
        {
          headers: { Authorization: `Bearer ${token}` },
          params: { t: Date.now() },
        }
      );

      if (response.data.success) {
        setTotalWorkers(response.data.data || []);
      } else {
        console.warn("No Workers found:", response.data.message);
        setTotalWorkers([]);
      }
    } catch (error) {
      console.error(
        "Error fetching Workers:",
        error.response?.data?.message || error.message
      );
      setTotalWorkers([]);
    }
  };

  // Get all local shops
  const getAllLocalShops = async () => {
    try {
      const response = await axios.get(
        "https://hazir-hay-backend.vercel.app/localshop/getAllLocalShops",
        {
          headers: { Authorization: `Bearer ${token}` },
          params: { t: Date.now() },
        }
      );

      if (response.data.success) {
        setTotalLocalShops(response.data.data || []);
      } else {
        console.warn("No Local Shops found:", response.data.message);
        setTotalLocalShops([]);
      }
    } catch (error) {
      console.error(
        "Error fetching Local Shops:",
        error.response?.data?.message || error.message
      );
      setTotalLocalShops([]);
    }
  };

  // Get live users
  const getLiveUsers = async () => {
    try {
      const response = await axios.get(
        "https://hazir-hay-backend.vercel.app/users/get-live-users",
        {
          headers: { Authorization: `Bearer ${token}` },
          params: { t: Date.now() },
        }
      );

      if (response.data.success) {
        setLiveUsers(response.data.data || []);
      } else {
        setLiveUsers([]);
      }
    } catch (error) {
      console.error("Error fetching live users:", error);
      setLiveUsers([]);
    }
  };

  // Get frequent users (users with most activity)
  const getFrequentUsers = async () => {
    try {
      const allUsers = totalUser || [];
      // Sort by lastActive and get top 5
      const sorted = [...allUsers]
        .filter((user) => user.lastActive)
        .sort((a, b) => new Date(b.lastActive) - new Date(a.lastActive))?.slice(0, 5);
      setFrequentUsers(sorted);
    } catch (error) {
      console.error("Error processing frequent users:", error);
      setFrequentUsers([]);
    }
  };

  useEffect(() => {
    if (token) {
      const fetchData = async () => {
        setLoading(true);
        await Promise.all([
          getAllShop(),
          getAllWorkers(),
          getAllLocalShops(),
          getLiveUsers(),
        ]);
        setLoading(false);
      };
      fetchData();

      // Refresh data every 30 seconds
      const interval = setInterval(() => {
        getLiveUsers();
      }, 30000);

      return () => clearInterval(interval);
    }
  }, [token]);

  useEffect(() => {
    if (totalUser?.length > 0) {
      getFrequentUsers();
    }
  }, [totalUser]);

  const statsData = [
    {
      label: "Total Users",
      value: totalUser?.length || 0,
      icon: "fa-users",
      color: "primary",
      bgColor: "bg-primary bg-opacity-10",
    },
    {
      label: "Total Shopkeepers",
      value: totalShopkepper?.length || 0,
      icon: "fa-user-tie",
      color: "success",
      bgColor: "bg-success bg-opacity-10",
    },
    {
      label: "Total Workers",
      value: totalWorkers?.length || 0,
      icon: "fa-user-helmet-safety",
      color: "warning",
      bgColor: "bg-warning bg-opacity-10",
    },
    {
      label: "Total Local Shops",
      value: totalLocalShops?.length || 0,
      icon: "fa-store",
      color: "info",
      bgColor: "bg-info bg-opacity-10",
    },
  ];

  const chartData = {
    labels: ["Users", "Shopkeepers", "Workers", "Local Shops"],
    datasets: [
      {
        data: [
          totalUser?.length || 0,
          totalShopkepper?.length || 0,
          totalWorkers?.length || 0,
          totalLocalShops?.length || 0,
        ],
        backgroundColor: [
          "rgba(13, 110, 253, 0.8)",
          "rgba(25, 135, 84, 0.8)",
          "rgba(255, 193, 7, 0.8)",
          "rgba(13, 202, 240, 0.8)",
        ],
        borderColor: [
          "rgba(13, 110, 253, 1)",
          "rgba(25, 135, 84, 1)",
          "rgba(255, 193, 7, 1)",
          "rgba(13, 202, 240, 1)",
        ],
        borderWidth: 2,
      },
    ],
  };

  return (
    <div className="container">
      <ToastContainer />

      {/* Header */}
      <div className="mb-4">
        <h4 className="fw-bold mb-1">Admin Dashboard</h4>
        <p className="text-muted small">Real-time overview of your platform</p>
      </div>
      {/* Live Shopkeepers Card */}
      <div className="card shadow-sm border-0 rounded-4 p-0 mb-3">
        <div className="card-body">
          <div className="d-flex align-items-center mb-3">
            <div
              className="rounded-circle bg-success bg-opacity-10 d-flex align-items-center justify-content-center"
              style={{ width: "45px", height: "45px" }}
            >
              <i className="fa-solid fa-users-rays text-success fs-5"></i>
            </div>
            <div className="ms-3 flex-grow-1">
              <h6 className="fw-bold mb-1">Live Shopkeepers</h6>
              <div
                className="d-flex justify-content-between"
                style={{ maxWidth: "200px" }}
              >
                <p className="text-muted fw-semibold small mb-0">
                  Active:{" "}
                  <span className="text-dark">
                    {totalActiveShopkepper?.length || 0}
                  </span>
                </p>
                <p className="text-muted fw-semibold small mb-0">
                  Live:{" "}
                  <span className="text-success">
                    {totalLiveShopkepper?.length || 0}
                  </span>
                </p>
              </div>
            </div>
          </div>

          <div className="d-flex align-items-center justify-content-between w-100 gap-2">
            <p
              className="mb-0 fw-bold text-muted"
              style={{ minWidth: "45px", textAlign: "right" }}
            >
              {totalActiveShopkepper?.length > 0
                ? Math.round(
                    (totalLiveShopkepper?.length /
                      totalActiveShopkepper?.length) *
                      100
                  )
                : 0}
              %
            </p>

            <div className="progress flex-grow-1" style={{ height: "13px" }}>
              <div
                className="progress-bar progress-bar-striped progress-bar-animated bg-success"
                style={{
                  width: `${
                    totalActiveShopkepper?.length > 0
                      ? (totalLiveShopkepper?.length /
                          totalActiveShopkepper?.length) *
                        100
                      : 0
                  }%`,
                }}
              ></div>
            </div>

            <span
              className="badge bg-success ms-2"
              style={{ fontSize: "10px", padding: "5px 10px" }}
            >
              <i
                className="fa-solid fa-circle me-1"
                style={{ fontSize: "8px" }}
              ></i>
              {totalLiveShopkepper?.length || 0} Online
            </span>
          </div>
        </div>
      </div>

      {/* Live Users Card */}
      <div className="card shadow-sm border-0 rounded-4 p-0 mb-3">
        <div className="card-body">
          <div className="d-flex align-items-center justify-content-between">
            <div className="d-flex align-items-center">
              <div
                className="rounded-circle bg-primary bg-opacity-10 d-flex align-items-center justify-content-center"
                style={{ width: "45px", height: "45px" }}
              >
                <i className="fa-solid fa-user-clock text-primary fs-5"></i>
              </div>
              <div className="ms-3">
                <h6 className="fw-bold mb-1">Live Users</h6>
                <p className="text-muted small mb-0">
                  Active in last 2 minutes
                </p>
              </div>
            </div>
            <div className="text-end">
              <h3 className="fw-bold mb-0 text-primary">
                {liveUsers?.length || 0}
              </h3>
              <span className="badge bg-primary bg-opacity-10 text-primary">
                <i
                  className="fa-solid fa-circle-dot me-1"
                  style={{ fontSize: "8px" }}
                ></i>
                Online Now
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="row g-3 mb-3">
        {statsData.map((stat, index) => (
          <div key={index} className="col-6 col-md-3">
            <div className="card shadow-sm border-0 rounded-4 h-100">
              <div className="card-body p-3">
                <div className="d-flex align-items-start justify-content-between mb-2">
                  <div
                    className={`rounded-circle ${stat.bgColor} d-flex align-items-center justify-content-center`}
                    style={{ width: "40px", height: "40px" }}
                  >
                    <i
                      className={`fa-solid ${stat.icon} text-${stat.color} fs-6`}
                    ></i>
                  </div>
                </div>
                <h3 className="fw-bold mb-1">{stat.value}</h3>
                <p className="text-muted small mb-0 fw-semibold">
                  {stat.label}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts and Frequent Users Row */}
      <div className="row g-3 mb-3">
        {/* Pie Chart */}
        <div className="col-md-6">
          <div className="card shadow-sm border-0 rounded-4 h-100">
            <div className="card-body">
              <h6 className="fw-bold mb-3">Platform Overview</h6>
              <div style={{ height: "250px" }}>
                <PieChart data={chartData} />
              </div>
            </div>
          </div>
        </div>

        {/* Frequent Users */}
        <div className="col-md-6">
          <div className="card shadow-sm border-0 rounded-4 h-100">
            <div className="card-body">
              <h6 className="fw-bold mb-3">Most Active Users</h6>
              {frequentUsers.length > 0 ? (
                <div className="list-group list-group-flush">
                  {frequentUsers.map((user, index) => (
                    <div
                      key={user._id}
                      className="list-group-item border-0 d-flex align-items-center px-0 py-2"
                    >
                      <div
                        className="rounded-circle bg-primary bg-opacity-10 d-flex align-items-center justify-content-center me-2"
                        style={{ width: "32px", height: "32px", flexShrink: 0 }}
                      >
                        {user.profilePicture ? (
                          <img
                            src={user.profilePicture}
                            alt={user.name}
                            className="rounded-circle"
                            style={{
                              width: "32px",
                              height: "32px",
                              objectFit: "cover",
                            }}
                          />
                        ) : (
                          <span className="text-primary fw-bold small">
                            {user.name?.charAt(0).toUpperCase()}
                          </span>
                        )}
                      </div>
                      <div className="flex-grow-1" style={{ minWidth: 0 }}>
                        <p className="mb-0 fw-semibold small text-truncate">
                          {user.name}
                        </p>
                        <p
                          className="mb-0 text-muted"
                          style={{ fontSize: "11px" }}
                        >
                          {user.lastActive
                            ? new Date(user.lastActive).toLocaleDateString()
                            : "No activity"}
                        </p>
                      </div>
                      <span className="badge bg-primary bg-opacity-10 text-primary">
                        #{index + 1}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4">
                  <i className="fa-solid fa-users text-muted fs-1 mb-2"></i>
                  <p className="text-muted small">No user activity yet</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Management Section */}
      <h5 className="fw-bold mb-3">Quick Actions</h5>
      <div className="row g-3 mb-3">
        <div className="col-3 col-md-3">
          <button
            className="card shadow-sm border-0 rounded-4 w-100 h-100 btn btn-light p-3"
            onClick={() => navigate("/admin/users")}
          >
            <div className="d-flex flex-column align-items-center">
              <div
                className="rounded-circle bg-primary bg-opacity-10 d-flex align-items-center justify-content-center mb-2"
                style={{ width: "50px", height: "50px" }}
              >
                <i className="fa-solid fa-user text-primary fs-5"></i>
              </div>
              <p className="mb-0 small fw-bold text-dark">Users</p>
            </div>
          </button>
        </div>

        <div className="col-3 col-md-3">
          <button
            className="card shadow-sm border-0 rounded-4 w-100 h-100 btn btn-light p-3"
            onClick={() => navigate("/admin/shopkeppers")}
          >
            <div className="d-flex flex-column align-items-center">
              <div
                className="rounded-circle bg-success bg-opacity-10 d-flex align-items-center justify-content-center mb-2"
                style={{ width: "50px", height: "50px" }}
              >
                <i className="fa-solid fa-user-tie text-success fs-5"></i>
              </div>
              <p className="mb-0 small fw-bold text-dark">Shopkeepers</p>
            </div>
          </button>
        </div>

        <div className="col-3 col-md-3">
          <button
            className="card shadow-sm border-0 rounded-4 w-100 h-100 btn btn-light p-3"
            onClick={() => navigate("/admin/shops")}
          >
            <div className="d-flex flex-column align-items-center">
              <div
                className="rounded-circle bg-info bg-opacity-10 d-flex align-items-center justify-content-center mb-2"
                style={{ width: "50px", height: "50px" }}
              >
                <i className="fa-solid fa-shop text-info fs-5"></i>
              </div>
              <p className="mb-0 small fw-bold text-dark">Shops</p>
            </div>
          </button>
        </div>

        <div className="col-3 col-md-3">
          <button
            className="card shadow-sm border-0 rounded-4 w-100 h-100 btn btn-light p-3"
            onClick={() => navigate("/admin/requests")}
          >
            <div className="d-flex flex-column align-items-center">
              <div
                className="rounded-circle bg-warning bg-opacity-10 d-flex align-items-center justify-content-center mb-2"
                style={{ width: "50px", height: "50px" }}
              >
                <i className="fa-solid fa-calendar-check text-warning fs-5"></i>
              </div>
              <p className="mb-0 small fw-bold text-dark">Requests</p>
            </div>
          </button>
        </div>
      </div>

      {/* Additional Stats with Progress Bars */}
      <div className="card shadow-sm border-0 rounded-4 p-3">
        <h6 className="fw-bold mb-3">Detailed Statistics</h6>

        {/* Total Shops */}
        <div className="mb-3">
          <div className="d-flex justify-content-between align-items-center mb-1">
            <div className="d-flex align-items-center">
              <i className="fa-solid fa-shop text-info me-2"></i>
              <span className="fw-semibold small text-muted">Total Shops</span>
            </div>
            <span className="fw-bold small">{totalShops?.length || 0}</span>
          </div>
          <div className="progress" style={{ height: "10px" }}>
            <div
              className="progress-bar bg-info"
              style={{
                width: `${Math.min((totalShops?.length || 0) * 10, 100)}%`,
              }}
            ></div>
          </div>
        </div>

        {/* Active Shopkeepers */}
        <div className="mb-3">
          <div className="d-flex justify-content-between align-items-center mb-1">
            <div className="d-flex align-items-center">
              <i className="fa-solid fa-user-check text-success me-2"></i>
              <span className="fw-semibold small text-muted">
                Active Shopkeepers
              </span>
            </div>
            <span className="fw-bold small">
              {totalActiveShopkepper?.length || 0}
            </span>
          </div>
          <div className="progress" style={{ height: "10px" }}>
            <div
              className="progress-bar bg-success"
              style={{
                width: `${Math.min(
                  (totalActiveShopkepper?.length || 0) * 10,
                  100
                )}%`,
              }}
            ></div>
          </div>
        </div>

        {/* Total Workers */}
        <div className="mb-3">
          <div className="d-flex justify-content-between align-items-center mb-1">
            <div className="d-flex align-items-center">
              <i className="fa-solid fa-user-helmet-safety text-warning me-2"></i>
              <span className="fw-semibold small text-muted">
                Total Workers
              </span>
            </div>
            <span className="fw-bold small">{totalWorkers?.length || 0}</span>
          </div>
          <div className="progress" style={{ height: "10px" }}>
            <div
              className="progress-bar bg-warning"
              style={{
                width: `${Math.min((totalWorkers?.length || 0) * 10, 100)}%`,
              }}
            ></div>
          </div>
        </div>

        {/* Total Local Shops */}
        <div>
          <div className="d-flex justify-content-between align-items-center mb-1">
            <div className="d-flex align-items-center">
              <i className="fa-solid fa-store text-primary me-2"></i>
              <span className="fw-semibold small text-muted">
                Total Local Shops
              </span>
            </div>
            <span className="fw-bold small">
              {totalLocalShops?.length || 0}
            </span>
          </div>
          <div className="progress" style={{ height: "10px" }}>
            <div
              className="progress-bar bg-primary"
              style={{
                width: `${Math.min((totalLocalShops?.length || 0) * 10, 100)}%`,
              }}
            ></div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
