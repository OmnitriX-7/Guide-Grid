"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { MapPin, Navigation, Search, AlertCircle } from "lucide-react";

export default function Home() {
  const router = useRouter();
  const [loadingLoc, setLoadingLoc] = useState(false);

  // Form State
  const [locationName, setLocationName] = useState("");
  const [coords, setCoords] = useState({ lat: "", lng: "" });
  const [type, setType] = useState("all");
  const [radius, setRadius] = useState(5);

  // FIX 1: Inline error states instead of alert()
  const [locationError, setLocationError] = useState("");
  const [searchError, setSearchError] = useState("");

  // Geolocation API to get exact coordinates
  const handleGetLocation = () => {
    setLoadingLoc(true);
    setLocationError(""); // Clear previous error on retry

    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCoords({
            lat: position.coords.latitude.toString(),
            lng: position.coords.longitude.toString(),
          });
          setLocationName("Location Acquired (GPS)");
          setLocationError(""); // Clear error on success
          setLoadingLoc(false);
        },
        (error) => {
          console.error("Error getting location:", error);
          // FIX 1: Show inline error instead of alert()
          setLocationError("Could not get location. Please allow location access and try again.");
          setLoadingLoc(false);
        }
      );
    } else {
      // FIX 1: Show inline error instead of alert()
      setLocationError("Geolocation is not supported by your browser.");
      setLoadingLoc(false);
    }
  };

  // Submit handler sends data via URL parameters to the results page
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchError(""); // Clear previous search error

    if (!coords.lat || !coords.lng) {
      // FIX 1: Show inline error instead of alert()
      setSearchError("Please get your location first before searching.");
      return;
    }

    router.push(
      `/results?lat=${coords.lat}&lng=${coords.lng}&radius=${radius}&type=${type}`
    );
  };

  return (
    <main className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-lg p-6 border border-gray-100">

        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Find Nearby Centres</h1>
          <p className="text-sm text-gray-500">Discover top-rated coaching near you.</p>
        </div>

        <form onSubmit={handleSearch} className="space-y-6">

          {/* Location Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Your Location <span className="text-red-500">*</span>
            </label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <MapPin className="h-4 w-4 text-gray-400" />
                </div>
                <input
                  type="text"
                  readOnly
                  placeholder="Click target icon to get your location ->"
                  value={locationName}
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-sm focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <button
                type="button"
                onClick={handleGetLocation}
                disabled={loadingLoc}
                className="px-3 py-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition disabled:opacity-50 flex items-center justify-center"
                title="Get my location"
              >
                <Navigation className={`h-5 w-5 ${loadingLoc ? "animate-pulse" : ""}`} />
              </button>
            </div>

            {/* FIX 1: Inline location error message */}
            {locationError && (
              <p className="mt-1.5 text-xs text-red-500 flex items-center gap-1">
                <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                {locationError}
              </p>
            )}

            {/* Show success state */}
            {coords.lat && !locationError && (
              <p className="mt-1.5 text-xs text-green-600 font-medium">✓ Location acquired successfully</p>
            )}
          </div>

          {/* Coaching Type Dropdown */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Coaching Type <span className="text-red-500">*</span>
            </label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="block w-full py-2 px-3 border border-gray-300 bg-white rounded-lg text-sm focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Categories</option>
              <option value="academic">Academic & Exams</option>
              <option value="sports">Sports & Fitness</option>
              <option value="music">Music</option>
              <option value="dance">Dance</option>
              <option value="arts">Arts</option>
            </select>
          </div>

          {/* Radius Slider */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="block text-sm font-medium text-gray-700">
                Search Radius
              </label>
              <span className="text-sm text-blue-600 font-medium">{radius} km</span>
            </div>
            <input
              type="range"
              min="1"
              max="50"
              value={radius}
              onChange={(e) => setRadius(Number(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
            />
            <div className="flex justify-between text-xs text-gray-400 mt-1">
              <span>1 km</span>
              <span>50 km</span>
            </div>
          </div>

          {/* FIX 1: Inline search validation error */}
          {searchError && (
            <p className="text-sm text-red-500 flex items-center gap-1">
              <AlertCircle className="h-4 w-4 shrink-0" />
              {searchError}
            </p>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full flex justify-center items-center gap-2 bg-blue-600 text-white py-2.5 px-4 rounded-lg font-medium hover:bg-blue-700 transition"
          >
            <Search className="h-4 w-4" />
            Search Now
          </button>
        </form>

      </div>
    </main>
  );
}