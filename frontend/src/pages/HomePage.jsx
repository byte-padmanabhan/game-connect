import { SignedIn, SignedOut, UserButton, SignInButton, useAuth, useUser } from "@clerk/clerk-react";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";

export default function HomePage() {
  const [nearbyGames, setNearbyGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  const { getToken } = useAuth();
  const { user } = useUser();

  // ✅ Fetch nearby games
  const fetchNearbyGames = async (latitude, longitude) => {
    try {
      const token = await getToken();

      const response = await axios.get(
        `http://localhost:8080/games/nearby?lat=${latitude}&lon=${longitude}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      let data = response.data;
      if (!Array.isArray(data)) data = [];

      setNearbyGames(data);
    } catch (error) {
      console.error("Error fetching nearby games:", error);
      setErrorMsg("Failed to fetch nearby games.");
      setNearbyGames([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!navigator.geolocation) {
      setErrorMsg("Geolocation is not supported by your browser.");
      setLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        fetchNearbyGames(latitude, longitude);
      },
      (error) => {
        console.error("Error getting location:", error);
        setErrorMsg("Could not retrieve your location.");
        setLoading(false);
      }
    );
  }, []);

  // ✅ Join a game
  const handleJoin = async (gameId) => {
    try {
      const token = await getToken();
      await axios.post(
        `http://localhost:8080/join/${gameId}`,
        { userId: user.id }, // ✅ Send userId in body
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert("Joined game successfully!");
      // Refresh list after joining
      navigator.geolocation.getCurrentPosition(({ coords }) =>
        fetchNearbyGames(coords.latitude, coords.longitude)
      );
    } catch (error) {
      console.error("Error joining game:", error.response?.data || error.message);
      alert(error.response?.data?.error || "Failed to join game.");
    }
  };

  // ✅ Leave a game
  const handleLeave = async (gameId) => {
    try {
      const token = await getToken();
      await axios.post(
        `http://localhost:8080/leave/${gameId}`,
        { userId: user.id }, // ✅ Send userId in body
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert("You left the game.");
      // Refresh list after leaving
      navigator.geolocation.getCurrentPosition(({ coords }) =>
        fetchNearbyGames(coords.latitude, coords.longitude)
      );
    } catch (error) {
      console.error("Error leaving game:", error.response?.data || error.message);
      alert(error.response?.data?.error || "Failed to leave game.");
    }
  };

  return (
    <div className="min-h-screen w-full bg-black relative flex flex-col text-white">
      <div className="relative z-10 flex flex-col min-h-screen">
        {/* Main Content */}
        <main className="flex-1 flex flex-col items-center justify-center text-center py-16 px-6">
          <h1 className="text-3xl font-bold mb-4">Welcome to the Sports Community App 🏆</h1>
          <p className="max-w-2xl mb-6">
            Find players near you, share your interests, and connect with others who love the same sports. Start by creating your profile and exploring your community!
          </p>

          <div className="flex space-x-6 mb-10">
            <Link
              to="/creategame"
              className="bg-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700"
            >
              Create a Game
            </Link>
            <Link
              to="/joingame"
              className="bg-purple-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-purple-700"
            >
              Join Ongoing Games
            </Link>
          </div>

          <div className="w-full max-w-2xl">
            <h2 className="text-2xl font-bold mb-4">Games Near You (within 25 km)</h2>
            {loading ? (
              <p>Loading games...</p>
            ) : errorMsg ? (
              <p className="text-red-400">{errorMsg}</p>
            ) : nearbyGames.length > 0 ? (
              <ul className="space-y-4">
                {nearbyGames.slice(0, 5).map((game) => {
                  const isJoined = game.players.includes(user.id);
                  return (
                    <li
                      key={game._id}
                      className="bg-white text-gray-800 shadow p-4 rounded-lg flex justify-between items-center"
                    >
                      <div>
                        <p className="font-semibold">{game.sport}</p>
                        <p>{game.manualLocation || game.apiLocation?.name || "Unknown location"}</p>
                        {typeof game.distance === "number" && (
                          <p className="text-sm text-gray-500">
                            Distance: {game.distance.toFixed(2)} km
                          </p>
                        )}
                        <p className="text-sm text-gray-700">
                          Players: {game.players.length}/{game.maxPlayers}
                        </p>
                      </div>
                      <div className="flex space-x-2">
                        {isJoined ? (
                          <button
                            onClick={() => handleLeave(game._id)}
                            className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
                          >
                            Leave
                          </button>
                        ) : (
                          <button
                            onClick={() => handleJoin(game._id)}
                            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                          >
                            Join
                          </button>
                        )}
                      </div>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <p>No games found within 25 km.</p>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
