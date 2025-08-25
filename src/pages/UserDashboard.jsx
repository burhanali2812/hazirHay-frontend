import React, { useState, useEffect } from "react";
import axios from "axios";
import location from "../images/location.png";
import {
  MapContainer,
  TileLayer,
  Marker,
  useMapEvents,
  Circle,
  Popup,
  Tooltip,
} from "react-leaflet";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
function UserDashboard({ shopWithShopkepper, setUpdateAppjs }) {
  const token = localStorage.getItem("token");
  const [position, setPosition] = useState([33.6844, 73.0479]);
  const [latitude, setLatitude] = useState(33.6844);
  const [longitude, setLongitude] = useState(73.0479);
  const [areaName, setAreaName] = useState("");
  const [coordinates, setCoordinates] = useState([]);
  const [loading, setLoading] = useState(false);
  const [verifiedShops, setVerifiedShops] = useState([]);
  const [verifiedLiveShops, setVerifiedLiveShops] = useState([]);
  const [chooseLocationModal, setChooseLocationModal] = useState(false);
  useEffect(() => {
    setUpdateAppjs(true);
    console.log(shopWithShopkepper);
  }, []);
  useEffect(() => {
    const fetchLocation = async () => {
      if (!navigator.geolocation) {
        alert("Geolocation is not supported by your browser.");
        return;
      }

      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const lat = position?.coords?.latitude ?? 33;
          const lon = position?.coords?.longitude ?? 73;

          setLatitude(lat);
          setLongitude(lon);
          setCoordinates(lat, lon);
          setPosition([lat, lon]);

          try {
            const response = await axios.get(
              "https://hazir-hay-backend.vercel.app/admin/reverse-geocode",
              { params: { lat, lon } }
            );

            const name =
              response.data?.display_name ||
              response.data.address?.city ||
              response.data.address?.town ||
              response.data.address?.village ||
              response.data.address?.suburb ||
              "Unknown Area";

            setAreaName(name);
          } catch (error) {
            console.error("Error fetching area name:", error);
          }
        },
        (error) => {
          if (error.code === error.PERMISSION_DENIED) {
            //alert("Please enable location access in your browser settings.");
          } else if (error.code === error.POSITION_UNAVAILABLE) {
            // alert("Location information is unavailable.");
          } else if (error.code === error.TIMEOUT) {
            // alert("Request to get location timed out. Try again.");
          } else {
            // alert("An unknown error occurred while fetching your location.");
          }
          console.error("Error getting location:", error);
        }
      );
    };

    fetchLocation();
  }, []);

  const getVerifiedShopWithShopkeppers = async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        "https://hazir-hay-backend.vercel.app/shopKeppers/allVerifiedShopkepperWithShops",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.status === 200) {
        console.log(response.data.data);
        const shops = response.data.data || [];
        setVerifiedShops(shops);
        const liveShops = shops.filter((shop) => shop?.isLive === true);
        setVerifiedLiveShops(liveShops);
      }
    } catch (error) {
      console.error("Error fetching shopkeepers with shops:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getVerifiedShopWithShopkeppers();
  }, []);

  const customIcon = L.icon({
    iconUrl: markerIcon,
    shadowUrl: markerShadow,
    iconSize: [20, 30],
    iconAnchor: [10, 30], // Match smaller height
  });
  const shopIcon = L.divIcon({
    html: `<i class="fa-solid fa-shop" style="color: red; font-size: 20px;"></i>`,
    className: "custom-shop-icon",
    iconSize: [20, 30],
    iconAnchor: [10, 30], // Match smaller height
  });

  function LocationPicker({ onLocationSelect }) {
    useMapEvents({
      click(e) {
        const { lat, lng } = e.latlng;
        setPosition([lat, lng]);
        onLocationSelect(lat, lng);

        console.log("points", lat, lng);
      },
    });
    return null;
  }
  const fetchAreaName = async (lat, lon) => {
    try {
      const response = await axios.get(
        "https://hazir-hay-backend.vercel.app/admin/reverse-geocode",
        { params: { lat: lat, lon: lon } }
      );

      const name =
        response.data?.display_name ||
        response.data.address?.city ||
        response.data.address?.town ||
        response.data.address?.village ||
        response.data.address?.suburb ||
        "Unknown Area";
      setAreaName(name);
      return name;
    } catch (error) {
      console.error("Error fetching area name:", error);
    }
  };

  const handleLocationSelect = async (lat, lon) => {
    const name = await fetchAreaName(lat, lon);
    setAreaName(name);
  };

  return (
    <div>
      <div style={{ height: "350px", width: "100%", marginTop: "-70px" }}>
        <MapContainer
          center={[latitude, longitude]}
          zoom={13}
          style={{ height: "100%", width: "100%" }}
        >
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          <LocationPicker onLocationSelect={handleLocationSelect} />
          {position && <Marker position={position} icon={customIcon} />}
          {position && (
            <Circle
              center={position}
              radius={1000}
              pathOptions={{
                color: "red",
                fillColor: "blue",
                fillOpacity: 0.1,
              }}
            />
          )}
          {verifiedShops.map((provider) => {
            const coords = provider?.shop?.location?.coordinates;

            if (
              Array.isArray(coords) &&
              coords.length === 2 &&
              typeof coords[0] === "number" &&
              typeof coords[1] === "number"
            ) {
              return (
                <Marker
                  key={provider?.shop?._id}
                  position={[coords[0], coords[1]]}
                  icon={shopIcon}
                  zIndexOffset={1000}
                >
                  <Popup>{provider?.shop?.location?.area}</Popup>
                  <Tooltip
                    permanent
                    direction="top"
                    offset={[0, -25]}
                    opacity={1}
                  >
                    <span>{provider?.shop?.shopName}</span>
                  </Tooltip>
                </Marker>
              );
            }
            return null;
          })}
        </MapContainer>
      </div>

      <div
        className="card bg-light container shadow-sm"
        style={{
          marginTop: "-15px",
          height: "330px",
          borderTopLeftRadius: "25px",
          borderTopRightRadius: "20px",
          border: "1px solid #ddd",
          padding: "20px",
        }}
      >
        {" "}
        <span
          className="mt-1"
          style={{
            backgroundColor: "#a5d5f5ff",
            color: "#010101ff",
            padding: "8px 12px",
            borderRadius: "6px",
            fontSize: "14px",
          }}
        >
          <strong>Note:</strong> You can change your address from the map or
          click on the address below.
        </span>
        <div
          className="d-flex align-items-center mt-3"
          onClick={() => setChooseLocationModal(true)}
        >
          <i
            className="fa-solid fa-street-view text-danger me-3"
            style={{ fontSize: "27px" }}
          ></i>
          <p style={{ fontSize: "16px", marginBottom: "-10px" }}>
          {areaName || "No location found! please click on me to update your location"}
          </p>
        </div>
      </div>

      {chooseLocationModal && (
        <div
          className="modal fade show d-block"
          tabIndex="-1"
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
        >
          <div className="modal-dialog modal-lg modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Location</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setChooseLocationModal(false)}
                ></button>
              </div>
              <div className="modal-body" style={{ height: "auto" }}>
                <div
                  className="d-flex flex-column justify-content-center align-items-center text-center"
                  style={{ height: "65vh" }}
                >
                  <img
                    src={location}
                    alt="No Data"
                    className="mb-3"
                    style={{ width: "180px", height: "auto" }}
                  />
                  <h4 className="fw-bold text-warning mb-2">
                    Sorry, No Address Saved!
                  </h4>
                  <p
                    className="text-muted"
                    style={{ maxWidth: "380px", fontSize: "15px" }}
                  >
                    Sorry, you currently have not saved any address. Please
                    click the
                    <strong> "Add Address" </strong> button below to save your
                    address once for easy access next time.
                  </p>
                </div>
                  <div>
                    <button className="btn btn-success w-100"><i class="fa-solid fa-map-location-dot me-2"></i>Add Address</button>
                  </div>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setChooseLocationModal(false)}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default UserDashboard;
