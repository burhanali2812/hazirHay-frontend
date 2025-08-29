import React, { useEffect, useState } from "react";
import offline from "../images/offline.png";
import { io } from "socket.io-client";
import axios from "axios";

import noData from "../images/noData.png";
function ShopkepperRequests() {
  const socket = io("http://localhost:5000");
  const shopKepperStatus = JSON.parse(localStorage.getItem("shopKepperStatus"));
  const user = JSON.parse(sessionStorage.getItem("user"));
  const [requests, setRequests] = useState([]);
  const [shop, setShop] = useState(null);
  const token = localStorage.getItem("token");

  const getShopData = async () => {
    try {
      const response = await axios.get(
        `https://hazir-hay-backend.wckd.pk/shops/shopData/${user._id}`,
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

  useEffect(() => {
    getShopData();
  }, []);

  useEffect(() => {
    console.log(shopKepperStatus);

    if (user) {
      socket.emit("goOnline", shop?._id);

      socket.on("newRequest", (data) => {
        console.log("New Request:", data);
        alert("You have a new request!");
        setRequests((prevRequests) => [...prevRequests, data]);
        console.log(data);
      });

      return () => {
        socket.disconnect();
      };
    }
  }, [user]);
  return (
    <div className="container">
      {shopKepperStatus ? (
        <>
          {requests.length !== 0 ? (
            <div className="row g-4">
              {requests.filter(Boolean).map((userData, index) => (
                <div className="col-lg-4 col-md-6" key={index}>
                  <div className="card border-0 shadow h-100 rounded-3">
                    <div className="card-body">
                      {/* Profile + Info */}
                      <div className="d-flex align-items-center mb-3">
                        <div
                          className="rounded-circle border flex-shrink-0 d-flex align-items-center justify-content-center bg-light"
                          style={{
                            width: "80px",
                            height: "80px",
                            overflow: "hidden",
                          }}
                        >
                          <img
                            src={userData?.user?.profilePicture}
                            alt="Shop"
                            style={{
                              objectFit: "cover",
                              width: "100%",
                              height: "100%",
                            }}
                          />
                        </div>
                        <div className="ms-3">
                          <h6 className="mb-1 fw-bold text-dark">
                            <i className="fa-solid fa-user text-primary me-2"></i>
                            {userData?.user?.name}
                          </h6>
                          <p className="mb-1 small text-muted">
                            <i className="fa-solid fa-phone text-primary me-2"></i>
                            {userData?.user?.phone}
                          </p>
                          <p className="mb-1 small text-muted">
                            category
                            {userData?.category}
                          </p>
                          <p className="mb-1 small text-muted">
                            SubCategory
                            {userData?.subcategory}
                          </p>
                        </div>
                      </div>

                      {/* Divider */}
                      <hr className="my-3" />

                      <div className="d-flex justify-content-between gap-1">
                        <button className="btn btn-success btn-sm flex-grow-1">
                          <i class="fa-solid fa-circle-check me-1"></i>
                          Accept
                        </button>

                        <button className="btn btn-danger btn-sm flex-grow-1">
                          <i class="fa-solid fa-trash me-1"></i>
                          Delete
                        </button>

                        <button className="btn btn-info btn-sm flex-grow-1 text-white">
                          <i class="fa-solid fa-circle-info me-1"></i>
                          Details
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
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
