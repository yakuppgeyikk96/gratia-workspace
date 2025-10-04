export interface Currency {
  value: string;
  label: string;
  icon: string;
}

export const CURRENCIES: Currency[] = [
  { value: "USD", label: "USD", icon: "$" },
  { value: "EUR", label: "EUR", icon: "€" },
  { value: "TRY", label: "TRY", icon: "₺" },
];
