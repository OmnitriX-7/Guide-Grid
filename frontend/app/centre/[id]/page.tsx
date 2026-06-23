"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  MapPin, Phone, MessageCircle, ArrowLeft,
  Clock, IndianRupee, Languages, CheckCircle, Navigation, UserPlus
} from "lucide-react";
import EnrollModal from "@/components/EnrollModal";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

interface CentreDetails {
  id: string;
  name: string;
  type: string;
  address: string;
  phone_number: string;
  fee_range: string;
  batch_timings: string;
  language_medium: string;
  verified: boolean;
}

export default function CentreDetailPage() {
  const params = useParams();
  const router = useRouter();

  const [centre, setCentre] = useState<CentreDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [showEnroll, setShowEnroll] = useState(false);

  useEffect(() => {
    const fetchCentre = async () => {
      try {
        const response = await fetch(`${API_URL}/api/centre/${params.id}`);
        if (!response.ok) throw new Error(`Server error ${response.status}`);
        const data = await response.json();
        if (data.success) setCentre(data.data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    if (params.id) fetchCentre();
  }, [params.id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-500 animate-pulse">
        Loading profile...
      </div>
    );
  }

  if (!centre) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
        <h2 className="text-xl font-bold text-gray-800">Centre not found</h2>
        <button onClick={() => router.back()} className="mt-4 text-blue-600 hover:underline">
          Go Back
        </button>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 pb-10">

      {/* Enroll modal */}
      {showEnroll && (
        <EnrollModal
          centreId={centre.id}
          centreName={centre.name}
          onClose={() => setShowEnroll(false)}
        />
      )}

      <header className="bg-white border-b border-gray-200 sticky top-0 z-10 px-4 py-3">
        <button
          onClick={() => router.back()}
          className="text-gray-600 flex items-center gap-2 hover:text-blue-600 transition font-medium"
        >
          <ArrowLeft className="h-5 w-5" /> Back to Results
        </button>
      </header>

      <div className="max-w-2xl mx-auto mt-6 px-4 space-y-6">

        {/* Name, type & address */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                {centre.name}
                {centre.verified && <CheckCircle className="h-5 w-5 text-green-500" />}
              </h1>
              <span className="inline-block mt-2 bg-blue-50 text-blue-700 text-xs font-semibold px-3 py-1 rounded-full uppercase tracking-wider">
                {centre.type}
              </span>
            </div>
          </div>

          <p className="text-gray-600 flex items-start gap-2 mt-4">
            <MapPin className="h-5 w-5 text-gray-400 shrink-0 mt-0.5" />
            <span>{centre.address}</span>
          </p>

          <a
            href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(centre.address)}`}
            target="_blank"
            rel="noreferrer"
            className="mt-4 inline-flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700 font-medium transition"
          >
            <Navigation className="h-4 w-4" />
            Get Directions on Google Maps
          </a>
        </div>

        {/* Info cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex items-start gap-3">
            <div className="bg-orange-50 p-2 rounded-lg text-orange-600">
              <IndianRupee className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs text-gray-500 font-medium uppercase tracking-wider mb-1">Fee Structure</p>
              <p className="text-gray-900 font-medium">{centre.fee_range}</p>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex items-start gap-3">
            <div className="bg-blue-50 p-2 rounded-lg text-blue-600">
              <Clock className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs text-gray-500 font-medium uppercase tracking-wider mb-1">Batch Timings</p>
              <p className="text-gray-900 font-medium">{centre.batch_timings}</p>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex items-start gap-3 md:col-span-2">
            <div className="bg-purple-50 p-2 rounded-lg text-purple-600">
              <Languages className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs text-gray-500 font-medium uppercase tracking-wider mb-1">Language Medium</p>
              <p className="text-gray-900 font-medium">{centre.language_medium}</p>
            </div>
          </div>
        </div>

        {/* Action buttons — now 3 */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex flex-col sm:flex-row gap-3">
            <a
              href={`tel:${centre.phone_number}`}
              className="flex-1 flex justify-center items-center gap-2 bg-gray-900 text-white py-3 px-4 rounded-xl font-medium hover:bg-gray-800 transition"
            >
              <Phone className="h-5 w-5" /> Call Centre
            </a>
            <a
              href={`https://wa.me/91${centre.phone_number}?text=Hi! I found your centre on GuideGrid and would like to know more about your classes.`}
              target="_blank"
              rel="noreferrer"
              className="flex-1 flex justify-center items-center gap-2 bg-green-600 text-white py-3 px-4 rounded-xl font-medium hover:bg-green-700 transition"
            >
              <MessageCircle className="h-5 w-5" /> WhatsApp
            </a>
            {/* Enroll button */}
            <button
              onClick={() => setShowEnroll(true)}
              className="flex-1 flex justify-center items-center gap-2 bg-blue-600 text-white py-3 px-4 rounded-xl font-medium hover:bg-blue-700 transition"
            >
              <UserPlus className="h-5 w-5" /> Enroll Now
            </button>
          </div>
        </div>

      </div>
    </main>
  );
}