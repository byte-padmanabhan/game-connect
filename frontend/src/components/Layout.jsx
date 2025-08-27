// src/components/Layout.jsx
import Navbar from "./Navbar";

export default function Layout({ children }) {
  return (
    <div className="min-h-screen w-full bg-black text-white flex flex-col">
      <Navbar />
      <main className="flex-1">{children}</main>
    </div>
  );
}
