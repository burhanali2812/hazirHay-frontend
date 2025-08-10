import React,{useState} from "react";
import { useNavigate } from "react-router-dom";
import 'animate.css';
function Signup() {
  const role = localStorage.getItem("role");
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    profilePicture: null,
    name: "",
    email: "",
    contact: "",
    address: "",
    password: "",
    confirmPassword: "",
  });
  const [isChecked, setIsChecked] = useState(false);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "profilePicture") {
      const file = files[0];
      setFormData({ ...formData, profilePicture: file });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log(formData); 
  };


  return (
    <div className="container  animate__animated animate__fadeInLeft animate__delay-0s">
      <i
        className="fa-solid fa-arrow-left-long mt-3 mx-2"
        style={{ fontSize: "1.6rem", cursor: "pointer" }}
        onClick={() => navigate("/")}
      ></i>
      {role &&
        (role === "user" ? (
          <>
            <h1 className="mx-3 fw-bold">Your Future Starts Here</h1>
            <h3 className="mx-3 fw-bold" style={{ color: "#ff6600" }}>
              Find Exactly What You Need
            </h3>
            <p className="mx-3">
              Join today to discover trusted services — connect with top
              providers and bring your ideas to life.
            </p>
          </>
        ) : (
          <>
            <h1 className="mx-3 fw-bold">Your Future Starts Here</h1>
            <h3 className="mx-3 fw-bold" style={{ color: "#ff6600" }}>
              Turn Skills Into Success
            </h3>
            <p className="mx-3">
              Join today to showcase your expertise — connect with the right
              clients, expand your network, and achieve more.
            </p>
          </>
        ))}

         <form onSubmit={handleSubmit} className="shadow p-4 rounded bg-white">

        {/* Profile Picture Preview */}
        <div className="mb-3 text-center">
          <label htmlFor="profilePicture" className="form-label fw-bold">
            Profile Picture
          </label>
          <div className="d-flex justify-content-center mb-2">
            <div
              style={{
                width: "130px",
                height: "130px",
                borderRadius: "50%",
                overflow: "hidden",
                border: "2px solid #ddd",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: "#f8f9fa",
              }}
          
            >
              {formData.profilePicture ? (
                <img
                  src={URL.createObjectURL(formData.profilePicture)}
                  alt="Profile Preview"
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                  }}
                />
              ) : (
                <i
                  className="fa-solid fa-user"
                  style={{ fontSize: "50px", color: "#aaa" }}
                ></i>
              )}
            </div>
          </div>
          <input
            type="file"
            className="form-control"
            name="profilePicture"
            accept="image/*"
            onChange={handleChange}
          />
        </div>

<div className="form-floating mb-3">
  <input
    type="text"
    className="form-control"
    name="name"
    id="nameInput"
    placeholder="Enter your name"
    value={formData.name}
    onChange={handleChange}
    required
  />
  <label htmlFor="nameInput">Name</label>
</div>

<div className="form-floating mb-3">
  <input
    type="email"
    className="form-control"
    name="email"
    id="emailInput"
    placeholder="Enter your email"
    value={formData.email}
    onChange={handleChange}
    required
  />
  <label htmlFor="emailInput">Email</label>
</div>

<div className="form-floating mb-3">
  <input
    type="tel"
    className="form-control"
    name="contact"
    id="contactInput"
    placeholder="Enter your contact number"
    value={formData.contact}
    onChange={handleChange}
    required
  />
  <label htmlFor="contactInput">Contact</label>
</div>

<div className="form-floating mb-3">
  <textarea
    className="form-control"
    name="address"
    id="addressInput"
    placeholder="Enter your address"
    value={formData.address}
    onChange={handleChange}
    style={{ height: "100px" }}
    required
  ></textarea>
  <label htmlFor="addressInput">Address</label>
</div>

<div className="form-floating  mb-2">
  <input
    type={isChecked ? ("text"):("password")}
    className="form-control"
    name="password"
    id="passwordInput"
    placeholder="Enter your password"
    value={formData.password}
    onChange={handleChange}
    required
  />
  <label htmlFor="passwordInput">Password</label>
</div>
<div className="form-check mb-3">
  <input
    type="checkbox"
    className="form-check-input"
    id="exampleCheck"
    checked={isChecked}
    onChange={(e)=>setIsChecked(e.target.checked)}
  />
  <label className="form-check-label" htmlFor="exampleCheck">
    Show Password
  </label>
</div>


<div className="form-floating mb-4">
  <input
    type="password"
    className="form-control"
    name="confirmPassword"
    id="confirmPasswordInput"
    placeholder="Re-enter your password"
    value={formData.confirmPassword}
    onChange={handleChange}
    required
  />
  <label htmlFor="confirmPasswordInput">Confirm Password</label>
</div>


      {
        role === "user" ? (
              <button type="submit" className="btn btn-primary w-100 fw-bold">
          Sign Up
        </button>
        ):(
              <button type="submit" className="btn btn-primary w-100 fw-bold">
          Continue For Shop Details
        </button>
        )
      }
      </form>
    </div>
  );
}

export default Signup;
