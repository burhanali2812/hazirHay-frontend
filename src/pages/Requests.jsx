import axios from "axios";
import { useEffect, useState } from "react";

import noData from "../images/noData.png";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { MapContainer, TileLayer, Marker, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { useAppContext } from "../context/AppContext";

function Requests() {
  const{getAllShopKepper}=useAppContext();
  const token = localStorage.getItem("token");
  const [shopWithShopkepper, setShopWithShopkepper] = useState([]);
  const [loading, setLoading] = useState(false);
  const [acceptLoadingId, setAcceptLoadingId] = useState(null);
  const [deleteLoadingId, setDeleteLoadingId] = useState(null);
  const [detailsLoadingId, setDetailsLoadingId] = useState(null);
  const [detailsModal, setDetailsModal] = useState(false);
  const [selectedShopWithKeep, setSelectedShopWithKeep] = useState(null);
  const [showModal, setShowMOdal] = useState(false);

  const [points, setPoints] = useState([33.6844, 73.0479]);

  useEffect(() => {
    if (selectedShopWithKeep?.shop?.location?.coordinates) {
      const coords = selectedShopWithKeep.shop.location.coordinates;
      console.log("Raw from DB:", coords);
      setPoints(coords);
    }
  }, [selectedShopWithKeep]);

  const handleDetailsModal = (shopWithKepp) => {
    setSelectedShopWithKeep(shopWithKepp);
    setDetailsLoadingId(shopWithKepp._id);

    setTimeout(() => {
      setDetailsModal(true);
      setDetailsLoadingId(null);
    }, 2000);
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

  useEffect(() => {
    getShopWithShopkeppers();
  }, []);

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
        getShopWithShopkeppers();
        return true;
      }
    } catch (error) {
      console.error("Error verifying shopkeeper:", error);
      toast.error("Failed to verify shopkeeper");
      setAcceptLoadingId(null);
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
        <div className="container my-5">
          <ToastContainer />

          {shopWithShopkepper.length !== 0 ? (
            <div className="row g-4">
              {shopWithShopkepper.filter(Boolean).map((shopwithkeep, index) => (
                <div className="col-lg-4 col-md-6" key={index}>
                  <div className="card border-0 shadow h-100 rounded-3">
                    <div className="card-body">
                      {/* Profile + Info */}
                      <div className="d-flex align-items-center mb-3">
                        <div
                          className="rounded-circle border flex-shrink-0 d-flex align-items-center justify-content-center bg-light"
                          style={{
                            width: "80px",
                            height: "80px",
                            overflow: "hidden",
                          }}
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
                        <div className="ms-3">
                          <h6 className="mb-1 fw-bold text-dark">
                            <i className="fa-solid fa-user text-primary me-2"></i>
                            {shopwithkeep.name}
                          </h6>
                          <p className="mb-1 small text-muted">
                            <i className="fa-solid fa-phone text-primary me-2"></i>
                            {shopwithkeep.phone}
                          </p>
                          <p className="mb-0 small text-muted">
                            <i className="fa-solid fa-shop text-primary me-2"></i>
                            {shopwithkeep.shop?.shopName || "N/A"}
                          </p>
                        </div>
                      </div>

                      {/* Divider */}
                      <hr className="my-3" />

                      <div className="d-flex justify-content-between gap-1">
                        <button
                          className="btn btn-success btn-sm flex-grow-1"
                          disabled={acceptLoadingId === shopwithkeep._id}
                          onClick={() => approve(shopwithkeep, "accept")}
                        >
                          {acceptLoadingId === shopwithkeep._id ? (
                            <span className="d-flex align-items-center justify-content-center">
                              <span role="status">Wait</span>
                              <span
                                className="spinner-border spinner-border-sm ms-2"
                                aria-hidden="true"
                              ></span>
                            </span>
                          ) : (
                            <>
                              <i class="fa-solid fa-circle-check me-1"></i>
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
                              <span role="status">Wait</span>
                              <span
                                className="spinner-border spinner-border-sm ms-2"
                                aria-hidden="true"
                              ></span>
                            </span>
                          ) : (
                            <>
                              <i class="fa-solid fa-trash me-1"></i>
                              Delete
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
                              <span role="status">Wait</span>
                              <span
                                className="spinner-border spinner-border-sm ms-2"
                                aria-hidden="true"
                              ></span>
                            </span>
                          ) : (
                            <>
                              <i class="fa-solid fa-circle-info me-1"></i>
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
            <div
              className="d-flex flex-column justify-content-center align-items-center text-center"
              style={{ height: "65vh" }}
            >
              <img
                src={noData}
                alt="No Data"
                className="mb-3"
                style={{ width: "180px", height: "auto" }}
              />
              <h4 className="fw-bold text-warning mb-2">No Requests Found</h4>
              <p
                className="text-muted"
                style={{ maxWidth: "380px", fontSize: "15px" }}
              >
                Currently, there are no pending requests. Please check back
                later or refresh the page.
              </p>
            </div>
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
    </>
  );
}

export default Requests;
