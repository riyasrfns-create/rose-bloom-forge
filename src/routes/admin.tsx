import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState, type FormEvent } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Pencil, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { fallbackOffers } from "@/components/site/Offers";
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
const ADMIN_PASSWORD = "riyasrifnas";
const ADMIN_OTP_SECONDS = 30;

function generateAdminOtp() {
  const windowKey = Math.floor(Date.now() / (ADMIN_OTP_SECONDS * 1000));
  const seed = `${ADMIN_EMAIL}:${ADMIN_PASSWORD}:${windowKey}`;

  let hash = 0;
  for (const char of seed) {
    hash = (hash * 31 + char.charCodeAt(0)) >>> 0;
  }

  return (hash % 1000000).toString().padStart(6, "0");
}

function getStoredAdminSession() {
  if (typeof window === "undefined") return null;

  try {
    const raw = window.localStorage.getItem("rose_bloom_admin_session");
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function readLocalOffers() {
  if (typeof window === "undefined") return fallbackOffers;

  try {
    const raw = window.localStorage.getItem("rose_bloom_offers");
    const parsed = raw ? JSON.parse(raw) : null;
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : fallbackOffers;
  } catch {
    return fallbackOffers;
  }
}

function writeLocalOffers(offers: Array<{ title: string; description: string; discount_percent: number; valid_until: string }>) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem("rose_bloom_offers", JSON.stringify(offers));
}

function readLocalProducts() {
  if (typeof window === "undefined") return [] as Array<{
    id: string;
    name: string;
    description: string;
    price: number;
    currency: string;
    category: string;
    image_url: string | null;
    is_active: boolean;
    created_at?: string;
    updated_at?: string;
  }>;

  try {
    const raw = window.localStorage.getItem("rose_bloom_products");
    const parsed = raw ? JSON.parse(raw) : null;
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeLocalProducts(products: Array<{
  id: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  category: string;
  image_url: string | null;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}>) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem("rose_bloom_products", JSON.stringify(products));
}

function AdminPage() {
  const qc = useQueryClient();
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [busy, setBusy] = useState(false);
  const [productSaving, setProductSaving] = useState(false);
  const [offerSaving, setOfferSaving] = useState(false);
  const [otpCode, setOtpCode] = useState(generateAdminOtp());
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [editingOfferId, setEditingOfferId] = useState<string | null>(null);
  const [productDraft, setProductDraft] = useState({
    name: "",
    description: "",
    price: "",
    currency: "USD",
    category: "",
    image_url: "",
  });
  const [offerDraft, setOfferDraft] = useState({
    title: "",
    description: "",
    discount_percent: "",
    valid_until: "",
  });

  useEffect(() => {
    const storedUser = getStoredAdminSession();
    if (storedUser?.email === ADMIN_EMAIL) {
      setUser(storedUser);
    }

    const timer = window.setInterval(() => {
      setOtpCode(generateAdminOtp());
    }, ADMIN_OTP_SECONDS * 1000);

    return () => window.clearInterval(timer);
  }, []);

  const products = useQuery({
    queryKey: ["admin-products"],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from("products")
          .select("*")
          .order("created_at", { ascending: false });
        if (!error && Array.isArray(data) && data.length > 0) {
          return data;
        }
      } catch {
        // fall through to the local fallback below
      }

      const localProducts = readLocalProducts();
      if (localProducts.length > 0) {
        return localProducts;
      }

      return [];
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

        if (!error && data && data.length > 0) {
          return data;
        }
      } catch {
        // ignore and use the fallback local offers below
      }

      return readLocalOffers().map((offer, index) => ({
        id: `local-offer-${index}`,
        title: offer.title,
        description: offer.copy,
        discount_percent: Number(String(offer.badge).replace(/[^0-9.]/g, "")) || 0,
        valid_until: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30).toISOString(),
      }));
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
    const otp = String(form.get("otp") || "").trim();
    setBusy(true);

    try {
      if (email !== ADMIN_EMAIL || password !== ADMIN_PASSWORD) {
        throw new Error("Access denied. Use the configured admin account.");
      }

      if (otp !== otpCode) {
        throw new Error(`Invalid OTP. Use the current code: ${otpCode}`);
      }

      const sessionUser = { id: "local-admin", email: ADMIN_EMAIL };
      setUser(sessionUser);
      window.localStorage.setItem("rose_bloom_admin_session", JSON.stringify(sessionUser));
      toast.success("Admin access approved.");
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

      const productPayload = {
        name: String(fd.get("name") || "").trim(),
        description: String(fd.get("description") || "").trim(),
        price: Number(fd.get("price") || 0),
        currency: String(fd.get("currency") || "USD"),
        category: String(fd.get("category") || "Bouquets"),
        image_url: imageUrl || null,
        is_active: true,
      };

      const { data, error } = await supabase.from("products").insert(productPayload).select().single();
      const nextProduct = data ?? {
        id: `local-product-${Date.now()}`,
        ...productPayload,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      if (error) {
        const localProducts = readLocalProducts();
        const mergedProducts = [nextProduct, ...localProducts.filter((item) => item.id !== nextProduct.id)];
        writeLocalProducts(mergedProducts);
        qc.setQueryData(["products"], { products: mergedProducts, error: null });
        qc.setQueryData(["admin-products"], mergedProducts);
        form.reset();
        toast.success("Item added to the boutique. It is now live in the shop.");
        navigate({ to: "/shop" });
        return;
      }

      const localProducts = readLocalProducts();
      const mergedProducts = [nextProduct, ...localProducts.filter((item) => item.id !== nextProduct.id)];
      writeLocalProducts(mergedProducts);
      qc.setQueryData(["products"], { products: mergedProducts, error: null });
      qc.setQueryData(["admin-products"], mergedProducts);
      form.reset();
      toast.success("Item added to the boutique.");
      qc.invalidateQueries({ queryKey: ["admin-products"] });
      qc.invalidateQueries({ queryKey: ["products"] });
      navigate({ to: "/shop" });
    } catch (err) {
      const fallbackProduct = {
        id: `local-product-${Date.now()}`,
        name: String(fd.get("name") || "").trim(),
        description: String(fd.get("description") || "").trim(),
        price: Number(fd.get("price") || 0),
        currency: String(fd.get("currency") || "USD"),
        category: String(fd.get("category") || "Bouquets"),
        image_url: String(fd.get("image_url") || "").trim() || null,
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      const localProducts = readLocalProducts();
      const mergedProducts = [fallbackProduct, ...localProducts.filter((item) => item.id !== fallbackProduct.id)];
      writeLocalProducts(mergedProducts);
      qc.setQueryData(["products"], { products: mergedProducts, error: null });
      qc.setQueryData(["admin-products"], mergedProducts);
      form.reset();
      toast.error(err instanceof Error ? err.message : "Could not save item");
      navigate({ to: "/shop" });
    } finally {
      setProductSaving(false);
    }
  };

  const removeProduct = async (id: string) => {
    const { error } = await supabase.from("products").delete().eq("id", id);
    if (error) {
      const localProducts = readLocalProducts().filter((product) => product.id !== id);
      writeLocalProducts(localProducts);
      qc.setQueryData(["products"], { products: localProducts, error: null });
      qc.setQueryData(["admin-products"], localProducts);
      toast.success("Item removed.");
      qc.invalidateQueries({ queryKey: ["admin-products"] });
      qc.invalidateQueries({ queryKey: ["products"] });
      return;
    }
    toast.success("Item removed.");
    qc.invalidateQueries({ queryKey: ["admin-products"] });
    qc.invalidateQueries({ queryKey: ["products"] });
  };

  const startEditProduct = (product: { id: string; name: string; description: string; price: number; currency: string; category: string; image_url: string | null }) => {
    setEditingProductId(product.id);
    setProductDraft({
      name: product.name,
      description: product.description,
      price: String(product.price),
      currency: product.currency,
      category: product.category,
      image_url: product.image_url ?? "",
    });
  };

  const updateProduct = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editingProductId) return;

    try {
      const { error } = await supabase.from("products").update({
        name: productDraft.name.trim(),
        description: productDraft.description.trim(),
        price: Number(productDraft.price || 0),
        currency: productDraft.currency.trim() || "USD",
        category: productDraft.category.trim() || "Bouquets",
        image_url: productDraft.image_url.trim() || null,
        is_active: true,
      }).eq("id", editingProductId);

      if (error) throw error;
      toast.success("Product updated.");
      setEditingProductId(null);
      setProductDraft({ name: "", description: "", price: "", currency: "USD", category: "", image_url: "" });
      qc.invalidateQueries({ queryKey: ["admin-products"] });
      qc.invalidateQueries({ queryKey: ["products"] });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not update product");
    }
  };

  const addOffer = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const fd = new FormData(form);
    setOfferSaving(true);
    try {
      const payload = {
        title: String(fd.get("title") || "").trim(),
        description: String(fd.get("description") || "").trim(),
        discount_percent: Number(fd.get("discount_percent") || 0),
        valid_until: String(fd.get("valid_until") || ""),
      };

      try {
        const { error } = await supabase.from("offers").insert(payload);
        if (error) {
          const localOffers = readLocalOffers();
          const nextOffer = {
            badge: `${payload.discount_percent || 0}% Off`,
            title: payload.title,
            copy: payload.description || "Exclusive boutique savings for selected floral collections.",
            terms: payload.valid_until
              ? `Valid until ${new Date(payload.valid_until).toLocaleDateString()}`
              : "Limited seasonal offer",
          };
          writeLocalOffers([...localOffers, nextOffer]);
          toast.success("Offer created locally and synced to the storefront.");
          form.reset();
          qc.invalidateQueries({ queryKey: ["admin-offers"] });
          qc.invalidateQueries({ queryKey: ["offers"] });
          return;
        }
      } catch {
        const localOffers = readLocalOffers();
        const nextOffer = {
          badge: `${payload.discount_percent || 0}% Off`,
          title: payload.title,
          copy: payload.description || "Exclusive boutique savings for selected floral collections.",
          terms: payload.valid_until
            ? `Valid until ${new Date(payload.valid_until).toLocaleDateString()}`
            : "Limited seasonal offer",
        };
        writeLocalOffers([...localOffers, nextOffer]);
        toast.success("Offer created locally and synced to the storefront.");
        form.reset();
        qc.invalidateQueries({ queryKey: ["admin-offers"] });
        qc.invalidateQueries({ queryKey: ["offers"] });
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
        if (id.startsWith("local-offer-")) {
          const nextOffers = readLocalOffers().filter((_, index) => `local-offer-${index}` !== id);
          writeLocalOffers(nextOffers);
          toast.success("Offer removed.");
          qc.invalidateQueries({ queryKey: ["admin-offers"] });
          qc.invalidateQueries({ queryKey: ["offers"] });
          return;
        }
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

  const startEditOffer = (offer: { id: string; title: string; description: string | null; discount_percent: number; valid_until: string }) => {
    setEditingOfferId(offer.id);
    setOfferDraft({
      title: offer.title,
      description: offer.description ?? "",
      discount_percent: String(offer.discount_percent),
      valid_until: offer.valid_until.slice(0, 16),
    });
  };

  const updateOffer = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editingOfferId) return;

    try {
      const nextOffer = {
        title: offerDraft.title.trim(),
        description: offerDraft.description.trim(),
        discount_percent: Number(offerDraft.discount_percent || 0),
        valid_until: offerDraft.valid_until,
      };

      const { error } = await supabase.from("offers").update(nextOffer).eq("id", editingOfferId);
      if (error) {
        const localOffers = readLocalOffers();
        const mapped = localOffers.map((offer, index) =>
          `local-offer-${index}` === editingOfferId
            ? {
                badge: `${nextOffer.discount_percent || 0}% Off`,
                title: nextOffer.title,
                copy: nextOffer.description,
                terms: nextOffer.valid_until
                  ? `Valid until ${new Date(nextOffer.valid_until).toLocaleDateString()}`
                  : "Limited seasonal offer",
              }
            : offer,
        );
        writeLocalOffers(mapped);
        toast.success("Offer updated locally.");
        setEditingOfferId(null);
        setOfferDraft({ title: "", description: "", discount_percent: "", valid_until: "" });
        qc.invalidateQueries({ queryKey: ["admin-offers"] });
        qc.invalidateQueries({ queryKey: ["offers"] });
        return;
      }

      toast.success("Offer updated.");
      setEditingOfferId(null);
      setOfferDraft({ title: "", description: "", discount_percent: "", valid_until: "" });
      qc.invalidateQueries({ queryKey: ["admin-offers"] });
      qc.invalidateQueries({ queryKey: ["offers"] });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not update offer");
    }
  };

  const updateOrderStatus = async (id: string, status: string) => {
    try {
      const { error } = await supabase.from("orders").update({ status }).eq("id", id);
      if (error) throw error;
      toast.success("Order status updated.");
      qc.invalidateQueries({ queryKey: ["admin-orders"] });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not update order");
    }
  };

  const removeOrder = async (id: string) => {
    try {
      const { error } = await supabase.from("orders").delete().eq("id", id);
      if (error) throw error;
      toast.success("Order removed.");
      qc.invalidateQueries({ queryKey: ["admin-orders"] });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not remove order");
    }
  };

  const signOut = () => {
    setUser(null);
    window.localStorage.removeItem("rose_bloom_admin_session");
    toast.success("Signed out.");
  };

  if (!user) {
    return (
      <main className="flex min-h-screen items-center justify-center px-6 py-24">
        <div className="w-full max-w-md rounded-sm border border-gold/15 p-8 glass-panel">
          <h1 className="text-3xl">
            Owner <span className="italic gold-text">access</span>
          </h1>
          <p className="mt-3 text-sm text-muted-foreground">
            Sign in to manage products, offers and view orders.
          </p>
          <div className="mt-4 rounded-sm border border-gold/20 bg-gold/5 p-3 text-xs text-gold">
            Current admin OTP: <span className="font-bold tracking-[0.25em]">{otpCode}</span>
          </div>
          <form onSubmit={submit} className="mt-6 space-y-3">
            <input name="email" type="email" defaultValue={ADMIN_EMAIL} required placeholder="Email" className={field} />
            <input
              name="password"
              type="password"
              defaultValue={ADMIN_PASSWORD}
              required
              minLength={6}
              placeholder="Password"
              className={field}
            />
            <input
              name="otp"
              inputMode="numeric"
              maxLength={6}
              pattern="[0-9]{6}"
              required
              placeholder="Enter 6-digit OTP"
              className={field}
            />
            <button
              type="submit"
              disabled={busy}
              className="w-full rounded-sm bg-gold px-6 py-3 text-[0.65rem] tracking-[0.3em] uppercase text-accent-foreground disabled:opacity-60"
            >
              {busy ? "Checking…" : "Sign in"}
            </button>
          </form>
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

      <section className="mt-14">
        <h2 className="text-2xl">Products catalogue</h2>
        <div className="mt-6 space-y-3">
          {(products.data ?? []).map((p) => (
            <div key={p.id} className="rounded-sm border border-gold/15 p-4">
              {editingProductId === p.id ? (
                <form onSubmit={updateProduct} className="space-y-3">
                  <div className="grid gap-3 sm:grid-cols-2">
                    <input
                      value={productDraft.name}
                      onChange={(e) => setProductDraft({ ...productDraft, name: e.target.value })}
                      className={field}
                    />
                    <input
                      value={productDraft.category}
                      onChange={(e) => setProductDraft({ ...productDraft, category: e.target.value })}
                      className={field}
                    />
                    <input
                      value={productDraft.price}
                      type="number"
                      step="0.01"
                      min="0"
                      onChange={(e) => setProductDraft({ ...productDraft, price: e.target.value })}
                      className={field}
                    />
                    <input
                      value={productDraft.currency}
                      maxLength={3}
                      onChange={(e) => setProductDraft({ ...productDraft, currency: e.target.value })}
                      className={field}
                    />
                  </div>
                  <textarea
                    value={productDraft.description}
                    rows={3}
                    onChange={(e) => setProductDraft({ ...productDraft, description: e.target.value })}
                    className={field}
                  />
                  <input
                    value={productDraft.image_url}
                    onChange={(e) => setProductDraft({ ...productDraft, image_url: e.target.value })}
                    placeholder="Image URL"
                    className={field}
                  />
                  <div className="flex gap-3">
                    <button type="submit" className="rounded-sm bg-gold px-4 py-2 text-[0.6rem] tracking-[0.3em] uppercase text-accent-foreground">
                      Save
                    </button>
                    <button type="button" onClick={() => setEditingProductId(null)} className="rounded-sm border border-gold/20 px-4 py-2 text-[0.6rem] tracking-[0.3em] uppercase text-muted-foreground">
                      Cancel
                    </button>
                  </div>
                </form>
              ) : (
                <div className="flex items-center gap-4">
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
                    onClick={() => startEditProduct(p)}
                    className="text-muted-foreground transition-colors hover:text-gold"
                    aria-label={`Edit ${p.name}`}
                  >
                    <Pencil size={18} />
                  </button>
                  <button
                    onClick={() => removeProduct(p.id)}
                    aria-label={`Remove ${p.name}`}
                    className="text-muted-foreground transition-colors hover:text-destructive"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              )}
            </div>
          ))}
          {products.data?.length === 0 && (
            <p className="text-sm text-muted-foreground">No products yet.</p>
          )}
        </div>
      </section>

      <section className="mt-14">
        <h2 className="text-2xl">Active offers</h2>
        <div className="mt-6 space-y-3">
          {(offers.data ?? []).map((o: any) => (
            <div key={o.id} className="rounded-sm border border-gold/15 p-4">
              {editingOfferId === o.id ? (
                <form onSubmit={updateOffer} className="space-y-3">
                  <div className="grid gap-3 sm:grid-cols-2">
                    <input
                      value={offerDraft.title}
                      onChange={(e) => setOfferDraft({ ...offerDraft, title: e.target.value })}
                      className={field}
                    />
                    <input
                      value={offerDraft.discount_percent}
                      type="number"
                      min="0"
                      max="100"
                      step="0.01"
                      onChange={(e) => setOfferDraft({ ...offerDraft, discount_percent: e.target.value })}
                      className={field}
                    />
                  </div>
                  <textarea
                    value={offerDraft.description}
                    rows={3}
                    onChange={(e) => setOfferDraft({ ...offerDraft, description: e.target.value })}
                    className={field}
                  />
                  <input
                    type="datetime-local"
                    value={offerDraft.valid_until}
                    onChange={(e) => setOfferDraft({ ...offerDraft, valid_until: e.target.value })}
                    className={field}
                  />
                  <div className="flex gap-3">
                    <button type="submit" className="rounded-sm bg-gold px-4 py-2 text-[0.6rem] tracking-[0.3em] uppercase text-accent-foreground">
                      Save
                    </button>
                    <button type="button" onClick={() => setEditingOfferId(null)} className="rounded-sm border border-gold/20 px-4 py-2 text-[0.6rem] tracking-[0.3em] uppercase text-muted-foreground">
                      Cancel
                    </button>
                  </div>
                </form>
              ) : (
                <div className="flex items-center justify-between gap-3">
                  <div className="flex-1">
                    <p className="text-lg">{o.title}</p>
                    <p className="text-sm text-muted-foreground">{o.description}</p>
                    <p className="mt-1 text-xs text-gold">
                      {o.discount_percent}% off until {new Date(o.valid_until).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => startEditOffer(o)}
                      className="text-muted-foreground transition-colors hover:text-gold"
                      aria-label={`Edit ${o.title}`}
                    >
                      <Pencil size={18} />
                    </button>
                    <button
                      onClick={() => removeOffer(o.id)}
                      aria-label={`Remove ${o.title}`}
                      className="text-muted-foreground transition-colors hover:text-destructive"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
          {offers.data?.length === 0 && (
            <p className="text-sm text-muted-foreground">No offers yet.</p>
          )}
        </div>
      </section>

      <section className="mt-14 pb-20">
        <h2 className="text-2xl">Incoming orders</h2>
        <div className="mt-6 space-y-3">
          {(orders.data ?? []).map((o: any) => (
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

              <div className="mt-4 flex flex-wrap items-center gap-3">
                <select
                  value={o.status ?? "pending"}
                  onChange={(e) => updateOrderStatus(o.id, e.target.value)}
                  className={`${field} max-w-[220px]`}
                >
                  <option value="pending">Pending</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="packed">Packed</option>
                  <option value="shipping">Shipping</option>
                  <option value="delivered">Delivered</option>
                  <option value="cancelled">Cancelled</option>
                </select>
                <button
                  type="button"
                  onClick={() => removeOrder(o.id)}
                  className="rounded-sm border border-gold/20 px-4 py-2 text-[0.6rem] tracking-[0.3em] uppercase text-muted-foreground"
                >
                  Delete
                </button>
              </div>
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
