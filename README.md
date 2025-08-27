Game Connect 

Game Connect is a simple web application that helps players find and join sports games near them. It allows users to create games, join or leave existing games, and view nearby games based on their location.

This project was built for learning full-stack development and solving a real-world problem my friends and I often faced: finding people to play sports with.

Features

Create a Game – Users can create a game by specifying the sport, location, date & time, and maximum players.

Join or Leave a Game – Users can join games that interest them or leave if they change their mind.

Nearby Games – The app displays games within 25 km of the user’s current location.

Player Count – Shows the number of players joined versus maximum players for each game.

Responsive UI – Clean and simple interface built with React and Tailwind CSS.

Tech Stack

Frontend: React, Tailwind CSS

Backend: Node.js, Express.js

Database: MongoDB (local)

Authentication: Clerk Auth

API: Nominatim OpenStreetMap (for location suggestions)

Installation

Clone the repository:

git clone https://github.com/byte-padmanabhan/game-connect.git
cd game-connect


Install dependencies:

# For frontend
cd client
npm install

# For backend
cd ../server
npm install


Create a .env file in the server folder:

MONGO_URI=your_mongo_connection_string
CLERK_API_KEY=your_clerk_api_key


Run the project:

# Start backend
cd server
npm run dev

# Start frontend
cd ../client
npm start

Usage

Open the app in your browser.

Sign up or log in using Clerk.

Create a game or join nearby games.

View player counts and leave games if needed.

Notes

Currently, the project uses a local MongoDB database. Hosting would require a cloud MongoDB service (like MongoDB Atlas).

Location suggestions are powered by OpenStreetMap Nominatim API.

Designed primarily as a learning and portfolio project.

Future Improvements

Host backend on a cloud platform (Heroku/Vercel) with MongoDB Atlas.

Add real-time updates for game availability using WebSockets.

Improve UI/UX and add notifications when players join/leave.

License

This project is for personal and educational use.
