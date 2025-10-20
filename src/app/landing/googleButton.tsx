"use client";

import React from "react";
import { auth, provider, signInWithPopup } from "../../firebaseConfig";

interface GoogleSignInModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const GoogleSignInModal: React.FC<GoogleSignInModalProps> = ({
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  const handleGoogleSignIn = async () => {
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      console.log("✅ Signed in as:", user.displayName);
      onClose();
    } catch (error) {
      console.error("❌ Error signing in:", error);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm z-50">
      <div className="bg-white rounded-lg shadow-xl px-10 py-10 text-center max-w-sm w-full">
        <h2 className="text-2xl font-serif text-gray-900 mb-3">
          Welcome to តាមដាន Tamdan
        </h2>
        <p className="text-gray-600 text-sm mb-8">
          Sign in to save your interests and receive your personalized daily
          digest
        </p>

        {/* Google Button */}
        <button
          onClick={handleGoogleSignIn}
          className="w-full bg-white border border-gray-300 rounded-full flex items-center justify-center space-x-3 px-5 py-2.5 shadow-sm hover:shadow-md transition cursor-pointer"
        >
          <img
            src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
            alt="Google Logo"
            className="w-5 h-5"
          />
          <span className="text-gray-700 font-medium">
            Sign in with Google
          </span>
        </button>

        <p className="text-xs text-gray-400 mt-5">
          By signing in, you agree to receive a daily newsletter
        </p>
      </div>
    </div>
  );
};

export default GoogleSignInModal;
