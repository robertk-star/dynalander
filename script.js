const themes = {
  fast: {
    label: 'Fast Sale',
    headline: 'Need to Sell Your House Fast in {city}?',
    subheadline: 'Request a simple cash offer and choose a closing date that works for you.',
    cta: 'Get My Fast Cash Offer',
    formTitle: 'Tell us about the house you need to sell',
    formIntro: 'Share a few details and we will follow up about your selling timeline.',
    problemHeadline: 'A faster way to review your selling options',
    problemCopy: 'If you need to move quickly, you may not want repairs, showings, open houses, or a long listing process.',
    chat: 'Hi, I can help you request a fast cash offer. How soon are you hoping to sell?',
    benefits: ['Choose your closing timeline', 'Skip showings and open houses', 'Avoid repair delays'],
    faqs: [
      ['How fast can I sell?', 'Timing depends on the property and title details, but the goal is to make the process simple and flexible.'],
      ['Do I have to accept the offer?', 'No. You can review the offer and decide if it makes sense.'],
      ['Do I need to clean first?', 'No. You can request an offer before cleaning or removing items.']
    ]
  },
  repairs: {
    label: 'Repairs / As-Is',
    headline: 'Sell Your House As-Is in {city}',
    subheadline: 'No repairs, updates, painting, or cleanup required before requesting an offer.',
    cta: 'Get an As-Is Offer',
    formTitle: 'Tell us about the property condition',
    formIntro: 'You can request an offer even if the house needs major repairs.',
    problemHeadline: 'You do not need to fix the house first',
    problemCopy: 'Many sellers do not want to spend more money fixing a property before they know what it is worth to a buyer.',
    chat: 'Hi, I can help with an as-is offer. What repairs does the property need?',
    benefits: ['No repair budget needed', 'Sell with items left behind', 'Avoid contractor delays'],
    faqs: [
      ['Can I sell with major repairs?', 'Yes. The offer can take the current condition into account.'],
      ['Do you buy houses with roof or foundation issues?', 'This demo is built for buyers who review many property conditions, including major repair situations.'],
      ['Should I get estimates first?', 'You can, but you can also request an offer first and compare your options.']
    ]
  },
  inherited: {
    label: 'Inherited House',
    headline: 'Inherited a House in {city}?',
    subheadline: 'Sell it as-is without cleaning it out, making repairs, or listing it with an agent.',
    cta: 'Get an Inherited Property Offer',
    formTitle: 'Tell us about the inherited property',
    formIntro: 'Share what you know. It is okay if you do not have every detail yet.',
    problemHeadline: 'Inherited properties can feel overwhelming',
    problemCopy: 'A cash offer may help when family members do not want to clean, repair, manage, or list the property.',
    chat: 'Hi, I can help with an inherited property. Is the house occupied or vacant?',
    benefits: ['No cleanup required', 'Helpful for out-of-town heirs', 'Avoid listing delays'],
    faqs: [
      ['Do I need to empty the house first?', 'No. You can request an offer before cleaning out the property.'],
      ['What if multiple heirs are involved?', 'The buyer may need all required decision makers involved before closing.'],
      ['What if probate is still open?', 'You can still start a conversation and review possible next steps.']
    ]
  },
  foreclosure: {
    label: 'Foreclosure Concern',
    headline: 'Need to Sell a House Quickly in {city}?',
    subheadline: 'Request a cash offer and review whether selling may be an option for your timeline.',
    cta: 'Talk Through My Options',
    formTitle: 'Tell us about your selling timeline',
    formIntro: 'Share your timing concern so the buyer can understand how quickly you may need help.',
    problemHeadline: 'When time matters, clarity matters',
    problemCopy: 'This page avoids guarantees. It helps sellers request an offer and review options without pressure.',
    chat: 'Hi, I can help you request an offer and review your timeline. Are you looking to sell quickly?',
    benefits: ['Review options quickly', 'No listing required', 'Flexible closing discussion'],
    faqs: [
      ['Can this stop foreclosure?', 'There are no guarantees. A cash offer may be one option to review depending on your timeline and situation.'],
      ['Should I talk to my lender?', 'Yes. Sellers should understand their lender deadlines and options.'],
      ['Is there any obligation?', 'No. Requesting an offer does not require you to sell.']
    ]
  },
  landlord: {
    label: 'Tired Landlord',
    headline: 'Ready to Sell Your Rental Property in {city}?',
    subheadline: 'Request a cash offer whether the property is vacant, occupied, outdated, or needs repairs.',
    cta: 'Get a Rental Property Offer',
    formTitle: 'Tell us about the rental property',
    formIntro: 'Let us know if the property is occupied, vacant, or needs repairs.',
    problemHeadline: 'Rental properties can become a second job',
    problemCopy: 'Some landlords want to move on from maintenance, vacancies, tenant issues, or expensive updates.',
    chat: 'Hi, I can help with a rental property offer. Is the property currently occupied?',
    benefits: ['Works for vacant or occupied homes', 'Avoid more repairs', 'Move on from landlord stress'],
    faqs: [
      ['Can I sell with tenants in place?', 'Many buyers will review occupied rental properties. Details matter.'],
      ['What if rent is behind?', 'You can share that during the offer request so the buyer understands the situation.'],
      ['Do I need to list it first?', 'No. You can request a direct offer without listing.']
    ]
  }
};

function getParams() {
  const params = new URLSearchParams(window.location.search);
  return {
    theme: params.get('theme') || 'fast',
    city: params.get('city') || 'Local',
    campaign: params.get('utm_campaign') || params.get('campaign') || 'not-set',
    source: params.get('utm_source') || 'direct',
    medium: params.get('utm_medium') || 'none',
    keyword: params.get('keyword') || 'not-set',
    device: params.get('device') || 'not-set'
  };
}

function saveVisit(params) {
  const visits = JSON.parse(localStorage.getItem('demoVisits') || '[]');
  visits.push({ ...params, date: new Date().toISOString() });
  localStorage.setItem('demoVisits', JSON.stringify(visits));
}

function fillTemplate(text, params) {
  return text.replaceAll('{city}', params.city);
}

function renderPage() {
  const params = getParams();
  const theme = themes[params.theme] || themes.fast;
  saveVisit(params);

  document.getElementById('intentPill').textContent = `Seller Intent: ${theme.label}`;
  document.getElementById('heroHeadline').textContent = fillTemplate(theme.headline, params);
  document.getElementById('heroSubheadline').textContent = theme.subheadline;
  document.getElementById('mainCta').textContent = theme.cta;
  document.getElementById('formButton').textContent = theme.cta;
  document.getElementById('formTitle').textContent = theme.formTitle;
  document.getElementById('formIntro').textContent = theme.formIntro;
  document.getElementById('problemHeadline').textContent = theme.problemHeadline;
  document.getElementById('problemCopy').textContent = theme.problemCopy;
  document.getElementById('chatMessage').textContent = theme.chat;
  document.getElementById('serviceArea').textContent = `${params.city} area home buyers`;
  document.getElementById('propertyCityInput').value = params.city === 'Local' ? '' : params.city;
  document.getElementById('reasonSelect').value = params.theme;
  document.getElementById('trackingLine').textContent = `Tracking: theme=${params.theme}, city=${params.city}, campaign=${params.campaign}`;

  const benefitGrid = document.getElementById('benefitGrid');
  benefitGrid.innerHTML = theme.benefits.map(item => `<div class="benefit"><strong>${item}</strong><span>Message matched to this seller intent.</span></div>`).join('');

  const faqList = document.getElementById('faqList');
  faqList.innerHTML = theme.faqs.map(([q, a]) => `<details><summary>${q}</summary><p>${a}</p></details>`).join('');
}

function captureLead(event) {
  event.preventDefault();
  const params = getParams();
  const formData = new FormData(event.target);
  const leads = JSON.parse(localStorage.getItem('demoLeads') || '[]');
  leads.push({
    date: new Date().toISOString(),
    name: formData.get('name') || 'Demo Lead',
    phone: formData.get('phone') || 'Not provided',
    property_city: formData.get('property_city') || params.city,
    reason: formData.get('reason') || params.theme,
    ...params
  });
  localStorage.setItem('demoLeads', JSON.stringify(leads));
  const toast = document.getElementById('toast');
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 3000);
  event.target.reset();
}

document.getElementById('leadForm').addEventListener('submit', captureLead);
document.getElementById('chatClose').addEventListener('click', () => document.getElementById('chatBox').style.display = 'none');
renderPage();
