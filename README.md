# Rebuild Profit Tracker

A professional mobile app for tracking automotive rebuild projects, repair costs, and profit margins.

## Features

### Dashboard
- Overview of all vehicles with key financial metrics
- Total invested amount, projected revenue, and estimated profit
- Status breakdown (In Repair, Awaiting Parts, Inspection Pending, Completed, Sold)
- Quick access to recent vehicles

### Vehicle Management
- Add unlimited vehicles with detailed information
- Track make, model, year, VIN, odometer, auction details
- Record purchase price, auction fees, and transport costs
- Set estimated sale prices and track actual sale prices
- Update vehicle status throughout the rebuild process

### Cost Tracking
- Add detailed cost entries with 8 predefined categories:
  - Parts
  - Labour
  - Mechanical
  - Paint & Body
  - Inspection
  - Registration
  - Transport
  - Miscellaneous
- Record supplier, invoice number, date, and amount
- Attach receipts (future enhancement)

### Financial Analytics
- Real-time profit and ROI calculations
- Automatic investment tracking (purchase price + fees + costs)
- Color-coded profit display (green for profit, red for loss)
- Detailed cost breakdowns per vehicle

### Reports & Insights
- Visual charts showing profit by vehicle
- Status distribution pie chart
- Vehicle performance table with margins
- Export functionality (PDF export ready)

### Data Management
- LocalStorage persistence
- Export data as JSON backup
- Import data from backup files
- Clear all data option

## Getting Started

On first launch, you can:
1. **Get Started** - Add your first vehicle manually
2. **Load Sample Data** - Explore the app with 3 pre-populated vehicles

## Technology Stack

- **React 18** with TypeScript
- **Tailwind CSS v4** for styling
- **Recharts** for data visualization
- **Lucide React** for icons
- **LocalStorage** for data persistence

## Design

- Dark theme optimized for mobile viewing
- Card-based UI with rounded corners
- Large, bold numbers for financial data
- Bottom tab navigation for easy access
- Professional, finance-focused appearance
- Responsive layout (optimized for mobile, max-width 768px)

## Data Storage

All data is stored locally in your browser's LocalStorage. No account or internet connection required.

**Note**: Since data is stored locally, clearing browser data will delete all tracked vehicles. Use the export feature regularly to back up your data.

## Future Enhancements

- Photo uploads for vehicles and receipts
- Cloud sync with Supabase backend
- Multi-device access
- PDF report generation
- Calendar view for scheduled work
- Notifications for pending tasks
- Multi-currency support
- Custom cost categories

---

Built with ❤️ for car flippers, auction buyers, and automotive professionals.
