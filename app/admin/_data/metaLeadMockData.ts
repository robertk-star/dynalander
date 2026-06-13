export const metaLeadRows = [
  {
    name: 'Meta Seller 1',
    phone: '(555) 440-1200',
    city: 'Plano',
    campaign: 'DFW Seller Leads - Meta',
    adSet: 'Homeowners 35+ DFW',
    ad: 'Fast Sale Video Ad',
    source: 'Meta Lead Form',
    status: 'New',
    quality: 'High',
    created: 'Today'
  },
  {
    name: 'Meta Seller 2',
    phone: '(555) 440-2341',
    city: 'Frisco',
    campaign: 'As-Is Home Sellers',
    adSet: 'As-Is Condition Interest Stack',
    ad: 'As-Is Seller Image Ad',
    source: 'Meta Click to Landing Page',
    status: 'Contacted',
    quality: 'Medium',
    created: 'Today'
  },
  {
    name: 'Meta Seller 3',
    phone: '(555) 440-9912',
    city: 'Dallas',
    campaign: 'Inherited Property Leads',
    adSet: 'Inherited Property Broad',
    ad: 'Inherited House Lead Ad',
    source: 'Meta Lead Form',
    status: 'Review',
    quality: 'Medium',
    created: 'Yesterday'
  },
  {
    name: 'Meta Seller 4',
    phone: '(555) 440-8821',
    city: 'McKinney',
    campaign: 'DFW Seller Leads - Meta',
    adSet: 'Homeowners 35+ DFW',
    ad: 'Fast Sale Video Ad',
    source: 'Meta Messenger',
    status: 'New',
    quality: 'High',
    created: 'Yesterday'
  },
  {
    name: 'Meta Seller 5',
    phone: '(555) 440-6755',
    city: 'Denton',
    campaign: 'As-Is Home Sellers',
    adSet: 'As-Is Condition Interest Stack',
    ad: 'As-Is Seller Image Ad',
    source: 'Meta Lead Form',
    status: 'Needs follow-up',
    quality: 'Low',
    created: '2 days ago'
  }
];

export function getMetaLeadSummary() {
  const total = metaLeadRows.length;
  const highQuality = metaLeadRows.filter((row) => row.quality === 'High').length;
  const leadForms = metaLeadRows.filter((row) => row.source === 'Meta Lead Form').length;
  const newRows = metaLeadRows.filter((row) => row.status === 'New').length;

  return { total, highQuality, leadForms, newRows };
}
