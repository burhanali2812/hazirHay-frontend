import React, { useState, useEffect } from "react";
import track from "../images/track.png";
import notFound from "../images/notFound.png";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import {
  MapContainer,
  TileLayer,
  Marker,
  useMapEvents,
  Popup,
  Tooltip,
  Polyline,
} from "react-leaflet";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import "leaflet-routing-machine";
import { useMap } from "react-leaflet";

function Tracking() {
  const token = localStorage.getItem("token");
  const [requestsData, setRequestsData] = useState([]);
  const [searchQuery, setSearchQuery] = useState([]);
  const [serachData, setSearchData] = useState([]);
  const [selectedTrackShopData, setSelectedTrackShopData] = useState(null);
  const [trackingDetailsModal, setTrackingDetailsModal] = useState(false);
  const [shopCoordinates, setShopCoordinates] = useState([]);
  const [selectedShop, setSelectedShop] = useState(null);

  const navigate = useNavigate();
  const position = selectedTrackShopData?.location?.[0]?.coordinates;
  console.log("position", position);

  const fetchUserCart = async () => {
    try {
      const response = await axios.get(
        "https://hazir-hay-backend.wckd.pk/requests/getUserRequests",
        {
          headers: { Authorization: `Bearer ${token}` },
          params: { t: Date.now() },
        }
      );
      if (response.data.success) {
        // alert("Cart Data Fetch SuccessFully")
        console.log(response.data.data || []);
        setRequestsData(response.data.data || []);
      }
    } catch (error) {
      console.error("Error Fetching reuests data:", error.message);
    }
  };

  useEffect(() => {
    fetchUserCart();
  }, []);

  const fetchShopData = async (data) => {
    console.log("selectedTrackShopData?.shopOwnerId", data?.shopOwnerId);
    
    try {
      const res = await axios.get(
        `https://hazir-hay-backend.wckd.pk/shops/shopData/${data?.shopOwnerId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
          params: { t: Date.now() },
        }
      );
      if (res.data.success) {
        setSelectedShop(res.data.shop);
        console.log("shop", res.data.shop);
        setShopCoordinates(res.data.shop.location.coordinates)
        console.log("shop Coordinates", res.data.shop.location.coordinates);
        
      }
    } catch (error) {
      console.error("Error Fetching reuests data:", error.message);
    }
  };

  const handleChange = (e) => {
    const value = e.target.value.toUpperCase(); // keep input in uppercase
    setSearchQuery(value);
    console.log("words", value.length);
    if (value.length === 0) {
      setSearchData([]);
      return;
    }

    const data = requestsData.filter((request) =>
      request.checkoutId ? request.checkoutId.includes(value) : false
    );
    console.log(data);

    setSearchData(data);
  };

  const handleGotoTrackingPage = async(data) => {
    console.log("data", data);
    await fetchShopData(data);

    setSelectedTrackShopData(data);
    setTrackingDetailsModal(true);
  };

  function FlyToUser({ position }) {
    const map = useMapEvents({});
    useEffect(() => {
      if (position && position.length === 2) {
        map.flyTo(position, 16, {
          animate: true,
          duration: 1,
        });
      }
    }, [position, map]);
    return null;
  }
  const shopIcon = L.divIcon({
    html: `<i class="fa-solid fa-shop" style="color: red; font-size: 20px;"></i>`,
    className: "custom-shop-icon",
    iconSize: [20, 30],
    iconAnchor: [10, 30], // Match smaller height
  });
  const userIcon = L.divIcon({
    html: `<i class="fa-solid fa-street-view" style="color: red; font-size: 20px;"></i>`,
    className: "custom-shop-icon",
    iconSize: [20, 30],
    iconAnchor: [10, 30], // Match smaller height
  });

function Routing({ userPos, shopPos }) {
  const map = useMap();

  useEffect(() => {
    if (!map || !userPos || !shopPos) return;

    const L = require("leaflet");

    const routingControl = L.Routing.control({
      waypoints: [
        L.latLng(userPos[0], userPos[1]),
        L.latLng(shopPos[0], shopPos[1]),
      ],
      lineOptions: {
        styles: [{ color: "blue", weight: 4 }],
      },
      addWaypoints: false,
      draggableWaypoints: false,
      fitSelectedRoutes: true,
      createMarker: () => null, // only use your own markers
      routeWhileDragging: false,
      show: false, // <-- not enough alone
    }).addTo(map);

    // 🚀 Remove the instruction container if it appears
    const container = routingControl.getContainer();
    if (container) {
      container.style.display = "none";
    }

    return () => map.removeControl(routingControl);
  }, [map, userPos, shopPos]);

  return null;
}



  return (
    <div className="container mt-3 " style={{ overflowY: 0 }}>
      <form className="d-flex" role="search" style={{ width: "auto" }}>
        <div className="position-relative w-100 mb-4">
          <input
            type="search"
            className="form-control bg-transparent rounded-pill ps-5 pe-5"
            placeholder="CHK-XXX-XXX"
            aria-label="Search"
            value={searchQuery}
            onChange={handleChange}
            style={{ border: "2px solid black" }}
          />

          {/* Search Icon (left inside input) */}
          <span className="position-absolute top-50 start-0 translate-middle-y ps-3 text-muted">
            <i className="fa-solid fa-magnifying-glass"></i>
          </span>
        </div>
      </form>

      {serachData.length > 0 ? (
        serachData.map((data, index) => (
          <div
            key={index}
            className="d-flex justify-content-between align-items-center p-3 mb-3 rounded shadow-lg border-0 bg-transparent"
            style={{ backgroundColor: "#fff" }}
            onClick={() => handleGotoTrackingPage(data)}
          >
            {/* Left content */}
            <div>
              <p className="fw-bold mb-1 text-dark">{data.orderId}</p>
              <p className="mb-1 text-muted">
                {data.subCategory} <small>({data.category})</small>
              </p>

              {/* Status with color badges */}
              {data.status === "accepted" && (
                <span className="badge bg-success ">{data.status}</span>
              )}
              {data.status === "rejected" && (
                <span className="badge bg-danger">{data.status}</span>
              )}
              {data.status === "completed" && (
                <span className="badge bg-primary">{data.status}</span>
              )}
              {data.status === "pending" && (
                <span className="badge bg-warning text-dark ">
                  {data.status}
                </span>
              )}
            </div>

            {/* Right arrow */}
            <div className="ms-3 text-muted">
              <i class="fa-solid fa-angle-right"></i>
            </div>
          </div>
        ))
      ) : searchQuery?.length === 0 ? (
        <div
          className="d-flex flex-column justify-content-center align-items-center text-center"
          style={{ height: "75vh" }}
        >
          <img
            src={track}
            alt="No Data"
            className="mb-0"
            style={{ width: "300px", height: "auto" }}
          />
          <h4 className="fw-bold text-warning mb-2 mt-0">
            Track Your Order Easily
          </h4>
          <p
            className="text-muted"
            style={{ maxWidth: "380px", fontSize: "15px" }}
          >
            Just enter your tracking ID (for example,{" "}
            <strong>CHK-XXX-XXX</strong>) and we’ll help you see where your
            order is, check shop details, and follow it live — simple and quick!
          </p>
        </div>
      ) : searchQuery.length > 10 || serachData.length === 0 ? (
        <div
          className="d-flex flex-column justify-content-center align-items-center text-center"
          style={{ height: "75vh" }}
        >
          <img
            src={notFound}
            alt="No Data"
            className="mb-0"
            style={{ width: "220px", height: "auto" }}
          />
          <h4 className="fw-bold text-danger mb-2 mt-0">
            Sorry, Checkout Not Found
          </h4>
          <p
            className="text-muted"
            style={{ maxWidth: "380px", fontSize: "15px" }}
          >
            The checkout ID you entered doesn’t match our records. Kindly
            re-check the ID (e.g., <strong>CHK-XXX-XXX</strong>) or try a
            different one.
          </p>
        </div>
      ) : (
        ""
      )}

      {trackingDetailsModal && (
        <div
          className="modal fade show d-block"
          tabIndex="-1"
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
        >
          <div className="modal-dialog modal-fullscreen modal-dialog-centered">
            <div className="modal-content  shadow-lg">
              {/* HEADER */}
              <div className="modal-header  d-flex justify-content-between align-items-center">
                <div className="d-flex align-items-center">
                  <i
                    className="fa-solid fa-circle-chevron-left text-dark"
                    style={{ fontSize: "20px", cursor: "pointer" }}
                    onClick={() => setTrackingDetailsModal(false)}
                  ></i>
                  <h5 className="ms-2 fw-bold mb-0">Tracking Details</h5>
                </div>
              </div>

              {/* BODY */}
              <div className="modal-body">
                <div style={{ height: "400px", width: "100%" }}>
                  <MapContainer
                    center={[33.6844, 73.0479]}
                    zoom={13}
                    style={{ height: "100%", width: "100%" }}
                  >
                    <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                    <FlyToUser position={position} />
                    {position && <Marker position={position} icon={userIcon} />}

                    <Marker
                                 position={[shopCoordinates?.[0], shopCoordinates?.[1]]}
                                 icon={shopIcon}
                                 zIndexOffset={1000}
                               >
                               </Marker>
                               {
                                shopCoordinates && position && (
                                     <Routing userPos={position} shopPos={shopCoordinates} />
                                )
                               }
                  </MapContainer>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Tracking;
