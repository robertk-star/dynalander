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
    subheadline: 'Sell it as-is without cleaning it out, making repairs, or listing it with an agent.',
    cta: 'Get an Inherited Property Offer',
    formIntro: 'Share the property details and whether anyone is currently living there.',
    chatOpening: 'Hi, I can help you request an offer for an inherited property. Is the house currently occupied or vacant?',
    faq1: 'Yes. You can request an offer before removing items or making repairs.'
  },
  {
    id: 'foreclosure',
    label: 'Foreclosure Concern',
    angle: 'Timeline and options',
    headline: 'Need to Sell a House Quickly in {city}?',
    subheadline: 'Request a cash offer and review whether selling may be an option for your timeline.',
    cta: 'Talk Through My Options',
    formIntro: 'Share the property and timing details so someone can follow up quickly.',
    chatOpening: 'Hi, I can help you request a cash offer and review your selling timeline. Are you looking to sell quickly?',
    faq1: 'It may be one option depending on timing, title, lender details, and your situation. No result is guaranteed.'
  },
  {
    id: 'landlord',
    label: 'Tired Landlord',
    angle: 'Rental property exit',
    headline: 'Ready to Sell Your Rental Property in {city}?',
    subheadline: 'Request an offer for a vacant, occupied, damaged, or hard-to-manage rental property.',
    cta: 'Get a Rental Property Offer',
    formIntro: 'Share whether the property is occupied and what makes you ready to sell.',
    chatOpening: 'Hi, I can help with a rental property offer. Is the property occupied right now?',
    faq1: 'Some buyers may review occupied properties. The details depend on the lease, tenant status, and local rules.'
  }
];

export const dynlanderThemePerformance = [
  { theme: 'Repairs / As-Is', clicks: 182, leads: 27, cpl: '$48', conversion: '14.8%' },
  { theme: 'Inherited House', clicks: 94, leads: 18, cpl: '$41', conversion: '19.1%' },
  { theme: 'Sell Fast', clicks: 241, leads: 21, cpl: '$63', conversion: '8.7%' },
  { theme: 'Foreclosure Concern', clicks: 133, leads: 11, cpl: '$79', conversion: '8.3%' },
  { theme: 'Tired Landlord', clicks: 76, leads: 9, cpl: '$55', conversion: '11.8%' }
];

export const dynlanderDemoLeads = [
  { name: 'Sarah M.', phone: '(214) 555-0142', city: 'Plano', theme: 'repairs', source: 'Google Ads', status: 'New', created: 'Today 9:14 AM' },
  { name: 'James R.', phone: '(972) 555-0188', city: 'Frisco', theme: 'inherited', source: 'Google Ads', status: 'Called', created: 'Today 8:47 AM' },
  { name: 'Linda T.', phone: '(469) 555-0133', city: 'Dallas', theme: 'fast', source: 'Google Ads', status: 'New', created: 'Yesterday 4:20 PM' },
  { name: 'Marcus B.', phone: '(214) 555-0199', city: 'McKinney', theme: 'foreclosure', source: 'Google Ads', status: 'Review', created: 'Yesterday 1:05 PM' },
  { name: 'Ellen K.', phone: '(682) 555-0111', city: 'Fort Worth', theme: 'landlord', source: 'Google Ads', status: 'Qualified', created: 'Monday 11:30 AM' }
];
