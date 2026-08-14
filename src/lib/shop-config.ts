// Orders placed on the shop page are recorded in the database and forwarded
// to this address. Change it to the business owner's inbox.
export const OWNER_EMAIL = "flowerindustries.lk@gmail.com";
export const OWNER_WHATSAPP = "94776562526";

export function formatPrice(price: number, currency: string) {
  try {
    return new Intl.NumberFormat("en-US", { style: "currency", currency }).format(price);
  } catch {
    return `${currency} ${price.toFixed(2)}`;
  }
}