"use client";
import React from "react";
import { CheckCircle, AlertTriangle, Info } from "lucide-react";

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

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) onClose();
  };

  const colors = {
    error: {
      icon: <AlertTriangle size={48} className="text-red-500" />,
      title: "Error",
      border: "border-red-500",
      glow: { boxShadow: "0 0 25px rgba(220,38,38,0.3)" },
    },
    success: {
      icon: <CheckCircle size={48} className="text-green-600" />,
      title: "Success",
      border: "border-green-600",
      glow: { boxShadow: "0 0 25px rgba(22,163,74,0.25)" },
    },
    info: {
      icon: <Info size={48} className="text-[#00355A]" />,
      title: "Information",
      border: "border-[#00355A]",
      glow: { boxShadow: "0 0 25px rgba(0,53,90,0.25)" },
    },
  }[status];

  return (
    <div
      className="fixed inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm z-50 px-4"
      onClick={handleBackdropClick}
    >
      <div
        className={`w-full max-w-sm bg-white rounded-2xl p-6 sm:p-8 text-center border-2 ${colors.border} animate-fadeIn`}
        style={colors.glow}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 animate-popIn flex justify-center">
          {colors.icon}
        </div>

        <h2 className="text-xl sm:text-2xl font-semibold mb-2 text-[#00355A] font-serif">
          {colors.title}
        </h2>

        <p className="text-gray-700 text-xs sm:text-sm leading-relaxed whitespace-pre-line">
          {text}
        </p>

        <button
          onClick={onClose}
          className="mt-6 w-full py-2 rounded-lg font-medium bg-[#00355A] text-white hover:bg-[#00243C] transition text-sm sm:text-base"
        >
          OK
        </button>
      </div>
    </div>
  );
}
