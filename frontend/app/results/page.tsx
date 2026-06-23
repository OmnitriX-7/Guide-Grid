"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import {
  MapPin, Phone, MessageCircle, ArrowLeft,
  Map as MapIcon, List, CheckCircle, Clock, AlertCircle, UserPlus
} from "lucide-react";
import EnrollModal from "@/components/EnrollModal";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

// Dynamically import the map with SSR disabled.
// Leaflet uses browser-only APIs (window, document) so it cannot run on the server.
const CentresMap = dynamic(() => import("@/components/CentresMap"), {
  ssr: false,
  loading: () => (
    <div className="h-[600px] bg-gray-100 rounded-2xl flex items-center justify-center animate-pulse">
      <p className="text-gray-500">Loading map...</p>
    </div>
  ),
});

// Centre type now includes lat/lng so we can place map markers
interface Centre {
  id: string;
  name: string;
  type: string;
  address: string;
  phone_number: string;
  fee_range: string;
  batch_timings: string;
  distance_km: number;
  verified: boolean;
  lat: number;
  lng: number;
}

function ResultsPageInner() {
  const searchParams = useSearchParams();
  const router = useRouter();

  // Parse the user's coordinates from URL params
  const userLat = parseFloat(searchParams.get("lat") || "0");
  const userLng = parseFloat(searchParams.get("lng") || "0");

  const [results, setResults] = useState<Centre[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(false);
  const [view, setView] = useState<"list" | "map">("list");
  const [enrollTarget, setEnrollTarget] = useState<{ id: string; name: string } | null>(null);

  useEffect(() => {
    const fetchResults = async () => {
      if (!userLat || !userLng) return;

      try {
        const response = await fetch(`${API_URL}/api/search`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            lat: userLat,
            lng: userLng,
            radius_km: parseFloat(searchParams.get("radius") || "5"),
            type: searchParams.get("type"),
          }),
        });

        if (!response.ok) throw new Error(`Server error ${response.status}`);

        const data = await response.json();
        if (data.success) setResults(data.data);
        else setFetchError(true);
      } catch {
        setFetchError(true);
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [searchParams]);

  return (
    <main className="min-h-screen bg-gray-50 pb-10">

      {enrollTarget && (
        <EnrollModal
          centreId={enrollTarget.id}
          centreName={enrollTarget.name}
          onClose={() => setEnrollTarget(null)}
        />
      )}

      <header className="bg-white border-b border-gray-200 sticky top-0 z-10 px-4 py-3 flex items-center justify-between">
        <button
          onClick={() => router.push("/")}
          className="text-gray-600 flex items-center gap-2 hover:text-blue-600 transition"
        >
          <ArrowLeft className="h-5 w-5" /> Back
        </button>
        <div className="flex bg-gray-100 rounded-lg p-1">
          <button
            onClick={() => setView("list")}
            className={`flex items-center gap-1 px-3 py-1.5 text-sm rounded-md transition ${view === "list" ? "bg-white shadow-sm font-medium" : "text-gray-500"}`}
          >
            <List className="h-4 w-4" /> List
          </button>
          <button
            onClick={() => setView("map")}
            className={`flex items-center gap-1 px-3 py-1.5 text-sm rounded-md transition ${view === "map" ? "bg-white shadow-sm font-medium" : "text-gray-500"}`}
          >
            <MapIcon className="h-4 w-4" /> Map
          </button>
        </div>
      </header>

      <div className="max-w-3xl mx-auto mt-6 px-4">
        {loading ? (
          <div className="text-center text-gray-500 mt-20 animate-pulse">
            Searching for nearby centres...
          </div>

        ) : fetchError ? (
          <div className="text-center mt-20 bg-white p-8 rounded-2xl border border-red-100 shadow-sm">
            <AlertCircle className="h-10 w-10 text-red-400 mx-auto mb-3" />
            <h2 className="text-xl font-bold text-gray-800 mb-2">Something went wrong</h2>
            <p className="text-gray-500 mb-6">Could not connect to the server. Please try again.</p>
            <button onClick={() => router.push("/")} className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700">
              Go Back
            </button>
          </div>

        ) : results.length === 0 ? (
          <div className="text-center mt-20 bg-white p-8 rounded-2xl border border-gray-200 shadow-sm">
            <h2 className="text-xl font-bold text-gray-800 mb-2">No centres found!</h2>
            <p className="text-gray-500 mb-6">Try increasing your search radius or changing the category.</p>
            <button onClick={() => router.push("/")} className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700">
              Go Back
            </button>
          </div>

        ) : view === "map" ? (
          // Real map — replaces the "coming soon" placeholder
          <CentresMap
            userLat={userLat}
            userLng={userLng}
            centres={results}
          />

        ) : (
          <div className="space-y-4">
            <p className="text-sm font-medium text-gray-500 mb-4">
              Found {results.length} centres near you
            </p>

            {results.map((centre) => (
              <div
                key={centre.id}
                onClick={() => router.push(`/centre/${centre.id}`)}
                className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition cursor-pointer"
              >
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                      {centre.name}
                      {centre.verified && (
                        <span title="Verified">
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        </span>
                      )}
                    </h3>
                    <p className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                      <MapPin className="h-3.5 w-3.5" />
                      {centre.address} •{" "}
                      <span className="font-semibold text-blue-600">
                        {centre.distance_km.toFixed(1)} km away
                      </span>
                    </p>
                  </div>
                  <span className="bg-blue-50 text-blue-700 text-xs font-semibold px-2.5 py-1 rounded-full uppercase tracking-wider">
                    {centre.type}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-4 my-4 bg-gray-50 p-3 rounded-lg border border-gray-100">
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Monthly Fee</p>
                    <p className="text-sm font-medium text-gray-800">{centre.fee_range}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1 flex items-center gap-1">
                      <Clock className="h-3 w-3" /> Batch Timings
                    </p>
                    <p className="text-sm font-medium text-gray-800">{centre.batch_timings}</p>
                  </div>
                </div>

                <div className="flex gap-2 mt-4">
                  <a
                    href={`tel:${centre.phone_number}`}
                    onClick={(e) => e.stopPropagation()}
                    className="flex-1 flex justify-center items-center gap-1.5 bg-gray-900 text-white py-2 rounded-lg text-sm font-medium hover:bg-gray-800 transition"
                  >
                    <Phone className="h-4 w-4" /> Call
                  </a>
                  <a
                    href={`https://wa.me/91${centre.phone_number}`}
                    target="_blank"
                    rel="noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="flex-1 flex justify-center items-center gap-1.5 bg-green-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-green-700 transition"
                  >
                    <MessageCircle className="h-4 w-4" /> WhatsApp
                  </a>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setEnrollTarget({ id: centre.id, name: centre.name });
                    }}
                    className="flex-1 flex justify-center items-center gap-1.5 bg-blue-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition"
                  >
                    <UserPlus className="h-4 w-4" /> Enroll
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}

export default function ResultsPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center text-gray-500 animate-pulse">
          Loading results...
        </div>
      }
    >
      <ResultsPageInner />
    </Suspense>
  );
}