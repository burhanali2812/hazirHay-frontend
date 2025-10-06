import React, { useEffect, useState } from "react";
import offline from "../images/offline.png";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import UserShopRoute from "../components/UserShopRoute";
import noData from "../images/noData.png";
import { FaWifi } from "react-icons/fa";
import { MdWifiOff } from "react-icons/md";
function ShopkepperRequests({ refreshFlag, setRefreshFlag }) {
  const user = JSON.parse(sessionStorage.getItem("user"));
  const [requests, setRequests] = useState([]);
  const [shopKepperCords, setShopKepperCords] = useState([]);
  const [acceptedOrders, setAcceptedOrders] = useState([]);
  const [selectedRequest, setSelectedRequest] = useState({});
  const [detailsModal, setDetailsModal] = useState(false);
  const [detailsModalLoading, setDetailsModalLoading] = useState(null);
  const [declinedModal, setDEclinedModal] = useState(false);
  const [loading, setLoading] = useState(false);
 const [statusLoading, setStatusLoading] = useState(false);
  const [shop, setShop] = useState(null);
  const [isOnline, setIsOnline] = useState(false);
  const [declineReason, setDeclineReason] = useState("");
  const navigate = useNavigate();
  const [totalPrice, setTotalPrice] = useState({
    actualPrice: 0,
    charges: 0,
  });
  const [routeInfo, setRouteInfo] = useState(null);
  const [declineOrder, setDeclineOrder] = useState(null);
  const token = localStorage.getItem("token");

  const declineList = [
    "Not available at requested time",
    "Service area not covered",
    "Insufficient details about the job",
    "Emergency call — cannot handle at the moment",
    "Customer unreachable / wrong contact number",
    "Required parts or tools not available",
    "Unsafe working conditions",
    "Incorrect or incomplete address",
  ];

  const handleDeclineRequest = (order) => {
    setDeclineOrder(order);
    setDEclinedModal(true);
  };

  useEffect(() => {
    function getShopkeeperLocation() {
      if (!navigator.geolocation) {
        alert("Geolocation is not supported by your browser");
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          console.log("lat", lat);
          console.log("lng", lng);
          setShopKepperCords([lng, lat]);
        },
        (error) => {
          if (error.code === error.PERMISSION_DENIED) {
            alert("Please turn on location and allow access to continue");
          } else if (error.code === error.POSITION_UNAVAILABLE) {
            alert("Location information is unavailable. Please try again");
          } else if (error.code === error.TIMEOUT) {
            alert("Location request timed out. Please try again");
          } else {
            alert("Unable to retrieve your location");
          }
        }
      );
    }
    getShopkeeperLocation();
  }, []);

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

  const fetchRequests = async (type) => {
    if (type === "auto") {
      setStatusLoading(true);
    }
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
        setStatusLoading(false);

        if (refreshFlag) {
          alert("New Request Added");
        }
      } else {
        console.warn("No requests found:", response.data.message);
        setRequests([]);
        setStatusLoading(false);
      }
    } catch (error) {
      console.error(
        "Error fetching requests:",
        error.response?.data?.message || error.message
      );
      setStatusLoading(false);
      setRequests([]);
    }
  };
  const getShopkepperStatus = async () => {
    setStatusLoading(true);
    try {
      const response = await axios.get(
        `https://hazir-hay-backend.vercel.app/shopKeppers/getShopKepperStatus/${user._id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
          params: { t: Date.now() }, // prevents caching
        }
      );

      if (response.status === 200) {
        setStatusLoading(false);
        console.log("Current Status:", response.data.data);
        setIsOnline(response.data.data);
      }
    } catch (error) {
      setStatusLoading(false);
      console.error("Error fetching status:", error);
      alert(error.response?.data?.message || "Failed to fetch status!");
    }
  };

  useEffect(() => {
    getShopData();
    fetchRequests("auto");
    getShopkepperStatus();
  }, []);

  useEffect(() => {
    if (refreshFlag) {
      fetchRequests("auto");
      setRefreshFlag(false);
    }
  }, [refreshFlag]);

  useEffect(() => {
    if (selectedRequest) {
      const totalAcceptedCost =
        selectedRequest?.orders?.reduce(
          (sum, order) =>
            order.status === "accepted" ? sum + Number(order.cost) : sum,
          0
        ) || 0;

      setTotalPrice((prev) => ({
        ...prev,
        actualPrice: totalAcceptedCost,
      }));

      const acceptedOrders = selectedRequest?.orders?.filter(
        (order) => order.status === "accepted"
      );
      setAcceptedOrders(acceptedOrders);
    }
  }, [selectedRequest]);

  const sendNotificationToUser = async (order, type) => {
    const finalType = type === "accept" ? "success" : "fail";
    let finalMessage;
    if (type === "accept") {
      finalMessage = `Your order (${order?.orderId}) ${order?.subCategory} - ${order?.category} has been accepted under checkoutID `;
    } else {
      finalMessage = `Your order (${order?.orderId}) ${order?.subCategory} - ${order?.category} has been rejected due to "${declineReason}" under checkoutID`;
    }

    const payload = {
      type: finalType,
      message: finalMessage,
      checkoutId: order?.checkoutId,
      userId: order.userId,
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

  const updateRequest = async (orderId, type) => {
    console.log(orderId, type);

    try {
      const response = await axios.put(
        `https://hazir-hay-backend.vercel.app/requests/updateRequest/${orderId}`,
        { type },
        {
          headers: { Authorization: `Bearer ${token}` },
          params: { t: Date.now() },
        }
      );
      if (response.data.success) {
        fetchRequests("none");
        const finalType = type === "accept" ? "accepted" : "rejected";
        setSelectedRequest((prev) => ({
          ...prev,
          orders: prev.orders.map((o) =>
            o._id === orderId ? { ...o, status: finalType } : o
          ),
        }));
        const order = selectedRequest?.orders.find(
          (order) => order._id === orderId
        );
        if (type === "accept" && order) {
          sendNotificationToUser(order, "accept");
          setTotalPrice((prev) => ({
            ...prev,
            actualPrice: prev.actualPrice + Number(order.cost),
          }));
        }
        if (type !== "accept" && order) {
          sendNotificationToUser(declineOrder, "reject");
          setTotalPrice((prev) => ({
            ...prev,
            actualPrice: prev.actualPrice - Number(order.cost),
          }));
        }
        alert(`Order ${type === "accept" ? "Accepted" : "Rejected"}`);
      }
    } catch (error) {
      console.error(
        "Error fetching requests:",
        error.response?.data?.message || error.message
      );
    }
  };

  const groupedData = requests?.reduce((acc, order) => {
    const { checkoutId } = order;

    if (!acc[checkoutId]) {
      acc[checkoutId] = {
        checkoutId,
        orders: [],
        totalCost: 0,
      };
    }

    acc[checkoutId].orders.push(order);

    acc[checkoutId].totalCost += order.cost;

    return acc;
  }, {});

  const result = Object.values(groupedData);
  const acceptedOrderRequest = result?.find((req) =>
    req?.orders?.some((order) => order.status === "accepted")
  );
  const startJourneyOrders = acceptedOrderRequest?.orders?.filter(
    (order) => order.status === "accepted"
  );

  console.log(result);

  const [userCoords, setUserCoords] = useState(null);
  const [fixDistance, seFixDistance] = useState(null);
  const [fixRate, setFixRate] = useState(null);
  // const [fixCharges, setFixCharges] = useState(null);

  const handleViewDetails = (request) => {
    seFixDistance(Number(request.orders[0].serviceCharges?.distance || 0));
    setFixRate(Number(request.orders[0].serviceCharges?.rate || 0));
    console.log("request", request);
    setSelectedRequest(request);
    setDetailsModalLoading(request.checkoutId);

    const coords = request?.orders[0]?.location?.[0]?.coordinates;
    if (coords && coords.length === 2) {
      setUserCoords([coords[1], coords[0]]); // [lat, lng] → convert to [lng, lat]
    } else {
      setUserCoords([73.04732533048735, 33.69832701012015]);
    }

    console.log("userCoords set:", coords);
    console.log("shopKepper", shopKepperCords);

    setTimeout(() => {
      setDetailsModal(true);
      setDetailsModalLoading(null);
    }, 2000);
  };

  const fixCharges = (fixRate * fixDistance).toFixed(2);
  const finalRequests = acceptedOrderRequest ? [acceptedOrderRequest] : result;
  console.log("accpted", acceptedOrderRequest);

  const toggleStatus = async (e) => {
    setStatusLoading(true);
    try {
      const newStatus = !isOnline;

      const payLoad = {
        isLive: newStatus,
      };

      const response = await axios.put(
        "https://hazir-hay-backend.vercel.app/shopKeppers/update-live",
        payLoad,
        {
          headers: { Authorization: `Bearer ${token}` },
          params: { t: Date.now() },
        }
      );

      if (response.status === 200) {
        setStatusLoading(false);
        alert(response.data.message || "Status updated successfully!");

        setIsOnline(newStatus); // update UI state
      } else {
        alert("Failed to update status!");
      }
    } catch (error) {
      console.error("Error updating status:", error);
      alert(error.response?.data?.message || "Something went wrong!");
    } finally {
      setStatusLoading(false);
    }
  };

  const grandTotalWithCharges = (Number(totalPrice?.actualPrice) + Number(fixCharges)).toFixed(0);

    const ProgressOrder = async () => {
      console.log("startJourneyOrders", startJourneyOrders);
      
    setLoading(true);
    const requests =
      startJourneyOrders?.orders?.map((order) => ({ _id: order._id })) || [];

    if (requests.length === 0) {
      setLoading(false);
      return alert("No orders to progress");
    }

    try {
      const res = await axios.put(
        "https://hazir-hay-backend.vercel.app/requests/progressRequest",
        { requests },
        {
          headers: { Authorization: `Bearer ${token}` },
          params: { t: Date.now() }, // avoid caching
        }
      );

      if (res.data.success) {
        setLoading(false);
        alert(res.data.message);
         navigate("/admin/user/orderWithJourney", {
                                      state: acceptedOrderRequest,
                                    })
      }
    } catch (error) {
      setLoading(false);
      console.error("Error completing orders:", error);
    }
  };

  return (
    <>
      <div class="d-flex justify-content-between align-items-center bg-light mb-4 w-100 p-3">
        <h5 class="mb-0 fw-semibold text-secondary">Requests</h5>

        <button
          className={`btn d-flex align-items-center shadow-sm  overflow-hidden p-0`}
          onClick={toggleStatus}
        >
          <span
            className={`bg-${
              isOnline ? "success" : "danger"
            } text-white d-flex align-items-center justify-content-center px-1 py-1`}
          >
            {isOnline ? <FaWifi size={18} /> : <MdWifiOff size={18} />}
          </span>
          <span
            className={`text-${
              isOnline ? "success" : "danger"
            } fw-semibold px-3`}
          >
            {isOnline ? "Online" : "Offline"}
          </span>
        </button>
      </div>

      {statusLoading ? (
        <div
          className="position-fixed top-0 start-0 w-100 h-100 d-flex justify-content-center align-items-center bg-dark bg-opacity-75"
          style={{ zIndex: 1055 }}
        >
          <button className="btn btn-dark" type="button" disabled>
            <span
              className="spinner-border spinner-border-sm me-2"
              role="status"
              aria-hidden="true"
            ></span>
            Updating...
          </button>
        </div>
      ) : (
        <div className="container">
          {isOnline ? (
            <>
              {finalRequests?.length !== 0 ? (
                <div className="row g-4">
                  {finalRequests?.map((checkoutGroup, index) => {
                    const totalDistance =
                      checkoutGroup.orders[0]?.serviceCharges?.distance || 0;
                    const rate =
                      checkoutGroup.orders[0]?.serviceCharges?.rate || 0;
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
                                style={{
                                  width: "55px",
                                  height: "55px",
                                  overflow: "hidden",
                                }}
                              >
                                <img
                                  src={
                                    checkoutGroup?.orders[0].userId
                                      ?.profilePicture
                                  }
                                  alt={checkoutGroup?.orders[0].userId?.name}
                                  className="img-fluid rounded-circle"
                                />
                              </div>
                              <div className="ms-3">
                                <h6 className="mb-1">
                                  {checkoutGroup?.orders[0].userId?.name}
                                </h6>
                                <small className="text-muted">
                                  {checkoutGroup?.orders[0].userId?.phone}
                                </small>
                              </div>
                            </div>

                            <p className="mb-1">
                              <strong>Total Orders:</strong>{" "}
                              {checkoutGroup.orders.length}
                            </p>
                            <p className="mb-3">
                              <strong>Total Distance:</strong>{" "}
                              {totalDistance.toFixed(2)} km away
                            </p>

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
                                <strong>Service Charges:</strong> {rate} ×{" "}
                                {totalDistance.toFixed(2)} km ={" "}
                                <span className="fw-bold">
                                  {serviceCharges.toFixed(0)}/-
                                </span>
                              </p>
                              <div className="d-flex justify-content-between">
                                <h6 className="fw-bold  text-primary mt-1">
                                  Grand Total: {grandTotal.toFixed(0)}/-
                                </h6>
                                <button
                                  className="btn btn-success btn-sm rounded-pill"
                                  onClick={() =>
                                    handleViewDetails(checkoutGroup)
                                  }
                                  disabled={
                                    detailsModalLoading ===
                                    checkoutGroup.checkoutId
                                  }
                                >
                                  {detailsModalLoading ===
                                  checkoutGroup.checkoutId ? (
                                    <>
                                      <span className="spinner-border spinner-border-sm me-2"></span>
                                      Loading...
                                    </>
                                  ) : (
                                    <>
                                      View Details
                                      <i className="fa-solid fa-angles-right ms-1"></i>
                                    </>
                                  )}
                                </button>
                              </div>
                              {acceptedOrderRequest && (
                                <button
                                disabled={loading}
                                  className="w-100 btn mt-2 btn-primary btn-sm rounded-pill"
                                  onClick={ProgressOrder
                                   
                                  }
                                >
                                  <i class="fa-solid fa-flag-checkered me-1"></i>
                                  Start Journey ({startJourneyOrders?.length}{" "}
                                  orders accepted)
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  {acceptedOrderRequest && (
                    <div className="container mt-3">
                      <div
                        style={{
                          backgroundColor: "#fff3cd",
                          color: "#856404",
                          padding: "10px 15px",
                          borderRadius: "8px",
                          fontSize: "14px",
                          border: "1px solid #ffeeba",
                        }}
                      >
                        <strong>Note:</strong> You must complete the current
                        checkout orders before you can view other requests.
                      </div>
                    </div>
                  )}
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
                  <h4 className="fw-bold text-warning mb-2">
                    No Requests Found
                  </h4>
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

          {detailsModal && (
            <div
              className="modal fade show d-block"
              tabIndex="-1"
              style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
            >
              <div className="modal-dialog modal-fullscreen modal-dialog-centered">
                <div className="modal-content border-0 shadow-lg rounded-4">
                  <div className="modal-header border-0 bg-light">
                    <div className="d-flex align-items-center">
                      <i
                        className="fa-solid fa-circle-chevron-left text-secondary"
                        style={{ fontSize: "22px", cursor: "pointer" }}
                        onClick={() => setDetailsModal(false)}
                      ></i>
                      <h5 className="ms-2 fw-bold text-dark mb-0">
                        Order Details
                      </h5>
                    </div>
                  </div>

                  <div className="modal-body bg-white">
                    <div
                      style={{
                        height: "380px",
                        width: "100%",
                        borderRadius: "5px",
                        overflow: "auto",
                      }}
                      className="shadow-sm"
                    >
                      <UserShopRoute
                        userCoords={userCoords}
                        shopCoords={shopKepperCords ? shopKepperCords : []}
                        onRouteInfo={(info) => setRouteInfo(info)}
                        type={"live"}
                      />
                    </div>

                    <div
                      className="card border-0 shadow-sm mt-3"
                      style={{
                        borderRadius: "20px",
                        padding: "20px",
                        backgroundColor: "#f9fbfd",
                      }}
                    >
                      {selectedRequest && (
                        <>
                          <h3 className="fw-bold text-center text-primary mb-3">
                            {selectedRequest?.orders[0]?.userId?.name}
                          </h3>

                          <div className="d-flex justify-content-center gap-2 flex-wrap mb-3">
                            <a
                              href={`tel:${selectedRequest?.orders[0]?.userId?.phone}`}
                              className="btn btn-outline-info btn-sm text-dark rounded-pill px-3"
                            >
                              <i className="fa-solid fa-phone-volume me-1"></i>{" "}
                              Call Now
                            </a>

                            <a
                              href={`https://wa.me/${`+92${selectedRequest?.orders[0]?.userId?.phone?.slice(
                                1
                              )}`}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="btn btn-outline-success btn-sm rounded-pill px-3"
                            >
                              <i className="fa-brands fa-whatsapp me-1"></i>{" "}
                              WhatsApp
                            </a>

                            <button className="btn btn-outline-primary btn-sm rounded-pill px-3">
                              <i className="fa-solid fa-comments me-1"></i> Live
                              Chat
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

                          <div className="mt-3">
                            <h5 className="text-center fw-bold text-primary mb-3">
                              <i className="fa-solid fa-receipt me-2"></i> Order
                              Details
                            </h5>

                            {/* Checkout ID */}
                            <ul className="list-group list-group-flush mb-3 shadow-sm rounded">
                              <li className="list-group-item d-flex justify-content-between align-items-center">
                                <span className="fw-semibold">
                                  <i className="fa-solid fa-barcode me-2 text-secondary"></i>
                                  Checkout ID
                                </span>
                                <span className="text-success fw-bold text-break">
                                  {selectedRequest?.checkoutId}
                                </span>
                              </li>
                            </ul>

                            {/* Orders */}
                            {selectedRequest?.orders?.length > 0 ? (
                              selectedRequest.orders.map((order, index) => (
                                <div
                                  key={index}
                                  className="card shadow-sm border-0 mb-3"
                                >
                                  <div className="card-body">
                                    {/* Order Header */}
                                    <div className="d-flex justify-content-between align-items-center mb-2 flex-wrap">
                                      <h6 className="mb-0 fw-bold text-dark">
                                        <i className="fa-solid fa-box me-2 text-primary"></i>
                                        Order #{order.orderId}
                                      </h6>
                                      <span
                                        className="badge bg-primary text-light mt-1 border "
                                        style={{
                                          maxWidth: "200px",
                                          whiteSpace: "normal",
                                          wordBreak: "break-word",
                                        }}
                                      >
                                        {order.subCategory}
                                      </span>
                                    </div>

                                    {/* Order Cost */}
                                    <div className="d-flex justify-content-between align-items-center mb-3">
                                      <span className="text-muted small">
                                        Total Cost
                                      </span>
                                      <span className="fw-bold text-success">
                                        Rs. {order.cost}/-
                                      </span>
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="d-flex justify-content-between flex-wrap gap-2">
                                      <button
                                        className={`btn ${
                                          order.status === "accepted"
                                            ? "btn-secondary"
                                            : "btn-outline-success"
                                        } btn-sm rounded-pill px-3`}
                                        onClick={() =>
                                          updateRequest(order._id, "accept")
                                        }
                                        disabled={order.status === "accepted"}
                                      >
                                        {order.status === "accepted" ? (
                                          <>
                                            <i className="fa-solid fa-check me-1"></i>{" "}
                                            Accepted
                                          </>
                                        ) : (
                                          <>
                                            <i className="fa-solid fa-check me-1"></i>{" "}
                                            Accept
                                          </>
                                        )}
                                      </button>
                                      <button
                                        className={`btn ${
                                          order.status === "rejected"
                                            ? "btn-secondary"
                                            : "btn-outline-danger"
                                        } btn-sm rounded-pill px-3`}
                                        onClick={() =>
                                          // updateRequest(order._id, "decline")
                                          handleDeclineRequest(order)
                                        }
                                        disabled={order.status === "rejected"}
                                      >
                                        {order.status === "rejected" ? (
                                          <>
                                            <i className="fa-solid fa-xmark me-1"></i>{" "}
                                            Rejected
                                          </>
                                        ) : (
                                          <>
                                            <i className="fa-solid fa-xmark me-1"></i>{" "}
                                            Decline
                                          </>
                                        )}
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              ))
                            ) : (
                              <p className="text-center text-muted">
                                No pending orders found
                              </p>
                            )}
                            <div className="card shadow-sm border-0 mt-3">
                              {/* Title */}
                              <h5 className="text-center fw-bold text-primary mt-3 mb-3">
                                <i className="fa-solid fa-file-invoice-dollar me-2"></i>{" "}
                                Billing Details
                              </h5>

                              {/* Billing Info */}
                              <ul className="list-group list-group-flush mb-3">
                                <li className="list-group-item d-flex justify-content-between align-items-center">
                                  <span>
                                    <i className="fa-solid fa-road me-2 text-secondary"></i>{" "}
                                    Total Distance
                                  </span>
                                  <span className="fw-semibold">
                                    {fixDistance} km
                                  </span>
                                </li>

                                <li className="list-group-item d-flex justify-content-between align-items-center">
                                  <span>
                                    <i className="fa-solid fa-route me-2 text-secondary"></i>{" "}
                                    Live Distance
                                  </span>
                                  <span className="fw-semibold">
                                    {routeInfo?.distance} km
                                  </span>
                                </li>

                                <li className="list-group-item d-flex justify-content-between align-items-center">
                                  <span>
                                    <i className="fa-solid fa-coins me-2 text-secondary"></i>{" "}
                                    Service Charges
                                  </span>
                                  <span className="fw-semibold">
                                    {fixCharges}/-
                                  </span>
                                </li>

                                <li className="list-group-item d-flex justify-content-between align-items-center">
                                  <span>
                                    <i className="fa-solid fa-gift me-2 text-success"></i>{" "}
                                    Bonus
                                  </span>
                                  <span className="fw-semibold text-success">
                                    {(
                                      fixCharges -
                                      fixRate * routeInfo?.distance
                                    ).toFixed(1)}
                                    /-
                                  </span>
                                </li>
                              </ul>

                              {/* Total */}
                              <div className="card-footer bg-light text-center py-3">
                                <h5 className="fw-bold text-dark mb-0">
                                  Total Price{" "}
                                  <span
                                    className="text-muted small"
                                    style={{ fontSize: "11px" }}
                                  >
                                    (Incl. service charges)
                                  </span>
                                  <span className="text-success ms-2">
                                    {grandTotalWithCharges}
                                    /-
                                  </span>
                                </h5>

                                <button
                                  className="btn btn-success btn-sm rounded-pill w-100 mt-3"
                                  disabled={acceptedOrders.length === 0 || loading}
                                  onClick={ProgressOrder
                                  }
                                >
                                  <i class="fa-solid fa-flag-checkered me-1"></i>
                                  Start Journey ({acceptedOrders.length} Orders)
                                </button>
                              </div>
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
          {declinedModal && (
            <div
              className="modal fade show d-block"
              tabIndex="-1"
              style={{
                backgroundColor: "rgba(0,0,0,0.5)",
                zIndex: 1056, // above other modal
              }}
            >
              <div className="modal-dialog">
                <div className="modal-content border-0 shadow-lg rounded-4">
                  {/* Header */}
                  <div className="modal-header border-0 bg-light">
                    <h5 className="fw-bold text-dark mb-0">Decline Reason</h5>
                    <button
                      type="button"
                      className="btn-close"
                      aria-label="Close"
                      onClick={() => setDEclinedModal(false)}
                    ></button>
                  </div>

                  {/* Body */}
                  <div className="modal-body bg-white">
                    <p className=" mb-2">
                      Choose Reason why you reject this order{" "}
                      <span className="fw-bold text-danger">
                        {declineOrder?.orderId}
                      </span>{" "}
                      {declineOrder?.subCategory} - {declineOrder.category} ?
                    </p>
                    <select
                      className="form-select mb-3"
                      value={declineReason}
                      onChange={(e) => setDeclineReason(e.target.value)}
                    >
                      <option value="">Select a reason</option>
                      {declineList.map((reason, index) => (
                        <option key={index} value={reason}>
                          {reason}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="modal-footer border-0 bg-light">
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={() => setDEclinedModal(false)}
                    >
                      Close
                    </button>
                    <button
                      type="button"
                      className="btn btn-danger"
                      onClick={() => {
                        updateRequest(declineOrder._id, "decline");
                        setDEclinedModal(false);
                      }}
                    >
                      Submit
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </>
  );
}

export default ShopkepperRequests;
