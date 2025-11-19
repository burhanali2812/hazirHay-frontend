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

  return (
    <div>
<div className="container py-4">

  {/* Top Bar */}
  <div className="d-flex align-items-center mb-4 position-relative">
    {/* Back Button */}
    <button
      className="btn btn-outline-secondary d-flex align-items-center"
      onClick={() => window.history.back()}
      style={{ position: "absolute", left: 0 }}
    >
      <i className="fa-solid fa-arrow-left me-2"></i> Back
    </button>

    {/* Title Center */}
    <h3 className="m-0 w-100 text-center fw-bold">My Services</h3>
  </div>

  {/* Add New Service Button */}
  <div className="text-end mb-3">
    <button
      className="btn btn-primary btn-sm px-4 fw-semibold"
      onClick={() => setIsAddServiceModal(true)}
    >
      <i className="fa-solid fa-plus me-2"></i>
      Add New Service
    </button>
  </div>

  {/* Table */}
  <div className="table-responsive shadow-sm">
    <table className="table table-hover text-nowrap">
      <thead className="table-light">
        <tr>
          <th>#</th>
          <th>Category</th>
          <th>Sub-Category</th>
          <th>Price</th>
          <th className="text-center">Action</th>
        </tr>
      </thead>

      <tbody>
        {shop?.servicesOffered?.length > 0 ? (
          shop.servicesOffered.map((service, index) => (
            <tr key={service._id} className="text-nowrap">
              <td className="fw-semibold">{index + 1}</td>
              <td>{service.category}</td>
              <td>{service.subCategory.name}</td>
              <td className="fw-semibold">Rs.{service.subCategory.price}/-</td>

              <td className="text-center">
                <i
                  className="fa-solid fa-pen-to-square text-primary me-2 cursor-pointer"
                  style={{ cursor: "pointer" }}
                  onClick={() => openEditServiceModal(service)}
                ></i>

                {deleteServiceId === service._id ? (
                  <span
                    className="spinner-border spinner-border-sm text-danger"
                    role="status"
                  ></span>
                ) : (
                  <i
                    className="fa-solid fa-trash text-danger cursor-pointer"
                    style={{ cursor: "pointer" }}
                    onClick={() =>
                      handleEditAndDeleteService("delete", service)
                    }
                  ></i>
                )}
              </td>
            </tr>
          ))
        ) : (
          <tr>
            <td colSpan="5" className="text-center text-muted py-3">
              No services provided
            </td>
          </tr>
        )}
      </tbody>
    </table>
  </div>
</div>


      {isAddServiceModalOpen && (
        <div
          className="modal fade show d-block"
          tabIndex="-1"
          style={{
            backgroundColor: "rgba(0, 0, 0, 0.6)",
            backdropFilter: "blur(3px)",
          }}
        >
          <div className="modal-dialog modal-sm modal-dialog-centered">
            <div className="modal-content shadow-sm border-0 rounded-4">
              {/* Header */}
              <div
                className="modal-header text-white py-2 px-3"
                style={{ backgroundColor: "#0d6efd" }}
              >
                <h6 className="modal-title m-0">
                  <i className="fa-solid fa-plus me-2"></i>Add New Service
                </h6>
                <button
                  type="button"
                  className="btn-close btn-close-white"
                  onClick={() => {
                    setIsAddServiceModal(false);
                    resetValues();
                  }}
                ></button>
              </div>

              {/* Body */}
              <div className="modal-body text-center p-4">
                <div>
                  <select
                    style={{ background: "#FFE4E1" }}
                    className="form-select mb-2"
                    value={selectedCategory}
                    onChange={handleCategoryChange}
                  >
                    <option value="">Select Category</option>
                    {services.map((cat, index) => (
                      <option key={index} value={cat.category}>
                        {cat.category}
                      </option>
                    ))}
                  </select>
                  <select
                    style={{ background: "#FFE4E1" }}
                    className="form-select mb-3 "
                    value={selectedSubCategory}
                    onChange={(e) => {
                      setSelectedSubCategory(e.target.value);
                    }}
                    disabled={!selectedCategory}
                  >
                    <option value="">Select Sub-category</option>
                    {services
                      .find((cat) => cat.category === selectedCategory)
                      ?.subcategories.map((sub, index) => (
                        <option key={index} value={sub}>
                          {sub}
                        </option>
                      ))}
                  </select>
                </div>
                <div>
                  {selectedCategory !== null && selectedSubCategory && !isAlreadyFound &&  (
                    <>
                      <p className="text-center mb-3">
                        Set price of{" "}
                        <strong>
                          {selectedSubCategory} ({selectedCategory})
                        </strong>{" "}
                        for <strong>transparency</strong> and{" "}
                        <strong>trust</strong>.
                      </p>

                      {/* Price Input */}
                      <label className="form-label fw-semibold small mb-1">
                        Enter Price
                      </label>
                      <input
                        type="number"
                        className="form-control form-control-sm "
                        placeholder="E.g. 200"
                        value={price}
                        onChange={(e) => setPrice(e.target.value)}
                      />

                      <p className="fw-bold mt-2">
                        Recommended Price{" "}
                        <i className="fa-solid fa-lightbulb text-warning"></i>
                      </p>

                      {recommendedPrice?.length > 0 ? (
                        <div className="d-flex flex-wrap gap-2 mb-2">
                          {recommendedPrice?.map((price, index) => (
                            <button
                              key={index}
                              className=" btn btn-outline-primary"
                              onClick={() => setPrice(price)}
                            >
                              {price} PKR
                            </button>
                          ))}
                        </div>
                      ) : (
                        <>
                          <p className="mb-3 mt-0 text-primary fw-bold text-center">
                            {isFindingRecomendedPrice ? (
                              <>Finding Recommended Price...</>
                            ) : (
                              <>
                                No Recommended Price Found
                                <i class="fa-solid fa-face-frown ms-1"></i>
                              </>
                            )}
                          </p>
                        </>
                      )}

                      {/* Description Input */}
                      <label className="form-label fw-semibold small mb-1">
                        Description
                      </label>
                      <textarea
                        className="form-control form-control-sm"
                        rows="2"
                        placeholder="E.g. This price is for 1kg gas"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                      ></textarea>
                    </>
                  )}
                </div>
                <div>
                  {/* Button */}
                  <button
                    className="btn btn-primary mt-2 w-100 rounded-pill fw-semibold"
                    hidden={!(selectedCategory && selectedSubCategory && price)}
                    onClick={handleAddNewService}
                  >
                    {serviceAddLoading ? (
                      <>
                        <span
                          className="spinner-border spinner-border-sm me-2"
                          role="status"
                          aria-hidden="true"
                        ></span>
                        <span>Saving...</span>
                      </>
                    ) : (
                      <>
                        <i class="fa-solid fa-screwdriver-wrench me-2"></i>
                        Save New Service
                      </>
                    )}
                  </button>
                </div>
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
            backgroundColor: "rgba(0, 0, 0, 0.6)",
            backdropFilter: "blur(3px)",
          }}
        >
          <div className="modal-dialog modal-sm modal-dialog-centered">
            <div className="modal-content shadow-sm border-0 rounded-4">
              {/* Header */}
              <div
                className="modal-header text-white py-2 px-3"
                style={{ backgroundColor: "#0d6efd" }}
              >
                <h6 className="modal-title m-0">
                  <i class="fa-solid fa-pen-to-square me-2"></i>Edit Service
                </h6>
                <button
                  type="button"
                  className="btn-close btn-close-white"
                  onClick={() => {
                    setIsEditServiceModal(false);
                    resetValues();
                  }}
                ></button>
              </div>

              {/* Body */}
              <div className="modal-body text-center p-4">
                <div>
                  {selectedService !== null  && (
                    <>
                      <p className="text-center mb-3">
                        Set price of{" "}
                        <strong>
                          {selectedService?.category} ({selectedService?.subCategory.name})
                        </strong>{" "}
                        for <strong>transparency</strong> and{" "}
                        <strong>trust</strong>.
                      </p>

                      {/* Price Input */}
                      <label className="form-label fw-semibold small mb-1">
                        Enter Price
                      </label>
                      <input
                        type="number"
                        className="form-control form-control-sm "
                        placeholder="E.g. 200"
                        value={price ||selectedService?.subCategory.price}
                        onChange={(e) => setPrice(e.target.value)}
                      />

                      <p className="fw-bold mt-2">
                        Recommended Price{" "}
                        <i className="fa-solid fa-lightbulb text-warning"></i>
                      </p>

                      {recommendedPrice?.length > 0 ? (
                        <div className="d-flex flex-wrap gap-2 mb-2">
                          {recommendedPrice?.map((price, index) => (
                            <button
                              key={index}
                              className=" btn btn-outline-primary"
                              onClick={() => setPrice(price)}
                            >
                              {price} PKR
                            </button>
                          ))}
                        </div>
                      ) : (
                        <>
                          <p className="mb-3 mt-0 text-primary fw-bold text-center">
                            {isFindingRecomendedPrice ? (
                              <>Finding Recommended Price...</>
                            ) : (
                              <>
                                No Recommended Price Found
                                <i class="fa-solid fa-face-frown ms-1"></i>
                              </>
                            )}
                          </p>
                        </>
                      )}

                    </>
                  )}
                </div>
                <div>
                  {/* Button */}
                  <button
                    className="btn btn-primary mt-2 w-100 rounded-pill fw-semibold"
                    onClick={()=>handleEditAndDeleteService("edit",selectedService)}
                  >
                    {serviceAddLoading ? (
                      <>
                        <span
                          className="spinner-border spinner-border-sm me-2"
                          role="status"
                          aria-hidden="true"
                        ></span>
                        <span>Updating...</span>
                      </>
                    ) : (
                      <>
                        <i class="fa-solid fa-cloud-arrow-up me-2"></i>
                        Update Service
                      </>
                    )}
                  </button>
                </div>
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
