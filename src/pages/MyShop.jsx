import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import PieChart from "../components/PieChart";
function MyShop({ shopKepperWorkers }) {
  const [shop, setShop] = useState(null);
  const user = JSON.parse(localStorage.getItem("user"));
  const token = localStorage.getItem("token");
  const [isViewFull, setIsViewFull] = useState(false);
  const [page, setPage] = useState(0);
  const navigate = useNavigate();

  const getShopData = async () => {
    try {
      const response = await axios.get(
        `https://hazir-hay-backend.vercel.app/shops/shopData/${user._id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
          params: { t: Date.now() },
        }
      );
      if (response.data.success) {
        setShop(response.data.shop);
      }
    } catch (err) {
      console.error("Error fetching shop data:", err);
    }
  };

  useEffect(() => {
    getShopData();
  }, []);

  const ratingCounts = shop
    ? {
        1: shop.reviews.filter((r) => r.rate === 1).length,
        2: shop.reviews.filter((r) => r.rate === 2).length,
        3: shop.reviews.filter((r) => r.rate === 3).length,
        4: shop.reviews.filter((r) => r.rate === 4).length,
        5: shop.reviews.filter((r) => r.rate === 5).length,
      }
    : { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };

  const findAverageRating = (ratings) => {
    if (!ratings || ratings.length === 0) return 0;

    const total = ratings.reduce((acc, rating) => acc + rating.rate, 0);
    return (total / ratings.length).toFixed(1);
  };
  const reviews = shop?.reviews || [];
  const reviewsPerPage = 4;
  const startIndex = page * reviewsPerPage;
  const currentReviews = reviews.slice(startIndex, startIndex + reviewsPerPage);

  const handleNextPage = () => {
    console.log(currentReviews);

    if (startIndex + reviewsPerPage < reviews.length) {
      setPage((prev) => prev + 1);
    }
  };
  const handleBackPage = () => {
    if (page > 0) {
      setPage((prev) => prev - 1);
    }
  };

  return (
    <div className="container my-4 pb-5">
      {/* Back Button */}
      <div className="mb-4">
        <button
          className="btn btn-outline-primary d-flex align-items-center"
          onClick={() => window.history.back()}
        >
          <i className="fas fa-arrow-left me-2"></i> Back
        </button>
      </div>

      {/* Hero Banner */}
      <div
        className="position-relative rounded overflow-hidden shadow-sm"
        style={{
          height: "250px",
          backgroundColor: "#f8f9fa",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontWeight: "bold",
          fontSize: "24px",
          color: "#6c757d",
        }}
      >
        {shop?.shopPicture ? (
          <img
            src={shop.shopPicture}
            alt="Shop Banner"
            className="w-100 h-100"
            style={{ objectFit: "cover" }}
          />
        ) : (
          <span>Shop Banner</span>
        )}

        {/* Edit Icon */}
        <button
          className="btn btn-light position-absolute top-0 end-0 m-3 shadow-sm"
          style={{ borderRadius: "50%" }}
          title="Change Shop Picture"
        >
          <i className="fas fa-pen"></i>
        </button>
      </div>

      {/* Floating Card */}
      <div
        className="card  shadow-lg"
        style={{
          marginTop: "-40px",
          borderRadius: "15px",
          padding: "20px",
        }}
      >
       <div className="text-center">
 <h3 className="fw-bold">{shop?.shopName || "Shop Name"}</h3>
        <p className="mb-3">
          <i className="fas fa-map-marker-alt me-2"></i>{" "}
          {isViewFull
            ? shop?.location?.area
            : shop?.location?.area?.slice(0, 50) + "..."}
          <p
            className="text-primary fw-semibold"
            onClick={() => setIsViewFull(!isViewFull)}
          >
            {!isViewFull ? "show more" : "show less"}
          </p>
        </p>

        {/* Two Info Cards */}
        <div className="row g-3">
          {/* Workers Card */}
          <div className="col-md-6 col-6">
            <div
              className="card h-100 shadow-lg text-center hover-shadow bg-light border-0"
              onClick={() => navigate("/admin/shopKepper/workersList")}
            >
              <div className="card-body d-flex flex-column align-items-center justify-content-center">
                <i className="fas fa-users fa-2x text-primary mb-3"></i>
                <h6 className="card-title fw-bold">My Workers</h6>
                <p className="card-text">
                  {shopKepperWorkers?.length || 0} Workers
                </p>
              </div>
            </div>
          </div>

          {/* Services Card */}
          <div className="col-6 col-md-6">
            <div className="card h-100 shadow-lg text-center hover-shadow bg-light border-0">
              <div className="card-body d-flex flex-column align-items-center justify-content-center">
                <i className="fas fa-tools fa-2x text-success mb-3"></i>
                <h6 className="card-title fw-bold">My Services</h6>
                <p className="card-text">
                  {shop?.servicesOffered?.length || 0} Services
                </p>
              </div>
            </div>
          </div>
        </div>

       <div className="text-center" style={{ marginTop: "35px" }}>
  <h3 className="fw-bold mb-3">Quick Rating Summary</h3>
  
{
  shop?.reviews?.length !== 0 ? (
      <div className="d-flex justify-content-center">
    <PieChart reviews={ratingCounts} />
  </div>
  ):(
    <p className="text-muted text-center">Chart Not availble due to no reviews</p>
  )
}
</div>

       </div>

        <div>
          <h6 className="bg-warning p-2 rounded-3 text-center mt-4 mb-2">
            <i className="fa-solid fa-star-half-stroke me-2"></i>
            RATING & REVIEWS
          </h6>

          <div>
            {shop?.reviews?.length > 0 ? (
              <>
                {/* Average rating */}
                <div
                  className="d-flex align-items-center mb-2 mt-1 justify-content-center"
                  style={{ fontSize: "16px" }}
                >
                  <i className="fa-solid fa-star text-warning me-2"></i>
                  <span className="fw-bold fs-6">
                    {findAverageRating(shop?.reviews)}
                    /5
                  </span>
                  <span className="text-muted ms-2 small">
                    ({startIndex + 1}-{startIndex + reviewsPerPage > shop?.reviews.length ? shop?.reviews.length : startIndex + reviewsPerPage}{"/"}{shop?.reviews.length} reviews)
                  </span>
                </div>

                {/* Reviews list */}
                <div className="list-group">
                  {currentReviews?.map((review, index) => (
                    <div
                      key={index}
                      className="list-group-item border rounded-3 mb-2 shadow-sm "
                      style={{ backgroundColor: "#F8F8FF" }}
                    >
                      <div className="d-flex justify-content-between align-items-center mb-1">
                        <div>
                          <strong>{review.name}</strong>
                          <i class="fa-solid fa-circle-check text-success"></i>
                        </div>
                        <small className="text-muted">
                          {new Date(review.date).toLocaleDateString()}
                        </small>
                      </div>
                      <p className="mb-1 text-muted small">{review.msg}</p>
                      <div>
                        {[...Array(5)].map((_, i) => (
                          <i
                            key={i}
                            className={`fa-solid fa-star ${
                              i < review.rate
                                ? "text-warning"
                                : "text-secondary"
                            }`}
                            style={{ fontSize: "13px" }}
                          ></i>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <p className="text-muted text-center">No reviews yet</p>
            )}
          </div>

          {shop?.reviews?.length === 0 ? (
            ""
          ) : (
            <div className="d-flex justify-content-center gap-5 mt-3">
              <button
                className="btn btn-danger rounded-pill px-3"
                onClick={handleBackPage}
                disabled={page === 0}
              >
                <i class="fa-solid fa-circle-arrow-left me-2"></i>
                Back
              </button>
              <button
                className="btn btn-success  rounded-pill px-3"
                onClick={handleNextPage}
                disabled={startIndex + reviewsPerPage >= reviews.length}
              >
                Next
                <i class="fa-solid fa-circle-arrow-right ms-2"></i>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default MyShop;
