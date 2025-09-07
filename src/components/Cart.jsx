import axios from "axios";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
function Cart({ cartData, setUpdateAppjs }) {
  // safely get items

  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const [loadingItemId, setLoadingItemId] = useState(null);
  const [orderSummaryModal, setOrderSummaryModal] = useState(false);
            
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
  useEffect(() => {
    console.log("gropCart ", groupedCart);
  }, [groupedCart]);

  const grandTotal = groupedCart.reduce(
    (acc, cart) => acc + cart.items.reduce((sum, item) => sum + item.price, 0),
    0
  );

  const deleteItem = async (service) => {
    setLoadingItemId(service._id); // only this item is loading
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
            </div>
            <div className="modal-body" style={{ height: "auto" }}>
              {groupedCart.length > 0 &&
                groupedCart.map((shop, index) => (
                  <div
                    key={index}
                    className="card shadow-sm mb-3 border-0"
                    style={{ borderRadius: "12px" }}
                  >
                    <div className="card-header  fw-bold d-flex align-items-center" style={{background : "#AFEEEE"}}>
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
                ))}
            </div>
            <div className="modal-footer d-flex justify-content-between align-items-center bg-light ">
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

              <button
                type="button"
                className="btn btn-success px-4 rounded-pill shadow-sm"
                 onClick={() => setOrderSummaryModal(true)}
              >
                Next <i className="fa-solid fa-angles-right ms-"></i>
              </button>
            </div>
          </div>
        </div>
      </div>

      {
        orderSummaryModal && (
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
                  onClick={() => setOrderSummaryModal(false)}
                ></i>
                <h5 className="ms-2  fw-bold">Order Summary</h5>
              </div>
            </div>
            <div className="modal-body" style={{ height: "auto" }}>

            </div>
            <div className="modal-footer">
            

              <button
                type="button"
                className="btn btn-success px-4 rounded-pill shadow-sm"
                 onClick={() => {setOrderSummaryModal(false)}}
              >
                Check Out <i className="fa-solid fa-angles-right ms-"></i>
              </button>
            </div>
          </div>
        </div>
      </div>
        )
      }
    </div>
  );
}

export default Cart;
