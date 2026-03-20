/**
 * Calculate total expenses from an entry
 * @param {number} miles - Miles driven
 * @param {number} gasCost - Gas cost paid
 * @param {object} settings - Settings object with mileage rates
 * @returns {number} Total expenses
 */
export function calculateExpenses(miles, gasCost, settings) {
  const mileageExpense = miles * (settings.mileageRate || 0.67);
  const wearExpense = settings.includeVehicleWear
    ? miles * (settings.vehicleWearPerMile || 0.15)
    : 0;

  return mileageExpense + wearExpense + (gasCost || 0);
}

/**
 * Calculate taxable income
 * @param {number} gross - Gross earnings
 * @param {number} expenses - Total expenses
 * @returns {number} Taxable income (never negative)
 */
export function calculateTaxableIncome(gross, expenses) {
  return Math.max(0, gross - expenses);
}

/**
 * Calculate estimated tax owed
 * @param {number} taxableIncome - Taxable income
 * @param {object} settings - Settings with tax rate and SE tax toggle
 * @returns {number} Estimated tax
 */
export function calculateEstimatedTax(taxableIncome, settings) {
  const taxRate = (settings.taxRate || 25) / 100;
  let incomeTax = taxableIncome * taxRate;

  // Self-employment tax: 15.3% on 92.35% of net self-employment income
  let selfEmploymentTax = 0;
  if (settings.includeSelfEmploymentTax) {
    selfEmploymentTax = taxableIncome * 0.9235 * 0.153;
  }

  return incomeTax + selfEmploymentTax;
}

/**
 * Calculate take-home pay
 * @param {number} gross - Gross earnings
 * @param {number} expenses - Total expenses
 * @param {number} estimatedTax - Estimated tax
 * @returns {number} Take-home pay
 */
export function calculateTakeHome(gross, expenses, estimatedTax) {
  return gross - expenses - estimatedTax;
}

/**
 * Calculate true hourly rate
 * @param {number} takeHome - Take-home pay
 * @param {number} hours - Hours worked
 * @returns {number} Hourly rate (0 if no hours)
 */
export function calculateTrueHourly(takeHome, hours) {
  if (!hours || hours <= 0) return 0;
  return takeHome / hours;
}

/**
 * Calculate recommended tax set-aside (with 5% buffer)
 * @param {number} estimatedTax - Estimated tax
 * @returns {number} Amount to set aside
 */
export function calculateSetAside(estimatedTax) {
  return estimatedTax * 1.05;
}

/**
 * Aggregate entries for a specific date
 * @param {array} entries - All entries
 * @param {string} date - Date string (YYYY-MM-DD)
 * @param {object} settings - Settings for calculations
 * @returns {object} Aggregated data for the day
 */
export function aggregateEntriesForDay(entries, date, settings) {
  const dayEntries = entries.filter((e) => e.date === date);

  const totals = dayEntries.reduce(
    (acc, entry) => ({
      basePay: acc.basePay + (entry.basePay || 0),
      tips: acc.tips + (entry.tips || 0),
      gross: acc.gross + (entry.earnings || 0),
      miles: acc.miles + (entry.miles || 0),
      hours: acc.hours + (entry.hours || 0),
      gasCost: acc.gasCost + (entry.gasCost || 0),
      entryCount: acc.entryCount + 1,
    }),
    { basePay: 0, tips: 0, gross: 0, miles: 0, hours: 0, gasCost: 0, entryCount: 0 }
  );

  const expenses = calculateExpenses(totals.miles, totals.gasCost, settings);
  const taxableIncome = calculateTaxableIncome(totals.gross, expenses);
  const estimatedTax = calculateEstimatedTax(taxableIncome, settings);
  const takeHome = calculateTakeHome(totals.gross, expenses, estimatedTax);
  const trueHourly = calculateTrueHourly(takeHome, totals.hours);
  const setAside = calculateSetAside(estimatedTax);

  return {
    date,
    entries: dayEntries,
    ...totals,
    expenses,
    taxableIncome,
    estimatedTax,
    takeHome,
    trueHourly,
    setAside,
  };
}

/**
 * Aggregate entries for a week (last 7 days)
 * @param {array} entries - All entries
 * @param {array} caAdjustments - California adjustments
 * @param {object} settings - Settings for calculations
 * @returns {object} Aggregated data for the week
 */
export function aggregateEntriesForWeek(entries, caAdjustments = [], settings) {
  const today = new Date();
  const weekAgo = new Date(today);
  weekAgo.setDate(weekAgo.getDate() - 6);

  const startDate = weekAgo.toISOString().split('T')[0];
  const endDate = today.toISOString().split('T')[0];

  const weekEntries = entries.filter((e) => e.date >= startDate && e.date <= endDate);
  const weekAdjustments = caAdjustments.filter((a) => a.date >= startDate && a.date <= endDate);

  const totals = weekEntries.reduce(
    (acc, entry) => ({
      basePay: acc.basePay + (entry.basePay || 0),
      tips: acc.tips + (entry.tips || 0),
      gross: acc.gross + (entry.earnings || 0),
      miles: acc.miles + (entry.miles || 0),
      hours: acc.hours + (entry.hours || 0),
      gasCost: acc.gasCost + (entry.gasCost || 0),
      entryCount: acc.entryCount + 1,
    }),
    { basePay: 0, tips: 0, gross: 0, miles: 0, hours: 0, gasCost: 0, entryCount: 0 }
  );

  // Add CA adjustments to gross
  const caAdjustmentTotal = weekAdjustments.reduce((sum, adj) => sum + (adj.amount || 0), 0);
  totals.gross += caAdjustmentTotal;
  totals.caAdjustments = caAdjustmentTotal;

  const expenses = calculateExpenses(totals.miles, totals.gasCost, settings);
  const taxableIncome = calculateTaxableIncome(totals.gross, expenses);
  const estimatedTax = calculateEstimatedTax(taxableIncome, settings);
  const takeHome = calculateTakeHome(totals.gross, expenses, estimatedTax);
  const trueHourly = calculateTrueHourly(takeHome, totals.hours);
  const setAside = calculateSetAside(estimatedTax);

  // Daily breakdown
  const dailyBreakdown = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];
    dailyBreakdown.push(aggregateEntriesForDay(entries, dateStr, settings));
  }

  return {
    startDate,
    endDate,
    entries: weekEntries,
    adjustments: weekAdjustments,
    ...totals,
    expenses,
    taxableIncome,
    estimatedTax,
    takeHome,
    trueHourly,
    setAside,
    dailyBreakdown,
  };
}

/**
 * Aggregate entries for a specific month
 * @param {array} entries - All entries
 * @param {number} month - Month (1-12)
 * @param {number} year - Year (e.g., 2025)
 * @param {array} caAdjustments - California adjustments
 * @param {object} settings - Settings for calculations
 * @returns {object} Aggregated data for the month
 */
export function aggregateEntriesForMonth(entries, month, year, caAdjustments = [], settings) {
  const startDate = `${year}-${String(month).padStart(2, '0')}-01`;
  const lastDay = new Date(year, month, 0).getDate();
  const endDate = `${year}-${String(month).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;

  const monthEntries = entries.filter((e) => e.date >= startDate && e.date <= endDate);
  const monthAdjustments = caAdjustments.filter((a) => a.date >= startDate && a.date <= endDate);

  const totals = monthEntries.reduce(
    (acc, entry) => ({
      basePay: acc.basePay + (entry.basePay || 0),
      tips: acc.tips + (entry.tips || 0),
      gross: acc.gross + (entry.earnings || 0),
      miles: acc.miles + (entry.miles || 0),
      hours: acc.hours + (entry.hours || 0),
      gasCost: acc.gasCost + (entry.gasCost || 0),
      entryCount: acc.entryCount + 1,
    }),
    { basePay: 0, tips: 0, gross: 0, miles: 0, hours: 0, gasCost: 0, entryCount: 0 }
  );

  // Add CA adjustments
  const caAdjustmentTotal = monthAdjustments.reduce((sum, adj) => sum + (adj.amount || 0), 0);
  totals.gross += caAdjustmentTotal;
  totals.caAdjustments = caAdjustmentTotal;

  const expenses = calculateExpenses(totals.miles, totals.gasCost, settings);
  const taxableIncome = calculateTaxableIncome(totals.gross, expenses);
  const estimatedTax = calculateEstimatedTax(taxableIncome, settings);
  const takeHome = calculateTakeHome(totals.gross, expenses, estimatedTax);
  const trueHourly = calculateTrueHourly(takeHome, totals.hours);
  const setAside = calculateSetAside(estimatedTax);

  return {
    month,
    year,
    startDate,
    endDate,
    entries: monthEntries,
    adjustments: monthAdjustments,
    ...totals,
    expenses,
    taxableIncome,
    estimatedTax,
    takeHome,
    trueHourly,
    setAside,
  };
}

/**
 * Get platform breakdown from entries
 * @param {array} entries - All entries
 * @param {array} platforms - Available platforms
 * @returns {array} Platform stats sorted by earnings
 */
export function getPlatformBreakdown(entries, platforms) {
  const platformStats = {};

  entries.forEach((entry) => {
    if (!platformStats[entry.platformId]) {
      const platform = platforms.find((p) => p.id === entry.platformId);
      platformStats[entry.platformId] = {
        platformId: entry.platformId,
        platformName: platform?.name || 'Unknown',
        earnings: 0,
        trips: 0,
        miles: 0,
        hours: 0,
      };
    }

    platformStats[entry.platformId].earnings += entry.earnings || 0;
    platformStats[entry.platformId].trips += 1;
    platformStats[entry.platformId].miles += entry.miles || 0;
    platformStats[entry.platformId].hours += entry.hours || 0;
  });

  const totalEarnings = Object.values(platformStats).reduce((sum, p) => sum + p.earnings, 0);

  return Object.values(platformStats)
    .map((p) => ({
      ...p,
      percentage: totalEarnings > 0 ? (p.earnings / totalEarnings) * 100 : 0,
    }))
    .sort((a, b) => b.earnings - a.earnings);
}

/**
 * Format currency for display
 * @param {number} amount - Amount to format
 * @returns {string} Formatted currency string
 */
export function formatCurrency(amount) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount || 0);
}

/**
 * Format hours for display
 * @param {number} hours - Hours (decimal)
 * @returns {string} Formatted time string (e.g., "2h 30m")
 */
export function formatHours(hours) {
  if (!hours || hours <= 0) return '0h';
  const h = Math.floor(hours);
  const m = Math.round((hours - h) * 60);
  if (m === 0) return `${h}h`;
  if (h === 0) return `${m}m`;
  return `${h}h ${m}m`;
}
