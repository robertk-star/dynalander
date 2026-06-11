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
