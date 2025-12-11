import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  try {
    console.log("[lead-convert] Starting conversion process");

    // Get Supabase client with proper authentication
    const supabase = await createClient();

    // Parse request body - support both FormData and JSON
    let leadId: string | null = null;
    const contentType = request.headers.get("content-type");

    if (contentType?.includes("application/json")) {
      const body = await request.json();
      leadId = body.id || body.leadId || null;
    } else {
      const formData = await request.formData();
      leadId = formData.get("id") as string | null;
    }

    if (!leadId) {
      console.error("[lead-convert] Missing lead ID in request");
      return NextResponse.json(
        { error: "Lead ID gerekli", details: "Request body must include 'id' field" },
        { status: 400 }
      );
    }

    console.log("[lead-convert] Converting lead:", leadId);

    // Fetch the lead with all available fields
    const { data: lead, error: leadError } = await supabase
      .from("crm_leads")
      .select("*")
      .eq("id", leadId)
      .single();

    if (leadError) {
      console.error("[lead-convert] Error fetching lead:", {
        error: leadError,
        code: leadError.code,
        message: leadError.message,
        details: leadError.details,
        hint: leadError.hint,
        leadId,
      });
      return NextResponse.json(
        {
          error: "Lead bulunamadı",
          details: leadError.message,
          code: leadError.code,
        },
        { status: 404 }
      );
    }

    if (!lead) {
      console.error("[lead-convert] Lead not found:", leadId);
      return NextResponse.json(
        { error: "Lead bulunamadı", details: `Lead with ID ${leadId} does not exist` },
        { status: 404 }
      );
    }

    console.log("[lead-convert] Lead found:", {
      id: lead.id,
      firma: lead.firma,
      telefon: lead.telefon,
      sektor: lead.sektor,
      sehir: lead.sehir,
    });

    // Prepare customer data with all available fields from lead
    const customerData: {
      firma: string;
      telefon: string;
      sektor?: string | null;
      sehir?: string | null;
      hizmet: string;
      odeme_durumu: string;
    } = {
      firma: lead.firma,
      telefon: lead.telefon,
      sektor: lead.sektor || null,
      sehir: lead.sehir || null,
      hizmet: "",
      odeme_durumu: "Beklemede",
    };

    // Create customer
    const { data: customer, error: customerError } = await supabase
      .from("crm_customers")
      .insert(customerData)
      .select()
      .single();

    if (customerError) {
      console.error("[lead-convert] Error creating customer:", {
        error: customerError,
        code: customerError.code,
        message: customerError.message,
        details: customerError.details,
        hint: customerError.hint,
        customerData,
      });
      return NextResponse.json(
        {
          error: "Müşteri oluşturulamadı",
          details: customerError.message,
          code: customerError.code,
        },
        { status: 500 }
      );
    }

    if (!customer) {
      console.error("[lead-convert] Customer creation returned no data");
      return NextResponse.json(
        { error: "Müşteri oluşturulamadı", details: "Customer creation returned no data" },
        { status: 500 }
      );
    }

    console.log("[lead-convert] Customer created:", customer.id);

    // Update lead status to "Satış Oldu" before deletion (optional but good practice)
    const { error: updateError } = await supabase
      .from("crm_leads")
      .update({ durum: "Satış Oldu" })
      .eq("id", leadId);

    if (updateError) {
      console.warn("[lead-convert] Warning: Could not update lead status:", updateError.message);
      // Don't fail the conversion if status update fails
    }

    // Delete the lead
    const { error: deleteError } = await supabase
      .from("crm_leads")
      .delete()
      .eq("id", leadId);

    if (deleteError) {
      console.error("[lead-convert] Error deleting lead:", {
        error: deleteError,
        code: deleteError.code,
        message: deleteError.message,
        leadId,
        customerId: customer.id,
      });
      // Customer was created, so return success but warn about deletion failure
      return NextResponse.json(
        {
          error: "Müşteri oluşturuldu ancak lead silinemedi",
          details: deleteError.message,
          customerId: customer.id,
          warning: true,
        },
        { status: 207 } // 207 Multi-Status
      );
    }

    console.log("[lead-convert] Conversion successful:", {
      leadId,
      customerId: customer.id,
    });

    // Return JSON response (API routes should return JSON, not redirects)
    return NextResponse.json(
      {
        success: true,
        message: "Lead başarıyla müşteriye dönüştürüldü",
        customerId: customer.id,
        customer: {
          id: customer.id,
          firma: customer.firma,
          telefon: customer.telefon,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    // Comprehensive error logging
    const errorMessage = error instanceof Error ? error.message : String(error);
    const errorStack = error instanceof Error ? error.stack : undefined;

    console.error("[lead-convert] Unexpected error:", {
      error,
      message: errorMessage,
      stack: errorStack,
      type: error instanceof Error ? error.constructor.name : typeof error,
    });

    return NextResponse.json(
      {
        error: "Lead conversion failed",
        details: errorMessage,
        ...(process.env.NODE_ENV === "development" && { stack: errorStack }),
      },
      { status: 500 }
    );
  }
}
