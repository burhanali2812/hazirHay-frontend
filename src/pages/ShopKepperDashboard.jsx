import axios from "axios";
import React, { useEffect, useState } from "react";

function ShopKepperDashboard({ setUpdate, shopKepperStatus, setUpdateAppjs }) {
  const user = JSON.parse(sessionStorage.getItem("user"));
  const token = localStorage.getItem("token");
  const [orders, setOrders] = useState([]);
  const [pendingOrders, setPendingOrders] = useState([]);
  const [rejectedOrders, setRejectedOrders] = useState([]);
  const [completedOrders, setCompletedOrders] = useState([]);
  const [inProgressOrder, setInprogressOrder] = useState([]);
  const [totalOrdersEarnings, setTotalOrdersEarnings] = useState(0);
  const [filterModal, setFilterModal] = useState(false);
  const [TotalOrderscount, setTotalOrdersCount] = useState(0);
  const [pendingOrderscount, setpendingOrdersCount] = useState(0);
  const [inProgressOrdercount, setinProgressOrderCount] = useState(0);
  const [completedOrderscount, setcompletedOrdersCount] = useState(0);
  const [rejectedOrderscount, setrejectedOrdersCount] = useState(0);
    const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  useEffect(() => {
    setUpdateAppjs(true);
  }, []);
useEffect(() => {
  if (!orders) return;
  
  const intervals = [];

  const animateCount = (setter, targetLength) => {
    setter(0);
    const interval = setInterval(() => {
      setter((prev) => {
        if (prev < targetLength) return prev + 1;
        clearInterval(interval);
        return prev;
      });
    }, 50);
    intervals.push(interval);
  };

  animateCount(setTotalOrdersCount, orders.length);
  animateCount(setcompletedOrdersCount, completedOrders?.length || 0);
  animateCount(setpendingOrdersCount, pendingOrders?.length || 0);
  animateCount(setinProgressOrderCount, inProgressOrder?.length || 0);
  animateCount(setrejectedOrdersCount, rejectedOrders?.length || 0);

  return () => intervals.forEach((i) => clearInterval(i));
}, [orders, completedOrders, pendingOrders, inProgressOrder, rejectedOrders]);



const getShopkeeperOrders = async (type) => {
  try {
    // 🔹 Validate date range only if filtering
    if (type === "filter") {
      if (!startDate || !endDate) {
        alert("Please select both dates");
        return;
      }
    }

    const res = await axios.get(
      `https://hazir-hay-backend.vercel.app/requests/getshopRequest/${user?._id}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        params: { t: Date.now() }, // 👈 to prevent caching
      }
    );

    if (res.data.success) {
      let orders = res.data.data;

      // 🔹 Apply frontend date filter if dates are selected
      if (startDate && endDate) {
        const start = new Date(startDate);
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);

        orders = orders.filter((req) => {
          const createdAt = new Date(req.createdAt);
          return createdAt >= start && createdAt <= end;
        });
      }

      console.log("Filtered Orders:", orders);

      // 🔹 Set all states
      setOrders(orders);

      const earning = orders
        .filter((order) => order.status === "completed")
        .reduce((acc, order) => acc + (order.cost || 0), 0);
      setTotalOrdersEarnings(earning);

      setPendingOrders(orders.filter((o) => o.status === "pending"));
      setRejectedOrders(
        orders.filter((o) => o.status === "rejected" || o.status === "deleted")
      );
      setCompletedOrders(orders.filter((o) => o.status === "completed"));
      setInprogressOrder(orders.filter((o) => o.status === "inProgress"));

      if (type === "filter") {
        setStartDate("");
        setEndDate("")
        setFilterModal(false);
      }
    }
  } catch (error) {
    console.error("Error fetching orders:", error);
    alert("Error while getting orders");
  }
};
  useEffect(() => {
    getShopkeeperOrders("auto");
  }, [token]);
const handleApplyFilter = () => {
  console.log("Filter applied:", startDate, endDate);
  getShopkeeperOrders("filter");
};




  return (
    <div style={{ marginBottom: "80px" }} className="container-fluid px-3 px-md-5">
      {/* HEADER CARD */}
      <div
        className="card shadow-sm border-0 bg-white p-4 mb-4"
        style={{ borderBottomLeftRadius: "20px", borderBottomRightRadius: "20px" }}
      >
        <div className="d-flex justify-content-between align-items-center flex-wrap text-center text-md-start">
          <div className="flex-grow-1">
            <h5 className="fw-bold text-dark mb-1">{user?.name}</h5>
            <p className="text-muted small mb-0">{user?.email}</p>
          </div>
          <div className="mt-3 mt-md-0">
            <img
              src={user?.profilePicture}
              alt="profile"
              className="rounded-circle border"
              style={{
                width: "60px",
                height: "60px",
                objectFit: "cover",
                border: "3px solid #0d6efd",
              }}
            />
          </div>
        </div>

        <hr className="my-3" />

        <div className="d-flex justify-content-end">
          <button
            className="btn btn-primary btn-sm"
            onClick={() => setFilterModal(true)}
          >
            <i className="fa-solid fa-filter"></i>
          </button>
        </div>

        <div className="text-center mt-4">
          <h6 className="fw-semibold text-secondary mb-2">Total Orders Earning</h6>
          <h2 className="fw-bold text-primary mb-2">
            Rs. {totalOrdersEarnings.toLocaleString("en-IN")}/-
          </h2>
          <p className="text-success fw-semibold">
            <i className="fa-solid fa-gift me-1"></i> Bonus: Rs. 0/-
          </p>
        </div>
      </div>

      {/* DASHBOARD CARDS */}
      <div className="row g-3">
        {/* Total Orders */}
        <div className="col-12">
          <div className="card p-4 shadow-sm border-0 bg-white d-flex flex-row justify-content-between align-items-center rounded-4">
            <div className="d-flex align-items-center gap-3">
              <div
                className="rounded-circle d-flex align-items-center justify-content-center"
                style={{
                  background: "rgba(13,110,253,0.1)",
                  width: "50px",
                  height: "50px",
                }}
              >
                <i className="fa-solid fa-box-open text-primary fs-4"></i>
              </div>
              <h6 className="fw-semibold text-secondary m-0">Total Orders</h6>
            </div>
            <h4 className="fw-bold text-dark m-0">{TotalOrderscount}</h4>
          </div>
        </div>

        {/* Four Small Cards */}
        {[
          {
            title: "Pending",
            count: pendingOrderscount,
            color: "warning",
            icon: "fa-hourglass-half",
            bg: "rgba(255,193,7,0.1)",
          },
          {
            title: "In Progress",
            count: inProgressOrdercount,
            color: "info",
            icon: "fa-spinner",
            bg: "rgba(13,202,240,0.1)",
          },
          {
            title: "Completed",
            count: completedOrderscount,
            color: "success",
            icon: "fa-check-circle",
            bg: "rgba(25,135,84,0.1)",
          },
          {
            title: "Rejected",
            count: rejectedOrderscount,
            color: "danger",
            icon: "fa-xmark-circle",
            bg: "rgba(220,53,69,0.1)",
          },
        ].map((card, index) => (
          <div key={index} className="col-6 col-md-6 col-lg-6">
            <div
              className="card p-3 shadow-sm border-0 bg-white rounded-4 d-flex flex-column justify-content-between align-items-center text-center"
              style={{
                minHeight: "130px",
              }}
            >
              <div className="d-flex flex-column align-items-center justify-content-center">
                <div
                  className="rounded-circle d-flex align-items-center justify-content-center mb-2"
                  style={{
                    background: card.bg,
                    width: "45px",
                    height: "45px",
                  }}
                >
                  <i className={`fa-solid ${card.icon} text-${card.color} fs-5`}></i>
                </div>
                <h6 className="fw-semibold text-secondary mb-0">{card.title}</h6>
              </div>
              <h4 className="fw-bold text-dark mt-2 mb-0">{card.count}</h4>
            </div>
          </div>
        ))}
      </div>

      {/* FILTER MODAL */}
   
      {filterModal && (
        <div
          className="modal fade show d-block"
          tabIndex="-1"
          style={{
            backgroundColor: "rgba(0, 0, 0, 0.6)",
            backdropFilter: "blur(3px)",
          }}
        >
          <div className="modal-dialog modal-sm modal-dialog-centered">
            <div className="modal-content shadow border-0 rounded-4">
              {/* Header */}
              <div
                className="modal-header text-white py-2 px-3"
                style={{ backgroundColor: "#0d6efd" }}
              >
                <h6 className="modal-title m-0">
                  <i className="fa-solid fa-filter me-2"></i>Filter Orders
                </h6>
                <button
                  type="button"
                  className="btn-close btn-close-white"
                  onClick={() => setFilterModal(false)}
                ></button>
              </div>

              {/* Body */}
              <div className="modal-body text-center p-4">
                <div className="mb-3">
                  <i
                    className="fa-solid fa-calendar-days text-primary mb-2"
                    style={{ fontSize: "2rem" }}
                  ></i>
                  <p className="text-muted mb-0" style={{ fontSize: "14px" }}>
                    Select a <strong>Start Date</strong> and <strong>End Date</strong> to view orders placed between these dates.
                  </p>
                </div>

                <div className="d-flex flex-column gap-3">
                  {/* Start Date */}
                  <div className="text-start">
                    <label className="form-label fw-semibold text-secondary mb-1">
                      <i className="fa-solid fa-calendar-day me-2 text-primary"></i>
                      Start Date
                    </label>
                    <input
                      type="date"
                      className="form-control shadow-sm"
                      style={{ borderRadius: "10px" }}
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                    />
                  </div>

                  {/* End Date */}
                  <div className="text-start">
                    <label className="form-label fw-semibold text-secondary mb-1">
                      <i className="fa-solid fa-calendar-check me-2 text-success"></i>
                      End Date
                    </label>
                    <input
                      type="date"
                      className="form-control shadow-sm"
                      style={{ borderRadius: "10px" }}
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                    />
                  </div>

                  {/* Button */}
                  <button
                    className="btn btn-primary mt-2 w-100 rounded-pill fw-semibold"
                    onClick={handleApplyFilter}
                  >
                    <i className="fa-solid fa-magnifying-glass me-2"></i>Apply Filter
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    
    </div>
  );
}

export default ShopKepperDashboard;
