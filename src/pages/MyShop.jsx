import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import PieChart from "../components/PieChart";
import { useAppContext } from "../context/AppContext";
import { useCheckBlockedStatus } from "../components/useCheckBlockedStatus";
import axios from "axios";
import imageCompression from "browser-image-compression";
import toast from "react-hot-toast";
import { lazy, Suspense } from "react";
const MyMap = lazy(() => import("../components/MyMap"));

function MyShop() {
  const { setKey, shopKepperWorkers, shop, getShopData, getShopKepperWorkers } =
    useAppContext();
  const user = JSON.parse(localStorage.getItem("user"));
  const [isViewFull, setIsViewFull] = useState(false);
  const [isEditDataModalOpen, setIsEditDataModalOpen] = useState(false);
  const [isProfilePictureUpdate, setISProfilePictureUpdate] = useState(false);
  const [pictureUploadLoading, setPictureUploadLoading] = useState(false);
  const [isEditCurrentLocation, setISEditCurrentLocation] = useState(false);
  const [updatingLoading, setUpdatingLoading] = useState(false);
  const [pictureWidthLoad, setPictureWidthLoad] = useState(0);
  const [position, setPosition] = useState([33.6844, 73.0479]);
  const [areaName, setAreaName] = useState("");
  const [shopPicture, setShopPicture] = useState(null);
  const [shopName, setShopName] = useState("");
  const [shopAddress, setShopAddress] = useState("");
  const [currentLocation, setCurrentLOcation] = useState("");
  const [page, setPage] = useState(0);
  const token = localStorage.getItem("token");
  const [mapModal, setMapModal] = useState(false);

  const [selectedArea, setSelectedArea] = useState(null);

  useCheckBlockedStatus(token);
  useEffect(() => {
    if (!user.isShop) {
      return;
    } else if (!user?.isVerified) {
      navigate("/shopKepper/sh&un&Ve&ri&fi&ed@sh@op$");
    }
  });

  const navigate = useNavigate();
  useEffect(() => {
    setSelectedArea({
      lat: shop?.location?.coordinates[0],
      lng: shop?.location?.coordinates[1],
      areaName: shop?.location?.area,
    });
    getShopData();
    getShopKepperWorkers();
    setKey("shop");
  }, []);

  const ratingCounts = shop
    ? {
        1: shop.reviews.filter((r) => r.rate === 1).length,
        2: shop.reviews.filter((r) => r.rate === 2).length,
        3: shop.reviews.filter((r) => r.rate === 3).length,
        4: shop.reviews.filter((r) => r.rate === 4).length,
        5: shop.reviews.filter((r) => r.rate === 5).length,
      }
    : { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };

  const findAverageRating = (ratings) => {
    if (!ratings || ratings.length === 0) return 0;

    const total = ratings.reduce((acc, rating) => acc + rating.rate, 0);
    return (total / ratings.length).toFixed(1);
  };
  const reviews = shop?.reviews || [];
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
  const handleChange = async (e) => {
    const { name, files, value } = e.target;

    if (name === "shopPicture") {
      setPictureWidthLoad(0);
      setPictureUploadLoading(true);
      const file = files[0];
      setPictureWidthLoad(25);
      console.log("Profile picture:", file);

      if (file) {
        setPictureWidthLoad(50);
        try {
          const options = {
            maxSizeMB: 0.6,
            maxWidthOrHeight: 800,
            useWebWorker: true,
          };
          setPictureWidthLoad(75);

          // Compress the file
          const compressedFile = await imageCompression(file, options);
          console.log("Compressed file:", compressedFile);
          setPictureWidthLoad(100);

          setShopPicture(compressedFile);
          setPictureUploadLoading(false);
        } catch (error) {
          console.error("Compression failed:", error);
          setPictureUploadLoading(false);
          setPictureWidthLoad(0);
        }
      }
    } else {
      if (name === "shopName") {
        setShopName(value);
      } else if (name === "shopAddress") {
        setShopAddress(value);
      } else if (name === "currentLocation") {
        setISEditCurrentLocation(value);
      }
    }
  };
  const fetchLocation = async () => {
    setPictureUploadLoading(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const lat = position?.coords?.latitude ?? 33;
        const lon = position?.coords?.longitude ?? 73;
        if (lat === null) {
          alert("lat null");
        }

        setPosition([lat, lon]);

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

          toast.success("Successfully fetched current location!");
          setISEditCurrentLocation(true);
          setPictureUploadLoading(false);

          setAreaName(name);
          setCurrentLOcation(`${lat}, ${lon}, ${name}`);
        } catch (error) {
          console.error("Error fetching area name:", error);
          setPictureUploadLoading(false);
        }
      },
      (error) => {
        console.error("Error getting location:", error);
        setPictureUploadLoading(false);
      }
    );
  };

  const handleUpdateData = async () => {
    setUpdatingLoading(true);
    const formData = new FormData();
    const finalShopName = shopName || shop?.shopName;
    const finalShopAddress = shopAddress || shop?.shopAddress;
    const finalShopPicture = shopPicture || null;

    const finalLocation =
      position && areaName !== ""
        ? { coordinates: position, area: areaName }
        : shop.location;

    console.log("final LOcation", finalLocation);

    formData.append("shopName", finalShopName);
    formData.append("shopAddress", finalShopAddress);
    formData.append("location", JSON.stringify(finalLocation));

    if (finalShopPicture) {
      formData.append("shopPicture", finalShopPicture);
    }

    try {
      const res = await axios.put(
        `https://hazir-hay-backend.vercel.app/admin/updateShop/${shop._id}`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      if (res.data.success) {
        await getShopData();
        setUpdatingLoading(false);
        setISEditCurrentLocation(false);
        setIsEditDataModalOpen(false);
        toast.success(res.data.message);
      }
    } catch (error) {
      setUpdatingLoading(true);
      console.log(error);
      toast.error(error);
    }
  };
  const handleSetLocation = () => {
    if (selectedArea) {
      const { lat, lng, areaName } = selectedArea;
      setPosition([lat, lng]);
      setAreaName(areaName);
      setCurrentLOcation(`${lat}, ${lng}, ${areaName}`);
    }
    setMapModal(false);
  };

  return (
    <div className="container my-4 pb-5">
      {/* Back Button */}
      <div className="d-flex align-items-center mb-4 position-relative">
        {/* Back Button */}
        <button
          className="btn btn-outline-secondary btn-sm d-flex align-items-center"
          onClick={() => window.history.back()}
          style={{ position: "absolute", left: 0 }}
        >
          <i className="fa-solid fa-arrow-left me-2"></i> Back
        </button>

        {/* Title Center */}
        <h4 className="m-0 w-100 text-center fw-bold">My Shop</h4>
      </div>

      {user?.isShop === false ? (
        <>
          <div className="modal-body text-center">
            <i className="fa-solid fa-shop-slash fs-1 text-danger mb-3"></i>
            <p className="fw-bold">You have no shop registered yet.</p>
            <p className="text-secondary">
              You cannot get any orders and your profile is not visible to
              users. Kindly register your shop.
            </p>

            <button
              className="btn btn-primary mt-2"
              onClick={() => navigate("/shop", { state: { id: user._id } })}
            >
              Get Registered
            </button>
          </div>
        </>
      ) : (
        <>
          {/* Hero Banner */}
          <div
            className="position-relative rounded-4 overflow-hidden shadow"
            style={{
              height: "220px",
              backgroundColor: "#f8f9fa",
            }}
          >
            {shop?.shopPicture ? (
              <>
                <img
                  src={shop?.shopPicture}
                  alt="Shop Banner"
                  className="w-100 h-100"
                  style={{ objectFit: "cover" }}
                />
                <div
                  className="position-absolute top-0 start-0 w-100 h-100"
                  style={{
                    background:
                      "linear-gradient(to bottom, rgba(0,0,0,0.3) 0%, rgba(0,0,0,0.1) 100%)",
                  }}
                ></div>
              </>
            ) : (
              <div
                className="w-100 h-100 d-flex align-items-center justify-content-center"
                style={{
                  background:
                    "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                }}
              >
                <div className="text-center text-white">
                  <i className="fas fa-store fa-3x mb-2 opacity-75"></i>
                  <div className="fw-bold">Add Shop Banner</div>
                </div>
              </div>
            )}

            {/* Edit Icon */}
            <button
              className="btn btn-light position-absolute shadow"
              style={{
                top: "15px",
                right: "15px",
                width: "44px",
                height: "44px",
                borderRadius: "12px",
                padding: 0,
              }}
              title="Change Shop Picture"
              onClick={() => {
                setIsEditDataModalOpen(true);
                setISProfilePictureUpdate(true);
              }}
            >
              <i className="fa-solid fa-camera text-primary"></i>
            </button>
          </div>

          {/* Main Content Card */}
          <div
            className="card shadow-lg border-0"
            style={{
              marginTop: "-50px",
              borderRadius: "20px",
            }}
          >
            {/* Header Section */}
            <div className="card-body p-3 p-md-4">
              <div className="d-flex justify-content-between align-items-start mb-3">
                <div className="flex-grow-1">
                  <h3 className="fw-bold mb-2" style={{ color: "#2c3e50" }}>
                    {shop?.shopName || "Shop Name"}
                  </h3>
                  <div className="d-flex align-items-start text-muted mb-2">
                    <i
                      className="fas fa-map-marker-alt me-2 mt-1"
                      style={{ fontSize: "0.9rem" }}
                    ></i>
                    <span style={{ fontSize: "0.9rem", lineHeight: 1.5 }}>
                      {isViewFull
                        ? shop?.location?.area
                        : shop?.location?.area?.slice(0, 60) +
                          (shop?.location?.area?.length > 60 ? "..." : "")}
                    </span>
                  </div>
                  {shop?.location?.area?.length > 60 && (
                    <button
                      className="btn btn-link btn-sm p-0 text-primary fw-semibold"
                      onClick={() => setIsViewFull(!isViewFull)}
                      style={{ fontSize: "0.85rem", textDecoration: "none" }}
                    >
                      {!isViewFull ? "Show more" : "Show less"}
                    </button>
                  )}
                </div>
                <button
                  className="btn btn-light shadow-sm"
                  style={{
                    width: "44px",
                    height: "44px",
                    borderRadius: "12px",
                    padding: 0,
                  }}
                  onClick={() => {
                    setIsEditDataModalOpen(true);
                    setISProfilePictureUpdate(false);
                  }}
                  title="Edit Shop Info"
                >
                  <i className="fa-solid fa-pen text-primary"></i>
                </button>
              </div>

              {/* Quick Access Cards */}
              <div className="row g-2 mb-3">
                {/* Workers Card */}
                <div className="col-md-6 col-6">
                  <div
                    className="card h-100 border-0 shadow-sm"
                    onClick={() => navigate("/admin/shopKepper/workersList")}
                    style={{
                      cursor: "pointer",
                      transition: "all 0.3s ease",
                      borderRadius: "12px",
                      backgroundColor: "#f8f9fa",
                    }}
                    onMouseOver={(e) =>
                      (e.currentTarget.style.transform = "translateY(-2px)")
                    }
                    onMouseOut={(e) =>
                      (e.currentTarget.style.transform = "translateY(0)")
                    }
                  >
                    <div className="card-body text-center p-3">
                      <i className="fas fa-users fa-2x mb-2 text-primary"></i>
                      <h6
                        className="fw-bold mb-1"
                        style={{ fontSize: "0.85rem", color: "#2c3e50" }}
                      >
                        My Workers
                      </h6>
                      <div
                        className="fw-bold mb-1"
                        style={{ fontSize: "1.5rem", color: "#667eea" }}
                      >
                        {shopKepperWorkers?.length || 0}
                      </div>
                      <div
                        className="text-muted"
                        style={{ fontSize: "0.75rem" }}
                      >
                        Active
                      </div>
                    </div>
                  </div>
                </div>

                {/* Services Card */}
                <div className="col-6 col-md-6">
                  <div
                    className="card h-100 border-0 shadow-sm"
                    onClick={() => navigate("/admin/shopKepper/shop/services")}
                    style={{
                      cursor: "pointer",
                      transition: "all 0.3s ease",
                      borderRadius: "12px",
                      backgroundColor: "#f8f9fa",
                    }}
                    onMouseOver={(e) =>
                      (e.currentTarget.style.transform = "translateY(-2px)")
                    }
                    onMouseOut={(e) =>
                      (e.currentTarget.style.transform = "translateY(0)")
                    }
                  >
                    <div className="card-body text-center p-3">
                      <i className="fas fa-tools fa-2x mb-2 text-success"></i>
                      <h6
                        className="fw-bold mb-1"
                        style={{ fontSize: "0.85rem", color: "#2c3e50" }}
                      >
                        My Services
                      </h6>
                      <div
                        className="fw-bold mb-1"
                        style={{ fontSize: "1.5rem", color: "#11998e" }}
                      >
                        {shop?.servicesOffered?.length || 0}
                      </div>
                      <div
                        className="text-muted"
                        style={{ fontSize: "0.75rem" }}
                      >
                        Offered
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Rating Summary */}
              <div className="border-top pt-4 mt-2">
                <div className="d-flex align-items-center justify-content-center mb-3">
                  <div
                    className="rounded-circle bg-warning bg-opacity-10 p-2 me-2"
                    style={{ width: "36px", height: "36px" }}
                  >
                    <i className="fas fa-chart-pie text-warning"></i>
                  </div>
                  <h5 className="fw-bold mb-0" style={{ color: "#2c3e50" }}>
                    Rating Summary
                  </h5>
                </div>

                {shop?.reviews?.length !== 0 ? (
                  <div className="d-flex justify-content-center">
                    <PieChart reviews={ratingCounts} />
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <i className="fas fa-chart-pie fa-3x text-muted mb-3 opacity-25"></i>
                    <p className="text-muted mb-0">No reviews yet</p>
                    <small className="text-muted">
                      Chart will appear once you receive reviews
                    </small>
                  </div>
                )}
              </div>
            </div>

            {/* Reviews Section */}
            <div
              className="card-body border-top p-3 p-md-4"
              style={{ backgroundColor: "#f8f9fa" }}
            >
              <div className="d-flex align-items-center justify-content-center mb-3">
                <div
                  className="rounded-circle bg-warning bg-opacity-10 p-2 me-2"
                  style={{ width: "36px", height: "36px" }}
                >
                  <i className="fas fa-star text-warning"></i>
                </div>
                <h5 className="fw-bold mb-0" style={{ color: "#2c3e50" }}>
                  Reviews & Ratings
                </h5>
              </div>

              {shop?.reviews?.length > 0 ? (
                <>
                  {/* Average Rating Display */}
                  <div
                    className="card border-0 shadow-sm mb-3"
                    style={{ borderRadius: "12px" }}
                  >
                    <div className="card-body text-center py-3">
                      <div className="d-flex align-items-center justify-content-center gap-2 mb-1">
                        <i className="fas fa-star text-warning fa-lg"></i>
                        <span
                          className="fw-bold"
                          style={{ fontSize: "1.5rem", color: "#2c3e50" }}
                        >
                          {findAverageRating(shop?.reviews)}
                        </span>
                        <span
                          className="text-muted"
                          style={{ fontSize: "1.1rem" }}
                        >
                          /5
                        </span>
                      </div>
                      <div className="text-muted small">
                        Based on {shop?.reviews.length} review
                        {shop?.reviews.length !== 1 ? "s" : ""}
                      </div>
                      <div
                        className="text-muted"
                        style={{ fontSize: "0.75rem" }}
                      >
                        Showing {startIndex + 1}-
                        {Math.min(
                          startIndex + reviewsPerPage,
                          shop?.reviews.length
                        )}{" "}
                        of {shop?.reviews.length}
                      </div>
                    </div>
                  </div>

                  {/* Reviews List */}
                  <div className="row g-3 mb-3">
                    {currentReviews?.map((review, index) => (
                      <div key={index} className="col-12">
                        <div
                          className="card border-0 shadow-sm h-100"
                          style={{ borderRadius: "12px" }}
                        >
                          <div className="card-body p-3">
                            <div className="d-flex justify-content-between align-items-start mb-2">
                              <div className="d-flex align-items-center gap-2">
                                <div
                                  className="rounded-circle bg-primary bg-opacity-10 d-flex align-items-center justify-content-center"
                                  style={{ width: "36px", height: "36px" }}
                                >
                                  <i
                                    className="fas fa-user text-primary"
                                    style={{ fontSize: "0.9rem" }}
                                  ></i>
                                </div>
                                <div>
                                  <div
                                    className="fw-bold"
                                    style={{ fontSize: "0.9rem" }}
                                  >
                                    {review.name}
                                    <i
                                      className="fa-solid fa-circle-check text-success ms-2"
                                      style={{ fontSize: "0.8rem" }}
                                    ></i>
                                  </div>
                                  <small
                                    className="text-muted"
                                    style={{ fontSize: "0.75rem" }}
                                  >
                                    {new Date(review.date).toLocaleDateString(
                                      "en-US",
                                      {
                                        year: "numeric",
                                        month: "short",
                                        day: "numeric",
                                      }
                                    )}
                                  </small>
                                </div>
                              </div>
                              <div>
                                {[...Array(5)].map((_, i) => (
                                  <i
                                    key={i}
                                    className={`fa-solid fa-star ${
                                      i < review.rate
                                        ? "text-warning"
                                        : "text-secondary opacity-25"
                                    }`}
                                    style={{ fontSize: "0.8rem" }}
                                  ></i>
                                ))}
                              </div>
                            </div>
                            <p
                              className="text-muted mb-0"
                              style={{ fontSize: "0.85rem", lineHeight: 1.5 }}
                            >
                              {review.msg}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Pagination */}
                  {shop?.reviews.length > reviewsPerPage && (
                    <div className="d-flex justify-content-center gap-2">
                      <button
                        className="btn btn-outline-primary"
                        onClick={handleBackPage}
                        disabled={page === 0}
                        style={{ borderRadius: "10px", minWidth: "100px" }}
                      >
                        <i className="fa-solid fa-chevron-left me-2"></i>
                        Previous
                      </button>
                      <button
                        className="btn btn-outline-primary"
                        onClick={handleNextPage}
                        disabled={startIndex + reviewsPerPage >= reviews.length}
                        style={{ borderRadius: "10px", minWidth: "100px" }}
                      >
                        Next
                        <i className="fa-solid fa-chevron-right ms-2"></i>
                      </button>
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center py-5">
                  <div
                    className="rounded-circle bg-secondary bg-opacity-10 d-inline-flex align-items-center justify-content-center mb-3"
                    style={{ width: "80px", height: "80px" }}
                  >
                    <i className="fas fa-comments fa-2x text-secondary opacity-50"></i>
                  </div>
                  <h6 className="fw-bold text-secondary">No Reviews Yet</h6>
                  <p className="text-muted small mb-0">
                    Be the first to receive a review from your customers!
                  </p>
                </div>
              )}
            </div>
          </div>
        </>
      )}

      {isEditDataModalOpen && (
        <div
          className="modal fade show d-block"
          tabIndex="-1"
          style={{
            backgroundColor: "rgba(0, 0, 0, 0.6)",
            backdropFilter: "blur(3px)",
          }}
        >
          <div className="modal-dialog modal-sm modal-dialog-centered">
            <div className="modal-content shadow-sm border-0 rounded-4">
              {/* Header */}
              <div
                className="modal-header text-white py-2 px-3"
                style={{ backgroundColor: "#0d6efd" }}
              >
                {isProfilePictureUpdate ? (
                  <h6 className="modal-title m-0">
                    <i className="fa-solid fa-plus me-2"></i>Update Profile
                    Picture
                  </h6>
                ) : (
                  <h6 className="modal-title m-0">
                    <i className="fa-solid fa-pen-to-square me-2"></i>Update
                    Info
                  </h6>
                )}
                <button
                  type="button"
                  className="btn-close btn-close-white"
                  onClick={() => {
                    setIsEditDataModalOpen(false);
                  }}
                ></button>
              </div>

              {/* Body */}
              <div className="modal-body text-center p-4">
                {isProfilePictureUpdate ? (
                  <div className="mb-3 text-center">
                    <label
                      htmlFor="profilePicture"
                      className="form-label fw-bold"
                    >
                      Upload New Picture
                    </label>
                    <div className="d-flex justify-content-center mb-2">
                      <div
                        style={{
                          width: "130px",
                          height: "130px",
                          borderRadius: "50%",
                          overflow: "hidden",
                          border: "2px solid #ddd",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          backgroundColor: "#f8f9fa",
                        }}
                      >
                        {shopPicture ? (
                          <img
                            src={
                              URL.createObjectURL(shopPicture) ||
                              shop.shopPicture
                            }
                            alt="Profile Preview"
                            style={{
                              width: "100%",
                              height: "100%",
                              objectFit: "cover",
                            }}
                          />
                        ) : (
                          <i
                            className="fa-solid fa-shop"
                            style={{ fontSize: "68px", color: "#aaa" }}
                          ></i>
                        )}
                      </div>
                    </div>
                    {pictureUploadLoading && (
                      <div
                        class="progress"
                        role="progressbar"
                        aria-label="Example with label"
                        aria-valuenow="25"
                        aria-valuemin="0"
                        aria-valuemax="100"
                      >
                        <div
                          class="progress-bar"
                          style={{ width: { pictureWidthLoad } }}
                        >
                          {pictureWidthLoad}
                          {"%"}
                        </div>
                      </div>
                    )}
                    <input
                      type="file"
                      className="form-control mt-3"
                      name="shopPicture"
                      accept="image/*"
                      onChange={handleChange}
                    />
                  </div>
                ) : (
                  <>
                    <div className="form-floating mb-3">
                      <input
                        type="text"
                        className="form-control"
                        name="shopName"
                        id="nameInput"
                        placeholder="Enter your Shop name"
                        value={shopName || shop?.shopName}
                        onChange={handleChange}
                      />
                      <label htmlFor="nameInput">
                        Shop Name<span className="text-danger">*</span>
                      </label>
                    </div>

                    <div className="form-floating mb-3">
                      <textarea
                        className="form-control"
                        name="shopAddress"
                        id="shopAddressInput"
                        placeholder="Enter your address"
                        value={shopAddress || shop?.shopAddress}
                        onChange={handleChange}
                        style={{ height: "100px" }}
                      ></textarea>
                      <label htmlFor="shopAddressInput">
                        Shop Address<span className="text-danger">*</span>
                      </label>
                    </div>
                    <div className="form-floating mb-3">
                      <textarea
                        className="form-control"
                        name="currentLocation"
                        id="currentLocationInput"
                        placeholder="Your Current Location"
                        value={currentLocation || shop?.location?.area}
                        onChange={handleChange}
                        style={{ height: "100px" }}
                        disabled={true}
                      ></textarea>
                      <label htmlFor="currentLocationInput">
                        Shop Current Location
                        <span className="text-danger">*</span>
                      </label>
                    </div>
                    {isEditCurrentLocation && (
                      <>
                        <div className="d-flex align-items-center my-3">
                          <hr
                            className="flex-grow-1"
                            style={{
                              borderTop: "3px solid black",
                              borderRadius: "5px",
                              margin: 0,
                            }}
                          />
                          <span
                            className="fw-bold mx-3"
                            style={{ color: "#ff6600" }}
                          >
                            OR
                          </span>
                          <hr
                            className="flex-grow-1"
                            style={{
                              borderTop: "3px solid black",
                              borderRadius: "5px",
                              margin: 0,
                            }}
                          />
                        </div>
                        <div>
                          <button
                            type="button"
                            className="btn btn-primary mb-3 w-100"
                            onClick={() => setMapModal(true)}
                          >
                            <i class="fa-solid fa-map-location-dot me-2"></i>
                            Select Location on Map
                          </button>
                        </div>
                      </>
                    )}
                    {!isEditCurrentLocation && (
                      <div className="mt-3">
                        <div
                          style={{
                            backgroundColor: "#fff3cd",
                            color: "#856404",
                            padding: "5px 10px",
                            borderRadius: "8px",
                            fontSize: "14px",
                            border: "1px solid #ffeeba",
                          }}
                        >
                          <strong>Note:</strong> The{" "}
                          <b>shop's current location</b> is set to your already
                          configured location. To change the current location,
                          press the <b>"Change My Shop Location"</b> button
                          below. The system will then automatically fetch and
                          set your shop's current location.
                          <button
                            className="btn btn-warning btn-sm mt-3 mb-2"
                            onClick={fetchLocation}
                            disabled={pictureUploadLoading}
                          >
                            {pictureUploadLoading ? (
                              <>
                                <span
                                  className="spinner-border spinner-border-sm me-2"
                                  role="status"
                                  aria-hidden="true"
                                ></span>
                                <span>Fetching Location...</span>
                              </>
                            ) : (
                              <>Change My Shop Location</>
                            )}
                          </button>
                        </div>
                      </div>
                    )}

                    {/* {isEditCurrentLocation && (
                      <>
                        <div className="d-flex align-items-center my-3">
                          <hr
                            className="flex-grow-1"
                            style={{
                              borderTop: "3px solid black",
                              borderRadius: "5px",
                              margin: 0,
                            }}
                          />
                          <span
                            className="fw-bold mx-3"
                            style={{ color: "#ff6600" }}
                          >
                            OR
                          </span>
                          <hr
                            className="flex-grow-1"
                            style={{
                              borderTop: "3px solid black",
                              borderRadius: "5px",
                              margin: 0,
                            }}
                          />
                        </div>
                        <button
                          type="button"
                          className="btn btn-primary w-100 fw-bold mb-2"
                          onClick={handleUpdateData}
                        >
                          Choose From Map
                          <i className="fa-solid fa-map-location-dot ms-2"></i>
                        </button>
                      </>
                    )} */}
                  </>
                )}
                <div>
                  {/* Button */}
                  <button
                    className="btn btn-primary mt-2 w-100 rounded-pill fw-semibold"
                    disabled={updatingLoading}
                    onClick={handleUpdateData}
                  >
                    {updatingLoading ? (
                      <>
                        <span
                          className="spinner-border spinner-border-sm me-2"
                          role="status"
                          aria-hidden="true"
                        ></span>
                        <span>Updating...</span>
                      </>
                    ) : (
                      <>Update</>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {mapModal && (
        <div
          className="modal fade show d-block "
          tabIndex="-1"
          style={{
            backgroundColor: "rgba(0, 0, 0, 0.6)",
            backdropFilter: "blur(2px)",
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
                <h6 className="modal-title m-0">Select Your Location</h6>
              </div>

              {/* Body */}
              <div className="modal-body">
                <div className="form-floating mb-3">
                  <textarea
                    className="form-control"
                    id="area"
                    name="area"
                    placeholder="Area"
                    value={
                      selectedArea?.areaName ||
                      currentLocation ||
                      shop?.location?.area
                    }
                    style={{ height: "110px" }}
                    disabled={true}
                    required
                  />
                  <label htmlFor="area">Current Location (Auto Fetched)</label>
                </div>
                <div style={{ height: "420px", width: "100%" }}>
                  <Suspense fallback={<h2>Loading...</h2>}>
                    <MyMap
                      onLocationSelect={setSelectedArea}
                      initialLocation={selectedArea ? selectedArea : null}
                    />
                  </Suspense>
                </div>

                <button
                  className="btn btn-primary w-100  mt-3"
                  onClick={handleSetLocation}
                >
                  Save Location
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default MyShop;
