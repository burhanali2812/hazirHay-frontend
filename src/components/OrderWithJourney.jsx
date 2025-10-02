import React, { useState, useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import UserShopRoute from "./UserShopRoute";
import axios from "axios";
import * as htmlToImage from "html-to-image";
import { useNavigate } from "react-router-dom";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";
import successAudio from "../sounds/success.mp3";
function OrderWithJourney() {
  const [routeInfo, setRouteInfo] = useState(null);
  const [shopKepperCords, setShopKepperCords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [orderCompleteModal, setOrderCompleteModal] = useState(false);
  const location = useLocation();
  const selectedTrackShopData = location.state;
  console.log("selectedShop", selectedTrackShopData);
  const token = localStorage.getItem("token");
  const navigate = useNavigate();
   const ref = useRef();

  const position = selectedTrackShopData?.orders[0]?.location?.[0]?.coordinates;

  const completedOrder = async () => {
    setLoading(true);
    const requests =
      selectedTrackShopData?.orders?.map((order) => ({ _id: order._id })) || [];

    if (requests.length === 0) {
      setLoading(false);
      return alert("No orders to complete");
    }

    try {
      const res = await axios.put(
        "https://hazir-hay-backend.vercel.app/requests/completeRequest",
        { requests },
        {
          headers: { Authorization: `Bearer ${token}` },
          params: { t: Date.now() }, // avoid caching
        }
      );

      if (res.data.success) {
        setLoading(false);
        alert(res.data.message);
        // navigate("/admin/shopKepper/requests");
        setOrderCompleteModal(true);
      }
    } catch (error) {
      setLoading(false);
      console.error("Error completing orders:", error);
    }
  };

  const updateLocation = async (lat, lng) => {
    const payload = {
      lat,
      lng,
    };
    try {
      const res = await axios.put(
        `https://hazir-hay-backend.vercel.app/shops/updateLiveLocation/${selectedTrackShopData?.orders[0]?.shopId}`,
        payload,
        {
          headers: { Authorization: `Bearer ${token}` },
          params: { t: Date.now() },
        }
      );
      if (res.data.success) {
        console.log(res.data.message);
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    const interval = setInterval(() => {
      if (!navigator.geolocation) {
        alert("Geolocation is not supported by your browser");
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const lat = pos.coords.latitude;
          const lng = pos.coords.longitude;
          setShopKepperCords([lng, lat]);
          updateLocation(lat, lng);
        },
        (error) => {
          if (error.code === error.PERMISSION_DENIED) {
            alert("Please turn on location and allow access to continue");
          } else if (error.code === error.POSITION_UNAVAILABLE) {
            alert("Location unavailable. Please try again");
          } else if (error.code === error.TIMEOUT) {
            alert("Location request timed out. Please try again");
          } else {
            alert("Unable to retrieve your location");
          }
        }
      );
    }, 3000);

    return () => clearInterval(interval);
  }, []);
  useEffect(() => {
    if (orderCompleteModal) {
      const audio = new Audio(successAudio);
      audio.play().catch((err) => {
        console.error("Autoplay blocked:", err);
      });
    }
  }, [orderCompleteModal]);

  const distance = selectedTrackShopData?.orders[0]?.serviceCharges?.distance || 0;
  const rate = selectedTrackShopData?.orders[0]?.serviceCharges?.rate || 0;
  const serviceCharges = distance * rate;
  const grandTotal = Number(selectedTrackShopData?.totalCost) + Number(serviceCharges);

 const handleShare = async () => {
    console.log("Button clicked ✅");

    if (!ref.current) {
      alert("ref is null ❌");
      return;
    }

    try {
      // Step 1: Take screenshot (high quality)
      const dataUrl = await htmlToImage.toPng(ref.current, {
        quality: 1,
        pixelRatio: 3,
      });

      // Step 2: Convert to Blob (needed for share)
      const res = await fetch(dataUrl);
      const blob = await res.blob();

      const file = new File([blob], "screenshot.png", { type: "image/png" });

      // Step 3: Share
      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          title: "Check this out!",
          text: "Here’s a screenshot ",
          files: [file],
        });
        console.log("Shared successfully!");
      } else {
        alert("Sharing with files not supported on this browser.");
      }
    } catch (error) {
      console.error("Sharing failed", error);
    }
  }

  return (
    <div style={{ marginBottom: "65px" }} className="bg-white container">
      <div>
        <div
          style={{
            height: "400px",
            width: "100%",
            borderRadius: "5px",
            overflow: "hidden",
          }}
          className="shadow-sm"
        >
          {shopKepperCords && position && (
            <UserShopRoute
              userCoords={[position[1], position[0]]}
              shopCoords={[shopKepperCords[0], shopKepperCords[1]]}
              onRouteInfo={(info) => setRouteInfo(info)}
              type={"live"}
            />
          )}
        </div>

        <div
          className="card border-0 shadow-sm mt-3"
          style={{
            borderRadius: "20px",
            padding: "20px",
            backgroundColor: "#f9fbfd",
          }}
        >
          {selectedTrackShopData && (
            <>
              <h3 className="fw-bold text-center text-primary mb-3">
                {selectedTrackShopData?.orders[0]?.userId?.name}
              </h3>

              <div className="d-flex justify-content-center gap-2 flex-wrap mb-3">
                <a
                  href={`tel:${selectedTrackShopData?.orders[0]?.userId?.phone}`}
                  className="btn btn-outline-info btn-sm text-dark rounded-pill px-3"
                >
                  <i className="fa-solid fa-phone-volume me-1"></i> Call Now
                </a>

                <a
                  href={`https://wa.me/${`+92${selectedTrackShopData?.orders[0]?.userId?.phone?.slice(
                    1
                  )}`}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-outline-success btn-sm rounded-pill px-3"
                >
                  <i className="fa-brands fa-whatsapp me-1"></i> WhatsApp
                </a>

                <button className="btn btn-outline-primary btn-sm rounded-pill px-3">
                  <i className="fa-solid fa-comments me-1"></i> Live Chat
                </button>
              </div>

              {/* DISTANCE + TIME */}
              <div className="d-flex justify-content-around text-muted small mb-3">
                <span>
                  <i className="fa-solid fa-clock me-1 text-secondary"></i>
                  <b>ETA:</b> {routeInfo?.duration} mins
                </span>
                <span>
                  <i className="fa-solid fa-route me-1 text-secondary"></i>
                  <b>Distance:</b> {routeInfo?.distance} km
                </span>
              </div>

              {/* ORDER DETAILS */}
              <div className="mt-2">
                <h5 className="text-center fw-bold text-dark mb-3">
                  Order Details
                </h5>

                {selectedTrackShopData.orders.map((order, index) =>
                  order?.status === "accepted" ? (
                    <div key={index} className="mt-4">
                      <h5 className="text-center fw-bold text-light mb-3 bg-primary rounded-2 p-2">
                        Order {index + 1}
                      </h5>
                      <ul className="list-group list-group-flush">
                        <li className="list-group-item d-flex justify-content-between align-items-center">
                          <span>
                            <i className="fa-solid fa-signal me-2 text-secondary"></i>
                            Status
                          </span>
                          <span>
                            <span
                              className={`badge rounded-pill ${
                                order?.status === "pending"
                                  ? "bg-warning text-dark"
                                  : order?.status === "completed"
                                  ? "bg-success"
                                  : order?.status === "cancelled"
                                  ? "bg-danger"
                                  : "bg-secondary"
                              }`}
                            >
                              {order?.status}
                            </span>
                          </span>
                        </li>

                        <li className="list-group-item d-flex justify-content-between align-items-center">
                          <span>
                            <i className="fa-solid fa-receipt me-2 text-secondary"></i>
                            Order ID
                          </span>
                          <span className="fw-semibold">{order?.orderId}</span>
                        </li>

                        <li className="list-group-item d-flex justify-content-between align-items-center">
                          <span>
                            <i className="fa-solid fa-barcode me-2 text-secondary"></i>
                            Checkout ID
                          </span>
                          <span>{order?.checkoutId}</span>
                        </li>

                        <li className="list-group-item d-flex justify-content-between align-items-center">
                          <span>
                            <i className="fa-solid fa-tags me-2 text-secondary"></i>
                            Category
                          </span>
                          <span>{order?.category}</span>
                        </li>

                        <li className="list-group-item d-flex justify-content-between align-items-center">
                          <span>
                            <i className="fa-solid fa-toolbox me-2 text-secondary"></i>
                            Sub Category
                          </span>
                          <span>{order?.subCategory}</span>
                        </li>

                        <li className="list-group-item d-flex justify-content-between align-items-center">
                          <span>
                            <i className="fa-solid fa-money-bill-wave me-2 text-secondary"></i>
                            Order Cost
                          </span>
                          <span
                            className="fw-bold text-primary"
                            style={{ fontSize: "18px" }}
                          >
                            Rs. {order?.cost}/-
                          </span>
                        </li>
                      </ul>

                    </div>
                  ) : null
                )}
              </div>
            </>
          )}
          <hr className="my-4" />
       <div>
           <h5 className="text-center fw-bold text-dark mb-3">
            Payment Summary
          </h5>
          <ul className="list-group list-group-flush mb-3">
            <li className="list-group-item d-flex justify-content-between align-items-center">
              <span>
                <i className="fa-solid fa-money-bill me-2 text-secondary"></i>
                Total Order Cost
              </span>
              <span
                className="fw-bold text-success"
                style={{ fontSize: "15px" }}
              >
                Rs. {selectedTrackShopData?.totalCost}/-
              </span>
            </li>
            <li className="list-group-item d-flex justify-content-between align-items-center">
              <span>
             
                <i className="fa-solid fa-person-biking me-2 text-secondary"></i>
                Service Charges
              </span>
              <span className="fw-bold text-success" style={{ fontSize: "15px" }}>
                Rs. {serviceCharges}/-
              </span>   
            </li>
            <li className="list-group-item d-flex justify-content-between align-items-center bg-light">
              <span className="fw-bold text-dark">
                <i className="fa-solid fa-calculator me-2 text-secondary"></i>
                Grand Total
              </span>
              <span
                className="fw-bold text-primary"  
                style={{ fontSize: "20px" }}
              >
                Rs. {grandTotal}/-
              </span>
            </li>
          </ul>
       </div>
          <button
            className="w-100  mt-2 btn btn-warning  rounded-pill"
            onClick={completedOrder}
            disabled={loading}
          >
            {loading ? (
              <>
                Completing...
                <div
                  className="spinner-border spinner-border-sm text-dark ms-2"
                  role="status"
                ></div>
              </>
            ) : (
              <>
                <i class="fa-solid fa-circle-check me-1"></i>
                Complete Order{" "}
              </>
            )}
          </button>
        </div>
      </div>
      {orderCompleteModal && (
        <div
        ref={ref} 
          className="modal fade show d-block"
          tabIndex="-1"
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
        >
          <div className="modal-dialog modal-lg modal-dialog-centered ">
            <div className="modal-content">
              <div className="modal-body bg-white  rounded-5 border-0 shadow-sm ">
                {/* Animation */}
                <div className="text-center d-flex justify-content-center">
                  <DotLottieReact
                    src="https://lottie.host/d78f201d-181a-450c-803f-43ab471ef7f1/ENnJonrsix.lottie"
                    loop
                    autoplay
                    style={{ width: "225px", height: "185px" }}
                  />
                </div>

                <h4 className="text-center text-success fw-bold mb-4">
                  Order Completed!
                </h4>

                <h5 className="fw-bold text-dark mb-3">Order Details</h5>

                <ul className="list-group list-group-flush">
                  {selectedTrackShopData?.orders
                    ?.filter((order) => order?.status === "accepted")
                    ?.map((order, index) => (
                      <li
                        key={index}
                        className="list-group-item d-flex justify-content-between align-items-center"
                      >
                        <div>
                          <p className="mb-1">
                            {index + 1} {" : "}
                            {order?.category} -{order?.subCategory}{" "}
                            <span
                              className="fw-bold text-primary"
                              style={{ fontSize: "16px" }}
                            >
                              Rs. {order?.cost}/-
                            </span>
                          </p>
                        </div>
                      </li>
                    ))}

                </ul>
                          <hr className="my-4" />
       <div>
           <h5 className="text-center fw-bold text-dark mb-3">
            Payment Summary
          </h5>
          <ul className="list-group list-group-flush mb-3">
            <li className="list-group-item d-flex justify-content-between align-items-center">
              <span>
                <i className="fa-solid fa-money-bill me-2 text-secondary"></i>
                Total Order Cost
              </span>
              <span
                className="fw-bold text-success"
                style={{ fontSize: "15px" }}
              >
                Rs. {selectedTrackShopData?.totalCost}/-
              </span>
            </li>
            <li className="list-group-item d-flex justify-content-between align-items-center">
              <span>
             
                <i className="fa-solid fa-person-biking me-2 text-secondary"></i>
                Service Charges
              </span>
              <span className="fw-bold text-success" style={{ fontSize: "15px" }}>
                Rs. {serviceCharges}/-
              </span>   
            </li>
            <li className="list-group-item d-flex justify-content-between align-items-center bg-light">
              <span className="fw-bold text-dark">
                <i className="fa-solid fa-calculator me-2 text-secondary"></i>
                Grand Total
              </span>
              <span
                className="fw-bold text-primary"  
                style={{ fontSize: "20px" }}
              >
                Rs. {grandTotal}/-
              </span>
            </li>
          </ul>
       </div>

                {/* Buttons */}
                <div className="d-flex justify-content-end gap-3 mt-4">
                  <button className="btn btn-outline-primary btn-sm text-center " onClick={handleShare}>
                    <i className="fa-solid fa-share-nodes me-2"></i> 
                  </button>
                  <button className="btn btn-outline-success btn-sm" onClick={() => window.print()}>
                    <i className="fa-solid fa-download me-2"></i> 
                  </button>
                  <button className="btn btn-success btn-sm" onClick={()=> {
                    setOrderCompleteModal(false);
                    navigate("/admin/shopKepper/requests");
                  }}>
                    <i className="fa-solid fa-plus me-2"></i> More Request
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

export default OrderWithJourney;
