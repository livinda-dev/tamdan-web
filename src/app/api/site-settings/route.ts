// src/app/api/site-settings/route.ts
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { DEFAULT_SITE_SETTINGS, SiteSettings } from "@/types/settings";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const supabase = getSupabaseServerClient();
    if (!supabase) {
      return Response.json({
        ok: true,
        data: DEFAULT_SITE_SETTINGS,
        source: "fallback",
      });
    }

    const { data, error } = await supabase
      .from("site_settings")
      .select("*")
      .order("updated_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) {
      console.warn("[Site Settings API] query warning:", error.message);
      return Response.json({
        ok: true,
        data: DEFAULT_SITE_SETTINGS,
        source: "fallback",
      });
    }

    if (!data) {
      return Response.json({
        ok: true,
        data: DEFAULT_SITE_SETTINGS,
        source: "fallback",
      });
    }

    const settings: SiteSettings = {
      id: data.id,
      logo_url: data.logo_url || DEFAULT_SITE_SETTINGS.logo_url,
      footer_logo_url: data.footer_logo_url || DEFAULT_SITE_SETTINGS.footer_logo_url,
      address: data.address || DEFAULT_SITE_SETTINGS.address,
      address_map_url: data.address_map_url || DEFAULT_SITE_SETTINGS.address_map_url,
      email: data.email || DEFAULT_SITE_SETTINGS.email,
      copyright: data.copyright || DEFAULT_SITE_SETTINGS.copyright,
      created_at: data.created_at,
      updated_at: data.updated_at,
    };

    return Response.json({ ok: true, data: settings, source: "database" });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    console.error("[Site Settings API] Unexpected error:", msg);
    return Response.json({
      ok: true,
      data: DEFAULT_SITE_SETTINGS,
      source: "fallback",
      error: msg,
    });
  }
}
