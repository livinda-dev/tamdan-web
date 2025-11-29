"use client";

import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import React, { useEffect, useState, useRef } from "react";
import GoogleSignInModal from "@/components/googleButton";

function decodeJwtPayload<T = unknown>(jwt?: string): T | null {
  if (!jwt) return null;
  const parts = jwt.split(".");
  if (parts.length < 2) return null;
  const payloadB64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
  try {
    const padded = payloadB64 + "===".slice((payloadB64.length + 3) % 4);
    const json =
      typeof window !== "undefined"
        ? decodeURIComponent(escape(window.atob(padded)))
        : Buffer.from(padded, "base64").toString("utf8");
    return JSON.parse(json) as T;
  } catch {
    return null;
  }
}

export default function NavBar() {
  const router = useRouter();
  const pathname = usePathname();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isGoogleModalOpen, setIsGoogleModalOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [userName, setUserName] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const handleOpenGoogle = () => {
    setIsGoogleModalOpen(true);
  };

  const logout = () => {
    try {
      localStorage.removeItem("session");
      localStorage.removeItem("currentEmail");
      localStorage.removeItem("currentIdToken");
    } catch {}
    setIsLoggedIn(false);
    router.replace("/");
  };

  useEffect(() => {
    async function loadUser() {
      const sessionRaw = localStorage.getItem("session");
      if (!sessionRaw) {
        setIsLoggedIn(false);
        setUserEmail(null);
        setUserName(null);
        return;
      }

      setIsLoggedIn(true);

      try {
        const parsed = JSON.parse(sessionRaw) as { id_token?: string };
        const idToken = parsed.id_token;
        if (!idToken) {
          setIsLoggedIn(false);
          return;
        }

        // Try fetching profile from server (uses same Authorization check as /profile page)
        const res = await fetch("/api/profile", {
          headers: { Authorization: `Bearer ${idToken}` },
        });
        const json = await res.json();

        if (json?.ok && json.user) {
          setUserEmail(json.user.email ?? null);
          // prefer username from DB; fall back to name claim
          const nameFromJwt = decodeJwtPayload<{ name?: string }>(idToken)?.name ?? null;
          setUserName(json.user.username ?? nameFromJwt);
        } else {
          // fallback to token decode for basic display
          const claims = decodeJwtPayload<{ email?: string; name?: string }>(idToken);
          setUserEmail(claims?.email ?? null);
          setUserName(claims?.name ?? null);
        }
      } catch (err) {
        console.error("NavBar loadUser failed", err);
        try {
          const parsed = JSON.parse(localStorage.getItem("session") || "{}") as {
            id_token?: string;
          };
          const claims = decodeJwtPayload<{ email?: string; name?: string }>(
            parsed.id_token
          );
          setUserEmail(claims?.email ?? null);
          setUserName(claims?.name ?? null);
        } catch {}
      }
    }

    loadUser();
  }, [pathname]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [dropdownRef]);

  const linkClass = (path: string) =>
    `px-3 py-2 text-sm font-medium ${
      pathname === path ? " underline text-color" : "text-color"
    }`;

  return (
    <nav className="background-color shadow-md">
      <div className="mx-auto sm:px-[120px] lg:px-[120px] px-[120px]">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center">
            <div>
              <img
                src="/image/LogoTamdan.png"
                alt="Logo"
                className="h-8 w-auto"
              />
            </div>
          </div>
          <div>
            <div className="ml-10 flex items-baseline space-x-4">
              <Link href="/interest" className={linkClass("/interest")}>
                  INTERESTS
                </Link>
              <Link href="/explore" className={linkClass("/explore")}>
                EXPLORES
              </Link>
              <Link href="/faqs" className={linkClass("/faqs")}>
                FAQs
              </Link>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            {isLoggedIn ? (
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="flex items-center justify-center"
                >
                  <p className=" text-black cursor-pointer font-bold">PROFILE</p>
                </button>
                {isDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white shadow-lg py-1 z-10">
                    <div 
                      className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                      onClick={() => {
                        router.push("/profile");
                        setIsDropdownOpen(false);
                      }}
                    >
                      <p className="text-sm text-gray-700 font-medium">{userName}</p>
                      <p className="text-sm text-gray-500 truncate">
                        {userEmail}
                      </p>
                    </div>
                    <div className="border-t border-gray-100"></div>
                    <button
                      onClick={() => {
                        if (!userEmail) {
                          alert("Please sign in first.");
                          return;
                        }

                        const emailParam = encodeURIComponent(userEmail);

                        // Mobile & some desktop clients will auto-send `/start email`
                        window.location.href = `https://t.me/tamdanNewsBot?start=${emailParam}`;
                      }}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer"
                    >
                      Connect with telegram
                    </button>
                    <div className="border-t border-gray-100"></div>
                    <button
                      onClick={logout}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-red-500 cursor-pointer"
                    >
                      Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div>
                <button
                  onClick={handleOpenGoogle}
                  className="bg-primary-color text-white px-3 py-2 text-sm cursor-pointer"
                >
                  SIGN UP
                </button>
                <button
                  onClick={handleOpenGoogle}
                  className="text-color px-3 py-2 text-sm font-bold cursor-pointer"
                >
                  LOGIN
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
      <GoogleSignInModal
        isOpen={isGoogleModalOpen}
        onClose={() => setIsGoogleModalOpen(false)}
      />
    </nav>
  );
}