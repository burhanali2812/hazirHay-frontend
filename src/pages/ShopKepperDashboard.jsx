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
        params: { t: Date.now() }, 
      }
    );

    if (res.data.success) {
      let orders = res.data.data;

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
  className="card shadow-sm border-0 bg-white p-3 p-md-4 mb-3"
  style={{ borderRadius: "14px" }}
>
  {/* Profile Section */}
  <div className="d-flex align-items-center">
    <img
      src={user?.profilePicture}
      alt="profile"
      className="rounded-circle border"
      style={{
        width: "50px",
        height: "50px",
        objectFit: "cover",
        border: "2px solid #0d6efd",
      }}
    />
    <div className="ms-3">
      <h6 className="fw-bold text-dark mb-1">{user?.name}</h6>
      <p className="text-muted small mb-0">{user?.email}</p>
    </div>
  </div>

  <hr className="my-3" />

  {/* Redesigned Earnings Section */}
  <div className="d-flex flex-wrap justify-content-between align-items-center">
    <div className="d-flex flex-column flex-md-row align-items-start align-items-md-center gap-2">
      <div className="me-md-3">
        <span className="text-secondary fw-semibold small d-block">
          Total Earnings
        </span>
        <span className="fw-bold text-primary" style={{ fontSize: "1.05rem" }}>
          Rs. {totalOrdersEarnings.toLocaleString("en-IN")}/-
        </span>
      </div>

      {/* <div>
        <span className="text-success fw-semibold small">
          <i className="fa-solid fa-gift me-1"></i> Bonus: Rs. 0/-
        </span>
      </div> */}
    </div>

    <button
      className="btn btn-primary btn-sm d-flex align-items-center  mt-md-0"
      onClick={() => setFilterModal(true)}
      style={{
        borderRadius: "6px",
        padding: "4px 12px",
        fontWeight: "500",
      }}
    >
      <i className="fa-solid fa-filter me-1"></i> Filter
    </button>
  </div>
</div>






      {/* DASHBOARD CARDS */}
    <div className="row g-3">
  {/* Total Orders */}
  <div className="col-12">
    <div className="card p-3 shadow-sm border-0 bg-white d-flex flex-row justify-content-between align-items-center rounded-4">
      <div className="d-flex align-items-center gap-3">
        <div
          className="rounded-circle d-flex align-items-center justify-content-center"
          style={{
            background: "rgba(13,110,253,0.1)",
            width: "45px",
            height: "45px",
          }}
        >
          <i className="fa-solid fa-box-open text-primary fs-5"></i>
        </div>
        <h6 className="fw-semibold text-secondary m-0 " style={{fontSize : "15px"}}>Total Orders</h6>
      </div>
      <h5 className="fw-bold text-dark m-0 "style={{fontSize : "17px"}}>{TotalOrderscount}</h5>
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
  ].map((card, index) => {
    // avoid divide by zero
    const percent =
      TotalOrderscount > 0
        ? Math.round((card.count / TotalOrderscount) * 100)
        : 0;

    return (
      <div key={index} className="col-6 col-md-6 col-lg-6">
        <div
          className="card p-2 shadow-sm border-0 bg-white rounded-4 d-flex flex-column justify-content-between align-items-center text-center"
          style={{
            minHeight: "140px",
          }}
        >
          <div className="d-flex flex-column align-items-center justify-content-center">
            <div
              className="rounded-circle d-flex align-items-center justify-content-center mb-2"
              style={{
                background: card.bg,
                width: "40px",
                height: "40px",
              }}
            >
              <i
                className={`fa-solid ${card.icon} text-${card.color} `}
              ></i>
            </div>
            <h6 className="fw-semibold text-secondary mb-0 small">{card.title}</h6>
          </div>

          <h4 className="fw-bold text-dark mt-2 mb-1 small">{card.count}</h4>

          <div className="w-100 px-3 mt-1">
            <div
              className="progress"
              role="progressbar"
              aria-valuenow={percent}
              aria-valuemin="0"
              aria-valuemax="100"
              style={{ height: "15px" }}
            >
              
              <div
                className={`progress-bar bg-${card.color} progress-bar-striped progress-bar-animated`}
                style={{ width: `${percent}%` }}
              > <small className="text-light">{percent}%</small></div>
            </div>
           
          </div>
        </div>
      </div>
    );
  })}
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
