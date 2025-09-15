import React, { useEffect, useRef } from "react";
import axios from "axios";

export default function MyMap({ onLocationSelect, initialLocation }) {
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);   // store map instance
  const markerRef = useRef(null); // store marker instance

  useEffect(() => {
    if (!window.mapboxgl) {
      console.error("Mapbox GL not loaded!");
      return;
    }

    const mapboxgl = window.mapboxgl;
    mapboxgl.accessToken =
      "pk.eyJ1Ijoic3llZGJ1cmhhbmFsaTI4MTIiLCJhIjoiY21mamM0NjZiMHg4NTJqczRocXhvdndiYiJ9.Z4l8EQQ47ejlWdVGcimn4A";

    const map = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: "mapbox://styles/mapbox/streets-v11",
      center: [73.0551, 33.6844], // default Islamabad
      zoom: 12,
    });

    map.addControl(new mapboxgl.NavigationControl());
    mapRef.current = map;

    // ✅ Try Geolocation First
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          const lng = pos.coords.longitude;
          const lat = pos.coords.latitude;

          if (markerRef.current) markerRef.current.remove();

          markerRef.current = new mapboxgl.Marker({ color: "blue" })
            .setLngLat([lng, lat])
            .addTo(map);

          map.flyTo({ center: [lng, lat], zoom: 14 });

          const areaName = await fetchAreaName(lat, lng);
          const location = { lat, lng, areaName };

          if (onLocationSelect) onLocationSelect(location);
          localStorage.setItem("selectedLocation", JSON.stringify(location));
        },
        async () => {
          // ❌ If user denies or geolocation fails → fallback to localStorage
          const saved = localStorage.getItem("selectedLocation");
          if (saved) {
            const { lat, lng, areaName } = JSON.parse(saved);

            markerRef.current = new mapboxgl.Marker({ color: "blue" })
              .setLngLat([lng, lat])
              .addTo(map);

            map.flyTo({ center: [lng, lat], zoom: 14 });

            if (onLocationSelect) onLocationSelect({ lat, lng, areaName });
          }
        }
      );
    }

    // ✅ Allow manual picking
    map.on("click", async (e) => {
      const { lng, lat } = e.lngLat;

      if (markerRef.current) markerRef.current.remove();

      markerRef.current = new mapboxgl.Marker({ color: "red" })
        .setLngLat([lng, lat])
        .addTo(map);

      const areaName = await fetchAreaName(lat, lng);
      const location = { lat, lng, areaName };

      if (onLocationSelect) onLocationSelect(location);
      localStorage.setItem("selectedLocation", JSON.stringify(location));
    });

    return () => map.remove();
  }, []);

  // ✅ Handle initialLocation from parent
  useEffect(() => {
    if (initialLocation && mapRef.current) {
      const { lat, lng, areaName } = initialLocation;

      if (markerRef.current) markerRef.current.remove();

      markerRef.current = new window.mapboxgl.Marker({ color: "blue" })
        .setLngLat([lng, lat])
        .addTo(mapRef.current);

      mapRef.current.flyTo({ center: [lng, lat], zoom: 14 });

      localStorage.setItem(
        "selectedLocation",
        JSON.stringify({ lat, lng, areaName })
      );
    }
  }, [initialLocation]);

  const fetchAreaName = async (lat, lon) => {
    try {
      const res = await axios.get(
        "https://hazir-hay-backend.wckd.pk/admin/reverse-geocode",
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

  return (
    <div ref={mapContainerRef} style={{ width: "100%", height: "100%" }} />
  );
}
