import React from "react";
import logo from "../images/logo5.png"// add your logo path here

function PrivacyPolicies() {
  return (
    <div className="container my-3 px-3" style={{ fontSize: "1rem", lineHeight: "1.7" }}>
          <div className="mb-3">
    <i 
      className="fa fa-arrow-left" 
      style={{ cursor: "pointer", fontSize: "1.2rem" }} 
      onClick={() => window.history.back()} // go back to previous page
    ></i>
  </div>
      
      {/* LOGO */}
      <div className="text-center mb-4">
        <img src={logo} alt="Hazir Hay Logo" style={{ maxWidth: "150px" }} />
      </div>

      {/* PAGE TITLE */}
      <h2 className="text-center mb-3 fw-bold" style={{ fontWeight: "700" }}>
        Hazir Hay – Privacy Policy
      </h2>
      <p className="text-center text-muted mb-4">
        Your security and trust are our <b>1st priority</b>. We respect your privacy and handle your data responsibly.
      </p>

      {/* INTRODUCTION */}
      <section className="mb-5">
        <h4 className="fw-bold" style={{ color: "#ff6600" }}>Introduction</h4>
        <p>
          Hazir Hay is a service platform that connects <b>Users</b>, <b>Service Providers</b>, <b>Only Shops</b>, and <b>Workers</b>.
          This Privacy Policy explains how we collect, use, and protect your information. By using our platform, you agree to the practices described herein.
        </p>
        <p>
          We are committed to being transparent about the data we collect, why we collect it, and how it is protected. Our goal is to provide a secure, reliable, and trustworthy platform for all our users and partners.
        </p>
      </section>

      {/* INFORMATION WE COLLECT */}
      <section className="mb-5">
        <h4 className="fw-bold" style={{ color: "#ff6600" }}>Information We Collect</h4>
        <p>We collect the following information from all roles:</p>
        <table className="table table-striped table-bordered">
          <thead className="table-light">
            <tr>
              <th>Field</th>
              <th>Description</th>
            </tr>
          </thead>
          <tbody>
            <tr><td>Name</td><td>Your full name for identification and communication.</td></tr>
            <tr><td>Phone Number</td><td>Used for verification, authentication, and contact.</td></tr>
            <tr><td>Email</td><td>Used for account login, notifications, and communication.</td></tr>
            <tr><td>Password</td><td>Stored securely in encrypted form to protect your account.</td></tr>
            <tr><td>Profile Picture</td><td>Displayed on your profile for identification purposes.</td></tr>
            <tr><td>Address</td><td>Used for service location, deliveries, or identification.</td></tr>
            <tr><td>Current Location</td><td>Helps show nearby services and optimize your experience.</td></tr>
          </tbody>
        </table>

        <h5 className="mt-3 fw-bold" style={{ color: "#ff6600" }}>Additional Data for Service Providers</h5>
        <table className="table table-striped table-bordered">
          <thead className="table-light">
            <tr>
              <th>Field</th>
              <th>Reason</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>CNIC Number</td>
              <td>For identity verification, safety, and trust.</td>
            </tr>
          </tbody>
        </table>
      </section>

      {/* HOW WE USE YOUR INFORMATION */}
      <section className="mb-5">
        <h4 className="fw-bold" style={{ color: "#ff6600" }}>How We Use Your Information</h4>
        <ul>
          <li>Manage and secure your account.</li>
          <li>Verify identity to prevent fraud or misuse.</li>
          <li>Match users with service providers and shops efficiently.</li>
          <li>Enhance app performance and user experience.</li>
          <li>Send notifications related to orders, updates, and services.</li>
          <li>Analyze trends to improve our platform.</li>
        </ul>
      </section>

      {/* DATA SECURITY */}
      <section className="mb-5">
        <h4 className="fw-bold" style={{ color: "#ff6600" }}>Data Protection & Security</h4>
        <p>We take the security of your data seriously. Some of the measures we follow:</p>
        <ul>
          <li>Passwords are stored in encrypted form and never visible in plain text.</li>
          <li>Your personal data is never shared with third parties without explicit consent.</li>
          <li>Profile pictures and documents are stored securely on cloud servers.</li>
          <li>Location data is used solely for service purposes and not shared publicly.</li>
          <li>Continuous monitoring to prevent unauthorized access and breaches.</li>
          <li>Regular security audits and updates to maintain high standards of data protection.</li>
        </ul>
      </section>

      {/* USER RIGHTS */}
      <section className="mb-5">
        <h4 className="fw-bold" style={{ color: "#ff6600" }}>Your Rights</h4>
        <p>You have control over your personal data and can exercise the following rights:</p>
        <ul>
          <li>Update or correct your profile information anytime.</li>
          <li>Request deletion of your personal data if you stop using our services.</li>
          <li>Choose to stop receiving promotional messages or notifications.</li>
          <li>Request a copy of the data we hold about you at any time.</li>
        </ul>
      </section>

      {/* RESPONSIBLE USE */}
      <section className="mb-5">
        <h4 className="fw-bold" style={{ color: "#ff6600" }}>Responsible Use of Platform</h4>
        <p>
          All users, service providers, and shops are expected to use Hazir Hay responsibly. Any misuse, fraudulent activity, or violation of policies may result in suspension or termination of the account.
        </p>
        <p>
          We encourage users to report suspicious behavior or content to help maintain a safe and trustworthy platform for everyone.
        </p>
      </section>

      {/* CONTACT US */}
 <section className="mb-5">
  <h4 className="fw-bold" style={{ color: "#ff6600" }}>Contact Us</h4>
  <p>If you have questions about this Privacy Policy or how we handle your data, please reach out to us:</p>
  <ul>
    <li>
      <i className="fa fa-envelope"></i>{" "}
      <a href="mailto:support@hazirhay.com">support@hazirhay.com</a>
    </li>
    <li>
      <i className="fa fa-globe"></i>{" "}
      <a href="https://www.hazir-hay.vercel.app" target="_blank" rel="noopener noreferrer">
        www.hazirhay.com
      </a>
    </li>
    <li>
      <i className="fa fa-phone"></i>{" "}
      <a href="tel:+923266783442">+92-326-6783442</a>
    </li>
    <li>
      <i className="fa fa-whatsapp"></i>{" "}
      <a href="https://wa.me/923266783442" target="_blank" rel="noopener noreferrer">
        Chat on WhatsApp
      </a>
    </li>
  </ul>
</section>


      {/* FINAL STATEMENT */}
      <section className="mb-5 text-center">
        <p>
          Your trust matters to us. Hazir Hay is committed to maintaining a secure, private, and reliable platform.
          We continuously improve our systems and policies to ensure your safety and satisfaction.
        </p>
        <p>
          By using Hazir Hay, you acknowledge and accept this Privacy Policy and agree to our Terms & Conditions.
        </p>
      </section>

    </div>
  );
}

export default PrivacyPolicies;
