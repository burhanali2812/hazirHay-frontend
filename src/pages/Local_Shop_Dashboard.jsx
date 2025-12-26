import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import { useAppContext } from "../context/AppContext";
import imageCompression from "browser-image-compression";

function Local_Shop_Dashboard() {
  const { user, logout } = useAppContext();
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const [shopData, setShopData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const [isDataLoading, setIsDataLoading] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);

  // Forms
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
  const [location, setLocation] = useState({ coordinates: [0, 0], area: "" });
  const [selectedImage, setSelectedImage] = useState(null);
  const [imageType, setImageType] = useState("");
  const [previewImage, setPreviewImage] = useState("");
  const [menuCards, setMenuCards] = useState([]);
  const [newMenuCards, setNewMenuCards] = useState([]);

  useEffect(() => {
    fetchShopData();
  }, []);

  const fetchShopData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await axios.get(
        "https://hazir-hay-backend.vercel.app/localShop/getShopData",
        {
          headers: { Authorization: `Bearer ${token}` },
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
      }
    } catch (err) {
      toast.error("Failed to load shop data");
    } finally {
      setLoading(false);
    }
  }, [token]);

  const handleLogout = useCallback(() => {
    if (window.confirm("Logout from dashboard?")) {
      localStorage.clear();
      logout && logout();
      navigate("/");
      toast.success("Logged out");
    }
  }, [logout, navigate]);

  const toggleLiveStatus = useCallback(async () => {
    setIsDataLoading(true);
    try {
      const res = await axios.put(
        "https://hazir-hay-backend.vercel.app/localShop/toggleLiveStatus",
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
          params: { t: Date.now() },
        }
      );
      if (res.data.success) {
        toast.success(res.data.message);
        fetchShopData();
      }
    } catch (err) {
      toast.error("Status update failed");
    } finally {
      setIsDataLoading(false);
    }
  }, [token, fetchShopData]);

  const handleShopInfoChange = useCallback(
    (e) =>
      setShopInfo((prev) => ({ ...prev, [e.target.name]: e.target.value })),
    []
  );

  const updateShopInfo = useCallback(async () => {
    setIsDataLoading(true);
    try {
      const res = await axios.put(
        "https://hazir-hay-backend.vercel.app/localShop/updateShopInfo",
        shopInfo,
        {
          headers: { Authorization: `Bearer ${token}` },
          params: { t: Date.now() },
        }
      );
      if (res.data.success) {
        toast.success("Information updated");
        fetchShopData();
        document.getElementById("closeShopInfoModal")?.click();
      }
    } catch {
      toast.error("Update failed");
    } finally {
      setIsDataLoading(false);
    }
  }, [shopInfo, token, fetchShopData]);

  const addService = useCallback(() => {
    const alreadyExists = services.some(
      (s) => s.name.toLowerCase() === newService.trim().toLowerCase()
    );
    if (alreadyExists) {
      toast.error("Service already added");
      return;
    }
    if (newService.trim())
      setServices((prev) => [...prev, { name: newService.trim() }]);
    setNewService("");
  }, [services, newService]);

  const removeService = useCallback(
    (i) => setServices((prev) => prev.filter((_, idx) => idx !== i)),
    []
  );

  const updateServices = useCallback(async () => {
    setIsDataLoading(true);
    try {
      const res = await axios.put(
        "https://hazir-hay-backend.vercel.app/localShop/updateServices",
        { services },
        {
          headers: { Authorization: `Bearer ${token}` },
          params: { t: Date.now() },
        }
      );
      if (res.data.success) {
        toast.success("Services updated");
        fetchShopData();
        document.getElementById("closeServicesModal")?.click();
      }
    } catch {
      toast.error("Update failed");
    } finally {
      setIsDataLoading(false);
    }
  }, [services, token, fetchShopData]);

  const handleLocationChange = useCallback((e) => {
    const { name, value } = e.target;
    if (name === "lat" || name === "lng") {
      setLocation((prev) => {
        const coords = [...prev.coordinates];
        coords[name === "lat" ? 1 : 0] = parseFloat(value) || 0;
        return { ...prev, coordinates: coords };
      });
    } else {
      setLocation((prev) => ({ ...prev, [name]: value }));
    }
  }, []);

  const updateLocation = useCallback(async () => {
    setIsDataLoading(true);
    try {
      const res = await axios.put(
        "https://hazir-hay-backend.vercel.app/localShop/updateLocation",
        { location },
        {
          headers: { Authorization: `Bearer ${token}` },
          params: { t: Date.now() },
        }
      );
      if (res.data.success) {
        toast.success("Location updated");
        fetchShopData();
        document.getElementById("closeLocationModal")?.click();
      }
    } catch {
      toast.error("Update failed");
    } finally {
      setIsDataLoading(false);
    }
  }, [location, token, fetchShopData]);

  const handleImageSelect = useCallback((e, type) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedImage(file);
      setImageType(type);
      setPreviewImage(URL.createObjectURL(file));
    }
  }, []);

  // helper: compress images before upload
  const compressImage = useCallback(async (file) => {
    const options = {
      maxSizeMB: 0.6,
      maxWidthOrHeight: 800,
      useWebWorker: true,
    };
    return imageCompression(file, options);
  }, []);

  const uploadImage = useCallback(async () => {
    if (!selectedImage) return toast.error("Select an image first");
    setIsDataLoading(true);
    try {
      const compressed = await compressImage(selectedImage);
      const form = new FormData();
      form.append("image", compressed, compressed.name || selectedImage.name);
      form.append("imageType", imageType);
      const res = await axios.put(
        "https://hazir-hay-backend.vercel.app/localShop/updateImage",
        form,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
          params: { t: Date.now() },
        }
      );
      if (res.data.success) {
        toast.success("Image updated");
        fetchShopData();
        setSelectedImage(null);
        setPreviewImage("");
        document.getElementById("closeImageModal")?.click();
      }
    } catch {
      toast.error("Upload failed");
    } finally {
      setIsDataLoading(false);
    }
  }, [selectedImage, imageType, token, compressImage, fetchShopData]);

  const handleMenuCardsSelect = useCallback(
    (e) => setNewMenuCards(Array.from(e.target.files)),
    []
  );

  const addMenuCards = useCallback(async () => {
    if (!newMenuCards.length) return toast.error("Select menu images");
    setIsDataLoading(true);
    try {
      const form = new FormData();
      // compress every menu image before upload
      for (const file of newMenuCards) {
        const compressed = await compressImage(file);
        form.append("menuCards", compressed, compressed.name || file.name);
      }
      const res = await axios.post(
        "https://hazir-hay-backend.vercel.app/localShop/addMenuCards",
        form,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
          params: { t: Date.now() },
        }
      );
      if (res.data.success) {
        toast.success("Menu cards added");
        fetchShopData();
        setNewMenuCards([]);
        document.getElementById("closeMenuModal")?.click();
      }
    } catch {
      toast.error("Upload failed");
    } finally {
      setIsDataLoading(false);
    }
  }, [newMenuCards, token, compressImage, fetchShopData]);

  const deleteMenuCard = useCallback(
    async (url) => {
      if (!window.confirm("Delete this menu card?")) return;
      setIsDataLoading(true);
      try {
        const res = await axios.delete(
          "https://hazir-hay-backend.vercel.app/localShop/deleteMenuCard",
          {
            headers: { Authorization: `Bearer ${token}` },
            data: { menuCardUrl: url },
            params: { t: Date.now() },
          }
        );
        if (res.data.success) {
          toast.success("Menu card deleted");
          fetchShopData();
        }
      } catch {
        toast.error("Delete failed");
      } finally {
        setIsDataLoading(false);
      }
    },
    [token, fetchShopData]
  );

  const handleTabChange = useCallback((tab) => {
    setIsTransitioning(true);
    setTimeout(() => {
      setActiveTab(tab);
      setIsTransitioning(false);
    }, 150);
  }, []);

  // Memoized config arrays
  const menuTabConfig = useMemo(
    () => [
      ["overview", "fa-chart-line", "Overview"],
      ["shopInfo", "fa-info-circle", "Shop Info"],
      ["services", "fa-concierge-bell", "Services"],
      ["location", "fa-map-marker-alt", "Location"],
      ["menu", "fa-utensils", "Menu"],
    ],
    []
  );

  const statsCards = useMemo(
    () => [
      {
        title: "Total Clicks",
        value: shopData?.activityCount || 0,
        icon: "fa-mouse-pointer",
        color: "primary",
      },
      {
        title: "Services",
        value: services.length || 0,
        icon: "fa-concierge-bell",
        color: "success",
      },
      {
        title: "Menu Cards",
        value: menuCards.length || 0,
        icon: "fa-images",
        color: "info",
      },
    ],
    [shopData?.activityCount, services.length, menuCards.length]
  );

  const shopInfoFields = useMemo(
    () => [
      ["shopName", "Shop Name", "text", "fa-store"],
      ["position", "Position/Type", "text", "fa-briefcase"],
      ["phone", "Phone", "text", "fa-phone"],
      ["email", "Email", "email", "fa-envelope"],
      ["shopAddress", "Address", "text", "fa-map-marker-alt"],
    ],
    []
  );

  const shopInfoDisplay = useMemo(
    () => [
      ["Shop Name", shopInfo.shopName, "fa-store"],
      ["Position/Type", shopInfo.position, "fa-briefcase"],
      ["Phone", shopInfo.phone, "fa-phone"],
      ["Email", shopInfo.email, "fa-envelope"],
      ["Address", shopInfo.shopAddress, "fa-map-marker-alt"],
    ],
    [shopInfo]
  );

  const locationFields = useMemo(
    () => [
      ["lat", "Latitude", location.coordinates[1]],
      ["lng", "Longitude", location.coordinates[0]],
    ],
    [location.coordinates]
  );

  if (loading) {
    return (
      <div className="container py-5 text-center">
        <div
          className="spinner-border text-primary"
          role="status"
          style={{ width: "3rem", height: "3rem" }}
        >
          <span className="visually-hidden">Loading…</span>
        </div>
        <p className="mt-3 text-muted">Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className="container-fluid bg-light min-vh-100 py-3">
      {/* Mobile header */}
      <div className="d-lg-none mb-3">
        <div className="card shadow-sm border-0">
          <div className="card-body p-3">
            <div className="d-flex align-items-center justify-content-between">
              <div className="d-flex align-items-center">
                <img
                  src={
                    shopData?.shopPicture || "https://via.placeholder.com/60"
                  }
                  alt="shop"
                  className="rounded-circle me-3 border"
                  style={{ width: 52, height: 52, objectFit: "cover" }}
                  loading="lazy"
                />
                <div>
                  <div className="fw-semibold small mb-1">
                    {shopData?.shopName}
                  </div>
                  <div className="text-muted small">{shopData?.position}</div>
                </div>
              </div>
              <button
                className="btn btn-outline-primary btn-sm"
                onClick={() => setShowMobileMenu(!showMobileMenu)}
              >
                <i
                  className={`fas fa-${showMobileMenu ? "times" : "bars"}`}
                ></i>
              </button>
            </div>
            {showMobileMenu && (
              <div className="mt-3 border-top pt-2">
                {menuTabConfig.map(([key, icon, label]) => (
                  <button
                    key={key}
                    className={`list-group-item list-group-item-action border-0 py-2 small ${
                      activeTab === key ? "active" : ""
                    }`}
                    onClick={() => {
                      handleTabChange(key);
                      setShowMobileMenu(false);
                    }}
                  >
                    <i className={`fas ${icon} me-2`}></i>
                    {label}
                  </button>
                ))}
                <button
                  className="list-group-item list-group-item-action border-0 py-2 small text-danger"
                  onClick={handleLogout}
                >
                  <i className="fas fa-sign-out-alt me-2"></i>
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="row">
        {/* Sidebar */}
        <div className="col-lg-3 d-none d-lg-block mb-3">
          <div
            className="card shadow-sm border-0 sticky-top"
            style={{ top: 12 }}
          >
            <div className="card-body">
              <div className="text-center mb-3">
                <div className="position-relative d-inline-block">
                  <img
                    src={
                      shopData?.shopPicture || "https://via.placeholder.com/120"
                    }
                    alt="shop"
                    className="rounded-circle border border-3 border-primary"
                    style={{ width: 110, height: 110, objectFit: "cover" }}
                    loading="lazy"
                  />
                  <button
                    className="btn btn-sm btn-primary rounded-circle position-absolute bottom-0 end-0"
                    data-bs-toggle="modal"
                    data-bs-target="#imageModal"
                    onClick={() => setImageType("shopPicture")}
                    style={{ width: 32, height: 32 }}
                  >
                    <i className="fas fa-camera small"></i>
                  </button>
                </div>
                <div className="fw-semibold mt-2">{shopData?.shopName}</div>
                <div className="text-muted small mb-2">
                  {shopData?.position}
                </div>
                <div className="form-check form-switch d-inline-flex align-items-center gap-2">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    id="liveToggle"
                    checked={shopData?.isLive || false}
                    onChange={toggleLiveStatus}
                    disabled={isDataLoading}
                    style={{ cursor: "pointer" }}
                  />
                  <label
                    className="form-check-label small"
                    htmlFor="liveToggle"
                  >
                    {shopData?.isLive ? (
                      <span className="badge bg-success">
                        <i
                          className="fas fa-circle me-1"
                          style={{ fontSize: 8 }}
                        ></i>
                        Online
                      </span>
                    ) : (
                      <span className="badge bg-secondary">
                        <i
                          className="fas fa-circle me-1"
                          style={{ fontSize: 8 }}
                        ></i>
                        Offline
                      </span>
                    )}
                  </label>
                </div>
                {shopData?.isVerified && (
                  <div className="mt-2">
                    <span className="badge bg-primary">
                      <i className="fas fa-check-circle me-1"></i>Verified
                    </span>
                  </div>
                )}
              </div>

              <div className="list-group list-group-flush">
                {menuTabConfig.map(([key, icon, label]) => (
                  <button
                    key={key}
                    className={`list-group-item list-group-item-action border-0 py-2 small ${
                      activeTab === key ? "active" : ""
                    }`}
                    onClick={() => handleTabChange(key)}
                  >
                    <i className={`fas ${icon} me-2`}></i>
                    {label}
                  </button>
                ))}
              </div>

              <div className="mt-3 pt-3 border-top">
                <button
                  className="btn btn-danger w-100 btn-sm"
                  onClick={handleLogout}
                >
                  <i className="fas fa-sign-out-alt me-2"></i>
                  Logout
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Main */}
        <div className="col-lg-9">
          <div
            style={{
              opacity: isTransitioning ? 0.5 : 1,
              transition: "opacity 0.15s ease-in-out",
              pointerEvents: isTransitioning ? "none" : "auto",
            }}
          >
            {/* Overview */}
            {activeTab === "overview" && (
              <div className="mb-4">
                <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
                  <h5 className="fw-bold mb-0 text-secondary">
                    <i className="fas fa-chart-line text-primary me-2"></i>
                    Overview
                  </h5>
                  <button
                    className={`btn btn-sm ${
                      shopData?.isLive
                        ? "btn-outline-success"
                        : "btn-outline-secondary"
                    } d-flex align-items-center gap-2`}
                    onClick={toggleLiveStatus}
                    disabled={isDataLoading}
                  >
                    {isDataLoading ? (
                      <span className="spinner-border spinner-border-sm"></span>
                    ) : (
                      <>
                        <i
                          className={`fas ${
                            shopData?.isLive ? "fa-toggle-on" : "fa-toggle-off"
                          }`}
                        ></i>
                        <span className="small mb-0">
                          {shopData?.isLive ? "Online" : "Offline"}
                        </span>
                      </>
                    )}
                  </button>
                </div>
                <div className="row g-3 mb-3">
                  {statsCards.map((c, i) => (
                    <div className="col-md-4 col-sm-6" key={i}>
                      <div className="card shadow-sm border-0 h-100">
                        <div className="card-body d-flex align-items-center gap-3">
                          <div
                            className={`rounded-circle bg-${c.color} bg-opacity-10 p-3`}
                          >
                            <i className={`fas ${c.icon} text-${c.color}`}></i>
                          </div>
                          <div>
                            <div className="text-muted small">{c.title}</div>
                            <div className="fw-bold fs-5">{c.value}</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="card shadow-sm border-0">
                  <div className="card-body p-4">
                    <div className="d-flex align-items-center mb-3">
                      <i className="fas fa-store text-primary me-2"></i>
                      <h6 className="fw-bold mb-0 text-secondary">
                        Shop Details
                      </h6>
                    </div>
                    <div className="row g-3 small text-secondary">
                      <div className="col-md-6">
                        <div className="text-muted">Category</div>
                        <div className="fw-semibold text-dark">
                          {shopData?.category}
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="text-muted">Email</div>
                        <div className="fw-semibold text-dark">
                          {shopData?.email}
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="text-muted">Phone</div>
                        <div className="fw-semibold text-dark">
                          {shopData?.phone}
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="text-muted">Address</div>
                        <div className="fw-semibold text-dark">
                          {shopData?.shopAddress}
                        </div>
                      </div>
                      <div className="col-12">
                        <div className="text-muted">Description</div>
                        <div className="fw-semibold text-dark">
                          {shopData?.description}
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="text-muted">Member Since</div>
                        <div className="fw-semibold text-dark">
                          {new Date(shopData?.createdAt).toLocaleDateString(
                            "en-US",
                            {
                              month: "short",
                              year: "numeric",
                            }
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Shop Info */}
            {activeTab === "shopInfo" && (
              <div className="mb-4">
                <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
                  <h5 className="fw-bold mb-0 text-secondary">
                    <i className="fas fa-info-circle text-primary me-2"></i>
                    Shop Information
                  </h5>
                  <button
                    className="btn btn-primary btn-sm"
                    data-bs-toggle="modal"
                    data-bs-target="#shopInfoModal"
                  >
                    <i className="fas fa-edit me-2"></i>Edit
                  </button>
                </div>
                <div className="card shadow-sm border-0">
                  <div className="card-body p-4 small text-secondary">
                    <div className="row g-3">
                      {shopInfoDisplay.map(([label, val, icon], i) => (
                        <div className="col-md-6" key={i}>
                          <div className="text-muted">
                            <i className={`fas ${icon} me-1 text-primary`}></i>
                            {label}
                          </div>
                          <div className="fw-semibold text-dark">
                            {val || "-"}
                          </div>
                        </div>
                      ))}
                      <div className="col-12">
                        <div className="text-muted">
                          <i className="fas fa-align-left me-1 text-primary"></i>
                          Description
                        </div>
                        <div className="fw-semibold text-dark">
                          {shopInfo.description || "-"}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Services */}
            {activeTab === "services" && (
              <div className="mb-4">
                <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
                  <h5 className="fw-bold mb-0 text-secondary">
                    <i className="fas fa-concierge-bell text-primary me-2"></i>
                    Services
                  </h5>
                  <button
                    className="btn btn-primary btn-sm"
                    data-bs-toggle="modal"
                    data-bs-target="#servicesModal"
                  >
                    <i className="fas fa-edit me-2"></i>Manage
                  </button>
                </div>
                <div className="card shadow-sm border-0">
                  <div className="card-body p-4">
                    {services.length === 0 ? (
                      <div className="text-center text-muted small py-4">
                        <i className="fas fa-inbox fa-2x mb-2 opacity-50"></i>
                        <div>No services added</div>
                        <button
                          className="btn btn-primary btn-sm mt-2"
                          data-bs-toggle="modal"
                          data-bs-target="#servicesModal"
                        >
                          <i className="fas fa-plus me-2"></i>Add
                        </button>
                      </div>
                    ) : (
                      <div className="row g-2">
                        {services.map((s, i) => (
                          <div className="col-md-4 col-sm-6" key={i}>
                            <div className="card border h-100">
                              <div className="card-body text-center py-3">
                                <i className="fas fa-check-circle text-success mb-2"></i>
                                <div className="fw-semibold small text-dark">
                                  {s.name}
                                </div>
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

            {/* Location */}
            {activeTab === "location" && (
              <div className="mb-4">
                <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
                  <h5 className="fw-bold mb-0 text-secondary">
                    <i className="fas fa-map-marker-alt text-primary me-2"></i>
                    Location
                  </h5>
                  <button
                    className="btn btn-primary btn-sm"
                    data-bs-toggle="modal"
                    data-bs-target="#locationModal"
                  >
                    <i className="fas fa-edit me-2"></i>Update
                  </button>
                </div>
                <div className="card shadow-sm border-0 mb-3">
                  <div className="card-body p-4 small text-secondary">
                    <div className="row g-3">
                      <div className="col-md-4 col-sm-6">
                        <div className="text-muted">Latitude</div>
                        <div className="fw-semibold text-dark">
                          {location.coordinates[1]}
                        </div>
                      </div>
                      <div className="col-md-4 col-sm-6">
                        <div className="text-muted">Longitude</div>
                        <div className="fw-semibold text-dark">
                          {location.coordinates[0]}
                        </div>
                      </div>
                      <div className="col-md-4 col-sm-12">
                        <div className="text-muted">Area</div>
                        <div className="fw-semibold text-dark">
                          {location.area}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                {location.coordinates[0] !== 0 &&
                  location.coordinates[1] !== 0 && (
                    <div className="card shadow-sm border-0">
                      <div className="card-body p-0">
                        <iframe
                          src={`https://maps.google.com/maps?q=${location.coordinates[1]},${location.coordinates[0]}&z=15&output=embed`}
                          width="100%"
                          height="360"
                          style={{ border: 0 }}
                          loading="lazy"
                          title="map"
                        ></iframe>
                      </div>
                    </div>
                  )}
              </div>
            )}

            {/* Menu */}
            {activeTab === "menu" && (
              <div className="mb-4">
                <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
                  <h5 className="fw-bold mb-0 text-secondary">
                    <i className="fas fa-utensils text-primary me-2"></i>
                    Menu Cards
                  </h5>
                  <button
                    className="btn btn-primary btn-sm"
                    data-bs-toggle="modal"
                    data-bs-target="#menuModal"
                  >
                    <i className="fas fa-plus me-2"></i>Add
                  </button>
                </div>
                <div className="card shadow-sm border-0">
                  <div className="card-body p-4">
                    {menuCards.length === 0 ? (
                      <div className="text-center text-muted small py-4">
                        <i className="fas fa-image fa-2x mb-2 opacity-50"></i>
                        <div>No menu cards</div>
                      </div>
                    ) : (
                      <div className="row g-2">
                        {menuCards.map((card, i) => (
                          <div className="col-md-4 col-sm-6" key={i}>
                            <div className="card border h-100">
                              <img
                                src={card}
                                alt="menu"
                                className="card-img-top"
                                style={{ height: 200, objectFit: "cover" }}
                                loading="lazy"
                              />
                              <div className="card-body text-center py-2">
                                <button
                                  className="btn btn-outline-danger btn-sm"
                                  onClick={() => deleteMenuCard(card)}
                                  disabled={isDataLoading}
                                >
                                  {isDataLoading ? (
                                    <span className="spinner-border spinner-border-sm"></span>
                                  ) : (
                                    <>
                                      <i className="fas fa-trash me-1"></i>
                                      Delete
                                    </>
                                  )}
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
          </div>
        </div>
      </div>

      {/* Modals */}

      {/* Shop Info Modal */}
      <div
        className="modal fade"
        id="shopInfoModal"
        tabIndex="-1"
        aria-hidden="true"
      >
        <div className="modal-dialog modal-lg">
          <div className="modal-content">
            <div className="modal-header py-2">
              <h6 className="modal-title fw-bold text-secondary">
                <i className="fas fa-edit text-primary me-2"></i>Edit
                Information
              </h6>
              <button
                type="button"
                className="btn-close"
                data-bs-dismiss="modal"
                aria-label="Close"
                id="closeShopInfoModal"
              ></button>
            </div>
            <div className="modal-body small">
              <div className="row g-3">
                {shopInfoFields.map(([name, label, type, icon]) => (
                  <div className="col-md-6" key={name}>
                    <label className="form-label small text-muted fw-semibold">
                      <i className={`fas ${icon} me-2 text-primary`}></i>
                      {label}
                    </label>
                    <input
                      type={type}
                      className="form-control form-control-sm"
                      name={name}
                      value={shopInfo[name]}
                      onChange={handleShopInfoChange}
                    />
                  </div>
                ))}
                <div className="col-12">
                  <label className="form-label small text-muted fw-semibold">
                    <i className="fas fa-align-left me-2 text-primary"></i>
                    Description
                  </label>
                  <textarea
                    className="form-control form-control-sm"
                    rows="3"
                    name="description"
                    value={shopInfo.description}
                    onChange={handleShopInfoChange}
                  ></textarea>
                </div>
              </div>
            </div>
            <div className="modal-footer py-2">
              <button
                className="btn btn-light btn-sm"
                data-bs-dismiss="modal"
                disabled={isDataLoading}
              >
                Cancel
              </button>
              <button
                className="btn btn-primary btn-sm"
                onClick={updateShopInfo}
                disabled={isDataLoading}
              >
                {isDataLoading ? (
                  <span className="spinner-border spinner-border-sm"></span>
                ) : (
                  <>
                    <i className="fas fa-save me-1"></i>Save
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
        aria-hidden="true"
      >
        <div className="modal-dialog modal-lg">
          <div className="modal-content">
            <div className="modal-header py-2">
              <h6 className="modal-title fw-bold text-secondary">
                <i className="fas fa-concierge-bell text-primary me-2"></i>
                Manage Services
              </h6>
              <button
                type="button"
                className="btn-close"
                data-bs-dismiss="modal"
                aria-label="Close"
                id="closeServicesModal"
              ></button>
            </div>
            <div className="modal-body small">
              <label className="form-label fw-semibold text-muted">
                Add Service
              </label>
              <div className="input-group input-group-sm mb-3">
                <input
                  type="text"
                  className="form-control"
                  placeholder="Service name"
                  value={newService}
                  disabled={services.length >= 5}
                  onChange={(e) => setNewService(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && addService()}
                />
                <button
                  className="btn btn-primary"
                  onClick={addService}
                  disabled={services.length >= 5 || !newService.trim()}
                >
                  <i className="fas fa-plus"></i>
                </button>
              </div>
              {services.length >= 5 && (
                <div className="alert alert-warning py-2 small mb-2">
                  <i className="fas fa-exclamation-triangle me-2"></i>
                  Maximum 5 services allowed
                </div>
              )}
              <div className="fw-semibold text-muted mb-2">
                Current Services
              </div>
              {services.length === 0 ? (
                <div className="text-muted">No services added</div>
              ) : (
                <div className="d-flex flex-wrap gap-2">
                  {services.map((s, i) => (
                    <span
                      className="badge bg-light text-dark border d-flex align-items-center"
                      key={i}
                    >
                      <i className="fas fa-check text-success me-2"></i>
                      {s.name}
                      <button
                        className="btn btn-link btn-sm text-danger ms-2 p-0"
                        onClick={() => removeService(i)}
                      >
                        <i className="fas fa-times"></i>
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>
            <div className="modal-footer py-2">
              <button
                className="btn btn-light btn-sm"
                data-bs-dismiss="modal"
                disabled={isDataLoading}
              >
                Cancel
              </button>
              <button
                className="btn btn-success btn-sm"
                onClick={updateServices}
                disabled={isDataLoading || services.length === 0}
              >
                {isDataLoading ? (
                  <span className="spinner-border spinner-border-sm"></span>
                ) : (
                  <>
                    <i className="fas fa-save me-1"></i>Save
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
        aria-hidden="true"
      >
        <div className="modal-dialog modal-lg">
          <div className="modal-content">
            <div className="modal-header py-2">
              <h6 className="modal-title fw-bold text-secondary">
                <i className="fas fa-map-marker-alt text-primary me-2"></i>
                Update Location
              </h6>
              <button
                type="button"
                className="btn-close"
                data-bs-dismiss="modal"
                aria-label="Close"
                id="closeLocationModal"
              ></button>
            </div>
            <div className="modal-body small">
              <div className="row g-3">
                {locationFields.map(([name, label, val]) => (
                  <div className="col-md-6" key={name}>
                    <label className="form-label text-muted fw-semibold">
                      <i className="fas fa-compass me-2 text-primary"></i>
                      {label}
                    </label>
                    <input
                      type="number"
                      step="any"
                      className="form-control form-control-sm"
                      name={name}
                      value={val}
                      onChange={handleLocationChange}
                    />
                  </div>
                ))}
                <div className="col-12">
                  <label className="form-label text-muted fw-semibold">
                    <i className="fas fa-map-pin me-2 text-primary"></i>
                    Area
                  </label>
                  <input
                    type="text"
                    className="form-control form-control-sm"
                    name="area"
                    value={location.area}
                    onChange={handleLocationChange}
                  />
                </div>
                {location.coordinates[0] !== 0 &&
                  location.coordinates[1] !== 0 && (
                    <div className="col-12">
                      <div className="border rounded overflow-hidden">
                        <iframe
                          src={`https://maps.google.com/maps?q=${location.coordinates[1]},${location.coordinates[0]}&z=15&output=embed`}
                          width="100%"
                          height="260"
                          style={{ border: 0 }}
                          loading="lazy"
                          title="preview"
                        ></iframe>
                      </div>
                    </div>
                  )}
              </div>
            </div>
            <div className="modal-footer py-2">
              <button
                className="btn btn-light btn-sm"
                data-bs-dismiss="modal"
                disabled={isDataLoading}
              >
                Cancel
              </button>
              <button
                className="btn btn-primary btn-sm"
                onClick={updateLocation}
                disabled={isDataLoading}
              >
                {isDataLoading ? (
                  <span className="spinner-border spinner-border-sm"></span>
                ) : (
                  <>
                    <i className="fas fa-save me-1"></i>Save
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Menu Modal */}
      <div
        className="modal fade"
        id="menuModal"
        tabIndex="-1"
        aria-hidden="true"
      >
        <div className="modal-dialog">
          <div className="modal-content">
            <div className="modal-header py-2">
              <h6 className="modal-title fw-bold text-secondary">
                <i className="fas fa-utensils text-primary me-2"></i>Add Menu
                Cards
              </h6>
              <button
                type="button"
                className="btn-close"
                data-bs-dismiss="modal"
                aria-label="Close"
                id="closeMenuModal"
              ></button>
            </div>
            <div className="modal-body small">
              <label className="form-label fw-semibold text-muted">
                Select images (max 10)
              </label>
              <input
                type="file"
                accept="image/*"
                multiple
                className="form-control form-control-sm"
                onChange={handleMenuCardsSelect}
              />
              {newMenuCards.length > 0 && (
                <div className="alert alert-info mt-3 py-2 small mb-0">
                  <i className="fas fa-info-circle me-2"></i>
                  {newMenuCards.length} file(s) selected
                </div>
              )}
            </div>
            <div className="modal-footer py-2">
              <button
                className="btn btn-light btn-sm"
                data-bs-dismiss="modal"
                disabled={isDataLoading}
              >
                Cancel
              </button>
              <button
                className="btn btn-primary btn-sm"
                onClick={addMenuCards}
                disabled={isDataLoading || newMenuCards.length === 0}
              >
                {isDataLoading ? (
                  <span className="spinner-border spinner-border-sm"></span>
                ) : (
                  <>
                    <i className="fas fa-upload me-1"></i>Upload
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
