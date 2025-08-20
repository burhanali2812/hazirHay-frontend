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

function App() {
  const [topText, setTopText] = useState("");
  const token = localStorage.getItem("token");
  const [totalUser, setTotalUser] = useState([]);
    const [totalShopkepper, setTotalShopKepper] = useState([]);
    const [totalActiveShopkepper, setTotalActiveShopKepper] = useState([]);
    const [totalLiveShopkepper, setTotalLiveShopKepper] = useState([]);
  

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
      toast.error("Failed to fetch users. Please try again.");
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
        const shopKepperList = response.data.data || [];
        setTotalShopKepper(shopKepperList);


        const activeShopKepper = shopKepperList.filter(
          (shopKepper) => shopKepper.isVerified === true
        );
        setTotalActiveShopKepper(activeShopKepper);

        const liveShopKepper = shopKepperList.filter(
          (shopKepper) => shopKepper.isLive === true
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
      toast.error("Failed to fetch ShopKepper. Please try again.");
      setTotalShopKepper([]);
    }
  };
  
  useEffect(() => {
    if (token) {
      getAllUser();
      getAllShopKepper();
    }
  }, [token]);
  return (
    <>
      <Routes>
        <Route path="/" element={<Main />} />
        <Route path="/login" element={<Login />}></Route>
        <Route path="/signup" element={<Signup  onUserAdded={getAllUser} onShopKepperAdded={getAllShopKepper}/>}></Route>
        <Route path="/shop" element={<ShopForm />}></Route>
        <Route path="/admin/*" element={<AdminFooter1 topText={topText} />}>
          <Route
            path="dashboard"
            element={
              <Dashboard setTopText={setTopText} totalUser={totalUser} totalShopkepper ={totalShopkepper} totalActiveShopkepper={totalActiveShopkepper} totalLiveShopkepper={totalLiveShopkepper}/>
            }
          />
          <Route
            path="requests"
            element={<Requests setTopText={setTopText} />}
          />
          <Route path="users" element={<Users setTopText={setTopText} totalUser={totalUser}  totalShopkepper ={totalShopkepper} totalActiveShopkepper={totalActiveShopkepper} totalLiveShopkepper={totalLiveShopkepper}/>} />
        </Route>
      </Routes>
    </>
  );
}

export default App;
