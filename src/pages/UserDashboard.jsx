import React, { useState, useEffect } from "react";
import axios from "axios";
import location from "../images/location.png";
import "./style.css";
import noData from "../images/noData.png";
import { useNavigate } from "react-router-dom";
import notFound from "../videos/notFound.mp4";
import Swal from "sweetalert2";
import MyMap from "../components/MyMap";

import { services } from "../components/servicesData";
import UserShopRoute from "../components/UserShopRoute";
function UserDashboard({
  setUpdateAppjs,
  cartData,
  areaName,
  setAreaName,
  setCoordinates,
}) {
  const token = localStorage.getItem("token");
  const [shopAddressModal, setShopAddressModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [chooseLocationModal, setChooseLocationModal] = useState(false);
  const [userLocations, setUserLocations] = useState([]);
  const [saveLocationsModal, setSaveLocationsModal] = useState(false);
  const [filterModal, setFilterModal] = useState(false);
  const [subCatModal, setSubCatModal] = useState(false);
  const [locationName, setLocationName] = useState("");
  const [selectedSubCategory, setSelectedSubCategory] = useState(null);
  const [selectedArea, setSelectedArea] = useState(null);
  const [shopDistance, setShopDistance] = useState(null);
  const [routeInfo, setRouteInfo] = useState(null);

  const [selectedCategory, setSelectedCategory] = useState(null);
  const [availableServices, setAvailableServices] = useState([]);
  const [allRequests, setAllRequests] = useState([]);
  const [page, setPage] = useState(0);
  const [selectedShopWithShopkepper, setSelectedShopWithShopkepper] =
    useState(null);
  const [infoModal, setInfoModal] = useState(false);
  const navigate = useNavigate();

  const user = JSON.parse(sessionStorage.getItem("user"));

  const [distanceRange, setDistanceRange] = useState(10);
  const [isFilter, setIsFilter] = useState(false);
  const [notFoundModal, setNotFoundModal] = useState(false);
  const [addCartLoading, setAddCartLoading] = useState(null);
  const [detailLoading, setDetailLoading] = useState(null);

  const [filterText, setFilterText] = useState("");
  const [FilterServices, setFilterServices] = useState([]);
  const [filters, setFilters] = useState({
    status: "All",
    price: "All",
    rating: "All",
    distance: "All",
  });
  const handleFilterChange = (type, value) => {
    console.log("type", type, "option", value);

    setFilters((prev) => ({ ...prev, [type.toLowerCase()]: value }));
  };

  const reviews = selectedShopWithShopkepper?.shop?.reviews || [];
  const reviewsPerPage = 4;
  const startIndex = page * reviewsPerPage;
  const currentReviews = reviews.slice(startIndex, startIndex + reviewsPerPage);

  const handleNextPage = () => {
    console.log(currentReviews);

    if (startIndex + reviewsPerPage < reviews.length) {
      setPage((prev) => prev + 1);
    }
  };
  const handleBackPage = () => {
    if (page > 0) {
      setPage((prev) => prev - 1);
    }
  };

  const handleOpenFilter = (e, filterType) => {
    e.preventDefault();
    setFilterModal(true);
    setFilterText(filterType);
  };

  const addToCart = async (shop, from) => {
    const shopStatus =
      from === "detail"
        ? selectedShopWithShopkepper?.shop?.isLive
        : shop.isLive;
    if (!shopStatus) {
      const result = await Swal.fire({
        title: "This provider is offline",
        html: `<p class="mb-1">
             The shop <strong>${
               shop.shopName || selectedShopWithShopkepper?.shop?.shopName
             }</strong> is currently not live.
           </p>
           <p class="text-muted">
             Don’t worry— your request will be sent, and when the provider comes online, 
             they will contact you shortly.
           </p>`,
        icon: "info",
        showCancelButton: true,
        confirmButtonColor: "#28a745",
        cancelButtonColor: "#6c757d",
        confirmButtonText: "Yes, Add to cart",
        cancelButtonText: "Cancel",
      });

      if (!result.isConfirmed) return;
    }
    if (from === "detail") {
      setAddCartLoading(shop._id);
    } else {
      setAddCartLoading(shop._id);
    }

    let finalShopId, finalCategory, finalSubCategory, finalPrice, finalShopName;

    if (from === "detail") {
      finalShopId = selectedShopWithShopkepper?.shop?._id;
      finalCategory = shop.category;
      finalSubCategory = shop.subCategory.name;
      finalPrice = shop.subCategory.price;
      finalShopName = selectedShopWithShopkepper?.shop?.shopName;
    } else {
      const selectedService = shop.servicesOffered.find(
        (service) => service.subCategory.name === selectedSubCategory
      );

      if (!selectedService) {
        alert("Service not found in this shop");
        setAddCartLoading(null);
        return;
      }

      finalShopId = shop._id;
      finalCategory = selectedService.category;
      finalSubCategory = selectedService.subCategory.name;
      finalPrice = selectedService.subCategory.price;
      finalShopName = shop.shopName;
    }

    const payload = {
      shopId: finalShopId,
      category: finalCategory,
      subCategory: finalSubCategory,
      shopName: finalShopName,
      price: finalPrice,
    };

    const exists = cartData?.items?.some(
      (item) =>
        item.shopId === payload.shopId &&
        item.subCategory === payload.subCategory
    );

    if (exists) {
      alert("This item is already in the cart");
      setAddCartLoading(null);
      return;
    }

    try {
      const response = await axios.post(
        "https://hazir-hay-backend.vercel.app/cart/saveCartData",
        payload,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.data.success) {
        console.log("Cart saved in DB:", response.data);
        setAddCartLoading(null);
        setUpdateAppjs(true);
        alert("Item added to cart");
      }
    } catch (error) {
      console.error(
        "Error saving to cart:",
        error.response?.data || error.message
      );
      alert("Failed to save cart item. Please try again.");
      setAddCartLoading(null);
    }
  };

  const getAllRequests = async () => {
    try {
      const response = await axios.get(
        "https://hazir-hay-backend.vercel.app/requests/getAllRequests",
        {
          headers: { Authorization: `Bearer ${token}` },
          params: { t: Date.now() }, // Prevent caching
        }
      );
      if (response.data.success) {
        setAllRequests(response.data.data || []);
        console.log("All Requests", response.data.data);
      } else {
        console.error("Failed to fetch requests");
        setAllRequests([]);
      }
    } catch (error) {
      console.log("Error fetching requests:", error.message);
    }
  };
  useEffect(() => {
    getAllRequests();
  }, []);

  const findRatio = (id, type) => {
    if (!allRequests || allRequests.length === 0) return 0;
    console.log("allRequests", allRequests);
    console.log("id", id);

    const Totalrequest = allRequests.filter((req) => req.shopOwnerId === id);
    const acceptedRequests = Totalrequest.filter(
      (req) => req.status === "completed"
    );
    const rejectedRequests = Totalrequest.filter(
      (req) => req.status === "rejected" ||  req.status === "deleted"
    );
    console.log("Totalrequest", Totalrequest);
    console.log("acceptedRequests", acceptedRequests);
    console.log("rejectedRequests", rejectedRequests);

    if (type === "accepted") {
      const ratio = (acceptedRequests.length / Totalrequest.length) * 100;
      return ratio.toFixed(0);
    } else if (type === "rejected") {
      const ratio = (rejectedRequests.length / Totalrequest.length) * 100;
      return ratio.toFixed(0);
    } else {
      return Totalrequest.length;
    }
  };

  const getShopWithShopkeppers = async (provider) => {
    setDetailLoading(provider._id);
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
        const shopWithShopkeppers = response.data.data || [];
        console.log("All shops with shopkeepers:", shopWithShopkeppers);
        console.log("Selected provider:", provider);

        // Convert ObjectId to string for accurate comparison
        const selected = shopWithShopkeppers.find(
          (serviceProvider) =>
            serviceProvider?.shop?.owner?.toString() ===
            provider?.owner?._id?.toString()
        );
        setDetailLoading(false);
        console.log("Selected shop with shopkeeper:", selected);

        console.log("Selected shop with shopkeeper:", selected);

        setSelectedShopWithShopkepper(selected);
        setInfoModal(true);
      }
    } catch (error) {
      console.error("Error fetching shopkeepers with shops:", error);
      setDetailLoading(false);
    } finally {
      setDetailLoading(false);
    }
  };

  const findServicesProvider = async () => {
    setLoading(true);

    if (selectedCategory === null) {
      alert("Please select a category");
      setLoading(false);
      return;
    }
    if (selectedSubCategory === null) {
      alert("Please select a subCategory");
      setLoading(false);
      return;
    }
    if (selectedArea === null) {
      alert("Please select a Location");
      setLoading(false);
      return;
    }
    try {
      const response = await axios.get(
        "https://hazir-hay-backend.vercel.app/shops/shopsDataByCategory",
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
        setLoading(false);
        console.log("Providers found:", response.data.data);
        setAvailableServices(response.data.data || []);
        alert("Service Providers Found");
        setSubCatModal(true);
      } else {
        setLoading(false);
        console.warn(response.data.message);
      }
    } catch (error) {
      setLoading(false);

      if (error.response && error.response.status === 404) {
        setNotFoundModal(true); // ✅ open modal here
      } else {
        console.error(
          "Error fetching providers:",
          error.response?.data?.message || error.message
        );
      }

      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...availableServices];

    if (filters.status !== "All") {
      filtered = filtered.filter((shop) =>
        filters.status === "Online" ? shop.isLive : !shop.isLive
      );
    }

    // Price filter
    if (filters.price === "Low-to-High") {
      filtered.sort((a, b) => {
        const minA = Math.min(
          ...a.servicesOffered.map((s) => s.subCategory.price)
        );
        const minB = Math.min(
          ...b.servicesOffered.map((s) => s.subCategory.price)
        );
        return minA - minB;
      });
    } else if (filters.price === "High-to-Low") {
      filtered.sort((a, b) => {
        const maxA = Math.max(
          ...a.servicesOffered.map((s) => s.subCategory.price)
        );
        const maxB = Math.max(
          ...b.servicesOffered.map((s) => s.subCategory.price)
        );
        return maxB - maxA;
      });
    }

    // Rating filter
    if (filters.rating !== "All") {
      filtered = filtered.filter(
        (shop) => findAverageRating(shop.reviews) >= parseInt(filters.rating)
      );
    }

    setFilterServices(filtered);
    console.log(filtered);
  };

  useEffect(() => {
    applyFilters();
  }, [filters, availableServices]);

  const getUserLocations = async () => {
    try {
      const response = await axios.get(
        `https://hazir-hay-backend.vercel.app/users/getUserById/${user._id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
          params: { t: Date.now() },
        }
      );

      if (response.data.success) {
        setUserLocations(response.data.data.location || []);
        console.log("ShopLocation", response.data.data.location);

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
    setSelectedArea({
      lat: location.coordinates[0],
      lng: location.coordinates[1],
      areaName: location.area,
    });
  };
  const handleSaveLocation = async () => {
    setLoading(true);
    if (locationName === "") {
      alert("Location Name Cannot be Empty");
      return;
    }

    const payload = {
      name: locationName,
      coordinates: [selectedArea?.lat, selectedArea?.lng],
      area: selectedArea?.areaName,
    };

    try {
      const response = await axios.post(
        `https://hazir-hay-backend.vercel.app/users/addUserLocation/${user._id}`,
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
        `https://hazir-hay-backend.vercel.app/users/deleteUserLocation/${location._id}`,
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
        // setVerifiedShops(shops);
        const liveShops = shops.filter((shop) => shop?.isLive === true);
        // setVerifiedLiveShops(liveShops);
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

  const handleCategoryChange = (e) => {
    setSelectedCategory(e.target.value);
    setSelectedSubCategory("");
  };

  // Calculate distance between two coordinates in kilometers
  async function getDistance(userCoords, shopCoords) {
    console.log("shopCoordsdd", shopCoords);

    if (!shopCoords || shopCoords.length < 2)
      return { distance: null, duration: null };
    const accessToken =
      "pk.eyJ1Ijoic3llZGJ1cmhhbmFsaTI4MTIiLCJhIjoiY21mamM0NjZiMHg4NTJqczRocXhvdndiYiJ9.Z4l8EQQ47ejlWdVGcimn4A";
    const url = `https://api.mapbox.com/directions/v5/mapbox/driving/${userCoords[0]},${userCoords[1]};${shopCoords[0]},${shopCoords[1]}?access_token=${accessToken}&overview=false`;

    const res = await axios.get(url);
    const route = res.data.routes[0];

    if (!res.data.routes || res.data.routes.length === 0) {
      console.warn("No route found for:", shopCoords);
      return { distance: null, duration: null };
    }

    return {
      distance: (route.distance / 1000).toFixed(2), // km
      duration: (route.duration / 60).toFixed(0), // minutes
    };
  }

  const findAverageRating = (ratings) => {
    if (!ratings || ratings.length === 0) return 0;

    const total = ratings.reduce((acc, rating) => acc + rating.rate, 0);
    return (total / ratings.length).toFixed(1);
  };
  console.log("Selected area", selectedArea);

  const userCoords = [
    selectedArea?.lng || 73.04732533048735,
    selectedArea?.lat || 33.69832701012015,
  ];
  console.log("UserCords", userCoords);

  useEffect(() => {
    if (selectedShopWithShopkepper) {
      const shop = shopData.find(
        (shop) => shop._id === selectedShopWithShopkepper.shop._id
      );
      console.log("shopData", shopData);
      console.log("selectedShop", selectedShopWithShopkepper);
      console.log("shop", shop);

      setShopDistance(shop.distance);
    }
  }, [selectedShopWithShopkepper]);

  const priceRangeOptions = ["All", "Low-to-High", "High-to-Low"];
  const ratingRangeOptions = ["All", "1", "2", "3", "4", "5"];
  const statusOptions = ["All", "Online", "Offline"];

  const finalServices = isFilter ? FilterServices : availableServices;
  console.log("finalServices", finalServices);

  async function calculateDistances() {
    console.log("Calculating distances for shops:", finalServices);

    const shopDistances = await Promise.all(
      finalServices.map(async (shop) => {
        console.log("Processing shop:", shop);
        const coords = shop?.location?.coordinates;
        if (!coords) {
          console.warn("No coordinates for shop", shop);
          return { ...shop, distance: null, duration: null };
        }
        const shopCoords = [coords[1], coords[0]];
        const { distance, duration } = await getDistance(
          userCoords,
          shopCoords
        );
        return { ...shop, distance, duration };
      })
    );

    console.log("shopDistances", shopDistances);
    return shopDistances;
  }

  const [shopData, setShopData] = useState([]);
  useEffect(() => {
    if (!finalServices || finalServices.length === 0) return;

    async function fetchDistances() {
      const result = await calculateDistances();
      console.log("shoppppppppppsss", result);

      setShopData(result);
      console.log("ShopData for distance", result);
    }

    fetchDistances();
  }, [finalServices, selectedArea]); // <- dependency array

  const completeOrderRatioSelectedShop = findRatio(
    selectedShopWithShopkepper?.shop?.owner,
    "accepted"
  );
  console.log("completeOrderRatioSelectedShop", completeOrderRatioSelectedShop);
  const rejectedRatio = findRatio(
    selectedShopWithShopkepper?.shop?.owner,
    "rejected"
  );
  console.log("rejectedRatio", rejectedRatio);
  const totalRequests = findRatio(
    selectedShopWithShopkepper?.shop?.owner,
    "total"
  );
  console.log("totalRequests", totalRequests);

  return (
    <div>
      <form onSubmit={(e) => e.preventDefault()}>
        <div style={{ height: "420px", width: "100%" }}>
          <MyMap
            onLocationSelect={setSelectedArea}
            initialLocation={selectedArea}
          />
        </div>
      </form>
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
            backgroundColor: "#FFE4E1",
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
            className="fa-solid fa-street-view text-success me-3"
            style={{ fontSize: "25px" }}
          ></i>
          <p style={{ fontSize: "16px", marginBottom: "-10px" }}>
            {selectedArea?.areaName
              ? selectedArea.areaName.length > 58
                ? selectedArea.areaName.slice(0, 58) + "..."
                : selectedArea.areaName
              : "No location found! please click on me to update your location"}
          </p>
        </div>
        <div style={{ marginTop: "17px" }}>
          <div>
            <select
              style={{ background: "#FFE4E1" }}
              className="form-select mb-2"
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
              style={{ background: "#FFE4E1" }}
              className="form-select mb-3 "
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
            style={{ fontWeight: "bold", marginLeft: "5px" }}
            className="text-success"
          >
            Rs. 15-25/km
          </span>
        </p>
        <button
          className="btn btn-success mt-1"
          onClick={findServicesProvider}
          disabled={loading}
        >
          {loading ? (
            <>
              Searching...
              <div
                className="spinner-border spinner-border-sm text-light ms-2"
                role="status"
              ></div>
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
                        value={`${selectedArea?.areaName} (${locationName})`}
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
                    <button
                      className="btn btn-success w-100 mb-3"
                      onClick={() => setSaveLocationsModal(true)}
                    >
                      <i class="fa-solid fa-map-location-dot me-2"></i>
                      Add Address
                    </button>

                    <div className="row g-3">
                      {userLocations.map((location, index) => (
                        <div className="col-12" key={index}>
                          <div
                            className="card shadow-sm border-0 rounded-3 locationCard "
                            onClick={() => setSelectedLocation(location)}
                            style={{ background: "#FFE4E1" }}
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

                    <button
                      className="btn btn-success"
                      onClick={() => setSaveLocationsModal(true)}
                    >
                      <i class="fa-solid fa-map-location-dot me-2"></i>
                      Add Address
                    </button>
                  </div>
                )}
                <div></div>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setChooseLocationModal(false)}
                >
                  Save
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
                    value={selectedArea?.areaName}
                    style={{ height: "100px" }}
                    disabled={true}
                  ></textarea>
                  <label htmlFor="currentLocationInput">Current Location</label>
                </div>
                <form onSubmit={(e) => e.preventDefault()}>
                  <div
                    style={{ height: "350px", width: "100%", marginTop: "2px" }}
                  >
                    <MyMap
                      onLocationSelect={setSelectedArea}
                      initialLocation={selectedArea}
                    />
                  </div>
                </form>
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
              <div className="modal-header d-flex justify-content-between">
                <div className="d-flex mt-1">
                  <i
                    class="fa-solid fa-circle-chevron-left mt-1"
                    style={{ fontSize: "18px" }}
                    onClick={() => setSubCatModal(false)}
                  ></i>
                  <h5 className="ms-2  fw-bold">Available Services</h5>
                </div>

                <div className="position-relative d-inline-block me-2">
                  <i
                    className="fa-solid fa-cart-shopping"
                    style={{ fontSize: "25px" }}
                    onClick={() => {
                      setSubCatModal(false);
                      navigate("/admin/user/cart");
                    }}
                  ></i>
                  <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
                    {cartData?.items?.length || 0}
                    <span className="visually-hidden">unread messages</span>
                  </span>
                </div>
              </div>

              <div className="modal-body" style={{ height: "auto" }}>
                <div
                  className="d-flex flex-nowrap overflow-auto mb-3"
                  style={{ gap: "10px", padding: "10px 0" }}
                >
                  <i
                    class="fa-solid fa-sliders mt-2 ms-2"
                    style={{ fontSize: "18px" }}
                  ></i>
                  <button
                    className="btn btn-outline-dark rounded-pill btn-sm text-nowrap"
                    onClick={(e) => handleOpenFilter(e, "Status")}
                  >
                    <i class="fa-solid fa-wifi me-1"></i>
                    Status: {filters.status}{" "}
                    <i class="fa-solid fa-caret-down"></i>
                  </button>
                  <button
                    className="btn btn-outline-success rounded-pill btn-sm text-nowrap"
                    onClick={(e) => handleOpenFilter(e, "Distance")}
                  >
                    <i className="fa-solid fa-location-dot me-1"></i>
                    Distance: {filters.distance}{" "}
                    <i class="fa-solid fa-caret-down"></i>
                  </button>
                  <button
                    className="btn btn-outline-primary rounded-pill btn-sm text-nowrap"
                    onClick={(e) => handleOpenFilter(e, "Price")}
                  >
                    <i class="fa-solid fa-tags me-1"></i>
                    Price: {filters.price}{" "}
                    <i class="fa-solid fa-caret-down"></i>
                  </button>
                  <button
                    className="btn btn-outline-warning rounded-pill btn-sm text-nowrap"
                    onClick={(e) => handleOpenFilter(e, "Rating")}
                  >
                    <i class="fa-solid fa-star me-1"></i>
                    Rating: {filters.rating}{" "}
                    <i class="fa-solid fa-caret-down"></i>
                  </button>
                </div>

                {shopData.length > 0 ? (
                  <div className="row g-4">
                    {shopData.map((shop, index) => {
                      const averageRating = findAverageRating(shop.reviews);
                      const acceptedRatio = findRatio(
                        shop?.owner?._id,
                        "accepted"
                      );
                      const rejectedRatio = findRatio(
                        shop?.owner?._id,
                        "rejected"
                      );
                       const totalOrders = findRatio(
                        shop?.owner?._id,
                        "total"
                      );

                      return (
                        <div className="col-12 col-md-6 col-lg-4" key={index}>
                          <div className="card shadow-sm border-0 rounded-2 ">
                            <div className="card-body p-3">
                              {/* Header Section */}
                              <div className="d-flex align-items-center mb-3">
                                {/* Shop Image */}
                                <div
                                  className="rounded-circle bg-light border d-flex align-items-center justify-content-center overflow-hidden flex-shrink-0"
                                  style={{
                                    width: "85px",
                                    height: "85px",
                                    cursor: "pointer",
                                  }}
                                >
                                  <img
                                    src={
                                      shop.shopPicture || "/default-image.jpg"
                                    }
                                    alt="Shop"
                                    style={{
                                      width: "100%",
                                      height: "100%",
                                      objectFit: "cover",
                                    }}
                                  />
                                </div>

                                {/* Shop Details */}
                                <div className="ms-3 flex-grow-1">
                                  {/* Shop Name + Rating */}
                                  <div className="d-flex justify-content-between align-items-center mb-1">
                                    <h6
                                      className="fw-semibold text-dark mb-0 text-truncate"
                                      title={shop.shopName}
                                      style={{
                                        maxWidth: "70%",
                                        cursor: "pointer",
                                      }}
                                    >
                                      {shop.shopName.length > 12
                                        ? `${shop.shopName.slice(0, 12)}...`
                                        : shop.shopName}
                                    </h6>

                                    <div className="text-warning small fw-semibold">
                                      <i className="fa-solid fa-star me-1"></i>
                                      {averageRating}/5
                                    </div>
                                  </div>

                                  {/* Price and Distance */}
                                  {shop.servicesOffered
                                    .filter(
                                      (service) =>
                                        service.subCategory?.name ===
                                        selectedSubCategory
                                    )
                                    .map((service, index) => (
                                      <p
                                        key={index}
                                        className="mb-1 fw-semibold text-primary small"
                                      >
                                        Rs. {service.subCategory.price}/-{" "}
                                        <span className="text-muted ms-1">
                                          | {shop.distance} km away
                                        </span>
                                      </p>
                                    ))}

                                  {/* Ratios */}
                                  <div className="d-flex justify-content-between small mt-1">
                                    <span className="fw-bold">
                                      COR:{" "}
                                      <span className="text-success fw-semibold">
                                        {acceptedRatio || 0}%
                                      </span>
                                    </span>
                                    <span className="fw-bold">
                                      ROR:{" "}
                                      <span className="text-danger fw-semibold">
                                        {rejectedRatio || 0}%
                                      </span>
                                    </span>
                                     <span className="fw-bold">
                                      TO:{" "}
                                      <span className="text-primary fw-semibold">
                                        {totalOrders || 0}
                                      </span>
                                    </span>
                                  </div>
                                </div>
                              </div>

                              {/* Action Buttons */}
                              <div className="d-flex justify-content-around mt-2">
                                <button
                                  className={`btn btn-sm px-2  ${
                                    shop.isLive ? "btn-primary" : "btn-danger"
                                  }`}
                                  onClick={() => addToCart(shop, "main")}
                                  disabled={addCartLoading === shop._id}
                                >
                                  {addCartLoading === shop._id ? (
                                    <>
                                      Wait...
                                      <div
                                        className="spinner-border spinner-border-sm text-light ms-2"
                                        role="status"
                                      ></div>
                                    </>
                                  ) : (
                                    <>
                                      <i class="fa-solid fa-cart-plus me-2"></i>
                                      Add to Cart
                                    </>
                                  )}
                                </button>

                                <button
                                  className="btn btn-sm btn-outline-primary px-2   "
                                  onClick={() => getShopWithShopkeppers(shop)}
                                  disabled={detailLoading === shop._id}
                                >
                                  {detailLoading === shop._id ? (
                                    <>
                                      Loading...
                                      <div
                                        className="spinner-border spinner-border-sm text-primary ms-2"
                                        role="status"
                                      ></div>
                                    </>
                                  ) : (
                                    <>
                                      <i class="fa-solid fa-circle-info me-2"></i>
                                      Shop Details
                                    </>
                                  )}
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
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
                      Loading...
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {infoModal && (
        <div
          className="modal fade show d-block"
          tabIndex="-1"
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
        >
          <div className="modal-dialog modal-fullscreen modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header d-flex justify-content-between">
                <div className="d-flex mt-1">
                  <i
                    class="fa-solid fa-circle-chevron-left mt-1"
                    style={{ fontSize: "18px" }}
                    onClick={() => setInfoModal(false)}
                  ></i>
                  <h5 className="ms-2  fw-bold">
                    {selectedShopWithShopkepper?.shop?.shopName}
                  </h5>
                </div>

                <div className="position-relative d-inline-block me-2">
                  <i
                    className="fa-solid fa-cart-shopping"
                    style={{ fontSize: "25px" }}
                    onClick={() => {
                      setSubCatModal(false);
                      navigate("/admin/user/cart");
                    }}
                  ></i>
                  <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
                    {cartData?.items?.length || 0}
                    <span className="visually-hidden">unread messages</span>
                  </span>
                </div>
              </div>
              <div className="modal-body " style={{ height: "auto" }}>
                {/* Shop Image */}
                <div className="d-flex justify-content-center">
                  <div
                    className="rounded-circle border flex-shrink-0 bg-light d-flex align-items-center justify-content-center"
                    style={{
                      width: "130px",
                      height: "130px",
                      overflow: "hidden",
                      cursor: "pointer",
                    }}
                  >
                    <img
                      src={
                        selectedShopWithShopkepper?.shop?.shopPicture ||
                        "/default-image.jpg"
                      }
                      alt="Shop"
                      style={{
                        objectFit: "cover",
                        width: "100%",
                        height: "100%",
                      }}
                    />
                  </div>
                </div>

                <div className="d-flex justify-content-center mt-2 mb-0">
                  <h4 className="text-dark fw-bold mt-1 text-center">
                    {selectedShopWithShopkepper?.shop?.shopName}
                  </h4>
                  <i
                    class="fa-solid fa-circle-check text-success ms-1 mt-2"
                    style={{ fontSize: "20px" }}
                  ></i>
                </div>
                <div className="d-flex justify-content-center align-items-center gap-2">
                  <p className="text-center text-muted">
                    {selectedShopWithShopkepper?.isLive === true
                      ? "Online"
                      : "Offline"}
                  </p>
                  {shopDistance && (
                    <p className="text-center text-muted ">
                      | <b>{shopDistance}</b> km away
                    </p>
                  )}
                </div>
               <div className="d-flex flex-wrap align-items-center justify-content-between bg-light p-3 rounded-4 shadow-sm border mb-3">
  {/* COR */}
  <div className="d-flex align-items-center me-3 mb-2">
    <i className="fa-solid fa-circle-check text-success me-2"></i>
    <span className="text-secondary small fw-semibold">
      Complete Order Ratio (COR):{" "}
      <span className="text-success fw-bold">
        {completeOrderRatioSelectedShop ? completeOrderRatioSelectedShop : 0}%
      </span>
    </span>
  </div>

  {/* ROR */}
  <div className="d-flex align-items-center me-3 mb-2">
    <i className="fa-solid fa-circle-xmark text-danger me-2"></i>
    <span className="text-secondary small fw-semibold">
      Rejected Order Ratio (ROR):{" "}
      <span className="text-danger fw-bold">
        {rejectedRatio ? rejectedRatio : 0}%
      </span>
    </span>
  </div>

  {/* TO */}
  <div className="d-flex align-items-center mb-2">
    <i className="fa-solid fa-box text-primary me-2"></i>
    <span className="text-secondary small fw-semibold">
      Total Orders (TO):{" "}
      <span className="text-primary fw-bold">
        {totalRequests ? totalRequests : 0}
      </span>
    </span>
  </div>
</div>


                <div className="d-flex justify-content-center gap-2 mt-1">
                  {/* Call Button */}
                  <a
                    href={`tel:${selectedShopWithShopkepper?.phone}`}
                    className="btn btn-info btn-sm text-dark rounded-pill px-2"
                  >
                    <i className="fa-solid fa-phone-volume me-1"></i>Call Now
                  </a>

                  {/* WhatsApp Button */}
                  <a
                    href={`https://wa.me/${`+92${selectedShopWithShopkepper?.phone?.slice(
                      1
                    )}`}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-success btn-sm rounded-pill px-2"
                  >
                    <i
                      className="fa-brands fa-whatsapp me-1"
                      style={{ fontSize: "16px" }}
                    ></i>
                    Whatsapp
                  </a>

                  {/* Live Chat Button */}
                  <button
                    className="btn btn-primary btn-sm rounded-pill px-2"
                    disabled={!selectedShopWithShopkepper?.isLive}
                  >
                    <i className="fa-solid fa-comments me-1"></i>Live Chat
                  </button>
                </div>
                <di className="d-flex justify-content-center mt-2">
                  <button
                    className="btn btn-primary text-light btn-sm rounded-pill"
                    style={{ width: "313px" }}
                    onClick={() => setShopAddressModal(true)}
                  >
                    <i class="fa-solid fa-map-location-dot me-2"></i> Shop
                    Address
                  </button>
                </di>
                <hr />
                <h6 className="bg-info p-2 rounded-3 text-center mb-3">
                  <i class="fa-solid fa-screwdriver-wrench me-2"></i>
                  SERVICES OFFERED
                </h6>

                <div
                  className="table-responsive"
                  style={{ maxHeight: "350px", overflowY: "auto" }}
                >
                  <table className="table table-hover mb-0 text-center">
                    <thead>
                      <tr>
                        <th>#</th>
                        <th>Category</th>
                        <th>Sub Category</th>
                        <th>Price</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedShopWithShopkepper !== null ? (
                        selectedShopWithShopkepper?.shop?.servicesOffered?.map(
                          (sub, index) => (
                            <tr key={index}>
                              <td>{index + 1}</td>
                              <td className="text-nowrap">{sub.category}</td>
                              <td className="text-nowrap">
                                {sub.subCategory.name}
                              </td>
                              <td>{sub.subCategory.price}</td>
                              <td>
                                <button
                                  className="btn btn-outline-primary btn-sm  w-100"
                                  onClick={() => addToCart(sub, "detail")}
                                  disabled={addCartLoading === sub._id}
                                >
                                  {addCartLoading === sub._id ? (
                                    <div
                                      className="spinner-border spinner-border-sm text-dark ms-2"
                                      role="status"
                                    ></div>
                                  ) : (
                                    <i class="fa-solid fa-cart-plus me-1"></i>
                                  )}
                                </button>
                              </td>
                            </tr>
                          )
                        )
                      ) : (
                        <tr>
                          <td colSpan="5" className="text-center">
                            No services found
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
                <h6 className="bg-warning p-2 rounded-3 text-center mt-3">
                  <i className="fa-solid fa-star-half-stroke me-2"></i>
                  RATING & REVIEWS
                </h6>

                <div>
                  {selectedShopWithShopkepper?.shop?.reviews?.length > 0 ? (
                    <>
                      {/* Average rating */}
                      <div
                        className="d-flex align-items-center mb-2 mt-1 justify-content-center"
                        style={{ fontSize: "16px" }}
                      >
                        <i className="fa-solid fa-star text-warning me-2"></i>
                        <span className="fw-bold fs-6">
                          {findAverageRating(
                            selectedShopWithShopkepper?.shop?.reviews
                          )}
                          /5
                        </span>
                        <span className="text-muted ms-2 small">
                          ({selectedShopWithShopkepper?.shop?.reviews.length}{" "}
                          reviews)
                        </span>
                      </div>

                      {/* Reviews list */}
                      <div className="list-group">
                        {currentReviews?.map((review, index) => (
                          <div
                            key={index}
                            className="list-group-item border rounded-3 mb-2 shadow-sm "
                            style={{ backgroundColor: "#F8F8FF" }}
                          >
                            <div className="d-flex justify-content-between align-items-center mb-1">
                              <div>
                                <strong>{review.name}</strong>
                                <i class="fa-solid fa-circle-check text-success"></i>
                              </div>
                              <small className="text-muted">
                                {new Date(review.date).toLocaleDateString()}
                              </small>
                            </div>
                            <p className="mb-1 text-muted small">
                              {review.msg}
                            </p>
                            <div>
                              {[...Array(5)].map((_, i) => (
                                <i
                                  key={i}
                                  className={`fa-solid fa-star ${
                                    i < review.rate
                                      ? "text-warning"
                                      : "text-secondary"
                                  }`}
                                  style={{ fontSize: "13px" }}
                                ></i>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </>
                  ) : (
                    <p className="text-muted text-center">No reviews yet</p>
                  )}
                </div>

                {selectedShopWithShopkepper?.shop?.reviews?.length === 0 ? (
                  ""
                ) : (
                  <div className="d-flex justify-content-center gap-5 mt-3">
                    <button
                      className="btn btn-danger rounded-pill px-3"
                      onClick={handleBackPage}
                      disabled={page === 0}
                    >
                      <i class="fa-solid fa-circle-arrow-left me-2"></i>
                      Back
                    </button>
                    <button
                      className="btn btn-success  rounded-pill px-3"
                      onClick={handleNextPage}
                      disabled={startIndex + reviewsPerPage >= reviews.length}
                    >
                      Next
                      <i class="fa-solid fa-circle-arrow-right ms-2"></i>
                    </button>
                  </div>
                )}
              </div>
              {/* <div className="modal-footer">
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
              </div> */}
            </div>
          </div>
        </div>
      )}

      {filterModal && (
        <div
          className="modal fade show d-block"
          tabIndex="-1"
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
        >
          <div className="modal-dialog modal-sm modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">{filterText} Filter</h5>
                <button
                  className="btn-close "
                  style={{ top: 10, right: 15 }}
                  onClick={() => setFilterModal(false)}
                ></button>
              </div>
              <div className="modal-body" style={{ height: "auto" }}>
                {filterText === "Price" && (
                  <div className="d-flex flex-wrap gap-2 justify-content-center">
                    {priceRangeOptions.map((price, index) => (
                      <button
                        key={index}
                        className="btn btn-outline-primary rounded-pill"
                        onClick={() => handleFilterChange("Price", price)}
                      >
                        {price}
                      </button>
                    ))}
                  </div>
                )}
                {filterText === "Status" && (
                  <div className="d-flex flex-wrap gap-2 justify-content-center">
                    {statusOptions.map((status, index) => (
                      <button
                        key={index}
                        className="btn btn-outline-primary rounded-pill"
                        onClick={() => handleFilterChange("Status", status)}
                      >
                        {status}
                      </button>
                    ))}
                  </div>
                )}
                {filterText === "Rating" && (
                  <div className="d-flex flex-wrap gap-2 justify-content-center">
                    {ratingRangeOptions.map((rate, index) => (
                      <button
                        key={index}
                        className="btn btn-outline-primary rounded-pill"
                        onClick={() => handleFilterChange("Rating", rate)}
                      >
                        {rate}
                      </button>
                    ))}
                  </div>
                )}
                {filterText === "Distance" && (
                  <>
                    <label className="form-label">
                      Distance: <b>{distanceRange}</b> km
                    </label>
                    <input
                      type="range"
                      className="form-range"
                      min={0}
                      max={100}
                      step={10}
                      value={distanceRange}
                      onChange={(e) => setDistanceRange(e.target.value)}
                    />
                  </>
                )}

                <hr />

                <div className="d-flex justify-content-center align-items-center mt-3">
                  <button
                    className="rounded-pill btn btn-primary"
                    onClick={() => {
                      setIsFilter(true);
                      setFilterModal(false);
                    }}
                  >
                    Show Result {FilterServices?.length}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {notFoundModal && (
        <div
          className="modal fade show d-block"
          tabIndex="-1"
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
        >
          <div className="modal-dialog modal-sm modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  Not Found<i class="fa-solid fa-face-frown ms-1"></i>
                </h5>
                <button
                  className="btn-close "
                  style={{ top: 10, right: 15 }}
                  onClick={() => setNotFoundModal(false)}
                ></button>
              </div>
              <div className="modal-body ">
                <div className="d-flex justify-content-center align-items-center">
                  <video
                    src={notFound}
                    autoPlay
                    muted
                    loop
                    style={{
                      width: "250px", // set your width
                      height: "250px", // set your height
                      objectFit: "cover", // keeps aspect ratio nicely
                      borderRadius: "10px", // optional: rounded corners
                    }}
                  />
                </div>

                <div
                  className="alert alert-light text-center shadow-sm mt-3"
                  role="alert"
                >
                  <strong style={{ color: "black" }}>Sorry!</strong> No provider
                  found for{" "}
                  <strong style={{ color: "black" }}>
                    {selectedCategory || "{}"}
                  </strong>{" "}
                  /{" "}
                  <strong style={{ color: "black" }}>
                    {selectedSubCategory || "{}"}
                  </strong>
                  .
                  <br />
                  Don’t worry{" "}
                  <i className="fa-regular fa-face-smile text-warning"></i>, you
                  can{" "}
                  <span style={{ fontWeight: "bold", color: "#0d6efd" }}>
                    request admin
                  </span>
                  .
                  <button
                    className="btn btn-success w-100 mt-3"
                    onClick={() => {
                      alert(
                        "Request Send To Admin for",
                        selectedCategory,
                        "-->",
                        selectedSubCategory
                      );
                      setNotFoundModal(false);
                    }}
                  >
                    Send Request To Admin
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      {shopAddressModal && (
        <div
          className="modal fade show d-block"
          tabIndex="-1"
          style={{ backgroundColor: "rgba(0,0,0,0.6)" }}
        >
          <div className="modal-dialog modal-fullscreen modal-dialog-centered">
            <div className="modal-content border-0 shadow-lg  overflow-hidden">
              {/* Header */}
              <div className="modal-header  p-3 d-flex align-items-center">
                <i
                  className="fa-solid fa-circle-chevron-left text-primary me-2"
                  style={{ fontSize: "24px", cursor: "pointer" }}
                  onClick={() => setShopAddressModal(false)}
                ></i>
                <h5 className="fw-bold text-dark mb-0">Available Services</h5>
              </div>

              {/* Body */}
              <div className="modal-body p-2">
                {/* Shop Information Card */}
                <div className="p-4 bg-light rounded-1 shadow-sm mb-2">
                  <h6 className="fw-bold text-dark mb-3">
                    <i className="fa-solid fa-store text-success me-2"></i>
                    Shop Details
                  </h6>

                  <p className="mb-3">
                    <i className="fa-solid fa-location-dot text-danger me-2"></i>
                    <span className="fw-semibold">Address:</span>{" "}
                    {selectedShopWithShopkepper?.shop?.location?.area}
                  </p>

                  <div className="d-flex justify-content-between">
                    <p className="mb-0">
                      <i className="fa-solid fa-clock text-primary me-2"></i>
                      <span className="fw-semibold">Est. Time:</span>{" "}
                      {routeInfo?.duration} mins
                    </p>
                    <p className="mb-0">
                      <i className="fa-solid fa-route text-warning me-2"></i>
                      <span className="fw-semibold">Distance:</span>{" "}
                      {routeInfo?.distance} km
                    </p>
                  </div>
                </div>

                {/* Map Container */}
                <div
                  className="rounded-1 overflow-hidden shadow-sm border"
                  style={{ height: "380px", width: "100%" }}
                >
                  <UserShopRoute
                    userCoords={[selectedArea.lng, selectedArea.lat]}
                    shopCoords={[
                      selectedShopWithShopkepper?.shop?.location
                        ?.coordinates[1],
                      selectedShopWithShopkepper?.shop?.location
                        ?.coordinates[0],
                    ]}
                    onRouteInfo={(info) => setRouteInfo(info)}
                    type={"shop"}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default UserDashboard;
