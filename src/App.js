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
  
  useEffect(() => {
    if (token) {
      getAllUser();
    }
  }, [token]);
  return (
    <>
      <Routes>
        <Route path="/" element={<Main />} />
        <Route path="/login" element={<Login />}></Route>
        <Route path="/signup" element={<Signup  onUserAdded={getAllUser}/>}></Route>
        <Route path="/shop" element={<ShopForm />}></Route>
        <Route path="/admin/*" element={<AdminFooter1 topText={topText} />}>
          <Route
            path="dashboard"
            element={
              <Dashboard setTopText={setTopText} totalUser={totalUser} />
            }
          />
          <Route
            path="requests"
            element={<Requests setTopText={setTopText} />}
          />
          <Route path="users" element={<Users setTopText={setTopText} />} />
        </Route>
      </Routes>
    </>
  );
}

export default App;
