import React from "react";
import logo from "../images/logo5.png"

const faqs = [
  {
    q: "What is HazirHay and how does it work?",
    a: "HazirHay connects customers with local shops for quick discovery, ordering, and service booking through a single platform.",
  },
  {
    q: "How do I create or update my shop profile?",
    a: "Open the dashboard, go to Shop Information, edit the details (name, address, description), then save changes.",
  },
  {
    q: "How can I set my shop online or offline?",
    a: "Use the Online/Offline toggle in the dashboard sidebar or Overview header to control visibility.",
  },
  {
    q: "How do I upload or replace my shop picture?",
    a: "Open the Image modal in the dashboard, choose Shop Picture, select an image, and upload.",
  },
  {
    q: "How do I add or remove menu cards?",
    a: "In the Menu Cards tab, click Add, select images, and upload. To remove, click Delete on any card.",
  },
  {
    q: "How are payments handled?",
    a: "Add your payment details image in the Payment tab. Customers follow the payment instructions you provide.",
  },
  {
    q: "Can I edit my services list?",
    a: "Yes. In the Services tab, add new services or remove existing ones, then save.",
  },
  {
    q: "How do I update my shop location?",
    a: "Open the Location tab, edit latitude, longitude, and area, preview the map, then save.",
  },
  {
    q: "Why should I verify my shop?",
    a: "Verified shops gain trust, better visibility, and improved customer confidence.",
  },
  {
    q: "Who do I contact for support?",
    a: "Use the Contact/Support option in the app or email support@hazirhay.com for assistance.",
  },
  {
    q: "How often should I refresh my menu or services?",
    a: "Update whenever prices or offerings change to keep customers informed and avoid order issues.",
  },
];

function FAQS() {
  return (
    <div className="bg-light">
      {/* Hero */}
      <div
        className="w-100 py-2 bg-light"
      
      >
        <div className="container text-center">
          <img
            src={logo}
            alt="HazirHay"
            className="mb-3"
           style={{ maxWidth: "150px" }}
          />
          <h2 className="fw-bold mb-2">Frequently Asked Questions</h2>
          <p className="mb-0 opacity-75">
            Quick answers to help you manage your shop and delight your
            customers.
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="container py-5" style={{ maxWidth: 900 }}>
        <div className="card shadow-sm border-0">
          <div className="card-body p-4 p-md-5">
            <div className="d-flex align-items-center mb-4">
              <div className="rounded-circle bg-primary bg-opacity-10 p-3 me-3">
                <i className="fas fa-question-circle text-primary fs-4"></i>
              </div>
              <div>
                <h5 className="fw-bold mb-1 text-secondary">Need help?</h5>
                <p className="text-muted small mb-0">
                  Browse the FAQs or reach out to support if you need more
                  assistance.
                </p>
              </div>
            </div>

            <div className="accordion" id="faqsAccordion">
              {faqs.map((item, idx) => {
                const collapseId = `faq-collapse-${idx}`;
                const headingId = `faq-heading-${idx}`;
                return (
                  <div
                    className="accordion-item border-0 mb-2 shadow-sm"
                    key={idx}
                  >
                    <h2 className="accordion-header" id={headingId}>
                      <button
                        className="accordion-button collapsed py-3 fw-semibold text-secondary"
                        type="button"
                        data-bs-toggle="collapse"
                        data-bs-target={`#${collapseId}`}
                        aria-expanded="false"
                        aria-controls={collapseId}
                        style={{ fontSize: "0.95rem" }}
                      >
                        {idx + 1} {" . "}
                        {item.q}
                      </button>
                    </h2>
                    <div
                      id={collapseId}
                      className="accordion-collapse collapse"
                      aria-labelledby={headingId}
                      data-bs-parent="#faqsAccordion"
                    >
                      <div
                        className="accordion-body text-muted"
                        style={{ fontSize: "0.93rem" }}
                      >
                        {item.a}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-4 text-center">
              <div className="text-muted small mb-2">Still have questions?</div>
              <a
                className="btn btn-primary btn-sm px-3"
                href="mailto:support@hazirhay.com"
              >
                <i className="fas fa-envelope me-2"></i>
                Contact Support
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default FAQS;
