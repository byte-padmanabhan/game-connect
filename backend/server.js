const express = require("express");
const mongoose = require("mongoose");

require("dotenv").config();
const { clerkMiddleware, requireAuth, getAuth } = require("@clerk/express");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

// Clerk authentication
app.use(clerkMiddleware()); // Attaches auth info to req

mongoose.connect(
  "mongodb://localhost:27017/user1data",
  { useNewUrlParser: true, useUnifiedTopology: true }
)
.then(() => console.log("MongoDB connected"))
.catch(err => console.error("DB connection error:", err));

const userSchema = new mongoose.Schema({
  clerkId: { type: String, required: true, unique: true },
  name: String,
  location: String,
  interest: String,
  level: String,
  description: String
});
const User1 = mongoose.model("User1", userSchema);

//another schema

const gameSchema = new mongoose.Schema({
  creatorId: { type: String, required: true },
  creatorEmail: { type: String, required: true },

  // API-selected location
  apiLocation: {
    name: String,
    latitude: Number,
    longitude: Number
  },

  // Manual location as plain text
  manualLocation: { type: String },

  sport: { type: String, required: true },
  time: { type: Date, required: true },
  maxPlayers: { type: Number, required: true },
  players: [{ type: String }], // Clerk user IDs
  status: { type: String, enum: ["open", "full"], default: "open" }
});


const Game = mongoose.model("Game", gameSchema);



// Protect profile route
app.post("/profile", requireAuth(), async (req, res) => {
  try {
    const { name, location, interest, level, description } = req.body;
    const { userId } = getAuth(req);

    let existing = await User1.findOne({ clerkId: userId });
    if (existing) {
      Object.assign(existing, { name, location, interest, level, description });
      await existing.save();
      console.log("updated in your server");
      return res.json(existing);
      
      
    }

    const newUser = new User1({ clerkId: userId, name, location, interest, level, description });
    await newUser.save();
    console.log("created a profile in your server");
    res.json(newUser);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

    // Create new game
   app.post("/creategame", requireAuth(), async (req, res) => {
  try {
    const { userId } = getAuth(req);
    const {
      sport,
      time,
      maxPlayers,
      creatorEmail,
      apiLocation,
      manualLocation
    } = req.body;

    // Validation
    if (!sport || !time || !maxPlayers || !creatorEmail) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // Ensure at least one location is provided
    const hasApiLocation =
      apiLocation && apiLocation.latitude != null && apiLocation.longitude != null;
    const hasManualLocation = manualLocation && manualLocation.trim() !== "";

    if (!hasApiLocation && !hasManualLocation) {
      return res.status(400).json({ error: "At least one location (API or Manual) is required" });
    }

    // Create new game
    const game = new Game({
      creatorId: userId,
      creatorEmail,
      apiLocation: hasApiLocation ? apiLocation : null,
      manualLocation: hasManualLocation ? manualLocation : null,
      sport,
      time,
      maxPlayers,
      players: [userId]
    });

    await game.save();
    res.status(201).json({ message: "Game created successfully", game });

  } catch (err) {
    console.error("Error creating game:", err);
    res.status(500).json({ error: "Server error: " + err.message });
  }
});



app.get("/dashboard/:userId", async (req, res) => {
  const { userId } = req.params;
  try {
    let profile = await User1.findOne({ clerkId: userId });

    // ✅ If profile doesn't exist, create an empty one
    if (!profile) {
      profile = new User1({
        clerkId: userId,
        name: "",
        location: "",
        interest: "",
        level: "",
        description: ""
      });
      await profile.save();
    }

    const games = await Game.find({ creatorId: userId });
    res.json({ profile, games });
  } catch (err) {
    console.error("Error fetching dashboard:", err);
    res.status(500).json({ error: "Server error" });
  }
});

app.get("/joingames", async (req, res) => {
  try {
    const games = await Game.find(); // Fetch all games
    res.json(games);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
//join games
app.post("/join/:gameId", async (req, res) => {
  try {
    const { gameId } = req.params;
    const { userId } = req.body;

    const game = await Game.findById(gameId);
    if (!game) return res.status(404).json({ error: "Game not found" });

    if (game.players.includes(userId)) {
      return res.status(400).json({ error: "Already joined" });
    }
    if (game.players.length >= game.maxPlayers) {
      return res.status(400).json({ error: "Game is full" });
    }

    game.players.push(userId);
    await game.save();

    res.json({ message: "Joined successfully", game });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
//leave game
app.post("/leave/:gameId", async (req, res) => {
  try {
    const { gameId } = req.params;
    const { userId } = req.body;

    const game = await Game.findById(gameId);
    if (!game) return res.status(404).json({ error: "Game not found" });

    game.players = game.players.filter(id => id !== userId);
    await game.save();

    res.json({ message: "Left the game", game });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
app.delete("/delete/:gameId", requireAuth(), async (req, res) => {
  try {
    const { gameId } = req.params;
    const { userId } = getAuth(req); // Authenticated user

    const game = await Game.findById(gameId);
    if (!game) return res.status(404).json({ error: "Game not found" });

    // Only the creator can delete the game
    if (game.creatorId !== userId) {
      return res.status(403).json({ error: "Not authorized to delete this game" });
    }

    await Game.findByIdAndDelete(gameId);

    res.json({ message: "Game deleted successfully" });
  } catch (err) {
    console.error("Error deleting game:", err);
    res.status(500).json({ error: err.message });
  }
});
// Root route to prevent 404
app.get("/", (req, res) => {
  res.send("API is running");
});

// Nearby games
// Nearby games within 25 km
app.get("/games/nearby", requireAuth(), async (req, res) => {
  try {
    const { lat, lon } = req.query;

    if (!lat || !lon) {
      return res.status(400).json({ error: "Latitude and Longitude are required" });
    }

    const userLat = parseFloat(lat);
    const userLon = parseFloat(lon);

    const games = await Game.find({});

    const R = 6371; // Radius of the Earth in km

    const gamesWithin25km = games
      .filter((game) => game.apiLocation && game.apiLocation.latitude && game.apiLocation.longitude)
      .map((game) => {
        const dLat = ((game.apiLocation.latitude - userLat) * Math.PI) / 180;
        const dLon = ((game.apiLocation.longitude - userLon) * Math.PI) / 180;

        const a =
          Math.sin(dLat / 2) ** 2 +
          Math.cos((userLat * Math.PI) / 180) *
            Math.cos((game.apiLocation.latitude * Math.PI) / 180) *
            Math.sin(dLon / 2) ** 2;

        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        const distance = R * c;

        return { ...game.toObject(), distance };
      })
      // ✅ Only keep games within 25 km
      .filter((game) => game.distance <= 25);

    // Sort by distance ascending
    gamesWithin25km.sort((a, b) => a.distance - b.distance);

    res.json(gamesWithin25km);
  } catch (error) {
    console.error("Error fetching nearby games:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});






app.listen(8080, () => console.log(`Server running on port 8080`));
