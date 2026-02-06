import { useState } from "react";
import { useCreateReviewMutation } from "../../features/reviews/reviewApi";

const ReviewForm = ({ productId }: { productId: string }) => {
    const [rating, setRating] = useState(5);
    const [comment, setComment] = useState("");

    const [createReview, { isLoading }] = useCreateReviewMutation();

    const submit = async () => {
        await createReview({ productId, rating, comment }).unwrap();
        alert("Review submitted");
    };

    return (
        <div className="bg-surface shadow-card rounded-xl p-4 space-y-3">
            <h3 className="font-semibold">Write a Review</h3>

            <select
                value={rating}
                onChange={(e) => setRating(Number(e.target.value))}
                className="border p-2 rounded w-full"
            >
                {[5, 4, 3, 2, 1].map((r) => (
                    <option key={r} value={r}>
                        {r} Stars
                    </option>
                ))}
            </select>

            <textarea
                placeholder="Your review..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                className="border p-2 rounded w-full"
            />

            <button
                onClick={submit}
                disabled={isLoading}
                className="bg-primary text-white px-4 py-2 rounded"
            >
                Submit Review
            </button>
        </div>
    );
};

export default ReviewForm;