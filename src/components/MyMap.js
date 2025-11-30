import React, { useEffect, useRef } from "react";
import { useAppContext } from "../context/AppContext";

export default function MyMap({ onLocationSelect }) {
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  const markerRef = useRef(null);

  const { fetchAreaName, coordinates, selectedArea, setSelectedArea } =
    useAppContext();
  useEffect(() => {
    if (!window.mapboxgl) return;

    const mapboxgl = window.mapboxgl;
    mapboxgl.accessToken =
      "pk.eyJ1Ijoic3llZGJ1cmhhbmFsaTI4MTIiLCJhIjoiY21mamM0NjZiMHg4NTJqczRocXhvdndiYiJ9.Z4l8EQQ47ejlWdVGcimn4A";

    const map = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: "mapbox://styles/mapbox/streets-v11",
      center: [73.0551, 33.6844],
      zoom: 12,
    });

    map.addControl(new mapboxgl.NavigationControl());
    mapRef.current = map;

    map.on("click", async (e) => {
      const { lng, lat } = e.lngLat;

      if (markerRef.current) markerRef.current.remove();

      markerRef.current = new mapboxgl.Marker({ color: "red" })
        .setLngLat([lng, lat])
        .addTo(map);

      const areaName = await fetchAreaName(lat, lng);

      setSelectedArea({ lat, lng, areaName });
      onLocationSelect({ lat, lng, areaName });
    });

    return () => map.remove();
  }, []); 




  useEffect(() => {
    console.log("selected Area", selectedArea)
    if (!mapRef.current) return;

    let lat, lng;

    if (selectedArea?.lat && selectedArea?.lng) {
      lat = selectedArea.lat;
      lng = selectedArea.lng;
    } else if (coordinates.lat && coordinates.lng) {
      lat = coordinates.lat;
      lng = coordinates.lng;
    } else {
      return;
    }

    if (markerRef.current) markerRef.current.remove();

 
    const color = selectedArea ? "red" : "blue";

markerRef.current = new window.mapboxgl.Marker({ color })

      .setLngLat([lng, lat])
      .addTo(mapRef.current);

    // Fly to location
    mapRef.current.flyTo({ center: [lng, lat], zoom: 14 });
  }, [selectedArea, coordinates]);
  

  return (
    <div ref={mapContainerRef} style={{ width: "100%", height: "100%" }} />
  );
}
