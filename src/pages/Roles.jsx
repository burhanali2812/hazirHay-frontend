import React from 'react'
import worker from "../images/worker2.png"
import shop from "../images/shops.png"
import user from "../images/users.png"
import service from "../images/services.png"

function Roles() {
  return (
    <div className="container  mt-4">

      {/* HEADER */}
      <h2 className="fw-bold" style={{ letterSpacing: "1px" }}>
        Choose Your Role
      </h2>
      <h5 className="fw-bold" style={{ color: "#ff6600" }}>
        Select the option that represents you best
      </h5>
      <p className="text-secondary mx-auto" style={{ maxWidth: "600px" }}>
        Join our community today and unlock smart tools to boost your work,
        grow visibility, and connect with the right customers.
      </p>

      {/* CARDS GRID */}
      <div className="row g-2 mt-3 d-flex justify-content-center align-items-center text-center ">

        {[
          { img: user, title: "User" },
          { img: service, title: "Service Provider" },
          { img: shop, title: "Shop" },
          { img: worker, title: "Worker" },
        ].map((item, index) => (
          <div className="col-6 col-md-6 d-flex justify-content-center" key={index}>
            <div
              className="card shadow-lg d-flex flex-column justify-content-center align-items-center"
              style={{
                height: "155px",   
                width: "180px",    
                borderRadius: "20px",
                transition: "0.3s",
                cursor: "pointer",
                padding: "10px"
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "scale(1.07)";
                e.currentTarget.style.boxShadow = "0 12px 30px rgba(0,0,0,0.2)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "scale(1)";
                e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.1)";
              }}
            >
              <img
                src={item.img}
                alt={item.title}
                style={{
                  width: "120px",   
                  height: "120px",
                  objectFit: "contain",
                }}
              />

              <h6 className="fw-bold">{item.title}</h6>
            </div>
          </div>
        ))}

      </div>
    </div>
  )
}

export default Roles
