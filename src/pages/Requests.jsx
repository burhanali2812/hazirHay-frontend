import axios from "axios";
import React, { useEffect, useState } from "react";
import request from "../videos/request.mp4";
import noData from "../images/noData.png";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
function Requests({ setTopText }) {
  useEffect(() => {
    setTopText("Requests");
  }, [setTopText]);
  const token = localStorage.getItem("token");
  const id = localStorage.getItem("id");
  const [shopWithShopkepper, setShopWithShopkepper] = useState([]);
  const [loading, setLoading] = useState(false);
  const [acceptLoadingId, setAcceptLoadingId] = useState(null);

  const getShopWithShopkeppers = async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        "https://hazir-hay-backend.vercel.app/admin/allShopkepperWithShops",
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

 const approve = async (shopWithKeep) => {
    setAcceptLoadingId(shopWithKeep._id)
  const payload = {
    isVerified: true,
  };

  try {
    const response = await axios.put(
      `https://hazir-hay-backend.vercel.app/admin/shopKepper/${shopWithKeep._id}`,
      payload,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (response.status === 200) {
      toast.success("Shopkeeper verified successfully");
      setAcceptLoadingId(null)
      getShopWithShopkeppers();
    }
  } catch (error) {
    console.error("Error verifying shopkeeper:", error);
    toast.error("Failed to verify shopkeeper");
      setAcceptLoadingId(null);
  }
};


  return (
    <>
      {loading ? (
        <div
          className="text-center mb-4"
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            flexDirection: "column",
            height: "60vh", 
            textAlign: "center",
          }}
        >
          <video
            src={request}
            autoPlay
            loop
            muted
            style={{
              width: "250px",
              height: "auto",
              display: "inline-block",
            }}
          />
          <h2 style={{ color: "#ff6600" }}>Loading...</h2>
        </div>
      ) : (
        <div className="container my-4">
          <ToastContainer />

          {shopWithShopkepper.length !== 0 ? (
            shopWithShopkepper.filter(Boolean).map((shopwithkeep, index) => (
             
              <div className="card p-3 mb-3" key={index}>
                <div className="d-flex align-items-center">
                  <div className="me-3">
                    <div
                      style={{
                        width: "90px",
                        height: "90px",
                        borderRadius: "50%",
                        overflow: "hidden",
                        border: "2px solid #ddd",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        backgroundColor: "#f8f9fa",
                      }}
                    >
                      <img
                        src={
                          shopwithkeep?.profilePicture ||
                          shopwithkeep.shop?.shopPicture
                        }
                        alt="Shop"
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                        }}
                      />
                    </div>
                  </div>

                  <div className="flex-grow-1">
                    <p className="mb-1">
                      <strong style={{ color: "#ff6600" }}>
                        <i className="fa-solid fa-user me-2"></i>Name:
                      </strong>{" "}
                      {shopwithkeep.name}
                    </p>
                    <p className="mb-1">
                      <strong style={{ color: "#ff6600" }}>
                        <i className="fa-solid fa-phone me-2"></i>Phone:
                      </strong>{" "}
                      {shopwithkeep.phone}
                    </p>
                    <p className="mb-2" style={{ wordBreak: "break-word" }}>
                      <strong style={{ color: "#ff6600" }}>
                        <i className="fa-solid fa-shop me-1"></i>Shop:
                      </strong>{" "}
                      {shopwithkeep.shop?.shopName || "N/A"}
                    </p>

                    <div className="d-flex gap-2">
                      <button className="btn btn-success btn-sm rounded-pill" disabled={acceptLoadingId === shopwithkeep._id} onClick={()=>approve(shopwithkeep)}>
                        {acceptLoadingId === shopwithkeep._id ? (
                          <div className="d-flex">
                          <span role="status">wait</span>
                            <span
                              className="spinner-border spinner-border-sm ms-2"
                              aria-hidden="true"
                            ></span>
                          </div>
                        ) : (
                          <>
                            Accept
                          </>
                        )}
                        
                      </button>
                      <button className="btn btn-danger btn-sm rounded-pill">
                        Delete
                      </button>
                      <button className="btn btn-info btn-sm text-white rounded-pill">
                        Details
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                flexDirection: "column",
                height: "60vh", 
                textAlign: "center",
              }}
            >
              <img
                src={noData}
                alt="No Data"
                style={{
                  width: "200px", 
                  height: "auto", 
                  marginBottom: "20px",
                }}
              />
              <h3
                style={{
                  fontWeight: "700",
                  marginBottom: "10px",
                  color: "#ff6600",
                }}
              >
                Whoops! Nothing Here...
              </h3>
              <p
                style={{
                  fontSize: "18px",
                  lineHeight: "1.5",
                  color: "#777",
                  maxWidth: "400px",
                }}
              >
                We gave it our best shot, but there are no requests at the
                moment. <br />
                Check back soon or try refreshing the page!
              </p>
            </div>
          )}
        </div>
      )}
    </>
  );
}

export default Requests;
