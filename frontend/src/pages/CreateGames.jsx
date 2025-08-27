import { useState } from "react";
import axios from "axios";
import { useAuth, useUser } from "@clerk/clerk-react";

export default function CreateGames() {
  const { getToken } = useAuth();
  const { user } = useUser();

  const [formData, setFormData] = useState({
    sport: "",
    time: "",
    maxPlayers: "",
    location: "",
  });

  const [suggestions, setSuggestions] = useState([]); // API results
  const [loading, setLoading] = useState(false);
  const [selectedApiLocation, setSelectedApiLocation] = useState(null); // Stores lat/lon if selected

  // Handle form input changes
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Fetch location suggestions from Nominatim
  const fetchLocations = async (query) => {
    if (query.length < 3) {
      setSuggestions([]);
      return;
    }

    setLoading(true);
    try {
      const response = await axios.get("https://nominatim.openstreetmap.org/search", {
        params: {
          q: query,
          format: "json",
          limit: 5,
        },
      });
      setSuggestions(response.data);
    } catch (error) {
      console.error("Error fetching location suggestions:", error);
    } finally {
      setLoading(false);
    }
  };

  // Handle location input
  const handleLocationChange = (e) => {
    const value = e.target.value;
    setFormData({ ...formData, location: value });
    setSelectedApiLocation(null); // Reset if user types manually
    fetchLocations(value);
  };

  // When user selects a suggested location
  const selectLocation = (item) => {
    setFormData({ ...formData, location: item.display_name });
    setSelectedApiLocation({
      name: item.display_name,
      latitude: parseFloat(item.lat),
      longitude: parseFloat(item.lon),
    });
    setSuggestions([]);
  };

  // Submit the form
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = await getToken();

      // Build payload according to backend requirements
      let payload = {
        sport: formData.sport,
        time: formData.time,
        maxPlayers: formData.maxPlayers,
        creatorEmail: user.primaryEmailAddress.emailAddress,
      };

      if (selectedApiLocation) {
        payload.apiLocation = selectedApiLocation;
      } else {
        payload.manualLocation = formData.location;
      }

      await axios.post("http://localhost:8080/creategame", payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      alert("Game created successfully!");
      setFormData({ sport: "", time: "", maxPlayers: "", location: "" });
      setSelectedApiLocation(null);
      setSuggestions([]);
    } catch (error) {
      console.error("Error creating game:", error.response?.data || error.message);
      alert("Failed to create game. Check console for details.");
    }
  };

  return (
    <div className="p-4 max-w-md mx-auto bg-gray-900 text-white rounded-lg">
      <h2 className="text-xl font-bold mb-4">Create a Game</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Sport */}
        <input
          type="text"
          name="sport"
          placeholder="Sport"
          value={formData.sport}
          onChange={handleChange}
          className="w-full p-2 rounded bg-gray-800"
          required
        />

        {/* Time */}
        <input
          type="datetime-local"
          name="time"
          value={formData.time}
          onChange={handleChange}
          className="w-full p-2 rounded bg-gray-800"
          required
        />

        {/* Max Players */}
        <input
          type="number"
          name="maxPlayers"
          placeholder="Max Players"
          value={formData.maxPlayers}
          onChange={handleChange}
          className="w-full p-2 rounded bg-gray-800"
          required
        />

        {/* Location Input */}
        <div className="relative">
          <input
            type="text"
            name="location"
            placeholder="Enter location (manual or pick suggestion)"
            value={formData.location}
            onChange={handleLocationChange}
            className="w-full p-2 rounded bg-gray-800"
            required
          />

          {loading && (
            <p className="text-gray-400 text-sm mt-1">Fetching suggestions...</p>
          )}

          {suggestions.length > 0 && (
            <ul className="absolute bg-gray-700 rounded mt-1 w-full z-10">
              {suggestions.map((item) => (
                <li
                  key={item.place_id}
                  onClick={() => selectLocation(item)}
                  className="p-2 hover:bg-gray-600 cursor-pointer"
                >
                  {item.display_name}
                </li>
              ))}
            </ul>
          )}
        </div>

        <button
          type="submit"
          className="w-full p-2 bg-green-600 rounded hover:bg-green-500"
        >
          Create Game
        </button>
      </form>
    </div>
  );
}
