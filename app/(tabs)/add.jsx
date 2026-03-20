import { Redirect } from 'expo-router';

// This tab is just a placeholder - the floating button navigates to /add-trip
export default function AddTab() {
  return <Redirect href="/add-trip" />;
}
