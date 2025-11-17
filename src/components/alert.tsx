"use client";
import React from "react";

interface GoogleSignInModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function Alert({
  text,
  status,
  isOpen,
  onClose,
}: {
  text: string;
  status: "error" | "success" | "info";
  isOpen: boolean;
  onClose: () => void;
}) {
  if (!isOpen) return null;

  // const handleGoogleSignIn = async () => {
  //   try {
  //     window.location.href = "/api/auth/google";
  //   } catch (error) {
  //     console.error("❌ Error starting Google OAuth:", error);
  //   }
  // };

  // ✅ close when clicking background
  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    // Only close if clicking directly on the backdrop, not the modal content
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm z-50"
      onClick={handleBackdropClick}
    >
      <div
        className="bg-white rounded-lg shadow-xl px-10 py-10 text-center max-w-sm w-full"
        onClick={(e) => e.stopPropagation()} // prevent click inside from closing
      >
        <h2
          className={`text-2xl font-serif mb-3 ${
            status === "error"
              ? "text-red-600"
              : status === "success"
              ? "text-green-600"
              : "text-blue-600"
          }`}
        >
          {status === "error"
            ? "Error"
            : status === "success"
            ? "Success"
            : "Information"}
        </h2>
        <p className="text-gray-600 text-sm mb-8">{text}</p>
      </div>
    </div>
  );
}

