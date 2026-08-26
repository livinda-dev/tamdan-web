"use client";

import React, { useEffect, useState } from "react";
import Divider from "@/components/divider";
import MyMarquee from "./marquee";
import { DEFAULT_SITE_SETTINGS, SiteSettings } from "@/types/settings";

export default function Footer() {
  const [settings, setSettings] = useState<SiteSettings>(DEFAULT_SITE_SETTINGS);

  useEffect(() => {
    let isMounted = true;

    async function fetchSettings() {
      try {
        const res = await fetch("/api/site-settings");
        if (!res.ok) return;
        const json = await res.json();
        if (json.ok && json.data && isMounted) {
          setSettings(json.data);
        }
      } catch (err) {
        console.error("Failed to load site settings for footer:", err);
      }
    }

    fetchSettings();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <footer className="bg-primary-color text-white pt-6 md:pt-8 lg:pt-10">
      <div className="px-4 sm:px-6 md:px-12 lg:px-[120px]">
        {/* Contact Information */}
        <div className="mb-6 space-y-3">
          {settings.address && (
            <a
              href={settings.address_map_url || "#"}
              target="_blank"
              rel="noopener noreferrer"
              className="font-[TamdanRegular] text-sm md:text-base flex flex-col md:flex-row md:items-start gap-1 md:gap-0 hover:opacity-90 transition-opacity"
            >
              <strong className="font-[TamdanBold] flex-shrink-0">Address:</strong>
              <span className="block md:inline">{settings.address}</span>
            </a>
          )}
          {settings.email && (
            <a
              href={`mailto:${settings.email}`}
              className="font-[TamdanRegular] text-sm md:text-base flex items-center gap-1 hover:opacity-90 transition-opacity"
            >
              <strong className="font-[TamdanBold] flex-shrink-0">Email:</strong>
              <span>{settings.email}</span>
            </a>
          )}
        </div>

        <Divider />

        {/* Footer Logo and Copyright */}
        <div className="text-center mt-6 space-y-2">
          <img
            src={settings.footer_logo_url || DEFAULT_SITE_SETTINGS.footer_logo_url}
            alt="TAMDAN Logo"
            className="h-auto w-auto mx-auto mb-1 max-h-12 md:max-h-16 object-contain"
          />
          <p className="font-[TamdanRegular] text-xs md:text-sm px-2 leading-relaxed">
            {settings.copyright || DEFAULT_SITE_SETTINGS.copyright}
          </p>
        </div>
      </div>
      <MyMarquee />
    </footer>
  );
}