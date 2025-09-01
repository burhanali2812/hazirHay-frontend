import "./App.css";
import AdminFooter1 from "./components/AdminFooter1";
import Dashboard from "./pages/Dashboard";
import Login from "./pages/Login";
import Main from "./pages/Main";
import { Routes, Route } from "react-router-dom";
import Signup from "./pages/Signup";
import ShopForm from "./pages/ShopForm";
import Requests from "./pages/Requests";
import { useEffect, useState } from "react";
import Users from "./pages/Users";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import ShopKepperDashboard from "./pages/ShopKepperDashboard";
import "@fortawesome/fontawesome-free/css/all.min.css";
import ShopkepperRequests from "./pages/ShopkepperRequests";
import UserDashboard from "./pages/UserDashboard";

function App() {
  const [topText, setTopText] = useState("");
  const token = localStorage.getItem("token");
  const [totalUser, setTotalUser] = useState([]);
  const [update, setUpdate] = useState(false);
  const [totalShopkepper, setTotalShopKepper] = useState([]);
  const [totalActiveShopkepper, setTotalActiveShopKepper] = useState([]);
  const [totalLiveShopkepper, setTotalLiveShopKepper] = useState([]);
  const [shopKepperStatus, setShopKepperStatus] = useState(false);
  const [UpdateAppjs, setUpdateAppjs] = useState(false);
  const [shopWithShopkepper, setShopWithShopkepper] = useState([]);
    const [refreshFlag, setRefreshFlag] = useState(false);

  const handleRequestAdded = () => {
    setRefreshFlag(prev => !prev); // toggle flag to trigger re-fetch
  };


  const getAllUser = async () => {
    try {
      const response = await axios.get(
        "https://hazir-hay-backend.wckd.pk/users/getAllUser",
        {
          headers: { Authorization: `Bearer ${token}` },
          params: { t: Date.now() },
        }
      );

      if (response.data.success) {
        setTotalUser(response.data.data || []);
      } else {
        console.warn("No users found:", response.data.message);
        setTotalUser([]);
      }
    } catch (error) {
      console.error(
        "Error fetching users:",
        error.response?.data?.message || error.message
      );

      setTotalUser([]);
    }
  };
  const getAllShopKepper = async () => {
    try {
      const response = await axios.get(
        "https://hazir-hay-backend.wckd.pk/shopKeppers/getAllShopKepper",
        {
          headers: { Authorization: `Bearer ${token}` },
          params: { t: Date.now() },
        }
      );

      if (response.data.success) {
        const shopKepperList = response.data?.data || [];
        setTotalShopKepper(shopKepperList);

        const activeShopKepper = shopKepperList.filter(
          (shopKepper) => shopKepper.isVerified === true
        );
        setTotalActiveShopKepper(activeShopKepper);

        const liveShopKepper = shopKepperList.filter(
          (shopKepper) => shopKepper?.isLive === true
        );
        setTotalLiveShopKepper(liveShopKepper);
      } else {
        console.warn("No ShopKepper found:", response.data.message);
        setTotalShopKepper([]);
      }
    } catch (error) {
      console.error(
        "Error fetching ShopKepper:",
        error.response?.data?.message || error.message
      );
      //  toast.error("Failed to fetch ShopKepper. Please try again.");
      setTotalShopKepper([]);
    }
  };

  useEffect(() => {
    
    getAllUser();
    getAllShopKepper();
  }, []);

  useEffect(() => {
    if (UpdateAppjs) {
      getAllUser();
      getAllShopKepper();
    }
  }, [UpdateAppjs]);

  useEffect(() => {
    const fetchShopKepper = async () => {
      console.log("Update triggered:", update);
      if (update) {
        await getAllShopKepper();
        setUpdate(false);
      }
    };

    fetchShopKepper();
  }, [update]);

  return (
    <>
      <Routes>
        <Route path="/" element={<Main />} />
        <Route path="/login" element={<Login />}></Route>
        <Route
          path="/signup"
          element={
            <Signup
              onUserAdded={getAllUser}
              onShopKepperAdded={getAllShopKepper}
            />
          }
        ></Route>
        <Route path="/shop" element={<ShopForm />}></Route>
        <Route
          path="/admin/*"
          element={
            <AdminFooter1
              topText={topText}
              setUpdate={setUpdate}
              setShopKepperStatus={setShopKepperStatus}
            />
          }
        >
          <Route
            path="dashboard"
            element={
              <Dashboard
                setTopText={setTopText}
                totalUser={totalUser}
                totalShopkepper={totalShopkepper}
                totalActiveShopkepper={totalActiveShopkepper}
                totalLiveShopkepper={totalLiveShopkepper}
                setUpdate={setUpdate}
                setUpdateAppjs={setUpdateAppjs}
              />
            }
          />
          <Route
            path="requests"
            element={
              <Requests
                setTopText={setTopText}
                setUpdate={setUpdate}
                shopWithShopkepper={shopWithShopkepper}
              />
            }
          />
          <Route
            path="users"
            element={
              <Users
                setTopText={setTopText}
                totalUser={totalUser}
                totalShopkepper={totalShopkepper}
                totalActiveShopkepper={totalActiveShopkepper}
                totalLiveShopkepper={totalLiveShopkepper}
              />
            }
          />

          <Route
            path="shopKepper/dashboard"
            element={
              <ShopKepperDashboard
                shopKepperStatus={shopKepperStatus}
                setUpdateAppjs={setUpdateAppjs}
              />
            }
          />
          <Route
            path="shopKepper/requests"
            element={<ShopkepperRequests shopKepperStatus={shopKepperStatus} refreshFlag={refreshFlag}/>}
          />
          <Route
            path="user/dashboard"
            element={
              <UserDashboard
                totalActiveShopkepper={totalActiveShopkepper}
                setUpdateAppjs={setUpdateAppjs}
               onRequestAdded={handleRequestAdded}
              />
            }
          />
        </Route>
      </Routes>
    </>
  );
}

export default App;
