import { createFileRoute, Link } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { useMemo, useState, type FormEvent } from "react";
import { toast } from "sonner";
import { ArrowLeft, Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";
import { listProducts, placeOrder } from "@/lib/shop.functions";
import { OWNER_EMAIL, formatPrice } from "@/lib/shop-config";
import { Nav } from "@/components/site/Nav";
import { Footer } from "@/components/site/Footer";
import { Reveal, SectionLabel } from "@/components/site/ambient";

const productsQuery = queryOptions({
  queryKey: ["products"],
  queryFn: () => listProducts(),
});

const title = "Boutique Shop | Flower Industries (Pvt) Ltd";
const description =
  "Browse and order luxury floral arrangements from Flower Industries, Sri Lanka. Signature bouquets, hospitality florals and export gift boxes with worldwide delivery.";

export const Route = createFileRoute("/shop")({
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  loader: ({ context }) => context.queryClient.ensureQueryData(productsQuery),
  component: Shop,
  errorComponent: () => (
    <div className="flex min-h-screen items-center justify-center px-6 text-center">
      <p className="text-muted-foreground">The boutique is briefly unavailable. Please refresh.</p>
    </div>
  ),
});

const field =
  "w-full rounded-sm border border-gold/20 bg-transparent px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/70 focus:border-gold focus:outline-none transition-colors";

type Product = {
  id: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  image_url: string | null;
  category: string;
};

type CartItem = {
  product: Product;
  quantity: number;
};

function OrderForm({ product, onDone }: { product: Product; onDone: () => void }) {
  const [sending, setSending] = useState(false);

  const submit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    setSending(true);
    try {
      const payload = {
        productId: product.id,
        quantity: Number(form.get("quantity") || 1),
        customerName: String(form.get("name") || ""),
        customerEmail: String(form.get("email") || ""),
        country: String(form.get("country") || ""),
        phone: String(form.get("phone") || ""),
        message: String(form.get("message") || ""),
      };
      const res = await placeOrder({ data: payload });
      if (!res.ok) {
        toast.error(res.error ?? "Something went wrong");
        return;
      }
      toast.success("Order sent — our export desk will confirm by email.");
      const body = [
        `Item: ${product.name}`,
        `Unit price: ${formatPrice(product.price, product.currency)}`,
        `Quantity: ${payload.quantity}`,
        `Name: ${payload.customerName}`,
        `Email: ${payload.customerEmail}`,
        `Country: ${payload.country}`,
        `Phone: ${payload.phone}`,
        "",
        payload.message,
      ].join("\n");
      window.open(
        `mailto:${OWNER_EMAIL}?subject=${encodeURIComponent(`Order — ${product.name}`)}&body=${encodeURIComponent(body)}`,
        "_blank",
      );
      onDone();
    } catch {
      toast.error("Please check your details and try again.");
    } finally {
      setSending(false);
    }
  };

  return (
    <form onSubmit={submit} className="mt-5 space-y-3 border-t border-gold/15 pt-5">
      <div className="grid gap-3 sm:grid-cols-2">
        <input name="name" required maxLength={100} placeholder="Full name" className={field} />
        <input
          name="email"
          type="email"
          required
          maxLength={255}
          placeholder="Email"
          className={field}
        />
        <input name="country" maxLength={100} placeholder="Country" className={field} />
        <input name="phone" maxLength={40} placeholder="Phone / WhatsApp" className={field} />
        <input
          name="quantity"
          type="number"
          min={1}
          max={1000}
          defaultValue={1}
          placeholder="Quantity"
          className={field}
        />
      </div>
      <textarea
        name="message"
        rows={3}
        maxLength={1000}
        placeholder="Delivery date, destination, personalisation…"
        className={field}
      />
      <div className="flex gap-3">
        <button
          type="submit"
          disabled={sending}
          className="rounded-sm bg-gold px-6 py-3 text-[0.65rem] tracking-[0.3em] uppercase text-accent-foreground transition-opacity disabled:opacity-60"
        >
          {sending ? "Sending…" : "Confirm order"}
        </button>
        <button
          type="button"
          onClick={onDone}
          className="rounded-sm border border-gold/30 px-6 py-3 text-[0.65rem] tracking-[0.3em] uppercase text-muted-foreground"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}

function Shop() {
  const { data } = useSuspenseQuery(productsQuery);
  const [openId, setOpenId] = useState<string | null>(null);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [cart, setCart] = useState<Record<string, CartItem>>({});
  const products = (data.products ?? []) as Product[];

  const cartItems = useMemo(() => Object.values(cart), [cart]);
  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const cartTotal = cartItems.reduce(
    (sum, item) => sum + item.quantity * Number(item.product.price),
    0,
  );

  const addToCart = (product: Product) => {
    setCart((current) => ({
      ...current,
      [product.id]: {
        product,
        quantity: (current[product.id]?.quantity ?? 0) + 1,
      },
    }));
    setIsCartOpen(true);
  };

  const updateCartQty = (productId: string, quantity: number) => {
    setCart((current) => {
      if (!current[productId]) return current;
      if (quantity <= 0) {
        const next = { ...current };
        delete next[productId];
        return next;
      }
      return {
        ...current,
        [productId]: {
          ...current[productId],
          quantity,
        },
      };
    });
  };

  const handleCartCheckout = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (cartItems.length === 0) {
      toast.error("Your cart is empty.");
      return;
    }

    const form = new FormData(e.currentTarget);
    const customerName = String(form.get("name") || "").trim();
    const customerEmail = String(form.get("email") || "").trim();
    const country = String(form.get("country") || "").trim();
    const phone = String(form.get("phone") || "").trim();
    const message = String(form.get("message") || "").trim();

    if (!customerName || !customerEmail) {
      toast.error("Please add your name and email to confirm the order.");
      return;
    }

    try {
      for (const item of cartItems) {
        const result = await placeOrder({
          data: {
            productId: item.product.id,
            quantity: item.quantity,
            customerName,
            customerEmail,
            country,
            phone,
            message,
          },
        });

        if (!result.ok) {
          toast.error(result.error ?? "Could not place the order.");
          return;
        }
      }

      const formattedItems = cartItems
        .map(
          (item) =>
            `${item.product.name} — ${item.quantity} × ${formatPrice(item.product.price, item.product.currency)}`,
        )
        .join("\n");

      const body = [
        `Customer: ${customerName}`,
        `Email: ${customerEmail}`,
        `Country: ${country}`,
        `Phone: ${phone}`,
        "",
        formattedItems,
        "",
        message,
      ].join("\n");

      window.open(
        `mailto:${OWNER_EMAIL}?subject=${encodeURIComponent("Cart order — Flower Industries")}&body=${encodeURIComponent(body)}`,
        "_blank",
      );

      toast.success("Your cart order has been sent to the export desk.");
      setCart({});
      setIsCartOpen(false);
    } catch {
      toast.error("Please check your details and try again.");
    }
  };

  return (
    <>
      <Nav />
      <main className="relative z-10 mx-auto max-w-7xl px-6 pt-36 pb-24">
        <Reveal>
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-[0.65rem] tracking-[0.3em] uppercase text-muted-foreground transition-colors hover:text-gold"
          >
            <ArrowLeft size={14} /> Home
          </Link>
          <SectionLabel>The Boutique</SectionLabel>
          <h1 className="mt-6 max-w-2xl text-[clamp(2.2rem,5vw,3.8rem)] leading-tight">
            Order our <span className="italic gold-text">signature pieces</span>
          </h1>
          <p className="mt-5 max-w-xl text-sm leading-relaxed text-muted-foreground">
            Every order is confirmed personally by our export desk, with cold-chain packing and
            worldwide courier.
          </p>
        </Reveal>

        <div className="mt-8 flex justify-end">
          <button
            type="button"
            onClick={() => setIsCartOpen((value) => !value)}
            className="inline-flex items-center gap-2 rounded-sm border border-gold/50 px-5 py-2.5 text-[0.6rem] tracking-[0.3em] uppercase text-gold"
          >
            <ShoppingBag size={16} />
            Cart {cartCount > 0 && `(${cartCount})`}
          </button>
        </div>

        {isCartOpen && (
          <aside className="mt-6 rounded-sm border border-gold/15 bg-background/80 p-6 backdrop-blur-sm">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-2xl">Your cart</h2>
              {cartItems.length > 0 && (
                <button
                  type="button"
                  onClick={() => setCart({})}
                  className="text-[0.6rem] tracking-[0.3em] uppercase text-muted-foreground"
                >
                  Clear all
                </button>
              )}
            </div>

            {cartItems.length === 0 ? (
              <p className="mt-4 text-sm text-muted-foreground">Your cart is empty.</p>
            ) : (
              <div className="mt-5 space-y-4">
                {cartItems.map(({ product, quantity }) => (
                  <div key={product.id} className="flex items-center gap-3 rounded-sm border border-gold/10 p-3">
                    <div className="flex-1">
                      <p className="font-medium">{product.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatPrice(product.price, product.currency)} each
                      </p>
                    </div>
                    <div className="flex items-center gap-2 rounded-sm border border-gold/15 px-2 py-1">
                      <button
                        type="button"
                        onClick={() => updateCartQty(product.id, quantity - 1)}
                        className="text-gold"
                        aria-label={`Decrease ${product.name}`}
                      >
                        <Minus size={14} />
                      </button>
                      <span className="min-w-6 text-center text-sm">{quantity}</span>
                      <button
                        type="button"
                        onClick={() => updateCartQty(product.id, quantity + 1)}
                        className="text-gold"
                        aria-label={`Increase ${product.name}`}
                      >
                        <Plus size={14} />
                      </button>
                    </div>
                    <button
                      type="button"
                      onClick={() => updateCartQty(product.id, 0)}
                      className="text-muted-foreground hover:text-destructive"
                      aria-label={`Remove ${product.name}`}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}

                <div className="rounded-sm border border-gold/10 p-4">
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <span>Subtotal</span>
                    <span className="gold-text font-display text-xl">
                      {formatPrice(cartTotal, "USD")}
                    </span>
                  </div>
                </div>

                <form onSubmit={handleCartCheckout} className="space-y-3 border-t border-gold/10 pt-4">
                  <div className="grid gap-3 sm:grid-cols-2">
                    <input name="name" required maxLength={100} placeholder="Full name" className={field} />
                    <input
                      name="email"
                      type="email"
                      required
                      maxLength={255}
                      placeholder="Email"
                      className={field}
                    />
                    <input name="country" maxLength={100} placeholder="Country" className={field} />
                    <input name="phone" maxLength={40} placeholder="Phone / WhatsApp" className={field} />
                  </div>
                  <textarea
                    name="message"
                    rows={3}
                    maxLength={1000}
                    placeholder="Delivery date, destination, personalisation…"
                    className={field}
                  />
                  <button
                    type="submit"
                    className="w-full rounded-sm bg-gold px-6 py-3 text-[0.65rem] tracking-[0.3em] uppercase text-accent-foreground"
                  >
                    Confirm cart order
                  </button>
                </form>
              </div>
            )}
          </aside>
        )}

        {products.length === 0 ? (
          <p className="mt-16 text-sm text-muted-foreground">
            No items published yet. Sign in as the owner to add products.
          </p>
        ) : (
          <div className="mt-14 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {products.map((p, i) => (
              <Reveal key={p.id} delay={i * 0.06}>
                <article className="group flex h-full flex-col overflow-hidden rounded-sm border border-gold/15 transition-shadow duration-500 hover:shadow-[var(--shadow-lux)]">
                  {p.image_url ? (
                    <img
                      src={p.image_url}
                      alt={p.name}
                      loading="lazy"
                      className="h-64 w-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex h-64 items-center justify-center bg-secondary/40 text-gold">
                      <ShoppingBag size={28} strokeWidth={1} />
                    </div>
                  )}
                  <div className="flex flex-1 flex-col p-6">
                    <p className="text-[0.6rem] tracking-[0.4em] uppercase text-gold">
                      {p.category}
                    </p>
                    <h2 className="mt-3 text-2xl">{p.name}</h2>
                    <p className="mt-3 flex-1 text-sm leading-relaxed text-muted-foreground">
                      {p.description}
                    </p>
                    <div className="mt-6 flex items-center justify-between gap-3">
                      <span className="font-display text-2xl gold-text">
                        {formatPrice(p.price, p.currency)}
                      </span>
                      <div className="flex flex-wrap items-center justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => addToCart(p)}
                          className="rounded-sm border border-gold/50 px-4 py-2 text-[0.55rem] tracking-[0.25em] uppercase text-gold transition-all hover:bg-gold hover:text-accent-foreground"
                        >
                          Add to cart
                        </button>
                        {openId !== p.id && (
                          <button
                            onClick={() => setOpenId(p.id)}
                            className="rounded-sm border border-gold/20 px-4 py-2 text-[0.55rem] tracking-[0.25em] uppercase text-muted-foreground transition-all hover:text-gold"
                          >
                            Order now
                          </button>
                        )}
                      </div>
                    </div>
                    {openId === p.id && <OrderForm product={p} onDone={() => setOpenId(null)} />}
                  </div>
                </article>
              </Reveal>
            ))}
          </div>
        )}
      </main>
      <Footer />
    </>
  );
}
