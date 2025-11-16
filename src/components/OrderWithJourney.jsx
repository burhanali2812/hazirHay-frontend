import React, { useState, useEffect, useRef } from "react";
import UserShopRoute from "./UserShopRoute";
import axios from "axios";
import * as htmlToImage from "html-to-image";
import { useNavigate, useLocation } from "react-router-dom";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";
import successAudio from "../sounds/success.mp3";
import Swal from "sweetalert2";
import { useCheckBlockedStatus } from "./useCheckBlockedStatus";
function OrderWithJourney({ setStausUpdate }) {
  const user = JSON.parse(localStorage.getItem("user"));
  const [routeInfo, setRouteInfo] = useState(null);
  const [shopKepperCords, setShopKepperCords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [orderCompleteModal, setOrderCompleteModal] = useState(false);
  const [shareLoading, setShareLoading] = useState(false);
  const [cancelLoading, setCalcelLoading] = useState(false);
  const [isContentShow, setIsContentShow] = useState(true);
  const role = localStorage.getItem("role");
  useEffect(() => {
    if (role !== "worker") {
      navigate("/unauthorized/user", { replace: true });
    }
  }, [role]);
  const selectedTrackShopData = JSON.parse(
    localStorage.getItem("currentCheckout")
  );

  const token = localStorage.getItem("token");
  const navigate = useNavigate();
  const ref = useRef();
  useCheckBlockedStatus(token);
  //const selectedTrackShopData = location.state.orders;
  console.log("Selectedhggg", selectedTrackShopData);

  const position = selectedTrackShopData?.[0]?.location?.[0]?.coordinates;

  const sendNotificationToUser = async (type) => {
    if (!selectedTrackShopData) return;
    if (!user) return;
    const payload = {
      type: "complete",
      message: `Your order has been completed successfully of Rs. ${selectedTrackShopData?.totalCost}/- . Thank you for choosing our service! cheeckoutId: `,
      checkoutId: selectedTrackShopData?.[0]?.orders[0]?.checkoutId,
      userId:
        type === "shop"
          ? user._id
          : selectedTrackShopData?.[0]?.orders[0]?.userId,
    };

    try {
      const res = await axios.post(
        "https://hazir-hay-backend.vercel.app/notification/addNotification",
        payload,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (res.data.success) {
        console.log("Notification sent:", res.data.data);
      }
    } catch (error) {
      console.error("Error sending notification:", error);
    }
  };

  const postTransaction = async () => {
    if (!selectedTrackShopData || selectedTrackShopData.length === 0) {
      alert("No orders selected for transaction.");
      return;
    }

    try {
      const response = await axios.post(
        "https://hazir-hay-backend.vercel.app/transactions/createTransaction",
        { transactionData: selectedTrackShopData },
        {
          headers: { Authorization: `Bearer ${token}` },
          params: { t: Date.now() }, // prevents caching
        }
      );

      if (response.data.success) {
        console.log("Transaction created:", response.data.data);
        alert("Transaction saved successfully!");
      } else {
        alert("Failed to save transaction.");
        console.error("Response error:", response.data);
      }
    } catch (error) {
      console.error("Error creating transaction:", error);
      alert("An error occurred while saving the transaction.");
    }
  };

  const completedOrder = async () => {
    setLoading(true);
    const requests =
      selectedTrackShopData?.map((order) => ({ _id: order._id })) || [];
    console.log("transactionRequests", requests);

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
          params: { t: Date.now() },
        }
      );

      if (res.data.success) {
        await postTransaction();
        alert(res.data.message);
        setOrderCompleteModal(true);
      }
    } catch (error) {
      setLoading(false);
      console.error("Error completing orders:", error);
    }
  };
  const cancelOrder = async () => {
    const requests =
      selectedTrackShopData?.map((order) => ({ _id: order._id })) || [];

    const requestSize = requests.length;
    const title =
      requestSize > 1
        ? `Cancel all ${requestSize} orders?`
        : "Cancel this order?";
    const buttonText = requestSize > 1 ? "Yes, Cancel all!" : "Yes, Cancel!";
    const result = await Swal.fire({
      title: title,
      text: "You won't be able to undo this action.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#6c757d",
      confirmButtonText: buttonText,
      background: "#f9f9f9",
      customClass: {
        popup: "swirl-popup",
      },
    });
    if (!result.isConfirmed) {
      return;
    }

    setCalcelLoading(true);
    try {
      const res = await axios.put(
        `https://hazir-hay-backend.vercel.app/requests/markDeleteRequestByShopkeeper/${selectedTrackShopData?.[0]?.shopOwnerId}`,
        { requests, type: "cancel" },
        {
          headers: { Authorization: `Bearer ${token}` },
          params: { t: Date.now() },
        }
      );

      if (res.data.success) {
        if (res.data.warning) {
          setCalcelLoading(false);
          alert(res.data.message);
          Swal.fire({
            title: "Cancelled!",
            text: "Orders have been cancelled successfully.",
            icon: "success",
            timer: 900,
            showConfirmButton: false,
            background: "#f9f9f9",
            customClass: {
              popup: "swirl-popup",
            },
          });
          navigate("/worker/dashboard");
        } else {
          setCalcelLoading(false);
          Swal.fire({
            title: "Cancelled!",
            text: "Orders have been cancelled successfully.",
            icon: "success",
            timer: 900,
            showConfirmButton: false,
            background: "#f9f9f9",
            customClass: {
              popup: "swirl-popup",
            },
          });
          navigate("/worker/dashboard");
        }
      }
    } catch (error) {
      setCalcelLoading(false);

      if (
        error.response &&
        error.response.status === 403 &&
        error.response.data.blocked
      ) {
        Swal.fire({
          title: "Shop Blocked!",
          text: "Your shop has been blocked for 7 days due to exceeding the cancellation limit.",
          icon: "warning",
          timer: 1500,
          showConfirmButton: false,
          background: "#fff8e1",
        });

        navigate("/worker/dashboard");
        return;
      }

      // Default unknown error
      Swal.fire({
        title: "Error!",
        text: "Something went wrong.",
        icon: "error",
        timer: 1200,
        showConfirmButton: false,
      });
    }
  };

  const updateLocation = async (lat, lng) => {
    const payload = {
      lat,
      lng,
    };
    try {
      const res = await axios.put(
        `https://hazir-hay-backend.vercel.app/worker/updateLiveLocation/${user._id}`,
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
    }, 5000);

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
  const totalCost = selectedTrackShopData?.reduce(
    (sum, req) => sum + (req.cost || 0),
    0
  );

  const distance = selectedTrackShopData?.[0]?.serviceCharges?.distance || 0;
  const rate = selectedTrackShopData?.[0]?.serviceCharges?.rate || 0;
  const serviceCharges = Number(distance * rate).toFixed(2);
  const grandTotal = (Number(totalCost) + Number(serviceCharges)).toFixed(0);

  const handleShare = async () => {
    setShareLoading(true);

    if (!ref.current) {
      alert("ref is null ");
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
        setShareLoading(false);
        console.log("Shared successfully!");
      } else {
        setShareLoading(false);
        alert("Sharing with files not supported on this browser.");
      }
    } catch (error) {
      setShareLoading(false);
      console.error("Sharing failed", error);
    }
  };
  const handleIscontentToggle = () => {
    setIsContentShow(!isContentShow);
  };

  const handleBack = () => {
    localStorage.removeItem("currentCheckout");
    navigate("/worker/dashboard");
  };
  const openGoogleMaps = (userCoords, shopCoords) => {
    const url = `https://www.google.com/maps/dir/?api=1&origin=${userCoords[1]},${userCoords[0]}&destination=${shopCoords[1]},${shopCoords[0]}&travelmode=driving`;

    window.open(url, "_blank");
  };

  return (
    <>
      <div
        className="bg-white w-100 d-flex align-items-center shadow-sm"
        style={{
          height: "50px",
          position: "fixed",
          top: 0,
          left: 0,
          zIndex: 1000,
        }}
      >
        <div
          className="ms-3 fw-bold text-primary"
          style={{ cursor: "pointer" }}
          onClick={handleBack}
        >
          <i className="fa-solid fa-angle-left me-1"></i> Back
        </div>
      </div>

      <div className=" container">
        <div>
          <div
            style={{
              height: isContentShow ? "500px" : "auto",
              width: "100%",
              borderRadius: "5px",
              overflow: "hidden",
            }}
            className="shadow-sm "
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
          {/* GOOGLE MAP BUTTON */}
        {
          routeInfo === null ? (
            <div className="text-center mt-3">
              <div
                className="spinner-border text-primary"
                role="status"
              >
                <span className="visually-hidden">Loading...</span>
              </div>
            </div>
          ):(
          <>
            <button
            className="btn btn-primary w-100 mt-3 fw-semibold rounded-pill "
            onClick={() =>
              openGoogleMaps(
                [position[1], position[0]],
                [shopKepperCords[0], shopKepperCords[1]]
              )
            }
            disabled={routeInfo === null}
          >
            <i className="fa-solid fa-map-location-dot me-1"></i>
            Open in Google Maps
          </button>
          <button
            className="btn btn-sm w-100 mt-2 fw-semibold d-flex align-items-center justify-content-center gap-2 py-2 rounded-pill shadow-sm text-white"
            style={{
              backgroundColor: isContentShow ? "#dc3545" : "#000000ff",
              border: "none",
              transition: "all 0.25s ease",
              boxShadow: "0 4px 8px rgba(0, 0, 0, 0.15)",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.filter = "brightness(1.1)";
              e.currentTarget.style.transform = "translateY(-2px)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.filter = "brightness(1)";
              e.currentTarget.style.transform = "translateY(0)";
            }}
            onClick={handleIscontentToggle}
          >
            <i
              className={`fa-solid fa-${isContentShow ? "map" : "list"} fs-6`}
            ></i>
            {isContentShow ? "View Map Only" : "Show Details with Map"}
            <i
              className={`fa-solid fa-angle-${
                isContentShow ? "up" : "down"
              } ms-1`}
            ></i>
          </button>

          {isContentShow && (
            <div
              className="card border-0 shadow-sm mt-3"
              style={{
                borderRadius: "20px",
                padding: "20px",
                backgroundColor: "#f9fbfd",
                transition: "opacity 0.6s ease-in-out",
              }}
            >
              {selectedTrackShopData && (
                <>
                  <h3 className="fw-bold text-center text-primary mb-3">
                    {selectedTrackShopData?.[0]?.userId?.name}
                  </h3>

                  <div className="d-flex justify-content-center gap-2 flex-wrap mb-3">
                    <a
                      href={`tel:${selectedTrackShopData?.[0]?.userId?.phone}`}
                      className="btn btn-outline-info btn-sm text-dark rounded-pill px-3"
                    >
                      <i className="fa-solid fa-phone-volume me-1"></i> Call Now
                    </a>

                    <a
                      href={`https://wa.me/${`+92${selectedTrackShopData?.[0]?.userId?.phone?.slice(
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

                    {selectedTrackShopData?.map((order, index) =>
                      order?.status === "inProgress" ||
                      order?.status === "assigned" ? (
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
                              <span className="fw-semibold">
                                {order?.orderId}
                              </span>
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
                      Rs. {totalCost}/-
                    </span>
                  </li>
                  <li className="list-group-item d-flex justify-content-between align-items-center">
                    <span>
                      <i className="fa-solid fa-person-biking me-2 text-secondary"></i>
                      Service Charges
                    </span>
                    <span
                      className="fw-bold text-success"
                      style={{ fontSize: "15px" }}
                    >
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
              <button
                className="w-100  mt-2 btn btn-outline-danger  rounded-pill"
                onClick={cancelOrder}
                disabled={cancelLoading}
              >
                {cancelLoading ? (
                  <>
                    Cancelling...
                    <div
                      className="spinner-border spinner-border-sm text-dark ms-2"
                      role="status"
                    ></div>
                  </>
                ) : (
                  <>
                    <i class="fa-solid fa-circle-xmark me-1"></i>
                    Cancel Order{" "}
                  </>
                )}
              </button>
            </div>
          )}
          </>
          )
        }
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
                    {selectedTrackShopData
                      ?.filter(
                        (order) =>
                          order?.status === "inProgress" ||
                          order?.status === "completed"
                      )
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
                          Rs. {totalCost}/-
                        </span>
                      </li>
                      <li className="list-group-item d-flex justify-content-between align-items-center">
                        <span>
                          <i className="fa-solid fa-person-biking me-2 text-secondary"></i>
                          Service Charges
                        </span>
                        <span
                          className="fw-bold text-success"
                          style={{ fontSize: "15px" }}
                        >
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

                  <div className="d-flex justify-content-end gap-3 mt-4">
                    <button
                      className="btn btn-outline-primary btn-sm text-center "
                      onClick={handleShare}
                      disabled={shareLoading}
                    >
                      {shareLoading ? (
                        <>
                          <div
                            className="spinner-border spinner-border-sm text-dark ms-2"
                            role="status"
                          ></div>
                        </>
                      ) : (
                        <i className="fa-solid fa-share-nodes me-2"></i>
                      )}
                    </button>
                    <button
                      className="btn btn-outline-success btn-sm"
                      onClick={() => window.print()}
                    >
                      <i className="fa-solid fa-download me-2"></i>
                    </button>
                    <button
                      className="btn btn-success btn-sm"
                      onClick={() => {
                        setOrderCompleteModal(false);
                        navigate("/worker/dashboard");
                      }}
                    >
                      <i className="fa-solid fa-plus me-2"></i> More Request
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

export default OrderWithJourney;
