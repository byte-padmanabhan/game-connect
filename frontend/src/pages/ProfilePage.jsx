import { useState } from "react";
import axios from "axios";
import { useAuth } from "@clerk/clerk-react";
import { useNavigate } from "react-router-dom"; // ✅ Import useNavigate

export default function ProfilePage() {
  const { getToken } = useAuth();
  const navigate = useNavigate(); // ✅ Initialize navigate
  const [formData, setFormData] = useState({
    name: "",
    location: "",
    interest: "",
    level: "",
    description: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const token = await getToken();

      const response = await axios.post(
        "http://localhost:8080/profile",
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`, // attach token
          },
        }
      );

      console.log("Server response:", response.data);
      alert("Profile submitted successfully!");

      navigate("/"); // ✅ Redirect to Home Page
    } catch (error) {
      console.error("Error submitting profile:", error);
      alert("Error submitting profile. Please try again.");
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100 px-4">
      <form
        onSubmit={handleSubmit}
        className="bg-white shadow-lg rounded-2xl p-8 w-full max-w-lg"
      >
        <h2 className="text-2xl font-bold text-center mb-6 text-gray-800">
          Complete Your Profile
        </h2>

        {/* Name */}
        <div className="mb-4">
          <label className="block text-gray-700 mb-2">Name</label>
          <input
            type="text"
            name="name"
            placeholder="Enter your name"
            value={formData.name}
            onChange={handleChange}
            className="w-full px-4 py-2 border rounded-lg focus:ring focus:ring-blue-300"
            required
          />
        </div>

        {/* Location */}
        <div className="mb-4">
          <label className="block text-gray-700 mb-2">Location</label>
          <input
            type="text"
            name="location"
            placeholder="Enter your city"
            value={formData.location}
            onChange={handleChange}
            className="w-full px-4 py-2 border rounded-lg focus:ring focus:ring-blue-300"
            required
          />
        </div>

        {/* Interest */}
        <div className="mb-4">
          <label className="block text-gray-700 mb-2">Interest</label>
          <input
            type="text"
            name="interest"
            placeholder="e.g., Football, Cricket"
            value={formData.interest}
            onChange={handleChange}
            className="w-full px-4 py-2 border rounded-lg focus:ring focus:ring-blue-300"
            required
          />
        </div>

        {/* Level */}
        <div className="mb-4">
          <label className="block text-gray-700 mb-2">Skill Level</label>
          <select
            name="level"
            value={formData.level}
            onChange={handleChange}
            className="w-full px-4 py-2 border rounded-lg focus:ring focus:ring-blue-300"
            required
          >
            <option value="">Select your level</option>
            <option value="beginner">Beginner</option>
            <option value="intermediate">Intermediate</option>
            <option value="advanced">Advanced</option>
          </select>
        </div>

        {/* Description */}
        <div className="mb-6">
          <label className="block text-gray-700 mb-2">Description</label>
          <textarea
            name="description"
            placeholder="Tell us about yourself..."
            value={formData.description}
            onChange={handleChange}
            className="w-full px-4 py-2 border rounded-lg focus:ring focus:ring-blue-300"
            rows="4"
            required
          />
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition"
        >
          Submit Profile
        </button>
      </form>
    </div>
  );
}
