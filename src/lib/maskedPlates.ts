// Plates whose individual balance should be hidden in UI views
// (still included in aggregate calculations like fleet totals)
const MASKED_PLATES = new Set<string>([]);

export function isBalanceMasked(plate: string): boolean {
  return MASKED_PLATES.has(plate);
}
