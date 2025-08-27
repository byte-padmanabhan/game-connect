// src/components/Navbar.jsx
import { SignedIn, SignedOut, UserButton, SignInButton } from "@clerk/clerk-react";
import { Link } from "react-router-dom";

export default function Navbar() {
  return (
    <nav className="bg-green/80 shadow-md px-6 py-4 flex justify-between items-center">
      <div className="text-xl font-bold text-blue-100">Juengo App</div>
      <div className="flex space-x-6 items-center">
        <Link to="/" className="hover:text-blue-200 font-medium">Home</Link>
        <Link to="/dashboard" className="hover:text-blue-200 font-medium">View Profile</Link>
        <SignedIn>
          <UserButton afterSignOutUrl="/" />
        </SignedIn>
        <SignedOut>
          <SignInButton mode="modal">
            <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">Sign In</button>
          </SignInButton>
        </SignedOut>
      </div>
    </nav>
  );
}
