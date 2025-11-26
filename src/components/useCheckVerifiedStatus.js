
import { useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export const useCheckvarifiedStatus = (user,token) => {
  const navigate = useNavigate();

  useEffect(() => {
    if (!user?.isShop) return;
    const fetchVarified = async () => {
      try {
        const res = await axios.get(
          "https://hazir-hay-backend.vercel.app/shopKeppers/getShopKepperVarification",
          {
            headers: { Authorization: `Bearer ${token}` },
            params: { t: Date.now() },
          }
        );

        if (res.data.success) {
          if (res.data.status === false) {
            navigate("/shopKepper/sh&un&Ve&ri&fi&ed@sh@op$");
          }
        }
      } catch (error) {
        console.log("Error checking block status:", error);
      }
    };

    if (token) fetchVarified();
  }, [token, navigate]);
};
