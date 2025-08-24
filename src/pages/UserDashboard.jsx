import React, { useState, useEffect } from "react";
import axios from "axios";
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
    <div className="container">
      <div style={{ height: "400px", width: "100%" }}>
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

      <div className="d-flex justify-content-between mt-2">
        <input
          className="form-control"
          type="search"
          placeholder="Searching your current location..."
          value={areaName}
          readOnly
        />
      </div>
    </div>
  );
}

export default UserDashboard;
