import React, { useEffect, useRef } from "react";
import mapboxgl from "mapbox-gl";
import axios from "axios";
import L from "leaflet";  
mapboxgl.accessToken =
  "pk.eyJ1Ijoic3llZGJ1cmhhbmFsaTI4MTIiLCJhIjoiY21mamM0NjZiMHg4NTJqczRocXhvdndiYiJ9.Z4l8EQQ47ejlWdVGcimn4A"; 

export default function UserShopRoute({ userCoords, shopCoords, onRouteInfo, type }) {
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  const bikeMarkerRef = useRef(null); // ✅ reference for bike marker

  // 🔥 Smooth animation between two coordinates
  function animateMarker(marker, start, end, duration = 3000) {
    let startTime = null;

    function animate(time) {
      if (!startTime) startTime = time;
      const progress = Math.min((time - startTime) / duration, 1);

      // Linear interpolation (LERP)
      const lng = start[0] + (end[0] - start[0]) * progress;
      const lat = start[1] + (end[1] - start[1]) * progress;

      marker.setLngLat([lng, lat]);

      if (progress < 1) requestAnimationFrame(animate);
    }

    requestAnimationFrame(animate);
  }

  // ✅ Function to draw route & markers
  async function showRouteOnMap(map, userCoords, shopCoords) {
    if (!userCoords || userCoords.length !== 2) return;
    if (!shopCoords || shopCoords.length !== 2) return;

    try {
      const url = `https://api.mapbox.com/directions/v5/mapbox/driving/${userCoords[0]},${userCoords[1]};${shopCoords[0]},${shopCoords[1]}?geometries=geojson&access_token=${mapboxgl.accessToken}`;
      const res = await axios.get(url);
      const data = res.data;

      if (!data.routes || data.routes.length === 0) {
        console.warn("No route found");
        return;
      }

      const route = data.routes[0];

      // ✅ User marker
      const userEl = document.createElement("div");
      userEl.innerHTML = `<i class="fa-solid fa-street-view" style="font-size:24px;color:green;"></i>`;
      new mapboxgl.Marker(userEl)
        .setLngLat(userCoords)
        .setPopup(new mapboxgl.Popup().setText("You"))
        .addTo(map);

      // ✅ Bike/Shop marker
      if (!bikeMarkerRef.current) {
        const shopEl = document.createElement("div");
        shopEl.innerHTML =
          type === "live"
            ? `<i class="fa-solid fa-person-biking" style="font-size:24px;color:red;"></i>`
            : `<i class="fa-solid fa-shop" style="font-size:24px;color:red;"></i>`;

        bikeMarkerRef.current = new mapboxgl.Marker(shopEl)
          .setLngLat(shopCoords)
          .setPopup(new mapboxgl.Popup().setText("Shop"))
          .addTo(map);
      } else {
        // Smoothly move existing marker
        const prevCoords = bikeMarkerRef.current.getLngLat().toArray();
        animateMarker(bikeMarkerRef.current, prevCoords, shopCoords);
      }

      // ✅ Remove old route
      if (map.getSource("route")) {
        map.removeLayer("route");
        map.removeSource("route");
      }

      // ✅ Add new route
      map.addSource("route", {
        type: "geojson",
        data: { type: "Feature", geometry: route.geometry },
      });

      map.addLayer({
        id: "route",
        type: "line",
        source: "route",
        layout: { "line-join": "round", "line-cap": "round" },
        paint: { "line-color": "#1DA1F2", "line-width": 4 },
      });

      // ✅ Fit map to route
      const coords = route.geometry.coordinates;
      const bounds = coords.reduce(
        (b, coord) => b.extend(coord),
        new mapboxgl.LngLatBounds(coords[0], coords[0])
      );
      map.fitBounds(bounds, { padding: 50 });

      // ✅ Send distance & duration back to parent
      if (onRouteInfo) {
        onRouteInfo({
          distance: (route.distance / 1000).toFixed(2), // km
          duration: (route.duration / 60).toFixed(0), // minutes
        });
      }
    } catch (err) {
      console.error("Error fetching route:", err);
    }
  }

  useEffect(() => {
    if (!mapContainerRef.current) return;
    const map = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: "mapbox://styles/mapbox/streets-v11",
      center: userCoords && userCoords.length === 2 ? userCoords : [73.0473, 33.6983],
      zoom: 12,
    });

    map.addControl(new mapboxgl.NavigationControl());
    mapRef.current = map;

    return () => map.remove();
  }, []);

  useEffect(() => {
    if (mapRef.current && userCoords && shopCoords) {
      if (!mapRef.current.loaded()) {
        mapRef.current.once("load", () => {
          showRouteOnMap(mapRef.current, userCoords, shopCoords);
        });
      } else {
        showRouteOnMap(mapRef.current, userCoords, shopCoords);
      }
    }
  }, [userCoords, shopCoords]);

  return <iframe ref={mapContainerRef} style={{ width: "100%", height: "650px" }} loading="lazy"/>;
}
