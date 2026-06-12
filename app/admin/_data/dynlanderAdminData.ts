export type SellerTheme = {
  id: string;
  label: string;
  angle: string;
  headline: string;
  subheadline: string;
  cta: string;
  formIntro: string;
  chatOpening: string;
  faq1: string;
};

export const dynlanderThemes: SellerTheme[] = [
  {
    id: 'fast',
    label: 'Sell Fast',
    angle: 'Speed and flexible closing',
    headline: 'Need to Sell Your House Fast in {city}?',
    subheadline: 'Request a simple cash offer and choose a closing date that works for you.',
    cta: 'Get My Fast Cash Offer',
    formIntro: 'Share a few details and we will follow up about your selling timeline.',
    chatOpening: 'Hi, I can help you request a fast cash offer. How soon are you hoping to sell?',
    faq1: 'No. You can review the offer and decide if it makes sense.'
  },
  {
    id: 'repairs',
    label: 'Repairs / As-Is',
    angle: 'No repairs or cleanup',
    headline: 'Sell Your House As-Is in {city}',
    subheadline: 'No repairs, updates, painting, or cleanup required before requesting an offer.',
    cta: 'Get an As-Is Offer',
    formIntro: 'You can request an offer even if the house needs major repairs.',
    chatOpening: 'Hi, I can help with an as-is offer. What repairs does the property need?',
    faq1: 'Yes. The point of an as-is offer is to review the property without asking you to repair it first.'
  },
  {
    id: 'inherited',
    label: 'Inherited House',
    angle: 'Inherited property help',
    headline: 'Inherited a House in {city}?',
    subheadline: 'Request an offer without cleaning it out, making repairs, or listing it with an agent.',
    cta: 'Get an Inherited House Offer',
    formIntro: 'Tell us about the inherited property and your timeline.',
    chatOpening: 'Hi, I can help you request an offer for an inherited property. Is it occupied or vacant?',
    faq1: 'Often, yes. Many inherited properties can be reviewed as-is, including items left behind.'
  },
  {
    id: 'foreclosure',
    label: 'Foreclosure Concern',
    angle: 'Careful, option-based language',
    headline: 'Need to Sell a House Quickly in {city}?',
    subheadline: 'Request a cash offer and review whether selling may be an option for your timeline.',
    cta: 'Talk Through My Options',
    formIntro: 'Share your timeline so the buyer can review whether a fast sale may fit.',
    chatOpening: 'Hi, I can help you request a cash offer and review your selling timeline. Are you looking to sell quickly?',
    faq1: 'No result is guaranteed. The goal is to review whether a cash sale may be one possible option.'
  },
  {
    id: 'landlord',
    label: 'Tired Landlord',
    angle: 'Rental property and tenant headaches',
    headline: 'Ready to Sell Your Rental Property in {city}?',
    subheadline: 'Whether it is vacant, occupied, or needs repairs, you can request a cash offer.',
    cta: 'Get a Rental Property Offer',
    formIntro: 'Tell us about the rental property and whether it is occupied.',
    chatOpening: 'Hi, I can help with rental property offers. Is the property occupied right now?',
    faq1: 'In many cases, yes. The buyer can review occupied and vacant rental properties.'
  }
];

export const dynlanderThemePerformance = [
  { theme: 'Repairs / As-Is', clicks: 184, leads: 27, conversion: '14.7%', cpl: '$82' },
  { theme: 'Inherited House', clicks: 96, leads: 15, conversion: '15.6%', cpl: '$71' },
  { theme: 'Sell Fast', clicks: 212, leads: 21, conversion: '9.9%', cpl: '$104' },
  { theme: 'Foreclosure Concern', clicks: 132, leads: 10, conversion: '7.6%', cpl: '$128' },
  { theme: 'Tired Landlord', clicks: 88, leads: 9, conversion: '10.2%', cpl: '$93' }
];

export const dynlanderDemoLeads = [
  { name: 'Demo Seller 1', phone: '(555) 010-1200', city: 'Plano', theme: 'Repairs / As-Is', source: 'Google CPC', status: 'New', created: 'Today' },
  { name: 'Demo Seller 2', phone: '(555) 010-2341', city: 'Frisco', theme: 'Inherited House', source: 'Google CPC', status: 'Contacted', created: 'Today' },
  { name: 'Demo Seller 3', phone: '(555) 010-9912', city: 'Dallas', theme: 'Sell Fast', source: 'Landing Page', status: 'New', created: 'Yesterday' },
  { name: 'Demo Seller 4', phone: '(555) 010-8821', city: 'McKinney', theme: 'Foreclosure Concern', source: 'Chat', status: 'Review', created: 'Yesterday' },
  { name: 'Demo Seller 5', phone: '(555) 010-6755', city: 'Fort Worth', theme: 'Tired Landlord', source: 'Google CPC', status: 'New', created: '2 days ago' }
];

export const googleAdsSummary = {
  spend: '$7,842',
  clicks: '1,438',
  impressions: '22,910',
  ctr: '6.3%',
  leads: '92',
  cpl: '$85',
  conversionRate: '6.4%'
};

export const googleAdsCampaigns = [
  { name: 'Sell As-Is / Repairs', bidStrategy: 'Maximize Conversions', budget: '$175/day', spend: '$2,214', clicks: 382, ctr: '7.8%', leads: 39, cpl: '$57', aiRead: 'Best performer. Consider more budget and more city variants.' },
  { name: 'Cash Offer Fast', bidStrategy: 'Target CPA', budget: '$150/day', spend: '$2,482', clicks: 476, ctr: '5.9%', leads: 26, cpl: '$95', aiRead: 'Good volume, but message is broad. Test stronger seller intent pages.' },
  { name: 'Foreclosure Options', bidStrategy: 'Maximize Clicks', budget: '$90/day', spend: '$1,336', clicks: 318, ctr: '8.4%', leads: 11, cpl: '$121', aiRead: 'High click interest, weaker leads. Review page tone and form friction.' },
  { name: 'Inherited House', bidStrategy: 'Maximize Conversions', budget: '$100/day', spend: '$1,810', clicks: 262, ctr: '6.1%', leads: 16, cpl: '$113', aiRead: 'Strong intent. Needs more probate/inherited ad copy tests.' }
];

export const googleAdsKeywords = [
  { keyword: 'sell my house fast', clicks: 184, leads: 18, cpl: '$73', action: 'Keep and test city-specific page copy.' },
  { keyword: 'sell house as is', clicks: 142, leads: 22, cpl: '$52', action: 'Scale. This matches the repairs landing page well.' },
  { keyword: 'we buy houses', clicks: 238, leads: 12, cpl: '$138', action: 'Broad but expensive. Split by city and review search terms.' },
  { keyword: 'sell inherited house', clicks: 84, leads: 10, cpl: '$64', action: 'Keep. Add more inherited-house FAQs.' },
  { keyword: 'avoid foreclosure sell house', clicks: 91, leads: 5, cpl: '$146', action: 'Review ad copy and use softer, option-based page language.' }
];

export const googleAdsSearchTerms = [
  { term: 'sell my house fast plano', cost: '$214', leads: 5, label: 'High intent. Keep.' },
  { term: 'homes for sale in plano', cost: '$118', leads: 0, label: 'Wrong intent. Add negative keyword.' },
  { term: 'zillow home value estimate', cost: '$92', leads: 0, label: 'Research intent. Consider negative.' },
  { term: 'sell inherited house without probate', cost: '$176', leads: 3, label: 'High intent. Build probate FAQ content.' },
  { term: 'rental houses near me', cost: '$64', leads: 0, label: 'Wrong intent. Add negative keyword.' }
];

export const googleAdsExtensions = [
  { type: 'Sitelink', text: 'Sell As-Is', clicks: 88, leads: 13, note: 'Strong match with repairs theme.' },
  { type: 'Sitelink', text: 'Inherited House', clicks: 41, leads: 7, note: 'Good conversion. Keep and expand.' },
  { type: 'Callout', text: 'No Repairs Needed', clicks: 'n/a', leads: 'n/a', note: 'Good message support for as-is campaigns.' },
  { type: 'Callout', text: 'Close On Your Timeline', clicks: 'n/a', leads: 'n/a', note: 'Useful but generic. Test stronger wording.' },
  { type: 'Structured Snippet', text: 'Situations: Foreclosure, Divorce, Probate, Relocation', clicks: 'n/a', leads: 'n/a', note: 'Good seller-intent coverage.' }
];

export const googleAdsRecommendations = [
  'Move more budget toward Sell As-Is / Repairs because it has the lowest demo CPL.',
  'Add negative keywords for homes for sale, rental houses, and home value estimate searches.',
  'Review Foreclosure Options because CTR is strong but lead conversion is weak.',
  'Build more inherited-house landing page FAQs because inherited searches show high intent.',
  'Compare sitelink clicks against landing page themes to find which message produces real leads.'
];
