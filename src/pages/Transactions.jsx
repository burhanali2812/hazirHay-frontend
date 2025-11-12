import axios from "axios";
import React, { useState, useEffect } from "react";
import "../pages/style.css";
const Transactions = () => {
  const [transactions, setTransactions] = useState([]);
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [transactionModal, setTransactionModal] = useState(false);
   const [filterLoading, setFilterLoading] = useState(false);
const [startDate, setStartDate] = useState(
  new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]
);
const [endDate, setEndDate] = useState(new Date().toISOString().split("T")[0]);
  const [dateModalOpen, setDateModalOpen] = useState(false);
  const user = JSON.parse(sessionStorage.getItem("user"));
  const token = localStorage.getItem("token");
  const fetchTransactions = async () => {
    try {
      const response = await axios(
        `https://hazir-hay-backend.vercel.app/transactions/getTransactionsByShopkeeper/${user._id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          params: { t: Date.now() },
        }
      );
      if (response.data.success) {
      let orders = response.data.data;
         if (startDate && endDate) {
        const start = new Date(startDate);
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);

        orders = orders.filter((req) => {
          const createdAt = new Date(req.date);
          return createdAt >= start && createdAt <= end;
        });
      }
        setTransactions(orders);
        
        //alert("Transactions fetched successfully");
      }
    } catch (error) {
      console.error("Error fetching transactions:", error);
    }
  };
  useEffect(() => {
    fetchTransactions();
  }, []);

  const applyFilter  = async () => {
    setFilterLoading(true);
    await fetchTransactions();
    setFilterLoading(false);
    setDateModalOpen(false);
  }

  const handleOpenMOdal = (transaction) => {
    setSelectedTransaction(transaction);
    setTransactionModal(true);
  };
  return (
    <div className="container my-2">
      <div
        className="position-relative mb-3 align-content-center align-items-center"
        style={{ height: "40px" }}
      >
        <i
          className="fa-solid fa-arrow-left position-absolute start-0 mt-1"
          style={{ cursor: "pointer", fontSize: "18px" }}
          onClick={() => window.history.back()} 
        ></i>

        <h5 className="m-0 text-center fw-bold">Transactions</h5>
      </div>

          <div className="mb-3 d-flex justify-content-between align-items-center">
<button
  className="btn btn-sm btn-primary px-2"
  onClick={() => setDateModalOpen(true)}
>
  <i className="fa-solid fa-calendar-days me-2"></i>
  {`${new Date(startDate).toLocaleDateString("en-GB")} - ${new Date(
    endDate
  ).toLocaleDateString("en-GB")}`}
</button>

       <button className="btn-sm btn btn-outline-primary px-2" disabled={transactions.length === 0}>{<><i class="fa-solid fa-download me-2"></i>Download</>}</button>
      </div>
  

      {transactions?.length === 0 ? (
        <p className="text-muted">No transactions found.</p>
      ) : (
        <ul className="list-group">
          {transactions.map((transaction, index) => (
            <li
              key={index}
              className="list-group-item d-flex justify-content-between align-items-center"
              style={{
                border: "none",
                borderBottom: "1px solid #ddd",
                paddingLeft: "10px",
                paddingRight: "10px",
              }}
              onClick={() => handleOpenMOdal(transaction)}
            >
              <div className="d-flex align-items-center">
                <div
                  className="rounded-circle d-flex align-items-center justify-content-center me-2"
                  style={{
                    width: "35px",
                    height: "35px",
                    backgroundColor: "#007bff",
                    color: "#fff",
                    fontSize: "14px",
                    flexShrink: 0,
                  }}
                >
                  {transaction.workerId?.name?.slice(0, 1).toUpperCase() || "W"}
                </div>
                <div>
                  <div className="d-flex align-items-center mb-1">
                    <p className="mb-0 fw-bold me-2">
                      {transaction.workerId?.name}
                    </p>
                    <span className="badge text-bg-primary small">
                      {transaction.orderIds?.length}
                    </span>
                  </div>
                  <small className="text-muted">
                    {new Date(transaction.date).toLocaleString()}
                  </small>
                </div>
              </div>

              {/* Amount */}
              <div>
                <span className="text-success fw-bold">
                  + Rs.{transaction.totalPayable?.toFixed(0)}/-
                </span>
              </div>
            </li>
          ))}
        </ul>
      )}
{transactionModal && (
  <div
    className="modal fade show d-block "
    tabIndex="-1"
    style={{
      backgroundColor: "rgba(0, 0, 0, 0.6)",
      backdropFilter: "blur(1px)",
    }}
  >
    <div className="modal-dialog modal-sm modal-dialog-centered">
      <div className="modal-content shadow-lg border-0" style={{ borderRadius: "12px" }}>
        
        {/* Header */}
        <div
          className="modal-header text-light py-2 px-3"
          style={{ backgroundColor: "#1e1e2f", borderRadius: "12px 12px 0 0" }}
        >
          <h6 className="modal-title m-0">Transaction Details</h6>
          <button
            type="button"
            className="btn-close btn-close-white"
            aria-label="Close"
            onClick={() => setTransactionModal(false)}
          ></button>
        </div>

    
        <div className="modal-body text-start  container">
          {selectedTransaction ? (
            <>
              {/* Top Details */}
<div className="container mt-3">
<div
  className="d-flex justify-content-between align-items-start gap-2 flex-wrap"
  style={{ backgroundColor: "#fff" }}
>
  {/* Worker Card */}
  <div
    className="d-flex flex-column align-items-center text-center  rounded p-2 shadow-sm flex-fill"
    style={{ backgroundColor: "#f9fafb", width: "48%" }}
  >
    <div
      className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center mb-2"
      style={{ width: "40px", height: "40px", fontSize: "16px" }}
    >
      {selectedTransaction.workerId?.name?.[0]?.toUpperCase() || "W"}
    </div>
    <p className="fw-semibold mb-1 text-dark" style={{ fontSize: "14px" }}>
      {selectedTransaction.workerId?.name || "Unknown"}
    </p>
    <span className="badge bg-primary text-light mb-2 small">Worker</span>

    <div className="d-flex justify-content-center gap-3">
      <a
        href={`tel:${selectedTransaction.workerId?.phone || ""}`}
        className="text-decoration-none text-primary"
        title="Call Worker"
      >
        <i className="fa-solid fa-phone"></i>
      </a>
      <a
        href={`https://wa.me/${selectedTransaction.workerId?.phone || ""}`}
        target="_blank"
        rel="noopener noreferrer"
        className="text-decoration-none text-success"
        title="WhatsApp Worker"
      >
        <i className="fa-brands fa-whatsapp fa-lg"></i>
      </a>
    </div>
  </div>

  {/* Customer Card */}
  <div
    className="d-flex flex-column align-items-center text-center  rounded p-2 shadow-sm flex-fill"
    style={{ backgroundColor: "#f9fafb", width: "48%" }}
  >
    <div
      className="rounded-circle bg-success text-white d-flex align-items-center justify-content-center mb-2"
      style={{ width: "40px", height: "40px", fontSize: "16px" }}
    >
      {selectedTransaction.customerId?.name?.[0]?.toUpperCase() || "C"}
    </div>
    <p className="fw-semibold mb-1 text-dark" style={{ fontSize: "14px" }}>
      {selectedTransaction.customerId?.name || "Unknown"}
    </p>
    <span className="badge bg-success text-light mb-2 small">Customer</span>

    <div className="d-flex justify-content-center gap-3">
      <a
        href={`tel:${selectedTransaction.customerId?.phone || ""}`}
        className="text-decoration-none text-primary"
        title="Call Customer"
      >
        <i className="fa-solid fa-phone"></i>
      </a>
      <a
        href={`https://wa.me/${selectedTransaction.customerId?.phone || ""}`}
        target="_blank"
        rel="noopener noreferrer"
        className="text-decoration-none text-success"
        title="WhatsApp Customer"
      >
        <i className="fa-brands fa-whatsapp fa-lg"></i>
      </a>
    </div>
  </div>
</div>



  <div className="my-4 text-center">
    <hr className="border-2 opacity-50" />
    <p className="text-muted small mb-0">
      <i className="fa-regular fa-clock me-1"></i>
      {new Date(selectedTransaction.date).toLocaleString()}
    </p>
  </div>
</div>



              {/* Orders List */}
              <div className="mb-3 border-top pt-2">
                <h6 className="fw-bold text-dark mb-2">Orders</h6>
                {selectedTransaction.orderIds?.length > 0 ? (
                  selectedTransaction.orderIds.map((req, idx) => (
                    <div
                      key={idx}
                      className="border-bottom pb-2 mb-2"
                    >
                      <div className="d-flex justify-content-between">
                        <span className="fw-semibold text-dark">
                          <i className="fa-solid fa-barcode me-2 text-primary"></i>
                          {req.orderId || req._id}
                        </span>
                        <span className="fw-bold text-success">
                          Rs. {req.cost || 0}/-
                        </span>
                      </div>
                      <p className="text-muted small mb-0 ms-4">
                        {req.category} → {req.subCategory}
                      </p>
                    </div>
                  ))
                ) : (
                  <h6 className="text-muted">No orders found</h6>
                )}
              </div>

              {/* Summary */}
              <div className="border-top pt-2">
                <h6 className="fw-bold text-dark mb-2">Summary</h6>
                <div className="d-flex justify-content-between mb-1">
                  <span>Total Orders Cost:</span>
                  <span className="fw-semibold">
                    Rs.{" "}
                    {selectedTransaction.orderIds?.reduce(
                      (sum, o) => sum + (o.cost || 0),
                      0
                    )}/-
                  </span>
                </div>
                <div className="d-flex justify-content-between mb-1">
                  <span>Delivery Charges:</span>
                  <span className="fw-semibold">
                    Rs. {selectedTransaction.deliveryCharge?.toFixed(0) || 0}/-
                  </span>
                </div>
                <div className="d-flex justify-content-between fw-bold border-top pt-1">
                  <span>Subtotal:</span>
                  <span className="text-success">
                    Rs. {selectedTransaction.totalPayable?.toFixed(0) || 0}/-
                  </span>
                </div>
              </div>
            </>
          ) : (
            <h6 className="text-muted text-center">No transaction selected</h6>
          )}
        </div>
      </div>
    </div>
  </div>
)}

{dateModalOpen && (
  <div
    className="modal fade show d-block"
    tabIndex="-1"
    style={{
      backgroundColor: "rgba(0, 0, 0, 0.6)",
      backdropFilter: "blur(2px)",
    }}
  >
    <div
      className="modal-dialog modal-sm"
      style={{
        position: "fixed",
        bottom: "0",
        left: "50%",
        transform: "translateX(-50%)",
        margin: 0,
        width: "100%",
        maxWidth: "400px",
        animation: "slideUp 0.3s ease",
      }}
    >
      <div
        className="modal-content shadow-lg border-0"
        style={{
          borderRadius: "15px 15px 0 0",
          overflow: "hidden",
        }}
      >
        {/* Header */}
        <div
          className="modal-header text-light py-2 px-3"
          style={{
            backgroundColor: "#1e1e2f",
          }}
        >
          <h6 className="modal-title m-0">Select Date Range</h6>
          <button
            type="button"
            className="btn-close btn-close-white"
            aria-label="Close"
            onClick={() => setDateModalOpen(false)}
          ></button>
        </div>

        {/* Body */}
        <div className="modal-body text-start container">
          <div className="mb-3">
            <label className="form-label fw-semibold">Start Date</label>
            <input
              type="date"
              className="form-control"
              value={startDate || ""}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>
          <div className="mb-3">
            <label className="form-label fw-semibold">End Date</label>
            <input
              type="date"
              className="form-control"
              value={endDate || ""}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>

          <button className="btn btn-outline-dark w-100" onClick={applyFilter}>
             {filterLoading ? (
              <>
                Applying...
                <div
                  className="spinner-border spinner-border-sm text-light ms-2"
                  role="status"
                ></div>
              </>
            ) : (
              <>
                Apply Filter<i class="fa-solid fa-filter ms-2"></i>
              </>
            )}
            
            </button>
        </div>
      </div>
    </div>
  </div>
)}




    </div>
  );
};

export default Transactions;
