
import axios from "axios";

export const checkBlockedStatus = async (token, navigate) => {
  try {
    const res = await axios.get(
      "https://hazir-hay-backend.vercel.app/shops/checkShopStatus",
      {
        headers: { Authorization: `Bearer ${token}` },
        params: { t: Date.now() },
      }
    );

    if (res.data.success) {
      if (res.data.status === true) {
    
        navigate("/shopKepper/sh&BlTr&bl&5&comp&shbl&tr", {
          state: { days: res.data.remainingDays },
        });
        return false;
      }
    }
    return true; 
  } catch (error) {
    console.error("Error checking block status:", error);
    return true; // let them continue if API fails
  }
};
