'use client';

import React, { useState } from 'react';
import { Star, User } from 'lucide-react';
import Button from '@/components/ui/Button';
import { submitReview } from '@/app/actions/shop';
import { createClient } from '@/lib/supabase/client';

// Dummy Reviews for Empty State
const PLACEHOLDER_REVIEWS = [
  { id: 'p1', user_name: 'Kwame A.', rating: 5, comment: 'Excellent taste and fast delivery!', created_at: new Date().toISOString() },
  { id: 'p2', user_name: 'Sarah M.', rating: 4, comment: 'Great service, will order again.', created_at: new Date().toISOString() },
];

interface ReviewsSectionProps {
  productId: string;
  reviews: any[];
}

const ReviewsSection: React.FC<ReviewsSectionProps> = ({ productId, reviews }) => {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Check login status on mount
  React.useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => setIsLoggedIn(!!data.user));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isLoggedIn) return alert("Please log in to review.");
    
    setLoading(true);
    const res = await submitReview(productId, rating, comment);
    setLoading(false);

    if (res.error) {
      alert(res.error);
    } else {
      alert("Review submitted!");
      setComment('');
      // In a real app, we'd trigger a refresh or optimistic update here
      window.location.reload(); 
    }
  };

  const displayReviews = reviews.length > 0 ? reviews : PLACEHOLDER_REVIEWS;
  const isPlaceholder = reviews.length === 0;

  return (
    <div className="bg-white rounded-2xl border border-secondary-200 p-6 md:p-10 shadow-sm">
      <h3 className="text-2xl font-display font-bold text-secondary-900 mb-8 flex items-center gap-3">
        Customer Reviews
        {isPlaceholder && (
          <span className="text-xs font-normal bg-secondary-100 text-secondary-500 px-2 py-1 rounded-full">
            Recent Feedback
          </span>
        )}
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        
        {/* LIST REVIEWS */}
        <div className="space-y-6">
          {displayReviews.map((review) => (
            <div key={review.id} className="border-b border-secondary-100 pb-6 last:border-0">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-secondary-100 rounded-full flex items-center justify-center text-secondary-500">
                    <User size={16} />
                  </div>
                  <span className="font-bold text-secondary-900">
                    {review.user_name || 'Verified Customer'}
                  </span>
                </div>
                <div className="flex text-amber-400">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={14} fill={i < review.rating ? "currentColor" : "none"} />
                  ))}
                </div>
              </div>
              <p className="text-secondary-600 text-sm italic">"{review.comment}"</p>
              <p className="text-xs text-secondary-400 mt-2">
                {new Date(review.created_at).toLocaleDateString()}
              </p>
            </div>
          ))}
          
          {isPlaceholder && (
            <p className="text-xs text-center text-secondary-400 mt-4">
              * These are examples. Be the first to leave a real review!
            </p>
          )}
        </div>

        {/* WRITE REVIEW */}
        <div className="bg-secondary-50 p-6 rounded-xl h-fit">
          <h4 className="font-bold text-lg text-secondary-900 mb-4">Write a Review</h4>
          
          {!isLoggedIn ? (
            <div className="text-center py-8">
              <p className="text-secondary-600 mb-4">Please sign in to share your experience.</p>
              <a href="/auth/login">
                <Button variant="outline" fullWidth>Login to Review</Button>
              </a>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Rating</label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      className={`transition-colors ${star <= rating ? 'text-amber-400' : 'text-secondary-300'}`}
                    >
                      <Star size={24} fill={star <= rating ? "currentColor" : "none"} />
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Comment</label>
                <textarea 
                  required
                  rows={4}
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  className="w-full p-3 border border-secondary-200 rounded-lg focus:border-primary-500 outline-none"
                  placeholder="Tell us what you think..."
                />
              </div>

              <Button type="submit" isLoading={loading} fullWidth>
                Submit Review
              </Button>
            </form>
          )}
        </div>

      </div>
    </div>
  );
};

export default ReviewsSection;