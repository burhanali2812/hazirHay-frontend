import React, { useState, useEffect } from "react";
import axios from "axios";
import location from "../images/location.png";
import "./style.css";
import noData from "../images/noData.png";

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
import { services } from "../components/servicesData";
import UserInfoModal from "../components/UserInfo";
function UserDashboard({ shopWithShopkepper, setUpdateAppjs, onRequestAdded }) {
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
  const [userLocations, setUserLocations] = useState([]);
  const [saveLocationsModal, setSaveLocationsModal] = useState(false);
  const [subCatModal, setSubCatModal] = useState(false);
  const [locationName, setLocationName] = useState("");
  const [selectedSubCategory, setSelectedSubCategory] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [availableServices, setAvailableServices] = useState([]);
  const [selectedShopWithShopkepper, setSelectedShopWithShopkepper] = useState(null);
  const [infoModal, setInfoModal] = useState(false);

  const user = JSON.parse(sessionStorage.getItem("user"));

    const [cartData, setCartData] = useState([]);


  const addTocart = (shop)=>{
    const exists = cartData.find(item => item._id === shop._id);
    if (exists) {
      alert("This item is already in the cart");
    } else {
      setCartData([...cartData,  shop ]);
      alert("Shop added in a cart");
      console.log("cart data",cartData)
    }
  }


const getShopWithShopkeppers = async (provider) => {
  setLoading(true);
  try {
    const response = await axios.get(
      "https://hazir-hay-backend.wckd.pk/shopKeppers/allVerifiedShopkepperWithShops",
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (response.status === 200) {
      const shopWithShopkeppers = response.data.data || [];
      console.log("All shops with shopkeepers:", shopWithShopkeppers);
      console.log("Selected provider:", provider);

      // Convert ObjectId to string for accurate comparison
      const selected = shopWithShopkeppers.find(
        (serviceProvider) =>
          serviceProvider?.shop?.owner?.toString() ===
          provider?.owner?._id?.toString()
      );

      console.log("Selected shop with shopkeeper:", selected);

      console.log("Selected shop with shopkeeper:", selected);

      setSelectedShopWithShopkepper(selected);
      setInfoModal(true);
    }
  } catch (error) {
    console.error("Error fetching shopkeepers with shops:", error);
  } finally {
    setLoading(false);
  }
};


  const findServicesProvider = async () => {
    try {
      const response = await axios.get(
        "https://hazir-hay-backend.wckd.pk/shops/shopsDataByCategory",
        {
          params: {
            category: selectedCategory,
            subCategory: selectedSubCategory,
          },
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.success) {
        console.log("Providers found:", response.data.data);
        setAvailableServices(response.data.data || []);
        alert("Service Providers Found");
        setSubCatModal(true);
      } else {
        console.warn(response.data.message);
      }
    } catch (error) {
      console.error(
        "Error fetching service providers:",
        error.response?.data?.message || error.message
      );
    }
  };

  const sendRequestData = async () => {
    try {
      if (!selectedCategory) {
        return alert("Please select a category");
      }
      if (!selectedSubCategory) {
        return alert("Please select a sub-category");
      }
      if (!coordinates.length) {
        return alert("Please select your location on the map");
      }

      const payload = {
        category: selectedCategory,
        subCategory: selectedSubCategory,
        location: {
          coordinates,
          area: areaName || "Unknown Area",
        },
        userId: user?._id,
      };

      console.log("Payload:", payload);

      const response = await axios.post(
        "https://hazir-hay-backend.wckd.pk/requests/sendRequestData",
        payload,
        {
          headers: { Authorization: `Bearer ${token}` },
          params: { t: Date.now() }, // Prevents caching
        }
      );
      if (response.data.success) {
        onRequestAdded();
        setSelectedCategory(null);
        setSelectedSubCategory(null);

        alert(response?.data?.message || "Request sent successfully!");
      }
    } catch (error) {
      console.error("Error sending request:", error);

      if (error.response) {
        alert(
          `Failed: ${
            error.response.data?.message || "Server returned an error"
          }`
        );
      } else if (error.request) {
        alert("Network error. Please check your internet connection.");
      } else {
        alert("Unexpected error. Please try again.");
      }
    }
  };

  const getUserLocations = async () => {
    try {
      const response = await axios.get(
        `https://hazir-hay-backend.wckd.pk/users/getUserById/${user._id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
          params: { t: Date.now() },
        }
      );

      if (response.data.success) {
        setUserLocations(response.data.data.location || []);
        // alert("successFull getUser Locations")
      } else {
        console.error("Failed to fetch user locations");
        setUserLocations([]);
      }
    } catch (error) {
      console.error("Error fetching user locations:", error.message);
      setUserLocations([]); // Reset state on error
    }
  };

  useEffect(() => {
    setUpdateAppjs(true);
    getUserLocations();
  }, []);
  const setSelectedLocation = (location) => {
    setAreaName(location.area);
    setLocationName(location.name);
    setCoordinates(location.coordinates);
    setPosition(location.coordinates);
  };
  const handleSaveLocation = async () => {
    setLoading(true);
    if (locationName === "") {
      alert("Location Name Cannot be Empty");
      return;
    }

    const payload = {
      name: locationName,
      coordinates: coordinates,
      area: areaName,
    };

    try {
      const response = await axios.post(
        `https://hazir-hay-backend.wckd.pk/users/addUserLocation/${user._id}`,
        payload,
        {
          headers: { Authorization: `Bearer ${token}` },
          params: { t: Date.now() }, // Prevent caching
        }
      );
      if (response.data.success) {
        getUserLocations();
        alert("Location saved successfully!");
        setLocationName("");
        setCoordinates([]);
        setAreaName("");
        setLoading(false);

        setSaveLocationsModal(false);
      } else {
        alert(response.data.message || "Failed to save location.");
        setLoading(false);
      }
    } catch (error) {
      console.error("Error saving location:", error);
      alert("Something went wrong while saving location.");
      setLoading(false);
    } finally {
      setLoading(false);
    }
  };

  const deleteUserLocation = async (location) => {
    setLoading(true);

    try {
      const response = await axios.delete(
        `https://hazir-hay-backend.wckd.pk/users/deleteUserLocation/${location._id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
          params: { t: Date.now() }, // Prevent caching
        }
      );

      if (response.data.success) {
        alert("Location deleted successfully!");
        setLoading(false);
        setUserLocations((prev) =>
          prev.filter((loc) => loc._id !== location._id)
        );
      } else {
        alert(response.data.message || "Failed to delete location.");
        setLoading(false);
      }
    } catch (error) {
      console.error("Error deleting location:", error);
      alert("Server error. Please try again later.");
      setLoading(false);
    }
  };
  function FlyToLocation({ coordinates }) {
    const map = useMapEvents({});

    useEffect(() => {
      if (coordinates && coordinates.length === 2) {
        map.flyTo(coordinates, 16, {
          animate: true,
          duration: 1,
        });
      }
    }, [coordinates, map]);

    return null;
  }
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
          setCoordinates([lat, lon]);
          setPosition([lat, lon]);

          try {
            const response = await axios.get(
              "https://hazir-hay-backend.wckd.pk/admin/reverse-geocode",
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
        "https://hazir-hay-backend.wckd.pk/shopKeppers/allVerifiedShopkepperWithShops",
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
        setCoordinates([lat, lng]);

        console.log("points", lat, lng);
      },
    });
    return null;
  }
  const fetchAreaName = async (lat, lon) => {
    try {
      const response = await axios.get(
        "https://hazir-hay-backend.wckd.pk/admin/reverse-geocode",
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
  const handleCategoryChange = (e) => {
    setSelectedCategory(e.target.value);
    setSelectedSubCategory("");
  };

  // Calculate distance between two coordinates in kilometers
  function getDistanceFromCoordinates(shopCoords, userCoords) {
    const toRad = (value) => (value * Math.PI) / 180;

    const R = 6371; // Earth's radius in KM
    const lat1 = shopCoords.lat;
    const lon1 = shopCoords.lng;
    const lat2 = userCoords.lat;
    const lon2 = userCoords.lng;

    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRad(lat1)) *
        Math.cos(toRad(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return (R * c).toFixed(2);
  }

  const findAverageRating = (ratings) => {
    if (!ratings || ratings.length === 0) return 0;

    const total = ratings.reduce((acc, rating) => acc + rating.rate, 0);
    return (total / ratings.length).toFixed(1);
  };

  return (
    <div>
      <div style={{ height: "400px", width: "100%" }}>
        <MapContainer
          center={[latitude, longitude]}
          zoom={13}
          style={{ height: "100%", width: "100%" }}
        >
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          <LocationPicker onLocationSelect={handleLocationSelect} />
          <FlyToLocation coordinates={coordinates} />
          <FlyToUser position={position} />
          {position && <Marker position={position} icon={customIcon} />}
          {/* {position && (
            <Circle
              center={position}
              radius={1000}
              pathOptions={{
                color: "red",
                fillColor: "blue",
                fillOpacity: 0.1,
              }}
            />
          )} */}
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
          marginTop: "-35px",
          height: "400px",
          borderTopLeftRadius: "25px",
          borderTopRightRadius: "20px",
          border: "1px solid #ddd",
          padding: "20px",
        }}
      >
        {" "}
        <span
          className="mt-4"
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
          className="d-flex align-items-center mt-2"
          onClick={() => setChooseLocationModal(true)}
        >
          <i
            className="fa-solid fa-street-view text-danger me-3"
            style={{ fontSize: "25px" }}
          ></i>
          <p style={{ fontSize: "16px", marginBottom: "-10px" }}>
            {areaName
              ? areaName.length > 58
                ? areaName.slice(0, 58) + "..."
                : areaName
              : "No location found! please click on me to update your location"}
          </p>
        </div>
        <div style={{ marginTop: "17px" }}>
          <div>
            <select
              className="form-select mb-2 bg-info"
              value={selectedCategory}
              onChange={handleCategoryChange}
            >
              <option value="">Select Category</option>
              {services.map((cat, index) => (
                <option key={index} value={cat.category}>
                  {cat.category}
                </option>
              ))}
            </select>
            <select
              className="form-select mb-3 bg-info"
              value={selectedSubCategory}
              onChange={(e) => {
                setSelectedSubCategory(e.target.value);
              }}
              disabled={!selectedCategory}
            >
              <option value="">Select Sub-category</option>
              {services
                .find((cat) => cat.category === selectedCategory)
                ?.subcategories.map((sub, index) => (
                  <option key={index} value={sub}>
                    {sub}
                  </option>
                ))}
            </select>
          </div>
        </div>
        <p
          style={{ fontSize: "16px", color: "#333", fontWeight: 500 }}
          className="text-center mb-0"
        >
          <i
            className="fas fa-motorcycle"
            style={{ color: "#ff9800", marginRight: "5px" }}
          ></i>
          Service Charges:
          <span
            style={{ color: "#007bff", fontWeight: "bold", marginLeft: "5px" }}
          >
            Rs. 15/km
          </span>
        </p>
        <button
          className="btn btn-success mt-1"
          onClick={findServicesProvider}
          disabled={loading}
        >
          {loading ? (
            <>
              <div class="spinner-grow" role="status">
                <span class="visually-hidden">Searching...</span>
              </div>
            </>
          ) : (
            <>
              <i class="fa-solid fa-screwdriver-wrench me-2"></i>Find Services
              Provider
            </>
          )}
        </button>
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
                <h5 className="modal-title">Choose Address</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setChooseLocationModal(false)}
                ></button>
              </div>
              <div
                className="modal-body"
                style={{ maxHeight: "550px", overflowY: "auto" }}
              >
                {userLocations.length > 0 ? (
                  <>
                    <div className="form-floating mb-3">
                      <textarea
                        className="form-control mt-1"
                        name="currentLocation"
                        id="currentLocationInput"
                        placeholder="Your Current Location"
                        value={`${areaName} (${locationName})`}
                        style={{ height: "100px" }}
                        disabled={true}
                      ></textarea>
                      <label htmlFor="currentLocationInput">
                        Selected Address (Current)
                      </label>
                    </div>
                    <hr />
                    <h3 className="text-center">Manage Your Addresses</h3>
                    <p className="text-center text-muted">
                      Choose your preferred address from the list below for
                      quick access. You can also add a new address by clicking
                      the <strong>"Add Address"</strong> button below.
                    </p>

                    <div className="row g-3">
                      {userLocations.map((location, index) => (
                        <div className="col-12" key={index}>
                          <div
                            className="card shadow-sm border-0 rounded-3 locationCard bg-info"
                            onClick={() => setSelectedLocation(location)}
                          >
                            <div className="card-body d-flex justify-content-between align-items-center">
                              <div>
                                <h6 className="fw-bold mb-1 text-light">
                                  <i className="fa-solid fa-location-dot me-2 text-danger"></i>
                                  {location.name}
                                </h6>
                                <p
                                  className="mb-0 text-muted"
                                  style={{ fontSize: "14px" }}
                                >
                                  {location.area}
                                </p>
                              </div>
                              <button
                                className="btn btn-outline-danger btn-sm"
                                onClick={() => deleteUserLocation(location)}
                              >
                                {loading ? (
                                  <>
                                    <div
                                      className="spinner-border spinner-border-sm text-light ms-2"
                                      role="status"
                                    ></div>
                                  </>
                                ) : (
                                  <>
                                    <i className="fa-solid fa-trash"></i>
                                  </>
                                )}
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                ) : (
                  <div
                    className="d-flex flex-column justify-content-center align-items-center text-center"
                    style={{ height: "65vh", marginTop: "-65px" }}
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
                )}
                <div>
                  <button
                    className="btn btn-success w-100 mt-3"
                    onClick={() => setSaveLocationsModal(true)}
                  >
                    <i class="fa-solid fa-map-location-dot me-2"></i>
                    Add Address
                  </button>
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
      {saveLocationsModal && (
        <div
          className="modal fade show d-block"
          tabIndex="-1"
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
        >
          <div className="modal-dialog modal-lg modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Add Address</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setSaveLocationsModal(false)}
                ></button>
              </div>
              <div className="modal-body" style={{ height: "auto" }}>
                <div className="form-floating mb-3">
                  <input
                    type="text"
                    className="form-control"
                    name="name"
                    id="nameInput"
                    value={locationName}
                    onChange={(e) => setLocationName(e.target.value)}
                    placeholder="Enter your name"
                    required
                  />
                  <label htmlFor="nameInput">Name</label>
                </div>
                <div className="form-floating mb-3">
                  <textarea
                    className="form-control mt-1"
                    name="currentLocation"
                    id="currentLocationInput"
                    placeholder="Your Current Location"
                    value={areaName}
                    style={{ height: "100px" }}
                    disabled={true}
                  ></textarea>
                  <label htmlFor="currentLocationInput">Current Location</label>
                </div>
                <div
                  style={{ height: "350px", width: "100%", marginTop: "2px" }}
                >
                  <MapContainer
                    center={[latitude, longitude]}
                    zoom={13}
                    style={{ height: "100%", width: "100%" }}
                  >
                    <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                    <LocationPicker onLocationSelect={handleLocationSelect} />
                    {position && (
                      <Marker position={position} icon={customIcon} />
                    )}
                  </MapContainer>
                </div>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setSaveLocationsModal(false)}
                >
                  Close
                </button>
                <button
                  type="button"
                  className="btn btn-success"
                  onClick={handleSaveLocation}
                >
                  {loading ? (
                    <>
                      Saving...
                      <div
                        className="spinner-border spinner-border-sm text-light ms-2"
                        role="status"
                      ></div>
                    </>
                  ) : (
                    <>
                      <i class="fa-solid fa-map-location-dot me-2"></i>
                      Save Address
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {subCatModal && (
        <div
          className="modal fade show d-block"
          tabIndex="-1"
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
        >
          <div className="modal-dialog modal-fullscreen modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Available Services</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setSubCatModal(false)}
                ></button>
              </div>
              <div className="modal-body " style={{ height: "auto" }}>
                <div
                  className="d-flex flex-nowrap overflow-auto mb-3 mt-0"
                  style={{ gap: "10px", padding: "10px 0" }}
                  
                >
                  {/* Filter Icon */}
          

                  {/* Sort by Price */}
                  <div className="dropdown position-static">
                    <button
                      className="btn btn-outline-primary dropdown-toggle btn-sm rounded-pill px-2"
                      type="button"
                      data-bs-toggle="dropdown"
                      aria-expanded="false"
                    >
                      <i className="fa-solid fa-tag me-1"></i> Price
                    </button>
                    <ul className="dropdown-menu">
                      {[
                        "All",
                        "Under Rs. 500",
                        "Rs. 500-1000",
                        "Rs. 1000-2000",
                        "Above Rs. 2000",
                      ].map((range, i) => (
                        <li key={i}>
                          <button className="dropdown-item">{range}</button>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Rating */}
                  <div className="dropdown position-static">
                    <button
                      className="btn btn-outline-success dropdown-toggle btn-sm rounded-pill px-2"
                      type="button"
                      data-bs-toggle="dropdown"
                      aria-expanded="false"
                    >
                      <i className="fa-solid fa-star me-1"></i> Rating
                    </button>
                    <ul className="dropdown-menu">
                      {["All Ratings", "5 Stars", "4+ Stars", "3+ Stars"].map(
                        (rate, i) => (
                          <li key={i}>
                            <button className="dropdown-item">{rate}</button>
                          </li>
                        )
                      )}
                    </ul>
                  </div>

                  {/* Distance */}
                  <div className="dropdown position-static">
                    <button
                      className="btn btn-outline-warning dropdown-toggle btn-sm rounded-pill px-2"
                      type="button"
                      data-bs-toggle="dropdown"
                      aria-expanded="false"
                    >
                      <i className="fa-solid fa-location-dot me-1"></i> Distance
                    </button>
                    <ul className="dropdown-menu">
                      {[
                        "All",
                        "Within 1 km",
                        "1-5 km",
                        "5-10 km",
                        "10+ km",
                      ].map((range, i) => (
                        <li key={i}>
                          <button className="dropdown-item">{range}</button>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Availability */}
                  <div className="dropdown position-static">
                    <button
                      className="btn btn-outline-info dropdown-toggle btn-sm rounded-pill px-2"
                      type="button"
                      data-bs-toggle="dropdown"
                      aria-expanded="false"
                    >
                      <i className="fa-solid fa-clock me-1"></i> Availability
                    </button>
                    <ul className="dropdown-menu">
                      {[
                        "All",
                        "Open Now",
                        "Morning",
                        "Afternoon",
                        "Evening",
                      ].map((time, i) => (
                        <li key={i}>
                          <button className="dropdown-item">{time}</button>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Featured Shops */}
                  <button className="btn btn-outline-dark rounded-pill btn-sm text-nowrap">
                    <i className="fa-solid fa-crown me-1 text-warning"></i>{" "}
                    Featured
                  </button>
                </div>

                {availableServices.length > 0 ? (
                  <div className="row g-3">
                    {availableServices.map((shop, index) => {
                      const shopCoords = {
                        lat: shop?.location?.coordinates[0],
                        lng: shop?.location?.coordinates[1],
                      };
                      const userCoords = {
                        lat: coordinates[0],
                        lng: coordinates[1],
                      };
                      const distance = getDistanceFromCoordinates(
                        shopCoords,
                        userCoords
                      );
                      const averageRating = findAverageRating(shop.reviews);
                      return (
                        <div className="col-12 col-md-6 col-lg-4" key={index}>
                          <div className="card shadow-sm border-1 rounded-4 overflow-hidden" >
                            <div className="card-body ">
                              <div className="d-flex align-items-center">
                                {/* Shop Image */}
                                <div
                                  className="rounded-circle border flex-shrink-0 d-flex align-items-center justify-content-center bg-light"
                                  style={{
                                    width: "100px",
                                    height: "100px",
                                    overflow: "hidden",
                                    cursor: "pointer",
                                    
                                  }}
                                  onClick={()=>getShopWithShopkeppers(shop)}
                                >
                                  <img
                                    src={
                                      shop.shopPicture || "/default-image.jpg"
                                    }
                                    alt="Shop"
                                    style={{
                                      objectFit: "cover",
                                      width: "100%",
                                      height: "100%",
                                    }}
                                  />
                                </div>

                                {/* Shop Details */}
                                <div className="ms-3 flex-grow-1">
                                  {/* Shop name and rating */}
                                  <div className="d-flex justify-content-between align-items-center mb-1">
                                    <p
                                      className="text-dark fw-semibold mb-0 text-truncate"
                                      style={{ maxWidth: "70%" , cursor: "pointer" }}
                                      title={shop.shopName}
                                      onClick={()=>getShopWithShopkeppers(shop)}
                                    >
                                      {shop.shopName.length > 10
                                        ? `${shop.shopName.slice(0, 10)}...`
                                        : shop.shopName}
                                    </p>
                                    <p className="mb-0 text-muted small d-flex align-items-center">
                                      <i className="fa-solid fa-star text-warning me-1"></i>
                                      <strong>{averageRating}</strong>/5
                                    </p>
                                  </div>

                                  {/* Price */}
                                  {shop.servicesOffered
                                    .filter(
                                      (service) =>
                                        service.subCategory?.name ===
                                        selectedSubCategory
                                    )
                                    .map((service, index) => (
                                      <p
                                        key={index}
                                        className="mb-0 text-primary fw-bold"
                                        style={{ fontSize: "15px" }}
                                      >
                                        Rs. {service.subCategory.price}/-
                                      </p>
                                    ))}

                                  {/* Distance */}
                                  <p className="mb-0 text-muted small">
                                    <b>{distance}</b> km away
                                  </p>
                                  <div className="d-flex justify-content-start gap-1 mt-1">
                                    <button className="btn btn-success btn-sm w-100" onClick={()=>addTocart(shop)}><i class="fa-solid fa-cart-plus me-1"></i>Add to cart</button>
                              
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <h1>No services</h1>
                )}
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setSubCatModal(false)}
                >
                  Close
                </button>
                 {
                  cartData.length > 0 && (
                     <button
                  type="button"
                  className="btn btn-success"
                  onClick={() => setSubCatModal(false)}
                    
                  
                >
                  <i class="fa-solid fa-cart-shopping me-1"></i>
                  View Cart {cartData.length > 0 && `(${cartData.length})`}
                </button>
                  )
                 }
              </div>
               
            </div>
          </div>
        </div>
      )}

      {
        infoModal  && (
          <UserInfoModal singleUserData ={selectedShopWithShopkepper} setDetailsModal ={setInfoModal}/>
        )
      }
    </div>
  );
}

export default UserDashboard;
