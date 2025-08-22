import axios from 'axios'
import React, { useEffect , useState} from 'react'

function ShopKepperDashboard({setUpdate}) {
    const user = JSON.parse(localStorage.getItem("user"))
    const token = localStorage.getItem("token")
    const [isOnline, setIsOnline] = useState(false)
    const [loading, setLoading] = useState(false)

const getShopkepperStatus = async () => {
  try {
    const response = await axios.get(
      `https://hazir-hay-backend.vercel.app/shopKeppers/getShopKepperStatus/${user._id}`,
      {
        headers: { Authorization: `Bearer ${token}` },
        params: { t: Date.now() } // prevents caching
      }
    );

    if (response.status === 200) {
      console.log("Current Status:", response.data.data);
      setIsOnline(response.data.data); // update state with isLive value
    }
  } catch (error) {
    console.error("Error fetching status:", error);
    alert(error.response?.data?.message || "Failed to fetch status!");
  }
};


    useEffect(()=>{
       getShopkepperStatus();
    },[user])


 const toggleStatus = async () => {
  setLoading(true);
  try {
    const newStatus = !isOnline;

    const payLoad = {
      isLive: newStatus
    };

    const response = await axios.put(
      "https://hazir-hay-backend.vercel.app/shopKeppers/update-live",
      payLoad,
      {
        headers: { Authorization: `Bearer ${token}` },
        params: { t: Date.now() } 
      }
    );

    if (response.status === 200) {
      alert(response.data.message || "Status updated successfully!");
      setUpdate(true)
      setIsOnline(newStatus); // update UI state
    } else {
      alert("Failed to update status!");
    }
  } catch (error) {
    console.error("Error updating status:", error);
    alert(error.response?.data?.message || "Something went wrong!");
  } finally {
    setLoading(false);
  }
};

  return (
    <div>
      <h1>h1</h1>

       <div className="flex items-center justify-center h-screen">
      <button
        onClick={toggleStatus}
        disabled={loading}
        className={`px-6 py-2 text-white font-semibold rounded-full shadow-md transition duration-300 ${
          isOnline ? "bg-green-500" : "bg-red-500"
        } ${loading ? "opacity-50 cursor-not-allowed" : ""}`}
      >
        {loading
          ? "Updating..."
          : isOnline
          ? "🟢 Online"
          : "🔴 Offline"}
      </button>
    </div>
    </div>
  )
}

export default ShopKepperDashboard
