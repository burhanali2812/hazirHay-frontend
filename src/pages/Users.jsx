import React, { useState, useEffect } from "react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import axios from "axios";
function Users({ setTopText }) {
  const role = localStorage.getItem("role");
  const token = localStorage.getItem("token");
  const [liveUsers, setLiveUsers] = useState([]);
  const getLiveUsers = async () => {
    try {
      const response = await axios.get(
        "https://hazir-hay-backend.vercel.app/users/get-live-users",
        {
          headers: { Authorization: `Bearer ${token}` },
          params: { t: Date.now() },
        }
      );

      if (response.data.success) {
        setLiveUsers(response.data.data || []);
        toast.success(" fetch live users successfully!.");
      } else {
        console.warn("No Live users found:", response.data.message);
        setLiveUsers([]);
      }
    } catch (error) {
      console.error(
        "Error fetching users:",
        error.response?.data?.message || error.message
      );
      toast.error("Failed to fetch live users. Please try again.");
      setLiveUsers([]);
    }
  };
  useEffect(() => {
    setTopText("Users");
  }, [setTopText]);
  useEffect(() => {
    if (token) {
      getLiveUsers();
    }
  }, [token]);

  return (
    <div className="container">
      <ToastContainer />
      <div class="input-group">
        <input
          type="search"
          class="form-control"
          placeholder="Search"
          aria-label="Search"
        />
        <button class="btn btn-info" type="submit">
          <i class="fa-solid fa-magnifying-glass"></i>
        </button>
      </div>



    </div>


  );
}




export default Users;
