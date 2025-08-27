import { useUser } from "@clerk/clerk-react";
import { useEffect, useState } from "react";
import { useAuth } from "@clerk/clerk-react";
import axios from "axios";

export default function Dashboard() {
  const { getToken } = useAuth();
  const { user } = useUser();
  const [profile, setProfile] = useState(null);
  const [games, setGames] = useState([]);

  useEffect(() => {
    if (user) {
      const userId = user.id;
      axios.get(`http://localhost:8080/dashboard/${userId}`)
        .then((res) => {
          setProfile(res.data.profile);
          setGames(res.data.games);
        })
        .catch((err) => console.error(err));
    }
  }, [user]);

  const handleDelete = async (gameId) => {
    try {
      const token = await getToken();
      await axios.delete(`http://localhost:8080/delete/${gameId}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setGames(prev => prev.filter(game => game._id !== gameId));
    } catch (err) {
      console.error("Error deleting game:", err.response?.data || err);
    }
  };

  if (!user) return <p className="text-center text-gray-400 mt-10">Loading...</p>;

  return (
    <div className="max-w-4xl mx-auto mt-8 px-4">
      {/* Page Title */}
      <h2 className="text-3xl font-bold mb-6 text-blue-400 text-center">
        These are the games you created, {user.firstName}!
      </h2>

      {/* Profile Card */}
      {profile && (
        <div className="p-6 mb-8 bg-gray-900 text-gray-200 rounded-xl shadow-lg">
          <h3 className="text-xl font-semibold mb-4 text-blue-300">Your Profile</h3>
          <div className="space-y-2">
            <p><span className="font-semibold text-blue-400">Name:</span> {profile.name}</p>
            <p><span className="font-semibold text-blue-400">Location:</span> {profile.location}</p>
            <p><span className="font-semibold text-blue-400">Interest:</span> {profile.interest}</p>
            <p><span className="font-semibold text-blue-400">Level:</span> {profile.level}</p>
            <p><span className="font-semibold text-blue-400">Description:</span> {profile.description}</p>
          </div>
        </div>
      )}

      {/* Games List */}
      <h3 className="text-2xl font-semibold mb-4 text-green-400">Your Created Games</h3>
      {games.length > 0 ? (
        <div className="space-y-4">
          {games.map((game) => (
            <div
              key={game._id}
              className="p-6 bg-gray-800 text-gray-100 rounded-lg shadow-md hover:shadow-lg transition"
            >
              <p><span className="font-semibold text-green-400">Sport:</span> {game.sport}</p>
              <p><span className="font-semibold text-green-400">Location:</span> {game.location}</p>
              <p><span className="font-semibold text-green-400">Time:</span> {new Date(game.time).toLocaleString()}</p>
              <p><span className="font-semibold text-green-400">Players:</span> {game.players.length}/{game.maxPlayers}</p>
              <button
                onClick={() => handleDelete(game._id)}
                className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
              >
                Delete Game
              </button>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-gray-400 text-lg">You haven't created any games yet.</p>
      )}
    </div>
  );
}
