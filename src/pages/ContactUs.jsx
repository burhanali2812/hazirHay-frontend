import React from "react";
import contact from "../images/contact.png";

function ContactUs() {
  return (
    <div className="container overflow-auto mb-5">
      {/* Heading Section */}
      <div className="text-center mt-4">
        <h1 className="fw-bold">Let's Contact Us</h1>
        <h3 className="fw-bold" style={{ color: "#ff6600" }}>
          We’re here for you!
        </h3>
        <p className="text-muted">
          You can send suggestions, improvements, complaints about our service,
          or anything else — 24/7, without any hesitation.
        </p>
      </div>

      {/* Contact Image */}
      <div className="text-center ">
        <img
          src={contact}
          alt="Contact"
          className="img-fluid"
          style={{ maxWidth: "250px" }}
        />
      </div>

      {/* Form Card */}
      <div className="row justify-content-center">
        <div className="card col-md-6 bg-light rounded-3 border-0 shadow p-4">
          <label className="fw-bold mb-1">Name</label>
          <input
            type="text"
            placeholder="e.g Burhan Ali"
            className="form-control mb-3"
          />

          <label className="fw-bold mb-1">Email</label>
          <input
            type="email"
            placeholder="abc12@example.com"
            className="form-control mb-3"
          />

          <label className="fw-bold mb-1">Message</label>
          <textarea
            placeholder="Write your suggestion or complaint"
            className="form-control mb-3"
            rows="4"
          />

          <button className="w-100 btn btn-primary rounded-pill mb-3">
            Send
            <i class="fa-solid fa-paper-plane ms-2"></i>
          </button>

          {/* Divider */}
          <div className="d-flex align-items-center my-3">
            <hr className="flex-grow-1" />
            <span className="mx-2 text-muted fw-bold">OR</span>
            <hr className="flex-grow-1" />
          </div>

          {/* Social Icons */}
          <div className="text-center">
            <p className="mb-2">You can also contact us on</p>
            <div className="d-flex justify-content-center gap-3 fs-2">
              {/* WhatsApp */}
              <a
                href="https://wa.me/923070452812"
                target="_blank"
                rel="noreferrer"
                style={{ color: "#25D366" }}
              >
                <i className="fa-brands fa-square-whatsapp"></i>
              </a>

              {/* Facebook */}
              <a
                href="https://www.facebook.com/syed.burhanali.395"
                target="_blank"
                rel="noreferrer"
                style={{ color: "#1877F2" }}
              >
                <i className="fa-brands fa-square-facebook"></i>
              </a>

              {/* Instagram */}
              <a
                href="https://www.instagram.com/ali_syedburhan?igsh=OGlzOGRtYW8wc283"
                target="_blank"
                rel="noreferrer"
                style={{
                  background:
                    "linear-gradient(45deg, #f09433, #e6683c, #dc2743, #cc2366, #bc1888)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                <i className="fa-brands fa-square-instagram"></i>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ContactUs;
