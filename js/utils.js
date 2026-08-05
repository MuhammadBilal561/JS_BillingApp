export const CURRENCY = { code: "PKR", symbol: "Rs." };

export function round2(value) {
  return Math.round((Number(value) + Number.EPSILON) * 100) / 100;
}

export function formatMoney(value) {
  const n = Number.isFinite(Number(value)) ? Number(value) : 0;
  const formatted = n.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return `${CURRENCY.code} ${formatted}`;
}

export function uid() {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return `id-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 9)}`;
}

export function generateInvoiceNumber() {
  const year = new Date().getFullYear();
  const stamp = Date.now().toString(36).toUpperCase();
  return `INV-${year}-${stamp}`;
}

export function todayISO() {
  const d = new Date();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${month}-${day}`;
}

export function escHtml(value) {
  const div = document.createElement("div");
  div.textContent = String(value ?? "");
  return div.innerHTML;
}
