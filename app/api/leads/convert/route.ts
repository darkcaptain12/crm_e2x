import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const id = formData.get("id") as string;

    if (!id) {
      return NextResponse.json({ error: "ID gerekli" }, { status: 400 });
    }

    const { data: lead, error: leadError } = await supabase
      .from("crm_leads")
      .select("firma, telefon, sektor, kaynak")
      .eq("id", id)
      .single();

    if (leadError || !lead) {
      return NextResponse.json({ error: "Lead bulunamadı" }, { status: 404 });
    }

    const { error: customerError } = await supabase
      .from("crm_customers")
      .insert({
        firma: lead.firma,
        telefon: lead.telefon,
        sektor: lead.sektor,
        hizmet: "",
        odeme_durumu: "Beklemede",
      });

    if (customerError) {
      return NextResponse.json(
        { error: customerError.message },
        { status: 500 }
      );
    }

    const { error: deleteError } = await supabase
      .from("crm_leads")
      .delete()
      .eq("id", id);

    if (deleteError) {
      return NextResponse.json(
        { error: deleteError.message },
        { status: 500 }
      );
    }

    return NextResponse.redirect(new URL("/leads", request.url), { status: 302 });
  } catch (error) {
    return NextResponse.json(
      { error: "Sunucu hatası" },
      { status: 500 }
    );
  }
}
