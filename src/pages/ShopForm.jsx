import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import shop from "../images/shop.png";
import { toast, Toaster } from "react-hot-toast";
import imageCompression from "browser-image-compression";
import "react-toastify/dist/ReactToastify.css";
import axios from "axios";
import Swal from "sweetalert2";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";
import successAudio from "../sounds/success.mp3";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";
import { services } from "../components/servicesData";
function ShopForm() {
  const navigate = useNavigate();
  const location = useLocation();

  const [formData1, setFormData] = useState({
    shopPicture: null,
    paymentPicture: null,
    shopName: "",
    shopAddress: "",
    license: "",
    currentLocation: "",
  });

  const [loading, setLoading] = useState(false);
  const [latitude, setLatitude] = useState(33.6844);
  const [longitude, setLongitude] = useState(73.0479);
  const [areaName, setAreaName] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedSubCategory, setSelectedSubCategory] = useState({});
  const [selectedServices, setSelectedServices] = useState([]);
  const [coordinates, setCoordinates] = useState([]);
  const [locationName, setLocationName] = useState("");
  const [position, setPosition] = useState([33.6844, 73.0479]);
  const [showModal, setShowModal] = useState(false);
  const [successAnimation, setSuccessAnimation] = useState(false);
  const [priceModal, setPriceModal] = useState(false);
  const [isVariablePricing, setIsVariablePricing] = useState(false);
  const [price, setPrice] = useState("");
  const [description, setDescription] = useState("");

  const lid = localStorage.getItem("userId");
  const ShopKepperId = location?.state?.id || null;

  const id = lid || ShopKepperId;
  console.log("bydirectId", id);
  console.log("indirect", ShopKepperId);

  const [recommendedPrice, setRecommendedPrice] = useState(0);

  const getRecomendedPrice = async () => {
    const payload = {
      category: selectedCategory,
      subCategory: selectedSubCategory,
    };

    try {
      const response = await axios.post(
        "https://hazir-hay-backend.vercel.app/shops/getPriceEstimate",
        payload
      );

      if (response.data.success) {
        setRecommendedPrice(response.data.averagePrices || 0);
        console.log(`Recommended Price: ${response.data.averagePrices}`);
      }
    } catch (error) {
      console.error("Error fetching price:", error);
    }
  };

  useEffect(() => {
    if (selectedCategory && selectedSubCategory) {
      getRecomendedPrice();
    }
  }, [selectedCategory, selectedSubCategory]);

  useEffect(() => {
    if (successAnimation) {
      const audio = new Audio(successAudio);
      audio.play().catch((err) => {
        console.error("Autoplay blocked:", err);
      });
    }
  }, [successAnimation]);
  const customIcon = L.icon({
    iconUrl: markerIcon,
    shadowUrl: markerShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
  });
  const closeMap = () => {
    setShowModal(false);
  };

  const handleSaveLocation = () => {
    setFormData((pre) => ({
      ...pre,
      currentLocation: locationName,
    }));

    setShowModal(false);
    console.log(position);
  };
  const handleChange = async (e) => {
    const { name, files, value } = e.target;

    if (name === "shopPicture" || name === "paymentPicture") {
      const file = files[0];
      if (!file) return;

      try {
        const options = {
          maxSizeMB: 0.6,
          maxWidthOrHeight: 800,
          useWebWorker: true,
        };

        const compressedFile = await imageCompression(file, options);

        setFormData((prev) => ({
          ...prev,
          [name]: compressedFile,
        }));
      } catch (error) {
        console.error("Image compression failed:", error);
      }
    }
    // TEXT INPUTS
    else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  useEffect(() => {
    if (priceModal) {
      window.scrollTo({ top: 500, behavior: "smooth" });
    } else {
      window.scrollTo({
        top: document.documentElement.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [priceModal]);

  useEffect(() => {
    const fetchLocation = async () => {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const lat = position?.coords?.latitude ?? 33;
          const lon = position?.coords?.longitude ?? 73;
          if (lat === null) {
            alert("lat null");
          }

          setLatitude(lat);
          setLongitude(lon);
          setCoordinates(lat, lon);
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

            setAreaName(name);
            setFormData((prev) => ({
              ...prev,
              currentLocation: `${lat}, ${lon}, ${name}`,
            }));
          } catch (error) {
            console.error("Error fetching area name:", error);
          }
        },
        (error) => {
          console.error("Error getting location:", error);
        }
      );
    };

    fetchLocation();
  }, []);

  const handleSelectSubCat = () => {
    if(price === ""){
      toast.error("Price cannot be empty!")
      return;
    }
    const subCat = {
      name: selectedSubCategory,
      price,
      description,
      isVariablePricing,
    };
    setSelectedServices((pre) => [
      ...pre,
      { category: selectedCategory, subCategory: subCat },
    ]);
    setPrice("");
    setIsVariablePricing(false);
    setDescription("");
    setPriceModal(false);
    setRecommendedPrice([]);
    console.log(subCat);
    console.log(selectedCategory);
  };

  const handleDeleteService = async (service) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      html: `Are you sure to delete category :- <strong>${service.category}</strong> and subCategory :- <strong>${service.subCategory.name}</strong>`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
    });

    if (!result.isConfirmed) return;
    setSelectedServices((prev) =>
      prev.filter((item) => item.subCategory !== service.subCategory)
    );
  };

  const handleSubmit = async (e) => {
    setLoading(true);
    e.preventDefault();

    if (!formData1.shopName.trim()) {
      toast.error("Shop Name cannot be empty");
      setLoading(false);
      return;
    }
    if (!formData1.shopAddress.trim()) {
      toast.error("Shop address cannot be empty");
      setLoading(false);
      return;
    }
    if (selectedServices.length === 0) {
      toast.error("Please Provide Service");
      setLoading(false);
      return;
    }
    if (formData1.paymentPicture === null) {
      toast.error("Upload Payment ScreenShot");
      setLoading(false);
      return;
    }

    try {
      const finalAreaName =
        locationName.trim() === "" ? areaName : locationName;
      const formData = new FormData();
      formData.append("shopName", formData1.shopName);
      formData.append("shopAddress", formData1.shopAddress);
      formData.append("shopPicture", formData1.shopPicture);
      formData.append("paymentPicture", formData1.paymentPicture);
      formData.append("coordinates", JSON.stringify(position));
      formData.append("area", finalAreaName);
      formData.append("services", JSON.stringify(selectedServices));

      const response = await axios.post(
        `https://hazir-hay-backend.vercel.app/admin/shopInformation/${id}`,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );
      if (response.status === 200) {
        window.scrollTo({ top: 0, behavior: "smooth" });

        setTimeout(() => {
          setSuccessAnimation(true);
        }, 400);
        setLoading(false);
      }
    } catch (error) {
      setLoading(false);

      console.error("Error submitting shop information:", error);

      const backendMessage =
        error.response?.data?.message ||
        error.response?.data?.error ||
        (error.code === "ERR_NETWORK"
          ? "Network error! Please check your internet connection."
          : null) ||
        "Failed to store shop information.";

      toast.error(backendMessage);
    }
  };
  const handleCategoryChange = (e) => {
    setSelectedCategory(e.target.value);
    setSelectedSubCategory("");
  };
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
      setLocationName(name);
      return name;
    } catch (error) {
      console.error("Error fetching area name:", error);
    }
  };

  const handleLocationSelect = async (lat, lon) => {
    const name = await fetchAreaName(lat, lon);
    setLocationName(name);
  };

  const toggleVariable = () => {
    setIsVariablePricing(!isVariablePricing);
  };

  const logOutAndGoMain =()=>{
    localStorage.clear();
    navigate("/")
  }

  return (
    <div className="container ">
      <Toaster />

      <h1 className="mx-3 fw-bold mt-3">Your Shop’s Journey Starts Here</h1>
      <h3 className="mx-3 fw-bold" style={{ color: "#ff6600" }}>
        Turn Your Shop Into a Success Story
      </h3>
      <p className="mx-3">
        Share your shop details today — attract the right customers, grow your
        reach, and boost your sales like never before.
      </p>

      <div className="text-center ">
        <img src={shop} style={{ width: "230px", height: "230px" }} />
      </div>

      <form className="shadow-sm p-4 rounded bg-light">
        <div className="mb-3 text-center">
          <label htmlFor="profilePicture" className="form-label fw-bold">
            Shop Picture
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
                  src={URL.createObjectURL(formData1.shopPicture)}
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
          <input
            type="file"
            className="form-control mt-3"
            name="shopPicture"
            accept="image/*"
            onChange={handleChange}
          />
        </div>

        <div className="form-floating mb-3">
          <input
            type="text"
            className="form-control"
            name="shopName"
            id="nameInput"
            placeholder="Enter your Shop name"
            value={formData1.shopName}
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
            value={formData1.shopAddress}
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
            value={formData1.currentLocation}
            onChange={handleChange}
            style={{ height: "100px" }}
            disabled={true}
          ></textarea>
          <label htmlFor="currentLocationInput">
            Shop Current Location<span className="text-danger">*</span>
          </label>
        </div>

        <div className="d-flex align-items-center my-3">
          <hr
            className="flex-grow-1"
            style={{
              borderTop: "3px solid black",
              borderRadius: "5px",
              margin: 0,
            }}
          />
          <span className="fw-bold mx-3" style={{ color: "#ff6600" }}>
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
          onClick={() => setShowModal(true)}
        >
          Choose From Map
          <i className="fa-solid fa-map-location-dot ms-2"></i>
        </button>

        <h2 className="fw-bold mt-4" style={{ color: "#ff6600" }}>
          Which Services Do You Offer?
        </h2>
        <p className="text-muted">
          Tip: You can select multiple options to match all the services you
          provide.
        </p>

        <div>
          <select
            className="form-select mb-3"
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
            className="form-select mb-3"
            value={selectedSubCategory}
            onChange={(e) => {
              setSelectedSubCategory(e.target.value);
              setPriceModal(true);
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

        <h4 className="fw-bold text-center mb-2" style={{ color: "#ff6600" }}>
          Services Summary
        </h4>
        {selectedServices.length !== 0 && (
          <p className="note-text mt-3 text-center">
            <strong>Note:</strong> Tap on any data entry below to{" "}
            <span className="text-danger fw-bold">delete</span> it from the
            summary table.
          </p>
        )}

        <div style={{ maxHeight: "200px", overflowY: "auto" }}>
          <table className="table table-striped table-hover table-responsive">
            <thead>
              <tr>
                <th scope="col">#</th>
                <th scope="col">Category</th>
                <th scope="col" className="text-nowrap">
                  Sub Category
                </th>
                <th scope="col">Price</th>
                <th scope="col" className="text-nowrap">
                  Variable Pricing
                </th>
              </tr>
            </thead>
            <tbody>
              {selectedServices.length > 0 ? (
                selectedServices.map((sub, index) => (
                  <tr
                    key={sub.id}
                    onClick={() => handleDeleteService(sub)}
                    style={{ fontSize: "0.8rem" }}
                  >
                    <td>{index + 1}</td>
                    <td>{sub.category}</td>
                    <td>{sub.subCategory.name}</td>
                    <td>{sub.subCategory.price}</td>
                    <td className="text-center">
                      <input
                        type="checkbox"
                        className="form-checkbox"
                        disabled={true} 
                        checked={sub.subCategory.isVariablePricing || false}
                      />
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="text-center">
                    No services found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className=" mt-4">
          <h5 className="fw-bold mb-3 text-primary">
            Registration Fee: Rs. 1000/-
          </h5>

          <p className="text-secondary mb-3">
            To activate your shop on Hazir Hay, please send the one-time
            registration fee (Valid for 1 Year) and upload the payment screenshot below.
          </p>

          <div className="p-3 rounded" style={{ background: "#f8f9fa" }}>
            <p className="fw-semibold mb-2">
              <i className="fa-solid fa-wallet me-2 text-primary"></i>
              JazzCash Details
            </p>

            <p className="mb-1">
              <i className="fa-solid fa-phone me-2 text-secondary"></i>
              <strong>0326 6783442</strong>
            </p>

            <p className="mb-0">
              <i className="fa-solid fa-user me-2 text-secondary"></i>
              <strong>Burhan Ali</strong>
            </p>
          </div>

          <p className="mt-3 text-secondary">
            After payment, upload the <strong>payment screenshot</strong> to
            continue.
          </p>
        </div>

        <div className="mb-3 mt-3">
          <label className="form-label">Payment Screenshot</label>
          <input
            type="file"
            className="form-control"
            name="paymentPicture"
            id="payment"
            onChange={handleChange}
            accept="image/*"
            required
          />
        </div>

        {formData1.paymentPicture && (
          <img
            src={URL.createObjectURL(formData1.paymentPicture)}
            alt="Payment Picture"
            style={{ width: "200px", height: "300px", objectFit: "cover" }}
          />
        )}

        <button
          type="submit"
          className="btn btn-primary w-100 fw-bold mt-3"
          onClick={handleSubmit}
          disabled={loading}
        >
          {loading ? (
            <>
              <span role="status">Please Wait Saving your Shop...</span>
              <span
                className="spinner-grow spinner-grow-sm ms-2"
                aria-hidden="true"
              ></span>
            </>
          ) : (
            <>
              <i className="fa-solid fa-shop me-2"></i>
              Save Shop
            </>
          )}
        </button>
      </form>

      {showModal && (
        <div
          className="modal fade show d-block"
          tabIndex="-1"
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
        >
          <div className="modal-dialog modal-lg modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Select Location</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={closeMap}
                ></button>
              </div>
              <div className="modal-body" style={{ height: "600px" }}>
                <div className="form-floating mb-3">
                  <textarea
                    className="form-control"
                    name="currentLocation"
                    id="currentLocationInput"
                    placeholder="Your Current Location"
                    value={locationName}
                    style={{ height: "100px" }}
                    disabled={true}
                  ></textarea>
                  <label htmlFor="currentLocationInput">
                    Selected Current Location
                  </label>
                </div>
                <div style={{ height: "460px", width: "100%" }}>
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
                  onClick={closeMap}
                >
                  Close
                </button>
                <button
                  type="button"
                  className="btn btn-success"
                  onClick={handleSaveLocation}
                >
                  Save Location
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {successAnimation && (
        <>
          {/* Backdrop */}
          <div
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              width: "100vw",
              height: "100vh",
              backgroundColor: "rgba(0,0,0,0.5)",
              zIndex: 9998,
            }}
            onClick={() => setSuccessAnimation(false)}
          />

          {/* Success Modal */}
          <div
            style={{
              position: "fixed",
              bottom: 0,
              left: 0,
              width: "100%",
              height: "55vh",
              backgroundColor: "#fff",
              borderTopLeftRadius: "14px",
              borderTopRightRadius: "14px",
              zIndex: 9999,
            }}
            className="d-flex flex-column justify-content-center align-items-center text-center p-4"
          >
            <button
              className="btn-close position-absolute"
              style={{ top: 15, right: 15 }}
              onClick={logOutAndGoMain}
            ></button>

            <DotLottieReact
              src="https://lottie.host/d78f201d-181a-450c-803f-43ab471ef7f1/ENnJonrsix.lottie"
              loop
              autoplay
              style={{ width: "225px", height: "185px" }}
            />

            <h4 className="text-success">🎉 Account Created Successfully!</h4>
            <p className="mt-2 " style={{ maxWidth: "600px" }}>
              {" "}
              Thank you for registering with <strong>Hazir Hay</strong>! We’re
              thrilled to have you on board —{" "}
              <em>Anything, Anytime, Anywhere</em>, Hazir Hay!{" "}
            </p>

            <button
              onClick={logOutAndGoMain}
              className="btn btn-outline-success mt-2 d-flex align-items-center gap-2"
            >
              <i className="fas fa-sign-in-alt"></i>
              Go to Login
            </button>
          </div>
        </>
      )}

      {priceModal && (
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
                <h6 className="modal-title m-0">Adjust the Price</h6>
                <button
                  type="button"
                  className="btn-close btn-close-white"
                  aria-label="Close"
                  onClick={() => {
                    setPriceModal(false);
                    setRecommendedPrice([]);
                    setSelectedCategory(null);
                    setSelectedSubCategory(null);
                    setPrice("");
                    setDescription("");
                  }}
                ></button>
              </div>

              {/* Body */}
              <div className="modal-body">
                <p className="text-center mb-3">
                  Set price of{" "}
                  <strong>
                    {selectedSubCategory} ({selectedCategory})
                  </strong>{" "}
                  for <strong>transparency</strong> and <strong>trust</strong>.
                </p>

                {/* Price Input */}
                <label className="form-label fw-semibold small mb-1">
                  Enter Price
                </label>
                <input
                  type="number"
                  className="form-control form-control-sm "
                  placeholder="Enter starting minimum amount"
                  style={{height : "40px", fontSize : "16px"}}
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                />

                <p className="fw-bold mt-2">
                  Recommended Price{" "}
                  <i className="fa-solid fa-lightbulb text-warning"></i>
                </p>

                {recommendedPrice?.length > 0 ? (
                  <div className="d-flex flex-wrap gap-2 mb-2">
                    {recommendedPrice?.map((price, index) => (
                      <button
                        key={index}
                        className=" btn btn-outline-primary"
                        onClick={() => setPrice(price)}
                      >
                        {price} PKR
                      </button>
                    ))}
                  </div>
                ) : (
                  <>
                    <p className="mb-3 mt-0 text-primary fw-bold text-center">
                      No Recommended Price Found
                      <i class="fa-solid fa-face-frown ms-1"></i>
                    </p>
                  </>
                )}
                <div className="mt-3 mb-2">
                  <div
                    style={{
                      backgroundColor: "#fff3cd",
                      color: "#856404",
                      padding: "10px 15px",
                      borderRadius: "8px",
                      fontSize: "14px",
                      border: "1px solid #ffeeba",
                    }}
                  >
                    <strong>Note:</strong> If your price is not fixed for this
                    category, please enter the minimum starting price in the
                    above field and tick the "Variable Pricing" checkbox below.
                  </div>
                </div>

                <label className="mt-2 mb-2">
                  <input
                    type="checkbox"
                    className="form-check-input me-2"
                    checked={isVariablePricing}
                    onChange={toggleVariable}
                  />
                  Variable Pricing (Depends on work)
                </label>

                {/* Description Input */}
                <label className="form-label fw-semibold small mb-1">
                  Description
                </label>
                <textarea
                  className="form-control form-control-sm"
                  rows="2"
                  placeholder="E.g. This price is for 1kg gas"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                ></textarea>

                <button
                  className="btn btn-primary w-100  mt-3"
                  onClick={handleSelectSubCat}
                >
                  <i className="fas fa-save"></i> Save Service
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

       
    </div>
  );
}

export default ShopForm;
