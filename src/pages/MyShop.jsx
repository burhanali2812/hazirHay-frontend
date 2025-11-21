import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import PieChart from "../components/PieChart";
import { useAppContext } from "../context/AppContext";
import axios from "axios";
import imageCompression from "browser-image-compression";
import toast from "react-hot-toast";
function MyShop() {
  const { setKey, shopKepperWorkers, shop } = useAppContext();

  const [isViewFull, setIsViewFull] = useState(false);
  const [isEditDataModalOpen, setIsEditDataModalOpen] = useState(false);
  const [isProfilePictureUpdate, setISProfilePictureUpdate] = useState(false);
  const [pictureUploadLoading, setPictureUploadLoading] = useState(false);
  const [isEditCurrentLocation, setISEditCurrentLocation] = useState(false);
  const [pictureWidthLoad, setPictureWidthLoad] = useState(0);
    const [position, setPosition] = useState([33.6844, 73.0479]);
      const [areaName, setAreaName] = useState("");
  const [page, setPage] = useState(0);
  const [formData1, setFormData] = useState({
    shopPicture: null,
    shopName: "",
    shopAddress: "",
    currentLocation: "",
  });
  const navigate = useNavigate();
  useEffect(() => {
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
      setPictureWidthLoad(0)
      setPictureUploadLoading(true);
      const file = files[0];
      setPictureWidthLoad(25)
      console.log("Profile picture:", file);

      if (file) {
        setPictureWidthLoad(50)
        try {
          const options = {
            maxSizeMB: 0.6,
            maxWidthOrHeight: 800,
            useWebWorker: true,
          };
          setPictureWidthLoad(75)

          // Compress the file
          const compressedFile = await imageCompression(file, options);
          console.log("Compressed file:", compressedFile);
          setPictureWidthLoad(100)

          // Update form data with compressed file
          setFormData({ ...formData1, shopPicture: compressedFile });
          setPictureUploadLoading(false);
        } catch (error) {
          console.error("Compression failed:", error);
           setPictureUploadLoading(false);
           setPictureWidthLoad(0)
        }
      }
    } else {
      setFormData({ ...formData1, [name]: value });
    }
  };
      const fetchLocation = async () => {
        setPictureUploadLoading(true)
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

              toast.success("Successfully fetched current location!")
              setISEditCurrentLocation(true)
              setPictureUploadLoading(false)

            setAreaName(name);
            setFormData((prev) => ({
              ...prev,
              currentLocation: `${lat}, ${lon}, ${name}`,
            }));
          } catch (error) {
            console.error("Error fetching area name:", error);
            setPictureUploadLoading(false)
          }
        },
        (error) => {
          console.error("Error getting location:", error);
          setPictureUploadLoading(false)
        }
      );
    };

  return (
    <div className="container my-4 pb-5">
      {/* Back Button */}
      <div className="mb-4">
        <button
          className="btn btn-outline-primary d-flex align-items-center"
          onClick={() => window.history.back()}
        >
          <i className="fas fa-arrow-left me-2"></i> Back
        </button>
      </div>

      {/* Hero Banner */}
      <div
        className="position-relative rounded overflow-hidden shadow-sm"
        style={{
          height: "250px",
          backgroundColor: "#f8f9fa",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontWeight: "bold",
          fontSize: "24px",
          color: "#6c757d",
        }}
      >
        {shop?.shopPicture ? (
          <img
            src={shop.shopPicture}
            alt="Shop Banner"
            className="w-100 h-100"
            style={{ objectFit: "cover" }}
          />
        ) : (
          <span>Shop Banner</span>
        )}

        {/* Edit Icon */}
        <button
          className="btn btn-primary position-absolute top-0 end-0 m-3 shadow-sm d-flex justify-content-center align-items-center"
          style={{ height: "35px", width: "35px", borderRadius: "50%" }}
          title="Change Shop Picture"
          onClick={() => {
            setIsEditDataModalOpen(true);
            setISProfilePictureUpdate(true);
          }}
        >
          <i className="fas fa-pen"></i>
        </button>
      </div>

      {/* Floating Card */}
      <div
        className="card  shadow-lg"
        style={{
          marginTop: "-40px",
          borderRadius: "15px",
          padding: "20px",
        }}
      >
        <div className="d-flex justify-content-end">
          <i
            className="fa-solid fa-pen-to-square text-primary"
            style={{ fontSize: "20px" }}
            onClick={() => {
              setIsEditDataModalOpen(true);
              setISProfilePictureUpdate(false);
            }}
          ></i>
        </div>
        <div className="text-center">
          <h3 className="fw-bold">{shop?.shopName || "Shop Name"}</h3>
          <p className="mb-3">
            <i className="fas fa-map-marker-alt me-2"></i>{" "}
            {isViewFull
              ? shop?.location?.area
              : shop?.location?.area?.slice(0, 50) + "..."}
            <p
              className="text-primary fw-semibold"
              onClick={() => setIsViewFull(!isViewFull)}
            >
              {!isViewFull ? "show more" : "show less"}
            </p>
          </p>

          {/* Two Info Cards */}
          <div className="row g-3">
            {/* Workers Card */}
            <div className="col-md-6 col-6">
              <div
                className="card h-100 shadow-lg text-center hover-shadow bg-light border-0"
                onClick={() => navigate("/admin/shopKepper/workersList")}
              >
                <div className="card-body d-flex flex-column align-items-center justify-content-center">
                  <i className="fas fa-users fa-2x text-primary mb-3"></i>
                  <h6 className="card-title fw-bold">My Workers</h6>
                  <p className="card-text">
                    {shopKepperWorkers?.length || 0} Workers
                  </p>
                </div>
              </div>
            </div>

            {/* Services Card */}
            <div
              className="col-6 col-md-6"
              onClick={() => navigate("/admin/shopKepper/shop/services")}
            >
              <div className="card h-100 shadow-lg text-center hover-shadow bg-light border-0">
                <div className="card-body d-flex flex-column align-items-center justify-content-center">
                  <i className="fas fa-tools fa-2x text-success mb-3"></i>
                  <h6 className="card-title fw-bold">My Services</h6>
                  <p className="card-text">
                    {shop?.servicesOffered?.length || 0} Services
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="text-center" style={{ marginTop: "35px" }}>
            <h3 className="fw-bold mb-3">Quick Rating Summary</h3>

            {shop?.reviews?.length !== 0 ? (
              <div className="d-flex justify-content-center">
                <PieChart reviews={ratingCounts} />
              </div>
            ) : (
              <p className="text-muted text-center">
                Chart Not availble due to no reviews
              </p>
            )}
          </div>
        </div>

        <div>
          <h6 className="bg-warning p-2 rounded-3 text-center mt-4 mb-2">
            <i className="fa-solid fa-star-half-stroke me-2"></i>
            RATING & REVIEWS
          </h6>

          <div>
            {shop?.reviews?.length > 0 ? (
              <>
                {/* Average rating */}
                <div
                  className="d-flex align-items-center mb-2 mt-1 justify-content-center"
                  style={{ fontSize: "16px" }}
                >
                  <i className="fa-solid fa-star text-warning me-2"></i>
                  <span className="fw-bold fs-6">
                    {findAverageRating(shop?.reviews)}
                    /5
                  </span>
                  <span className="text-muted ms-2 small">
                    ({startIndex + 1}-
                    {startIndex + reviewsPerPage > shop?.reviews.length
                      ? shop?.reviews.length
                      : startIndex + reviewsPerPage}
                    {"/"}
                    {shop?.reviews.length} reviews)
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
                      <p className="mb-1 text-muted small">{review.msg}</p>
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

          {shop?.reviews?.length === 0 ? (
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
      </div>

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
                <h6 className="modal-title m-0">
                  <i className="fa-solid fa-plus me-2"></i>Upload Picture
                </h6>
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
                        {formData1.shopPicture ? (
                          <img
                            src={
                              URL.createObjectURL(formData1.shopPicture) ||
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
                        <div class="progress-bar" style={{ width: {pictureWidthLoad} }}>
                          {pictureWidthLoad}{"%"}
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
                        value={formData1.shopName || shop.shopName}
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
                        value={formData1.shopAddress || shop.shopAddress}
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
                        value={formData1.currentLocation || shop.location.area}
                        onChange={handleChange}
                        style={{ height: "100px" }}
                        disabled={true}
                      ></textarea>
                      <label htmlFor="currentLocationInput">
                        Shop Current Location
                        <span className="text-danger">*</span>
                      </label>
                    </div>
                  {
                    !isEditCurrentLocation && (
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
    <strong>Note:</strong> The <b>shop's current location</b> is set to your already configured location.  
    To change the current location, press the <b>"Change My Shop Location"</b> button below.  
    The system will then automatically fetch and set your shop's current location.
      <button className="btn btn-warning btn-sm mt-3 mb-2" onClick={fetchLocation}
      disabled = {pictureUploadLoading}
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
                      <>
                        Change My Shop Location
                      </>
                    )}
      </button>
  </div>


</div>
                    )
                  }

                  {
                    isEditCurrentLocation && (
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
                      // onClick={() => setShowModal(true)}
                    >
                      Choose From Map
                      <i className="fa-solid fa-map-location-dot ms-2"></i>
                    </button>
                      </>
                    )
                  }
                  </>
                )}
                <div>
                  {/* Button */}
                  <button className="btn btn-primary mt-2 w-100 rounded-pill fw-semibold">
                    {isEditDataModalOpen ? (
                      <>
                        <span
                          className="spinner-border spinner-border-sm me-2"
                          role="status"
                          aria-hidden="true"
                        ></span>
                        <span>Updating...</span>
                      </>
                    ) : (
                      <>
                        <i class="fa-solid fa-screwdriver-wrench me-2"></i>
                        Update
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default MyShop;
