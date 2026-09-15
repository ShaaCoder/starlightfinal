'use client';

import { Mail, Sparkles } from 'lucide-react';

export function BlogNewsletter() {
  return (
    <section className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-sky-900 p-8 sm:p-12">
      <div className="absolute inset-0 opacity-10">
        <div className="absolute -top-24 -right-24 h-64 w-64 rounded-full bg-sky-400 blur-3xl" />
        <div className="absolute -bottom-24 -left-24 h-64 w-64 rounded-full bg-cyan-400 blur-3xl" />
      </div>
      <div className="relative z-10 text-center max-w-xl mx-auto">
        <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 text-xs font-semibold text-sky-200 backdrop-blur-sm mb-4">
          <Sparkles className="h-3.5 w-3.5" />
          Free Educational Content
        </div>
        <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3">
          Learn Something New Every Week
        </h2>
        <p className="text-slate-300 text-sm sm:text-base mb-6 leading-relaxed">
          Join 2,000+ students and parents who receive our weekly digest of study tips,
          career guidance, and educational insights.
        </p>
        <form onSubmit={(e) => e.preventDefault()} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
          <div className="relative flex-1">
            <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="email"
              placeholder="Enter your email"
              className="w-full h-11 pl-10 pr-4 rounded-xl bg-white/10 border border-white/20 text-white placeholder:text-slate-400 text-sm focus:outline-none focus:border-sky-400 focus:bg-white/15"
            />
          </div>
          <button
            type="submit"
            className="h-11 px-6 rounded-xl bg-sky-500 text-white font-semibold text-sm hover:bg-sky-400 transition-colors shrink-0"
          >
            Subscribe Free
          </button>
        </form>
        <p className="mt-3 text-xs text-slate-400">No spam. Unsubscribe anytime.</p>
      </div>
    </section>
  );
}
