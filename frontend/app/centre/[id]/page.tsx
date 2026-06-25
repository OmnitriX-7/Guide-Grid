"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  MapPin, Phone, MessageCircle, ArrowLeft,
  Clock, IndianRupee, Languages, CheckCircle, Navigation, UserPlus, Star
} from "lucide-react";
import EnrollModal from "@/components/EnrollModal";
import ReviewModal from "@/components/ReviewModal";
import StarRating from "@/components/StarRating";

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
  avg_rating: number;
  review_count: number;
}

interface Review {
  id: string;
  reviewer_name: string;
  rating: number;
  comment: string | null;
  created_at: string;
}

export default function CentreDetailPage() {
  const params = useParams();
  const router = useRouter();

  const [centre, setCentre] = useState<CentreDetails | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [showEnroll, setShowEnroll] = useState(false);
  const [showReview, setShowReview] = useState(false);

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

  const fetchReviews = async () => {
    try {
      const response = await fetch(`${API_URL}/api/reviews/${params.id}`);
      const data = await response.json();
      if (data.success) setReviews(data.data);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    if (params.id) {
      fetchCentre();
      fetchReviews();
    }
  }, [params.id]);

  // Called after a review is submitted to refresh both centre and reviews
  const handleReviewSubmitted = () => {
    fetchCentre();
    fetchReviews();
  };

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
      {showEnroll && (
        <EnrollModal
          centreId={centre.id}
          centreName={centre.name}
          onClose={() => setShowEnroll(false)}
        />
      )}
      {showReview && (
        <ReviewModal
          centreId={centre.id}
          centreName={centre.name}
          onClose={() => setShowReview(false)}
          onReviewSubmitted={handleReviewSubmitted}
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

        {/* Name, type, address & rating */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex justify-between items-start mb-2">
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

          {/* Average rating */}
          <div className="mt-3">
            <StarRating
              rating={parseFloat(Number(centre.avg_rating || 0).toFixed(1))}
              count={centre.review_count || 0}
              size="md"
            />
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

        {/* Action buttons */}
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
            <button
              onClick={() => setShowEnroll(true)}
              className="flex-1 flex justify-center items-center gap-2 bg-blue-600 text-white py-3 px-4 rounded-xl font-medium hover:bg-blue-700 transition"
            >
              <UserPlus className="h-5 w-5" /> Enroll Now
            </button>
          </div>
        </div>

        {/* Reviews section */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-lg font-bold text-gray-900">
              Reviews{" "}
              <span className="text-gray-400 font-normal text-sm">
                ({centre.review_count || 0})
              </span>
            </h2>
            <button
              onClick={() => setShowReview(true)}
              className="flex items-center gap-1.5 text-sm font-medium text-blue-600 hover:text-blue-700 transition border border-blue-200 px-3 py-1.5 rounded-lg hover:bg-blue-50"
            >
              <Star className="h-4 w-4" /> Write a Review
            </button>
          </div>

          {reviews.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              <Star className="h-10 w-10 mx-auto mb-2 text-gray-200" />
              <p className="text-sm">No reviews yet. Be the first to review!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {reviews.map((review) => (
                <div key={review.id} className="border-b border-gray-100 pb-4 last:border-0 last:pb-0">
                  <div className="flex items-center justify-between mb-1">
                    <p className="font-semibold text-gray-800 text-sm">{review.reviewer_name}</p>
                    <p className="text-xs text-gray-400">
                      {new Date(review.created_at).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </p>
                  </div>
                  <StarRating rating={review.rating} size="sm" />
                  {review.comment && (
                    <p className="text-sm text-gray-600 mt-2">{review.comment}</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </main>
  );
}