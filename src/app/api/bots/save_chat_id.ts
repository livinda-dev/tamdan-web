import { createClient, PostgrestError } from "@supabase/supabase-js";

export default async function handler(req: { method: string; body: { email: any; chat_id: any; }; }, res: { status: (arg0: number) => { (): any; new(): any; end: { (): any; new(): any; }; json: { (arg0: { error?: PostgrestError; success?: boolean; }): any; new(): any; }; }; }) {
  if (req.method !== "POST") return res.status(405).end();

  const { email, chat_id } = req.body;

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { data, error } = await supabase
    .from("user")
    .update({ chat_id })
    .eq("email", email);

  if (error) return res.status(400).json({ error });

  return res.status(200).json({ success: true });
}
