"use client";

import React, {useEffect, useState} from "react";
import GoogleSignInModal from "./googleButton";
import NavBar from "@/components/NavBar";
import {useRouter} from "next/navigation";

export default function LandingPage() {
    const router = useRouter();
    const [idToken, setIdToken] = useState<string | null>(null);
    const [content, setContent] = useState("");
    const [status, setStatus] = useState<string | null>(null);
    const [submitting, setSubmitting] = useState(false);
    const [userEmail, setUserEmail] = useState<string | null>(null);
  const [isGoogleModalOpen, setIsGoogleModalOpen] = useState(false);
  const handleOpenGoogle = () => {
    setIsGoogleModalOpen(true);
  };
    useEffect(() => {
        const raw = localStorage.getItem('session');
        if (raw) {
            const session = JSON.parse(raw);
            if (session.id_token) {
                window.location.href = '/profile';
            }
        }
    }, []);
    const onSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!idToken) {
            setStatus("Not authenticated");
            return;
        }
        if (!content.trim()) {
            setStatus("Please enter something to submit.");
            return;
        }
        setSubmitting(true);
        setStatus(null);
        const arrayContent = content.split("\n").map(line => line.trim()).filter(line => line.length > 0);
        try {

            const res = await fetch("/api/entries", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${idToken}`,
                },
                body: JSON.stringify({ content: arrayContent }),
            });
            const json = await res.json();
            if (!res.ok || !json.ok) {
                setStatus(json.error || "Failed to submit");
            } else {
                setStatus("Submitted successfully!");
                setContent("");
            }
        } catch (e: any) {
            setStatus(e?.message || "Network error");
        } finally {
            setSubmitting(false);
        }
    };
  return (
      <main className="min-h-screen background-color text-gray-900">
          <NavBar/>
    <div className="min-h-screen flex flex-col items-center px-6 py-[103px]">
      {/* Title */}
        <p className="text-color tracking-widest text-center text-[36px] font-[TamdanRegular]">
            Discover smarter searching with <span className="font-bold primary-color text-[30px]">TAMDAN</span>
        </p>
      {/* Subtitle */}
      <p className="text-color tracking-widest mb-10 text-center text-[36px] font-[TamdanRegular]">
          an AI-powered agent that understands you better every time.
      </p>

        <div className="w-[744px] ">
            <p className="text-[16px] text-color mb-6 text-center ">_____Write your interests here_____</p>
            <form onSubmit={onSubmit}>
          <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={5}
              placeholder="Write something to save in Supabase..."
              className="w-full h-[320px] p-3 bg-white"
          />
                <div className="flex items-center space-x-3 absolute bottom-[10%] right-[27%] ">
                    <button
                        type="submit"
                        disabled={submitting}
                        className="w-[180px] text-[16px] h-[39px] bg-primary-color text-white px-2 py-2 rounded-md hover:bg-primary-color disabled:opacity-60"
                    >
                        {submitting ? "Submitting..." : "Generate your agent"}
                    </button>
                    {status && <span className="text-sm text-gray-700">{status}</span>}
                </div>
            </form>
            <p className="text-[16px] text-color mb-6 text-center">““Find Better. Faster. With TAMDAN.””</p>
        </div>

      {/* How it works */}
      <div className="text-center">
        <div>
            <button className=" bg-black text-white w-[200px] h-[50px] cursor-pointer" onClick={handleOpenGoogle}>Get Started</button>
        </div>
      </div>
      <GoogleSignInModal isOpen={isGoogleModalOpen} onClose={() => setIsGoogleModalOpen(false)} />
    </div>
      </main>
    );
}
