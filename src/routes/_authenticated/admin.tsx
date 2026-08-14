import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState, type FormEvent } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { formatPrice } from "@/lib/shop-config";

export const Route = createFileRoute("/_authenticated/admin")({
  head: () => ({
    meta: [
      { title: "Manage Boutique | Flower Industries" },
      { name: "description", content: "Add products, prices and review incoming orders." },
      { property: "og:title", content: "Manage Boutique | Flower Industries" },
      { property: "og:description", content: "Add products, prices and review incoming orders." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: Admin,
});

const field =
  "w-full rounded-sm border border-gold/20 bg-transparent px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/70 focus:border-gold focus:outline-none transition-colors";

function Admin() {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [saving, setSaving] = useState(false);
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data }) => {
      if (!data.user) return setIsAdmin(false);
      const { data: rows } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", data.user.id)
        .eq("role", "admin");
      setIsAdmin((rows?.length ?? 0) > 0);
    });
  }, []);

  const products = useQuery({
    queryKey: ["admin-products"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const orders = useQuery({
    queryKey: ["admin-orders"],
    enabled: isAdmin === true,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("orders")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const addProduct = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const fd = new FormData(form);
    setSaving(true);
    try {
      let imageUrl = String(fd.get("image_url") || "").trim();
      const file = fd.get("image_file") as File | null;
      if (file && file.size > 0) {
        const path = `${crypto.randomUUID()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, "")}`;
        const { error } = await supabase.storage.from("product-images").upload(path, file);
        if (error) throw error;
        imageUrl = `/api/public/product-image/${path}`;
      }
      const { error } = await supabase.from("products").insert({
        name: String(fd.get("name") || "").trim(),
        description: String(fd.get("description") || "").trim(),
        price: Number(fd.get("price") || 0),
        currency: String(fd.get("currency") || "USD"),
        category: String(fd.get("category") || "Bouquets"),
        image_url: imageUrl || null,
      });
      if (error) throw error;
      form.reset();
      toast.success("Item added to the boutique.");
      qc.invalidateQueries({ queryKey: ["admin-products"] });
      qc.invalidateQueries({ queryKey: ["products"] });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not save item");
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id: string) => {
    const { error } = await supabase.from("products").delete().eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Item removed.");
    qc.invalidateQueries({ queryKey: ["admin-products"] });
    qc.invalidateQueries({ queryKey: ["products"] });
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    navigate({ to: "/auth" });
  };

  return (
    <main className="mx-auto max-w-6xl px-6 py-20">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-4xl">
          Boutique <span className="italic gold-text">manager</span>
        </h1>
        <div className="flex gap-3">
          <Link
            to="/shop"
            className="rounded-sm border border-gold/30 px-5 py-2.5 text-[0.6rem] tracking-[0.3em] uppercase text-gold"
          >
            View shop
          </Link>
          <button
            onClick={signOut}
            className="rounded-sm border border-gold/20 px-5 py-2.5 text-[0.6rem] tracking-[0.3em] uppercase text-muted-foreground"
          >
            Sign out
          </button>
        </div>
      </div>

      {isAdmin === false && (
        <p className="mt-8 rounded-sm border border-gold/20 p-5 text-sm text-muted-foreground">
          This account is not an owner account, so it cannot manage the catalogue.
        </p>
      )}

      <section className="mt-12 rounded-sm border border-gold/15 p-7 glass-panel">
        <h2 className="text-2xl">Add an item</h2>
        <form onSubmit={addProduct} className="mt-6 space-y-3">
          <div className="grid gap-3 sm:grid-cols-2">
            <input name="name" required maxLength={120} placeholder="Item name" className={field} />
            <input name="category" placeholder="Category" className={field} />
            <input
              name="price"
              type="number"
              step="0.01"
              min="0"
              required
              placeholder="Price"
              className={field}
            />
            <input name="currency" defaultValue="USD" maxLength={3} className={field} />
          </div>
          <textarea
            name="description"
            rows={3}
            maxLength={800}
            placeholder="Description"
            className={field}
          />
          <input name="image_url" placeholder="Image URL (optional)" className={field} />
          <input
            name="image_file"
            type="file"
            accept="image/*"
            className={`${field} file:mr-4 file:rounded-sm file:border-0 file:bg-gold file:px-3 file:py-1.5 file:text-xs file:text-accent-foreground`}
          />
          <button
            type="submit"
            disabled={saving}
            className="rounded-sm bg-gold px-6 py-3 text-[0.65rem] tracking-[0.3em] uppercase text-accent-foreground disabled:opacity-60"
          >
            {saving ? "Saving…" : "Add item"}
          </button>
        </form>
      </section>

      <section className="mt-14">
        <h2 className="text-2xl">Catalogue</h2>
        <div className="mt-6 space-y-3">
          {(products.data ?? []).map((p) => (
            <div
              key={p.id}
              className="flex items-center gap-4 rounded-sm border border-gold/15 p-4"
            >
              {p.image_url && (
                <img src={p.image_url} alt={p.name} className="h-14 w-14 rounded-sm object-cover" />
              )}
              <div className="flex-1">
                <p className="text-lg">{p.name}</p>
                <p className="text-xs text-muted-foreground">{p.category}</p>
              </div>
              <span className="gold-text font-display text-xl">
                {formatPrice(Number(p.price), p.currency)}
              </span>
              <button
                onClick={() => remove(p.id)}
                aria-label={`Remove ${p.name}`}
                className="text-muted-foreground transition-colors hover:text-destructive"
              >
                <Trash2 size={18} />
              </button>
            </div>
          ))}
          {products.data?.length === 0 && (
            <p className="text-sm text-muted-foreground">No items yet.</p>
          )}
        </div>
      </section>

      <section className="mt-14">
        <h2 className="text-2xl">Orders</h2>
        <div className="mt-6 space-y-3">
          {(orders.data ?? []).map((o) => (
            <div key={o.id} className="rounded-sm border border-gold/15 p-4 text-sm">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="text-base">
                  {o.quantity} × {o.product_name}
                </p>
                <span className="gold-text font-display text-lg">
                  {formatPrice(Number(o.unit_price) * o.quantity, o.currency)}
                </span>
              </div>
              <p className="mt-2 text-muted-foreground">
                {o.customer_name} · {o.customer_email} · {o.country} {o.phone}
              </p>
              {o.message && <p className="mt-2 text-muted-foreground">{o.message}</p>}
              <a
                href={`mailto:${o.customer_email}?subject=${encodeURIComponent(`Your order — ${o.product_name}`)}`}
                className="mt-3 inline-block text-[0.6rem] tracking-[0.3em] uppercase text-gold"
              >
                Reply by email
              </a>
            </div>
          ))}
          {orders.data?.length === 0 && (
            <p className="text-sm text-muted-foreground">No orders yet.</p>
          )}
        </div>
      </section>
    </main>
  );
}