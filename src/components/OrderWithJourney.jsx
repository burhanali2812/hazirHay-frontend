import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import UserShopRoute from "./UserShopRoute";
function OrderWithJourney() {
  const [routeInfo, setRouteInfo] = useState(null);
  const [shopKepperCords, setShopKepperCords] = useState([]);
  const location = useLocation();
  const selectedTrackShopData = location.state;
  console.log("selectedShop", selectedTrackShopData);

  const position = selectedTrackShopData?.orders[0]?.location?.[0]?.coordinates;

  useEffect(() => {
    const interval = setInterval(() => {
      if (!navigator.geolocation) {
        alert("Geolocation is not supported by your browser");
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const lat = pos.coords.latitude;
          const lng = pos.coords.longitude;
          setShopKepperCords([lng, lat]);
        },
        (error) => {
          if (error.code === error.PERMISSION_DENIED) {
            alert("Please turn on location and allow access to continue");
          } else if (error.code === error.POSITION_UNAVAILABLE) {
            alert("Location unavailable. Please try again");
          } else if (error.code === error.TIMEOUT) {
            alert("Location request timed out. Please try again");
          } else {
            alert("Unable to retrieve your location");
          }
        }
      );
    }, 3000);

    return () => clearInterval(interval);
  }, [selectedTrackShopData]);
  const serviceCharges = 0;
  const grandTotal = 0;

  return (
    <div style={{marginBottom: "65px"}}>
      <div>
        <div
          style={{
            height: "380px",
            width: "100%",
            borderRadius: "5px",
            overflow: "hidden",
          }}
          className="shadow-sm"
        >
          {shopKepperCords && position && (
            <UserShopRoute
              userCoords={[position[1], position[0]]}
              shopCoords={[shopKepperCords[0], shopKepperCords[1]]}
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
          {selectedTrackShopData && (
            <>
              <h3 className="fw-bold text-center text-primary mb-3">
                {selectedTrackShopData?.orders[0]?.userId?.name}
              </h3>

              <div className="d-flex justify-content-center gap-2 flex-wrap mb-3">
                <a
                  href={`tel:${selectedTrackShopData?.orders[0]?.userId?.phone}`}
                  className="btn btn-outline-info btn-sm text-dark rounded-pill px-3"
                >
                  <i className="fa-solid fa-phone-volume me-1"></i> Call Now
                </a>

                <a
                  href={`https://wa.me/${`+92${selectedTrackShopData?.orders[0]?.userId?.phone?.slice(
                    1
                  )}`}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-outline-success btn-sm rounded-pill px-3"
                >
                  <i className="fa-brands fa-whatsapp me-1"></i> WhatsApp
                </a>

                <button className="btn btn-outline-primary btn-sm rounded-pill px-3">
                  <i className="fa-solid fa-comments me-1"></i> Live Chat
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

                {selectedTrackShopData.orders.map((order, index) =>
                  order?.status === "accepted" ? (
                    <div key={index} className="mt-4">
                      <h5 className="text-center fw-bold text-light mb-3 bg-primary rounded-2 p-2">
                        Order {index + 1}
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
                                order?.status === "pending"
                                  ? "bg-warning text-dark"
                                  : order?.status === "completed"
                                  ? "bg-success"
                                  : order?.status === "cancelled"
                                  ? "bg-danger"
                                  : "bg-secondary"
                              }`}
                            >
                              {order?.status}
                            </span>
                          </span>
                        </li>

                        <li className="list-group-item d-flex justify-content-between align-items-center">
                          <span>
                            <i className="fa-solid fa-receipt me-2 text-secondary"></i>
                            Order ID
                          </span>
                          <span className="fw-semibold">{order?.orderId}</span>
                        </li>

                        <li className="list-group-item d-flex justify-content-between align-items-center">
                          <span>
                            <i className="fa-solid fa-barcode me-2 text-secondary"></i>
                            Checkout ID
                          </span>
                          <span>{order?.checkoutId}</span>
                        </li>

                        <li className="list-group-item d-flex justify-content-between align-items-center">
                          <span>
                            <i className="fa-solid fa-tags me-2 text-secondary"></i>
                            Category
                          </span>
                          <span>{order?.category}</span>
                        </li>

                        <li className="list-group-item d-flex justify-content-between align-items-center">
                          <span>
                            <i className="fa-solid fa-toolbox me-2 text-secondary"></i>
                            Sub Category
                          </span>
                          <span>{order?.subCategory}</span>
                        </li>

                        <li className="list-group-item d-flex justify-content-between align-items-center">
                          <span>
                            <i className="fa-solid fa-money-bill-wave me-2 text-secondary"></i>
                            Order Cost
                          </span>
                          <span
                            className="fw-bold text-primary"
                            style={{ fontSize: "20px" }}
                          >
                            Rs. {order?.cost}/-
                          </span>
                        </li>
                      </ul>
                    </div>
                  ) : null
                )}
              </div>
            </>
          )}
                <button className="w-100  mt-2 btn btn-warning  rounded-pill">
        <i class="fa-solid fa-circle-check me-1"></i>
        Complete Order{" "}
      </button>
        </div>
        
      </div>

    </div>
  );
}

export default OrderWithJourney;
