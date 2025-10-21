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
        Hello, <span className="text-primary">{user?.name || "Worker"}</span>
      </h6>
      <p className="text-muted small mb-0">Have a productive day ahead!</p>
    </div>
  </div>

  
  <div className="mt-3">
    <div className="input-group rounded-pill bg-light" style={{ maxWidth: "400px" }}>
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


        {assignedOrders.length > 0 ? (
          assignedOrders.map((order, ind) => {
            const assignedDate = new Date(
              order?.orderAssignment?.assignedAt
            ).toLocaleString();

            return (
              <div
                key={ind}
                className="card mb-3 border-0 shadow-sm rounded-4"
                style={{
                  padding: "14px 18px",
                  transition: "0.3s",
                  cursor: "pointer",
                }}
              >
      
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <h6 className="fw-semibold text-primary mb-0">
                    {order?.orderId}
                  </h6>
                  <small className="text-muted">{assignedDate}</small>
                </div>

                <div className="d-flex align-items-center mb-2">
                  <img
                    src={order?.userId?.profilePicture}
                    alt="Profile"
                    className="rounded-circle border border-2 me-3"
                    style={{
                      width: "60px",
                      height: "60px",
                      objectFit: "cover",
                    }}
                  />
                  <div className="flex-grow-1">
                    <div className="d-flex justify-content-between align-items-center">
                      <h6 className="fw-semibold mb-1 text-dark">
                        {order?.userId?.name}
                      </h6>
                      <a
                        href={`tel:${order?.userId?.phone}`}
                        title="Call Customer"
                        style={{
                          textDecoration: "none",
                          color: "#0d6efd",
                          fontSize: "15px",
                        }}
                      >
                        <i className="fas fa-phone"></i>
                      </a>
                    </div>

                    <p
                      className="text-muted small mb-0 d-flex align-items-center"
                      style={{
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                      title={order?.location?.[0]?.area}
                    >
                      <i className="fas fa-map-marker-alt text-danger me-2"></i>
                      {order?.location?.[0]?.area?.split(",")[0] ||
                        "Unknown Area"}
                    </p>
                    <p
                      className="text-muted small mb-0 d-flex align-items-center"
                      style={{ gap: "6px" }}
                    >
                      <i
                        className={`fa-solid ${
                          distances[order._id]?.distance
                            ? "fa-route text-primary"
                            : "fa-spinner fa-spin text-secondary"
                        }`}
                      ></i>

                      {distances[order._id]?.distance ? (
                        <>
                          {distances[order._id].distance} km |{" "}
                          <i className="fa-regular fa-clock text-primary"></i>{" "}
                          {distances[order._id].duration} min
                        </>
                      ) : (
                        "Calculating..."
                      )}
                    </p>
                  </div>
                </div>

           
                <div className="d-flex justify-content-between align-items-center ">
                  <h6 className="fw-semibold text-success mb-0">
                    Rs {order?.cost?.toLocaleString()}
                  </h6>
                  <button
                    className="btn btn-light rounded-circle shadow-sm d-flex align-items-center justify-content-center"
                    title="View Details"
                    style={{
                      width: "35px",
                      height: "35px",
                      padding: 0,
                    }}
                  >
                    <i className="fa-solid fa-angle-right"></i>
                  </button>
                </div>
              </div>
            );
          })
        ) : (
          <h5 className="text-muted">No orders assigned</h5>
        )}
      </section>
    </div>
  );
}

export default WorkerDashboard;
