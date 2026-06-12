export const metaSummary = {
  spend: '$2,740',
  reach: '41,220',
  impressions: '68,940',
  frequency: '1.67',
  clicks: '1,184',
  leads: '73',
  costPerLead: '$37.53',
  ctr: '1.72%',
  cpc: '$2.31',
  cpm: '$39.74'
};

export const metaCampaigns = [
  {
    campaign: 'DFW Seller Leads - Meta',
    objective: 'Leads',
    status: 'Mock active',
    spend: '$1,240',
    reach: '18,420',
    impressions: '30,880',
    frequency: '1.68',
    leads: 38,
    cpl: '$32.63',
    aiNote: 'Best lead volume. Watch frequency before scaling.'
  },
  {
    campaign: 'As-Is Home Sellers',
    objective: 'Leads',
    status: 'Mock active',
    spend: '$860',
    reach: '13,300',
    impressions: '22,150',
    frequency: '1.67',
    leads: 21,
    cpl: '$40.95',
    aiNote: 'Good intent match. Creative fatigue should be watched.'
  },
  {
    campaign: 'Inherited Property Leads',
    objective: 'Leads',
    status: 'Mock active',
    spend: '$640',
    reach: '9,500',
    impressions: '15,910',
    frequency: '1.67',
    leads: 14,
    cpl: '$45.71',
    aiNote: 'Needs softer copy and clearer next-step language.'
  }
];

export const metaAdSets = [
  {
    adSet: 'Homeowners 35+ DFW',
    campaign: 'DFW Seller Leads - Meta',
    audience: 'Homeowners, age 35+, DFW area',
    placements: 'Facebook Feed, Marketplace, Instagram Feed',
    budget: '$40/day',
    spend: '$790',
    leads: 25,
    cpl: '$31.60',
    aiNote: 'Strongest ad set. Keep watching lead quality.'
  },
  {
    adSet: 'As-Is Condition Interest Stack',
    campaign: 'As-Is Home Sellers',
    audience: 'Home improvement, repairs, real estate interests',
    placements: 'Advantage+ placements',
    budget: '$25/day',
    spend: '$520',
    leads: 13,
    cpl: '$40.00',
    aiNote: 'Test clearer as-is benefit and reduce generic repair wording.'
  },
  {
    adSet: 'Inherited Property Broad',
    campaign: 'Inherited Property Leads',
    audience: 'Broad adults 45+ in North Texas',
    placements: 'Facebook Feed, Instagram Stories',
    budget: '$20/day',
    spend: '$410',
    leads: 8,
    cpl: '$51.25',
    aiNote: 'Higher CPL. Needs creative refresh and softer CTA.'
  }
];

export const metaCreatives = [
  {
    ad: 'As-Is Seller Image Ad',
    campaign: 'As-Is Home Sellers',
    adSet: 'As-Is Condition Interest Stack',
    creativeType: 'Image',
    primaryText: 'Sell your house as-is without repairs or showings.',
    headline: 'Get an As-Is Offer',
    description: 'Tell us about the property and your timeline.',
    cta: 'Learn More',
    destinationUrl: '/sell?theme=repairs&city=Frisco',
    frequency: '1.91',
    ctr: '1.58%',
    cpl: '$40.00',
    fatigue: 'Watch',
    recommendation: 'Refresh the image or test a softer proof-based primary text.'
  },
  {
    ad: 'Inherited House Lead Ad',
    campaign: 'Inherited Property Leads',
    adSet: 'Inherited Property Broad',
    creativeType: 'Lead form',
    primaryText: 'Have an inherited property and need options?',
    headline: 'Inherited Property Help',
    description: 'Review your options before making repairs or cleaning out the house.',
    cta: 'Get Quote',
    destinationUrl: 'Instant form',
    frequency: '2.14',
    ctr: '1.21%',
    cpl: '$51.25',
    fatigue: 'Needs refresh',
    recommendation: 'Use less sales language and add a clearer privacy/no-pressure note.'
  },
  {
    ad: 'Fast Sale Video Ad',
    campaign: 'DFW Seller Leads - Meta',
    adSet: 'Homeowners 35+ DFW',
    creativeType: 'Video',
    primaryText: 'Need to sell quickly? Review your options.',
    headline: 'Sell On Your Timeline',
    description: 'Request a simple review of your property details.',
    cta: 'Contact Us',
    destinationUrl: '/sell?theme=fast&city=Plano',
    frequency: '1.43',
    ctr: '2.04%',
    cpl: '$32.63',
    fatigue: 'Good',
    recommendation: 'Keep running. Test a second hook before frequency increases.'
  }
];

export const metaRecommendations = [
  {
    priority: 'High',
    area: 'Creative fatigue',
    recommendation: 'Refresh the inherited property creative before increasing budget.',
    reason: 'Frequency is above 2.0 and CPL is the highest in the mock set.'
  },
  {
    priority: 'Medium',
    area: 'Lead quality',
    recommendation: 'Add one qualifying question to the lead form.',
    reason: 'Higher volume campaigns may need better property condition and timeline signals.'
  },
  {
    priority: 'Medium',
    area: 'Copy test',
    recommendation: 'Test primary text that says no repairs or cleanout required.',
    reason: 'This aligns better with as-is and inherited seller intent.'
  }
];
