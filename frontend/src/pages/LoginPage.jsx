import { useState, useEffect } from "react";

export default function LoginPage() {
  const [userLocation, setUserLocation] = useState({ lat: null, lng: null });
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [selectedPlace, setSelectedPlace] = useState(null);

  // Step 1: Get user location
  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
      },
      (error) => {
        console.error("Error getting location:", error);
      }
    );
  }, []);

  // Step 2: Search places using OpenStreetMap/Nominatim
  const handleSearch = async () => {
    if (!query) return;
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(
          query
        )}&format=json&limit=5`
      );
      const data = await response.json();
      setResults(data);
    } catch (error) {
      console.error("Error fetching places:", error);
    }
  };

  // Step 3: Select a place and calculate distance
  const handleSelect = (place) => {
    setSelectedPlace(place);
    setResults([]);
    setQuery(place.display_name);
  };

  // Calculate distance between two coordinates
  const getDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // km
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) ** 2;
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return (R * c).toFixed(2);
  };

  return (
    <div style={{ padding: "20px" }}>
      <h1>Location Search</h1>
      <input
        type="text"
        value={query}
        placeholder="Search places..."
        onChange={(e) => setQuery(e.target.value)}
        style={{ padding: "10px", width: "300px" }}
      />
      <button onClick={handleSearch} style={{ marginLeft: "10px", padding: "10px" }}>
        Search
      </button>

      <div style={{ marginTop: "10px" }}>
        {results.map((place) => (
          <div
            key={place.place_id}
            onClick={() => handleSelect(place)}
            style={{
              cursor: "pointer",
              padding: "5px",
              borderBottom: "1px solid #ccc",
            }}
          >
            {place.display_name}
          </div>
        ))}
      </div>

      {selectedPlace && (
        <div style={{ marginTop: "20px" }}>
          <h3>Selected Place:</h3>
          <p>Name: {selectedPlace.display_name}</p>
          <p>Latitude: {selectedPlace.lat}</p>
          <p>Longitude: {selectedPlace.lon}</p>
          {userLocation.lat && (
            <p>
              Distance from you:{" "}
              {getDistance(
                userLocation.lat,
                userLocation.lng,
                selectedPlace.lat,
                selectedPlace.lon
              )}{" "}
              km
            </p>
          )}
        </div>
      )}
    </div>
  );
}
