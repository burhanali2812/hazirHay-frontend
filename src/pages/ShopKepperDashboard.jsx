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

  useEffect(() => {
    setUpdateAppjs(true);
  }, []);
useEffect(() => {
  const intervals = [];

  // Helper function to animate any counter
  const animateCount = (setter, targetLength) => {
    setter(0); // reset before start
    const interval = setInterval(() => {
      setter((prev) => {
        if (prev < targetLength) return prev + 1;
        clearInterval(interval);
        return prev;
      });
    }, 50);
    intervals.push(interval);
  };

  if (orders?.length > 0) animateCount(setTotalOrdersCount, orders.length);
  if (completedOrders?.length > 0) animateCount(setcompletedOrdersCount, completedOrders.length);
  if (pendingOrders?.length > 0) animateCount(setpendingOrdersCount, pendingOrders.length);
  if (inProgressOrder?.length > 0) animateCount(setinProgressOrderCount, inProgressOrder.length);
  if (rejectedOrders?.length > 0) animateCount(setrejectedOrdersCount, rejectedOrders.length);

  // Cleanup: clear all intervals
  return () => intervals.forEach((i) => clearInterval(i));
}, [orders, completedOrders, pendingOrders, rejectedOrders, inProgressOrder]);


  const getShopkepperOrders = async () => {
    try {
      const res = await axios.get(
        `https://hazir-hay-backend.vercel.app/requests/getshopRequest/${user?._id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            params: { t: Date.now() },
          },
        }
      );
      if (res.data.success) {
        const orders = res.data.data;
        setOrders(orders);

        const earning = orders
          .filter((order) => order.status === "completed")
          .reduce((acc, order) => acc + (order.cost || 0), 0);
        setTotalOrdersEarnings(earning);

        setPendingOrders(orders.filter((o) => o.status === "pending"));
        setRejectedOrders(orders.filter((o) => o.status === "rejected"));
        setCompletedOrders(orders.filter((o) => o.status === "completed"));
        setInprogressOrder(orders.filter((o) => o.status === "inProgress"));
      }
    } catch (error) {
      console.log(error);
      alert("Error in getting orders");
    }
  };

  useEffect(() => {
    getShopkepperOrders();
  }, [token]);

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
            className="btn btn-primary btn-sm px-3"
            onClick={() => setFilterModal(true)}
          >
            <i className="fa-solid fa-filter me-2"></i> Filter
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

              <div className="modal-body text-center p-3">
                <div className="d-flex flex-column gap-2">
                  <input type="date" className="form-control" />
                  <input type="date" className="form-control" />
                  <button className="btn btn-primary mt-3 w-100">
                    <i className="fa-solid fa-filter me-2"></i>Apply Filter
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
