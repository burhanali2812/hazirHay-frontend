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
import Cart from "./components/Cart";
import Tracking from "./components/Tracking";
import FindShops from "./pages/FindShops";
import Notification from "./pages/Notification";
import ContactUs from "./pages/ContactUs";
import OrderWithJourney from "./components/OrderWithJourney";
import MyShop from "./pages/MyShop";
import Blocked from "./pages/Blocked";
import WorkerSignup from "./pages/WorkerSignup";

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
    const [statusUpdate, setStausUpdate] = useState(false);
  const [cartData, setCartData] = useState([]);
    const role = sessionStorage.getItem("role");

  const [areaName, setAreaName] = useState("");
  const [coordinates, setCoordinates] = useState([]);
  const [notification, setNotification] = useState([]);
  const [unSeenNotification, setUnSeenNotification] = useState([]);
    const [shopKepperWorkers, setShopKepperWorkers] = useState([]);
    const [shopKepperStatus2, setShopKepperStatus2] = useState(false);
    const [isBlocked, setIsBlocked] = useState(false);
  
    const user = JSON.parse(sessionStorage.getItem("user"));

    


  const getAllUser = async () => {
    try {
      const response = await axios.get(
        "https://hazir-hay-backend.vercel.app/users/getAllUser",
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
        "https://hazir-hay-backend.vercel.app/shopKeppers/getAllShopKepper",
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
  const getShopKepperWorkers = async()=>{
    try {
      const res = await axios.get("https://hazir-hay-backend.vercel.app/worker/getWorkersByShop", {
        headers: { Authorization: `Bearer ${token}` },
        params: { t: Date.now() }, 
      });
      if(res.data.success){
        setShopKepperWorkers(res.data.workers);
      }
    } catch (error) {
      console.log(error);
    }
  }
    const getUserStatus = async()=>{
    try {
      const res = await axios.get(`https://hazir-hay-backend.vercel.app/shopKeppers/getBusyStatus/${user?._id}`, {
        headers: { Authorization: `Bearer ${token}` },
        params: { t: Date.now() }, // avoid caching
      });
      if(res.data.success){
        setShopKepperStatus2(res.data.data);
       // alert(res.data.data ? "You are currently marked as busy." : "You are currently marked as available.");
      }
    } catch (error) {
      console.log(error);
    }
  }
  useEffect(() => {
    if(statusUpdate){
        if (role === "shopKepper") {
          getUserStatus();
        }
        setStausUpdate(false);
    }
  }, [statusUpdate]);

  useEffect(() => {
    if (role === "shopKepper") {
      getShopKepperWorkers();
      getUserStatus();
    }
  }, [role]);

  const getNotifications = async()=>{
    console.log("fetching.....Notifications");
    
    try {
      const response = await axios.get(`https://hazir-hay-backend.vercel.app/notification/getAllNotification/${user._id}`,{
         headers: { Authorization: `Bearer ${token}` },
          params: { t: Date.now() },
      });
      if(response.data.success){
       // alert("Notification fetch successfully");
       const notificationArray = response.data.data || [];
        setNotification(notificationArray);
        const unSeen = notificationArray.filter((notify)=> notify.isSeen === false);
        setUnSeenNotification(unSeen);
      }
    } catch (error) {
      console.error(error);
    }
  }

  const updateNotification = async()=>{
    try {
       const response = await axios.put("https://hazir-hay-backend.vercel.app/notification/updateNotification", 
        { notifications: unSeenNotification }
        ,{
         headers: { Authorization: `Bearer ${token}` },
          params: { t: Date.now() },
      });
      if(response.data.success){
       // alert("Notification Update successfully");
        getNotifications();
      }
    } catch (error) {
      console.error(error);
    }
  }

const deleteNotification = async (id) => {
  // update UI immediately (optimistic update)
  setNotification((prev) => prev.filter((notify) => notify._id !== id));

  try {
    const response = await axios.delete(
      `https://hazir-hay-backend.vercel.app/notification/deleteNotification/${id}`,
      {
        headers: { Authorization: `Bearer ${token}` },
        params: { t: Date.now() },
      }
    );

    if (response.data.success) {
      //alert("Notification deleted successfully");
      // optional: refresh from server
       getNotifications();
    }
  } catch (error) {
    console.error(error);
    // rollback UI if deletion fails
    getNotifications();
  }
};


  const getCartData = async () => {
    try {
      const response = await axios(
        "https://hazir-hay-backend.vercel.app/cart/getCartData",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setCartData(response.data.data?.[0] || {});
      console.log("CartDAta", response.data.data?.[0]);

      console.log(response.data.message || "Cart Data Fetch Successfully!");
    } catch (error) {
      console.error("Error Fetching CArt data", error);
    }
  };

  useEffect(() => {
    getAllUser();
    getAllShopKepper();
    getCartData();
    getNotifications();
  }, []);

  useEffect(() => {
    if (UpdateAppjs) {
      getAllUser();
      getAllShopKepper();
      getCartData();
      getNotifications();
      setUpdateAppjs(false);
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
            path="shopKepper/sh&BlTr&bl&5&comp&shbl&tr"
            element={
              <Blocked/>
            }
          />
        <Route
          path="/admin/*"
          element={
            <AdminFooter1
              topText={topText}
              setUpdate={setUpdate}
              setShopKepperStatus={setShopKepperStatus}
              unSeenNotification={unSeenNotification} onUpdate = {updateNotification}
              cartData={cartData}
              shopKepperStatus2 = {shopKepperStatus2}
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
               
                setUpdateAppjs={setUpdateAppjs}
              
              />
            }
          />
             <Route
            path="shopKepper/worker/signup"
            element={
              <WorkerSignup/>
            }
          />
          <Route
            path="shopKepper/requests"
            element={
              <ShopkepperRequests
                shopKepperStatus={shopKepperStatus}
                refreshFlag={refreshFlag}
                setRefreshFlag = {setRefreshFlag}
                shopKepperWorkers={shopKepperWorkers}
              />
            }
          />
           <Route
            path="shopKepper/myShop"
            element={
              <MyShop/>
            }
          />
         
          <Route
            path="user/dashboard"
            element={
              <UserDashboard
                setUpdateAppjs={setUpdateAppjs}
                cartData={cartData}
                areaName={areaName}
                setAreaName={setAreaName}
                coordinates={coordinates}
                setCoordinates={setCoordinates}
              />
            }
          />

          <Route
            path="user/cart"
            element={
              <Cart
                cartData={cartData}
                setRefreshFlag ={setRefreshFlag}
                setUpdateAppjs={setUpdateAppjs}
                areaName={areaName}
                coordinates={coordinates}
                setCartData={setCartData}
              />
            }
          />
          <Route
            path="user/tracking"
            element={<Tracking setUpdateAppjs={setUpdateAppjs} />}
          />
          <Route path="user/findShops" element={<FindShops />} />
          <Route path="user/notification" element={<Notification notification={notification} onDelete={deleteNotification} setNotification={setNotification} setUnSeenNotification={setUnSeenNotification}/>} />
          <Route path="user/contact" element={<ContactUs />} />
          <Route path="user/orderWithJourney" element={<OrderWithJourney  setStausUpdate = {setStausUpdate}/>} />
         
        </Route>
      </Routes>
    </>
  );
}

export default App;
