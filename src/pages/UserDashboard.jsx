import React,{useState, useEffect} from 'react'
import axios from "axios";
function UserDashboard() {
  const [position, setPosition] = useState([33.6844, 73.0479]);
    const [latitude, setLatitude] = useState(33.6844);
    const [longitude, setLongitude] = useState(73.0479);
      const [areaName, setAreaName] = useState("");
  const [coordinates, setCoordinates] = useState([]);
 useEffect(() => {
  const fetchLocation = async () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser.");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const lat = position?.coords?.latitude ?? 33;
        const lon = position?.coords?.longitude ?? 73;

        setLatitude(lat);
        setLongitude(lon);
        setCoordinates(lat, lon);
        setPosition([lat, lon]);

        try {
          const response = await axios.get(
            "https://hazir-hay-backend.vercel.app/admin/reverse-geocode",
            { params: { lat, lon } }
          );

          const name =
            response.data?.display_name ||
            response.data.address?.city ||
            response.data.address?.town ||
            response.data.address?.village ||
            response.data.address?.suburb ||
            "Unknown Area";

          setAreaName(name);
        } catch (error) {
          console.error("Error fetching area name:", error);
        }
      },
      (error) => {
        if (error.code === error.PERMISSION_DENIED) {
          alert("Please enable location access in your browser settings.");
        } else if (error.code === error.POSITION_UNAVAILABLE) {
          alert("Location information is unavailable.");
        } else if (error.code === error.TIMEOUT) {
          alert("Request to get location timed out. Try again.");
        } else {
          alert("An unknown error occurred while fetching your location.");
        }
        console.error("Error getting location:", error);
      }
    );
  };

  fetchLocation();
}, []);

  return (
    <div className='container'>
      <div className='d-flex justify-content-between'>
        <input className='form-control' type='search' placeholder='Searching your current location...' value={areaName}/>
        <button className='btn btn-primary ms-2'><i class="fa-solid fa-map-location-dot"></i></button>

      </div>
    </div>
  )
}

export default UserDashboard
