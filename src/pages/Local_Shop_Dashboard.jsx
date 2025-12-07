import React, { useState, useEffect } from "react";
import { useAppContext } from "../context/AppContext";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";

function Local_Shop_Dashboard() {
  const { user, token, logout } = useAppContext();
  const navigate = useNavigate();
  const [shopData, setShopData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const [isDataLoading, setIsDataLoading] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  // Form states
  const [shopInfo, setShopInfo] = useState({
    shopName: "",
    position: "",
    description: "",
    shopAddress: "",
    phone: "",
    email: "",
  });

  const [services, setServices] = useState([]);
  const [newService, setNewService] = useState("");

  const [location, setLocation] = useState({
    coordinates: [0, 0],
    area: "",
  });

  const [selectedImage, setSelectedImage] = useState(null);
  const [imageType, setImageType] = useState("");
  const [previewImage, setPreviewImage] = useState("");

  const [menuCards, setMenuCards] = useState([]);
  const [newMenuCards, setNewMenuCards] = useState([]);

  // Fetch shop data
  useEffect(() => {
    fetchShopData();
  }, []);

  const fetchShopData = async () => {
    setLoading(true);
    try {
      const res = await axios.get(
        "https://hazir-hay-backend.vercel.app/localShop/getShopData",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          params: { t: Date.now() },
        }
      );

      if (res.data.success) {
        const shop = res.data.shop;
        setShopData(shop);

        setShopInfo({
          shopName: shop.shopName || "",
          position: shop.position || "",
          description: shop.description || "",
          shopAddress: shop.shopAddress || "",
          phone: shop.phone || "",
          email: shop.email || "",
        });

        setServices(shop.services || []);

        setLocation({
          coordinates: shop.location?.coordinates || [0, 0],
          area: shop.location?.area || "",
        });

        setMenuCards(
          Array.isArray(shop.menuCard)
            ? shop.menuCard
            : shop.menuCard
            ? [shop.menuCard]
            : []
        );

        setLoading(false);
      }
    } catch (error) {
      console.error("Error fetching shop data:", error);
      toast.error("Failed to load shop data");
      setLoading(false);
    }
  };

  // Handle Logout
  const handleLogout = () => {
    if (window.confirm("Are you sure you want to logout?")) {
           navigate("/");
      localStorage.clear();
      toast.success("Logged out successfully!");
 
    }
  };

  // Toggle Live Status
  const toggleLiveStatus = async () => {
    setIsDataLoading(true);
    try {
      const res = await axios.put(
        "https://hazir-hay-backend.vercel.app/localShop/toggleLiveStatus",
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          params: { t: Date.now() },
        }
      );

      if (res.data.success) {
        toast.success(res.data.message);
        fetchShopData();
        setIsDataLoading(false);
      }
    } catch (error) {
      console.error("Error toggling live status:", error);
      toast.error("Failed to update status");
      setIsDataLoading(false);
    }
  };

  // Handle shop info update
  const handleShopInfoChange = (e) => {
    setShopInfo({ ...shopInfo, [e.target.name]: e.target.value });
  };

  const updateShopInfo = async () => {
    setIsDataLoading(true);
    try {
      const res = await axios.put(
        "https://hazir-hay-backend.vercel.app/localShop/updateShopInfo",
        shopInfo,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          params: { t: Date.now() },
        }
      );

      if (res.data.success) {
        toast.success("Shop information updated successfully!");
        fetchShopData();
        document.getElementById("closeShopInfoModal").click();
        setIsDataLoading(false);
      }
    } catch (error) {
      console.error("Error updating shop info:", error);
      toast.error("Failed to update shop information");
      setIsDataLoading(false);
    }
  };

  // Handle services
  const addService = () => {
    if (newService.trim()) {
      setServices([...services, { name: newService.trim() }]);
      setNewService("");
    }
  };

  const removeService = (index) => {
    setServices(services.filter((_, i) => i !== index));
  };

  const updateServices = async () => {
    setIsDataLoading(true);
    try {
      const res = await axios.put(
        "https://hazir-hay-backend.vercel.app/localShop/updateServices",
        { services },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          params: { t: Date.now() },
        }
      );

      if (res.data.success) {
        toast.success("Services updated successfully!");
        fetchShopData();
        document.getElementById("closeServicesModal").click();
        setIsDataLoading(false);
      }
    } catch (error) {
      console.error("Error updating services:", error);
      toast.error("Failed to update services");
      setIsDataLoading(false);
    }
  };

  // Handle location
  const handleLocationChange = (e) => {
    const { name, value } = e.target;
    if (name === "lat" || name === "lng") {
      const newCoordinates = [...location.coordinates];
      newCoordinates[name === "lat" ? 1 : 0] = parseFloat(value) || 0;
      setLocation({ ...location, coordinates: newCoordinates });
    } else {
      setLocation({ ...location, [name]: value });
    }
  };

  const updateLocation = async () => {
    setIsDataLoading(true);
    try {
      const res = await axios.put(
        "https://hazir-hay-backend.vercel.app/localShop/updateLocation",
        { location },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          params: { t: Date.now() },
        }
      );

      if (res.data.success) {
        toast.success("Location updated successfully!");
        fetchShopData();
        document.getElementById("closeLocationModal").click();
        setIsDataLoading(false);
      }
    } catch (error) {
      console.error("Error updating location:", error);
      toast.error("Failed to update location");
      setIsDataLoading(false);
    }
  };

  // Handle image upload (Shop Picture, Payment Picture)
  const handleImageSelect = (e, type) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedImage(file);
      setImageType(type);
      setPreviewImage(URL.createObjectURL(file));
    }
  };

  const uploadImage = async () => {
    if (!selectedImage) {
      toast.error("Please select an image");
      return;
    }

    setIsDataLoading(true);
    try {
      const formData = new FormData();
      formData.append("image", selectedImage);
      formData.append("imageType", imageType);

      const res = await axios.put(
        "https://hazir-hay-backend.vercel.app/localShop/updateImage",
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
          params: { t: Date.now() },
        }
      );

      if (res.data.success) {
        toast.success(`${imageType} updated successfully!`);
        fetchShopData();
        setSelectedImage(null);
        setPreviewImage("");
        document.getElementById("closeImageModal").click();
        setIsDataLoading(false);
      }
    } catch (error) {
      console.error(`Error uploading ${imageType}:`, error);
      toast.error(`Failed to upload ${imageType}`);
      setIsDataLoading(false);
    }
  };

  // Handle menu cards
  const handleMenuCardsSelect = (e) => {
    const files = Array.from(e.target.files);
    setNewMenuCards(files);
  };

  const addMenuCards = async () => {
    if (newMenuCards.length === 0) {
      toast.error("Please select menu card images");
      return;
    }

    setIsDataLoading(true);
    try {
      const formData = new FormData();
      newMenuCards.forEach((file) => {
        formData.append("menuCards", file);
      });

      const res = await axios.post(
        "https://hazir-hay-backend.vercel.app/localShop/addMenuCards",
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
          params: { t: Date.now() },
        }
      );

      if (res.data.success) {
        toast.success("Menu cards added successfully!");
        fetchShopData();
        setNewMenuCards([]);
        document.getElementById("closeMenuModal").click();
        setIsDataLoading(false);
      }
    } catch (error) {
      console.error("Error adding menu cards:", error);
      toast.error("Failed to add menu cards");
      setIsDataLoading(false);
    }
  };

  const deleteMenuCard = async (menuCardUrl) => {
    if (!window.confirm("Are you sure you want to delete this menu card?")) {
      return;
    }

    setIsDataLoading(true);
    try {
      const res = await axios.delete(
        "https://hazir-hay-backend.vercel.app/localShop/deleteMenuCard",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          data: { menuCardUrl },
          params: { t: Date.now() },
        }
      );

      if (res.data.success) {
        toast.success("Menu card deleted successfully!");
        fetchShopData();
        setIsDataLoading(false);
      }
    } catch (error) {
      console.error("Error deleting menu card:", error);
      toast.error("Failed to delete menu card");
      setIsDataLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="container mt-5 text-center">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid py-4 bg-light min-vh-100">
      {/* Mobile Header */}
      <div className="d-lg-none mb-3">
        <div className="card shadow-sm border-0">
          <div className="card-body p-3">
            <div className="d-flex justify-content-between align-items-center">
              <div className="d-flex align-items-center">
                <img
                  src={shopData?.shopPicture || "https://via.placeholder.com/50"}
                  alt="Shop"
                  className="rounded-circle me-3"
                  style={{ width: "50px", height: "50px", objectFit: "cover" }}
                />
                <div>
                  <h6 className="mb-0 fw-bold">{shopData?.shopName}</h6>
                  <small className="text-muted">{shopData?.position}</small>
                </div>
              </div>
              <button
                className="btn btn-outline-primary btn-sm"
                onClick={() => setShowMobileMenu(!showMobileMenu)}
              >
                <i className={`fas fa-${showMobileMenu ? "times" : "bars"}`}></i>
              </button>
            </div>

            {/* Mobile Menu */}
            {showMobileMenu && (
              <div className="mt-3 pt-3 border-top">
                <div className="list-group list-group-flush">
                  <button
                    className={`list-group-item list-group-item-action border-0 ${
                      activeTab === "overview" ? "active" : ""
                    }`}
                    onClick={() => {
                      setActiveTab("overview");
                      setShowMobileMenu(false);
                    }}
                  >
                    <i className="fas fa-chart-line me-2"></i>
                    Overview
                  </button>
                  <button
                    className={`list-group-item list-group-item-action border-0 ${
                      activeTab === "shopInfo" ? "active" : ""
                    }`}
                    onClick={() => {
                      setActiveTab("shopInfo");
                      setShowMobileMenu(false);
                    }}
                  >
                    <i className="fas fa-info-circle me-2"></i>
                    Shop Information
                  </button>
                  <button
                    className={`list-group-item list-group-item-action border-0 ${
                      activeTab === "services" ? "active" : ""
                    }`}
                    onClick={() => {
                      setActiveTab("services");
                      setShowMobileMenu(false);
                    }}
                  >
                    <i className="fas fa-concierge-bell me-2"></i>
                    Services
                  </button>
                  <button
                    className={`list-group-item list-group-item-action border-0 ${
                      activeTab === "location" ? "active" : ""
                    }`}
                    onClick={() => {
                      setActiveTab("location");
                      setShowMobileMenu(false);
                    }}
                  >
                    <i className="fas fa-map-marker-alt me-2"></i>
                    Location
                  </button>
                  <button
                    className={`list-group-item list-group-item-action border-0 ${
                      activeTab === "menu" ? "active" : ""
                    }`}
                    onClick={() => {
                      setActiveTab("menu");
                      setShowMobileMenu(false);
                    }}
                  >
                    <i className="fas fa-utensils me-2"></i>
                    Menu Cards
                  </button>
                  <button
                    className={`list-group-item list-group-item-action border-0 ${
                      activeTab === "payment" ? "active" : ""
                    }`}
                    onClick={() => {
                      setActiveTab("payment");
                      setShowMobileMenu(false);
                    }}
                  >
                    <i className="fas fa-credit-card me-2"></i>
                    Payment Info
                  </button>
                  <button
                    className="list-group-item list-group-item-action border-0 text-danger"
                    onClick={handleLogout}
                  >
                    <i className="fas fa-sign-out-alt me-2"></i>
                    Logout
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="row">
        {/* Desktop Sidebar */}
        <div className="col-lg-3 d-none d-lg-block mb-4">
          <div
            className="card shadow-sm border-0 sticky-top"
            style={{ top: "20px" }}
          >
            <div className="card-body">
              <div className="text-center mb-4">
                <div className="position-relative d-inline-block">
                  <img
                    src={
                      shopData?.shopPicture || "https://via.placeholder.com/150"
                    }
                    alt="Shop"
                    className="rounded-circle mb-3 border border-3 border-primary"
                    style={{
                      width: "120px",
                      height: "120px",
                      objectFit: "cover",
                    }}
                  />
                  <button
                    className="btn btn-sm btn-primary rounded-circle position-absolute bottom-0 end-0"
                    data-bs-toggle="modal"
                    data-bs-target="#imageModal"
                    onClick={() => setImageType("shopPicture")}
                    style={{ width: "35px", height: "35px" }}
                  >
                    <i className="fas fa-camera"></i>
                  </button>
                </div>
                <h5 className="fw-bold mb-1">{shopData?.shopName}</h5>
                <p className="text-muted small mb-2">{shopData?.position}</p>

                {/* Live Status Toggle */}
                <div className="d-flex justify-content-center align-items-center gap-2 mb-3">
                  <div className="form-check form-switch">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      id="liveStatusToggle"
                      checked={shopData?.isLive || false}
                      onChange={toggleLiveStatus}
                      disabled={isDataLoading}
                      style={{
                        width: "50px",
                        height: "25px",
                        cursor: "pointer",
                      }}
                    />
                    <label
                      className="form-check-label ms-2"
                      htmlFor="liveStatusToggle"
                    >
                      {shopData?.isLive ? (
                        <span className="badge bg-success">
                          <i
                            className="fas fa-circle me-1"
                            style={{ fontSize: "8px" }}
                          ></i>
                          Online
                        </span>
                      ) : (
                        <span className="badge bg-secondary">
                          <i
                            className="fas fa-circle me-1"
                            style={{ fontSize: "8px" }}
                          ></i>
                          Offline
                        </span>
                      )}
                    </label>
                  </div>
                </div>

                {shopData?.isVerified && (
                  <span className="badge bg-primary">
                    <i className="fas fa-check-circle me-1"></i>
                    Verified
                  </span>
                )}
              </div>

              <div className="list-group list-group-flush">
                <button
                  className={`list-group-item list-group-item-action border-0 ${
                    activeTab === "overview" ? "active" : ""
                  }`}
                  onClick={() => setActiveTab("overview")}
                >
                  <i className="fas fa-chart-line me-2"></i>
                  Overview
                </button>
                <button
                  className={`list-group-item list-group-item-action border-0 ${
                    activeTab === "shopInfo" ? "active" : ""
                  }`}
                  onClick={() => setActiveTab("shopInfo")}
                >
                  <i className="fas fa-info-circle me-2"></i>
                  Shop Information
                </button>
                <button
                  className={`list-group-item list-group-item-action border-0 ${
                    activeTab === "services" ? "active" : ""
                  }`}
                  onClick={() => setActiveTab("services")}
                >
                  <i className="fas fa-concierge-bell me-2"></i>
                  Services
                </button>
                <button
                  className={`list-group-item list-group-item-action border-0 ${
                    activeTab === "location" ? "active" : ""
                  }`}
                  onClick={() => setActiveTab("location")}
                >
                  <i className="fas fa-map-marker-alt me-2"></i>
                  Location
                </button>
                <button
                  className={`list-group-item list-group-item-action border-0 ${
                    activeTab === "menu" ? "active" : ""
                  }`}
                  onClick={() => setActiveTab("menu")}
                >
                  <i className="fas fa-utensils me-2"></i>
                  Menu Cards
                </button>
                <button
                  className={`list-group-item list-group-item-action border-0 ${
                    activeTab === "payment" ? "active" : ""
                  }`}
                  onClick={() => setActiveTab("payment")}
                >
                  <i className="fas fa-credit-card me-2"></i>
                  Payment Info
                </button>
              </div>

              {/* Logout Button */}
              <div className="mt-3 pt-3 border-top">
                <button
                  className="btn btn-danger w-100"
                  onClick={handleLogout}
                >
                  <i className="fas fa-sign-out-alt me-2"></i>
                  Logout
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="col-lg-9">
          {/* Overview Tab */}
          {activeTab === "overview" && (
            <div>
              <div className="d-flex justify-content-between align-items-center mb-4">
                <h3 className="fw-bold mb-0">
                  <i className="fas fa-chart-line text-primary me-2"></i>
                  Dashboard Overview
                </h3>
              </div>

              {/* Stats Cards */}
              <div className="row g-3 mb-4">
                <div className="col-md-4 col-sm-6">
                  <div className="card border-0 shadow-sm h-100">
                    <div className="card-body">
                      <div className="d-flex align-items-center">
                        <div className="rounded-circle bg-primary bg-opacity-10 p-3 me-3">
                          <i className="fas fa-mouse-pointer fa-2x text-primary"></i>
                        </div>
                        <div>
                          <h6 className="text-muted mb-1">Total Clicks</h6>
                          <h3 className="fw-bold mb-0">
                            {shopData?.activityCount || 0}
                          </h3>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="col-md-4 col-sm-6">
                  <div className="card border-0 shadow-sm h-100">
                    <div className="card-body">
                      <div className="d-flex align-items-center">
                        <div className="rounded-circle bg-success bg-opacity-10 p-3 me-3">
                          <i className="fas fa-concierge-bell fa-2x text-success"></i>
                        </div>
                        <div>
                          <h6 className="text-muted mb-1">Services</h6>
                          <h3 className="fw-bold mb-0">
                            {services?.length || 0}
                          </h3>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="col-md-4 col-sm-12">
                  <div className="card border-0 shadow-sm h-100">
                    <div className="card-body">
                      <div className="d-flex align-items-center">
                        <div className="rounded-circle bg-info bg-opacity-10 p-3 me-3">
                          <i className="fas fa-images fa-2x text-info"></i>
                        </div>
                        <div>
                          <h6 className="text-muted mb-1">Menu Cards</h6>
                          <h3 className="fw-bold mb-0">
                            {menuCards?.length || 0}
                          </h3>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Shop Details Card */}
              <div className="card border-0 shadow-sm">
                <div className="card-body p-4">
                  <h5 className="fw-bold mb-4">
                    <i className="fas fa-store text-primary me-2"></i>
                    Shop Details
                  </h5>
                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <small className="text-muted d-block mb-1">
                        <i className="fas fa-tag me-1"></i>
                        Category
                      </small>
                      <p className="fw-medium mb-0">{shopData?.category}</p>
                    </div>
                    <div className="col-md-6 mb-3">
                      <small className="text-muted d-block mb-1">
                        <i className="fas fa-envelope me-1"></i>
                        Email
                      </small>
                      <p className="fw-medium mb-0">{shopData?.email}</p>
                    </div>
                    <div className="col-md-6 mb-3">
                      <small className="text-muted d-block mb-1">
                        <i className="fas fa-phone me-1"></i>
                        Phone
                      </small>
                      <p className="fw-medium mb-0">{shopData?.phone}</p>
                    </div>
                    <div className="col-md-6 mb-3">
                      <small className="text-muted d-block mb-1">
                        <i className="fas fa-map-marker-alt me-1"></i>
                        Address
                      </small>
                      <p className="fw-medium mb-0">{shopData?.shopAddress}</p>
                    </div>
                    <div className="col-12 mb-3">
                      <small className="text-muted d-block mb-1">
                        <i className="fas fa-align-left me-1"></i>
                        Description
                      </small>
                      <p className="fw-medium mb-0">{shopData?.description}</p>
                    </div>
                    <div className="col-md-6">
                      <small className="text-muted d-block mb-1">
                        <i className="fas fa-calendar me-1"></i>
                        Member Since
                      </small>
                      <p className="fw-medium mb-0">
                        {new Date(shopData?.createdAt).toLocaleDateString(
                          "en-US",
                          {
                            month: "long",
                            year: "numeric",
                          }
                        )}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Shop Information Tab */}
          {activeTab === "shopInfo" && (
            <div>
              <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
                <h3 className="fw-bold mb-0">
                  <i className="fas fa-info-circle text-primary me-2"></i>
                  Shop Information
                </h3>
                <button
                  className="btn btn-primary"
                  data-bs-toggle="modal"
                  data-bs-target="#shopInfoModal"
                >
                  <i className="fas fa-edit me-2"></i>
                  Edit Information
                </button>
              </div>

              <div className="card border-0 shadow-sm">
                <div className="card-body p-4">
                  <div className="row">
                    <div className="col-md-6 mb-4">
                      <label className="text-muted small mb-2">
                        <i className="fas fa-store me-2 text-primary"></i>
                        Shop Name
                      </label>
                      <p className="fw-medium fs-5 mb-0">{shopInfo.shopName}</p>
                    </div>
                    <div className="col-md-6 mb-4">
                      <label className="text-muted small mb-2">
                        <i className="fas fa-briefcase me-2 text-primary"></i>
                        Position/Type
                      </label>
                      <p className="fw-medium fs-5 mb-0">{shopInfo.position}</p>
                    </div>
                    <div className="col-md-6 mb-4">
                      <label className="text-muted small mb-2">
                        <i className="fas fa-phone me-2 text-primary"></i>
                        Phone Number
                      </label>
                      <p className="fw-medium fs-5 mb-0">{shopInfo.phone}</p>
                    </div>
                    <div className="col-md-6 mb-4">
                      <label className="text-muted small mb-2">
                        <i className="fas fa-envelope me-2 text-primary"></i>
                        Email Address
                      </label>
                      <p className="fw-medium fs-5 mb-0">{shopInfo.email}</p>
                    </div>
                    <div className="col-12 mb-4">
                      <label className="text-muted small mb-2">
                        <i className="fas fa-map-marker-alt me-2 text-primary"></i>
                        Shop Address
                      </label>
                      <p className="fw-medium fs-5 mb-0">
                        {shopInfo.shopAddress}
                      </p>
                    </div>
                    <div className="col-12">
                      <label className="text-muted small mb-2">
                        <i className="fas fa-align-left me-2 text-primary"></i>
                        Description
                      </label>
                      <p
                        className="fw-medium mb-0"
                        style={{ lineHeight: "1.7" }}
                      >
                        {shopInfo.description}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Services Tab */}
          {activeTab === "services" && (
            <div>
              <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
                <h3 className="fw-bold mb-0">
                  <i className="fas fa-concierge-bell text-primary me-2"></i>
                  Services
                </h3>
                <button
                  className="btn btn-primary"
                  data-bs-toggle="modal"
                  data-bs-target="#servicesModal"
                >
                  <i className="fas fa-edit me-2"></i>
                  Manage Services
                </button>
              </div>

              <div className="card border-0 shadow-sm">
                <div className="card-body p-4">
                  {services.length === 0 ? (
                    <div className="text-center text-muted py-5">
                      <i className="fas fa-inbox fa-3x mb-3 opacity-50"></i>
                      <p>No services added yet</p>
                      <button
                        className="btn btn-primary"
                        data-bs-toggle="modal"
                        data-bs-target="#servicesModal"
                      >
                        <i className="fas fa-plus me-2"></i>
                        Add Services
                      </button>
                    </div>
                  ) : (
                    <div className="row g-3">
                      {services.map((service, index) => (
                        <div key={index} className="col-md-4 col-sm-6">
                          <div className="card border h-100">
                            <div className="card-body text-center">
                              <i className="fas fa-check-circle text-success fa-2x mb-3"></i>
                              <h6 className="fw-medium mb-0">{service.name}</h6>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Location Tab */}
          {activeTab === "location" && (
            <div>
              <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
                <h3 className="fw-bold mb-0">
                  <i className="fas fa-map-marker-alt text-primary me-2"></i>
                  Location
                </h3>
                <button
                  className="btn btn-primary"
                  data-bs-toggle="modal"
                  data-bs-target="#locationModal"
                >
                  <i className="fas fa-edit me-2"></i>
                  Update Location
                </button>
              </div>

              <div className="card border-0 shadow-sm mb-4">
                <div className="card-body p-4">
                  <div className="row">
                    <div className="col-md-4 col-sm-6 mb-3">
                      <label className="text-muted small mb-2">
                        <i className="fas fa-compass me-2 text-primary"></i>
                        Latitude
                      </label>
                      <p className="fw-medium fs-5 mb-0">
                        {location.coordinates[1]}
                      </p>
                    </div>
                    <div className="col-md-4 col-sm-6 mb-3">
                      <label className="text-muted small mb-2">
                        <i className="fas fa-compass me-2 text-primary"></i>
                        Longitude
                      </label>
                      <p className="fw-medium fs-5 mb-0">
                        {location.coordinates[0]}
                      </p>
                    </div>
                    <div className="col-md-4 col-sm-12 mb-3">
                      <label className="text-muted small mb-2">
                        <i className="fas fa-map-pin me-2 text-primary"></i>
                        Area
                      </label>
                      <p className="fw-medium fs-5 mb-0">{location.area}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Map Preview */}
              {location.coordinates[0] !== 0 &&
                location.coordinates[1] !== 0 && (
                  <div className="card border-0 shadow-sm">
                    <div className="card-body p-0">
                      <div className="border rounded overflow-hidden">
                        <iframe
                          src={`https://maps.google.com/maps?q=${location.coordinates[1]},${location.coordinates[0]}&z=15&output=embed`}
                          width="100%"
                          height="450"
                          style={{ border: 0 }}
                          allowFullScreen=""
                          loading="lazy"
                          title="Location Preview"
                        ></iframe>
                      </div>
                    </div>
                  </div>
                )}
            </div>
          )}

          {/* Menu Cards Tab */}
          {activeTab === "menu" && (
            <div>
              <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
                <h3 className="fw-bold mb-0">
                  <i className="fas fa-utensils text-primary me-2"></i>
                  Menu Cards
                </h3>
                <button
                  className="btn btn-primary"
                  data-bs-toggle="modal"
                  data-bs-target="#menuModal"
                >
                  <i className="fas fa-plus me-2"></i>
                  Add Menu Cards
                </button>
              </div>

              <div className="card border-0 shadow-sm">
                <div className="card-body p-4">
                  {menuCards.length === 0 ? (
                    <div className="text-center text-muted py-5">
                      <i className="fas fa-image fa-3x mb-3 opacity-50"></i>
                      <p>No menu cards added yet</p>
                      <button
                        className="btn btn-primary"
                        data-bs-toggle="modal"
                        data-bs-target="#menuModal"
                      >
                        <i className="fas fa-plus me-2"></i>
                        Add Menu Cards
                      </button>
                    </div>
                  ) : (
                    <div className="row g-3">
                      {menuCards.map((card, index) => (
                        <div key={index} className="col-md-6 col-lg-4 col-sm-6">
                          <div className="card border h-100">
                            <img
                              src={card}
                              alt={`Menu ${index + 1}`}
                              className="card-img-top"
                              style={{ height: "250px", objectFit: "cover" }}
                            />
                            <div className="card-body text-center">
                              <button
                                className="btn btn-danger btn-sm"
                                onClick={() => deleteMenuCard(card)}
                                disabled={isDataLoading}
                              >
                                <i className="fas fa-trash me-2"></i>
                                Delete
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Payment Info Tab */}
          {activeTab === "payment" && (
            <div>
              <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
                <h3 className="fw-bold mb-0">
                  <i className="fas fa-credit-card text-primary me-2"></i>
                  Payment Information
                </h3>
                <button
                  className="btn btn-primary"
                  data-bs-toggle="modal"
                  data-bs-target="#imageModal"
                  onClick={() => setImageType("paymentPic")}
                >
                  <i className="fas fa-edit me-2"></i>
                  Update Payment Info
                </button>
              </div>

              <div className="card border-0 shadow-sm">
                <div className="card-body p-4">
                  {shopData?.paymentPic ? (
                    <div className="text-center">
                      <img
                        src={shopData.paymentPic}
                        alt="Payment Info"
                        className="img-fluid rounded shadow"
                        style={{ maxHeight: "500px", objectFit: "contain" }}
                      />
                    </div>
                  ) : (
                    <div className="text-center text-muted py-5">
                      <i className="fas fa-credit-card fa-3x mb-3 opacity-50"></i>
                      <p>No payment information added yet</p>
                      <button
                        className="btn btn-primary"
                        data-bs-toggle="modal"
                        data-bs-target="#imageModal"
                        onClick={() => setImageType("paymentPic")}
                      >
                        <i className="fas fa-plus me-2"></i>
                        Add Payment Info
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modals */}

      {/* Shop Info Modal */}
      <div
        className="modal fade"
        id="shopInfoModal"
        tabIndex="-1"
        aria-labelledby="shopInfoModalLabel"
        aria-hidden="true"
      >
        <div className="modal-dialog modal-lg">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title" id="shopInfoModalLabel">
                <i className="fas fa-edit text-primary me-2"></i>
                Edit Shop Information
              </h5>
              <button
                type="button"
                className="btn-close"
                data-bs-dismiss="modal"
                aria-label="Close"
                id="closeShopInfoModal"
              ></button>
            </div>
            <div className="modal-body">
              <div className="row g-3">
                <div className="col-md-6">
                  <label className="form-label fw-medium">
                    <i className="fas fa-store me-2 text-primary"></i>
                    Shop Name
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    name="shopName"
                    value={shopInfo.shopName}
                    onChange={handleShopInfoChange}
                    placeholder="Enter shop name"
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label fw-medium">
                    <i className="fas fa-briefcase me-2 text-primary"></i>
                    Position/Type
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    name="position"
                    value={shopInfo.position}
                    onChange={handleShopInfoChange}
                    placeholder="e.g., Restaurant, Salon"
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label fw-medium">
                    <i className="fas fa-phone me-2 text-primary"></i>
                    Phone Number
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    name="phone"
                    value={shopInfo.phone}
                    onChange={handleShopInfoChange}
                    placeholder="Enter phone number"
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label fw-medium">
                    <i className="fas fa-envelope me-2 text-primary"></i>
                    Email Address
                  </label>
                  <input
                    type="email"
                    className="form-control"
                    name="email"
                    value={shopInfo.email}
                    onChange={handleShopInfoChange}
                    placeholder="Enter email"
                  />
                </div>
                <div className="col-12">
                  <label className="form-label fw-medium">
                    <i className="fas fa-map-marker-alt me-2 text-primary"></i>
                    Shop Address
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    name="shopAddress"
                    value={shopInfo.shopAddress}
                    onChange={handleShopInfoChange}
                    placeholder="Enter complete address"
                  />
                </div>
                <div className="col-12">
                  <label className="form-label fw-medium">
                    <i className="fas fa-align-left me-2 text-primary"></i>
                    Description
                  </label>
                  <textarea
                    className="form-control"
                    name="description"
                    rows="4"
                    value={shopInfo.description}
                    onChange={handleShopInfoChange}
                    placeholder="Describe your shop and services"
                  ></textarea>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-secondary"
                data-bs-dismiss="modal"
                disabled={isDataLoading}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn btn-primary"
                onClick={updateShopInfo}
                disabled={isDataLoading}
              >
                {isDataLoading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2"></span>
                    Saving...
                  </>
                ) : (
                  <>
                    <i className="fas fa-save me-2"></i>
                    Save Changes
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Services Modal */}
      <div
        className="modal fade"
        id="servicesModal"
        tabIndex="-1"
        aria-labelledby="servicesModalLabel"
        aria-hidden="true"
      >
        <div className="modal-dialog modal-lg">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title" id="servicesModalLabel">
                <i className="fas fa-concierge-bell text-primary me-2"></i>
                Manage Services
              </h5>
              <button
                type="button"
                className="btn-close"
                data-bs-dismiss="modal"
                aria-label="Close"
                id="closeServicesModal"
              ></button>
            </div>
            <div className="modal-body">
              <div className="mb-4">
                <label className="form-label fw-medium">Add New Service</label>
                <div className="input-group">
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Enter service name"
                    value={newService}
                    onChange={(e) => setNewService(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && addService()}
                  />
                  <button className="btn btn-primary" onClick={addService}>
                    <i className="fas fa-plus me-2"></i>
                    Add
                  </button>
                </div>
              </div>

              <hr />

              <div>
                <label className="form-label fw-medium mb-3">
                  Current Services
                </label>
                {services.length === 0 ? (
                  <p className="text-muted text-center py-3">
                    No services added yet
                  </p>
                ) : (
                  <div className="d-flex flex-wrap gap-2">
                    {services.map((service, index) => (
                      <div
                        key={index}
                        className="badge bg-light text-dark border px-3 py-2 d-flex align-items-center"
                        style={{ fontSize: "14px" }}
                      >
                        <i className="fas fa-check-circle text-success me-2"></i>
                        {service.name}
                        <button
                          className="btn btn-sm btn-link text-danger p-0 ms-2"
                          onClick={() => removeService(index)}
                          style={{ fontSize: "14px" }}
                        >
                          <i className="fas fa-times"></i>
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-secondary"
                data-bs-dismiss="modal"
                disabled={isDataLoading}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn btn-success"
                onClick={updateServices}
                disabled={isDataLoading || services.length === 0}
              >
                {isDataLoading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2"></span>
                    Saving...
                  </>
                ) : (
                  <>
                    <i className="fas fa-save me-2"></i>
                    Save Services
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Location Modal */}
      <div
        className="modal fade"
        id="locationModal"
        tabIndex="-1"
        aria-labelledby="locationModalLabel"
        aria-hidden="true"
      >
        <div className="modal-dialog modal-lg">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title" id="locationModalLabel">
                <i className="fas fa-map-marker-alt text-primary me-2"></i>
                Update Location
              </h5>
              <button
                type="button"
                className="btn-close"
                data-bs-dismiss="modal"
                aria-label="Close"
                id="closeLocationModal"
              ></button>
            </div>
            <div className="modal-body">
              <div className="row g-3">
                <div className="col-md-6">
                  <label className="form-label fw-medium">
                    <i className="fas fa-compass me-2 text-primary"></i>
                    Latitude
                  </label>
                  <input
                    type="number"
                    step="any"
                    className="form-control"
                    name="lat"
                    value={location.coordinates[1]}
                    onChange={handleLocationChange}
                    placeholder="Enter latitude"
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label fw-medium">
                    <i className="fas fa-compass me-2 text-primary"></i>
                    Longitude
                  </label>
                  <input
                    type="number"
                    step="any"
                    className="form-control"
                    name="lng"
                    value={location.coordinates[0]}
                    onChange={handleLocationChange}
                    placeholder="Enter longitude"
                  />
                </div>
                <div className="col-12">
                  <label className="form-label fw-medium">
                    <i className="fas fa-map-pin me-2 text-primary"></i>
                    Area Name
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    name="area"
                    value={location.area}
                    onChange={handleLocationChange}
                    placeholder="Enter area/locality name"
                  />
                </div>
                {location.coordinates[0] !== 0 &&
                  location.coordinates[1] !== 0 && (
                    <div className="col-12">
                      <label className="form-label fw-medium">
                        Location Preview
                      </label>
                      <div className="border rounded overflow-hidden">
                        <iframe
                          src={`https://maps.google.com/maps?q=${location.coordinates[1]},${location.coordinates[0]}&z=15&output=embed`}
                          width="100%"
                          height="300"
                          style={{ border: 0 }}
                          allowFullScreen=""
                          loading="lazy"
                          title="Location Preview"
                        ></iframe>
                      </div>
                    </div>
                  )}
              </div>
            </div>
            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-secondary"
                data-bs-dismiss="modal"
                disabled={isDataLoading}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn btn-primary"
                onClick={updateLocation}
                disabled={isDataLoading}
              >
                {isDataLoading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2"></span>
                    Updating...
                  </>
                ) : (
                  <>
                    <i className="fas fa-save me-2"></i>
                    Update Location
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Image Modal (Shop Picture & Payment Picture) */}
      <div
        className="modal fade"
        id="imageModal"
        tabIndex="-1"
        aria-labelledby="imageModalLabel"
        aria-hidden="true"
      >
        <div className="modal-dialog">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title" id="imageModalLabel">
                <i className="fas fa-image text-primary me-2"></i>
                Upload{" "}
                {imageType === "shopPicture"
                  ? "Shop Picture"
                  : "Payment Information"}
              </h5>
              <button
                type="button"
                className="btn-close"
                data-bs-dismiss="modal"
                aria-label="Close"
                id="closeImageModal"
              ></button>
            </div>
            <div className="modal-body">
              <div className="mb-3">
                <label className="form-label fw-medium">Select Image</label>
                <input
                  type="file"
                  className="form-control"
                  accept="image/*"
                  onChange={(e) => handleImageSelect(e, imageType)}
                />
              </div>
              {previewImage && (
                <div className="text-center">
                  <img
                    src={previewImage}
                    alt="Preview"
                    className="img-fluid rounded border"
                    style={{ maxHeight: "300px" }}
                  />
                </div>
              )}
            </div>
            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-secondary"
                data-bs-dismiss="modal"
                disabled={isDataLoading}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn btn-primary"
                onClick={uploadImage}
                disabled={isDataLoading || !selectedImage}
              >
                {isDataLoading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2"></span>
                    Uploading...
                  </>
                ) : (
                  <>
                    <i className="fas fa-upload me-2"></i>
                    Upload Image
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Menu Cards Modal */}
      <div
        className="modal fade"
        id="menuModal"
        tabIndex="-1"
        aria-labelledby="menuModalLabel"
        aria-hidden="true"
      >
        <div className="modal-dialog">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title" id="menuModalLabel">
                <i className="fas fa-utensils text-primary me-2"></i>
                Add Menu Cards
              </h5>
              <button
                type="button"
                className="btn-close"
                data-bs-dismiss="modal"
                aria-label="Close"
                id="closeMenuModal"
              ></button>
            </div>
            <div className="modal-body">
              <div className="mb-3">
                <label className="form-label fw-medium">
                  Select Menu Card Images (Multiple)
                </label>
                <input
                  type="file"
                  className="form-control"
                  accept="image/*"
                  multiple
                  onChange={handleMenuCardsSelect}
                />
                <small className="text-muted">
                  You can select up to 10 images
                </small>
              </div>
              {newMenuCards.length > 0 && (
                <div className="alert alert-info">
                  <i className="fas fa-info-circle me-2"></i>
                  {newMenuCards.length} file(s) selected
                </div>
              )}
            </div>
            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-secondary"
                data-bs-dismiss="modal"
                disabled={isDataLoading}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn btn-primary"
                onClick={addMenuCards}
                disabled={isDataLoading || newMenuCards.length === 0}
              >
                {isDataLoading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2"></span>
                    Uploading...
                  </>
                ) : (
                  <>
                    <i className="fas fa-upload me-2"></i>
                    Upload Menu Cards
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Local_Shop_Dashboard;
