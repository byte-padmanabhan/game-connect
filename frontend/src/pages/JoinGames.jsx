import { useEffect, useState } from "react";
import axios from "axios";
import { useUser } from "@clerk/clerk-react";

export default function JoinGames() {
  const { user } = useUser();
  const userId = user?.id;

  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");

  const fetchGames = async () => {
    try {
      setLoading(true);
      const res = await axios.get("http://localhost:8080/joingames");
      setGames(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Error fetching games:", err);
      setErrorMsg("Failed to load games.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userId) fetchGames();
  }, [userId]);

  const handleJoin = async (gameId) => {
    try {
      await axios.post(`http://localhost:8080/join/${gameId}`, { userId });
      fetchGames();
    } catch (err) {
      console.error("Error joining game:", err);
    }
  };

  const handleLeave = async (gameId) => {
    try {
      await axios.post(`http://localhost:8080/leave/${gameId}`, { userId });
      fetchGames();
    } catch (err) {
      console.error("Error leaving game:", err);
    }
  };

  return (
    <div className="max-w-4xl mx-auto mt-8 px-4">
      <h2 className="text-3xl font-bold mb-6 text-green-400 text-center">
        Available Games
      </h2>

      {loading ? (
        <p className="text-gray-400 text-center">Loading games...</p>
      ) : errorMsg ? (
        <p className="text-red-500 text-center">{errorMsg}</p>
      ) : games.length === 0 ? (
        <p className="text-gray-400 text-center">No games available right now.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {games.map((game) => (
            <div
              key={game._id}
              className="p-6 bg-gray-900 text-gray-200 rounded-xl shadow-md hover:shadow-xl transition"
            >
              <h3 className="text-xl font-semibold text-green-400 mb-3">
                {game.sport}
              </h3>
              <div className="space-y-2 text-gray-300">
                <p>
                  <span className="text-green-300 font-semibold">Location:</span>{" "}
                  {game.manualLocation || game.apiLocation?.name || "Unknown"}
                </p>
                <p>
                  <span className="text-green-300 font-semibold">Time:</span>{" "}
                  {new Date(game.time).toLocaleString()}
                </p>
                <p>
                  <span className="text-green-300 font-semibold">Players:</span>{" "}
                  {game.players.length}/{game.maxPlayers}
                </p>
                <p>
                  <span className="text-green-300 font-semibold">Created by:</span>{" "}
                  {game.creatorEmail}
                </p>
              </div>

              <div className="mt-4 flex space-x-3">
                <button
                  onClick={() => handleJoin(game._id)}
                  disabled={game.players.includes(userId) || game.players.length >= game.maxPlayers}
                  className={`px-4 py-2 rounded-lg font-medium transition ${
                    game.players.includes(userId) || game.players.length >= game.maxPlayers
                      ? "bg-gray-600 cursor-not-allowed text-gray-300"
                      : "bg-green-500 hover:bg-green-600 text-white"
                  }`}
                >
                  Join
                </button>
                <button
                  onClick={() => handleLeave(game._id)}
                  disabled={!game.players.includes(userId)}
                  className={`px-4 py-2 rounded-lg font-medium transition ${
                    !game.players.includes(userId)
                      ? "bg-gray-600 cursor-not-allowed text-gray-300"
                      : "bg-red-500 hover:bg-red-600 text-white"
                  }`}
                >
                  Leave
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
