
"use client";

import React from "react";

interface GenerateAgentButtonProps {
    submitting: boolean;
    onSubmit: (e: React.FormEvent) => void;
}

const GenerateAgentButton: React.FC<GenerateAgentButtonProps> = ({ submitting, onSubmit }) => {
    return (
        <div className="absolute bottom-4 right-4">
            <button
                type="submit"
                disabled={submitting}
                className="w-full md:w-[180px] text-[16px] h-[39px] bg-primary-color text-white px-2 pb-0.5 hover:bg-primary-color disabled:opacity-60"
                onClick={onSubmit}
            >
                {submitting ? "Submitting..." : "Generate your agent"}
            </button>
        </div>
    );
};

export default GenerateAgentButton;
