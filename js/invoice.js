import { round2 } from "./utils.js";

export function lineTotal(item) {
  return round2((Number(item.price) || 0) * (Number(item.quantity) || 0));
}

export function subtotal(items) {
  return round2(items.reduce((sum, item) => sum + lineTotal(item), 0));
}

export function discountAmount(sub, discount) {
  const value = Number(discount?.value) || 0;
  if (value <= 0) return 0;
  if (discount.type === "percent") {
    return round2((sub * Math.min(value, 100)) / 100);
  }
  return round2(Math.min(value, sub));
}

export function taxAmount(base, tax) {
  const value = Number(tax?.value) || 0;
  if (value <= 0) return 0;
  if (tax.type === "percent") {
    return round2((base * Math.min(value, 100)) / 100);
  }
  return round2(value);
}

export function computeTotals(invoice) {
  const sub = subtotal(invoice.items);
  const discount = discountAmount(sub, invoice.discount);
  const taxable = sub - discount;
  const tax = taxAmount(taxable, invoice.tax);
  const shipping = Number(invoice.shipping) || 0;
  const itemCount = invoice.items.reduce((n, item) => n + (Number(item.quantity) || 0), 0);
  return {
    subtotal: sub,
    discount,
    taxable,
    tax,
    shipping,
    total: round2(taxable + tax + shipping),
    itemCount,
    lineCount: invoice.items.length,
  };
}
