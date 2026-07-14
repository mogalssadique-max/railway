import React, { useState } from 'react';
import { FAQS, FAQItem, Review, Post } from '../data';
import { 
  Star, ChevronDown, ChevronUp, MapPin, Phone, Mail, Clock, 
  Facebook, Instagram, Twitter, Youtube, Linkedin, MessageCircle, Send, ShieldCheck 
} from 'lucide-react';

interface HeaderFooterProps {
  reviews: Review[];
  onAddReview: (review: Review) => void;
  posts: Post[];
}

export const ReviewsAndFAQ: React.FC<HeaderFooterProps> = ({
  reviews,
  onAddReview,
  posts,
}) => {
  // Reviews state
  const [newName, setNewName] = useState('');
  const [newRating, setNewRating] = useState(5);
  const [newComment, setNewComment] = useState('');
  const [reviewSuccess, setReviewSuccess] = useState(false);

  // FAQ Accordion states
  const [openFaq, setOpenFaq] = useState<string | null>('faq-1');

  // Calculate stats
  const averageRating = (
    reviews.reduce((acc, curr) => acc + curr.rating, 0) / (reviews.length || 1)
  ).toFixed(1);

  const handleReviewSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newComment.trim()) return;

    const ratingValue = Number(newRating);
    const addedReview: Review = {
      id: `rev-${Date.now()}`,
      name: newName,
      rating: ratingValue,
      comment: newComment,
      date: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }),
      verified: true,
    };

    onAddReview(addedReview);
    setNewName('');
    setNewComment('');
    setNewRating(5);
    setReviewSuccess(true);
    setTimeout(() => setReviewSuccess(false), 3000);
  };

  return (
    <div className="space-y-16 animate-fade-in text-slate-800 dark:text-slate-100">
      
      {/* Latest Posts (Social Media Section) */}
      <section id="social-media-feed" className="space-y-6">
        <div className="text-center max-w-xl mx-auto space-y-2">
          <h3 className="text-xl font-bold">Logistics Feeds & Announcements</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Keep up to date with national railway network alerts, monsoon advisory details, and active cargo discount campaigns.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {posts.map((post) => (
            <div 
              key={post.id} 
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4.5 space-y-3.5 hover:border-orange-500/50 transition-all duration-300 shadow-xs flex flex-col justify-between"
            >
              <div className="space-y-2.5">
                <div className="flex justify-between items-center text-[9px] uppercase font-bold tracking-wider">
                  <span className={`px-2 py-0.5 rounded-md ${
                    post.category === 'Offers & Discounts'
                      ? 'bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400'
                      : post.category === 'Delivery Updates'
                      ? 'bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400'
                      : 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400'
                  }`}>
                    {post.category}
                  </span>
                  <span className="text-slate-400 dark:text-slate-500 font-mono">{post.date}</span>
                </div>
                <h4 className="font-bold text-xs leading-tight text-slate-800 dark:text-slate-100 line-clamp-2">
                  {post.title}
                </h4>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-3 leading-relaxed">
                  {post.summary}
                </p>
              </div>

              <div className="flex justify-between items-center pt-3 border-t border-slate-100 dark:border-slate-800 text-[10px] text-slate-400">
                <span className="font-semibold flex items-center gap-1 hover:text-orange-500 cursor-pointer">
                  ❤️ {post.likes} Likes
                </span>
                <span className="hover:text-blue-500 cursor-pointer">
                  Share Post
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Social Badges Grid */}
        <div className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 text-center space-y-4">
          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
            Connect directly on official channels for automated SMS dispatch tracking & alerts
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <a href="#" className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-[11px] font-semibold hover:border-blue-500 transition-all text-slate-600 dark:text-slate-300">
              <Facebook className="w-3.5 h-3.5 text-blue-600" /> Facebook
            </a>
            <a href="#" className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-[11px] font-semibold hover:border-pink-500 transition-all text-slate-600 dark:text-slate-300">
              <Instagram className="w-3.5 h-3.5 text-pink-500" /> Instagram
            </a>
            <a href="#" className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-[11px] font-semibold hover:border-sky-400 transition-all text-slate-600 dark:text-slate-300">
              <Twitter className="w-3.5 h-3.5 text-sky-400" /> X (Twitter)
            </a>
            <a href="#" className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-[11px] font-semibold hover:border-red-500 transition-all text-slate-600 dark:text-slate-300">
              <Youtube className="w-3.5 h-3.5 text-red-500" /> YouTube
            </a>
            <a href="#" className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-[11px] font-semibold hover:border-blue-700 transition-all text-slate-600 dark:text-slate-300">
              <Linkedin className="w-3.5 h-3.5 text-blue-700" /> LinkedIn
            </a>
            <a href="#" className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-[11px] font-semibold hover:border-emerald-500 transition-all text-slate-600 dark:text-slate-300">
              <MessageCircle className="w-3.5 h-3.5 text-emerald-500" /> WhatsApp Channel
            </a>
          </div>
        </div>
      </section>

      {/* Customer Reviews & Feedback Board */}
      <section id="customer-reviews" className="grid grid-cols-1 lg:grid-cols-12 gap-8 pt-4">
        
        {/* Review Submission & Stat block: 5 Columns */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 space-y-4">
            <h4 className="font-bold text-sm">
              Trusted by 14,000+ Customers
            </h4>
            
            {/* Rating Stat Panel */}
            <div className="flex items-center gap-4">
              <span className="text-4xl font-extrabold font-mono text-blue-600 dark:text-blue-400">
                {averageRating}
              </span>
              <div>
                <div className="flex text-amber-500 gap-0.5">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star key={star} className="w-4 h-4 fill-amber-500" />
                  ))}
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                  Average customer rating (based on verified tracking logins)
                </p>
              </div>
            </div>

            {/* Submit Review form */}
            <form onSubmit={handleReviewSubmit} className="space-y-4 border-t border-slate-200 dark:border-slate-800 pt-4 text-xs">
              <h5 className="font-bold text-xs text-slate-700 dark:text-slate-300">
                Submit Your Verified Feedback
              </h5>

              {reviewSuccess && (
                <div className="p-3 bg-emerald-50 text-emerald-600 rounded-lg border text-[11px] font-medium">
                  ✓ Review submitted! Thank you for sharing your experience.
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-slate-500 font-semibold">Your Name</label>
                  <input 
                    type="text" 
                    placeholder="e.g., Rajesh Kumar"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    required
                    className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-slate-500 font-semibold">Overall Rating</label>
                  <select
                    value={newRating}
                    onChange={(e) => setNewRating(Number(e.target.value))}
                    className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg outline-none font-bold text-amber-600"
                  >
                    <option value="5">⭐⭐⭐⭐⭐ (5/5)</option>
                    <option value="4">⭐⭐⭐⭐ (4/5)</option>
                    <option value="3">⭐⭐⭐ (3/5)</option>
                    <option value="2">⭐⭐ (2/5)</option>
                    <option value="1">⭐ (1/5)</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-slate-500 font-semibold">Your Comments</label>
                <textarea 
                  rows={2}
                  placeholder="Share details of your cargo journey experience..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  required
                  className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg outline-none resize-none leading-relaxed"
                ></textarea>
              </div>

              <button
                type="submit"
                className="w-full bg-slate-800 hover:bg-slate-900 dark:bg-slate-100 dark:hover:bg-white text-white dark:text-slate-900 font-bold py-2 px-3 rounded-lg flex items-center justify-center gap-1.5 transition-all shadow-xs"
              >
                <Send className="w-3.5 h-3.5" /> Submit Review
              </button>
            </form>
          </div>
        </div>

        {/* Reviews scrolling list: 7 Columns */}
        <div className="lg:col-span-7 space-y-4 max-h-[420px] overflow-y-auto pr-2">
          {reviews.map((rev) => (
            <div 
              key={rev.id} 
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4.5 rounded-xl space-y-2 text-xs"
            >
              <div className="flex justify-between items-center">
                <div className="space-y-0.5">
                  <h5 className="font-bold flex items-center gap-1.5 text-slate-800 dark:text-slate-100">
                    {rev.name}
                    {rev.verified && (
                      <span className="inline-flex items-center gap-0.5 text-[9px] font-bold text-emerald-500 bg-emerald-50 dark:bg-emerald-950/30 px-1.5 py-0.2 rounded-md uppercase">
                        <ShieldCheck className="w-2.5 h-2.5" /> Verified Booker
                      </span>
                    )}
                  </h5>
                  <p className="text-[10px] text-slate-400 font-mono">{rev.date}</p>
                </div>
                
                <div className="flex text-amber-500 gap-0.5">
                  {Array.from({ length: rev.rating }).map((_, i) => (
                    <Star key={i} className="w-3 h-3 fill-amber-500 text-amber-500" />
                  ))}
                </div>
              </div>
              <p className="text-slate-600 dark:text-slate-300 leading-relaxed font-normal">
                "{rev.comment}"
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Accordion FAQ Section */}
      <section id="faq-accordions" className="space-y-6">
        <div className="text-center max-w-xl mx-auto space-y-2">
          <h3 className="text-xl font-bold">Frequently Asked Queries (FAQs)</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Got logistics safety questions? Review central policies, door delivery parameters, and insurance details.
          </p>
        </div>

        <div className="max-w-3xl mx-auto divide-y divide-slate-200 dark:divide-slate-800 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden bg-white dark:bg-slate-900 shadow-xs">
          {FAQS.map((faq) => {
            const isOpen = openFaq === faq.id;
            return (
              <div key={faq.id} className="text-xs">
                <button
                  type="button"
                  onClick={() => setOpenFaq(isOpen ? null : faq.id)}
                  className="w-full flex justify-between items-center p-4.5 font-semibold text-left hover:bg-slate-50/50 dark:hover:bg-slate-800/10 transition-colors text-slate-800 dark:text-slate-100"
                >
                  <span className="pr-4">{faq.question}</span>
                  {isOpen ? (
                    <ChevronUp className="w-4 h-4 text-slate-400 shrink-0" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
                  )}
                </button>
                
                {isOpen && (
                  <div className="p-4.5 bg-slate-50 dark:bg-slate-950/60 text-slate-600 dark:text-slate-400 border-t border-slate-100 dark:border-slate-800 leading-relaxed font-normal">
                    {faq.answer}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
};
