export const googleRecommendationResults = [
  {
    recommendation: 'Move budget toward Sell As-Is / Repairs',
    platform: 'Google Ads',
    linkedChange: 'Budget shift test from broad cash offer traffic',
    status: 'Watching',
    before: 'CPL $85, qualified CPL $145',
    after: 'Collecting 14-day result window',
    nextAction: 'Wait for more lead quality data before keeping or rolling back.'
  },
  {
    recommendation: 'Add negative keywords for buyer-intent searches',
    platform: 'Google Ads',
    linkedChange: 'Negative keyword batch added',
    status: 'Keep',
    before: '$274 wasted spend in mock search terms',
    after: 'Wrong-intent terms reduced in mock review',
    nextAction: 'Keep negatives and review search terms weekly.'
  },
  {
    recommendation: 'Review Foreclosure Options page tone',
    platform: 'Google Ads',
    linkedChange: 'CTA wording test',
    status: 'Open',
    before: 'High CTR, weak lead conversion',
    after: 'No test accepted yet',
    nextAction: 'Accept a softer CTA test before judging performance.'
  }
];

export const metaRecommendationResults = [
  {
    recommendation: 'Refresh inherited property creative',
    platform: 'Facebook / Meta Ads',
    linkedChange: 'Primary text and CTA refresh',
    status: 'Watching',
    before: 'Frequency 2.14, CPL $51.25',
    after: 'Collecting mock creative result window',
    nextAction: 'Watch frequency and lead quality before refreshing again.'
  },
  {
    recommendation: 'Add one qualifying question to lead form',
    platform: 'Facebook / Meta Ads',
    linkedChange: 'Lead form quality question',
    status: 'Open',
    before: 'Volume good, quality mixed',
    after: 'No form change accepted yet',
    nextAction: 'Review with client before adding friction.'
  },
  {
    recommendation: 'Test no repairs or cleanout required copy',
    platform: 'Facebook / Meta Ads',
    linkedChange: 'Primary text copy test',
    status: 'Refresh',
    before: 'As-is ad showing Watch fatigue',
    after: 'Mock review says creative needs a softer proof hook',
    nextAction: 'Refresh creative and compare against the old copy.'
  }
];

export const resultStages = ['Open', 'Accepted', 'Watching', 'Keep', 'Rollback / Refresh', 'Closed'];
