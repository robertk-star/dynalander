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

export const googleAdsAccounts = [
  { id: 'cash-offer-demo', name: 'Cash Offer Demo', customerId: '123-456-7890', market: 'DFW Home Buyers' },
  { id: 'north-texas-buyers', name: 'North Texas Buyers', customerId: '234-567-8901', market: 'North Texas' },
  { id: 'probate-home-demo', name: 'Probate Home Demo', customerId: '345-678-9012', market: 'Inherited / Probate' }
];

export const googleAdsDateRanges = ['Today', 'Yesterday', 'Last 7 Days', 'Last 30 Days', 'This Month', 'Last Month'];

export const googleAdsSummary = {
  spend: '$7,842',
  impressions: '22,910',
  clicks: '1,438',
  ctr: '6.3%',
  avgCpc: '$5.45',
  leads: '92',
  conversionRate: '6.4%',
  cpl: '$85',
  qualifiedLeads: '54',
  costPerQualifiedLead: '$145'
};

export const googleAdsPriorityItems = [
  { level: 'High', title: 'Search terms are wasting spend', detail: 'Mock data shows $274 spent on buyer-intent searches like homes for sale and rental houses. Add negatives before scaling budget.' },
  { level: 'High', title: 'Repairs / As-Is should be scaled', detail: 'This campaign has the best demo CPL and the strongest message-to-page match. Create more city variants and increase budget carefully.' },
  { level: 'Medium', title: 'Foreclosure has click interest but weak lead conversion', detail: 'CTR is high, but CPL is weak. Test softer wording and reduce form friction.' },
  { level: 'Medium', title: 'Broad We Buy Houses keywords need tighter control', detail: 'Broad message traffic is expensive. Split by city, tighten match types, and send clicks to more specific DynLander themes.' }
];

export const googleAdsCampaigns = [
  { name: 'Sell As-Is / Repairs', status: 'Enabled', bidStrategy: 'Maximize Conversions', budget: '$175/day', spend: '$2,214', impressions: '4,912', clicks: 382, ctr: '7.8%', avgCpc: '$5.80', leads: 39, conversionRate: '10.2%', cpl: '$57', quality: 'Scale', aiRead: 'Best performer. Consider more budget and more city variants.' },
  { name: 'Cash Offer Fast', status: 'Enabled', bidStrategy: 'Target CPA', budget: '$150/day', spend: '$2,482', impressions: '8,067', clicks: 476, ctr: '5.9%', avgCpc: '$5.21', leads: 26, conversionRate: '5.5%', cpl: '$95', quality: 'Watch', aiRead: 'Good volume, but message is broad. Test stronger seller intent pages.' },
  { name: 'Foreclosure Options', status: 'Limited by strategy', bidStrategy: 'Maximize Clicks', budget: '$90/day', spend: '$1,336', impressions: '3,786', clicks: 318, ctr: '8.4%', avgCpc: '$4.20', leads: 11, conversionRate: '3.5%', cpl: '$121', quality: 'Needs work', aiRead: 'High click interest, weaker leads. Review page tone and form friction.' },
  { name: 'Inherited House', status: 'Enabled', bidStrategy: 'Maximize Conversions', budget: '$100/day', spend: '$1,810', impressions: '3,422', clicks: 262, ctr: '6.1%', avgCpc: '$6.91', leads: 16, conversionRate: '6.1%', cpl: '$113', quality: 'Build out', aiRead: 'Strong intent. Needs more probate/inherited ad copy tests.' }
];

export const googleAdsAdMessages = [
  { theme: 'Repairs / As-Is', angle: 'No repairs needed', clicks: 241, ctr: '8.1%', leads: 31, cpl: '$61', landingPage: 'repairs', aiRead: 'Best ad-to-page match. Keep testing as-is language.' },
  { theme: 'Fast Cash Offer', angle: 'Speed and cash offer', clicks: 386, ctr: '6.0%', leads: 22, cpl: '$102', landingPage: 'fast', aiRead: 'Gets clicks but not enough qualified leads. Make copy more specific.' },
  { theme: 'Inherited House', angle: 'Inherited property cleanup', clicks: 119, ctr: '6.7%', leads: 13, cpl: '$76', landingPage: 'inherited', aiRead: 'Strong seller intent. Add probate and cleanout FAQs.' },
  { theme: 'Foreclosure Options', angle: 'Timeline pressure', clicks: 164, ctr: '8.9%', leads: 7, cpl: '$151', landingPage: 'foreclosure', aiRead: 'High sensitivity. Test less aggressive CTA wording.' },
  { theme: 'Tired Landlord', angle: 'Tenant headaches', clicks: 92, ctr: '5.4%', leads: 8, cpl: '$89', landingPage: 'landlord', aiRead: 'Good niche. Needs more rental-property sitelinks.' }
];

export const googleAdsKeywords = [
  { keyword: 'sell my house fast', matchType: 'Phrase', spend: '$1,314', clicks: 184, ctr: '6.8%', leads: 18, cpl: '$73', intent: 'High', action: 'Keep and test city-specific page copy.' },
  { keyword: 'sell house as is', matchType: 'Exact', spend: '$1,144', clicks: 142, ctr: '8.9%', leads: 22, cpl: '$52', intent: 'High', action: 'Scale. This matches the repairs landing page well.' },
  { keyword: 'we buy houses', matchType: 'Broad', spend: '$1,656', clicks: 238, ctr: '5.1%', leads: 12, cpl: '$138', intent: 'Mixed', action: 'Broad but expensive. Split by city and review search terms.' },
  { keyword: 'sell inherited house', matchType: 'Phrase', spend: '$642', clicks: 84, ctr: '7.3%', leads: 10, cpl: '$64', intent: 'High', action: 'Keep. Add more inherited-house FAQs.' },
  { keyword: 'avoid foreclosure sell house', matchType: 'Phrase', spend: '$731', clicks: 91, ctr: '9.1%', leads: 5, cpl: '$146', intent: 'High but sensitive', action: 'Review ad copy and use softer, option-based page language.' }
];

export const googleAdsSearchTerms = [
  { term: 'sell my house fast plano', matchedKeyword: 'sell my house fast', spend: '$214', clicks: 32, leads: 5, intent: 'High', action: 'Keep and create Plano-specific variant.' },
  { term: 'homes for sale in plano', matchedKeyword: 'we buy houses', spend: '$118', clicks: 27, leads: 0, intent: 'Wrong intent', action: 'Add homes for sale as negative.' },
  { term: 'zillow home value estimate', matchedKeyword: 'we buy houses', spend: '$92', clicks: 19, leads: 0, intent: 'Research only', action: 'Consider negative or send to valuation content.' },
  { term: 'sell inherited house without probate', matchedKeyword: 'sell inherited house', spend: '$176', clicks: 21, leads: 3, intent: 'High', action: 'Build probate FAQ content.' },
  { term: 'rental houses near me', matchedKeyword: 'we buy houses', spend: '$64', clicks: 14, leads: 0, intent: 'Wrong intent', action: 'Add rental houses as negative.' }
];

export const googleAdsExtensions = [
  { type: 'Sitelink', text: 'Sell As-Is', destination: '/sell?theme=repairs', clicks: 88, leads: 13, note: 'Strong match with repairs theme. Keep and test city variants.' },
  { type: 'Sitelink', text: 'Inherited House', destination: '/sell?theme=inherited', clicks: 41, leads: 7, note: 'Good conversion. Keep and expand.' },
  { type: 'Sitelink', text: 'How It Works', destination: '/sell?theme=fast#how-it-works', clicks: 53, leads: 4, note: 'Educational, but weaker lead conversion.' },
  { type: 'Callout', text: 'No Repairs Needed', destination: 'Ad extension', clicks: 'n/a', leads: 'n/a', note: 'Good message support for as-is campaigns.' },
  { type: 'Callout', text: 'Close On Your Timeline', destination: 'Ad extension', clicks: 'n/a', leads: 'n/a', note: 'Useful but generic. Test stronger wording.' },
  { type: 'Structured Snippet', text: 'Situations: Foreclosure, Divorce, Probate, Relocation', destination: 'Ad extension', clicks: 'n/a', leads: 'n/a', note: 'Good seller-intent coverage.' }
];

export const googleAdsBudgetReview = [
  { area: 'Budget shift', note: 'Move 10-15% of budget from broad Cash Offer Fast into Sell As-Is / Repairs after negative keywords are added.' },
  { area: 'Limited budget', note: 'Inherited House has strong intent but limited volume. Test more cities before increasing daily budget.' },
  { area: 'Bid strategy', note: 'Foreclosure Options uses Maximize Clicks. This may be driving low-quality traffic. Test Maximize Conversions after conversion tracking is trusted.' },
  { area: 'Tracking caution', note: 'Do not scale until form, chat, and call leads are separated into qualified and unqualified lead types.' }
];

export const googleAdsRecommendations = [
  'Move more budget toward Sell As-Is / Repairs because it has the lowest demo CPL.',
  'Add negative keywords for homes for sale, rental houses, and home value estimate searches.',
  'Review Foreclosure Options because CTR is strong but lead conversion is weak.',
  'Build more inherited-house landing page FAQs because inherited searches show high intent.',
  'Compare sitelink clicks against landing page themes to find which message produces real leads.'
];