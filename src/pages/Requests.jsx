import axios from "axios";
import { useEffect, useState } from "react";

import noData from "../images/noData.png";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { MapContainer, TileLayer, Marker, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { useAppContext } from "../context/AppContext";
import "./style.css";

function Requests() {
  const { getAllShopKepper } = useAppContext();
  const token = localStorage.getItem("token");

  // State for tabs
  const [activeTab, setActiveTab] = useState("shopkeeper");

  // Shopkeeper requests state
  const [shopWithShopkepper, setShopWithShopkepper] = useState([]);

  // Local shop requests state
  const [localShopRequests, setLocalShopRequests] = useState([]);

  // Loading states
  const [loading, setLoading] = useState(false);
  const [acceptLoadingId, setAcceptLoadingId] = useState(null);
  const [deleteLoadingId, setDeleteLoadingId] = useState(null);
  const [detailsLoadingId, setDetailsLoadingId] = useState(null);

  // Modal states
  const [detailsModal, setDetailsModal] = useState(false);
  const [selectedShopWithKeep, setSelectedShopWithKeep] = useState(null);
  const [showModal, setShowMOdal] = useState(false);

  // Local shop modal states
  const [localShopModal, setLocalShopModal] = useState(false);
  const [selectedLocalShop, setSelectedLocalShop] = useState(null);

  const [points, setPoints] = useState([33.6844, 73.0479]);

  useEffect(() => {
    if (selectedShopWithKeep?.shop?.location?.coordinates) {
      const coords = selectedShopWithKeep.shop.location.coordinates;
      console.log("Raw from DB:", coords);
      setPoints(coords);
    }
  }, [selectedShopWithKeep]);

  useEffect(() => {
    if (selectedLocalShop?.location?.coordinates) {
      const coords = selectedLocalShop.location.coordinates;
      setPoints(coords);
    }
  }, [selectedLocalShop]);

  const handleDetailsModal = (shopWithKepp) => {
    setSelectedShopWithKeep(shopWithKepp);
    setDetailsLoadingId(shopWithKepp._id);

    setTimeout(() => {
      setDetailsModal(true);
      setDetailsLoadingId(null);
    }, 500);
  };

  const handleLocalShopDetailsModal = (localShop) => {
    setSelectedLocalShop(localShop);
    setDetailsLoadingId(localShop._id);

    setTimeout(() => {
      setLocalShopModal(true);
      setDetailsLoadingId(null);
    }, 500);
  };

  const customIcon = new L.Icon({
    iconUrl: require("leaflet/dist/images/marker-icon.png"),
    iconSize: [25, 41],
    iconAnchor: [12, 41], // bottom center
    popupAnchor: [1, -34],
    shadowSize: [41, 41],
  });

  const getShopWithShopkeppers = async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        "https://hazir-hay-backend.vercel.app/shopKeppers/allShopkepperWithShops",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.status === 200) {
        console.log(response.data.data);
        setShopWithShopkepper(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching shopkeepers with shops:", error);
    } finally {
      setLoading(false);
    }
  };

  const getPendingLocalShops = async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        "https://hazir-hay-backend.vercel.app/localshop/getPendingLocalShops",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.success) {
        setLocalShopRequests(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching local shop requests:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === "shopkeeper") {
      getShopWithShopkeppers();
    } else {
      getPendingLocalShops();
    }
  }, [activeTab]);

  const handleAccept = async () => {
    setAcceptLoadingId(selectedShopWithKeep._id);
    const check = await approve(selectedShopWithKeep, "accept");
    if (check) {
      setDetailsModal(false);
    }
  };
  const handleDelete = async () => {
    setDeleteLoadingId(selectedShopWithKeep._id);
    const check = await approve(selectedShopWithKeep, "decline");
    if (check) {
      setDetailsModal(false);
    }
  };

  const approve = async (shopWithKeep, role) => {
    if (role === "accept") {
      setAcceptLoadingId(shopWithKeep._id);
    } else {
      setDeleteLoadingId(shopWithKeep._id);
    }

    const payload = {
      role,
    };

    try {
      const response = await axios.put(
        `https://hazir-hay-backend.vercel.app/shopKeppers/verifyShopKepper/${shopWithKeep._id}`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.status === 200) {
        toast.success("Shopkeeper verified successfully");
        await getAllShopKepper();
        setAcceptLoadingId(null);
        setDeleteLoadingId(null);
        getShopWithShopkeppers();
        return true;
      }
    } catch (error) {
      console.error("Error verifying shopkeeper:", error);
      toast.error("Failed to verify shopkeeper");
      setAcceptLoadingId(null);
      setDeleteLoadingId(null);
    }
  };

  const approveLocalShop = async (localShop, action) => {
    if (action === "accept") {
      setAcceptLoadingId(localShop._id);
    } else {
      setDeleteLoadingId(localShop._id);
    }

    const payload = { action };

    try {
      const response = await axios.put(
        `https://hazir-hay-backend.vercel.app/localshop/verifyLocalShop/${localShop._id}`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.status === 200) {
        toast.success(
          action === "accept"
            ? "Local shop verified successfully"
            : "Local shop request declined"
        );
        setAcceptLoadingId(null);
        setDeleteLoadingId(null);
        getPendingLocalShops();
        return true;
      }
    } catch (error) {
      console.error("Error processing local shop:", error);
      toast.error("Failed to process local shop request");
      setAcceptLoadingId(null);
      setDeleteLoadingId(null);
    }
  };

  const seepoits = () => {
    console.log(points);
    setShowMOdal(true);
  };

  function ChangeView({ center, zoom }) {
    const map = useMap();
    map.setView(center, zoom);
    return null;
  }

  return (
    <>
      {loading ? (
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
      ) : (
        <div className="container my-4">
          <ToastContainer />

          {/* Header */}
          <div className="mb-4">
            <h4 className="fw-bold mb-1">
              <i className="fa-solid fa-clipboard-list text-primary me-2"></i>
              Pending Requests
            </h4>
            <p className="text-muted small">
              Review and manage pending verification requests
            </p>
          </div>

          {/* Tabs */}
          <div className="card shadow-sm border-0 rounded-4 mb-4">
            <div className="card-body p-2">
              <div className="btn-group w-100" role="group">
                <button
                  type="button"
                  className={`btn ${
                    activeTab === "shopkeeper"
                      ? "btn-primary"
                      : "btn-outline-primary"
                  } rounded-start-4 py-3`}
                  onClick={() => setActiveTab("shopkeeper")}
                >
                  <i className="fa-solid fa-user-tie me-2"></i>
                  Service Providers
                  {shopWithShopkepper.length > 0 && (
                    <span className="badge bg-danger ms-2">
                      {shopWithShopkepper.length}
                    </span>
                  )}
                </button>
                <button
                  type="button"
                  className={`btn ${
                    activeTab === "localshop"
                      ? "btn-primary"
                      : "btn-outline-primary"
                  } rounded-end-4 py-3`}
                  onClick={() => setActiveTab("localshop")}
                >
                  <i className="fa-solid fa-store me-2"></i>
                  Local Shops
                  {localShopRequests.length > 0 && (
                    <span className="badge bg-danger ms-2">
                      {localShopRequests.length}
                    </span>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Service Provider Requests */}
          {activeTab === "shopkeeper" && (
            <>
              {shopWithShopkepper.length !== 0 ? (
                <div className="row g-3">
                  {shopWithShopkepper
                    .filter(Boolean)
                    .map((shopwithkeep, index) => (
                      <div className="col-lg-4 col-md-6" key={index}>
                        <div className="card border-0 shadow-sm h-100 rounded-4 hover-card">
                          <div className="card-body p-3">
                            {/* Profile Section */}
                            <div className="d-flex align-items-start mb-3">
                              <div
                                className="rounded-circle border flex-shrink-0 overflow-hidden bg-light"
                                style={{ width: "70px", height: "70px" }}
                              >
                                <img
                                  src={
                                    shopwithkeep?.profilePicture ||
                                    shopwithkeep.shop?.shopPicture
                                  }
                                  alt="Shop"
                                  style={{
                                    objectFit: "cover",
                                    width: "100%",
                                    height: "100%",
                                  }}
                                />
                              </div>
                              <div className="ms-3 flex-grow-1">
                                <h6 className="mb-1 fw-bold text-dark">
                                  {shopwithkeep.name}
                                </h6>
                                <p className="mb-1 small text-muted">
                                  <i className="fa-solid fa-phone text-primary me-1"></i>
                                  {shopwithkeep.phone}
                                </p>
                                <p className="mb-0 small">
                                  <i className="fa-solid fa-shop text-success me-1"></i>
                                  <span className="fw-semibold">
                                    {shopwithkeep.shop?.shopName || "N/A"}
                                  </span>
                                </p>
                              </div>
                            </div>

                            <hr className="my-2" />

                            {/* Action Buttons */}
                            <div className="d-flex gap-2">
                              <button
                                className="btn btn-success btn-sm flex-grow-1"
                                disabled={acceptLoadingId === shopwithkeep._id}
                                onClick={() => approve(shopwithkeep, "accept")}
                              >
                                {acceptLoadingId === shopwithkeep._id ? (
                                  <span className="d-flex align-items-center justify-content-center">
                                    <span
                                      className="spinner-border spinner-border-sm"
                                      aria-hidden="true"
                                    ></span>
                                  </span>
                                ) : (
                                  <>
                                    <i className="fa-solid fa-circle-check me-1"></i>
                                    Accept
                                  </>
                                )}
                              </button>

                              <button
                                className="btn btn-danger btn-sm flex-grow-1"
                                disabled={deleteLoadingId === shopwithkeep._id}
                                onClick={() => approve(shopwithkeep, "delete")}
                              >
                                {deleteLoadingId === shopwithkeep._id ? (
                                  <span className="d-flex align-items-center justify-content-center">
                                    <span
                                      className="spinner-border spinner-border-sm"
                                      aria-hidden="true"
                                    ></span>
                                  </span>
                                ) : (
                                  <>
                                    <i className="fa-solid fa-trash me-1"></i>
                                    Decline
                                  </>
                                )}
                              </button>

                              <button
                                className="btn btn-info btn-sm flex-grow-1 text-white"
                                onClick={() => handleDetailsModal(shopwithkeep)}
                                disabled={detailsLoadingId === shopwithkeep._id}
                              >
                                {detailsLoadingId === shopwithkeep._id ? (
                                  <span className="d-flex align-items-center justify-content-center">
                                    <span
                                      className="spinner-border spinner-border-sm"
                                      aria-hidden="true"
                                    ></span>
                                  </span>
                                ) : (
                                  <>
                                    <i className="fa-solid fa-circle-info me-1"></i>
                                    Details
                                  </>
                                )}
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              ) : (
                <div className="card border-0 shadow-sm rounded-4">
                  <div className="card-body text-center py-5">
                    <img
                      src={noData}
                      alt="No Data"
                      className="mb-3"
                      style={{ width: "150px", height: "auto", opacity: 0.7 }}
                    />
                    <h5 className="fw-bold text-muted mb-2">
                      No Pending Requests
                    </h5>
                    <p
                      className="text-muted small"
                      style={{ maxWidth: "400px", margin: "0 auto" }}
                    >
                      All service provider requests have been processed. New
                      requests will appear here.
                    </p>
                  </div>
                </div>
              )}
            </>
          )}

          {/* Local Shop Requests */}
          {activeTab === "localshop" && (
            <>
              {localShopRequests.length !== 0 ? (
                <div className="row g-3">
                  {localShopRequests.map((localShop, index) => (
                    <div className="col-lg-4 col-md-6" key={index}>
                      <div className="card border-0 shadow-sm h-100 rounded-4 hover-card">
                        <div className="card-body p-3">
                          {/* Shop Image */}
                          <div className="mb-3">
                            <div
                              className="rounded-3 overflow-hidden bg-light"
                              style={{ height: "150px" }}
                            >
                              <img
                                src={localShop.shopPicture || noData}
                                alt="Shop"
                                style={{
                                  objectFit: "cover",
                                  width: "100%",
                                  height: "100%",
                                }}
                              />
                            </div>
                          </div>

                          {/* Shop Info */}
                          <h6 className="fw-bold text-dark mb-2">
                            <i className="fa-solid fa-store text-primary me-2"></i>
                            {localShop.shopName}
                          </h6>
                          <p className="mb-1 small text-muted">
                            <i className="fa-solid fa-tag text-warning me-1"></i>
                            <span className="badge bg-warning bg-opacity-10 text-warning">
                              {localShop.category}
                            </span>
                          </p>
                          <p className="mb-1 small text-muted">
                            <i className="fa-solid fa-phone text-primary me-1"></i>
                            {localShop.phone}
                          </p>
                          <p className="mb-2 small text-muted">
                            <i className="fa-solid fa-location-dot text-danger me-1"></i>
                            {localShop.shopAddress?.substring(0, 40)}...
                          </p>

                          <hr className="my-2" />

                          {/* Action Buttons */}
                          <div className="d-flex gap-2">
                            <button
                              className="btn btn-success btn-sm flex-grow-1"
                              disabled={acceptLoadingId === localShop._id}
                              onClick={() =>
                                approveLocalShop(localShop, "accept")
                              }
                            >
                              {acceptLoadingId === localShop._id ? (
                                <span className="d-flex align-items-center justify-content-center">
                                  <span
                                    className="spinner-border spinner-border-sm"
                                    aria-hidden="true"
                                  ></span>
                                </span>
                              ) : (
                                <>
                                  <i className="fa-solid fa-circle-check me-1"></i>
                                  Accept
                                </>
                              )}
                            </button>

                            <button
                              className="btn btn-danger btn-sm flex-grow-1"
                              disabled={deleteLoadingId === localShop._id}
                              onClick={() =>
                                approveLocalShop(localShop, "decline")
                              }
                            >
                              {deleteLoadingId === localShop._id ? (
                                <span className="d-flex align-items-center justify-content-center">
                                  <span
                                    className="spinner-border spinner-border-sm"
                                    aria-hidden="true"
                                  ></span>
                                </span>
                              ) : (
                                <>
                                  <i className="fa-solid fa-trash me-1"></i>
                                  Decline
                                </>
                              )}
                            </button>

                            <button
                              className="btn btn-info btn-sm flex-grow-1 text-white"
                              onClick={() =>
                                handleLocalShopDetailsModal(localShop)
                              }
                              disabled={detailsLoadingId === localShop._id}
                            >
                              {detailsLoadingId === localShop._id ? (
                                <span className="d-flex align-items-center justify-content-center">
                                  <span
                                    className="spinner-border spinner-border-sm"
                                    aria-hidden="true"
                                  ></span>
                                </span>
                              ) : (
                                <>
                                  <i className="fa-solid fa-circle-info me-1"></i>
                                  Details
                                </>
                              )}
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="card border-0 shadow-sm rounded-4">
                  <div className="card-body text-center py-5">
                    <img
                      src={noData}
                      alt="No Data"
                      className="mb-3"
                      style={{ width: "150px", height: "auto", opacity: 0.7 }}
                    />
                    <h5 className="fw-bold text-muted mb-2">
                      No Pending Requests
                    </h5>
                    <p
                      className="text-muted small"
                      style={{ maxWidth: "400px", margin: "0 auto" }}
                    >
                      All local shop requests have been processed. New requests
                      will appear here.
                    </p>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {detailsModal && (
        <>
          <div
            className="modal fade show d-block"
            tabIndex="-1"
            style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
          >
            <div className="modal-dialog modal-lg modal-dialog-centered">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">Information</h5>
                  <button
                    type="button"
                    className="btn-close"
                    onClick={() => setDetailsModal(false)}
                  ></button>
                </div>
                <div className="modal-body">
                  {selectedShopWithKeep && (
                    <div className="">
                      <div className="row">
                        <div className="col-md-6">
                          <div className="card shadow-sm mb-3">
                            <div className="card-header bg-primary text-white fw-bold">
                              <i class="fa-solid fa-user me-1"></i> Shopkeeper
                              Information
                            </div>
                            <div className="card-body text-center">
                              <div
                                style={{
                                  width: "120px",
                                  height: "120px",
                                  borderRadius: "50%",
                                  overflow: "hidden",
                                  border: "3px solid #007bff",
                                  margin: "auto",
                                }}
                              >
                                {selectedShopWithKeep.profilePicture ? (
                                  <img
                                    src={selectedShopWithKeep.profilePicture}
                                    alt="Shopkeeper"
                                    style={{
                                      width: "100%",
                                      height: "100%",
                                      objectFit: "cover",
                                    }}
                                  />
                                ) : (
                                  <i
                                    className="fa-solid fa-user"
                                    style={{ fontSize: "70px", color: "#aaa" }}
                                  ></i>
                                )}
                              </div>
                              <h5 className="mt-3 fw-bold">
                                {selectedShopWithKeep?.name}
                              </h5>
                              <p className="text-muted">
                                Created:{" "}
                                {new Date(
                                  selectedShopWithKeep?.createdAt
                                ).toLocaleString()}
                              </p>

                              <div className="text-start mt-3">
                                <p>
                                  <i class="fa-solid fa-envelope me-1"></i>
                                  <strong>Email:</strong>{" "}
                                  {selectedShopWithKeep?.email}
                                </p>
                                <p>
                                  <i class="fa-solid fa-phone me-1"></i>
                                  <strong>Phone:</strong>{" "}
                                  {selectedShopWithKeep?.phone}
                                </p>
                                <p>
                                  <i class="fa-solid fa-location-dot me-1"></i>
                                  <strong>Address:</strong>{" "}
                                  {selectedShopWithKeep?.address}
                                </p>
                                <p>
                                  <i class="fa-solid fa-address-card me-1"></i>
                                  <strong>CNIC:</strong>{" "}
                                  {selectedShopWithKeep?.cnic}
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="col-md-6">
                          <div className="card shadow-sm mb-3">
                            <div className="card-header bg-success text-white fw-bold">
                              <i class="fa-solid fa-shop me-1"></i> Shop
                              Information
                            </div>
                            <div className="card-body text-center">
                              <div
                                style={{
                                  width: "120px",
                                  height: "120px",
                                  borderRadius: "50%",
                                  overflow: "hidden",
                                  border: "3px solid #28a745",
                                  margin: "auto",
                                }}
                              >
                                {selectedShopWithKeep.shop.shopPicture ? (
                                  <img
                                    src={selectedShopWithKeep.shop.shopPicture}
                                    alt="Shop"
                                    style={{
                                      width: "100%",
                                      height: "100%",
                                      objectFit: "cover",
                                    }}
                                  />
                                ) : (
                                  <i
                                    className="fa-solid fa-store"
                                    style={{ fontSize: "70px", color: "#aaa" }}
                                  ></i>
                                )}
                              </div>
                              <h5 className="mt-3 fw-bold">
                                {selectedShopWithKeep?.shop.shopName}
                              </h5>
                              <p className="text-muted">
                                Created:{" "}
                                {new Date(
                                  selectedShopWithKeep?.shop.createdAt
                                ).toLocaleString()}
                              </p>

                              <div className="text-start mt-3">
                                <p>
                                  <i class="fa-solid fa-address-card me-1"></i>
                                  <strong>License:</strong>{" "}
                                  {selectedShopWithKeep?.shop.license}
                                </p>
                                <p>
                                  <i class="fa-solid fa-phone me-1"></i>
                                  <strong>Contact:</strong>{" "}
                                  {selectedShopWithKeep?.phone}
                                </p>
                                <p>
                                  <i class="fa-solid fa-location-dot me-1"></i>
                                  <strong>Shop Address:</strong>{" "}
                                  {selectedShopWithKeep?.shop.shopAddress}
                                </p>
                                <p>
                                  <i class="fa-solid fa-map-location-dot me-1"></i>
                                  <strong>Location:</strong>{" "}
                                  {selectedShopWithKeep?.shop.location.area}{" "}
                                  <p
                                    className="fw-bold text-primary"
                                    style={{ cursor: "pointer" }}
                                    onClick={seepoits}
                                  >
                                    live view
                                  </p>
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="card shadow-sm mb-3">
                        <div className="card-header bg-warning fw-bold">
                          <i class="fa-solid fa-file-image me-1"></i>{" "}
                          Verification Document
                        </div>
                        <div className="card-body text-center">
                          {selectedShopWithKeep.verificationDocument ? (
                            <img
                              src={selectedShopWithKeep.verificationDocument}
                              alt="Verification"
                              style={{
                                maxHeight: "200px",
                                borderRadius: "10px",
                                border: "2px solid #ddd",
                              }}
                            />
                          ) : (
                            <div className="text-muted">
                              <i className="fas fa-id-card fa-3x"></i>
                              <p>No Verification Document</p>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="card shadow-sm">
                        <div className="card-header bg-info text-white fw-bold">
                          <i class="fa-solid fa-screwdriver-wrench me-1"></i>{" "}
                          Services Offered
                        </div>
                        <div className="card-body p-0">
                          <table className="table table-striped mb-0">
                            <thead>
                              <tr>
                                <th>#</th>
                                <th>Category</th>
                                <th>Sub Category</th>
                                <th>Price</th>
                              </tr>
                            </thead>
                            <tbody>
                              {selectedShopWithKeep.shop.servicesOffered
                                .length > 0 ? (
                                selectedShopWithKeep.shop.servicesOffered.map(
                                  (sub, index) => (
                                    <tr key={index}>
                                      <td>{index + 1}</td>
                                      <td>{sub.category}</td>
                                      <td>{sub.subCategory.name}</td>
                                      <td>{sub.subCategory.price}</td>
                                    </tr>
                                  )
                                )
                              ) : (
                                <tr>
                                  <td colSpan="3" className="text-center">
                                    No services found
                                  </td>
                                </tr>
                              )}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => setDetailsModal(false)}
                  >
                    Close
                  </button>
                  <button
                    type="button"
                    className="btn btn-danger"
                    onClick={handleDelete}
                    disabled={deleteLoadingId === selectedShopWithKeep._id}
                  >
                    {deleteLoadingId === selectedShopWithKeep._id ? (
                      <div className="d-flex">
                        <span role="status">wait</span>
                        <span
                          className="spinner-border spinner-border-sm ms-2"
                          aria-hidden="true"
                        ></span>
                      </div>
                    ) : (
                      <>
                        <i class="fa-solid fa-trash me-1"></i>
                        Delete
                      </>
                    )}
                  </button>
                  <button
                    type="button"
                    className="btn btn-success"
                    onClick={handleAccept}
                    disabled={acceptLoadingId === selectedShopWithKeep._id}
                  >
                    {acceptLoadingId === selectedShopWithKeep._id ? (
                      <div className="d-flex">
                        <span role="status">wait</span>
                        <span
                          className="spinner-border spinner-border-sm ms-2"
                          aria-hidden="true"
                        ></span>
                      </div>
                    ) : (
                      <>
                        <i class="fa-solid fa-circle-check me-1"></i>
                        Accept
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {showModal && (
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
                  onClick={() => setShowMOdal(false)}
                ></button>
              </div>
              <div className="modal-body" style={{ height: "600px" }}>
                <div className="form-floating mb-3">
                  <textarea
                    className="form-control"
                    name="currentLocation"
                    id="currentLocationInput"
                    placeholder="Your Current Location"
                    value={selectedShopWithKeep.shop.location.area}
                    style={{ height: "100px" }}
                    disabled={true}
                  ></textarea>
                  <label htmlFor="currentLocationInput">Current Location</label>
                </div>
                <div style={{ height: "460px", width: "100%" }}>
                  <MapContainer
                    center={points}
                    zoom={13}
                    style={{ height: "100%", width: "100%" }}
                  >
                    <TileLayer
                      attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a>'
                      url="https://{s}.tile.openstreetmap.de/{z}/{x}/{y}.png"
                    />
                    <ChangeView center={points} zoom={16} />
                    <Marker position={points} icon={customIcon} />
                  </MapContainer>
                </div>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowMOdal(false)}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Local Shop Details Modal */}
      {localShopModal && selectedLocalShop && (
        <div
          className="modal fade show d-block"
          tabIndex="-1"
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
        >
          <div className="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable">
            <div className="modal-content">
              <div className="modal-header bg-primary text-white">
                <h5 className="modal-title">
                  <i className="fa-solid fa-store me-2"></i>
                  Local Shop Details
                </h5>
                <button
                  type="button"
                  className="btn-close btn-close-white"
                  onClick={() => setLocalShopModal(false)}
                ></button>
              </div>
              <div className="modal-body">
                {/* Shop Image */}
                <div className="card shadow-sm mb-3">
                  <div className="card-body text-center">
                    <div
                      className="rounded-3 overflow-hidden mx-auto mb-3"
                      style={{ width: "200px", height: "200px" }}
                    >
                      <img
                        src={selectedLocalShop.shopPicture || noData}
                        alt="Shop"
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                        }}
                      />
                    </div>
                    <h4 className="fw-bold">{selectedLocalShop.shopName}</h4>
                    <span className="badge bg-primary bg-opacity-10 text-primary px-3 py-2">
                      <i className="fa-solid fa-tag me-1"></i>
                      {selectedLocalShop.category}
                    </span>
                  </div>
                </div>

                {/* Basic Information */}
                <div className="card shadow-sm mb-3">
                  <div className="card-header bg-info bg-opacity-10">
                    <h6 className="mb-0 fw-bold text-info">
                      <i className="fa-solid fa-circle-info me-2"></i>
                      Basic Information
                    </h6>
                  </div>
                  <div className="card-body">
                    <div className="row g-3">
                      <div className="col-md-6">
                        <p className="mb-2">
                          <i className="fa-solid fa-user text-primary me-2"></i>
                          <strong>Position:</strong>{" "}
                          {selectedLocalShop.position}
                        </p>
                        <p className="mb-2">
                          <i className="fa-solid fa-envelope text-primary me-2"></i>
                          <strong>Email:</strong> {selectedLocalShop.email}
                        </p>
                        <p className="mb-0">
                          <i className="fa-solid fa-phone text-primary me-2"></i>
                          <strong>Phone:</strong> {selectedLocalShop.phone}
                        </p>
                      </div>
                      <div className="col-md-6">
                        <p className="mb-2">
                          <i className="fa-solid fa-location-dot text-danger me-2"></i>
                          <strong>Address:</strong>
                        </p>
                        <p className="small text-muted">
                          {selectedLocalShop.shopAddress}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Description */}
                {selectedLocalShop.description && (
                  <div className="card shadow-sm mb-3">
                    <div className="card-header bg-warning bg-opacity-10">
                      <h6 className="mb-0 fw-bold text-warning">
                        <i className="fa-solid fa-file-lines me-2"></i>
                        Description
                      </h6>
                    </div>
                    <div className="card-body">
                      <p className="mb-0">{selectedLocalShop.description}</p>
                    </div>
                  </div>
                )}

                {/* Services */}
                {selectedLocalShop.services &&
                  selectedLocalShop.services.length > 0 && (
                    <div className="card shadow-sm mb-3">
                      <div className="card-header bg-success bg-opacity-10">
                        <h6 className="mb-0 fw-bold text-success">
                          <i className="fa-solid fa-list me-2"></i>
                          Services Offered
                        </h6>
                      </div>
                      <div className="card-body">
                        <div className="row g-2">
                          {selectedLocalShop.services.map((service, idx) => (
                            <div key={idx} className="col-md-6">
                              <div className="p-2 bg-light rounded-3">
                                <p className="mb-0 fw-semibold">
                                  <i className="fa-solid fa-check-circle text-success me-2"></i>
                                  {service.name}
                                </p>
                                {service.price && (
                                  <p className="mb-0 small text-muted ms-4">
                                    Price: Rs. {service.price}
                                  </p>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                {/* Payment Screenshot */}
                {selectedLocalShop.paymentPic && (
                  <div className="card shadow-sm mb-3">
                    <div className="card-header bg-secondary bg-opacity-10">
                      <h6 className="mb-0 fw-bold text-secondary">
                        <i className="fa-solid fa-receipt me-2"></i>
                        Payment Verification
                      </h6>
                    </div>
                    <div className="card-body text-center">
                      <img
                        src={selectedLocalShop.paymentPic}
                        alt="Payment"
                        className="img-fluid rounded-3"
                        style={{ maxHeight: "300px" }}
                      />
                    </div>
                  </div>
                )}

                {/* Location */}
                <div className="card shadow-sm">
                  <div className="card-header bg-danger bg-opacity-10">
                    <h6 className="mb-0 fw-bold text-danger">
                      <i className="fa-solid fa-map-location-dot me-2"></i>
                      Location
                    </h6>
                  </div>
                  <div className="card-body">
                    <button
                      className="btn btn-primary btn-sm w-100"
                      onClick={seepoits}
                    >
                      <i className="fa-solid fa-map me-2"></i>
                      View on Map
                    </button>
                  </div>
                </div>
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setLocalShopModal(false)}
                >
                  <i className="fa-solid fa-xmark me-1"></i>
                  Close
                </button>
                <button
                  type="button"
                  className="btn btn-danger"
                  onClick={() => {
                    approveLocalShop(selectedLocalShop, "decline");
                    setLocalShopModal(false);
                  }}
                  disabled={deleteLoadingId === selectedLocalShop._id}
                >
                  {deleteLoadingId === selectedLocalShop._id ? (
                    <span className="spinner-border spinner-border-sm" />
                  ) : (
                    <>
                      <i className="fa-solid fa-trash me-1"></i>
                      Decline
                    </>
                  )}
                </button>
                <button
                  type="button"
                  className="btn btn-success"
                  onClick={() => {
                    approveLocalShop(selectedLocalShop, "accept");
                    setLocalShopModal(false);
                  }}
                  disabled={acceptLoadingId === selectedLocalShop._id}
                >
                  {acceptLoadingId === selectedLocalShop._id ? (
                    <span className="spinner-border spinner-border-sm" />
                  ) : (
                    <>
                      <i className="fa-solid fa-circle-check me-1"></i>
                      Accept
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default Requests;
