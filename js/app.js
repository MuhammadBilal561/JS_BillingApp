import {
  createInvoice,
  loadDraft,
  saveDraft,
  clearDraft,
  loadArchive,
  archiveInvoice,
  deleteArchived,
  getArchived,
} from "./store.js";
import { uid } from "./utils.js";
import {
  renderItems,
  renderSummary,
  renderMeta,
  renderHistory,
  renderStats,
  renderToday,
  renderFormMode,
} from "./render.js";

const $ = (selector) => document.querySelector(selector);

const app = {
  invoice: loadDraft(),
  editingId: null,
  archive: loadArchive(),
};

function persist() {
  saveDraft(app.invoice);
}

function render() {
  renderItems(app.invoice, app.editingId);
  renderSummary(app.invoice);
  renderMeta(app.invoice);
  renderHistory(app.archive);
  renderStats(app.invoice, app.archive);
  renderFormMode(Boolean(app.editingId));
}

function showError(el, messages) {
  el.textContent = messages.join(" ");
  el.hidden = false;
}

function hideError(el) {
  el.hidden = true;
  el.textContent = "";
}

function toast(message, type = "success") {
  const el = document.createElement("div");
  el.className = `toast ${type}`;
  el.textContent = message;
  $("#toastRegion").appendChild(el);
  requestAnimationFrame(() => el.classList.add("show"));
  setTimeout(() => {
    el.classList.remove("show");
    setTimeout(() => el.remove(), 300);
  }, 3000);
}

function hydrateForm() {
  const inv = app.invoice;
  $("#customerName").value = inv.customer.name || "";
  $("#customerEmail").value = inv.customer.email || "";
  $("#customerAddress").value = inv.customer.address || "";
  $("#discountValue").value = inv.discount.value;
  $("#discountType").value = inv.discount.type;
  $("#taxValue").value = inv.tax.value;
  $("#taxType").value = inv.tax.type;
  $("#shippingValue").value = inv.shipping;
  $("#notes").value = inv.notes || "";
}

function resetItemForm() {
  $("#itemName").value = "";
  $("#itemPrice").value = "";
  $("#itemQty").value = "1";
  hideError($("#itemError"));
}

/* ---------- Item entry ---------- */

function handleItemSubmit(event) {
  event.preventDefault();

  const nameEl = $("#itemName");
  const priceEl = $("#itemPrice");
  const qtyEl = $("#itemQty");
  const name = nameEl.value.trim();
  const price = Number(priceEl.value);
  const qty = Math.round(Number(qtyEl.value));

  const errors = [];
  if (!name) errors.push("Enter a product name.");
  if (!Number.isFinite(price) || price < 0) errors.push("Enter a valid price (0 or more).");
  if (!Number.isInteger(qty) || qty < 1) errors.push("Quantity must be a whole number of at least 1.");

  if (errors.length) {
    showError($("#itemError"), errors);
    return;
  }
  hideError($("#itemError"));

  if (app.editingId) {
    const item = app.invoice.items.find((i) => i.id === app.editingId);
    if (item) {
      item.name = name;
      item.price = price;
      item.quantity = qty;
    }
    app.editingId = null;
  } else {
    app.invoice.items.push({ id: uid(), name, price, quantity: qty });
  }

  resetItemForm();
  persist();
  render();
  nameEl.focus();
}

function handleCancelEdit() {
  app.editingId = null;
  resetItemForm();
  render();
}

function handleItemsBodyClick(event) {
  const btn = event.target.closest("[data-action]");
  if (!btn) return;
  const row = btn.closest("tr");
  if (!row) return;
  const id = row.dataset.id;
  const item = app.invoice.items.find((i) => i.id === id);
  if (!item) return;

  if (btn.dataset.action === "remove") {
    app.invoice.items = app.invoice.items.filter((i) => i.id !== id);
    if (app.editingId === id) app.editingId = null;
    toast("Item removed.");
  } else if (btn.dataset.action === "edit") {
    app.editingId = id;
    $("#itemName").value = item.name;
    $("#itemPrice").value = item.price;
    $("#itemQty").value = item.quantity;
    hideError($("#itemError"));
    $("#itemName").focus();
  }

  persist();
  render();
}

/* ---------- Invoice-level actions ---------- */

function handleNew() {
  const hasItems = app.invoice.items.length > 0;
  if (hasItems && !window.confirm("Start a new invoice? Unsaved items will be discarded.")) return;
  clearDraft();
  app.invoice = createInvoice();
  app.editingId = null;
  resetItemForm();
  hydrateForm();
  persist();
  render();
  toast("Started a new invoice.");
}

function handleSave() {
  if (app.invoice.items.length === 0) {
    toast("Add at least one item before saving.", "error");
    return;
  }
  const saved = archiveInvoice(app.invoice);
  app.invoice = { ...app.invoice, id: saved.id, invoiceNumber: saved.invoiceNumber };
  app.archive = loadArchive();
  persist();
  render();
  toast(`Invoice ${saved.invoiceNumber} saved.`);
}

function handlePrint() {
  if (app.invoice.items.length === 0) {
    toast("Add at least one item before printing.", "error");
    return;
  }
  window.print();
}

function handleExport() {
  const blob = new Blob([JSON.stringify(app.invoice, null, 2)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${app.invoice.invoiceNumber || "invoice"}.json`;
  link.click();
  URL.revokeObjectURL(url);
  toast("Invoice exported as JSON.");
}

/* ---------- History drawer ---------- */

function openDrawer() {
  $("#historyDrawer").classList.add("open");
  $("#drawerOverlay").hidden = false;
  document.body.classList.add("no-scroll");
}

function closeDrawer() {
  $("#historyDrawer").classList.remove("open");
  $("#drawerOverlay").hidden = true;
  document.body.classList.remove("no-scroll");
}

function handleHistoryClick(event) {
  const btn = event.target.closest("[data-history]");
  if (!btn) return;
  const item = btn.closest(".history-item");
  if (!item) return;
  const id = item.dataset.id;

  if (btn.dataset.history === "load") {
    const hasItems = app.invoice.items.length > 0;
    if (hasItems && !window.confirm("Load this invoice? Current items will be replaced.")) return;
    const archived = getArchived(id);
    if (!archived) {
      toast("Invoice not found.", "error");
      return;
    }
    app.invoice = archived;
    app.editingId = null;
    hydrateForm();
    persist();
    render();
    closeDrawer();
    toast("Invoice loaded.");
  } else if (btn.dataset.history === "delete") {
    if (!window.confirm("Delete this saved invoice?")) return;
    deleteArchived(id);
    app.archive = loadArchive();
    render();
    toast("Invoice deleted.");
  }
}

/* ---------- Live input binding ---------- */

function bindInputs() {
  const bind = (selector, update) => {
    $(selector).addEventListener("input", (e) => {
      update(e.target.value);
      persist();
      renderSummary(app.invoice);
      renderMeta(app.invoice);
    });
  };

  bind("#customerName", (v) => { app.invoice.customer.name = v; });
  bind("#customerEmail", (v) => { app.invoice.customer.email = v; });
  bind("#customerAddress", (v) => { app.invoice.customer.address = v; });
  bind("#notes", (v) => { app.invoice.notes = v; });
  bind("#discountValue", (v) => { app.invoice.discount.value = Math.max(0, Number(v) || 0); });
  bind("#discountType", (v) => { app.invoice.discount.type = v; });
  bind("#taxValue", (v) => { app.invoice.tax.value = Math.max(0, Number(v) || 0); });
  bind("#taxType", (v) => { app.invoice.tax.type = v; });
  bind("#shippingValue", (v) => { app.invoice.shipping = Math.max(0, Number(v) || 0); });
}

function bindEvents() {
  $("#itemForm").addEventListener("submit", handleItemSubmit);
  $("#cancelEditBtn").addEventListener("click", handleCancelEdit);
  $("#itemsBody").addEventListener("click", handleItemsBodyClick);

  $("#newInvoiceBtn").addEventListener("click", handleNew);
  $("#saveInvoiceBtn").addEventListener("click", handleSave);
  $("#printBtn").addEventListener("click", handlePrint);
  $("#exportBtn").addEventListener("click", handleExport);

  $("#historyBtn").addEventListener("click", openDrawer);
  $("#closeDrawerBtn").addEventListener("click", closeDrawer);
  $("#drawerOverlay").addEventListener("click", closeDrawer);
  $("#historyList").addEventListener("click", handleHistoryClick);

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeDrawer();
  });

  bindInputs();
}

/* ---------- Boot ---------- */

function init() {
  resetItemForm();
  hydrateForm();
  renderToday();
  bindEvents();
  render();
}

init();
