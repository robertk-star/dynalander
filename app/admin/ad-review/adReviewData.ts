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

export function reviewHeadline(text: string, index: number, adGroupId: string) {
  if ((text.includes('Today') || text.includes('Fast')) && adGroupId !== 'fast') {
    return { status: 'Change', suggestion: adGroupId === 'repairs' ? 'Get an As-Is Cash Offer' : 'Review Your Selling Options', reason: 'Make this match the seller intent theme more closely.' };
  }
  if (index === 5) return { status: 'Watch', suggestion: 'Test a stronger local trust headline', reason: 'Useful, but generic.' };
  return { status: 'Good', suggestion: text, reason: 'Clear and aligned with this ad group.' };
}

export function reviewDescription(text: string, index: number, adGroupId: string) {
  if (index === 1 && adGroupId === 'repairs') {
    return { status: 'Change', suggestion: 'Sell your house as-is without cleaning, repairs, or showings.', reason: 'More specific to repairs/as-is sellers.' };
  }
  return { status: 'Good', suggestion: text, reason: 'Keep, but test against a more specific seller-intent version.' };
}
