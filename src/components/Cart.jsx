import axios from "axios";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import cart from "../images/cart.png";
import Swal from "sweetalert2";
import stamp from "../images/stamp.png";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

function Cart({
  cartData,
  setUpdateAppjs,
  areaName,
  setCartData,
}) {
  // safely get items

  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const [loadingItemId, setLoadingItemId] = useState(null);
  const [shopWithShopKepper, setShopWithShopKepper] = useState([]);
  const [orderSummaryModal, setOrderSummaryModal] = useState(false);
  const [postOrderModal, setPostOrderModal] = useState(false);
  const [isReciept, setIsReciept] = useState(false);
  const [loading, setLoading] = useState(false);
  const [rate, setRate] = useState(false);

  const [checkoutId, setCheckoutId] = useState("");

  const user = JSON.parse(sessionStorage.getItem("user"));
    const [copied, setCopied] = useState(false);

const handleCopy = (checkoutId) => {
  const text = checkoutId || "1122";

  if (navigator.clipboard && navigator.clipboard.writeText) {
    // Modern browsers
    navigator.clipboard.writeText(text).then(
      () => setCopied(true),
      () => fallbackCopy(text) // if permission denied
    );
  } else {
    // Fallback for older mobile browsers
    fallbackCopy(text);
  }
};

const fallbackCopy = (text) => {
  const textarea = document.createElement("textarea");
  textarea.value = text;
  textarea.style.position = "fixed"; // avoid scrolling
  document.body.appendChild(textarea);
  textarea.focus();
  textarea.select();
  try {
    document.execCommand("copy");
    setCopied(true);
  } catch (err) {
    console.error("Fallback: Copy failed", err);
  }
  document.body.removeChild(textarea);
};


  const groupedCart = (cartData?.items || []).reduce((acc, item) => {
    const shop = acc.find((s) => s.shopId === item.shopId);

    if (shop) {
      shop.items.push(item);
    } else {
      acc.push({
        shopId: item.shopId,
        shopName: item.shopName,
        items: [item],
      });
    }

    return acc;
  }, []);
  const saved = JSON.parse(localStorage.getItem("selectedLocation"));
  console.log("saved", saved);
  
  const coordinates = [saved?.lat, saved?.lng]

const downloadReceiptAsPDF = async () => {
  setLoading(true);
  try {
    const element = document.getElementById("receipt-content");
    if (!element) return;

    // High-resolution canvas
    const canvas = await html2canvas(element, {
      scale: 10, // higher scale = sharper
      useCORS: true,
      logging: false
    });

    const imgData = canvas.toDataURL("image/png", 1.0); // best quality
    const pdf = new jsPDF("p", "mm", "a4");

    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();

    const imgWidth = pageWidth;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    let heightLeft = imgHeight;
    let position = 0;

    // Add first page
    pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;

    // Add extra pages if needed
    while (heightLeft > 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
    }

    pdf.save(`Order-${checkoutId}.pdf`);

    setLoading(false);
    alert("✅ PDF downloaded successfully!");
  } catch (error) {
    console.error("Error generating PDF:", error);
    setLoading(false);
    alert("❌ Failed to download PDF. Please try again.");
  }
};

  const grandTotal = groupedCart.reduce(
    (acc, cart) => acc + cart.items.reduce((sum, item) => sum + item.price, 0),
    0
  );
  const getShopWithShopkeppers = async () => {
    try {
      const response = await axios.get(
        "https://hazir-hay-backend.wckd.pk/shopKeppers/allVerifiedShopkepperWithShops",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.status === 200) {
        const shopWithShopkeppers = response.data.data || [];
        setShopWithShopKepper(shopWithShopkeppers);
      }
    } catch (error) {
      console.error("Error fetching shopkeepers with shops:", error);
    }
  };
  useEffect(() => {
    getShopWithShopkeppers();
  }, []);

  const deleteItem = async (service) => {
    setLoadingItemId(service._id);
    try {
      const response = await axios.delete(
        `https://hazir-hay-backend.wckd.pk/cart/deleteCartItem/${service._id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.data.success) {
        alert("Item removed successfully!");
        setUpdateAppjs(true);
      }
    } catch (error) {
      console.error("Error deleting item:", error.message);
    } finally {
      setLoadingItemId(null); // reset after deletion
    }
  };

   async function getDistance(userCoords, shopCoords) {
  console.log("shopCoordsdd", shopCoords);
  
  if (!shopCoords || shopCoords.length < 2) return { distance: null, duration: null };
  const accessToken = "pk.eyJ1Ijoic3llZGJ1cmhhbmFsaTI4MTIiLCJhIjoiY21mamM0NjZiMHg4NTJqczRocXhvdndiYiJ9.Z4l8EQQ47ejlWdVGcimn4A";
  const url = `https://api.mapbox.com/directions/v5/mapbox/driving/${userCoords[0]},${userCoords[1]};${shopCoords[0]},${shopCoords[1]}?access_token=${accessToken}&overview=false`;

  const res = await axios.get(url);
  const route = res.data.routes[0];

      if (!res.data.routes || res.data.routes.length === 0) {
      console.warn("No route found for:", shopCoords);
      return { distance: null, duration: null };
    }

  return {
    distance: (route.distance / 1000).toFixed(2), // km
    duration: (route.duration / 60).toFixed(0),   // minutes
  };
}



const findShopDistance = async (shopId) => {
  const shop = shopWithShopKepper.find((shop) => shop.shop._id === shopId);
  if (!shop || !shop.shop.location?.coordinates || !coordinates) return null;

  const shopCoords = [
    shop.shop.location.coordinates[1], // lng
    shop.shop.location.coordinates[0], // lat
  ];
  const userCoords = [coordinates[1] || 73.04732533048735, coordinates[0] || 33.69832701012015]; 
  console.log("shopCords", shopCoords);
   console.log("UserCords", userCoords);
  

  const distance = await getDistance(userCoords, shopCoords);
  return distance.distance; // km
};
const [totalDistance, setTotalDistance] = useState(0);
const [shopDistances, setShopDistances] = useState({});


  const fetchAllDistances = async () => {
    if (!coordinates || !groupedCart.length) return;

    let total = 0;
    const distances = {};

    for (const shop of groupedCart) {
      const dist = await findShopDistance(shop.shopId);
      distances[shop.shopId] = dist;
      total += Number(dist) || 0;
    }

    setShopDistances(distances);
    setTotalDistance(total.toFixed(2));
  };







 // e.g., "28.97"
  function getRateByTime() {
    const now = new Date();
    const hour = now.getHours();

    // 2AM - 6AM => highest rate (night time)
    if (hour >= 1 && hour < 6) {
      return Math.floor(Math.random() * (25 - 23 + 1)) + 23; // 23–25
    }

    // 6AM - 9AM => lower rate (early morning)
    if (hour >= 6 && hour < 9) {
      return Math.floor(Math.random() * (16 - 15 + 1)) + 15; // 15–16
    }

    // 9AM - 1PM => mid rate (day time)
    if (hour >= 9 && hour < 13) {
      return Math.floor(Math.random() * (18 - 17 + 1)) + 17; // 17–18
    }

    // 1PM - 6PM => mid rate (evening)
    if (hour >= 13 && hour < 18) {
      return Math.floor(Math.random() * (20 - 19 + 1)) + 19; // 19–20
    }

    // 6PM - 10PM => mid rate (night time)
    if (hour >= 18 && hour < 22) {
      return Math.floor(Math.random() * (22 - 21 + 1)) + 21; // 21–22
    }

    // 10PM - 1AM => mid rate (late night)
    if (hour >= 22 || hour < 1) {
      return Math.floor(Math.random() * (24 - 23 + 1)) + 23; // 23–24
    }

    return null; // just in case no range matches
  }

  useEffect(() => {
    const rateTime = getRateByTime();
    if (rateTime === null) {
      console.log("Service unavailable right now");
    } else {
      setRate(rateTime);
      console.log("Current rate:", rateTime);
    }
  }, []);

  const totalServiceCharges = ((rate ? rate : 0) * totalDistance).toFixed(0);


  const subTotal = Number(totalServiceCharges) + Number(grandTotal);

  const generateOrderId = () => {
    const uniquePart = (
      Date.now().toString(36) + Math.random().toString(36).slice(2, 4)
    )
      .toUpperCase()
      .slice(-6); // take 6 chars

    // Split into groups of 3 and join with "-"
    const formatted = uniquePart.match(/.{1,3}/g).join("-");

    return `ORD-${formatted}`;
  };
  const generateCheckoutId = () => {
    const firstLetter = user.name.charAt(0).toUpperCase(); // first letter of name
    const lastPhoneDigit = user.phone.slice(-1); // last digit of phone
    const randomDigit = Math.floor(Math.random() * 10); // 0–9
    const randomThree = Math.random().toString(36).slice(2, 5).toUpperCase(); // 3 chars (0-9 + A-Z)

    return `CHK-${firstLetter}${lastPhoneDigit}${randomDigit}-${randomThree}`;
  };

  const sendRequestAll = async () => {
    setLoading(true);
    const newcheckoutId = generateCheckoutId();
    setCheckoutId(newcheckoutId);
    const payload = groupedCart.map((shop) => ({
      checkoutId: newcheckoutId,
      shopId: shop.shopId,
      userId: user?._id,
      category: shop.items[0].category,
      subCategory: shop.items[0].subCategory,
      orderId: generateOrderId(),
      cost: shop.items.reduce((sum, item) => sum + item.price, 0),
      location: [
        {
          coordinates,
          area: areaName || "Unknown Area",
        },
      ],
      serviceCharges: {
        rate,
        distance: shopDistances[shop.shopId] || 0,
      },
    }));

    try {
      console.log("Payload:", payload);

      const response = await axios.post(
        "https://hazir-hay-backend.wckd.pk/requests/sendBulkRequests",
        { requests: payload },
        {
          headers: { Authorization: `Bearer ${token}` },
          params: { t: Date.now() },
        }
      );
      if (response.data.success) {
        // await clearCart("update");
        setLoading(false);
        alert(response?.data?.message || "Request sent successfully!");
        setPostOrderModal(true);
        setOrderSummaryModal(false);
      }
    } catch (error) {
      console.error("Error sending request:", error);
      setLoading(false);

      if (error.response) {
        alert(
          `Failed: ${
            error.response.data?.message || "Server returned an error"
          }`
        );
        setLoading(false);
      } else if (error.request) {
        alert("Network error. Please check your internet connection.");
        setLoading(false);
      } else {
        alert("Unexpected error. Please try again.");
        setLoading(false);
      }
    }
  };

  const clearCart = async (type) => {
    if (type === "clear") {
      const result = await Swal.fire({
        title: "Are you sure?",
        html: "Are you sure you want to clear the cart?",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#d33",
        cancelButtonColor: "#3085d6",
        confirmButtonText: "Yes, clear it!",
      });

      if (!result.isConfirmed) return;
    }

    try {
      const response = await axios.delete(
        "https://hazir-hay-backend.wckd.pk/cart/deleteUserCart",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.data.success) {
        if (type === "clear") {
          setCartData([]);
          Swal.fire("Cleared!", "Cart has been cleared.", "success");
        }
        setCartData([]);
      }
    } catch (error) {
      console.error("Error clearing cart:", error);
      Swal.fire(
        "Error",
        "Something went wrong while clearing the cart.",
        "error"
      );
    }
  };

  return (
    <div>
      <div
        className="modal fade show d-block"
        tabIndex="-1"
        style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
      >
        <div className="modal-dialog modal-fullscreen modal-dialog-centered">
          <div className="modal-content">
            <div className="modal-header d-flex justify-content-between">
              <div className="d-flex mt-2">
                <i
                  class="fa-solid fa-circle-chevron-left mt-1"
                  style={{ fontSize: "18px" }}
                  onClick={() => navigate("/admin/user/dashboard")}
                ></i>
                <h5 className="ms-2  fw-bold">My Cart</h5>
              </div>
              {groupedCart.length === 0 ? (
                ""
              ) : (
                <button
                  className="btn btn-danger btn-sm rounded-pill"
                  onClick={() => clearCart("clear")}
                  disabled={groupedCart.length === 0}
                >
                  Clear Cart<i class="fa-solid fa-trash ms-1"></i>
                </button>
              )}
            </div>
            <div className="modal-body" style={{ height: "auto" }}>
              {groupedCart.length > 0 ? (
                groupedCart.map((shop, index) => (
                  <div
                    key={index}
                    className="card shadow-sm mb-3 border-0"
                    style={{ borderRadius: "12px" }}
                  >
                    <div
                      className="card-header  fw-bold d-flex align-items-center"
                      style={{ background: "#AFEEEE" }}
                    >
                      <i className="fa-solid fa-shop me-2 text-primary"></i>
                      <span>
                        {shop.shopName}
                        <i class="fa-solid fa-angle-right"></i>
                      </span>
                    </div>

                    <div className="card-body">
                      {shop.items.map((service, i) => (
                        <div
                          key={i}
                          className="p-2 mb-2 border-bottom"
                          style={{ fontSize: "15px" }}
                        >
                          <div className="d-flex justify-content-between align-items-center">
                            <p className="mb-1 fw-semibold text-primary">
                              {service.subCategory}
                            </p>
                            <button
                              className="btn btn-outline-danger btn-sm"
                              onClick={() => deleteItem(service)}
                              disabled={loadingItemId === service._id}
                            >
                              {loadingItemId === service._id ? (
                                <div
                                  className="spinner-border spinner-border-sm text-dark"
                                  role="status"
                                ></div>
                              ) : (
                                <i className="fa-solid fa-trash-can"></i>
                              )}
                            </button>
                          </div>

                          <p className="mb-1 text-muted">
                            Category: <b>{service.category}</b>
                          </p>
                          <p className="mb-0 text-success fw-bold">
                            Rs. {service.price}/-
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                ))
              ) : (
                <div
                  className="d-flex flex-column justify-content-center align-items-center text-center"
                  style={{ height: "65vh" }}
                >
                  <img
                    src={cart}
                    alt="No Data"
                    className="mb-3"
                    style={{ width: "180px", height: "auto" }}
                  />
                  <h4 className="fw-bold text-danger mb-2">
                    Your Cart is Empty!
                  </h4>
                  <p
                    className="text-muted mx-auto"
                    style={{
                      maxWidth: "420px",
                      fontSize: "15px",
                      lineHeight: "1.6",
                    }}
                  >
                    Don’t miss out on our best services and deals.
                    <span className="fw-semibold text-primary">
                      Start adding items
                    </span>{" "}
                    now and enjoy a smooth checkout experience! ✨
                  </p>
                </div>
              )}
            </div>
            <div
              className={`modal-footer ${
                groupedCart.length === 0
                  ? ""
                  : "d-flex justify-content-between align-items-center bg-light"
              }`}
            >
              {groupedCart.length === 0 ? (
                ""
              ) : (
                <div>
                  <p className="mb-1 fs-5 fw-semibold text-primary">
                    Total:{" "}
                    <span className="text-success">Rs. {grandTotal}/-</span>
                  </p>
                  <p className="mb-0 text-muted">
                    Total Items:{" "}
                    <b className="text-dark">{cartData?.items?.length}</b>
                  </p>
                </div>
              )}
              {groupedCart.length === 0 ? (
                ""
              ) : (
                <button
                  type="button"
                  className="btn btn-success px-4 rounded-pill shadow-sm"
                  onClick={() => {setOrderSummaryModal(true)
                    fetchAllDistances();
                  }}
                >
                  Next <i className="fa-solid fa-angles-right ms-"></i>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
      {orderSummaryModal && (
        <div
          className="modal fade show d-block"
          tabIndex="-1"
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
        >
          <div className="modal-dialog modal-fullscreen modal-dialog-centered">
            <div className="modal-content rounded-3 shadow-lg">
              {/* HEADER */}
              <div className="modal-header border-0 bg-light d-flex justify-content-between align-items-center">
                <div className="d-flex align-items-center">
                  <i
                    className="fa-solid fa-circle-chevron-left text-primary"
                    style={{ fontSize: "20px", cursor: "pointer" }}
                    onClick={() => setOrderSummaryModal(false)}
                  ></i>
                  <h5 className="ms-2 fw-bold mb-0">Order Summary</h5>
                </div>
              </div>

              {/* BODY */}
              <div className="modal-body">
                <div className="card container border-0 shadow-sm p-3 rounded-3">
                  <h4 className="text-center text-success fw-bold mb-3">
                    Your Order Details
                  </h4>

                  {/* USER INFO */}
                  <div className="card border-0 shadow-sm p-3 mb-3 rounded-3">
                    <div className="d-flex">
                      <i
                        className="fa-solid fa-street-view text-danger me-3"
                        style={{ fontSize: "28px" }}
                      ></i>
                      <div>
                        <div className="d-flex">
                          <p className="fw-bold mb-0">{user.name}</p>
                          <p className="text-muted ms-2 mb-0">{user.phone}</p>
                        </div>
                        <p className="small text-muted mt-1">
                          {saved?.areaName
                            ? saved?.areaName.length > 58
                              ? saved?.areaName.slice(0, 58) + "..."
                              : saved?.areaName
                            : "No location found! Please update your location."}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* SHOP & ITEMS */}
                  {groupedCart.length > 0 &&
                    groupedCart.map((shop, index) => (
                      <div
                        key={index}
                        className="card shadow-sm mb-3 border-0 rounded-3"
                      >
                        <div
                          className="card-header fw-bold d-flex align-items-center"
                          style={{
                            background: "#E6F7FF",
                            borderRadius: "12px 12px 0 0",
                          }}
                        >
                          <i className="fa-solid fa-shop me-2 text-primary"></i>
                          <span>{shop.shopName}</span>
                        </div>

                        <div className="card-body">
                          {shop.items.map((service, i) => (
                            <div
                              key={i}
                              className="p-2 mb-2 border-bottom"
                              style={{ fontSize: "15px" }}
                            >
                              <div className="d-flex justify-content-between align-items-center">
                                <p className="mb-1 fw-semibold text-dark">
                                  {service.subCategory}
                                </p>
                                <p className="mb-1 text-success fw-bold ms-1">
                                  Rs. {service.price}/-
                                </p>
                              </div>
                              <p className="mb-1 text-muted small">
                                Category: <b>{service.category}</b>
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}

                  {/* DISTANCE & CHARGES */}
                  <div>
                    <h5 className="text-center fw-bold text-secondary mb-3">
                      Delivery Summary
                    </h5>

                    {groupedCart.length > 0 &&
                      groupedCart.map((shop, index) => {
                        const distance = shopDistances[shop.shopId] || 0;
                        return (
                          <div
                            key={index}
                            className="d-flex justify-content-between  border-bottom py-2"
                          >
                            <span className="text-muted">
                              <b className="text-dark">{shop.shopName}</b>
                            </span>
                            <span className="fw-bold text-success">
                              {distance} km
                            </span>
                          </div>
                        );
                      })}

                    <div className="d-flex justify-content-between align-items-center border-bottom py-2">
                      <span className="fw-bold text-dark">Total Distance</span>
                      <span className="fw-bold text-primary">
                        {totalDistance ? totalDistance : "loading.."} km
                      </span>
                    </div>

                    <div className="d-flex justify-content-between align-items-center py-2">
                      <span className="fw-bold text-dark">Service Charges</span>
                      <span className="fw-bold text-danger">
                        {rate} × {totalDistance} = {totalServiceCharges}/-
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* FOOTER */}
              <div className="modal-footer border-0 d-flex justify-content-between align-items-center bg-light">
                {saved?.areaName === "" ? (
                  <div className="w-100">
                    <p className="text-danger fw-bold mb-1 d-flex align-items-center">
                      <i className="fa-solid fa-triangle-exclamation me-2"></i>
                      Location Required to Checkout
                    </p>
                    <p className="text-muted mb-0" style={{ fontSize: "15px" }}>
                      We couldn’t find your location. Please update your{" "}
                      <strong>
                        <a href="/admin/user/dashboard">home location </a>
                      </strong>
                      to proceed with checkout and complete your order.
                    </p>
                  </div>
                ) : (
                  <>
                    <div>
                      <h6 className="mb-0 text-muted">Subtotal</h6>
                      <h4 className="text-primary fw-bold">Rs. {subTotal}</h4>
                    </div>
                    <button
                      type="button"
                      className="btn btn-success  rounded-pill "
                      onClick={sendRequestAll}
                      disabled={loading}
                    >
                      {loading ? (
                        <>
                          Proceeding...
                          <div
                            className="spinner-border spinner-border-sm text-light ms-2"
                            role="status"
                          ></div>
                        </>
                      ) : (
                        <>
                          Proceed to Checkout{" "}
                          <i className="fa-solid fa-angles-right ms-1"></i>
                        </>
                      )}
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {postOrderModal && (
        <div
          className="modal fade show d-block"
          tabIndex="-1"
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
        >
          <div className="modal-dialog modal-fullscreen-sm-down modal-lg modal-dialog-centered">
            <div className="modal-content shadow-lg  border-0">
              <div className="modal-body p-4">
                {/* Success Header */}
                <div className="text-center">
                  <i
                    className="fa-solid fa-circle-check text-success"
                    style={{ fontSize: "80px" }}
                  ></i>
                  <h3 className="fw-semibold mt-3 text-success">
                    Thank You, {user.name}!
                  </h3>
             <p className="text-muted">
  Your order{" "}
  <span className="position-relative d-inline-block">
    <b className="text-success">{checkoutId}</b>
    <span
      className="position-absolute start-100 badge bg-dark"
      style={{
        cursor: "pointer",
        opacity: 0.8, // makes background transparent
        transform: "translate(-50%, -90%)", // move a bit above
      }}
      onClick={()=>handleCopy(checkoutId)}
    >
      {copied ? "Copied!" : "Copy checkout id"}
    </span>
  </span>{" "}
  has been placed successfully.
</p>

                </div>

                {/* Order Confirmation */}
                <div className="card border-0 shadow-sm mt-4">
                  <div className="card-body">
                    <h6 className="fw-bold mb-2">
                      <i class="fa-solid fa-clipboard-check me-2"></i>Order
                      Confirmed
                    </h6>
                    <p className="text-muted small mb-0">
                      We have sent your order{" "}
                      <b className="text-success">{checkoutId}</b> to the
                      respective shops. Once they accept it, you will be
                      notified by email. After that, you can track your order in
                      real-time and start a live chat with the shop for updates.
                    </p>
                  </div>
                </div>
                <div className="row g-3 mt-3">
                  <div className="col-12 col-lg-6">
                    <div className="card border-0 shadow-sm h-100">
                      <div className="card-body">
                        <h6 className="fw-bold mb-2">
                          <i className="fa-solid fa-location-dot me-2 text-primary"></i>
                          Billing Address
                        </h6>
                        <p className="text-muted small mb-0">
                          {saved?.areaName || "No address available"}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Order Details */}
                  <div className="col-12 col-lg-6">
                    <div className="card border-0 shadow-sm h-100">
                      <div className="card-body">
                        <h6 className="fw-bold mb-2">
                          <i className="fa-solid fa-box-open me-2 text-warning"></i>
                          Order Details
                        </h6>
                        <ul className="list-unstyled small text-muted mb-0">
                          {groupedCart.map((shop, index) => (
                            <li key={index} className="mt-3">
                              <i className="fa-solid fa-store me-2 text-secondary"></i>
                              <span className="fw-bold ">
                                {shop.shopName} ({shop.items.length} items)
                              </span>
                              {shop.items.map((item, index) => (
                                <li key={index} className="mt-2">
                                  {index + 1}: {item.subCategory} (
                                  {item.category}){" "}
                                  <span className="text-primary ms-2 fw-semibold">
                                    Rs. {item.price}/-
                                  </span>
                                </li>
                              ))}
                            </li>
                          ))}

                          <div className="d-flex justify-content-between">
                            <p className="fw-bold mt-2 text-success">
                              Total Service Charges:
                            </p>
                            <p className="fw-bold mt-2 text-success">
                              {" "}
                              Rs. {totalServiceCharges}/-
                            </p>
                          </div>
                          <hr />
                          <div className="d-flex justify-content-between">
                            <h4 className="fw-bold mt-2 text-primary">
                              Sub Total:
                            </h4>
                            <h4 className="fw-bold mt-2 text-primary">
                              {" "}
                              Rs. {subTotal}/-
                            </h4>
                          </div>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Footer Actions */}
                <div className="d-flex justify-content-between mt-4">
                  <button
                    type="button"
                    className="btn btn-danger px-4 rounded-pill shadow-sm"
                     onClick={() => {
                    clearCart("update");
                    navigate("/admin/user/dashboard");
                  }}
                    disabled={groupedCart.length === 0}
                  >
                    Close
                  </button>
                  <button
                    type="button"
                    className="btn btn-success px-4 rounded-pill shadow-sm"
                    onClick={() => {setIsReciept(true)
                      setCopied(false)
                    }}
                    disabled={groupedCart.length === 0}
                  >
                    Generate Receipt{" "}
                    <i className="fa-solid fa-angles-right ms-2"></i>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      {isReciept && (
        <div
          className="modal fade show d-block"
          tabIndex="-1"
          style={{ backgroundColor: "rgba(0,0,0,0.6)" }}
        >
          <div className="modal-dialog modal-fullscreen-sm-down modal-lg modal-dialog-centered">
            <div className="modal-content shadow border-0 r overflow-hidden">
              {/* Body */}
              <div
                className="modal-body p-4 position-relative"
                id="receipt-content"
              >
                {/* Watermark Overlay */}
                <img
                  src={stamp}
                  alt="stamp"
                  style={{
                    position: "absolute",
                    top: "50%",
                    left: "50%",
                    transform: "translate(-50%, -50%)",
                    opacity: 0.2,
                    width: "300px",
                    zIndex: 10000,
                    pointerEvents: "none",
                  }}
                />

                {/* Receipt Content */}
                <div className="position-relative">
                  {/* Header */}
                  <div className="text-center border-bottom pb-3 mb-4">
                    <i
                      className="fa-solid fa-circle-check text-success"
                      style={{ fontSize: "70px" }}
                    ></i>
                    <h3 className="fw-bold mt-3 text-success">
                      Order Confirmed
                    </h3>
                     <p className="text-muted mb-0">
      Checkout ID:{" "}
      <span className="position-relative d-inline-block">
        <span className="fw-bold text-dark">{checkoutId}</span>
        <span
          className="position-absolute start-100 badge bg-dark"
          style={{
            cursor: "pointer",
            opacity: 0.8, // transparent background
            transform: "translate(-50%, -90%)", // move badge a little above
          }}
          onClick={()=>handleCopy(checkoutId)}
        >
          {copied ? "Copied!" : "Copy checkout id"}
        </span>
      </span>
    </p>
                    <small className="text-secondary">
                      Customer: {user.name}
                    </small>
                  </div>

                  {/* Order Summary */}
                  <h5 className="fw-bold mb-3 text-dark">
                    <i className="fa-solid fa-box-open me-2 text-warning"></i>{" "}
                    Order Summary
                  </h5>
                  <div className="bg-light rounded-3 p-3 mb-3">
                    <ul className="list-unstyled small mb-0">
                      {groupedCart.map((shop, index) => (
                        <li key={index} className="mb-3">
                          <span className="fw-bold text-dark">
                            <i className="fa-solid fa-store me-2 text-primary"></i>
                            {shop.shopName}
                          </span>
                          <ul className="list-unstyled ms-4 mt-2">
                            {shop.items.map((item, idx) => (
                              <li
                                key={idx}
                                className="d-flex justify-content-between align-items-center py-1 border-bottom"
                              >
                                <span>
                                  {idx + 1}. {item.subCategory}
                                </span>
                                <span className="fw-semibold text-primary">
                                  Rs. {item.price}/-
                                </span>
                              </li>
                            ))}
                          </ul>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Charges */}
                  <div className="mt-3">
                    <div className="d-flex justify-content-between">
                      <p className="fw-bold text-success mb-1">
                        Service Charges
                      </p>
                      <p className="fw-bold text-success mb-1">
                        Rs. {totalServiceCharges}/-
                      </p>
                    </div>
                    <hr />
                    <div className="d-flex justify-content-between">
                      <h4 className="fw-bold text-primary mb-0">Sub Total</h4>
                      <h4 className="fw-bold text-primary mb-0">
                        Rs. {subTotal}/-
                      </h4>
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="modal-footer border-0 bg-light d-flex justify-content-between px-4 py-3">
                <button
                  type="button"
                  className="btn btn-outline-secondary rounded-pill px-4"
                  onClick={() => {
                    setIsReciept(false);
                    clearCart("update");
                    setPostOrderModal(false);
                    setOrderSummaryModal(false);
                    navigate("/admin/user/dashboard");
                  }}
                >
                  Close
                </button>
                <div>
                  <button
                    type="button"
                    className="btn btn-warning rounded-pill px-4 me-2"
                    onClick={downloadReceiptAsPDF}
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        Downloading...
                        <div
                          className="spinner-border spinner-border-sm text-light ms-2"
                          role="status"
                        ></div>
                      </>
                    ) : (
                      <>
                        <i className="fa-solid fa-download me-2"></i> Download
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

export default Cart;
