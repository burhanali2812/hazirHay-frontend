import React, { useState, useEffect } from "react";
import track from "../images/track.png";
import notFound from "../images/notFound.png"
import axios from "axios";
function Tracking() {
    const token = localStorage.getItem("token")
  const [requestsData, setRequestsData] = useState([]);
  const [searchQuery, setSearchQuery] = useState([]);
  const [serachData, setSearchData] = useState([]);

  const fetchUserCart = async () => {
    try {
      const response = await axios.get(
        "https://hazir-hay-backend.wckd.pk/requests/getUserRequests",
        {
          headers: { Authorization: `Bearer ${token}` },
          params: { t: Date.now() },
        }
      );
      if(response.data.success){
       // alert("Cart Data Fetch SuccessFully")
        console.log(response.data.data || []);
        setRequestsData(response.data.data || [])
        
      }
    } catch (error) {
         console.error("Error Fetching reuests data:", error.message);
    }
  };

  useEffect(()=>{
    fetchUserCart();
  },[])

const handleChange = (e) => {
  const value = e.target.value.toUpperCase(); // keep input in uppercase
  setSearchQuery(value);
  console.log("words",  value.length);
    if(value.length === 0){
    setSearchData([]);
    return;
  }
  

  const data = requestsData.filter((request) =>
    request.checkoutId ? request.checkoutId.includes(value) : false
  );
  console.log(data);

  

  setSearchData(data);
};



  return (
    <div className="container mt-3 " style={{ overflowY: 0 }}>
      <form className="d-flex" role="search" style={{ width: "auto" }}>
        <div className="position-relative w-100 mb-4">
          <input
            type="search"
            className="form-control bg-transparent rounded-pill ps-5 pe-5"
            placeholder="CHK-XXX-XXX"
            aria-label="Search"
            value={searchQuery}
            onChange={handleChange}
            style={{ border: "2px solid #ffacb2ff" }}
          />

          {/* Search Icon (left inside input) */}
          <span className="position-absolute top-50 start-0 translate-middle-y ps-3 text-muted">
            <i className="fa-solid fa-magnifying-glass"></i>
          </span>
        </div>
      </form>

 


      {
  serachData.length > 0 ? (

   serachData.map((data, index) => (
  <div 
    key={index} 
    className="d-flex justify-content-between align-items-center p-3 mb-2 rounded shadow-sm border"
    style={{ backgroundColor: "#fff" }}
  >
    {/* Left content */}
    <div>
      <p className="fw-bold mb-1 text-dark">{data.orderId}</p>
      <p className="mb-1 text-muted">
        {data.subCategory} <small>({data.category})</small>
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
        <span className="badge bg-warning text-dark ">{data.status}</span>
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
          Just enter your tracking ID (for example, <strong>CHK-XXX-XXX</strong>
          ) and we’ll help you see where your order is, check shop details, and
          follow it live — simple and quick!
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
          style={{ width: "300px", height: "auto" }}
        />
          <h4 className="fw-bold text-danger mb-2 mt-0">Sorry, Checkout Not Found</h4>
      <p
        className="text-muted"
        style={{ maxWidth: "380px", fontSize: "15px" }}
      >
        The checkout ID you entered doesn’t match our records. 
        Kindly re-check the ID (e.g., <strong>CHK-XXX-XXX</strong>) 
        or try a different one.
      </p>
      </div>
  ) :("")
}

    </div>
  );
}

export default Tracking;
