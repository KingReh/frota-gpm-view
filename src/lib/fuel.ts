/**
 * Simplifica o tipo de combustível para exibição em espaços compactos.
 * Quando contém GASOLINA e ALCOOL (em qualquer ordem), retorna "FLEX".
 * Caso contrário, retorna o valor original.
 */
export function simplifyFuelType(fuelType: string | null): string {
  if (!fuelType) return 'N/I';

  const upper = fuelType.toUpperCase();
  const parts = upper.split('/').map((p) => p.trim());

  const hasGasolina = parts.some((p) => p.includes('GASOLINA'));
  const hasAlcool = parts.some((p) => p.includes('ALCOOL') || p.includes('ÁLCOOL') || p.includes('ETANOL'));

  if (hasGasolina && hasAlcool) {
    const others = parts.filter(
      (p) => !p.includes('GASOLINA') && !p.includes('ALCOOL') && !p.includes('ÁLCOOL') && !p.includes('ETANOL')
    );
    return others.length > 0 ? `FLEX/${others.join('/')}` : 'FLEX';
  }

  return fuelType;
}
