// SAMPLE DATA. Model names are real; prices, URLs, Trustpilot scores and dates are
// placeholders to be replaced with real manual snapshots (see CLAUDE.md).
// Every offer carries sample: true so the UI can say so.

export const TYPES = ["internal_m2", "internal_sata", "external"];
export const FORM_FACTORS = ["M.2 2280", "2.5in", "portable"];
export const INTERFACES = ["NVMe", "SATA", "USB-C"];

const offer = (source, price_sgd, trustpilot) => ({
  source,
  price_sgd,
  trustpilot,
  url: `https://www.${source.toLowerCase()}.sg/`,
  checked_at: "2026-10-07",
  sample: true,
});

export const catalogue = [
  { id: "samsung-990-pro-1tb", name: "Samsung 990 PRO 1TB", brand: "Samsung", type: "internal_m2", form_factor: "M.2 2280", interface: "NVMe", capacity_gb: 1000, offers: [offer("Amazon", 159, 4.2), offer("Shopee", 149, 3.9), offer("Lazada", 152, 3.6)] },
  { id: "samsung-990-pro-2tb", name: "Samsung 990 PRO 2TB", brand: "Samsung", type: "internal_m2", form_factor: "M.2 2280", interface: "NVMe", capacity_gb: 2000, offers: [offer("Amazon", 279, 4.2), offer("Shopee", 265, 3.9)] },
  { id: "wd-black-sn850x-1tb", name: "WD Black SN850X 1TB", brand: "Western Digital", type: "internal_m2", form_factor: "M.2 2280", interface: "NVMe", capacity_gb: 1000, offers: [offer("Amazon", 139, 4.2), offer("Lazada", 135, 3.6)] },
  { id: "crucial-p3-plus-1tb", name: "Crucial P3 Plus 1TB", brand: "Crucial", type: "internal_m2", form_factor: "M.2 2280", interface: "NVMe", capacity_gb: 1000, offers: [offer("Shopee", 99, 3.9), offer("Amazon", 105, 4.2)] },
  { id: "kingston-nv2-500gb", name: "Kingston NV2 500GB", brand: "Kingston", type: "internal_m2", form_factor: "M.2 2280", interface: "NVMe", capacity_gb: 500, offers: [offer("Shopee", 49, 3.9), offer("Lazada", 52, 3.6)] },
  { id: "samsung-870-evo-1tb", name: "Samsung 870 EVO 1TB", brand: "Samsung", type: "internal_sata", form_factor: "2.5in", interface: "SATA", capacity_gb: 1000, offers: [offer("Amazon", 129, 4.2), offer("Lazada", 122, 3.6)] },
  { id: "crucial-mx500-1tb", name: "Crucial MX500 1TB", brand: "Crucial", type: "internal_sata", form_factor: "2.5in", interface: "SATA", capacity_gb: 1000, offers: [offer("Amazon", 115, 4.2), offer("Shopee", 109, 3.9)] },
  { id: "samsung-t7-1tb", name: "Samsung T7 Portable 1TB", brand: "Samsung", type: "external", form_factor: "portable", interface: "USB-C", capacity_gb: 1000, offers: [offer("Amazon", 149, 4.2), offer("Shopee", 139, 3.9), offer("Lazada", 142, 3.6)] },
  { id: "sandisk-extreme-portable-1tb", name: "SanDisk Extreme Portable 1TB", brand: "SanDisk", type: "external", form_factor: "portable", interface: "USB-C", capacity_gb: 1000, offers: [offer("Amazon", 135, 4.2), offer("Lazada", 129, 3.6)] },
  { id: "crucial-x9-2tb", name: "Crucial X9 Portable 2TB", brand: "Crucial", type: "external", form_factor: "portable", interface: "USB-C", capacity_gb: 2000, offers: [offer("Amazon", 219, 4.2), offer("Shopee", 205, 3.9)] },
];
