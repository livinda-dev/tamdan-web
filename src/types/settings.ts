export interface SiteSettings {
  id?: string;
  logo_url: string;
  footer_logo_url: string;
  address: string;
  address_map_url: string;
  email: string;
  copyright: string;
  created_at?: string;
  updated_at?: string;
}

export const DEFAULT_SITE_SETTINGS: SiteSettings = {
  logo_url: "/image/LogoTamdan.png",
  footer_logo_url: "/image/footerLogo.png",
  address:
    "Bridge 2, National Road 6A, Sangkat Prek Leap, Khan Chroy Changva, Phnom Penh",
  address_map_url: "https://maps.app.goo.gl/aKbjnkyvMnWQCgsT6",
  email: "tamdan.cadt@gmail.com",
  copyright:
    "©2025 All Rights Reserved | Capstone 2, Group 7, Generation 9 of Cambodia Academy of Digital Technology",
};
