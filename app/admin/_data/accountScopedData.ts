import {
  dynlanderDemoLeads,
  dynlanderThemePerformance,
  googleAdsAdMessages,
  googleAdsBudgetReview,
  googleAdsCampaigns,
  googleAdsExtensions,
  googleAdsKeywords,
  googleAdsPriorityItems,
  googleAdsSearchTerms,
  googleAdsSummary
} from './dynlanderAdminData';

const accountMultipliers: Record<string, number> = {
  'cash-offer-demo': 1,
  'north-texas-buyers': 0.72,
  'probate-home-demo': 0.48
};

const accountLabels: Record<string, { city: string; bestTheme: string; themePrefix: string }> = {
  'cash-offer-demo': { city: 'Plano', bestTheme: 'Repairs', themePrefix: 'DFW' },
  'north-texas-buyers': { city: 'Denton', bestTheme: 'Fast Sale', themePrefix: 'North Texas' },
  'probate-home-demo': { city: 'Dallas', bestTheme: 'Inherited', themePrefix: 'Probate' }
};

function multiplier(accountId: string) {
  return accountMultipliers[accountId] || 1;
}

function money(value: string, factor: number) {
  const numberValue = Number(value.replace(/[$,]/g, '')) || 0;
  return `$${Math.max(1, Math.round(numberValue * factor)).toLocaleString()}`;
}

function whole(value: string | number, factor: number) {
  const numberValue = typeof value === 'number' ? value : Number(String(value).replace(/,/g, '')) || 0;
  return Math.max(1, Math.round(numberValue * factor));
}

export function getAccountThemePerformance(accountId: string) {
  const factor = multiplier(accountId);
  return dynlanderThemePerformance.map((row) => ({
    ...row,
    clicks: whole(row.clicks, factor),
    leads: whole(row.leads, factor),
    cpl: money(row.cpl, accountId === 'probate-home-demo' ? 1.22 : factor < 1 ? 1.08 : 1)
  }));
}

export function getAccountLeads(accountId: string) {
  const label = accountLabels[accountId] || accountLabels['cash-offer-demo'];
  return dynlanderDemoLeads.map((lead, index) => ({
    ...lead,
    name: `${label.themePrefix} Seller ${index + 1}`,
    city: index % 2 === 0 ? label.city : lead.city,
    phone: `(555) ${accountId === 'north-texas-buyers' ? '220' : accountId === 'probate-home-demo' ? '330' : '010'}-${String(1200 + index).padStart(4, '0')}`
  }));
}

export function getAccountGoogleAdsSummary(accountId: string) {
  const factor = multiplier(accountId);
  return {
    ...googleAdsSummary,
    spend: money(googleAdsSummary.spend, factor),
    impressions: whole(googleAdsSummary.impressions, factor).toLocaleString(),
    clicks: whole(googleAdsSummary.clicks, factor).toLocaleString(),
    leads: String(whole(googleAdsSummary.leads, factor)),
    qualifiedLeads: String(whole(googleAdsSummary.qualifiedLeads, factor)),
    cpl: money(googleAdsSummary.cpl, accountId === 'probate-home-demo' ? 1.25 : factor < 1 ? 1.1 : 1),
    costPerQualifiedLead: money(googleAdsSummary.costPerQualifiedLead, accountId === 'probate-home-demo' ? 1.28 : factor < 1 ? 1.12 : 1)
  };
}

export function getAccountPriorityItems(accountId: string) {
  const label = accountLabels[accountId] || accountLabels['cash-offer-demo'];
  if (accountId === 'probate-home-demo') {
    return [
      { level: 'High', title: 'Inherited searches need stronger page match', detail: 'The selected account is probate-focused. Recommendations should prioritize inherited-house intent, probate FAQs, and softer trust-building copy.' },
      { level: 'High', title: 'Keep total budget inside account guardrails', detail: 'Do not recommend more spend unless another lower-intent campaign is reduced first.' },
      ...googleAdsPriorityItems.slice(1, 3)
    ];
  }
  if (accountId === 'north-texas-buyers') {
    return [
      { level: 'High', title: 'North Texas local variants need more coverage', detail: `Build city variants around ${label.city}, Frisco, McKinney, and Denton before scaling generic traffic.` },
      ...googleAdsPriorityItems.slice(0, 3)
    ];
  }
  return googleAdsPriorityItems;
}

export function getAccountCampaigns(accountId: string) {
  const factor = multiplier(accountId);
  const label = accountLabels[accountId] || accountLabels['cash-offer-demo'];
  return googleAdsCampaigns.map((row) => ({
    ...row,
    name: accountId === 'probate-home-demo' && row.name === 'Inherited House' ? 'Probate / Inherited House' : row.name,
    budget: money(row.budget.replace('/day', ''), factor) + '/day',
    spend: money(row.spend, factor),
    impressions: whole(row.impressions, factor).toLocaleString(),
    clicks: whole(row.clicks, factor),
    leads: whole(row.leads, factor),
    aiRead: `${row.aiRead} Account scope: ${label.themePrefix}.`
  }));
}

export function getAccountAdMessages(accountId: string) {
  const label = accountLabels[accountId] || accountLabels['cash-offer-demo'];
  return googleAdsAdMessages.map((row) => ({
    ...row,
    theme: accountId === 'probate-home-demo' && row.landingPage === 'inherited' ? 'Probate / Inherited House' : row.theme,
    aiRead: `${row.aiRead} Apply to ${label.themePrefix} account only.`
  }));
}

export function getAccountKeywords(accountId: string) {
  if (accountId === 'probate-home-demo') {
    return googleAdsKeywords.map((row) => row.keyword === 'sell inherited house' ? { ...row, action: 'Primary keyword for this account. Build more probate and inherited-house page content.' } : row);
  }
  return googleAdsKeywords;
}

export function getAccountSearchTerms(accountId: string) {
  if (accountId === 'north-texas-buyers') {
    return googleAdsSearchTerms.map((row) => ({ ...row, action: row.action.replace('Plano', 'Denton') }));
  }
  return googleAdsSearchTerms;
}

export function getAccountExtensions(accountId: string) {
  if (accountId === 'probate-home-demo') {
    return googleAdsExtensions.map((row) => row.text === 'Inherited House' ? { ...row, text: 'Probate / Inherited House', note: 'Primary sitelink for this selected account.' } : row);
  }
  return googleAdsExtensions;
}

export function getAccountBudgetReview(accountId: string) {
  if (accountId === 'probate-home-demo') {
    return [
      { area: 'Budget focus', note: 'Keep probate and inherited-house campaigns protected before funding broader cash-offer traffic.' },
      ...googleAdsBudgetReview.slice(1)
    ];
  }
  return googleAdsBudgetReview;
}

export function getAccountBestTheme(accountId: string) {
  return (accountLabels[accountId] || accountLabels['cash-offer-demo']).bestTheme;
}
