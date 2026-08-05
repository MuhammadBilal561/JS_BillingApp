import { formatMoney, escHtml } from "./utils.js";
import { computeTotals, lineTotal } from "./invoice.js";

const $ = (selector) => document.querySelector(selector);

export function renderItems(invoice, editingId) {
  const tbody = $("#itemsBody");
  const empty = $("#emptyState");
  const hasItems = invoice.items.length > 0;

  tbody.innerHTML = invoice.items
    .map((item) => {
      const editing = item.id === editingId ? " editing" : "";
      return `
        <tr class="${editing}" data-id="${escHtml(item.id)}">
          <td class="product">${escHtml(item.name)}</td>
          <td class="num">${formatMoney(item.price)}</td>
          <td class="num">${item.quantity}</td>
          <td class="num strong">${formatMoney(lineTotal(item))}</td>
          <td class="num">
            <div class="row-actions">
              <button type="button" class="icon-btn" data-action="edit" title="Edit item" aria-label="Edit item">✎</button>
              <button type="button" class="icon-btn danger" data-action="remove" title="Remove item" aria-label="Remove item">×</button>
            </div>
          </td>
        </tr>`;
    })
    .join("");

  tbody.hidden = !hasItems;
  empty.hidden = hasItems;

  const countEl = $("#itemCount");
  if (countEl) {
    const n = invoice.items.length;
    countEl.textContent = `${n} ${n === 1 ? "item" : "items"}`;
  }
}

export function renderSummary(invoice) {
  const totals = computeTotals(invoice);

  $("#subtotal").textContent = formatMoney(totals.subtotal);
  $("#discountAmount").textContent = totals.discount > 0
    ? `-${formatMoney(totals.discount)}`
    : formatMoney(0);
  $("#taxAmount").textContent = formatMoney(totals.tax);
  $("#shippingAmount").textContent = formatMoney(totals.shipping);
  $("#grandTotal").textContent = formatMoney(totals.total);

  const discValue = Number(invoice.discount?.value) || 0;
  $("#discountLabel").textContent = discValue > 0
    ? `Discount (${invoice.discount.type === "percent" ? `${discValue}%` : formatMoney(discValue)})`
    : "Discount";

  const taxValue = Number(invoice.tax?.value) || 0;
  $("#taxLabel").textContent = taxValue > 0
    ? `Tax (${invoice.tax.type === "percent" ? `${taxValue}%` : formatMoney(taxValue)})`
    : "Tax";
}

export function renderMeta(invoice) {
  $("#invNumber").textContent = invoice.invoiceNumber || "Draft";
  $("#invDate").textContent = invoice.date || "";
}

export function renderHistory(list) {
  const wrap = $("#historyList");
  const empty = $("#historyEmpty");
  const hasItems = list.length > 0;

  wrap.innerHTML = list
    .map((inv) => {
      const total = computeTotals(inv).total;
      return `
        <li class="history-item" data-id="${escHtml(inv.id)}">
          <div class="history-main">
            <span class="history-number">${escHtml(inv.invoiceNumber || "Draft")}</span>
            <span class="history-customer">${escHtml(inv.customer?.name || "Walk-in customer")}</span>
          </div>
          <span class="history-date">${escHtml(inv.date || "")}</span>
          <span class="history-total">${formatMoney(total)}</span>
          <div class="history-actions">
            <button type="button" class="btn btn-sm" data-history="load">Open</button>
            <button type="button" class="btn btn-sm danger-outline" data-history="delete">Delete</button>
          </div>
        </li>`;
    })
    .join("");

  empty.hidden = hasItems;

  const badge = $("#historyCount");
  if (badge) badge.textContent = String(list.length);
}

export function renderStats(invoice, archive) {
  const draftTotal = computeTotals(invoice).total;
  const items = invoice.items.length;
  const billed = archive.reduce((sum, inv) => sum + computeTotals(inv).total, 0);

  $("#statDraftTotal").textContent = formatMoney(draftTotal);
  $("#statItems").textContent = String(items);
  $("#statArchive").textContent = String(archive.length);
  $("#statBilled").textContent = formatMoney(billed);
}

export function renderToday() {
  const el = $("#todayLabel");
  if (!el) return;
  const date = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  el.textContent = date;

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";
  const title = $("#greeting");
  if (title) title.textContent = `${greeting}, let's bill with confidence.`;
}

export function renderFormMode(isEditing) {
  const btn = $("#addItemBtn");
  const cancel = $("#cancelEditBtn");
  if (!btn || !cancel) return;
  btn.textContent = isEditing ? "Update Item" : "Add Item";
  btn.dataset.mode = isEditing ? "update" : "add";
  cancel.hidden = !isEditing;
}
