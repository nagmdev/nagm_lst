import React from 'react';
import { Sparkles, ShieldCheck, Quote } from 'lucide-react';

interface AuthLayoutProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}

const AuthLayout: React.FC<AuthLayoutProps> = ({ title, subtitle, children, footer }) => {
  return (
    <div className="min-h-screen bg-slate-950 relative overflow-hidden text-white">
      <div className="absolute inset-0 opacity-40">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-indigo-600 rounded-full blur-3xl" />
        <div className="absolute top-40 right-0 w-72 h-72 bg-purple-600 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-80 h-80 bg-blue-500 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 flex flex-col lg:flex-row min-h-screen">
        <aside className="hidden lg:flex lg:w-1/2 flex-col justify-between p-12 xl:p-16">
          <div>
            <div className="flex items-center gap-3 mb-10">
              <div className="p-2 bg-white/10 rounded-xl">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.3rem] text-white/60">Nagm</p>
                <p className="text-sm text-white/80">STAR Method Practice Platform</p>
              </div>
            </div>

            <div className="space-y-6">
              <h2 className="text-4xl font-semibold leading-tight">
                Build interview-ready answers with AI-assisted coaching.
              </h2>
              <p className="text-base text-white/80 max-w-xl">
                Practice behavioral questions, get instant feedback, and master your story-telling using the STAR framework.
                Secure OTP verification keeps your account safe.
              </p>
            </div>
          </div>

          <div className="mt-12 bg-white/10 backdrop-blur-xl rounded-2xl p-6 space-y-4">
            <Quote className="w-6 h-6 text-white/70" />
            <p className="text-white/90 text-lg leading-relaxed">
              “This platform helped our candidates tell strong STAR stories. The OTP workflow ensures accounts stay protected.”
            </p>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-lg font-semibold">
                NA
              </div>
              <div>
                <p className="font-semibold text-white">Nagm Talent Team</p>
                <p className="text-sm text-white/70">Enterprise Recruiting</p>
              </div>
            </div>
          </div>
        </aside>

        <main className="flex-1 flex items-center justify-center px-4 sm:px-6 py-10">
          <div className="w-full max-w-md bg-white dark:bg-gray-900 text-gray-900 dark:text-white rounded-2xl shadow-2xl border border-white/10 dark:border-gray-800 p-6 sm:p-8 space-y-6">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-100 text-indigo-700 text-xs font-semibold">
                <ShieldCheck className="w-4 h-4" />
                Secure OTP Sign-in
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold mt-4">{title}</h1>
              {subtitle && <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300 mt-2">{subtitle}</p>}
            </div>

            {children}

            {footer && (
              <div className="border-t border-gray-200 dark:border-gray-800 pt-4 text-sm text-center text-gray-600 dark:text-gray-300">
                {footer}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default AuthLayout;

