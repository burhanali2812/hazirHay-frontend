import React, { useState, useEffect } from "react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import axios from "axios";
import UserInfo from "../components/UserInfo";

function Users({
  setTopText,
  totalUser,
  totalShopkepper,
  totalActiveShopkepper,
  totalLiveShopkepper,
}) {
  const role = sessionStorage.getItem("role");
  const token = localStorage.getItem("token");
  const [liveUsers, setLiveUsers] = useState([]);
  const [latestUsers, setLatestUsers] = useState([]);
  const [frequentUsers, setFrequentUsers] = useState([]);
  const [detailsModal, setDetailsModal] = useState(false);
  const [singleUserData, setSingleUserData] = useState(null);
  const [filter, setFilter] = useState(false);
  const [filterText, setFilterText] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredUsers, setFilteredUsers] = useState([]);

  const getLiveUsers = async () => {
    try {
      const response = await axios.get(
        "https://hazir-hay-backend.wckd.pk/users/get-live-users",
        {
          headers: { Authorization: `Bearer ${token}` },
          params: { t: Date.now() },
        }
      );

      if (response.data.success) {
        setLiveUsers(response.data.data || []);
      } else {
        console.warn("No Live users found:", response.data.message);
        setLiveUsers([]);
      }
    } catch (error) {
      console.error(
        "Error fetching live users:",
        error.response?.data?.message || error.message
      );
      toast.error("Failed to fetch live users. Please try again.");
      setLiveUsers([]);
    }
  };
  const getFrequentUsers = async () => {
    try {
      const response = await axios.get(
        "https://hazir-hay-backend.wckd.pk/users/get-frequent-users",
        {
          headers: { Authorization: `Bearer ${token}` },
          params: { t: Date.now() },
        }
      );

      if (response.data.success) {
        setFrequentUsers(response.data.data || []);
      } else {
        console.warn("No Frequent users found:", response.data.message);
        setFrequentUsers([]);
      }
    } catch (error) {
      console.error(
        "Error fetching Frequent users:",
        error.response?.data?.message || error.message
      );
      toast.error("Failed to fetch Frequent users. Please try again.");
      setFrequentUsers([]);
    }
  };

  const getLast2mintCreateUsers = async () => {
    try {
      const response = await axios.get(
        "https://hazir-hay-backend.wckd.pk/users/get-latest-users",
        {
          headers: { Authorization: `Bearer ${token}` },
          params: { t: Date.now() },
        }
      );

      if (response.data.success) {
        setLatestUsers(response.data.data || []);
      } else {
        console.warn("No latest users found:", response.data.message);
        setLatestUsers([]);
      }
    } catch (error) {
      console.error(
        "Error fetching latest users:",
        error.response?.data?.message || error.message
      );
      toast.error("Failed to fetch latest users. Please try again.");
      setLatestUsers([]);
    }
  };

  useEffect(() => {
    setTopText("Users");
  }, [setTopText]);

  useEffect(() => {
    if (token) {
      getLiveUsers();
      getLast2mintCreateUsers();
      getFrequentUsers();
    }
  }, [token]);

  const openDetailsModal = (user) => {
    setSingleUserData(user);
    setDetailsModal(true);
  };

  const handleClickOutside = () => {
    setFilter(false);
  };
  const handleOpenFilter = (e, text) => {
    e.stopPropagation();
    setFilter(true);
    setFilterText(text);
  };
  useEffect(() => {
    if (filter) {
      document.addEventListener("click", handleClickOutside);
    }
    return () => document.removeEventListener("click", handleClickOutside);
  }, [filter]);

  const filterArray =
    filterText === "Latest Users"
      ? latestUsers
      : filterText === "Live Users"
      ? liveUsers
      : filterText === "Frequently Users"
      ? frequentUsers
      : totalUser;

  const handleSearch = (searchQuery) => {
    const result = (
      filterText === "Latest Users"
        ? latestUsers
        : filterText === "Live Users"
        ? liveUsers
        : filterText === "Frequently Users"
        ? frequentUsers
        : totalUser
    )?.filter(
      (user) =>
        user?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user?.phone?.includes(searchQuery)
    );

    setFilteredUsers(result); // Store the filtered results in state
    setFilter(true); // Show the filtered list
  };

  const finalFilter = searchQuery === "" ? filterArray : filteredUsers;

  return (
    <div className="container">
      <ToastContainer />

      {/* Search bar */}
      <div className="input-group mb-1">
        <input
          type="search"
          className="form-control"
          placeholder="Search"
          aria-label="Search"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <button
          className="btn btn-info"
          type="submit"
          onClick={(e) => {
            e.stopPropagation();
            handleSearch(searchQuery);
          }}
        >
          <i className="fa-solid fa-magnifying-glass"></i>
        </button>
      </div>

      {/* Filter buttons with horizontal scroll */}
      <div
        className="d-flex flex-nowrap overflow-auto mb-3"
        style={{ gap: "10px", padding: "10px 0" }}
      >
        <i
          class="fa-solid fa-sliders mt-2 ms-2"
          style={{ fontSize: "18px" }}
        ></i>
        <button
          className="btn btn-outline-dark rounded-pill btn-sm text-nowrap"
          onClick={(e) => handleOpenFilter(e, "All Users")}
        >
          All Users
        </button>
        <button
          className="btn btn-outline-dark rounded-pill btn-sm text-nowrap"
          onClick={(e) => handleOpenFilter(e, "Live Users")}
        >
          Live Users
        </button>
        <button
          className="btn btn-outline-dark rounded-pill btn-sm text-nowrap"
          onClick={(e) => handleOpenFilter(e, "Frequently Users")}
        >
          Frequently Users
        </button>
        <button
          className="btn btn-outline-dark rounded-pill btn-sm text-nowrap"
          onClick={(e) => handleOpenFilter(e, "Latest Users")}
        >
          Latest Users
        </button>
      </div>

      {filter === true ? (
        <>
          <h5 className="fw-bold mb-1 mt-1">{filterText}</h5>
          {finalFilter?.length > 0 &&
            finalFilter.map((filter, index) => (
              <div
                key={index}
                className="d-flex align-items-center mb-3"
                style={{ gap: "10px" }}
                onClick={(e) => {
                  e.stopPropagation();
                  openDetailsModal(filter);
                }} // space between picture and text
              >
                {/* Profile Picture */}
                <div
                  style={{
                    width: "50px",
                    height: "50px",
                    borderRadius: "50%",
                    overflow: "hidden",
                    border: "2px solid #ddd",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    backgroundColor: "#f8f9fa",
                    flexShrink: 0, // prevent shrinking
                  }}
                >
                  {filter?.profilePicture ? (
                    <img
                      src={filter.profilePicture}
                      alt="Profile"
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                      }}
                    />
                  ) : (
                    <i
                      className="fa-solid fa-user"
                      style={{ fontSize: "24px", color: "#aaa" }}
                    ></i>
                  )}
                </div>

                {/* User Info */}
                <div>
                  <p className="fw-bold mb-0">{filter?.name}</p>
                  <p
                    className="text-muted mb-0"
                    style={{ fontSize: "0.85rem" }}
                  >
                    {filter?.createdAt
                      ? new Date(filter.lastActive).toLocaleString()
                      : "N/A"}
                  </p>
                </div>
              </div>
            ))}
        </>
      ) : (
        <>
          {/* Live Users Section */}
          <div className="d-flex align-items-center justify-content-between mt-4 mb-2">
            <h5 className="fw-bold mb-0">Live Users</h5>
            {totalShopkepper.length > 0 ? (
              <p
                className="text-primary mb-0 mx-1"
                style={{ cursor: "pointer", fontSize: "0.9rem" }}
                onClick={(e) => handleOpenFilter(e, "Live Users")}
              >
                View All<i class="fa-solid fa-arrow-right ms-2"></i>
              </p>
            ) : (
              ""
            )}
          </div>

          <div
            className="d-flex flex-nowrap overflow-auto"
            style={{ gap: "15px", padding: "10px 0" }}
          >
            {totalShopkepper.length > 0 ? (
              totalShopkepper.slice(0, 4).map((user, index) => (
                <div
                  key={index}
                  className="card text-center p-2"
                  style={{ minWidth: "120px" }}
                >
                  <div
                    style={{
                      width: "80px",
                      height: "80px",
                      borderRadius: "50%",
                      overflow: "hidden",
                      border: "2px solid #ddd",
                      margin: "0 auto 5px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      backgroundColor: "#f8f9fa",
                    }}
                  >
                    {user.profilePicture ? (
                      <img
                        src={user.profilePicture}
                        alt="Profile"
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                        }}
                      />
                    ) : (
                      <i
                        className="fa-solid fa-user"
                        style={{ fontSize: "30px", color: "#aaa" }}
                      ></i>
                    )}
                  </div>
                  <div
                    className="fw-bold text-truncate"
                    style={{
                      fontSize: "16px",
                      maxWidth: "100px",
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      margin: "0 auto",
                    }}
                  >
                    {user.name || "No Name"}
                  </div>

                  <div
                    className="text-muted small"
                    style={{ fontSize: "14px" }}
                  >
                    {user.phone || "No contact"}
                  </div>
                  <hr style={{ marginTop: "0px" }} />
                  <button
                    className="btn btn-info btn-sm"
                    style={{ marginTop: "-10px" }}
                    onClick={() => openDetailsModal(user)}
                  >
                    <i class="fa-solid fa-circle-info me-1"></i>
                    Details
                  </button>
                </div>
              ))
            ) : (
              <div>No live users found</div>
            )}
          </div>

          {/* Latest Users Section */}
          <div className="d-flex align-items-center justify-content-between mt-4 mb-2">
            <h5 className="fw-bold mb-0">Latest Users</h5>
            {totalShopkepper.length > 0 ? (
              <p
                className="text-primary mb-0 mx-1"
                style={{ cursor: "pointer", fontSize: "0.9rem" }}
                onClick={(e) => handleOpenFilter(e, "Latest Users")}
              >
                View All<i class="fa-solid fa-arrow-right ms-2"></i>
              </p>
            ) : (
              ""
            )}
          </div>

          <div
            className="d-flex flex-nowrap overflow-auto"
            style={{ gap: "15px", padding: "10px 0" }}
          >
            {totalShopkepper.length > 0 ? (
              totalShopkepper.slice(0, 4).map((user, index) => (
                <div
                  key={index}
                  className="card text-center p-2"
                  style={{ minWidth: "120px" }}
                >
                  <div
                    style={{
                      width: "80px",
                      height: "80px",
                      borderRadius: "50%",
                      overflow: "hidden",
                      border: "2px solid #ddd",
                      margin: "0 auto 5px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      backgroundColor: "#f8f9fa",
                    }}
                  >
                    {user.profilePicture ? (
                      <img
                        src={user.profilePicture}
                        alt="Profile"
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                        }}
                      />
                    ) : (
                      <i
                        className="fa-solid fa-user"
                        style={{ fontSize: "30px", color: "#aaa" }}
                      ></i>
                    )}
                  </div>
                  <div
                    className="fw-bold text-truncate"
                    style={{
                      fontSize: "16px",
                      maxWidth: "100px",
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      margin: "0 auto",
                    }}
                  >
                    {user.name || "No Name"}
                  </div>

                  <div
                    className="text-muted small"
                    style={{ fontSize: "14px" }}
                  >
                    {user.phone || "No contact"}
                  </div>
                  <hr style={{ marginTop: "0px" }} />
                  <button
                    className="btn btn-info btn-sm"
                    style={{ marginTop: "-10px" }}
                    onClick={() => openDetailsModal(user)}
                  >
                    <i class="fa-solid fa-circle-info me-1"></i>
                    Details
                  </button>
                </div>
              ))
            ) : (
              <div>No Latest users found</div>
            )}
          </div>

          {/* Frequently Users Section */}
          <div className="d-flex align-items-center justify-content-between mt-4 mb-2">
            <h5 className="fw-bold mb-0">Frequent Users</h5>
            {totalShopkepper.length > 5 ? (
              <p
                className="text-primary mb-0 mx-1"
                style={{ cursor: "pointer", fontSize: "0.9rem" }}
                onClick={(e) => handleOpenFilter(e, "Frequently Users")}
              >
                View All<i class="fa-solid fa-arrow-right ms-2"></i>
              </p>
            ) : (
              ""
            )}
          </div>

          <div
            className="d-flex flex-nowrap overflow-auto"
            style={{ gap: "15px", padding: "10px 0" }}
          >
            {totalShopkepper.length > 0 ? (
              totalShopkepper.slice(0, 4).map((user, index) => (
                <div
                  key={index}
                  className="card text-center p-2"
                  style={{ minWidth: "120px" }}
                >
                  <div
                    style={{
                      width: "80px",
                      height: "80px",
                      borderRadius: "50%",
                      overflow: "hidden",
                      border: "2px solid #ddd",
                      margin: "0 auto 5px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      backgroundColor: "#f8f9fa",
                    }}
                  >
                    {user.profilePicture ? (
                      <img
                        src={user.profilePicture}
                        alt="Profile"
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                        }}
                      />
                    ) : (
                      <i
                        className="fa-solid fa-user"
                        style={{ fontSize: "30px", color: "#aaa" }}
                      ></i>
                    )}
                  </div>
                  <div
                    className="fw-bold text-truncate"
                    style={{
                      fontSize: "16px",
                      maxWidth: "100px", // adjust to fit your card width
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      margin: "0 auto",
                    }}
                  >
                    {user.name || "No Name"}
                  </div>

                  <div
                    className="text-muted small"
                    style={{ fontSize: "14px" }}
                  >
                    {user.phone || "No contact"}
                  </div>
                  <hr style={{ marginTop: "0px" }} />
                  <button
                    className="btn btn-info btn-sm "
                    style={{ marginTop: "-10px" }}
                    onClick={() => openDetailsModal(user)}
                  >
                    <i class="fa-solid fa-circle-info me-1"></i>
                    Details
                  </button>
                </div>
              ))
            ) : (
              <div>No Frequent users found</div>
            )}
          </div>
        </>
      )}

      {detailsModal && (
        <UserInfo
          singleUserData={singleUserData}
          setDetailsModal={setDetailsModal}
        />
      )}
    </div>
  );
}

export default Users;
