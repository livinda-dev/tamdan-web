"use client";

import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import React, {useEffect, useState} from "react";
import GoogleSignInModal from "@/app/landing/googleButton";


export default function NavBar() {
  const router = useRouter();
  const pathname = usePathname();
  const [isLoggedIn, setIsLoggedIn] = React.useState(false);
    const [isGoogleModalOpen, setIsGoogleModalOpen] = useState(false);
    const handleOpenGoogle = () => {
        setIsGoogleModalOpen(true);
    };

  const logout = () => {
    try {
      localStorage.removeItem("session");
    } catch {}
    router.replace("/landing");
  };

  useEffect(() => {
      if(localStorage.getItem("session")){
          setIsLoggedIn(true)
      }
      else{
          setIsLoggedIn(false)
      }
  })

  const linkClass = (path: string) =>
    `px-3 py-2 rounded-md text-sm font-medium ${
      pathname === path ? " underline text-color" : "text-color hover:bg-gray-700 hover:text-white"
    }`;

  return (
    <nav className="sm:px-[120px] lg:px-[120px] px-[120px] background-color">
      <div className="mx-auto ">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center">
            <div>
                <img src="/image/LogoTamdan.png" alt="Logo" className="h-auto w-auto" />
            </div>

          </div>
            <div>
                <div className="ml-10 flex items-baseline space-x-4">
                    <Link href="/" className={linkClass("/landing")}>
                        INTERESTS
                    </Link>
                    <Link href="/submit" className={linkClass("/submit")}>
                        EXPLORES
                    </Link>
                    <Link href="/submit" className={linkClass("/submit")}>
                        FAQs
                    </Link>
                </div>
            </div>
          <div className="flex items-center space-x-3">
              {
                  isLoggedIn ? (
                      <button
                          onClick={logout}
                          className="bg-red-600 text-white px-3 py-2 rounded-md text-sm hover:bg-red-500"
                      >
                          Logout
                      </button>
                  ):(
                      <div>
                          <button
                              onClick={handleOpenGoogle}
                              className="bg-primary-color text-white px-3 py-2 rounded-md text-sm cursor-pointer"
                          >
                              SIGN UP
                          </button>
                          <button
                              onClick={handleOpenGoogle}
                              className="text-color px-3 py-2 rounded-md text-sm font-bold cursor-pointer"
                          >
                              LOGIN
                          </button>
                      </div>

                  )
              }
          </div>
        </div>
      </div>
        <GoogleSignInModal isOpen={isGoogleModalOpen} onClose={() => setIsGoogleModalOpen(false)} />
    </nav>
  );
}
