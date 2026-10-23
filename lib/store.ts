/**
 * In-memory store. Swap this file for Supabase later — same interface.
 */
import type { ShipmentState } from "./types";

const g = globalThis as unknown as {
  __afritrace_shipments?: Map<string, ShipmentState>;
};

if (!g.__afritrace_shipments) {
  g.__afritrace_shipments = new Map();
}

const db = g.__afritrace_shipments;

export function saveShipment(s: ShipmentState) {
  s.updated_at = new Date().toISOString();
  db.set(s.shipment_id, s);
  return s;
}

export function getShipment(id: string) {
  return db.get(id) ?? null;
}

export function listShipments() {
  return Array.from(db.values()).sort(
    (a, b) => b.created_at.localeCompare(a.created_at)
  );
}

export function checkpoint(
  s: ShipmentState,
  agent: string,
  note: string
): ShipmentState {
  s.audit.push({ at: new Date().toISOString(), agent, note });
  return saveShipment(s);
}
