import React, { useState } from "react";

const RatingDialog = ({ appointment, onSubmit, onClose }) => {
  const [rating, setRating] = useState(5);
  const [review, setReview] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!rating) return;
    setLoading(true);
    await onSubmit(rating, review);
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <form className="bg-white rounded-xl shadow-xl p-8 w-full max-w-md" onSubmit={handleSubmit}>
        <h2 className="text-xl font-bold mb-2">Rate Your Experience</h2>
        <p className="mb-4">With Dr. {appointment.doctorId.fullName || appointment.doctorId}</p>
        <div className="mb-4 flex gap-1 items-center">
          {[1,2,3,4,5].map(star => (
            <button
              type="button"
              key={star}
              className={
                "text-3xl " + (star <= rating ? 'text-yellow-400' : 'text-gray-300')
              }
              onClick={() => setRating(star)}
            >
              ★
            </button>
          ))}
        </div>
        <textarea
          placeholder="Leave a review (optional)..."
          className="border w-full p-2 mb-4 rounded resize-none"
          value={review}
          onChange={e => setReview(e.target.value)}
          rows={3}
          maxLength={2000}
        />
        <div className="flex justify-end gap-2">
          <button type="button" onClick={onClose} className="text-gray-500" disabled={loading}>Cancel</button>
          <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded" disabled={loading}>{loading ? "Submitting..." : "Submit"}</button>
        </div>
      </form>
    </div>
  );
};
export default RatingDialog;
