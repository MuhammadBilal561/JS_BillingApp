import { todayISO, uid, generateInvoiceNumber } from "./utils.js";

const DRAFT_KEY = "billing.draft.v2";
const ARCHIVE_KEY = "billing.archive.v2";

export function createInvoice(overrides = {}) {
  return {
    id: uid(),
    invoiceNumber: "",
    date: todayISO(),
    customer: { name: "", email: "", address: "" },
    items: [],
    discount: { type: "percent", value: 0 },
    tax: { type: "percent", value: 0 },
    shipping: 0,
    notes: "",
    createdAt: Date.now(),
    ...overrides,
  };
}

export function loadDraft() {
  try {
    const raw = localStorage.getItem(DRAFT_KEY);
    if (!raw) return createInvoice();
    const parsed = JSON.parse(raw);
    return {
      ...createInvoice(),
      ...parsed,
      customer: { name: "", email: "", address: "", ...(parsed.customer || {}) },
      discount: { type: "percent", value: 0, ...(parsed.discount || {}) },
      tax: { type: "percent", value: 0, ...(parsed.tax || {}) },
    };
  } catch {
    return createInvoice();
  }
}

export function saveDraft(invoice) {
  try {
    localStorage.setItem(DRAFT_KEY, JSON.stringify(invoice));
  } catch {
    // Storage may be unavailable (private mode / quota). Silently degrade.
  }
}

export function clearDraft() {
  try {
    localStorage.removeItem(DRAFT_KEY);
  } catch {
    // ignore
  }
}

export function loadArchive() {
  try {
    const raw = localStorage.getItem(ARCHIVE_KEY);
    const list = raw ? JSON.parse(raw) : [];
    return Array.isArray(list) ? list : [];
  } catch {
    return [];
  }
}

function saveArchive(list) {
  try {
    localStorage.setItem(ARCHIVE_KEY, JSON.stringify(list));
  } catch {
    // ignore
  }
}

export function archiveInvoice(invoice) {
  const list = loadArchive();
  const saved = {
    ...invoice,
    invoiceNumber: invoice.invoiceNumber || generateInvoiceNumber(),
    archivedAt: Date.now(),
  };
  const existing = list.findIndex((item) => item.id === saved.id);
  if (existing >= 0) {
    list[existing] = saved;
  } else {
    list.unshift(saved);
  }
  saveArchive(list);
  return saved;
}

export function deleteArchived(id) {
  saveArchive(loadArchive().filter((item) => item.id !== id));
}

export function getArchived(id) {
  return loadArchive().find((item) => item.id === id) || null;
}
