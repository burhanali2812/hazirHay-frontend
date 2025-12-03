import React, { useEffect, useState } from "react";
import offline from "../images/offline.png";
import { Link, useNavigate } from "react-router-dom";
import {toast, Toaster} from "react-hot-toast"
import Swal from "sweetalert2";
import axios from "axios";
import { Suspense, lazy } from "react";
import noData from "../images/noData.png";
import { FaWifi } from "react-icons/fa";
import { MdWifiOff } from "react-icons/md";
import { useCheckBlockedStatus } from "../components/useCheckBlockedStatus";
import { useAppContext } from "../context/AppContext";
import { set } from "mongoose";

const UserShopRoute = lazy(() => import("../components/UserShopRoute"));
function ShopkepperRequests() {
  const {shopKepperWorkers, setKey, setShopKepperOrdersLength} = useAppContext();
  const user = JSON.parse(localStorage.getItem("user"));
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
  const [requestDeleteLoading, setRequestDeleteLoading] = useState(false);
  const [declineReason, setDeclineReason] = useState("");
  const [selectedWorkers, setSelectedWorkers] = useState({});

  const navigate = useNavigate();
  const [totalPrice, setTotalPrice] = useState({
    actualPrice: 0,
    charges: 0,
  });
  const [routeInfo, setRouteInfo] = useState(null);
  const [declineOrder, setDeclineOrder] = useState(null);
  const token = localStorage.getItem("token");
   
  useCheckBlockedStatus(token);
  const role = localStorage.getItem("role");
   useEffect(()=>{
    if(!user.isShop){
      return;
    }
    else if(!user?.isVerified){
       navigate("/shopKepper/sh&un&Ve&ri&fi&ed@sh@op$");
    }
   })
  useEffect(() => {
    if (role !== "shopKepper") {
      navigate("/unauthorized/user", { replace: true });
    }
  }, [role]); 

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

  useEffect(() => {
    setKey("requests");
  }, []);

  const handleDeclineRequest = (order) => {
    setDeclineOrder(order);
    setDEclinedModal(true);
  };
  const handleSelectWorker = (orderId, worker) => {
    setSelectedWorkers((prev) => ({
      ...prev,
      [orderId]: worker, // store worker for this specific order
    }));
    console.log("selectedWorkers", selectedWorkers);
  };

  useEffect(() => {
    function getShopkeeperLocation() {
      if (!navigator.geolocation) {
        toast.error("Geolocation is not supported by your browser");
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
            toast.error("Please turn on location and allow access to continue");
          } else if (error.code === error.POSITION_UNAVAILABLE) {
            toast.error("Location information is unavailable. Please try again");
          } else if (error.code === error.TIMEOUT) {
            toast.error("Location request timed out. Please try again");
          } else {
            toast.error("Unable to retrieve your location");
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
        const req = response.data.data || [];
        const pendingRequests = req.filter((r) => r.status === "pending");
        const unassign = req.filter((o) => o.orderAssignment.status === "unAssigned")
        setShopKepperOrdersLength(pendingRequests?.length === 0 ? unassign?.length : pendingRequests?.length);
        setRequests(req);
        console.log("request fetch", req);
        setStatusLoading(false);

   
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
      setShopKepperOrdersLength(0);
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
        const st = response.data.data
        setStatusLoading(false);
        console.log("Current Status:", st);
        setIsOnline(st);
      }
    } catch (error) {
      setStatusLoading(false);
      console.error("Error fetching status:", error);
      toast.error(error.response?.data?.message || "Failed to fetch status!");
    }
  };

  useEffect(() => {
    getShopData();
    fetchRequests("auto");
    getShopkepperStatus();
  }, []);

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
    const finalType =
      type === "accept"
        ? "accept"
        : type === "inProgress"
        ? "inProgress"
        : "fail";
    let finalMessage;

    if (type === "accept") {
      finalMessage = `Your order (${order?.orderId}) ${order?.subCategory} - ${order?.category} has been accepted under checkoutID `;
    } else if (type === "inProgress") {
      finalMessage = `Your order (${order?.orderId}) ${order?.subCategory} - ${order?.category} is now in progress. The shopkeeper has started the journey and is on the way to deliver your order under checkoutID `;
    } else {
      finalMessage = `Your order (${order?.orderId}) ${order?.subCategory} - ${order?.category} has been rejected due to "${declineReason}" under checkoutID `;
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
          setSelectedWorkers((prev) => {
            const updated = { ...prev };
            delete updated[orderId];
            return updated;
          });
          sendNotificationToUser(declineOrder, "reject");
          setTotalPrice((prev) => ({
            ...prev,
            actualPrice: prev.actualPrice - Number(order.cost),
          }));
        }
        toast.success(`Order ${type === "accept" ? "Accepted" : "Rejected"}`);
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

  const acceptedOrdersForJourney = {
    checkoutId: acceptedOrderRequest?.checkoutId,
    orders: startJourneyOrders,
    totalCost: startJourneyOrders?.reduce(
      (sum, order) => sum + (order.cost || 0),
      0
    ),
  };
  const rejectedOrders = result?.find((req) =>
    req?.orders?.some((order) => order.status === "rejected")
  );
  const finalRejectedOrdersFordelete = rejectedOrders?.orders?.filter(
    (order) => order.status === "rejected"
  );

  console.log("acceptedorders...", acceptedOrderRequest);
  console.log("start jpurney......", acceptedOrdersForJourney);
  console.log(
    "finalRejectedOrdersFordelete.........",
    finalRejectedOrdersFordelete
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
        toast.success(response.data.message || "Status updated successfully!");

        setIsOnline(newStatus); // update UI state
      } else {
        toast.error("Failed to update status!");
      }
    } catch (error) {
      console.error("Error updating status:", error);
      toast.error(error.response?.data?.message || "Something went wrong!");
    } finally {
      setStatusLoading(false);
    }
  };

  const handleDeleteRejectedOrders = async (type) => {
    if (!finalRejectedOrdersFordelete?.length) {
      toast.error("No orders to delete");
      return;
    }
    if (type === "yes") {
      const result = await Swal.fire({
        title: "Delete All Rejected Orders?",
        text: "You won't be able to undo this action.",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#d33",
        cancelButtonColor: "#6c757d",
        confirmButtonText: "Yes, Delete all!",
        background: "#f9f9f9",
        customClass: {
          popup: "swirl-popup",
        },
      });
      if (!result.isConfirmed) {
        return;
      }
    }

    setRequestDeleteLoading(true);
    try {
      const res = await axios.put(
        `https://hazir-hay-backend.vercel.app/requests/markDeleteRequestByShopkeeper/${user._id}`,
        { requests: finalRejectedOrdersFordelete, type: "delete" },
        {
          headers: { Authorization: `Bearer ${token}` },
          params: { t: Date.now() }, // avoid caching
        }
      );

      if (res.data.success) {
        setRequestDeleteLoading(false);
        fetchRequests("auto");
        if (type === "yes") {
          Swal.fire({
            title: "Deleted!",
            text: "All rejected orders have been deleted permanently.",
            icon: "success",
            timer: 900,
            showConfirmButton: false,
            background: "#f9f9f9",
            customClass: {
              popup: "swirl-popup",
            },
          });
        }
      }
    } catch (error) {
      setRequestDeleteLoading(false);
      console.error("Error deleting orders:", error);
      toast.error("Something went wrong while deleting orders.");
    }
  };

  const grandTotalWithOutCharges = Number(totalPrice?.actualPrice).toFixed(0);





  const markOrderDeleteById = async (order) => {
    setSelectedRequest((prev) => ({
      ...prev,
      orders: prev.orders?.filter((ord) => ord._id !== order._id),
    }));
    try {
      const res = await axios.put(
        `https://hazir-hay-backend.vercel.app/requests/markDelete/${order._id}`,
        {}, // no body needed
        {
          headers: { Authorization: `Bearer ${token}` },
          params: { t: Date.now() },
        }
      );

      if (res.data.success) {
        toast.success(res.data.message);
        fetchRequests("none");
      }
    } catch (error) {
      console.error("Error deleting orders:", error);
      toast.error("Something went wrong while deleting order.");
    }
  };

  const handleAssignOrders = async () => {
    const confirm = window.confirm("Do you confirm to assign orders?");
    if (!confirm) return;
    Object.entries(selectedWorkers)?.map(([orderId, worker]) => {
      console.log("orderId:", orderId);
      console.log("workerId:", worker._id);
    });

    try {
      const response = await axios.put(
        "https://hazir-hay-backend.vercel.app/requests/assignMultiple",
        { selectedWorkers },
        {
          headers: { Authorization: `Bearer ${token}` },
          params: { t: Date.now() }, // prevents caching
        }
      );

      if (response.data.success) {
        toast.success(response.data.message);
        setSelectedWorkers({});
        setDetailsModal(false);
        fetchRequests("auto");
      }
    } catch (error) {
      console.error("Assignment failed:", error);
      toast.error("Failed to assign orders. Please try again.");
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
        <div className="container " style={{ marginBottom: "65px" }}>
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
                    const rejectedOrders = checkoutGroup?.orders?.filter(
                      (order) => order.status === "rejected"
                    );

                    return (
                      <div className="col-lg-4 col-md-6" key={index}>
                        <div className="card border-0 shadow h-100 rounded-3 bg-light">
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
                              {rejectedOrders?.length ===
                                checkoutGroup?.orders?.length && (
                                <div className="card border-0 shadow-sm mt-4 rounded-4 overflow-hidden">
                                  <div className="card-body bg-light position-relative">
                                    <div className="d-flex align-items-center mb-3">
                                      <div>
                                        <h5 className="card-title mb-0 fw-bold text-danger">
                                          All Orders Rejected
                                        </h5>
                                        <small className="text-muted">
                                          You’ve rejected all the orders in this
                                          request. Would you like to
                                          <span className="fw-semibold text-dark">
                                            {" "}
                                            permanently delete this request
                                          </span>
                                          so it no longer appears in your list?
                                        </small>
                                      </div>
                                    </div>

                                    <div className="d-flex justify-content-end">
                                      <button
                                        type="button"
                                        className="btn btn-danger btn-sm px-4 py-2 d-flex align-items-center gap-2 fw-semibold shadow-sm rounded-pill"
                                        onClick={() =>
                                          handleDeleteRejectedOrders("yes")
                                        }
                                        disabled={requestDeleteLoading}
                                      >
                                        {requestDeleteLoading ? (
                                          <>
                                            Deleting...
                                            <div
                                              className="spinner-border spinner-border-sm text-light ms-2"
                                              role="status"
                                            ></div>
                                          </>
                                        ) : (
                                          <>
                                            <i className="fas fa-trash-alt"></i>
                                            Delete Request
                                          </>
                                        )}
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              )}

                              {acceptedOrderRequest && (
                                <button
                                  disabled={
                                    Object.keys(selectedWorkers)?.length === 0
                                  }
                                  className="w-100 btn mt-2 btn-primary btn-sm rounded-pill"
                                  onClick={handleAssignOrders}
                                >
                                  <i className="fa-solid fa-share-from-square me-1"></i>
                                  Assign ({Object.keys(selectedWorkers)?.length}{" "}
                                  {acceptedOrders?.length === 1
                                    ? "Order"
                                    : "Orders"}
                                  )
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
                        height: "450px",
                        width: "100%",
                        borderRadius: "5px",
                        overflow: "auto",
                      }}
                      className="shadow-sm"
                    >
                    <Suspense fallback={         <div
          className="position-fixed top-0 start-0 w-100 h-100 d-flex justify-content-center align-items-center bg-dark bg-opacity-75"
          style={{ zIndex: 1055 }}
        >
          <button className="btn btn-dark" type="button" disabled>
            <span
              className="spinner-border spinner-border-sm me-2"
              role="status"
              aria-hidden="true"
            ></span>
            Loading...
          </button>
        </div>}>
                        <UserShopRoute
                        userCoords={userCoords}
                        shopCoords={shopKepperCords ? shopKepperCords : []}
                        onRouteInfo={(info) => setRouteInfo(info)}
                        type={"live"}
                      />
                    </Suspense>
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
                                  className="card shadow-lg border-0 mb-4"
                                >
                                  <div className="card-body">
                                    {/* Order Header */}
                                    <div className="d-flex justify-content-between align-items-center mb-2 flex-wrap">
                                      <h6 className="mb-0 fw-bold text-dark">
                                        <i className="fa-solid fa-box me-2 text-primary"></i>
                                        Order #{order.orderId}
                                      </h6>
                                      {order.status === "rejected" && (
                                        <i
                                          class="fa-solid fa-trash text-danger"
                                          onClick={() =>
                                            markOrderDeleteById(order)
                                          }
                                        ></i>
                                      )}
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
                                    {order.status === "accepted" && (
                                      <div className="dropdown mt-2">
                                        {/* Dropdown Button */}
                                        <button
                                          className="btn btn-primary w-100 fw-semibold shadow-sm d-flex justify-content-between align-items-center btn-sm rounded-pill"
                                          type="button"
                                          id={`dropdownMenuButton-${index}`}
                                          data-bs-toggle="dropdown"
                                          aria-expanded="false"
                                        >
                                          <span>
                                            <i className="fa-solid fa-user-check me-2"></i>
                                            Assign to{" "}
                                            {selectedWorkers[order._id]
                                              ? `: ${
                                                  selectedWorkers[order._id]
                                                    .name
                                                }`
                                              : ""}
                                          </span>
                                          <i className="fa-solid fa-caret-down"></i>
                                        </button>

                                        {/* Dropdown Menu */}
                                        <ul
                                          className="dropdown-menu w-100 shadow-sm  mt-1 rounded-2"
                                          aria-labelledby={`dropdownMenuButton-${index}`}
                                          style={{
                                            maxHeight: "200px",
                                            overflowY: "auto",
                                            overflowX: "hidden",
                                          }}
                                        >
                                          {shopKepperWorkers &&
                                          shopKepperWorkers?.length > 0 ? (
                                            shopKepperWorkers.map(
                                              (worker, ind) => (
                                                <li key={ind}>
                                                  <button
                                                    className="dropdown-item d-flex align-items-center py-2"
                                                    style={{
                                                      transition:
                                                        "all 0.9s ease-in-out",
                                                    }}
                                                    onClick={() =>
                                                      handleSelectWorker(
                                                        order._id,
                                                        worker
                                                      )
                                                    }
                                                  >
                                                    <img
                                                      src={
                                                        worker?.profilePicture ||
                                                        "/default-profile.png"
                                                      }
                                                      alt="pf"
                                                      className="me-3"
                                                      style={{
                                                        width: "42px",
                                                        height: "42px",
                                                        borderRadius: "50%",
                                                        objectFit: "cover",
                                                        border:
                                                          "1px solid #e0e0e0",
                                                      }}
                                                    />

                                                    {/* Name + Badge Column */}
                                                    <div className="d-flex flex-column align-items-start">
                                                      <span className="fw-semibold text-dark">
                                                        {worker?.name}
                                                      </span>
                                                      <span
                                                        className={`badge mt-1 bg-${
                                                          worker.isBusy
                                                            ? "warning"
                                                            : "primary"
                                                        } text-white`}
                                                        style={{
                                                          fontSize: "0.7rem",
                                                          borderRadius: "8px",
                                                          padding: "3px 8px",
                                                        }}
                                                      >
                                                        {worker?.isBusy
                                                          ? "Busy"
                                                          : "Availble"}
                                                      </span>
                                                    </div>
                                                  </button>
                                                </li>
                                              )
                                            )
                                          ) : (
                                            <li>
                                              <div className="dropdown-item text-muted text-center py-3 small">
                                                <i className="fa-regular fa-face-frown me-1"></i>
                                                No workers available
                                                <div className="mt-1">
                                                  <Link
                                                    to="/admin/shopKepper/worker/signup"
                                                    className="fw-bold"
                                                  >
                                                    Add New Worker
                                                  </Link>
                                                </div>
                                              </div>
                                            </li>
                                          )}
                                          <hr />
                                          <li className="container">
                                            <button
                                              className="btn btn-primary w-100 btn-sm rounded-pill"
                                              onClick={() =>
                                                handleSelectWorker(
                                                  order._id,
                                                  user
                                                )
                                              }
                                            >
                                              <i class="fa-solid fa-user-tie me-1"></i>{" "}
                                              Myself
                                            </button>
                                          </li>
                                        </ul>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              ))
                            ) : (
                              <p className="text-center text-muted">
                                No pending orders found
                              </p>
                            )}
                            <div className="card shadow-sm border-0 mt-3">
                              {/* Total */}
                              <div className="card-footer bg-light text-center py-3">
                                <h5 className="fw-bold text-dark mb-0">
                                  Total Price{" "}
                                  <span className="text-success ms-2">
                                    Rs. {grandTotalWithOutCharges}
                                    /-
                                  </span>
                                </h5>

                                <button
                                  className="btn btn-primary btn-sm rounded-pill w-100 mt-3"
                                  onClick={handleAssignOrders}
                                  disabled={
                                    Object.keys(selectedWorkers)?.length === 0
                                  }
                                >
                                  <i className="fa-solid fa-share-from-square me-1"></i>
                                  Assign ({Object.keys(selectedWorkers)?.length}{" "}
                                  {acceptedOrders?.length === 1
                                    ? "Order"
                                    : "Orders"}
                                  )
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
