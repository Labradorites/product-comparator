import { catalogue, TYPES, FORM_FACTORS, INTERFACES } from "./catalogue.js";
import { filterAndRank } from "./search.js";

export const toolDefinitions = [
  {
    type: "function",
    function: {
      name: "search_ssds",
      description:
        "Search the SSD catalogue. Only call this once you know the type, form factor, interface and capacity. Returns matches within budget, near misses over budget, and products that miss on capacity.",
      parameters: {
        type: "object",
        properties: {
          type: { type: "string", enum: TYPES, description: "internal_m2, internal_sata, or external" },
          form_factor: { type: "string", enum: FORM_FACTORS, description: "M.2 2280 for internal_m2, 2.5in for internal_sata, portable for external" },
          interface: { type: "string", enum: INTERFACES, description: "NVMe for internal_m2, SATA for internal_sata, USB-C for external" },
          capacity_gb: { type: "number", description: "Minimum capacity in GB, e.g. 1000 for 1TB" },
          budget_sgd: { type: "number", description: "Budget in Singapore dollars. Omit if the user gave none." },
        },
        required: ["type", "form_factor", "interface", "capacity_gb"],
      },
    },
  },
];

/**
 * Run a tool. Returns { result } for the model, plus { data } for the client
 * when the call produced results to show. Errors come back as { result: { error } }.
 */
export function executeTool(name, args) {
  if (name !== "search_ssds") return { result: { error: `Unknown tool: ${name}` } };
  return searchSsds(args);
}

function searchSsds(args) {
  const error = validateFilters(args);
  if (error) return { result: { error } };

  const filters = {
    type: args.type,
    form_factor: args.form_factor,
    interface: args.interface,
    capacity_gb: args.capacity_gb,
    ...(typeof args.budget_sgd === "number" ? { budget_sgd: args.budget_sgd } : {}),
  };
  const found = filterAndRank(catalogue, filters);
  const data = { filters, ...found };
  return { result: data, data };
}

/** Pure. Returns an error string, or null when the arguments are usable. */
export function validateFilters(args) {
  if (!TYPES.includes(args.type)) return `type must be one of ${TYPES.join(", ")}`;
  if (!FORM_FACTORS.includes(args.form_factor)) return `form_factor must be one of ${FORM_FACTORS.join(", ")}`;
  if (!INTERFACES.includes(args.interface)) return `interface must be one of ${INTERFACES.join(", ")}`;
  if (typeof args.capacity_gb !== "number" || !(args.capacity_gb > 0)) return "capacity_gb must be a positive number";
  if (args.budget_sgd !== undefined && (typeof args.budget_sgd !== "number" || !(args.budget_sgd > 0))) {
    return "budget_sgd must be a positive number when given";
  }
  return null;
}
