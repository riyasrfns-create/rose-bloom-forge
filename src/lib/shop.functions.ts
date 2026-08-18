import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";
import type { Database } from "@/integrations/supabase/types";

const orderSchema = z.object({
  productId: z.string().uuid(),
  quantity: z.number().int().min(1).max(1000),
  customerName: z.string().trim().min(1).max(100),
  customerEmail: z.string().trim().email().max(255),
  country: z.string().trim().max(100).default(""),
  phone: z.string().trim().max(40).default(""),
  message: z.string().trim().max(1000).default(""),
});

function publicClient() {
  const key = process.env["SUPABASE_PUBLISHABLE_KEY"]!;
  return createClient<Database>(process.env["SUPABASE_URL"]!, key, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: {
      fetch: (input, init) => {
        const h = new Headers(init?.headers);
        if (key.startsWith("sb_") && h.get("Authorization") === `Bearer ${key}`) {
          h.delete("Authorization");
        }
        h.set("apikey", key);
        return fetch(input, { ...init, headers: h });
      },
    },
  });
}

export const listProducts = createServerFn({ method: "GET" }).handler(async () => {
  const { data, error } = await publicClient()
    .from("products")
    .select("id, name, description, price, currency, image_url, category")
    .eq("is_active", true)
    .order("created_at", { ascending: false });
  if (error) return { products: [], error: "Catalogue unavailable" };
  return { products: data ?? [], error: null };
});

export const placeOrder = createServerFn({ method: "POST" })
  .validator((input: unknown) => orderSchema.parse(input))
  .handler(async ({ data }) => {
    const supabase = publicClient();
    const { data: product, error: productError } = await supabase
      .from("products")
      .select("id, name, price, currency")
      .eq("id", data.productId)
      .eq("is_active", true)
      .maybeSingle();
    if (productError || !product) return { ok: false as const, error: "Item unavailable" };

    const { error } = await supabase.from("orders").insert({
      product_id: product.id,
      product_name: product.name,
      unit_price: product.price,
      currency: product.currency,
      quantity: data.quantity,
      customer_name: data.customerName,
      customer_email: data.customerEmail,
      country: data.country,
      phone: data.phone,
      message: data.message,
    });
    if (error) return { ok: false as const, error: "Could not record your order" };
    return { ok: true as const, error: null };
  });