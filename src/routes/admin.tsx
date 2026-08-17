import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState, type FormEvent } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { formatPrice } from "@/lib/shop-config";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Manage Boutique | Flower Industries" },
      { name: "description", content: "Admin dashboard to manage products, offers and orders." },
      { property: "og:title", content: "Manage Boutique | Flower Industries" },
      { property: "og:description", content: "Admin dashboard to manage products, offers and orders." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AdminPage,
});

const field =
  "w-full rounded-sm border border-gold/20 bg-transparent px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/70 focus:border-gold focus:outline-none transition-colors";

const ADMIN_EMAIL = "mhdrifnas194@gmail.com";

function AdminPage() {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [user, setUser] = useState<any>(null);
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [busy, setBusy] = useState(false);
  const [productSaving, setProductSaving] = useState(false);
  const [offerSaving, setOfferSaving] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user && data.user.email === ADMIN_EMAIL) {
        setUser(data.user);
      } else if (data.user) {
        setUser(null);
        toast.error("This admin panel is restricted to the owner only.");
      }
    });

    const { data: authListener } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (!session?.user) {
        setUser(null);
        return;
      }
      if (session.user.email === ADMIN_EMAIL) {
        setUser(session.user);
      } else {
        setUser(null);
        toast.error("This admin panel is restricted to the owner only.");
      }
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
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

  const offers = useQuery({
    queryKey: ["admin-offers"],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from("offers")
          .select("*")
          .order("created_at", { ascending: false });
        if (error) {
          console.warn("Offers table not ready:", error);
          return [];
        }
        return data || [];
      } catch (err) {
        console.warn("Offers fetch error:", err);
        return [];
      }
    },
  });

  const orders = useQuery({
    queryKey: ["admin-orders"],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("orders")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const submit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const email = String(form.get("email") || "").trim();
    const password = String(form.get("password") || "");
    setBusy(true);
    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: window.location.origin },
        });
        if (error) throw error;
        toast.success("Account created. Check your inbox if confirmation is required.");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;

        if (email !== ADMIN_EMAIL) {
          await supabase.auth.signOut();
          toast.error("This admin panel is restricted to the owner only.");
          return;
        }
      }
      const { data } = await supabase.auth.getUser();
      if (data.user?.email === ADMIN_EMAIL) {
        setUser(data.user);
        setMode("signin");
      } else {
        toast.error("Access denied. Only the owner can use this panel.");
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Sign in failed");
    } finally {
      setBusy(false);
    }
  };

  const addProduct = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const fd = new FormData(form);
    setProductSaving(true);
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
      setProductSaving(false);
    }
  };

  const removeProduct = async (id: string) => {
    const { error } = await supabase.from("products").delete().eq("id", id);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Item removed.");
    qc.invalidateQueries({ queryKey: ["admin-products"] });
    qc.invalidateQueries({ queryKey: ["products"] });
  };

  const addOffer = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const fd = new FormData(form);
    setOfferSaving(true);
    try {
      const { error } = await supabase.from("offers").insert({
        title: String(fd.get("title") || "").trim(),
        description: String(fd.get("description") || "").trim(),
        discount_percent: Number(fd.get("discount_percent") || 0),
        valid_until: String(fd.get("valid_until") || ""),
      });
      if (error) {
        if (error.message.includes("offers")) {
          toast.error("Please set up the offers table in Supabase first using the migration SQL.");
        } else {
          throw error;
        }
        return;
      }
      form.reset();
      toast.success("Offer created.");
      qc.invalidateQueries({ queryKey: ["admin-offers"] });
      qc.invalidateQueries({ queryKey: ["offers"] });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not save offer");
    } finally {
      setOfferSaving(false);
    }
  };

  const removeOffer = async (id: string) => {
    try {
      const { error } = await supabase.from("offers").delete().eq("id", id);
      if (error) {
        toast.error(error.message);
        return;
      }
      toast.success("Offer removed.");
      qc.invalidateQueries({ queryKey: ["admin-offers"] });
      qc.invalidateQueries({ queryKey: ["offers"] });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not delete offer");
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    toast.success("Signed out.");
  };

  if (!user) {
    return (
      <main className="flex min-h-screen items-center justify-center px-6 py-24">
        <div className="w-full max-w-sm rounded-sm border border-gold/15 p-8 glass-panel">
          <h1 className="text-3xl">
            Owner <span className="italic gold-text">access</span>
          </h1>
          <p className="mt-3 text-sm text-muted-foreground">
            Sign in to manage products, offers and view orders.
          </p>
          <form onSubmit={submit} className="mt-8 space-y-3">
            <input name="email" type="email" required placeholder="Email" className={field} />
            <input
              name="password"
              type="password"
              required
              minLength={6}
              placeholder="Password"
              className={field}
            />
            <button
              type="submit"
              disabled={busy}
              className="w-full rounded-sm bg-gold px-6 py-3 text-[0.65rem] tracking-[0.3em] uppercase text-accent-foreground disabled:opacity-60"
            >
              {mode === "signin" ? "Sign in" : "Create account"}
            </button>
          </form>
          <button
            onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
            className="mt-6 w-full text-[0.65rem] tracking-[0.25em] uppercase text-muted-foreground hover:text-gold"
          >
            {mode === "signin" ? "Need an account?" : "Have an account? Sign in"}
          </button>
        </div>
      </main>
    );
  }

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

      {/* Add Product Section */}
      <section className="mt-12 rounded-sm border border-gold/15 p-7 glass-panel">
        <h2 className="text-2xl">Add a product</h2>
        <form onSubmit={addProduct} className="mt-6 space-y-3">
          <div className="grid gap-3 sm:grid-cols-2">
            <input name="name" required maxLength={120} placeholder="Product name" className={field} />
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
            disabled={productSaving}
            className="rounded-sm bg-gold px-6 py-3 text-[0.65rem] tracking-[0.3em] uppercase text-accent-foreground disabled:opacity-60"
          >
            {productSaving ? "Saving…" : "Add product"}
          </button>
        </form>
      </section>

      {/* Add Offer Section */}
      <section className="mt-12 rounded-sm border border-gold/15 p-7 glass-panel">
        <h2 className="text-2xl">Create an offer</h2>
        <form onSubmit={addOffer} className="mt-6 space-y-3">
          <div className="grid gap-3 sm:grid-cols-2">
            <input name="title" required maxLength={120} placeholder="Offer title" className={field} />
            <input
              name="discount_percent"
              type="number"
              step="0.01"
              min="0"
              max="100"
              required
              placeholder="Discount %"
              className={field}
            />
          </div>
          <textarea
            name="description"
            rows={3}
            maxLength={800}
            placeholder="Offer description"
            className={field}
          />
          <input
            name="valid_until"
            type="datetime-local"
            required
            className={field}
          />
          <button
            type="submit"
            disabled={offerSaving}
            className="rounded-sm bg-gold px-6 py-3 text-[0.65rem] tracking-[0.3em] uppercase text-accent-foreground disabled:opacity-60"
          >
            {offerSaving ? "Saving…" : "Create offer"}
          </button>
        </form>
      </section>

      {/* Products Catalogue */}
      <section className="mt-14">
        <h2 className="text-2xl">Products catalogue</h2>
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
                onClick={() => removeProduct(p.id)}
                aria-label={`Remove ${p.name}`}
                className="text-muted-foreground transition-colors hover:text-destructive"
              >
                <Trash2 size={18} />
              </button>
            </div>
          ))}
          {products.data?.length === 0 && (
            <p className="text-sm text-muted-foreground">No products yet.</p>
          )}
        </div>
      </section>

      {/* Active Offers */}
      <section className="mt-14">
        <h2 className="text-2xl">Active offers</h2>
        <div className="mt-6 space-y-3">
          {(offers.data ?? []).map((o: any) => (
            <div key={o.id} className="rounded-sm border border-gold/15 p-4">
              <div className="flex items-center justify-between gap-3">
                <div className="flex-1">
                  <p className="text-lg">{o.title}</p>
                  <p className="text-sm text-muted-foreground">{o.description}</p>
                  <p className="mt-1 text-xs text-gold">
                    {o.discount_percent}% off until {new Date(o.valid_until).toLocaleDateString()}
                  </p>
                </div>
                <button
                  onClick={() => removeOffer(o.id)}
                  aria-label={`Remove ${o.title}`}
                  className="text-muted-foreground transition-colors hover:text-destructive"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          ))}
          {offers.data?.length === 0 && (
            <p className="text-sm text-muted-foreground">No offers yet.</p>
          )}
        </div>
      </section>

      {/* Orders */}
      <section className="mt-14 pb-20">
        <h2 className="text-2xl">Incoming orders</h2>
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
                {o.customer_name} ({o.customer_email}) • {o.phone}
              </p>
              {o.message && (
                <p className="mt-1 text-muted-foreground">Message: {o.message}</p>
              )}
              <p className="mt-1 text-xs text-muted-foreground">
                {new Date(o.created_at).toLocaleString()}
              </p>
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
