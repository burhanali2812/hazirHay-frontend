import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import shop from "../images/shop.png";
import { toast, ToastContainer } from "react-toastify";
import imageCompression from "browser-image-compression";
import "react-toastify/dist/ReactToastify.css";
import "animate.css";
import axios from "axios";
import Swal from "sweetalert2";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";
import successAudio from "../sounds/success.mp3";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";
function ShopForm() {
  const services = [
    {
      category: "Electrician",
      subcategories: [
        "General Electrical Repairs",
        "AC Repair and Installation",
        "Electrical Panel Upgrades",
        "Smart Home Wiring",
        "Emergency Electrical Services",
        "Solar Panel Installation",
        "Generator Installation",
        "Home Theater Wiring",
        "Electrical Safety Inspection",
        "Circuit Breaker Installation",
        "Lighting Installation",
        "Outlet and Switch Installation",
        "Ceiling Fan Installation",
        "Wiring and Rewiring",
        "Electrical Appliance Repair",
      ],
    },
    {
      category: "Plumber",
      subcategories: [
        "Leak Detection and Repair",
        "Pipe Replacement",
        "Bathroom Plumbing Fixtures",
        "Water Tank Installation",
        "Septic Tank Cleaning",
        "Gas Pipe Installation",
        "Sump Pump Installation",
        "Hydro Jetting",
        "Bathroom Waterproofing",
        "Drain Cleaning",
        "Toilet Repair",
        "Faucet Repair",
        "Sewer Line Services",
        "Water Heater Repair",
        "Pipe Insulation",
      ],
    },
    {
      category: "Carpenter",
      subcategories: [
        "Custom Furniture Design",
        "Kitchen Cabinet Installation",
        "Wooden Flooring Installation",
        "Deck Construction",
        "Door Frame Repair",
        "Staircase Installation",
        "Wood Paneling",
        "Shelving Installation",
        "Furniture Restoration",
        "Wardrobe Installation",
        "Furniture Assembly",
        "Window Frame Repair",
        "Furniture Repair",
        "Wooden Fence Installation",
        "Office Furniture Installation",
      ],
    },
    {
      category: "Painter",
      subcategories: [
        "Interior Painting",
        "Exterior Painting",
        "Wall Texturing",
        "Wallpaper Installation",
        "Spray Painting",
        "Fence Painting",
        "Decorative Painting",
        "Epoxy Floor Coating",
        "Commercial Painting",
        "Faux Finishing",
        "Paint Removal",
        "Graffiti Removal",
        "Rust Proofing",
        "Eco-Friendly Painting",
        "Industrial Coatings",
      ],
    },
    {
      category: "Cleaning Services",
      subcategories: [
        "Home Deep Cleaning",
        "Carpet Cleaning",
        "Sofa Cleaning",
        "Office Cleaning",
        "Window Cleaning",
        "Pest Control",
        "Post-Construction Cleaning",
        "Move-in/Move-out Cleaning",
        "Pressure Washing",
        "Air Duct Cleaning",
        "Mattress Cleaning",
        "Pool Cleaning",
        "Curtain Cleaning",
        "Hoarding Cleanup",
        "Solar Panel Cleaning",
      ],
    },
    {
      category: "AC Technician",
      subcategories: [
        "AC Installation",
        "AC Repair",
        "AC Gas Refilling",
        "AC Maintenance",
        "Split AC Servicing",
        "Window AC Repair",
        "Thermostat Repair",
        "Ductless Mini-Split Installation",
        "Commercial AC Servicing",
        "Refrigerant Charging",
        "AC Filter Replacement",
        "AC Compressor Repair",
        "Emergency AC Repair",
        "AC Duct Cleaning",
        "AC Insulation Services",
      ],
    },
    {
      category: "Home Appliance Repair",
      subcategories: [
        "Refrigerator Repair",
        "Washing Machine Repair",
        "Microwave Repair",
        "Oven Repair",
        "Dishwasher Repair",
        "Dryer Repair",
        "Vacuum Cleaner Repair",
        "Coffee Machine Repair",
        "Blender Repair",
        "Toaster Repair",
        "Ice Maker Repair",
        "Home Theater Repair",
        "Fan Repair",
        "Water Purifier Repair",
        "Stove Repair",
      ],
    },
    {
      category: "Gardening & Landscaping",
      subcategories: [
        "Lawn Mowing",
        "Hedge Trimming",
        "Garden Design",
        "Tree Trimming",
        "Irrigation System Installation",
        "Planting Services",
        "Garden Pest Control",
        "Soil Fertilizing",
        "Garden Lighting",
        "Water Feature Installation",
        "Garden Pathway Construction",
        "Seasonal Planting",
        "Garden Waste Removal",
        "Garden Cleanup",
        "Landscape Consultation",
      ],
    },
    {
      category: "Roofing & Waterproofing",
      subcategories: [
        "Roof Repair",
        "Roof Replacement",
        "Waterproofing Services",
        "Gutter Cleaning",
        "Chimney Repair",
        "Skylight Installation",
        "Flashing Repair",
        "Balcony Waterproofing",
        "Flat Roof Repair",
        "Shingle Replacement",
        "Roof Inspection",
        "Roof Cleaning",
        "Insulation Installation",
        "Leak Repair",
        "Roof Coating",
      ],
    },
    {
      category: "Security Services",
      subcategories: [
        "CCTV Installation",
        "Alarm System Installation",
        "Security Guard Services",
        "Access Control Systems",
        "Biometric Systems",
        "Fire Alarm Installation",
        "Security Patrol Services",
        "Intercom Systems",
        "Motion Detector Installation",
        "Video Door Phone Installation",
        "Security System Maintenance",
        "Security Consultancy",
        "Security System Repair",
        "Access Card Setup",
        "Security Lighting Installation",
      ],
    },
    {
      category: "Laundry & Dry Cleaning",
      subcategories: [
        "Clothes Washing",
        "Dry Cleaning",
        "Ironing and Pressing",
        "Shoe Cleaning",
        "Curtain Cleaning",
        "Carpet Cleaning",
        "Leather Cleaning",
        "Blanket Cleaning",
        "Uniform Cleaning",
        "Stain Removal",
        "Delicate Fabric Care",
        "Alterations & Repairs",
        "Pick-up and Delivery",
        "Wedding Dress Cleaning",
        "Upholstery Cleaning",
      ],
    },
    {
      category: "Moving & Packing",
      subcategories: [
        "Local Moving",
        "Long-distance Moving",
        "Packing Services",
        "Unpacking Services",
        "Furniture Disassembly",
        "Furniture Assembly",
        "Storage Services",
        "Vehicle Transport",
        "Office Moving",
        "Fragile Item Handling",
        "Heavy Lifting",
        "Loading and Unloading",
        "International Moving",
        "Moving Supplies",
        "Disposal Services",
      ],
    },
    {
      category: "Pest Control",
      subcategories: [
        "Termite Treatment",
        "Bed Bug Extermination",
        "Mosquito Control",
        "Rodent Control",
        "Cockroach Treatment",
        "Ant Control",
        "Flea Control",
        "Spider Control",
        "Bee Removal",
        "Bird Control",
        "Pest Inspection",
        "Commercial Pest Control",
        "Organic Pest Control",
        "Pest Prevention",
        "Wasp Nest Removal",
      ],
    },
    {
      category: "Home Remodeling & Renovation",
      subcategories: [
        "Kitchen Remodeling",
        "Bathroom Renovation",
        "Flooring Installation",
        "Wall Partition",
        "False Ceiling",
        "Plumbing Renovation",
        "Electrical Renovation",
        "Painting and Decorating",
        "Tile Installation",
        "Cabinet Installation",
        "Door Replacement",
        "Window Replacement",
        "Basement Renovation",
        "Room Additions",
        "Outdoor Patio Construction",
      ],
    },
    {
      category: "HVAC Services",
      subcategories: [
        "Heating System Installation",
        "Heating System Repair",
        "Ventilation Cleaning",
        "Duct Installation",
        "Duct Repair",
        "HVAC Maintenance",
        "Thermostat Installation",
        "Furnace Repair",
        "Heat Pump Services",
        "Boiler Repair",
        "Indoor Air Quality Testing",
        "Energy Efficient Upgrades",
        "Commercial HVAC Services",
        "HVAC System Replacement",
        "Air Purifier Installation",
      ],
    },
    {
      category: "Interior Designing",
      subcategories: [
        "Space Planning",
        "Furniture Selection",
        "Lighting Design",
        "Color Consultation",
        "Window Treatments",
        "Flooring Selection",
        "Wall Decor",
        "Kitchen Design",
        "Bathroom Design",
        "Home Office Design",
        "Custom Furniture Design",
        "Storage Solutions",
        "Children's Room Design",
        "Home Staging",
        "Outdoor Living Space Design",
      ],
    },
    {
      category: "Appliance Installation",
      subcategories: [
        "Water Heater Installation",
        "Dishwasher Installation",
        "Oven Installation",
        "Ceiling Fan Installation",
        "Exhaust Fan Installation",
        "Washing Machine Installation",
        "Refrigerator Installation",
        "Microwave Installation",
        "Garbage Disposal Installation",
        "Dryer Installation",
        "Air Conditioner Installation",
        "Home Theater Setup",
        "Security Device Installation",
        "Smart Home Device Setup",
        "Solar Water Heater Installation",
      ],
    },
    {
      category: "Fitness & Health at Home",
      subcategories: [
        "Personal Training",
        "Yoga Instruction",
        "Massage Therapy",
        "Physiotherapy",
        "Nutrition Consultation",
        "Pilates Instruction",
        "Meditation Coaching",
        "Home Gym Setup",
        "Posture Correction",
        "Weight Loss Coaching",
        "Strength Training",
        "Cardio Training",
        "Injury Rehabilitation",
        "Senior Fitness",
        "Sports Coaching",
      ],
    },
    {
      category: "Technology & IT Support",
      subcategories: [
        "Computer Repair",
        "Printer Setup",
        "Network Setup",
        "Virus Removal",
        "Data Recovery",
        "Software Installation",
        "Hardware Upgrade",
        "Wi-Fi Optimization",
        "Smart Home Installation",
        "TV Mounting",
        "Home Theater Setup",
        "Security Software Setup",
        "Cloud Backup Setup",
        "Email Setup",
        "IT Consultation",
      ],
    },
    {
      category: "Pet Care",
      subcategories: [
        "Pet Grooming",
        "Veterinary Services",
        "Pet Sitting",
        "Dog Walking",
        "Pet Training",
        "Pet Boarding",
        "Pet Vaccination",
        "Pet Nutrition Consultation",
        "Pet Taxi",
        "Pet Bathing",
        "Pet Dental Care",
        "Pet Behavior Counseling",
        "Exotic Pet Care",
        "Pet Adoption Services",
        "Emergency Pet Care",
      ],
    },
    {
      category: "Event & Party Services",
      subcategories: [
        "Catering",
        "Photography",
        "Decoration",
        "DJ Services",
        "Tent Rental",
        "Chair and Table Rental",
        "Event Planning",
        "Sound System Setup",
        "Lighting Setup",
        "Video Recording",
        "Cake Design",
        "Invitation Design",
        "Security for Events",
        "Cleaning After Events",
        "Makeup and Hair Styling",
      ],
    },
    {
      category: "Automotive Services at Home",
      subcategories: [
        "Car Wash",
        "Car Detailing",
        "Minor Repairs",
        "Battery Replacement",
        "Tire Change",
        "Oil Change",
        "Car Polishing",
        "Engine Diagnostics",
        "Windshield Repair",
        "Headlight Restoration",
        "Brake Service",
        "Air Conditioning Service",
        "Car Interior Cleaning",
        "Fluid Top-Up",
        "Vehicle Inspection",
      ],
    },
    {
      category: "Tutoring & Education",
      subcategories: [
        "Language Tutoring",
        "Music Lessons",
        "Math Tutoring",
        "Science Tutoring",
        "Computer Lessons",
        "Exam Preparation",
        "Reading and Writing",
        "Art Lessons",
        "Dance Lessons",
        "Homework Help",
        "Test Taking Strategies",
        "Study Skills Coaching",
        "College Admissions Counseling",
        "Special Needs Tutoring",
        "Online Tutoring",
      ],
    },
    {
      category: "Legal & Financial Services",
      subcategories: [
        "Notary Services",
        "Tax Consultation",
        "Legal Advice",
        "Insurance Consulting",
        "Will Preparation",
        "Contract Drafting",
        "Business Registration",
        "Property Law Services",
        "Family Law Services",
        "Immigration Assistance",
        "Debt Counseling",
        "Investment Advice",
        "Loan Consulting",
        "Audit Services",
        "Mediation Services",
      ],
    },
    {
      category: "Miscellaneous",
      subcategories: [
        "Courier & Delivery",
        "Errand Running",
        "Personal Shopping",
        "Handyman Services",
        "Appliance Recycling",
        "Furniture Disposal",
        "Key Cutting",
        "Locksmith Services",
        "Custom Gifts",
        "Language Translation",
        "Meditation Coaching",
        "Personal Assistant",
        "Mobile Car Wash",
        "Recycling Pickup",
        "Volunteer Coordination",
      ],
    },
  ];

  const navigate = useNavigate();
  const [formData1, setFormData] = useState({
    shopPicture: null,
    shopName: "",
    shopAddress: "",
    license: "",
    currentLocation: "",
  });

  const [loading, setLoading] = useState(false);
  const [latitude, setLatitude] = useState(33.6844);
  const [longitude, setLongitude] = useState(73.0479);
  const [areaName, setAreaName] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedSubCategory, setSelectedSubCategory] = useState("");
  const [selectedServices, setSelectedServices] = useState([]);
  const [coordinates, setCoordinates] = useState([]);
  const [locationName, setLocationName] = useState("");
  const [position, setPosition] = useState([33.6844, 73.0479]);
  const [showModal, setShowModal] = useState(false);
  const [successAnimation, setSuccessAnimation] = useState(false);

  const id = localStorage.getItem("userId");

  useEffect(() => {
    if (successAnimation) {
      const audio = new Audio(successAudio);
      audio.play().catch((err) => {
        console.error("Autoplay blocked:", err);
      });
    }
  }, [successAnimation]);
  const customIcon = L.icon({
    iconUrl: markerIcon,
    shadowUrl: markerShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
  });
  const closeMap = () => {
    setShowModal(false);
   
  };

  const handleSaveLocation = () => {
    setFormData((pre) => ({
      ...pre,
      currentLocation: locationName,
    }));

    setShowModal(false);
    console.log(position);
    
  };
  const handleChange = async (e) => {
    const { name, files, value } = e.target;

    if (name === "shopPicture") {
      const file = files[0];
      if (file) {
        try {
          const options = {
            maxSizeMB: 0.6,
            maxWidthOrHeight: 800,
            useWebWorker: true,
          };

          const compressedFile = await imageCompression(file, options);

          setFormData({ ...formData1, shopPicture: compressedFile });
        } catch (error) {
          console.error("Compression failed:", error);
        }
      }
    } else {
      setFormData({ ...formData1, [name]: value });
    }
  };
  useEffect(() => {
    const fetchLocation = async () => {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const lat = position?.coords?.latitude ?? 33;
          const lon = position?.coords?.longitude ?? 73;
          if (lat === null) {
            alert("lat null");
          }

          setLatitude(lat);
          setLongitude(lon);
          setCoordinates(lat, lon);
          setPosition([lat, lon]);

          try {
            const response = await axios.get(
              "https://hazir-hay-backend.vercel.app/admin/reverse-geocode",
              { params: { lat: lat, lon: lon } }
            );

            const name =
              response.data?.display_name ||
              response.data.address?.city ||
              response.data.address?.town ||
              response.data.address?.village ||
              response.data.address?.suburb ||
              "Unknown Area";

            setAreaName(name);
            setFormData((prev) => ({
              ...prev,
              currentLocation: `${lat}, ${lon}, ${name}`,
            }));
          } catch (error) {
            console.error("Error fetching area name:", error);
          }
        },
        (error) => {
          console.error("Error getting location:", error);
        }
      );
    };

    fetchLocation();
  }, []);

  const handleSelectSubCat = (subCat) => {
    setSelectedServices((pre) => [
      ...pre,
      { category: selectedCategory, subCategory: subCat },
    ]);
    console.log(subCat);
    console.log(selectedCategory);
  };

  const handleDeleteService = async (service) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      html: `Are you sure to delete category :- <strong>${service.category}</strong> and subCategory :- <strong>${service.subCategory}</strong>`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
    });

    if (!result.isConfirmed) return;
    setSelectedServices((prev) =>
      prev.filter((item) => item.subCategory !== service.subCategory)
    );
  };

  const handleSubmit = async (e) => {
    setLoading(true);
    e.preventDefault();

    if (!formData1.shopPicture) {
      toast.error("Please upload a Shop picture");
      setLoading(false);
      return;
    }
    if (!formData1.shopName.trim()) {
      toast.error("Shop Name cannot be empty");
      setLoading(false);
      return;
    }
    if (!formData1.shopAddress.trim()) {
      toast.error("Shop address cannot be empty");
      setLoading(false);
      return;
    }
    if (!formData1.license.trim()) {
      toast.error("License cannot be empty");
      setLoading(false);
      return;
    }
    if (selectedServices.length === 0) {
      toast.error("Please Provide Service");
      setLoading(false);
      return;
    }

    try {
      const finalAreaName =
        locationName.trim() === "" ? areaName : locationName;
      const formData = new FormData();
      formData.append("shopName", formData1.shopName);
      formData.append("shopAddress", formData1.shopAddress);
      formData.append("license", formData1.license);
      formData.append("shopPicture", formData1.shopPicture);
      formData.append("coordinates", JSON.stringify(position));
      formData.append("area", finalAreaName);
      formData.append("services", JSON.stringify(selectedServices));

      const response = await axios.post(
        `https://hazir-hay-backend.vercel.app/admin/shopInformation/${id}`,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );
      if (response.status === 200) {
        setSuccessAnimation(true);
        setLoading(false);
      }
    } catch (error) {
      setLoading(false);
      console.error("Error submitting shop information:", error);
      toast.error(
        error.response?.data?.message || "Failed to store shop information"
      );
    }
  };
  const handleCategoryChange = (e) => {
    setSelectedCategory(e.target.value);
    setSelectedSubCategory("");
  };
  function LocationPicker({ onLocationSelect }) {
    useMapEvents({
      click(e) {
        const { lat, lng } = e.latlng;
        setPosition([lat, lng]);
        onLocationSelect(lat, lng);

        console.log("points", lat, lng);
      },
    });
    return null;
  }
  const fetchAreaName = async (lat, lon) => {
    try {
      const response = await axios.get(
        "https://hazir-hay-backend.vercel.app/admin/reverse-geocode",
        { params: { lat: lat, lon: lon } }
      );

      const name =
        response.data?.display_name ||
        response.data.address?.city ||
        response.data.address?.town ||
        response.data.address?.village ||
        response.data.address?.suburb ||
        "Unknown Area";
      setLocationName(name);
      return name;
    } catch (error) {
      console.error("Error fetching area name:", error);
    }
  };

  const handleLocationSelect = async (lat, lon) => {
    const name = await fetchAreaName(lat, lon);
    setLocationName(name);
  };

  return (
    <div className="container  animate__animated animate__fadeInLeft animate__delay-0s">
      <ToastContainer />

      <h1 className="mx-3 fw-bold mt-3">Your Shop’s Journey Starts Here</h1>
      <h3 className="mx-3 fw-bold" style={{ color: "#ff6600" }}>
        Turn Your Shop Into a Success Story
      </h3>
      <p className="mx-3">
        Share your shop details today — attract the right customers, grow your
        reach, and boost your sales like never before.
      </p>

      <div className="text-center animate__animated animate__fadeInLeft">
        <img src={shop} style={{ width: "230px", height: "230px" }} />
      </div>

      <form className="shadow p-4 rounded bg-white">
        <div className="mb-3 text-center">
          <label htmlFor="profilePicture" className="form-label fw-bold">
            Shop Picture
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
              {formData1.shopPicture ? (
                <img
                  src={URL.createObjectURL(formData1.shopPicture)}
                  alt="Profile Preview"
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                  }}
                />
              ) : (
                <i
                  className="fa-solid fa-shop"
                  style={{ fontSize: "68px", color: "#aaa" }}
                ></i>
              )}
            </div>
          </div>
          <input
            type="file"
            className="form-control mt-3"
            name="shopPicture"
            accept="image/*"
            onChange={handleChange}
          />
        </div>

        <div className="form-floating mb-3">
          <input
            type="text"
            className="form-control"
            name="shopName"
            id="nameInput"
            placeholder="Enter your Shop name"
            value={formData1.shopName}
            onChange={handleChange}
          />
          <label htmlFor="nameInput"> Shop Name</label>
        </div>

        <div className="form-floating mb-3">
          <input
            type="number"
            className="form-control"
            name="license"
            id="licenseInput"
            placeholder="Enter your email"
            value={formData1.license}
            onChange={handleChange}
          />
          <label htmlFor="licenseInput">License Number</label>
        </div>

        <div className="form-floating mb-3">
          <textarea
            className="form-control"
            name="shopAddress"
            id="shopAddressInput"
            placeholder="Enter your address"
            value={formData1.shopAddress}
            onChange={handleChange}
            style={{ height: "100px" }}
          ></textarea>
          <label htmlFor="shopAddressInput">Shop Address</label>
        </div>
        <div className="form-floating mb-3">
          <textarea
            className="form-control"
            name="currentLocation"
            id="currentLocationInput"
            placeholder="Your Current Location"
            value={formData1.currentLocation}
            onChange={handleChange}
            style={{ height: "100px" }}
            disabled={true}
          ></textarea>
          <label htmlFor="currentLocationInput">Shop Current Location</label>
        </div>

        <div className="d-flex align-items-center my-3">
          <hr
            className="flex-grow-1"
            style={{
              borderTop: "3px solid black",
              borderRadius: "5px",
              margin: 0,
            }}
          />
          <span className="fw-bold mx-3" style={{ color: "#ff6600" }}>
            OR
          </span>
          <hr
            className="flex-grow-1"
            style={{
              borderTop: "3px solid black",
              borderRadius: "5px",
              margin: 0,
            }}
          />
        </div>
        <button
          type="button"
          className="btn btn-primary w-100 fw-bold mb-2"
          onClick={() => setShowModal(true)}
        >
          Choose From Map
          <i className="fa-solid fa-map-location-dot ms-2"></i>
        </button>

        <h2 className="fw-bold mt-4" style={{ color: "#ff6600" }}>
          Which Services Do You Offer?
        </h2>
        <p className="text-muted">
          Tip: You can select multiple options to match all the services you
          provide.
        </p>

        <div>
          <select
            className="form-select mb-3"
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
            className="form-select mb-3"
            value={selectedSubCategory}
            onChange={(e) => {
              setSelectedSubCategory(e.target.value);
              handleSelectSubCat(e.target.value);
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

        <h4 className="fw-bold text-center mb-2" style={{ color: "#ff6600" }}>
          Services Summary
        </h4>
        {selectedServices.length !== 0 && (
          <p className="note-text mt-2">
            <strong>Note:</strong> Tap on any data entry below to{" "}
            <span className="text-danger fw-bold">delete</span> it from the
            summary table.
          </p>
        )}

        <div style={{ maxHeight: "200px", overflowY: "auto" }}>
          <table className="table table-striped table-hover table-responsive">
            <thead>
              <tr>
                <th scope="col">#</th>
                <th scope="col">Category</th>
                <th scope="col">Sub Category</th>
              </tr>
            </thead>
            <tbody>
              {selectedServices.length > 0 ? (
                selectedServices.map((sub, index) => (
                  <tr
                    key={sub.id}
                    onClick={() => handleDeleteService(sub)}
                    style={{ fontSize: "0.8rem" }}
                  >
                    <td>{index + 1}</td>
                    <td>{sub.category}</td>
                    <td>{sub.subCategory}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="text-center">
                    No services found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <button
          type="submit"
          className="btn btn-primary w-100 fw-bold mt-3"
          onClick={handleSubmit}
          disabled={loading}
        >
          {loading ? (
            <>
              <span role="status">Please Wait Saving your Shop...</span>
              <span
                className="spinner-grow spinner-grow-sm ms-2"
                aria-hidden="true"
              ></span>
            </>
          ) : (
            <>
              <i className="fa-solid fa-shop me-2"></i>
              Save Shop
            </>
          )}
        </button>
      </form>

      {showModal && (
        <div
          className="modal fade show d-block"
          tabIndex="-1"
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
        >
          <div className="modal-dialog modal-lg modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Select Location</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={closeMap}
                ></button>
              </div>
              <div className="modal-body" style={{ height: "600px" }}>
                <div className="form-floating mb-3">
                  <textarea
                    className="form-control"
                    name="currentLocation"
                    id="currentLocationInput"
                    placeholder="Your Current Location"
                    value={locationName}
                    style={{ height: "100px" }}
                    disabled={true}
                  ></textarea>
                  <label htmlFor="currentLocationInput">
                    Selected Current Location
                  </label>
                </div>
                <div style={{ height: "460px", width: "100%" }}>
                  <MapContainer
                    center={[latitude, longitude]}
                    zoom={13}
                    style={{ height: "100%", width: "100%" }}
                  >
                    <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                    <LocationPicker onLocationSelect={handleLocationSelect} />
                    {position && (
                      <Marker position={position} icon={customIcon} />
                    )}
                  </MapContainer>
                </div>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={closeMap}
                >
                  Close
                </button>
                <button
                  type="button"
                  className="btn btn-success"
                  onClick={handleSaveLocation}
                >
                  Save Location
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {successAnimation && (
        <>
          <div
            className="offcanvas offcanvas-bottom show"
            tabIndex="-1"
            style={{
              height: "55vh",
              visibility: "visible",
              backgroundColor: "#fff",
              borderTopLeftRadius: "10px",
              borderTopRightRadius: "10px",
            }}
          >
            <div className="offcanvas-body position-relative text-center d-flex flex-column justify-content-center align-items-center ">
              {/* Close Button */}
              <button
                className="btn-close position-absolute"
                style={{ top: 10, right: 15 }}
                onClick={() => navigate("/login")}
              ></button>

              <DotLottieReact
                src="https://lottie.host/d78f201d-181a-450c-803f-43ab471ef7f1/ENnJonrsix.lottie"
                loop
                autoplay
                style={{ width: "225px", height: "185px" }}
              />

              {/* Message */}
              <h4 className="text-success">🎉 Account Created Successfully!</h4>
              <p className="mt-2 " style={{ maxWidth: "600px" }}>
                Thank you for registering with <strong>Hazir Hay</strong>! We’re
                thrilled to have you on board —{" "}
                <em>Anything, Anytime, Anywhere</em>, Hazir Hay!
              </p>

              <button
                onClick={() => navigate("/login")}
                className="btn btn-outline-success mt-1 d-flex align-items-center gap-2"
              >
                <i className="fas fa-sign-in-alt"></i>
                Go to Login
              </button>
            </div>
          </div>

          {/* Backdrop */}
          <div
            className="offcanvas-backdrop fade show"
            onClick={() => setSuccessAnimation(false)}
          />
        </>
      )}
    </div>
  );
}

export default ShopForm;
