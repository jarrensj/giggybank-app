# Giggy Bank

A gig economy earnings tracker that helps drivers see their true take-home pay after expenses and taxes.

## Disclaimer

**This app is for informational and educational purposes only. It does not constitute tax, legal, or financial advice.** The calculations and estimates provided are approximations based on user inputs and may not reflect your actual tax liability. Tax laws vary by jurisdiction and individual circumstances.

**Always consult a qualified tax professional** for advice specific to your situation before making financial decisions or filing taxes.

## Features

### Trip & Earnings Tracking
- Log individual trips or daily totals
- Track base pay, tips, miles, hours, and gas costs
- Edit or delete any entry
- Support for multiple platforms (Uber, Lyft, DoorDash, etc.)

### Real-Time Calculations
- **True Hourly Rate**: See what you actually earn per hour after expenses
- **Tax Set-Aside**: Estimated amount to save for quarterly taxes
- **Expense Tracking**: Automatic mileage deduction using IRS standard rates
- **Self-Employment Tax**: Optional 15.3% SE tax calculation

### Dashboard Views
- **Today**: Daily summary with gross, take-home, and true hourly
- **Week**: 7-day rolling summary with daily breakdown chart
- **History**: Browse all past entries grouped by week with platform filters
- **Analytics**: Platform breakdown with earnings percentages

### Tax Features
- Quarterly tax deadline countdown
- Monthly PDF tax reports
- California Prop 22 adjustment tracking (optional)

### Data Management
- Export all entries as CSV
- Export monthly PDF reports
- Backup/restore via JSON file
- Clear all data option

### Privacy First
- **100% Offline**: All data stays on your device
- **No Account Required**: No sign-up, no tracking
- **No Ads**: Clean, distraction-free experience

### Customization
- Adjustable tax rate (0-50%)
- Custom mileage rate
- Vehicle wear-and-tear tracking
- California Prop 22 mode

## Tech Stack

- React Native / Expo
- Zustand (state management)
- AsyncStorage (local persistence)
- expo-print (PDF generation)
- expo-file-system (data export)

## Getting Started

1. Install dependencies

   ```bash
   npm install
   ```

2. Start the app

   ```bash
   npx expo start
   ```

