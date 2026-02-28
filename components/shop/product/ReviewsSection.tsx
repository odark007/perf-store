'use client';

import React, { useState } from 'react';
import { Star, User, MessageSquare, Quote } from 'lucide-react';
import Button from '@/components/ui/Button';
import { submitReview } from '@/app/actions/shop';
import { createClient } from '@/lib/supabase/client';

// Refined Placeholder Reviews for Fragrances
const PLACEHOLDER_REVIEWS = [
  { id: 'p1', user_name: 'Amma Boateng', rating: 5, comment: 'A masterpiece. The sillage is divine and I get compliments all day.', created_at: new Date().toISOString() },
  { id: 'p2', user_name: 'Kofi Mensah', rating: 5, comment: 'Authentic and beautifully packaged. Swift delivery to East Legon.', created_at: new Date().toISOString() },
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

  React.useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => setIsLoggedIn(!!data.user));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isLoggedIn) return alert("Please sign in to share your impression.");

    setLoading(true);
    const res = await submitReview(productId, rating, comment);
    setLoading(false);

    if (res.error) {
      alert(res.error);
    } else {
      alert("Impression submitted to the Maison.");
      setComment('');
      window.location.reload();
    }
  };

  const displayReviews = reviews.length > 0 ? reviews : PLACEHOLDER_REVIEWS;
  const isPlaceholder = reviews.length === 0;

  return (
    <div className="bg-white rounded-[2.5rem] border border-brand-border p-8 md:p-12 shadow-sm">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-12">
        <div className="space-y-3">
          <span className="text-brand-gold font-bold tracking-[0.3em] uppercase text-[10px]">Olfactive Gallery</span>
          <h3 className="text-4xl font-display font-bold text-brand-deep italic">Client Impressions</h3>
        </div>

        {isPlaceholder && (
          <span className="text-[10px] font-bold bg-brand-cream text-brand-gold px-4 py-1.5 rounded-full uppercase tracking-widest border border-brand-gold/10">
            Be the First to Review
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-16">

        {/* LIST REVIEWS */}
        <div className="lg:col-span-3 space-y-10">
          {displayReviews.map((review) => (
            <div key={review.id} className="group relative">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-brand-cream/50 rounded-full flex items-center justify-center text-brand-gold border border-brand-gold/10 overflow-hidden">
                    <User size={20} />
                  </div>
                  <div>
                    <span className="block font-bold text-brand-deep text-sm uppercase tracking-wide">
                      {review.user_name || 'Anonymous Client'}
                    </span>
                    <span className="text-[10px] text-brand-muted font-medium">
                      Verified Scent Pursuit • {new Date(review.created_at).toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}
                    </span>
                  </div>
                </div>
                <div className="flex text-brand-gold">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={12} fill={i < review.rating ? "currentColor" : "none"} strokeWidth={1.5} />
                  ))}
                </div>
              </div>

              <div className="relative pl-6 border-l-2 border-brand-gold/20">
                <p className="text-brand-deep/80 text-sm leading-relaxed italic">"{review.comment}"</p>
              </div>
            </div>
          ))}

          {isPlaceholder && (
            <div className="flex items-center gap-3 p-4 bg-brand-cream/20 rounded-2xl border border-dashed border-brand-gold/20">
              <MessageSquare size={16} className="text-brand-gold" />
              <p className="text-[10px] text-brand-muted font-medium uppercase tracking-wider">
                Your story with this fragrance begins here.
              </p>
            </div>
          )}
        </div>

        {/* WRITE REVIEW */}
        <div className="lg:col-span-2">
          <div className="bg-brand-cream/10 p-8 rounded-[2rem] border border-brand-border h-fit sticky top-24">
            <h4 className="font-display text-xl font-bold text-brand-deep mb-6 italic">Record Your Impression</h4>

            {!isLoggedIn ? (
              <div className="text-center py-6 space-y-4">
                <p className="text-xs text-brand-muted font-medium leading-relaxed uppercase tracking-wider">Join our circle to share the nuances of your olfactory journey.</p>
                <a href="/auth/login" className="block">
                  <Button variant="outline" className="w-full border-brand-gold/30 text-brand-deep hover:bg-white font-bold tracking-widest uppercase text-xs">
                    Sign In
                  </Button>
                </a>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-3">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-brand-gold ml-1">The Intensity</label>
                  <div className="flex gap-3">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setRating(star)}
                        className={`transition-all duration-300 hover:scale-110 ${star <= rating ? 'text-brand-gold' : 'text-brand-border'}`}
                        aria-label={`Rate ${star} stars`}
                      >
                        <Star size={24} fill={star <= rating ? "currentColor" : "none"} strokeWidth={1.5} />
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-brand-gold ml-1">Your Narrative</label>
                  <textarea
                    required
                    rows={4}
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    className="w-full p-4 bg-white border border-brand-border rounded-2xl focus:border-brand-gold outline-none text-sm font-medium transition-all"
                    placeholder="Describe the notes, the feeling, the memory..."
                  />
                </div>

                <Button
                  type="submit"
                  isLoading={loading}
                  fullWidth
                  className="bg-brand-deep text-white border-none py-4 rounded-xl font-bold uppercase tracking-widest text-xs shadow-lg shadow-brand-deep/10"
                >
                  Submit to Maison
                </Button>
              </form>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default ReviewsSection;
