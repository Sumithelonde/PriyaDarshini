import React from 'react';
import { Link } from 'react-router-dom';

const Landing: React.FC = () => {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center p-6">
      <div className="text-center max-w-3xl">
        {/* Logo */}
        <div className="mb-8 flex justify-center">
          <div className="h-16 w-16 rounded-lg flex items-center justify-center bg-primary text-primary-foreground shadow-lg">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="12" cy="12" r="10" fill="currentColor" />
              <path d="M8 12h8M8 8h8M8 16h8" stroke="rgba(255,255,255,0.9)" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
        </div>

        {/* Title */}
        <h1 className="text-5xl font-bold text-foreground mb-4">Legislate AI</h1>
        
        {/* Subtitle */}
        <p className="text-2xl font-semibold text-foreground mb-2">आपकी आवाज़ है आपका अधिकार</p>
        
        {/* Description */}
        <p className="text-lg text-muted-foreground mb-8">
          कानूनी समस्याओं का समाधान • दस्तावेज़ निर्माण • विशेषज्ञ सहायता
        </p>

        {/* CTA Text */}
        <div className="bg-card border border-border rounded-lg p-8 mb-8 shadow-sm">
          <p className="text-foreground mb-4">
            Simplifying legal access for everyone. Get expert guidance, generate documents, and connect with legal professionals - all in one place.
          </p>
          <p className="text-foreground font-semibold">
            Please login or register to continue
          </p>
        </div>

        {/* Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            to="/login"
            className="px-8 py-3 bg-primary text-primary-foreground font-semibold rounded-lg hover:bg-primary/90 transition-colors shadow-lg"
          >
            Login
          </Link>
          <Link
            to="/register"
            className="px-8 py-3 bg-secondary text-secondary-foreground font-semibold rounded-lg hover:bg-secondary/80 transition-colors shadow-sm border border-border"
          >
            Register
          </Link>
        </div>

        {/* Features Preview */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-card border border-border rounded-lg p-6 shadow-sm">
            <div className="text-3xl mb-3">💬</div>
            <h3 className="text-lg font-semibold text-foreground mb-2">Legal Guidance</h3>
            <p className="text-muted-foreground text-sm">Get instant legal advice in your language</p>
          </div>
          
          <div className="bg-card border border-border rounded-lg p-6 shadow-sm">
            <div className="text-3xl mb-3">📄</div>
            <h3 className="text-lg font-semibold text-foreground mb-2">Document Generator</h3>
            <p className="text-muted-foreground text-sm">Create legal documents effortlessly</p>
          </div>
          
          <div className="bg-card border border-border rounded-lg p-6 shadow-sm">
            <div className="text-3xl mb-3">👥</div>
            <h3 className="text-lg font-semibold text-foreground mb-2">Expert Network</h3>
            <p className="text-muted-foreground text-sm">Connect with verified NGOs and lawyers</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Landing;
