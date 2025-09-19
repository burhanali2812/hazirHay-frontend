import React, { useState, useEffect } from "react";
import track from "../images/track.png";
import notFound from "../images/notFound.png";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";

import "leaflet/dist/leaflet.css";
import L from "leaflet";
import "leaflet-routing-machine";
import UserShopRoute from "./UserShopRoute";

function Tracking({ setUpdateAppjs }) {
  const token = localStorage.getItem("token");
  const [requestsData, setRequestsData] = useState([]);
  const [searchQuery, setSearchQuery] = useState([]);
  const [serachData, setSearchData] = useState([]);
  const [selectedTrackShopData, setSelectedTrackShopData] = useState(null);
  const [trackingDetailsModal, setTrackingDetailsModal] = useState(false);
  const [shopCoordinates, setShopCoordinates] = useState([]);
  const [selectedShop, setSelectedShop] = useState(null);
  const [routeInfo, setRouteInfo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [cencelOrderLoading, setCancelOrderLoading] = useState(false);

  const navigate = useNavigate();
  const position = selectedTrackShopData?.location?.[0]?.coordinates;
  console.log("position", position);

  const fetchUserCart = async () => {
    try {
      const response = await axios.get(
        "https://hazir-hay-backend.vercel.app/requests/getUserRequests",
        {
          headers: { Authorization: `Bearer ${token}` },
          params: { t: Date.now() },
        }
      );
      if (response.data.success) {
        // alert("Cart Data Fetch SuccessFully")
        console.log(response.data.data || []);
        setRequestsData(response.data.data || []);
      }
    } catch (error) {
      console.error("Error Fetching reuests data:", error.message);
    }
  };

  useEffect(() => {
    fetchUserCart();
  }, []);

  const deleteRequest = async (id) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      html: `Are you sure to Cancel Order :- <strong>${id}</strong> `,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, Cancel it!",
    });

    if (!result.isConfirmed) return;
    setCancelOrderLoading(true);
    try {
      const response = await axios.delete(
        `https://hazir-hay-backend.vercel.app/requests/deleteRequest/${id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
          params: { t: Date.now() }, // prevent caching
        }
      );

      if (response.data?.success) {
        setCancelOrderLoading(false);
        alert(response.data.message || "Deleted Successfully");
        fetchUserCart();
        fetchShopData();
        setTrackingDetailsModal(false);
        setSearchQuery("");
        setSearchData([]);
        setUpdateAppjs(true);
      } else {
        alert(response.data.message || "Failed to delete");
        setCancelOrderLoading(false);
      }
    } catch (error) {
      console.error("Delete request error:", error);
      alert("Something went wrong while deleting");
      setCancelOrderLoading(false);
    }
  };

  const rate = Number(selectedTrackShopData?.serviceCharges?.rate?.[0] || selectedTrackShopData?.serviceCharges?.rate);
  const distance = Number(selectedTrackShopData?.serviceCharges?.distance || 0);

  const serviceCharges = (rate * distance).toFixed(0);
  const grandTotal =
    Number(selectedTrackShopData?.cost) + Number(serviceCharges);

  const fetchShopData = async (data) => {
    console.log("selectedTrackShopData?.shopOwnerId", data?.shopOwnerId);

    try {
      const res = await axios.get(
        `https://hazir-hay-backend.vercel.app/shopKeppers/shopWithShopKepper/${data?.shopOwnerId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
          params: { t: Date.now() },
        }
      );
      if (res.data.success) {
        setLoading(false);
        setSelectedShop(res.data.data);
        console.log("shop", res.data.shop);
        setShopCoordinates(res.data.data.shop.location.coordinates);
        console.log(
          "shop Coordinates",
          res.data.data.shop.location.coordinates
        );
      }
    } catch (error) {
      setLoading(false);
      console.error("Error Fetching reuests data:", error.message);
    }
  };

  const handleChange = (e) => {
    const value = e.target.value.toUpperCase(); // keep input in uppercase
    setSearchQuery(value);
    console.log("words", value.length);
    if (value.length === 0) {
      setSearchData([]);
      return;
    }

    const data = requestsData.filter((request) =>
      request.checkoutId ? request.checkoutId.includes(value) : false
    );
    console.log(data);

    setSearchData(data);
  };
  function highlightText(text, query) {
    if (!query) return text;

    const regex = new RegExp(`(${query})`, "gi");
    const parts = text.split(regex);

    return parts.map((part, index) =>
      part.toUpperCase() === query.toUpperCase() ? (
        <span
          key={index}
          style={{
            backgroundColor: "yellow",
            borderRadius: "6px",
            padding: "2px",
          }}
        >
          {part}
        </span>
      ) : (
        part
      )
    );
  }

  const handleGotoTrackingPage = async (data) => {
    console.log("data", data);
    setLoading(true);
    await fetchShopData(data);

    setSelectedTrackShopData(data);
    setTrackingDetailsModal(true);
  };

  return (
    <div className="container mt-3 " style={{ overflowY: 0 }}>
      {loading && (
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
      <form className="d-flex" role="search" style={{ width: "auto" }}>
        <div className="position-relative w-100 mb-4">
          <input
            type="search"
            className="form-control bg-transparent rounded-pill ps-5 pe-5"
            placeholder="CHK-XXX-XXX"
            aria-label="Search"
            value={searchQuery}
            onChange={handleChange}
            style={{ border: "2px solid black" }}
          />

          {/* Search Icon (left inside input) */}
          <span className="position-absolute top-50 start-0 translate-middle-y ps-3 text-muted">
            <i className="fa-solid fa-magnifying-glass"></i>
          </span>
        </div>
      </form>

      {serachData?.length > 0 ? (
        serachData.map((data, index) => (
          <div
            key={index}
            className="d-flex justify-content-between align-items-center p-3 mb-3 rounded shadow-lg border-0 bg-transparent"
            style={{ backgroundColor: "#fff" }}
            onClick={() => handleGotoTrackingPage(data)}
          >
            {/* Left content */}
            <div>
              <p className="fw-bold mb-1 text-dark">
                {data.orderId} ({highlightText(data.checkoutId, searchQuery)})
              </p>

              <p className="mb-1 text-muted">
                {data.subCategory} <small>({data.category})</small>
              </p>
              <p className="mb-1 text-muted ">
                <b>Cost:</b> <small>Rs. {data.cost}/-</small>
              </p>

              {/* Status with color badges */}
              {data.status === "accepted" && (
                <span className="badge bg-success ">{data.status}</span>
              )}
              {data.status === "rejected" && (
                <span className="badge bg-danger">{data.status}</span>
              )}
              {data.status === "completed" && (
                <span className="badge bg-primary">{data.status}</span>
              )}
              {data.status === "pending" && (
                <span className="badge bg-warning text-dark ">
                  {data.status}
                </span>
              )}
            </div>

            {/* Right arrow */}
            <div className="ms-3 text-muted">
              <i class="fa-solid fa-angle-right"></i>
            </div>
          </div>
        ))
      ) : searchQuery?.length === 0 ? (
        <div
          className="d-flex flex-column justify-content-center align-items-center text-center"
          style={{ height: "75vh" }}
        >
          <img
            src={track}
            alt="No Data"
            className="mb-0"
            style={{ width: "300px", height: "auto" }}
          />
          <h4 className="fw-bold text-warning mb-2 mt-0">
            Track Your Order Easily
          </h4>
          <p
            className="text-muted"
            style={{ maxWidth: "380px", fontSize: "15px" }}
          >
            Just enter your tracking ID (for example,{" "}
            <strong>CHK-XXX-XXX</strong>) and we’ll help you see where your
            order is, check shop details, and follow it live — simple and quick!
          </p>
        </div>
      ) : searchQuery.length > 10 || serachData.length === 0 ? (
        <div
          className="d-flex flex-column justify-content-center align-items-center text-center"
          style={{ height: "75vh" }}
        >
          <img
            src={notFound}
            alt="No Data"
            className="mb-0"
            style={{ width: "220px", height: "auto" }}
          />
          <h4 className="fw-bold text-danger mb-2 mt-0">
            Sorry, Checkout Not Found
          </h4>
          <p
            className="text-muted"
            style={{ maxWidth: "380px", fontSize: "15px" }}
          >
            The checkout ID you entered doesn’t match our records. Kindly
            re-check the ID (e.g., <strong>CHK-XXX-XXX</strong>) or try a
            different one.
          </p>
        </div>
      ) : (
        ""
      )}

      {trackingDetailsModal && (
        <div
          className="modal fade show d-block"
          tabIndex="-1"
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
        >
          <div className="modal-dialog modal-fullscreen modal-dialog-centered">
            <div className="modal-content border-0 shadow-lg rounded-4">
              {/* HEADER */}
              <div className="modal-header border-0 bg-light">
                <div className="d-flex align-items-center">
                  <i
                    className="fa-solid fa-circle-chevron-left text-secondary"
                    style={{ fontSize: "22px", cursor: "pointer" }}
                    onClick={() => setTrackingDetailsModal(false)}
                  ></i>
                  <h5 className="ms-2 fw-bold text-dark mb-0">
                    Tracking Details
                  </h5>
                </div>
              </div>

              <div className="modal-body bg-white">
                <div
                  style={{
                    height: "380px",
                    width: "100%",
                    borderRadius: "5px",
                    overflow: "hidden",
                  }}
                  className="shadow-sm"
                >
                  {shopCoordinates && position && (
                    <UserShopRoute
                      userCoords={[position[1], position[0]]}
                      shopCoords={[shopCoordinates[1], shopCoordinates[0]]}
                      onRouteInfo={(info) => setRouteInfo(info)}
                      type={"live"}
                    />
                  )}
                </div>

                <div
                  className="card border-0 shadow-sm mt-3"
                  style={{
                    borderRadius: "20px",
                    padding: "20px",
                    backgroundColor: "#f9fbfd",
                  }}
                >
                  {selectedShop && (
                    <>
                      {/* SHOP NAME */}
                      <h3 className="fw-bold text-center text-primary mb-3">
                        {selectedShop?.shop?.shopName}
                      </h3>

                      {/* ACTION BUTTONS */}
                      <div className="d-flex justify-content-center gap-2 flex-wrap mb-3">
                        <a
                          href={`tel:${selectedShop?.phone}`}
                          className="btn btn-outline-info btn-sm text-dark rounded-pill px-3"
                        >
                          <i className="fa-solid fa-phone-volume me-1"></i> Call
                          Now
                        </a>

                        <a
                          href={`https://wa.me/${`+92${selectedShop?.phone?.slice(
                            1
                          )}`}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn btn-outline-success btn-sm rounded-pill px-3"
                        >
                          <i className="fa-brands fa-whatsapp me-1"></i>{" "}
                          WhatsApp
                        </a>

                        <button className="btn btn-outline-primary btn-sm rounded-pill px-3">
                          <i className="fa-solid fa-comments me-1"></i> Live
                          Chat
                        </button>
                      </div>

                      {/* DISTANCE + TIME */}
                      <div className="d-flex justify-content-around text-muted small mb-3">
                        <span>
                          <i className="fa-solid fa-clock me-1 text-secondary"></i>
                          <b>ETA:</b> {routeInfo?.duration} mins
                        </span>
                        <span>
                          <i className="fa-solid fa-route me-1 text-secondary"></i>
                          <b>Distance:</b> {routeInfo?.distance} km
                        </span>
                      </div>

                      {/* ORDER DETAILS */}
                      <div className="mt-2">
                        <h5 className="text-center fw-bold text-dark mb-3">
                          Order Details
                        </h5>

                        <ul className="list-group list-group-flush">
                          <li className="list-group-item d-flex justify-content-between align-items-center">
                            <span>
                              <i className="fa-solid fa-signal me-2 text-secondary"></i>
                              Status
                            </span>
                            <span>
                              <span
                                className={`badge rounded-pill ${
                                  selectedTrackShopData?.status === "pending"
                                    ? "bg-warning text-dark"
                                    : selectedTrackShopData?.status ===
                                      "completed"
                                    ? "bg-success"
                                    : selectedTrackShopData?.status ===
                                      "cancelled"
                                    ? "bg-danger"
                                    : "bg-secondary"
                                }`}
                              >
                                {selectedTrackShopData?.status}
                              </span>
                            </span>
                          </li>

                          <li className="list-group-item d-flex justify-content-between align-items-center">
                            <span>
                              <i className="fa-solid fa-receipt me-2 text-secondary"></i>
                              Order ID
                            </span>
                            <span className="fw-semibold">
                              {selectedTrackShopData?.orderId}
                            </span>
                          </li>

                          <li className="list-group-item d-flex justify-content-between align-items-center">
                            <span>
                              <i className="fa-solid fa-barcode me-2 text-secondary"></i>
                              Checkout ID
                            </span>
                            <span>{selectedTrackShopData?.checkoutId}</span>
                          </li>

                          <li className="list-group-item d-flex justify-content-between align-items-center">
                            <span>
                              <i className="fa-solid fa-tags me-2 text-secondary"></i>
                              Category
                            </span>
                            <span>{selectedTrackShopData?.category}</span>
                          </li>

                          <li className="list-group-item d-flex justify-content-between align-items-center">
                            <span>
                              <i className="fa-solid fa-toolbox me-2 text-secondary"></i>
                              Sub Category
                            </span>
                            <span>{selectedTrackShopData?.subCategory}</span>
                          </li>
                          <li className="list-group-item d-flex justify-content-between align-items-center">
                            <span>
                              <i className="fa-solid fa-person-biking me-2 text-secondary"></i>
                              Service Charges
                            </span>
                            <span>Rs. {serviceCharges}/-</span>
                          </li>

                          <li className="list-group-item d-flex justify-content-between align-items-center">
                            <span>
                              <i className="fa-solid fa-screwdriver-wrench me-2 text-secondary"></i>
                              Service Cost
                            </span>
                            <span className="fw-bold text-success">
                              Rs. {selectedTrackShopData?.cost}/-
                            </span>
                          </li>
                          <li className="list-group-item d-flex justify-content-between align-items-center">
                            <span>
                              <i className="fa-solid fa-money-bill-wave me-2 text-secondary"></i>
                              Sub Total
                            </span>
                            <span
                              className="fw-bold text-primary"
                              style={{ fontSize: "22px" }}
                            >
                              Rs. {grandTotal}/-
                            </span>
                          </li>
                        </ul>
                      </div>

                      {/* CANCEL BUTTON */}
                      {selectedTrackShopData.status === "pending" ? (
                        <div className="text-center mt-4">
                          <button
                            className="btn btn-outline-danger rounded-pill px-4 btn-sm"
                            onClick={() =>
                              deleteRequest(selectedTrackShopData?.orderId)
                            }
                            disabled={cencelOrderLoading}
                          >
                            {cencelOrderLoading ? (
                              <>
                                Cancelling Request...
                                <div
                                  className="spinner-border spinner-border-sm text-dark ms-2"
                                  role="status"
                                ></div>
                              </>
                            ) : (
                              <>
                                <i className="fa-solid fa-xmark me-1"></i>
                                Cancel Order ({selectedTrackShopData?.orderId})
                              </>
                            )}
                          </button>
                        </div>
                      ) : (
                        ""
                      )}
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Tracking;
