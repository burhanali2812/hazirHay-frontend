import React, { useEffect, useState } from "react";
import offline from "../images/offline.png";
import axios from "axios";

import noData from "../images/noData.png";
function ShopkepperRequests({ refreshFlag, setRefreshFlag }) {
  const shopKepperStatus = JSON.parse(localStorage.getItem("shopKepperStatus"));
  const user = JSON.parse(sessionStorage.getItem("user"));
  const [requests, setRequests] = useState([]);
  const [shop, setShop] = useState(null);
  const token = localStorage.getItem("token");

  const getShopData = async () => {
    try {
      const response = await axios.get(
        `https://hazir-hay-backend.vercel.app/shops/shopData/${user._id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
          params: { t: Date.now() }, // Prevent caching
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

  const fetchRequests = async () => {
    console.log(user._id);

    try {
      const response = await axios.get(
        `https://hazir-hay-backend.vercel.app/requests/getRequests/${user._id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
          params: { t: Date.now() },
        }
      );

      if (response.data.success) {
        setRequests(response.data.data || []);
        console.log("request fetch", response.data.data);

        if (refreshFlag) {
          alert("New Request Added");
        }
      } else {
        console.warn("No requests found:", response.data.message);
        setRequests([]);
      }
    } catch (error) {
      console.error(
        "Error fetching requests:",
        error.response?.data?.message || error.message
      );
      setRequests([]);
    }
  };

  useEffect(() => {
    getShopData();
    fetchRequests();
  }, []);

  useEffect(() => {
    if (refreshFlag) {
      fetchRequests();
      setRefreshFlag(false);
    }
  }, [refreshFlag]);

  const groupedData = requests?.reduce((acc, order) => {
    const { checkoutId } = order;

    if (!acc[checkoutId]) {
      acc[checkoutId] = {
        checkoutId,
        orders: [],
        totalCost: 0,
      };
    }

    // Push the order into the orders array
    acc[checkoutId].orders.push(order);

    // Add up the cost
    acc[checkoutId].totalCost += order.cost;

    return acc;
  }, {});

  // Convert object into array if needed
  const result = Object.values(groupedData);

  console.log(result);

  return (
    <div className="container">
      {shopKepperStatus ? (
        <>
          {result.length !== 0 ? (
  <div className="row g-4">
  {result.map((checkoutGroup, index) => {
    const totalDistance = checkoutGroup.orders[0]?.serviceCharges?.distance || 0; 
    const rate = checkoutGroup.orders[0]?.serviceCharges?.rate || 0;
    const serviceCharges = rate * totalDistance;
    const totalOrdersCost = checkoutGroup.totalCost;
    const grandTotal = totalOrdersCost + serviceCharges;

    return (
      <div className="col-lg-4 col-md-6" key={index}>
        <div className="card border-0 shadow h-100 rounded-3">
          <div className="card-body">
            {/* Checkout ID */}
            <h5 className="fw-bold text-primary mb-3">
              Checkout: {checkoutGroup.checkoutId}
            </h5>

            {/* User Info */}
            <div className="d-flex align-items-center mb-3">
              <div
                className="rounded-circle border flex-shrink-0 d-flex align-items-center justify-content-center bg-light"
                style={{ width: "55px", height: "55px", overflow: "hidden" }}
              >
                <img
                  src={checkoutGroup?.orders[0].userId?.profilePicture}
                  alt={checkoutGroup?.orders[0].userId?.name}
                  className="img-fluid rounded-circle"
                />
              </div>
              <div className="ms-3">
                <h6 className="mb-1">{checkoutGroup?.orders[0].userId?.name}</h6>
                <small className="text-muted">
                  {checkoutGroup?.orders[0].userId?.phone}
                </small>
              </div>
            </div>

            {/* Summary */}
            <p className="mb-1">
              <strong>Total Orders:</strong> {checkoutGroup.orders.length}
            </p>
            <p className="mb-3">
              <strong>Total Distance:</strong> {totalDistance.toFixed(2)} km
            </p>

            {/* Orders List */}
            <div className="mb-3">
              <h6 className="fw-bold">Orders:</h6>
              {checkoutGroup.orders.map((order, i) => (
                <div
                  key={i}
                  className="d-flex justify-content-between border-bottom py-1 small"
                >
                  <span className="text-muted">
                    {order.category} - {order.subCategory}
                  </span>
                  <span className="fw-semibold text-success">
                    {order.cost}/-
                  </span>
                </div>
              ))}
            </div>

            {/* Service Charges & Totals */}
            <div className="border-top pt-2">
              <p className="mb-1 small">
                <strong>Service Charges:</strong> {rate} × {totalDistance.toFixed(2)} km ={" "}
                <span className="fw-bold">{serviceCharges.toFixed(0)} PKR</span>
              </p>
              <div className="d-flex justify-content-between">
                              <h6 className="fw-bold  text-primary mt-1">
                Grand Total: {grandTotal.toFixed(0)}/-
              </h6>
              <button className="btn btn-success btn-sm rounded-pill">View Details<i className="fa-solid fa-angles-right ms-1"></i> </button>
                </div>
            </div>
          </div>
        </div>
      </div>
    );
  })}
</div>





          ) : (
            <div
              className="d-flex flex-column justify-content-center align-items-center text-center"
              style={{ height: "65vh" }}
            >
              <img
                src={noData}
                alt="No Data"
                className="mb-3"
                style={{ width: "180px", height: "auto" }}
              />
              <h4 className="fw-bold text-warning mb-2">No Requests Found</h4>
              <p
                className="text-muted"
                style={{ maxWidth: "380px", fontSize: "15px" }}
              >
                Currently, there are no pending requests. Please check back
                later or refresh the page.
              </p>
            </div>
          )}
        </>
      ) : (
        <div
          className="d-flex flex-column justify-content-center align-items-center text-center"
          style={{ height: "65vh" }}
        >
          <img
            src={offline}
            alt="No Data"
            className="mb-3"
            style={{ width: "180px", height: "auto" }}
          />
          <h4 className="fw-bold text-warning mb-2">
            Sorry You're Currently Offline!
          </h4>
          <p
            className="text-muted"
            style={{ maxWidth: "380px", fontSize: "15px" }}
          >
            To go online and start receiving requests, just press the red{" "}
            <strong>Offline</strong> button at the top right corner.
          </p>
        </div>
      )}
    </div>
  );
}

export default ShopkepperRequests;
