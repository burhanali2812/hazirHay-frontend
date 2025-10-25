import axios from "axios";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
function WorkerDashboard() {
  const user = JSON.parse(sessionStorage.getItem("user"));
  const token = localStorage.getItem("token");
  const [distances, setDistances] = useState({});
  const navigate = useNavigate();
  const [assignedOrders, setAssignOrders] = useState([]);
  const [currentLocation, setCurrentLocation] = useState(null);
  const [ordersModal, setOrdersModal] = useState(false);
  const [selectedReqUser, setSelectedReqUser] = useState(null);

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  const handlegetAssignedOrder = async () => {
    try {
      const res = await axios.get(
        `https://hazir-hay-backend.vercel.app/requests/getAssignedOrder/${user?._id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          params: { t: Date.now() },
        }
      );
      if (res.data.success) {
        //  alert(res.data.message);
        setAssignOrders(res.data.data);
      }
    } catch (error) {
      alert(error);
    }
  };
  useEffect(() => {
    handlegetAssignedOrder();
  }, []);
  const getCurrentLocation = async () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          const lat = pos.coords.latitude;
          const lng = pos.coords.longitude;
          const areaName = await fetchAreaName(lat, lng);

          const location = {
            area: areaName,
            name: "Current Location",
            coordinates: [lat, lng],
          };
          setCurrentLocation(location);
        },
        (error) => {
          console.error("Error getting location:", error);
          alert("Unable to get your location. Please allow location access.");
        }
      );
    } else {
      alert("Geolocation is not supported by your browser.");
    }
  };
  useEffect(() => {
    getCurrentLocation();
  }, []);

  async function getDistance(workerCoords) {
    try {
      if (!currentLocation || !currentLocation.coordinates) {
        console.warn("Current location not available");
        return { distance: null, duration: null };
      }

      const userCoords = [
        currentLocation.coordinates[1],
        currentLocation.coordinates[0],
      ];
      console.log("Worker:", workerCoords, "User:", userCoords);

      if (!workerCoords || workerCoords.length < 2) {
        console.warn("Invalid worker coordinates:", workerCoords);
        return { distance: null, duration: null };
      }

      const accessToken =
        "pk.eyJ1Ijoic3llZGJ1cmhhbmFsaTI4MTIiLCJhIjoiY21mamM0NjZiMHg4NTJqczRocXhvdndiYiJ9.Z4l8EQQ47ejlWdVGcimn4A";

      const url = `https://api.mapbox.com/directions/v5/mapbox/driving/${userCoords[0]},${userCoords[1]};${workerCoords[0]},${workerCoords[1]}?access_token=${accessToken}&overview=false`;

      const res = await axios.get(url);

      if (!res.data.routes || res.data.routes.length === 0) {
        console.warn("No routes found for:", workerCoords);
        return { distance: null, duration: null };
      }

      const route = res.data.routes[0];
      return {
        distance: (route.distance / 1000).toFixed(2),
        duration: (route.duration / 60).toFixed(0),
      };
    } catch (error) {
      console.error("Error in getDistance:", error.message);
      return { distance: null, duration: null };
    }
  }

  const fetchAreaName = async (lat, lon) => {
    try {
      const res = await axios.get(
        "https://hazir-hay-backend.vercel.app/admin/reverse-geocode",
        { params: { lat, lon } }
      );

      return (
        res.data?.display_name ||
        res.data?.address?.city ||
        res.data?.address?.town ||
        res.data?.address?.village ||
        res.data?.address?.suburb ||
        "Unknown Area"
      );
    } catch (error) {
      console.error("Error fetching area name:", error);
      return "Unknown Area";
    }
  };
  useEffect(() => {
    const fetchAllDistances = async () => {
      if (!currentLocation || assignedOrders.length === 0) return;

      const newDistances = {};

      for (const order of assignedOrders) {
        try {
          const rawCoords = order?.location?.[0]?.coordinates;
          const workerCoords = rawCoords ? [rawCoords[1], rawCoords[0]] : null; // [lng, lat]

          const dist = await getDistance(workerCoords);

          newDistances[order._id] = {
            distance: dist?.distance || null,
            duration: dist?.duration || null,
          };
        } catch (error) {
          console.error("Error calculating distance:", error);
          newDistances[order._id] = { distance: null, duration: null };
        }
      }

      setDistances(newDistances);
    };

    fetchAllDistances();
  }, [assignedOrders, currentLocation]);

  const groupRequests = assignedOrders.reduce((acc, req) => {
    const userId = req.userId?._id || req.userId;
    if (!acc[userId]) {
      acc[userId] = {
        user: req.userId,
        orders: [],
      };
    }
    acc[userId].orders.push(req);
    return acc;
  }, {});
  const groupedRequestsArray = Object.values(groupRequests);
  console.log("groupedRequestsArray", groupedRequestsArray);
  console.log("groupRequests", groupRequests);


  const handleStart = ()=>{
      localStorage.setItem(
          "currentCheckout",
          JSON.stringify(groupedRequestsArray)
        );
    navigate("/admin/user/orderWithJourney")
  }

  const openOrdersModal = (selectedUserId)=>{
    console.log("selectedUserId" , selectedUserId);
    
      const selectedGroup = groupedRequestsArray?.find(
  (group) => group.user._id === selectedUserId
);
setSelectedReqUser(selectedGroup)

  setOrdersModal(true)




  }

  return (
    <div>
      <header
        className="w-100 bg-white shadow-sm d-flex align-items-center justify-content-between px-2"
        style={{ height: "65px", borderRadius: "0px" }}
      >
        <div
          className="d-flex align-items-center bg-light border-1  rounded-pill px-3 py-2 "
          style={{
            minWidth: "250px",
            maxWidth: "250px",
            cursor: "pointer",
            transition: "0.2s",
          }}
          // onClick={() => setShowMapModal(true)} // opens map modal
          title="View on map"
        >
          <i className="fas fa-map-marker-alt text-danger me-2"></i>
          <span
            className="text-muted small fw-semibold"
            style={{
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
              flex: 1,
            }}
          >
            {currentLocation?.area || "Fetching location..."}
          </span>
        </div>

        <div className="d-flex align-items-center gap-2">
          <i
            className="fas fa-home  text-muted"
            title="Home"
            style={{ cursor: "pointer" }}
          ></i>

          <i
            className="fas fa-bell text-muted"
            title="Notifications"
            style={{ cursor: "pointer" }}
          ></i>

          <i
            className="fas fa-sign-out-alt  text-danger"
            title="Logout"
            style={{ cursor: "pointer" }}
            onClick={handleLogout}
          ></i>
        </div>
      </header>

      <section className="container py-3">
        {/* Profile Greeting Section */}
        <div
          className="bg-light shadow-lg rounded-4 p-3 mb-4"
          style={{ transition: "0.3s" }}
        >
          <div className="d-flex align-items-center mb-2">
            <img
              src={user?.profilePicture}
              alt="Profile"
              className="rounded-circle border border-2 shadow-sm me-3"
              style={{
                width: "55px",
                height: "55px",
                objectFit: "cover",
                cursor: "pointer",
              }}
              title="Profile"
            />
            <div>
              <h6 className="fw-semibold text-dark mb-1">
                Hello,{" "}
                <span className="text-primary">{user?.name || "Worker"}</span>
              </h6>
              <p className="text-muted small mb-0">
                Have a productive day ahead!
              </p>
            </div>
          </div>

          <div className="mt-3">
            <div
              className="input-group rounded-pill bg-light"
              style={{ maxWidth: "400px" }}
            >
              <input
                type="text"
                className="form-control border-0 rounded-pill ps-3 bg-light py-2"
                placeholder="ORD-XYZ-ABC | USERNAME"
                style={{ fontSize: "14px" }}
              />
              <span className="input-group-text bg-transparent border-0 pe-3">
                <i className="fas fa-search text-muted"></i>
              </span>
            </div>
          </div>
        </div>

        {groupedRequestsArray?.length > 0 ? (
          groupedRequestsArray?.map((group, ind) => {
            const user = group.user;
            const firstOrder = group.orders[0];
            const area =
              firstOrder?.location?.[0]?.area?.split(",")[0] || "Unknown Area";
            const totalOrders = group?.orders?.length;
            const totalCost = group?.orders?.reduce(
              (sum, req) => sum + (req.cost || 0),
              0
            );

            return (
              <div
                key={ind}
                className="card mb-4 border-0 shadow-sm rounded-4 p-3 order-card"
                style={{
                  transition: "0.3s",
                  cursor: "pointer",
                  background: "linear-gradient(145deg, #ffffff, #f9f9f9)",
                }}
              >
                {/* Header */}
                <div className="d-flex align-items-center justify-content-between mb-3">
                  <div className="d-flex align-items-center">
                    <img
                      src={user?.profilePicture}
                      alt="Profile"
                      className="rounded-circle border border-2 shadow-sm me-3"
                      style={{
                        width: "65px",
                        height: "65px",
                        objectFit: "cover",
                      }}
                    />
                    <div>
                      <h6 className="fw-bold mb-1 text-dark">
                        <i className="fa-solid fa-user text-primary me-2"></i>
                        {user?.name}
                      </h6>
                      <p className="text-muted small mb-0">
                        <i className="fa-solid fa-phone text-success me-2"></i>
                        {user?.phone}
                      </p>
                    </div>
                  </div>

                  <a
                    href={`tel:${user?.phone}`}
                    className="btn btn-sm btn-primary rounded-pill shadow-sm px-3"
                    title="Call Customer"
                  >
                    <i className="fa-solid fa-phone me-2"></i> Call
                  </a>
                </div>

                <hr className="my-2" />

                {/* Location, Distance & Cost */}
                <div className="small text-secondary">
                  <div className="d-flex align-items-center mb-2">
                    <i className="fa-solid fa-location-dot text-danger me-2"></i>
                    <span className="fw-semibold">{area}</span>
                  </div>

                  <div className="d-flex align-items-center justify-content-between flex-wrap">
                    <div>
                      {distances[firstOrder._id]?.distance ? (
                        <>
                          <i className="fa-solid fa-route text-info me-2"></i>
                          {distances[firstOrder._id].distance} km
                          <span className="mx-2">|</span>
                          <i className="fa-regular fa-clock text-primary me-2"></i>
                          {distances[firstOrder._id].duration} min
                        </>
                      ) : (
                        <>
                          <i className="fa-solid fa-spinner fa-spin text-secondary me-2"></i>
                          Calculating distance…
                        </>
                      )}
                    </div>

                    <div className="fw-bold text-dark">
                      Total Cost:
                      <span className="text-success">
                        Rs. {totalCost.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Footer */}
                <div
                  className="d-flex align-items-center mt-3 justify-content-between"
                  style={{ gap: "10px" }}
                >
                  {/* Orders Button - 70% width */}
                  <div style={{ flex: "0 0 70%" }}>
                    <button
                      className="btn btn-sm btn-outline-success w-100 shadow-sm rounded-pill d-flex justify-content-between align-items-center px-3"
                      type="button"
                      onClick={() => openOrdersModal(user._id)}
                      title="View all assigned orders"
                    >
                      <span className="d-flex align-items-center">
                        <i className="fa-solid fa-box me-2"></i>
                        {totalOrders} Order{totalOrders > 1 ? "s" : ""}
                      </span>
                      <i className="fa-solid fa-angle-right"></i>
                    </button>
                  </div>

                  {/* Start Button - 30% width */}
                  <div style={{ flex: "0 0 30%" }}>
                    <button
                      className="btn btn-primary btn-sm rounded-pill shadow-sm fw-semibold w-100 d-flex justify-content-center align-items-center"
                      title="Start this delivery"
                      onClick={handleStart}
                    >
                      <i className="fa-solid fa-play me-2"></i>
                      Start
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <h5 className="text-muted text-center mt-4">No orders assigned</h5>
        )}
      </section>
      {ordersModal && (
        <div
          className="modal fade show d-block animate__animated animate__fadeIn"
          tabIndex="-1"
          style={{
            backgroundColor: "rgba(0, 0, 0, 0.6)",
            backdropFilter: "blur(0px)",
          }}
        >
          <div className="modal-dialog modal-sm modal-dialog-centered">
            <div
              className="modal-content shadow"
              style={{ borderRadius: "10px" }}
            >
              {/* Header */}
              <div
                className="modal-header text-light py-2 px-3"
                style={{ backgroundColor: "#1e1e2f" }}
              >
                <h6 className="modal-title m-0">Order List</h6>
                <button
                  type="button"
                  className="btn-close btn-close-white"
                  aria-label="Close"
                  onClick={() => setOrdersModal(false)}
                ></button>
              </div>

              {/* Body */}
              <div className="modal-body text-center">
                <div className="p-2">
                 {selectedReqUser ? (
  <div className="mb-3">
    {/* User Header */}
    <h6 className="fw-bold text-dark mb-2 d-flex align-items-center justify-content-center">
      <img
        src={selectedReqUser.user?.profilePicture}
        alt="User"
        className="rounded-circle me-2"
        style={{
          width: "35px",
          height: "35px",
          objectFit: "cover",
        }}
      />
      {selectedReqUser.user?.name || "Unknown User"}
    </h6>

    {/* Orders List */}
    {selectedReqUser.orders?.length > 0 ? (
      selectedReqUser.orders.map((req, idx) => (
        <div key={idx} className="p-2 rounded hover-bg-light border mb-2">
          <div className="d-flex flex-column text-start">
            <span className="fw-semibold text-dark">
              <i className="fa-solid fa-barcode me-2 text-primary"></i>
              {req.orderId || req._id}
            </span>
            <span className="text-muted ms-4 text-wrap">
              {req.subCategory || "N/A"} ({req.category || "N/A"})
            </span>

            <div className="d-flex align-items-center justify-content-between ms-4 mt-1">
              <span className="text-success fw-semibold">
                Rs. {req.cost || 0}
              </span>
              <button
                className="btn btn-sm btn-danger d-flex align-items-center gap-2 px-2 rounded-pill"
                title="Remove assignment"
              >
                <i className="fa-solid fa-xmark"></i>
                Remove
              </button>
            </div>
          </div>
        </div>
      ))
    ) : (
      <h6 className="text-muted">No orders found</h6>
    )}
  </div>
) : (
  <h6 className="text-muted">No user selected</h6>
)}

                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default WorkerDashboard;
