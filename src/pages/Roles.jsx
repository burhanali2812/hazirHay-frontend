import React from 'react'

import shop from "../images/shops.png"
import user from "../images/users.png"
import service from "../images/services.png"
import worker from "../images/worker2.png"
import { useNavigate } from 'react-router-dom'
import { useAppContext } from '../context/AppContext'
function Roles() {
    const navigate = useNavigate();
    const{method} = useAppContext();

    const handleRoles = (role)=>{
        localStorage.setItem("role", role)

        if(method === "login"){
            navigate("/login")
        }
        else{
             if(role === "shop"){
            navigate("/localShopSignup")
        }
        else{
 navigate("/signup")
        }
        }
       
       
    }
  return (
    <div className="container  mt-1">
              <i
        className="fa-solid fa-arrow-left-long mt-3 mx-1"
        style={{ fontSize: "1.6rem", cursor: "pointer" }}
        onClick={() => {navigate("/"); localStorage.clear();}}
      ></i>
<div className='mx-4 mt-1'>
    
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
</div>

   
<div
  className="d-flex justify-content-center align-items-center "
  style={{ minHeight: "60vh" }}
>
  <div className="row g-1 d-flex justify-content-center text-center">

    {[
      { img: user, title: "User" , role : "user"},
      { img: service, title: "Service Provider" , role:"shopKepper"},
      { img: shop, title: "Shop" , role : "shop"},
       ...(method === "login"
    ? [{ img: worker, title: "Worker", role: "worker" }]
    : [])
    ].map((item, index) => (
      <div className={`${method === "login" ? "col-6 col-md-3" : "col-12 col-md-4"}  d-flex justify-content-center`} key={index}>
        <div
          className="card shadow-lg d-flex flex-column justify-content-center align-items-center bg-light"
          style={{
            height: "155px",
            width: "180px",
            borderRadius: "10px",
            transition: "0.3s",
            cursor: "pointer",
            padding: "10px"
          }}

          onClick={()=>handleRoles(item.role)}
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

    </div>
  )
}

export default Roles
