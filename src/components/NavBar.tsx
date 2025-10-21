"use client";

import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import React from "react";

export default function NavBar() {
  const router = useRouter();
  const pathname = usePathname();

  const logout = () => {
    try {
      localStorage.removeItem("session");
    } catch {}
    router.replace("/landing");
  };

  const linkClass = (path: string) =>
    `px-3 py-2 rounded-md text-sm font-medium ${
      pathname === path ? "bg-gray-900 text-white" : "text-gray-300 hover:bg-gray-700 hover:text-white"
    }`;

  return (
    <nav className="bg-gray-800">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center">
            <div className="flex-shrink-0 text-white font-semibold">Tamdan</div>
            <div className="ml-10 flex items-baseline space-x-4">
              <Link href="/profile" className={linkClass("/profile")}>
                Profile
              </Link>
              <Link href="/submit" className={linkClass("/submit")}>
                Submit
              </Link>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={logout}
              className="bg-red-600 text-white px-3 py-2 rounded-md text-sm hover:bg-red-500"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
