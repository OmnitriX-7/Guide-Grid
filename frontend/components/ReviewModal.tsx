"use client";

import { useState } from "react";
import { X, Star, CheckCircle, AlertCircle } from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

interface ReviewModalProps {
  centreId: string;
  centreName: string;
  onClose: () => void;
  onReviewSubmitted: () => void; // callback to refresh reviews after submit
}

export default function ReviewModal({
  centreId,
  centreName,
  onClose,
  onReviewSubmitted,
}: ReviewModalProps) {
  const [hoveredStar, setHoveredStar] = useState(0);
  const [form, setForm] = useState({
    reviewer_name: "",
    rating: 0,
    comment: "",
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    if (!form.reviewer_name.trim()) {
      setError("Please enter your name.");
      return;
    }
    if (form.rating === 0) {
      setError("Please select a star rating.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch(`${API_URL}/api/reviews`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          centre_id: centreId,
          reviewer_name: form.reviewer_name.trim(),
          rating: form.rating,
          comment: form.comment.trim() || null,
        }),
      });

      const data = await response.json();
      if (data.success) {
        setSuccess(true);
        onReviewSubmitted(); // tell parent to refresh
      } else {
        setError(data.error || "Failed to submit review. Please try again.");
      }
    } catch {
      setError("Could not connect to server. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    "w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none";

  return (
    <div
      className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 relative"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition"
        >
          <X className="h-5 w-5" />
        </button>

        {success ? (
          <div className="text-center py-6">
            <CheckCircle className="h-14 w-14 text-green-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-gray-900 mb-2">Review Submitted!</h2>
            <p className="text-gray-500 mb-6">
              Thanks for reviewing{" "}
              <span className="font-semibold text-gray-800">{centreName}</span>.
            </p>
            <button
              onClick={onClose}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition font-medium"
            >
              Done
            </button>
          </div>
        ) : (
          <>
            <div className="mb-6">
              <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <Star className="h-5 w-5 text-yellow-400" />
                Write a Review
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                Reviewing <span className="font-semibold text-gray-800">{centreName}</span>
              </p>
            </div>

            <div className="space-y-4">
              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Your Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={form.reviewer_name}
                  onChange={(e) => {
                    setForm({ ...form, reviewer_name: e.target.value });
                    setError("");
                  }}
                  placeholder="Enter your name"
                  className={inputClass}
                />
              </div>

              {/* Star picker */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Rating <span className="text-red-500">*</span>
                </label>
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onMouseEnter={() => setHoveredStar(star)}
                      onMouseLeave={() => setHoveredStar(0)}
                      onClick={() => {
                        setForm({ ...form, rating: star });
                        setError("");
                      }}
                      className="transition-transform hover:scale-110"
                    >
                      <svg
                        className={`h-8 w-8 transition-colors ${
                          star <= (hoveredStar || form.rating)
                            ? "text-yellow-400"
                            : "text-gray-300"
                        }`}
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    </button>
                  ))}
                  {form.rating > 0 && (
                    <span className="ml-2 text-sm text-gray-500">
                      {["", "Poor", "Fair", "Good", "Very Good", "Excellent"][form.rating]}
                    </span>
                  )}
                </div>
              </div>

              {/* Comment */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Comment <span className="text-gray-400">(optional)</span>
                </label>
                <textarea
                  value={form.comment}
                  onChange={(e) => setForm({ ...form, comment: e.target.value })}
                  placeholder="Share your experience at this centre..."
                  rows={3}
                  maxLength={500}
                  className={`${inputClass} resize-none`}
                />
                <p className="text-xs text-gray-400 text-right mt-1">
                  {form.comment.length}/500
                </p>
              </div>

              {error && (
                <p className="text-sm text-red-500 flex items-center gap-1">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  {error}
                </p>
              )}

              <button
                type="button"
                onClick={handleSubmit}
                disabled={loading}
                className="w-full bg-blue-600 text-white py-2.5 rounded-lg font-medium hover:bg-blue-700 transition disabled:opacity-60"
              >
                {loading ? "Submitting..." : "Submit Review"}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}