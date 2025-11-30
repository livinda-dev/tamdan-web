"use client";

import React from "react";

interface GenerateAgentButtonProps {
    submitting: boolean;
    onSubmit: (e: React.FormEvent) => void;
}

const GenerateAgentButton: React.FC<GenerateAgentButtonProps> = ({ submitting, onSubmit }) => {
    return (
        <div className="absolute bottom-2 right-2 sm:bottom-3 sm:right-3 md:bottom-4 md:right-4">
            <button
                type="submit"
                disabled={submitting}
                className="text-xs sm:text-sm md:text-base h-8 sm:h-9 md:h-10 px-3 sm:px-4 md:px-5 bg-primary-color text-white hover:bg-primary-color disabled:opacity-60 whitespace-nowrap"
                onClick={onSubmit}
            >
                {submitting ? "Submitting..." : "Generate your agent"}
            </button>
        </div>
    );
};

export default GenerateAgentButton;
