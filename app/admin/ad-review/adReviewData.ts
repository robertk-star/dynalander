export const adReviewGroups = [
  { id: 'repairs', label: 'As-Is / Repairs' },
  { id: 'fast', label: 'Fast Cash Offer' },
  { id: 'inherited', label: 'Inherited House' },
  { id: 'foreclosure', label: 'Foreclosure Options' }
];

export const baseHeadlines = [
  'Sell Your House As-Is',
  'No Repairs Needed',
  'Get a Cash Offer Today',
  'Sell Fast Locally',
  'No Showings or Open Houses',
  'Local Cash Home Buyer',
  'Close On Your Timeline',
  'We Buy Houses As-Is',
  'Skip Repairs and Cleaning',
  'Request a Simple Offer',
  'Avoid Realtor Fees',
  'Sell Without Listing',
  'Get Help Selling Fast'
];

export const baseDescriptions = [
  'Request a simple cash offer without repairs, showings, or listing with an agent.',
  'We buy houses as-is. Tell us about the property and your timeline.',
  'Share the property condition, location, and timeline to review possible next steps.',
  'No pressure and no obligation. See if a cash offer fits your situation.'
];

export const baseSitelinks = ['Sell As-Is', 'Inherited House', 'How It Works', 'Get Cash Offer'];
export const baseCallouts = ['No Repairs Needed', 'No Realtor Fees', 'Close On Your Timeline', 'Local Cash Buyer'];

const headlineSuggestions: Record<string, string[]> = {
  repairs: ['Get an As-Is Cash Offer', 'Sell Without Repairs', 'Skip Repairs and Showings', 'As-Is Home Buyer Near You'],
  fast: ['Sell On Your Timeline', 'Request a Fast Offer', 'Simple Cash Offer Review', 'Choose Your Closing Date'],
  inherited: ['Inherited Property Offer', 'Sell an Inherited House', 'No Cleanout Needed', 'Review Probate Sale Options'],
  foreclosure: ['Review Your Selling Options', 'Need to Sell Quickly?', 'Talk Through Your Timeline', 'Private Home Sale Review']
};

const descriptionSuggestions: Record<string, string[]> = {
  repairs: ['Sell your house as-is without cleaning, repairs, or showings.', 'Request an as-is offer and review your timeline with no pressure.'],
  fast: ['Request a simple offer and choose a closing date that fits your move.', 'Share the property details and timeline to review next steps.'],
  inherited: ['Request an offer for an inherited property without cleaning it out first.', 'Review options for an inherited house without repairs or listing.'],
  foreclosure: ['Review whether a fast sale may fit your timeline without any promises.', 'Talk through your selling timeline and review possible next steps.']
};

export function getAdReviewSetup(accountName: string, market: string, adGroupId: string) {
  const city = market.includes('North') ? 'Denton' : market.includes('Probate') ? 'Dallas' : 'Plano';
  const isInherited = adGroupId === 'inherited';
  const isForeclosure = adGroupId === 'foreclosure';

  return {
    campaign: isInherited ? 'Inherited House Campaign' : isForeclosure ? 'Foreclosure Options Campaign' : 'Sell As-Is / Repairs Campaign',
    adGroup: adReviewGroups.find((item) => item.id === adGroupId)?.label || 'As-Is / Repairs',
    finalUrl: `/sell?theme=${adGroupId}&city=${city}`,
    headlines: baseHeadlines.map((headline, index) => {
      if (index === 3) return `Sell Fast in ${city}`;
      if (isInherited && index === 0) return 'Inherited a House?';
      if (isForeclosure && index === 2) return 'Need to Sell Quickly?';
      return headline;
    }),
    descriptions: isInherited ? ['Request an offer for an inherited property without cleaning it out first.', ...baseDescriptions.slice(1)] : baseDescriptions,
    sitelinks: isInherited ? ['Inherited House', 'Sell As-Is', 'How It Works', 'Get Cash Offer'] : baseSitelinks,
    callouts: baseCallouts,
    accountName
  };
}

export function getUniqueSuggestion(type: 'headline' | 'description', adGroupId: string, index: number, currentValue: string, used: Set<string>) {
  const pool = type === 'headline' ? headlineSuggestions[adGroupId] || headlineSuggestions.repairs : descriptionSuggestions[adGroupId] || descriptionSuggestions.repairs;
  const fallback = type === 'headline' ? `${currentValue} - Test ${index + 1}` : `${currentValue} Test variation ${index + 1}`;
  const next = pool.find((item) => !used.has(item) && item !== currentValue) || fallback;
  used.add(next);
  return next;
}

export function reviewHeadline(text: string, index: number, adGroupId: string, usedSuggestions: Set<string>) {
  if ((text.includes('Today') || text.includes('Fast')) && adGroupId !== 'fast') {
    return { status: 'Change', suggestion: getUniqueSuggestion('headline', adGroupId, index, text, usedSuggestions), reason: 'Make this unique and better matched to the seller intent theme.' };
  }
  if (index === 5) return { status: 'Watch', suggestion: getUniqueSuggestion('headline', adGroupId, index, text, usedSuggestions), reason: 'Useful, but generic. Test a unique local trust angle.' };
  usedSuggestions.add(text);
  return { status: 'Good', suggestion: text, reason: 'Clear and aligned with this ad group.' };
}

export function reviewDescription(text: string, index: number, adGroupId: string, usedSuggestions: Set<string>) {
  if (index === 1 && adGroupId === 'repairs') {
    return { status: 'Change', suggestion: getUniqueSuggestion('description', adGroupId, index, text, usedSuggestions), reason: 'Use a unique version that is more specific to repairs/as-is sellers.' };
  }
  usedSuggestions.add(text);
  return { status: 'Good', suggestion: text, reason: 'Keep, but test against a more specific seller-intent version later.' };
}

export const mockChangeHistory = [
  { date: '2026-06-01', item: 'Headline 3', before: 'Get a Cash Offer Today', after: 'Get an As-Is Cash Offer', status: 'Accepted', result: 'CPL improved from $95 to $82 after 14 days.' },
  { date: '2026-06-05', item: 'Description 2', before: 'We buy houses as-is.', after: 'Sell your house as-is without cleaning, repairs, or showings.', status: 'Testing', result: 'Still collecting data.' },
  { date: '2026-06-09', item: 'Sitelink', before: 'Get Cash Offer', after: 'Get As-Is Offer', status: 'Recommended', result: 'Waiting for human approval.' }
];
