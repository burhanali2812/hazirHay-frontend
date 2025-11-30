
import { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";

export const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");
  const user = JSON.parse(localStorage.getItem("user"));

  const [totalUser, setTotalUser] = useState([]);
  const [totalShopKepper, setTotalShopKepper] = useState([]);
  const [totalActiveShopKepper, setTotalActiveShopKepper] = useState([]);
  const [totalLiveShopKepper, setTotalLiveShopKepper] = useState([]);
  const [shopKepperWorkers, setShopKepperWorkers] = useState([]);
  const [shopKepperStatus2, setShopKepperStatus2] = useState(null);
  const [cartData, setCartData] = useState([]);
    const [shop, setShop] = useState(null);
  const [notification, setNotification] = useState([]);
  const [unSeenNotification, setUnSeenNotification] = useState([]);
  const [localShopData, setLocalShopData] = useState([]);
  const [localShopWithDistance, setLocalShopWithDistance] = useState([]);

  const [topText, setTopText] = useState("");
  const [pageKey, setKey] = useState(null);
  const [shopKepperStatus, setShopKepperStatus] = useState(null);
   const [method, setMethod] = useState("");
  const [areaName, setAreaName] = useState("");
  const [coordinates, setCoordinates] = useState(null);
  const [refreshFlag, setRefreshFlag] = useState(false);
  const [update, setUpdate] = useState(false);
  const [updateAppjs, setUpdateAppjs] = useState(false);
  const [statusUpdate, setStatusUpdate] = useState(false);
    const [selectedArea, setSelectedArea] = useState(null);
      const [userLocations, setUserLocations] = useState([]);

  const [loading, setLoading] = useState(false);


  const api = axios.create({
    baseURL: "https://hazir-hay-backend.vercel.app",
    headers: { Authorization: `Bearer ${token}` },
  });



  const getAllUser = async () => {
    try {
      const res = await api.get("/users/getAllUser", {
        params: { t: Date.now() },
      });
      setTotalUser(res.data.data || []);
    } catch (err) {
      console.log("Error fetch users", err);
      setTotalUser([]);
    }
  };
    const getShopData = async () => {
    try {
      const response = await api.get(
        `/shops/shopData/${user._id}`,
        {
          params: { t: Date.now() },
        }
      );
        setShop(response.data.shop);

    } catch (err) {
      console.error("Error fetching shop data:", err);
      setShop(null)
    }
  };

  const getAllShopKepper = async () => {
    try {
      const res = await api.get("/shopKeppers/getAllShopKepper", {
        params: { t: Date.now() },
      });
      const list = res.data.data || [];
      setTotalShopKepper(list);
      setTotalActiveShopKepper(list.filter((x) => x.isVerified));
      setTotalLiveShopKepper(list.filter((x) => x.isLive));
    } catch (err) {
      console.log("Error fetch shopkepper", err);
      setTotalShopKepper([]);
    }
  };

  const getShopKepperWorkers = async () => {
    try {
      const res = await api.get("/worker/getWorkersByShop", {
        params: { t: Date.now() },
      });
      setShopKepperWorkers(res.data.workers || []);
    } catch (err) {
      console.log("worker err", err);
    }
  };

  const getUserStatus = async () => {
    try {
      const res = await api.get(
        `/shopKeppers/getBusyStatus/${user?._id}`,
        { params: { t: Date.now() } }
      );
      setShopKepperStatus2(res.data.data);
    } catch (err) {
      console.log("status err", err);
    }
  };

  const getNotifications = async () => {
    try {
      const res = await api.get(
        `/notification/getAllNotification/${user?._id}`,
        { params: { t: Date.now() } }
      );

      const arr = res.data.data || [];
      setNotification(arr);
      setUnSeenNotification(arr.filter((n) => !n.isSeen));
    } catch (err) {
      console.log(err);
    }
  };

  const updateNotification = async () => {
    try {
      await api.put(
        "/notification/updateNotification",
        { notifications: unSeenNotification },
        { params: { t: Date.now() } }
      );
      getNotifications();
    } catch (err) {
      console.log(err);
    }
  };

  const deleteNotification = async (id) => {
    setNotification((prev) => prev.filter((n) => n._id !== id));

    try {
      await api.delete(
        `/notification/deleteNotification/${id}`,
        { params: { t: Date.now() } }
      );
      getNotifications();
    } catch (err) {
      console.log(err);
    }
  };

  const getCartData = async () => {
    try {
      const res = await api.get("/cart/getCartData");
      setCartData(res.data.data.items || []);

    } catch (err) {
      console.log("Cart err", err);
    }
  };

  const getLocalVerifiedLiveShops = async()=>{
    try {
      const res = await api.get("/localShop/getAllVerifiedLiveLocalShops");
      setLocalShopData(res.data.shops)
    } catch (error) {
      console.log("local shop getting err", error);
    }
  }
    const getUserLocations = async () => {
      try {
        const response = await api.get(
          `/users/getUserById/${user._id}`
        );
        if (response.data.success) {
          const locations = response.data.data.location || [];
          setUserLocations(locations);
  
          const defaultLocation = locations.find((loc) => loc.isDefault);
          if (defaultLocation) {
            console.log("Default Location:", defaultLocation.area);
            setSelectedArea({lat: defaultLocation?.coordinates[0], lng: defaultLocation?.coordinates[1], areaName: defaultLocation?.area});
          }
        } else {
          console.error("Failed to fetch user locations");
          setUserLocations([]);
        }
      } catch (error) {
        console.error("Error fetching user locations:", error.message);
        setUserLocations([]);
      }
    };

      const fetchAreaName = async (lat, lon) => {
    try {
      const res = await axios.get(
        "https://hazir-hay-backend.vercel.app/admin/reverse-geocode",
        { params: { lat, lon } }
      );
      return (
        res.data?.display_name ||
        res.data.address?.city ||
        res.data.address?.town ||
        res.data.address?.village ||
        res.data.address?.suburb ||
        "Unknown Area"
      );
    } catch {
      return "Unknown Area";
    }
  };
    const chooseCurrentLocation = async () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          const lat = pos.coords.latitude;
          const lng = pos.coords.longitude;
          setCoordinates({ lat, lng });
        },
        (error) => {
          console.error("Error getting location:", error);
          alert("Unable to get your location. Please allow location access.");
        }
      );
    } else {
      alert("Geolocation is not supported by your browser.");
    }
  };


  


  useEffect(() => {
   if(user !== null){
 if (!role) return;

    getAllUser();
    getAllShopKepper();
    getNotifications();

    if (role === "user"){
      getCartData();
      getLocalVerifiedLiveShops();
      chooseCurrentLocation();
      getUserLocations();
      
    }

    if (role === "shopKepper") {
      getShopKepperWorkers();
      getUserStatus();
      getShopData();
    }
   }
  }, []);


  return (
    <AppContext.Provider
      value={{
      
        totalUser,
        totalShopKepper,
        totalActiveShopKepper,
        totalLiveShopKepper,
        shopKepperWorkers,
        shopKepperStatus2,
        cartData,
        notification,
        unSeenNotification,

   
        topText,
        setTopText,
        pageKey,
        setKey,
        selectedArea,
        setSelectedArea,
        localShopWithDistance,
        shopKepperStatus,
        setShopKepperStatus,
        areaName,
        setAreaName,
        coordinates,
        setCoordinates,
        refreshFlag,
        setRefreshFlag,
        update,
        setUpdate,
        updateAppjs,
        setUpdateAppjs,
        statusUpdate,
        setStatusUpdate,
        setNotification,
        shop,
        localShopData,
        method,
        setMethod,
        setUserLocations,
        userLocations,
        setCartData,

        getShopData,
        getAllUser,
        getAllShopKepper,
        getShopKepperWorkers,
        getUserStatus,
        getNotifications,
        updateNotification,
        deleteNotification,
        getCartData,
        fetchAreaName,
        getUserLocations,


        loading,
        setLoading,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => useContext(AppContext);
