// src/utils/useCheckBlockedStatus.js
import { useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export const useCheckBlockedStatus = (token) => {
  const navigate = useNavigate();

  useEffect(() => {
    const fetchBlockedStatus = async () => {
      try {
        const res = await axios.get(
          "https://hazir-hay-backend.vercel.app/shops/checkShopStatus",
          {
            headers: { Authorization: `Bearer ${token}` },
            params: { t: Date.now() }, // avoid caching
          }
        );

        if (res.data.success) {
          if (res.data.status === true) {
            navigate("/admin/shopKepper/sh&BlTr&bl&5&comp&shbl&tr");
          }
        }
      } catch (error) {
        console.log("Error checking block status:", error);
      }
    };

    if (token) fetchBlockedStatus();
  }, [token, navigate]);
};
