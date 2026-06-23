"use client";

import { useState } from "react";
import { X, UserPlus, CheckCircle, AlertCircle, ChevronRight, ChevronLeft } from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

interface EnrollModalProps {
  centreId: string;
  centreName: string;
  onClose: () => void;
}

const STEPS = ["Student Info", "Parent & School", "Preferences"];

export default function EnrollModal({ centreId, centreName, onClose }: EnrollModalProps) {
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    student_name: "",
    phone: "",
    email: "",
    age: "",
    gender: "",
    grade: "",
    parent_name: "",
    parent_phone: "",
    school_name: "",
    address: "",
    preferred_timing: "",
    course_interest: "",
    learning_mode: "",
    previous_coaching: "",
    special_requirements: "",
    heard_from: "",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError("");
  };

  const validateStep = () => {
    if (step === 0) {
      if (!form.student_name.trim())
        return "Student name is required.";
      if (!form.phone.trim())
        return "Phone number is required.";
      if (!/^\d{10}$/.test(form.phone))
        return "Enter a valid 10-digit phone number.";
      if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
        return "Enter a valid email address.";
      if (form.age) {
        const ageNum = parseInt(form.age);
        if (isNaN(ageNum) || ageNum < 3 || ageNum > 80)
          return "Age must be between 3 and 80.";
      }
    }
    if (step === 1) {
      if (!form.parent_name.trim())
        return "Parent/Guardian name is required.";
      if (!form.parent_phone.trim())
        return "Parent phone number is required.";
      if (!/^\d{10}$/.test(form.parent_phone))
        return "Enter a valid 10-digit parent phone number.";
      if (!form.address.trim())
        return "Address is required.";
    }
    return "";
  };

  const handleNext = () => {
    const err = validateStep();
    if (err) { setError(err); return; }
    setError("");
    setStep((s) => s + 1);
  };

  const handleBack = () => {
    setError("");
    setStep((s) => s - 1);
  };

  // FIX: handleSubmit is now called directly from a type="button" click,
  // NOT from a form onSubmit. This prevents the browser from carrying
  // over the mouseup event from "Next" and auto-firing the submit button.
  const handleSubmit = async () => {
    setLoading(true);
    setError("");

    try {
      const response = await fetch(`${API_URL}/api/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          centre_id: centreId,
          student_name: form.student_name.trim(),
          phone: form.phone,
          email: form.email || null,
          age: form.age ? parseInt(form.age) : null,
          gender: form.gender || null,
          grade: form.grade || null,
          parent_name: form.parent_name.trim(),
          parent_phone: form.parent_phone,
          school_name: form.school_name || null,
          address: form.address.trim(),
          preferred_timing: form.preferred_timing || null,
          course_interest: form.course_interest || null,
          learning_mode: form.learning_mode || null,
          previous_coaching:
            form.previous_coaching === "yes"
              ? true
              : form.previous_coaching === "no"
              ? false
              : null,
          special_requirements: form.special_requirements || null,
          heard_from: form.heard_from || null,
        }),
      });

      const data = await response.json();
      if (data.success) setSuccess(true);
      else setError(data.error || "Registration failed. Please try again.");
    } catch {
      setError("Could not connect to server. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    "w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none";
  const labelClass = "block text-sm font-medium text-gray-700 mb-1";
  const requiredMark = <span className="text-red-500">*</span>;

  return (
    <div
      className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-6 relative max-h-[90vh] overflow-y-auto"
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
            <h2 className="text-xl font-bold text-gray-900 mb-2">Registered Successfully!</h2>
            <p className="text-gray-500 mb-6">
              Your enquiry for{" "}
              <span className="font-semibold text-gray-800">{centreName}</span> has been
              submitted. They will contact you soon.
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
            <div className="mb-5">
              <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <UserPlus className="h-5 w-5 text-blue-600" />
                Enroll / Enquire
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                Registering at{" "}
                <span className="font-semibold text-gray-800">{centreName}</span>
              </p>
            </div>

            {/* Step indicator */}
            <div className="flex items-center gap-2 mb-6">
              {STEPS.map((label, i) => (
                <div key={i} className="flex items-center gap-2 flex-1">
                  <div className="flex items-center gap-1.5">
                    <div
                      className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                        i < step
                          ? "bg-green-500 text-white"
                          : i === step
                          ? "bg-blue-600 text-white"
                          : "bg-gray-200 text-gray-500"
                      }`}
                    >
                      {i < step ? "✓" : i + 1}
                    </div>
                    <span
                      className={`text-xs font-medium hidden sm:block ${
                        i === step ? "text-blue-600" : "text-gray-400"
                      }`}
                    >
                      {label}
                    </span>
                  </div>
                  {i < STEPS.length - 1 && (
                    <div className={`h-px flex-1 ${i < step ? "bg-green-400" : "bg-gray-200"}`} />
                  )}
                </div>
              ))}
            </div>

            {/* FIX: Removed onSubmit from <form> entirely.
                Submission is handled by the button's onClick instead. */}
            <div>

              {/* ── STEP 1: Student Info ─────────────────── */}
              {step === 0 && (
                <div className="space-y-4">
                  <div>
                    <label className={labelClass}>Student Name {requiredMark}</label>
                    <input
                      type="text"
                      name="student_name"
                      value={form.student_name}
                      onChange={handleChange}
                      placeholder="Enter full name"
                      className={inputClass}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className={labelClass}>Phone {requiredMark}</label>
                      <input
                        type="tel"
                        name="phone"
                        value={form.phone}
                        onChange={handleChange}
                        placeholder="10-digit number"
                        maxLength={10}
                        className={inputClass}
                      />
                    </div>
                    <div>
                      <label className={labelClass}>Age</label>
                      <input
                        type="number"
                        name="age"
                        value={form.age}
                        onChange={handleChange}
                        placeholder="e.g. 14"
                        min={3}
                        max={80}
                        className={inputClass}
                      />
                    </div>
                  </div>

                  <div>
                    <label className={labelClass}>Email Address</label>
                    <input
                      type="email"
                      name="email"
                      value={form.email}
                      onChange={handleChange}
                      placeholder="student@email.com (optional)"
                      className={inputClass}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className={labelClass}>Gender</label>
                      <select name="gender" value={form.gender} onChange={handleChange} className={inputClass}>
                        <option value="">Select</option>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                        <option value="Prefer not to say">Prefer not to say</option>
                      </select>
                    </div>
                    <div>
                      <label className={labelClass}>Class / Grade</label>
                      <select name="grade" value={form.grade} onChange={handleChange} className={inputClass}>
                        <option value="">Select</option>
                        {Array.from({ length: 12 }, (_, i) => (
                          <option key={i + 1} value={`Class ${i + 1}`}>
                            Class {i + 1}
                          </option>
                        ))}
                        <option value="College - 1st Year">College - 1st Year</option>
                        <option value="College - 2nd Year">College - 2nd Year</option>
                        <option value="College - 3rd Year">College - 3rd Year</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {/* ── STEP 2: Parent & School ──────────────── */}
              {step === 1 && (
                <div className="space-y-4">
                  <div>
                    <label className={labelClass}>Parent / Guardian Name {requiredMark}</label>
                    <input
                      type="text"
                      name="parent_name"
                      value={form.parent_name}
                      onChange={handleChange}
                      placeholder="Enter parent or guardian name"
                      className={inputClass}
                    />
                  </div>

                  <div>
                    <label className={labelClass}>Parent Phone Number {requiredMark}</label>
                    <input
                      type="tel"
                      name="parent_phone"
                      value={form.parent_phone}
                      onChange={handleChange}
                      placeholder="10-digit number"
                      maxLength={10}
                      className={inputClass}
                    />
                  </div>

                  <div>
                    <label className={labelClass}>School / College Name</label>
                    <input
                      type="text"
                      name="school_name"
                      value={form.school_name}
                      onChange={handleChange}
                      placeholder="Enter current school or college"
                      className={inputClass}
                    />
                  </div>

                  <div>
                    <label className={labelClass}>Full Address {requiredMark}</label>
                    <textarea
                      name="address"
                      value={form.address}
                      onChange={handleChange}
                      placeholder="House no., street, area, city, pincode"
                      rows={3}
                      className={`${inputClass} resize-none`}
                    />
                  </div>
                </div>
              )}

              {/* ── STEP 3: Preferences ──────────────────── */}
              {step === 2 && (
                <div className="space-y-4">
                  <div>
                    <label className={labelClass}>Subject / Course Interest</label>
                    <input
                      type="text"
                      name="course_interest"
                      value={form.course_interest}
                      onChange={handleChange}
                      placeholder="e.g. Maths, Science, Guitar, Football..."
                      className={inputClass}
                    />
                  </div>

                  <div>
                    <label className={labelClass}>Preferred Batch Timing</label>
                    <select
                      name="preferred_timing"
                      value={form.preferred_timing}
                      onChange={handleChange}
                      className={inputClass}
                    >
                      <option value="">No preference</option>
                      <option value="Morning (6am - 9am)">Morning (6am – 9am)</option>
                      <option value="Before School (7am - 8am)">Before School (7am – 8am)</option>
                      <option value="Afternoon (12pm - 3pm)">Afternoon (12pm – 3pm)</option>
                      <option value="Evening (4pm - 7pm)">Evening (4pm – 7pm)</option>
                      <option value="Night (7pm - 9pm)">Night (7pm – 9pm)</option>
                      <option value="Weekend Only">Weekend Only</option>
                    </select>
                  </div>

                  <div>
                    <label className={labelClass}>Preferred Mode of Learning</label>
                    <div className="grid grid-cols-3 gap-2">
                      {["Offline", "Online", "Hybrid"].map((mode) => (
                        <button
                          key={mode}
                          type="button"
                          onClick={() => setForm({ ...form, learning_mode: mode })}
                          className={`py-2 rounded-lg text-sm font-medium border transition ${
                            form.learning_mode === mode
                              ? "bg-blue-600 text-white border-blue-600"
                              : "bg-white text-gray-600 border-gray-300 hover:border-blue-400"
                          }`}
                        >
                          {mode}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className={labelClass}>Previous Coaching Experience?</label>
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        { label: "Yes", value: "yes" },
                        { label: "No", value: "no" },
                      ].map((opt) => (
                        <button
                          key={opt.value}
                          type="button"
                          onClick={() => setForm({ ...form, previous_coaching: opt.value })}
                          className={`py-2 rounded-lg text-sm font-medium border transition ${
                            form.previous_coaching === opt.value
                              ? "bg-blue-600 text-white border-blue-600"
                              : "bg-white text-gray-600 border-gray-300 hover:border-blue-400"
                          }`}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className={labelClass}>Special Requirements / Notes</label>
                    <textarea
                      name="special_requirements"
                      value={form.special_requirements}
                      onChange={handleChange}
                      placeholder="Any specific needs, disability, language preference, or extra info..."
                      rows={2}
                      className={`${inputClass} resize-none`}
                    />
                  </div>

                  <div>
                    <label className={labelClass}>How did you hear about us?</label>
                    <select
                      name="heard_from"
                      value={form.heard_from}
                      onChange={handleChange}
                      className={inputClass}
                    >
                      <option value="">Select</option>
                      <option value="GuideGrid App">GuideGrid App</option>
                      <option value="Friend / Family">Friend / Family</option>
                      <option value="Google Search">Google Search</option>
                      <option value="Social Media">Social Media</option>
                      <option value="Poster / Banner">Poster / Banner</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  {/* Summary card */}
                  <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
                    <p className="text-xs font-semibold text-blue-700 uppercase tracking-wider mb-2">
                      Registration Summary
                    </p>
                    <div className="space-y-1 text-sm text-gray-700">
                      <p><span className="font-medium">Student:</span> {form.student_name}</p>
                      <p><span className="font-medium">Phone:</span> {form.phone}</p>
                      {form.age && <p><span className="font-medium">Age:</span> {form.age}</p>}
                      {form.grade && <p><span className="font-medium">Class:</span> {form.grade}</p>}
                      <p><span className="font-medium">Parent:</span> {form.parent_name}</p>
                      {form.course_interest && <p><span className="font-medium">Interest:</span> {form.course_interest}</p>}
                      {form.learning_mode && <p><span className="font-medium">Mode:</span> {form.learning_mode}</p>}
                      <p><span className="font-medium">Centre:</span> {centreName}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Error message */}
              {error && (
                <p className="mt-4 text-sm text-red-500 flex items-center gap-1">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  {error}
                </p>
              )}

              {/* Navigation buttons — ALL type="button" to prevent any accidental form submission */}
              <div className="flex gap-3 mt-6">
                {step > 0 && (
                  <button
                    type="button"
                    onClick={handleBack}
                    className="flex-1 flex justify-center items-center gap-1 border border-gray-300 text-gray-700 py-2.5 rounded-lg font-medium hover:bg-gray-50 transition"
                  >
                    <ChevronLeft className="h-4 w-4" /> Back
                  </button>
                )}
                {step < STEPS.length - 1 ? (
                  <button
                    type="button"
                    onClick={handleNext}
                    className="flex-1 flex justify-center items-center gap-1 bg-blue-600 text-white py-2.5 rounded-lg font-medium hover:bg-blue-700 transition"
                  >
                    Next <ChevronRight className="h-4 w-4" />
                  </button>
                ) : (
                  // FIX: type="button" here, not type="submit"
                  // Calls handleSubmit directly via onClick instead
                  <button
                    type="button"
                    onClick={handleSubmit}
                    disabled={loading}
                    className="flex-1 bg-blue-600 text-white py-2.5 rounded-lg font-medium hover:bg-blue-700 transition disabled:opacity-60"
                  >
                    {loading ? "Submitting..." : "Submit Enquiry"}
                  </button>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}