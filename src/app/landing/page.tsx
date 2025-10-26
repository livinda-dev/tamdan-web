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
        } catch (e: unknown) {
            // setStatus(e?.message || "Network error");
            setStatus("Network error");

        } finally {
            setSubmitting(false);
        }
    };
  return (
      <main className="min-h-screen background-color text-gray-900">
          <NavBar/>
    <div className="min-h-screen flex flex-col items-center py-[103px]">
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
                <div className="flex items-center space-x-3 absolute bottom-[13%] right-[27%] ">
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

        <div className="w-full bg-[#EFF0EC] px-[117px] py-[44px]">
            <div >
                <p className="text-[18px] leading-relaxed font-normal text-[#1A1A1A]">
                  <span className="float-left text-[56px] font-[TamdanBold] leading-[0.8] mr-3 mt-1">
                    T
                  </span>
                    AMDAN is an intelligent,
                    AI-powered search companion designed to keep you informed and connected.
                    Powered by advanced technologies like GPT-5 and n8n automation,
                    TAMDAN goes beyond ordinary search — it gathers real-time news,
                    analyzes trusted sources, and delivers  beyond ordinary search — it gathers real-time news,
                    analyzes trusted sources, and delivers personalized insights that matter to you.
                </p>
            </div>
            <div className="mt-[44px]">
                <p>Stay ahead effortlessly with instant alerts through Telegram chatbot notifications or in-app messages whenever new updates match your interests.</p>
            </div>
            <div className="flex justify-around mt-[44px]">
                <div className="flex items-center space-x-3 bg-white px-[9px] py-[7px] w-[392px] h-[71px] ">
                    <img src="/image/telegram.png" alt="Telegram" className="h-auto w-auto"/>
                    <p className="text-[24px]">TELEGRAM CHATBOT</p>
                </div>
                <div className="flex items-center space-x-3 bg-white px-[9px] py-[7px] w-[392px] h-[71px] ">
                    <img src="/image/gmail.png" alt="Telegram" className="h-auto w-auto"/>
                    <p className="text-[24px]">ALERT BY GMAIL</p>
                </div>
                <div className="flex items-center space-x-3 bg-white px-[9px] py-[7px] w-[392px] h-[71px] ">
                    <img src="/image/sms.png" alt="Telegram" className="h-auto w-auto"/>
                    <p className="text-[24px]">SMS MESSAGE APP</p>
                </div>
            </div>
            <div className="mt-[44px]">
                <p>Whether it’s daily news, research insights, or topic-specific trends,
                    TAMDAN ensures you never miss what’s important — your intelligent search partner,
                    powered by AI.</p>
            </div>
        </div>

        <div>
            <button className=" bg-black text-white w-[200px] h-[50px] cursor-pointer" onClick={handleOpenGoogle}>Get
                Started
            </button>
        </div>
        <GoogleSignInModal isOpen={isGoogleModalOpen} onClose={() => setIsGoogleModalOpen(false)} />
    </div>
      </main>
    );
}
