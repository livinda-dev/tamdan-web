"use client";
import React from "react";
import { CheckCircle, AlertTriangle, Info, AlertCircle } from "lucide-react";

export default function Alert({
  text,
  status,
  isOpen,
  onClose,
  actionText,
  onAction,
}: {
  text: string;
  status: "error" | "success" | "info" | "warning";
  isOpen: boolean;
  onClose: () => void;
  actionText?: string;
  onAction?: () => void;
}) {
  if (!isOpen) return null;

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) onClose();
  };

  const colors = {
    error: {
      icon: <AlertCircle size={48} className="text-red-500" />,
      title: "Error",
      border: "border-red-500",
      glow: { boxShadow: "0 0 25px rgba(220,38,38,0.3)" },
    },
    warning: {
      icon: <AlertTriangle size={48} className="text-amber-500" />,
      title: "Notice",
      border: "border-amber-500",
      glow: { boxShadow: "0 0 25px rgba(245,158,11,0.3)" },
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
  }[status] || {
    icon: <Info size={48} className="text-[#00355A]" />,
    title: "Information",
    border: "border-[#00355A]",
    glow: { boxShadow: "0 0 25px rgba(0,53,90,0.25)" },
  };

  return (
    <div
      className="fixed inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm z-50 px-4"
      onClick={handleBackdropClick}
    >
      <div
        className={`w-full max-w-sm bg-white rounded-2xl p-6 sm:p-8 text-center border-2 ${colors.border} animate-fadeIn shadow-2xl`}
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

        {actionText && onAction ? (
          <div className="mt-6 space-y-2">
            <button
              onClick={() => {
                onAction();
                onClose();
              }}
              className="w-full py-2.5 rounded-lg font-medium bg-[#00355A] text-white hover:bg-[#00243C] transition text-sm sm:text-base cursor-pointer shadow-sm"
            >
              {actionText}
            </button>
            <button
              onClick={onClose}
              className="w-full py-2 rounded-lg font-medium bg-gray-100 hover:bg-gray-200 text-gray-700 transition text-sm cursor-pointer"
            >
              Cancel
            </button>
          </div>
        ) : (
          <button
            onClick={onClose}
            className="mt-6 w-full py-2.5 rounded-lg font-medium bg-[#00355A] text-white hover:bg-[#00243C] transition text-sm sm:text-base cursor-pointer shadow-sm"
          >
            OK
          </button>
        )}
      </div>
    </div>
  );
}
