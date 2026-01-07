import React, { useState, useEffect } from "react";
import { useAppContext } from "../context/AppContext";
import axios from "axios";
import { services } from "../components/servicesData";
import { Toaster, toast } from "react-hot-toast";
function MyShopServices() {
  const { shop, getShopData } = useAppContext();
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedSubCategory, setSelectedSubCategory] = useState(null);
  const [selectedService, setSelectedService] = useState(null);
   const [deleteServiceId, setDeleteServiceID] = useState(null);
  const [isAddServiceModalOpen, setIsAddServiceModal] = useState(false);
  const [isEditServiceModalOpen, setIsEditServiceModal] = useState(false);
  const [serviceAddLoading, setServiceAddLoading] = useState(false);
  const [isAlreadyFound, setIsAlreadyFound] = useState(false);
  const [recommendedPrice, setRecommendedPrice] = useState([]);
  const [isFindingRecomendedPrice, setIsRecomendedPriceFinding] =
    useState(false);
  const [price, setPrice] = useState(null);
  const [isVariablePricing, setIsVariablePricing] = useState(false);
  const [description, setDescription] = useState("");

  const getRecomendedPrice = async (selectedCategory, selectedSubCategory) => {
    setIsRecomendedPriceFinding(true);
    const payload = {
      category: selectedCategory ,
      subCategory: selectedSubCategory,
    };

    try {
      const response = await axios.post(
        "https://hazir-hay-backend.vercel.app/shops/getPriceEstimate",
        payload
      );

      if (response.data.success) {
        setRecommendedPrice(response.data.averagePrices || 0);
        console.log(`Recommended Price: ${response.data.averagePrices}`);
        setIsRecomendedPriceFinding(false);
      }
    } catch (error) {
      console.error("Error fetching price:", error);
      setIsRecomendedPriceFinding(false);
    }
  };

useEffect(() => {
  if (selectedCategory && selectedSubCategory) {
      
    const alreadyExist = shop?.servicesOffered?.filter((service) => {
      return (
        service.category === selectedCategory &&
        service.subCategory.name === selectedSubCategory
      );
    });

    if (alreadyExist && alreadyExist.length > 0) {
      console.log("already");
      
        setIsAlreadyFound(true)
      toast.error("Service Already Present!");
      return;
    }
    setIsAlreadyFound(false)

    getRecomendedPrice(selectedCategory, selectedSubCategory);
  }
}, [selectedCategory, selectedSubCategory]);


  const handleEditAndDeleteService = async (mode, service) => {
    let payload;
   if(mode === "edit"){
    setServiceAddLoading(true)
      payload = {
      mode,
      serviceId: service._id,
      category: service.category,
      subCategory: {
        name: service.subCategory.name,
        price: price !== null ? price : service.subCategory.price,
        description: service.subCategory.description,
        isVariablePricing: service.subCategory.isVariablePricing,
      },
    };
   }
   if(mode === "delete"){
    setDeleteServiceID(service._id)
    payload = {
        mode,
        serviceId: service._id,
    }
   }
    try {
      const res = await axios.put(
        `https://hazir-hay-backend.vercel.app/shops/updateService/${shop._id}`,
         payload ,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          params: { t: Date.now() },
        }
      );
      if(res.data.success){
        getShopData();
        toast.success(res.data.message);
        resetValues();
        setDeleteServiceID(null)
        setIsVariablePricing(false);
        setIsEditServiceModal(false)
        setServiceAddLoading(false);
      }
    } catch (error) {
      console.log(error);
      toast.error(error)
      setDeleteServiceID(null)
      setServiceAddLoading(false);
    }
  };
    const resetValues = () => {
    setDescription("");
    setPrice(null);
    setSelectedCategory(null);
    setSelectedSubCategory(null);
    setRecommendedPrice([]);
  };
  const handleAddNewService = async () => {
    setServiceAddLoading(true)
    const payload = {
      mode: "add",
      category: selectedCategory,
      subCategory: {
        name: selectedSubCategory,
        price: price,
        description: description,
        isVariablePricing: isVariablePricing,
      },
    };

    try {
      const res = await axios.put(
        `https://hazir-hay-backend.vercel.app/shops/updateService/${shop._id}`,
        payload ,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          params: { t: Date.now() },
        }
      );

      if(res.data.success){
        await getShopData();
        setServiceAddLoading(false);
        toast.success(res.data.message || "New service added successfully")
        resetValues();
        setIsAddServiceModal(false)
      }

    } catch (error) {
        console.log(error);
        toast.error(error)
        setServiceAddLoading(false)
        
    }
  };
  const handleCategoryChange = (e) => {
    setSelectedCategory(e.target.value);
    setSelectedSubCategory("");
  };

  const openEditServiceModal = async(service)=>{
    setSelectedService(service);
     getRecomendedPrice(service.category,service.subCategory.name);
    setIsEditServiceModal(true)
  }
  const toggleVariable = (mode)=>{
    if(mode === "add"){
      setIsVariablePricing((prev)=>!prev)
      return;
    }
 else if(mode === "edit"){
      setSelectedService((prev)=>({
        ...prev,
        subCategory:{
          ...prev.subCategory,
          isVariablePricing: !prev.subCategory.isVariablePricing
        }
      }))
    }
  }

  return (
    <div className="container py-4" style={{ maxWidth: "1200px" }}>
      {/* Top Bar */}
      <div className="d-flex align-items-center justify-content-between mb-4">
        <button
          className="btn btn-outline-secondary"
          onClick={() => window.history.back()}
          style={{ borderRadius: "10px", minWidth: "100px" }}
        >
          <i className="fa-solid fa-arrow-left me-2"></i>
          Back
        </button>

        <h4 className="mb-0 fw-bold" style={{ color: "#2c3e50" }}>
          <i className="fas fa-tools text-primary me-2"></i>
          My Services
        </h4>

        <button
          className="btn btn-primary"
          onClick={() => setIsAddServiceModal(true)}
          style={{ borderRadius: "10px", minWidth: "100px" }}
        >
          <i className="fa-solid fa-plus me-2"></i>
          Add New
        </button>
      </div>

      {/* Services Grid */}
      {shop?.servicesOffered?.length > 0 ? (
        <div className="row g-3">
          {shop.servicesOffered.map((service, index) => (
            <div key={service._id} className="col-12 col-md-6 col-lg-4">
              <div
                className="card border-0 shadow-sm h-100"
                style={{
                  borderRadius: "16px",
                  transition: "all 0.3s ease",
                }}
                onMouseOver={(e) => e.currentTarget.style.transform = "translateY(-4px)"}
                onMouseOut={(e) => e.currentTarget.style.transform = "translateY(0)"}
              >
                <div className="card-body p-3">
                  {/* Category Badge */}
                  <div className="d-flex align-items-center justify-content-between mb-3">
                    <span
                      className="badge"
                      style={{
                        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                        fontSize: "0.7rem",
                        padding: "6px 12px",
                        borderRadius: "8px",
                      }}
                    >
                      {service.category}
                    </span>
                    <div className="d-flex gap-2">
                      <button
                        className="btn btn-sm btn-light"
                        onClick={() => openEditServiceModal(service)}
                        style={{
                          width: "32px",
                          height: "32px",
                          padding: 0,
                          borderRadius: "8px",
                        }}
                        title="Edit Service"
                      >
                        <i className="fa-solid fa-pen text-primary" style={{ fontSize: "0.8rem" }}></i>
                      </button>
                      {deleteServiceId === service._id ? (
                        <div
                          className="d-flex align-items-center justify-content-center"
                          style={{ width: "32px", height: "32px" }}
                        >
                          <span className="spinner-border spinner-border-sm text-danger"></span>
                        </div>
                      ) : (
                        <button
                          className="btn btn-sm btn-light"
                          onClick={() => handleEditAndDeleteService("delete", service)}
                          style={{
                            width: "32px",
                            height: "32px",
                            padding: 0,
                            borderRadius: "8px",
                          }}
                          title="Delete Service"
                        >
                          <i className="fa-solid fa-trash text-danger" style={{ fontSize: "0.8rem" }}></i>
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Service Name */}
                  <h6 className="fw-bold mb-2" style={{ color: "#2c3e50", fontSize: "0.95rem" }}>
                    {service.subCategory.name}
                  </h6>

                  {/* Price */}
                  <div className="d-flex align-items-center justify-content-between mb-2">
                    <div>
                      <div className="text-muted" style={{ fontSize: "0.75rem" }}>Price</div>
                      <div className="fw-bold" style={{ fontSize: "1.25rem", color: "#11998e" }}>
                        Rs. {service.subCategory.price}
                      </div>
                    </div>
                    <div
                      className="rounded-circle d-flex align-items-center justify-content-center"
                      style={{
                        width: "40px",
                        height: "40px",
                        background: service.subCategory.isVariablePricing
                          ? "rgba(255, 193, 7, 0.1)"
                          : "rgba(40, 167, 69, 0.1)",
                      }}
                    >
                      <i
                        className={`fas fa-${
                          service.subCategory.isVariablePricing ? "chart-line" : "check-circle"
                        }`}
                        style={{
                          color: service.subCategory.isVariablePricing ? "#ffc107" : "#28a745",
                          fontSize: "1rem",
                        }}
                      ></i>
                    </div>
                  </div>

                  {/* Pricing Type */}
                  <div
                    className="text-center py-1 rounded"
                    style={{
                      backgroundColor: service.subCategory.isVariablePricing
                        ? "rgba(255, 193, 7, 0.1)"
                        : "rgba(40, 167, 69, 0.1)",
                      fontSize: "0.75rem",
                      color: service.subCategory.isVariablePricing ? "#856404" : "#155724",
                    }}
                  >
                    {service.subCategory.isVariablePricing ? "Variable Pricing" : "Fixed Price"}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="card border-0 shadow-sm" style={{ borderRadius: "16px" }}>
          <div className="card-body text-center py-5">
            <div
              className="rounded-circle bg-secondary bg-opacity-10 d-inline-flex align-items-center justify-content-center mb-3"
              style={{ width: "80px", height: "80px" }}
            >
              <i className="fas fa-tools fa-2x text-secondary opacity-50"></i>
            </div>
            <h6 className="fw-bold text-secondary">No Services Added Yet</h6>
            <p className="text-muted small mb-3">
              Start adding services to showcase what you offer to customers
            </p>
            <button
              className="btn btn-primary"
              onClick={() => setIsAddServiceModal(true)}
              style={{ borderRadius: "10px" }}
            >
              <i className="fa-solid fa-plus me-2"></i>
              Add Your First Service
            </button>
          </div>
        </div>
      )}

      {isAddServiceModalOpen && (
        <div
          className="modal fade show d-block"
          tabIndex="-1"
          style={{
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            backdropFilter: "blur(4px)",
          }}
        >
          <div className="modal-dialog modal-dialog-centered" style={{ maxWidth: "500px" }}>
            <div className="modal-content border-0" style={{ borderRadius: "16px" }}>
              {/* Header */}
              <div
                className="modal-header border-0 pb-0"
                style={{ padding: "1.5rem 1.5rem 0.5rem" }}
              >
                <h5 className="modal-title fw-bold" style={{ color: "#2c3e50" }}>
                  <i className="fa-solid fa-plus-circle text-primary me-2"></i>
                  Add New Service
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => {
                    setIsAddServiceModal(false);
                    resetValues();
                  }}
                ></button>
              </div>

              {/* Body */}
              <div className="modal-body" style={{ padding: "1.5rem" }}>
                {/* Category Selection */}
                <div className="mb-3">
                  <label className="form-label fw-semibold small text-muted mb-2">
                    <i className="fas fa-layer-group me-2"></i>
                    Select Category
                  </label>
                  <select
                    className="form-select"
                    value={selectedCategory}
                    onChange={handleCategoryChange}
                    style={{ borderRadius: "10px" }}
                  >
                    <option value="">Choose a category...</option>
                    {services.map((cat, index) => (
                      <option key={index} value={cat.category}>
                        {cat.category}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Sub-Category Selection */}
                <div className="mb-3">
                  <label className="form-label fw-semibold small text-muted mb-2">
                    <i className="fas fa-list me-2"></i>
                    Select Sub-Category
                  </label>
                  <select
                    className="form-select"
                    value={selectedSubCategory}
                    onChange={(e) => {
                      setSelectedSubCategory(e.target.value);
                    }}
                    disabled={!selectedCategory}
                    style={{ borderRadius: "10px" }}
                  >
                    <option value="">Choose a sub-category...</option>
                    {services
                      .find((cat) => cat.category === selectedCategory)
                      ?.subcategories.map((sub, index) => (
                        <option key={index} value={sub}>
                          {sub}
                        </option>
                      ))}
                  </select>
                </div>

                {selectedCategory !== null && selectedSubCategory && !isAlreadyFound && (
                  <>
                    {/* Info Alert */}
                    <div
                      className="alert d-flex align-items-center mb-3"
                      style={{
                        backgroundColor: "rgba(102, 126, 234, 0.1)",
                        border: "1px solid rgba(102, 126, 234, 0.2)",
                        borderRadius: "10px",
                        padding: "12px",
                      }}
                    >
                      <i className="fas fa-info-circle text-primary me-2"></i>
                      <small style={{ color: "#667eea" }}>
                        Set price for <strong>{selectedSubCategory}</strong> to build trust with customers
                      </small>
                    </div>

                    {/* Price Input */}
                    <div className="mb-3">
                      <label className="form-label fw-semibold small text-muted mb-2">
                        <i className="fas fa-tag me-2"></i>
                        Price (PKR)
                      </label>
                      <input
                        type="number"
                        className="form-control"
                        placeholder="Enter price (e.g., 500)"
                        value={price}
                        onChange={(e) => setPrice(e.target.value)}
                        style={{ borderRadius: "10px" }}
                      />
                    </div>

                    {/* Recommended Prices */}
                    <div className="mb-3">
                      <label className="form-label fw-semibold small d-flex align-items-center mb-2">
                        <i className="fas fa-lightbulb text-warning me-2"></i>
                        Recommended Prices
                      </label>
                      {recommendedPrice?.length > 0 ? (
                        <div className="d-flex flex-wrap gap-2">
                          {recommendedPrice?.map((recPrice, index) => (
                            <button
                              key={index}
                              className="btn btn-sm btn-outline-primary"
                              onClick={() => setPrice(recPrice)}
                              style={{ borderRadius: "8px" }}
                            >
                              Rs. {recPrice}
                            </button>
                          ))}
                        </div>
                      ) : (
                        <div
                          className="text-center py-2"
                          style={{
                            backgroundColor: "#f8f9fa",
                            borderRadius: "8px",
                            fontSize: "0.85rem",
                          }}
                        >
                          {isFindingRecomendedPrice ? (
                            <>
                              <span className="spinner-border spinner-border-sm me-2"></span>
                              Finding prices...
                            </>
                          ) : (
                            <span className="text-muted">
                              <i className="fas fa-exclamation-circle me-1"></i>
                              No recommended prices available
                            </span>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Variable Pricing */}
                    <div className="mb-3">
                      <div
                        className="form-check p-3"
                        style={{
                          backgroundColor: "#f8f9fa",
                          borderRadius: "10px",
                        }}
                      >
                        <input
                          type="checkbox"
                          className="form-check-input"
                          id="variablePricing"
                          checked={isVariablePricing}
                          onChange={() => toggleVariable("add")}
                          style={{ cursor: "pointer" }}
                        />
                        <label
                          className="form-check-label"
                          htmlFor="variablePricing"
                          style={{ cursor: "pointer", fontSize: "0.9rem" }}
                        >
                          <i className="fas fa-chart-line text-warning me-2"></i>
                          Variable Pricing (Price depends on work scope)
                        </label>
                      </div>
                    </div>

                    {/* Description */}
                    <div className="mb-3">
                      <label className="form-label fw-semibold small text-muted mb-2">
                        <i className="fas fa-align-left me-2"></i>
                        Description (Optional)
                      </label>
                      <textarea
                        className="form-control"
                        rows="2"
                        placeholder="E.g., Price is for standard service"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        style={{ borderRadius: "10px" }}
                      ></textarea>
                    </div>
                  </>
                )}
              </div>

              {/* Footer */}
              <div className="modal-footer border-0" style={{ padding: "0 1.5rem 1.5rem" }}>
                <button
                  className="btn btn-light"
                  onClick={() => {
                    setIsAddServiceModal(false);
                    resetValues();
                  }}
                  style={{ borderRadius: "10px", minWidth: "100px" }}
                >
                  Cancel
                </button>
                <button
                  className="btn btn-primary"
                  disabled={!(selectedCategory && selectedSubCategory && price) || serviceAddLoading}
                  onClick={handleAddNewService}
                  style={{ borderRadius: "10px", minWidth: "120px" }}
                >
                  {serviceAddLoading ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2"></span>
                      Saving...
                    </>
                  ) : (
                    <>
                      <i className="fas fa-save me-2"></i>
                      Save Service
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {
        isEditServiceModalOpen && (
          <div
            className="modal fade show d-block"
            tabIndex="-1"
            style={{
              backgroundColor: "rgba(0, 0, 0, 0.5)",
              backdropFilter: "blur(4px)",
            }}
          >
            <div className="modal-dialog modal-dialog-centered" style={{ maxWidth: "500px" }}>
              <div className="modal-content border-0" style={{ borderRadius: "16px" }}>
                {/* Header */}
                <div
                  className="modal-header border-0 pb-0"
                  style={{ padding: "1.5rem 1.5rem 0.5rem" }}
                >
                  <h5 className="modal-title fw-bold" style={{ color: "#2c3e50" }}>
                    <i className="fa-solid fa-pen-to-square text-primary me-2"></i>
                    Edit Service
                  </h5>
                  <button
                    type="button"
                    className="btn-close"
                    onClick={() => {
                      setIsEditServiceModal(false);
                      resetValues();
                    }}
                  ></button>
                </div>

                {/* Body */}
                <div className="modal-body" style={{ padding: "1.5rem" }}>
                  {selectedService !== null && (
                    <>
                      {/* Service Info */}
                      <div
                        className="alert d-flex align-items-center mb-3"
                        style={{
                          backgroundColor: "rgba(102, 126, 234, 0.1)",
                          border: "1px solid rgba(102, 126, 234, 0.2)",
                          borderRadius: "10px",
                          padding: "12px",
                        }}
                      >
                        <i className="fas fa-info-circle text-primary me-2"></i>
                        <small style={{ color: "#667eea" }}>
                          Editing <strong>{selectedService?.subCategory.name}</strong> in{" "}
                          <strong>{selectedService?.category}</strong>
                        </small>
                      </div>

                      {/* Price Input */}
                      <div className="mb-3">
                        <label className="form-label fw-semibold small text-muted mb-2">
                          <i className="fas fa-tag me-2"></i>
                          Price (PKR)
                        </label>
                        <input
                          type="number"
                          className="form-control"
                          placeholder="Enter price"
                          value={price || selectedService?.subCategory.price}
                          onChange={(e) => setPrice(e.target.value)}
                          style={{ borderRadius: "10px" }}
                        />
                      </div>

                      {/* Recommended Prices */}
                      <div className="mb-3">
                        <label className="form-label fw-semibold small d-flex align-items-center mb-2">
                          <i className="fas fa-lightbulb text-warning me-2"></i>
                          Recommended Prices
                        </label>
                        {recommendedPrice?.length > 0 ? (
                          <div className="d-flex flex-wrap gap-2">
                            {recommendedPrice?.map((recPrice, index) => (
                              <button
                                key={index}
                                className="btn btn-sm btn-outline-primary"
                                onClick={() => setPrice(recPrice)}
                                style={{ borderRadius: "8px" }}
                              >
                                Rs. {recPrice}
                              </button>
                            ))}
                          </div>
                        ) : (
                          <div
                            className="text-center py-2"
                            style={{
                              backgroundColor: "#f8f9fa",
                              borderRadius: "8px",
                              fontSize: "0.85rem",
                            }}
                          >
                            {isFindingRecomendedPrice ? (
                              <>
                                <span className="spinner-border spinner-border-sm me-2"></span>
                                Finding prices...
                              </>
                            ) : (
                              <span className="text-muted">
                                <i className="fas fa-exclamation-circle me-1"></i>
                                No recommended prices available
                              </span>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Variable Pricing */}
                      <div className="mb-3">
                        <div
                          className="form-check p-3"
                          style={{
                            backgroundColor: "#f8f9fa",
                            borderRadius: "10px",
                          }}
                        >
                          <input
                            type="checkbox"
                            className="form-check-input"
                            id="editVariablePricing"
                            checked={selectedService?.subCategory.isVariablePricing === true}
                            onChange={() => toggleVariable("edit")}
                            style={{ cursor: "pointer" }}
                          />
                          <label
                            className="form-check-label"
                            htmlFor="editVariablePricing"
                            style={{ cursor: "pointer", fontSize: "0.9rem" }}
                          >
                            <i className="fas fa-chart-line text-warning me-2"></i>
                            Variable Pricing (Price depends on work scope)
                          </label>
                        </div>
                      </div>
                    </>
                  )}
                </div>

                {/* Footer */}
                <div className="modal-footer border-0" style={{ padding: "0 1.5rem 1.5rem" }}>
                  <button
                    className="btn btn-light"
                    onClick={() => {
                      setIsEditServiceModal(false);
                      resetValues();
                    }}
                    style={{ borderRadius: "10px", minWidth: "100px" }}
                  >
                    Cancel
                  </button>
                  <button
                    className="btn btn-primary"
                    onClick={() => handleEditAndDeleteService("edit", selectedService)}
                    disabled={serviceAddLoading}
                    style={{ borderRadius: "10px", minWidth: "120px" }}
                  >
                    {serviceAddLoading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2"></span>
                        Updating...
                      </>
                    ) : (
                      <>
                        <i className="fas fa-save me-2"></i>
                        Update Service
                      </>
                    )}
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

export default MyShopServices;
