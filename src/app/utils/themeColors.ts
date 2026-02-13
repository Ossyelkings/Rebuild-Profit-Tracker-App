// Theme-aware color utility classes
export const themeColors = {
  // Cards and containers
  card: 'bg-card border-border',
  cardHover: 'hover:bg-muted',
  
  // Inputs
  input: 'bg-input-background border-border focus:border-blue-500',
  
  // Text colors
  textPrimary: 'text-foreground',
  textSecondary: 'text-muted-foreground',
  
  // Buttons
  buttonSecondary: 'bg-muted hover:bg-accent',
  buttonDanger: 'bg-red-600 hover:bg-red-700',
  
  // Status badges
  statusBadge: 'bg-muted text-muted-foreground',
} as const;
