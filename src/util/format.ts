/** Formatting utilities. */

export function formatUsd(value: number): string {
  return value.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  });
}

export function formatPct(value: number): string {
  return `${(value * 100).toFixed(0)}%`;
}
