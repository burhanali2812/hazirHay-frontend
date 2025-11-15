import axios from "axios";
import React, { useEffect, useState } from "react";
import { useCheckBlockedStatus } from "../components/useCheckBlockedStatus";
function ShopKepperDashboard({  setUpdateAppjs, setKey }) {
  const user = JSON.parse(sessionStorage.getItem("user"));
  const token = localStorage.getItem("token");
  const [orders, setOrders] = useState([]);
  const [pendingOrders, setPendingOrders] = useState([]);
  const [rejectedOrders, setRejectedOrders] = useState([]);
  const [completedOrders, setCompletedOrders] = useState([]);
  const [inProgressOrder, setInprogressOrder] = useState([]);
   const [assignedOrders, setAssignedOrders] = useState([]);
      const [unAssignedOrders, setUnAssignedOrders] = useState([]);

  const [totalOrdersEarnings, setTotalOrdersEarnings] = useState(0);
  const [filterModal, setFilterModal] = useState(false);
  const [TotalOrderscount, setTotalOrdersCount] = useState(0);
  const [pendingOrderscount, setpendingOrdersCount] = useState(0);
  const [inProgressOrdercount, setinProgressOrderCount] = useState(0);
  const [completedOrderscount, setcompletedOrdersCount] = useState(0);
  const [rejectedOrderscount, setrejectedOrdersCount] = useState(0);
    const [assignedOrderscount, setAssignedOrdersCount] = useState(0);
     const [unAssignedOrderscount, setUnAssignedOrdersCount] = useState(0);
    const [showStartDate, setShowStartDate] = useState(new Date().toISOString().split("T")[0]);
    const [startDate, setStartDate] = useState("");
      const [shop, setShop] = useState(null);
  const [showEndDate, setShowEndDate] = useState(new Date().toISOString().split("T")[0]);
   const [endDate, setEndDate] = useState("");
    const [filterLoading, setFilterLoading] = useState(false);
      const role = sessionStorage.getItem("role");

      useCheckBlockedStatus(token); 

  useEffect(() => {
    setUpdateAppjs(true);
    setKey("home");
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
   animateCount(setAssignedOrdersCount, assignedOrders?.length || 0);
   animateCount(setUnAssignedOrdersCount, unAssignedOrders?.length || 0);

  return () => intervals.forEach((i) => clearInterval(i));
}, [orders, completedOrders, pendingOrders, inProgressOrder, rejectedOrders, assignedOrders, unAssignedOrders]);



const getShopkeeperOrders = async (type) => {
  try {
    // 🔹 Validate date range only if filtering
    if (type === "filter") {
      setFilterLoading(true);
      if (!startDate || !endDate) {
        alert("Please select both dates");
        setFilterLoading(false);
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
      setAssignedOrders(orders.filter((o) => o.status === "assigned"));
      setUnAssignedOrders(orders.filter((o) => o.status === "unAssigned"));

      if (type === "filter") {
        setFilterLoading(false);
        setStartDate("");
        setEndDate("")
        setFilterModal(false);
      }
    }
  } catch (error) {
    console.error("Error fetching orders:", error);
    alert("Error while getting orders");
    if (type === "filter") {
      setFilterLoading(false);
    }
  }
};
  useEffect(() => {
    getShopkeeperOrders("auto");
  }, [token]);
const handleApplyFilter = () => {
  console.log("Filter applied:", startDate, endDate);
  getShopkeeperOrders("filter");
};
  const getShopData = async () => {
    try {
      const response = await axios.get(
        `https://hazir-hay-backend.vercel.app/shops/shopData/${user._id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
          params: { t: Date.now() },
        }
      );
      if (response.data.success === true) {
        console.log("Shop Data:", response.data.shop);
        setShop(response.data.shop);
      }
    } catch (err) {
      console.error("Error fetching shop data:", err);
      return null;
    }
  };

  useEffect(() => {
      getShopData();
  }, [role]);

  const cancelRequestPercent = shop ? Math.min((shop.cancelRequest / 5) * 100, 100) : 0;
  const cancelPercent = Math.round(cancelRequestPercent);

  return (
    <div style={{ marginBottom: "80px" }} className="container-fluid px-3 px-md-5">
      {/* HEADER CARD */}
<div
  className="card  border-0 p-3 p-md-4 mb-3 mt-2"
  
  style={{ borderRadius: "14px"  , background: "linear-gradient(115deg, #ffffff, #ffffff)"}}
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
  <div className="col-12">
  <div
    className="card p-3 shadow-sm border-0 d-flex flex-column rounded-4"
    style={{
      background: "linear-gradient(135deg, #ffffff 0%, #f9fafb 100%)",
    }}
  >
    {/* Header Row */}
    <div className="d-flex justify-content-between align-items-center flex-wrap">
      <div className="d-flex align-items-center gap-3">
        <div
          className="rounded-circle d-flex align-items-center justify-content-center"
          style={{
            background: "rgba(220,53,69,0.1)",
            width: "45px",
            height: "45px",
          }}
        >
          <i className="fa-solid fa-ban text-danger fs-5"></i>
        </div>
        <div>
          <h6 className="fw-semibold text-secondary m-0" style={{ fontSize: "15px" }}>
            Cancel Requests
          </h6>
          <small className="text-muted" style={{ fontSize: "12px" }}>
            Monitor your cancellation activity
          </small>
        </div>
      </div>

      <h5 className="fw-bold text-dark m-0" style={{ fontSize: "17px" }}>
        {shop?.cancelRequest}
      </h5>
    </div>

    {/* Progress Section */}
    <div className="mt-3">
      <div
        className="progress"
        role="progressbar"
        aria-valuenow={cancelPercent}
        aria-valuemin="0"
        aria-valuemax="100"
        style={{
          height: "11px",
          borderRadius: "20px",
          overflow: "hidden",
        }}
      >
        <div
          className={`progress-bar progress-bar-striped progress-bar-animated bg-${
            cancelPercent >= 80 ? "danger" : cancelPercent >= 80 ? "warning" : "success"
          }`}
          style={{ width: `${cancelPercent}%`, transition: "width 0.6s ease" }}
        ></div>
      </div>
      <div className="d-flex justify-content-between mt-1">
        <small className="text-muted">Cancellation Rate</small>
        <small
          className={`fw-semibold ${
            cancelPercent >= 80 ? "text-danger" : "text-success"
          }`}
        >
          {cancelPercent}%
        </small>
      </div>
    </div>

    {/* Warning Section */}
    {cancelPercent >= 80 && (
      <div
        className="mt-3 p-3 rounded-3 border-start border-4 border-danger"
        style={{
          background: "rgba(255, 0, 0, 0.05)",
        }}
      >
        <div className="d-flex align-items-center gap-2 mb-1">
          <i className="fa-solid fa-triangle-exclamation text-danger fs-6"></i>
          <span className="text-danger fw-semibold small">
            High cancellation rate detected!
          </span>
        </div>
       <small className="text-muted">
  You have made <span className="fw-semibold text-dark">4 cancellations</span>. 
  Once you reach <span className="fw-semibold text-dark">5 cancellations</span>, 
  your account will be <span className="fw-semibold text-danger">temporarily restricted for 7 days</span>.
</small>

      </div>
    )}
  </div>
</div>




  {/* Total Orders */}
  <div className="col-12">
    <div className="card p-3 shadow-sm border-0  d-flex flex-row justify-content-between align-items-center rounded-4"
    style={{background: "linear-gradient(115deg, #ffffff, #ffffff)"}}
    >
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
{
  title: "Assigned",
  count: assignedOrderscount,
  color: "primary",
  icon: "fa-user-check",
  bg: "rgba(13,110,253,0.1)",
},
{
  title: "Unassigned",
  count: unAssignedOrderscount,
  color: "secondary",
  icon: "fa-user-clock",
  bg: "rgba(108,117,125,0.1)",
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
          className="card p-2 shadow-sm border-0  rounded-4 d-flex flex-column justify-content-between align-items-center text-center"
          style={{
            minHeight: "140px",
            background: "linear-gradient(115deg, #ffffff, #ffffff)"
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
                    disabled = {filterLoading}
                  >
                    {
                      filterLoading ? (
                        <><span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                        <span>Applying...</span>
                        </>
                      ):(
                        <>
                        <i className="fa-solid fa-magnifying-glass me-2"></i>Apply Filter
                        </>
                      )
                    }
                    
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
