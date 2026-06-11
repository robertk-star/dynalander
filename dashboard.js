const themeNames = {
  fast: 'Fast Sale',
  repairs: 'Repairs / As-Is',
  inherited: 'Inherited House',
  foreclosure: 'Foreclosure Concern',
  landlord: 'Tired Landlord'
};

const angles = {
  fast: 'Speed and flexible closing',
  repairs: 'No repairs or cleanup',
  inherited: 'Inherited property help',
  foreclosure: 'Timeline and options',
  landlord: 'Rental property exit'
};

function readData() {
  return {
    visits: JSON.parse(localStorage.getItem('demoVisits') || '[]'),
    leads: JSON.parse(localStorage.getItem('demoLeads') || '[]')
  };
}

function countBy(items, key) {
  return items.reduce((acc, item) => {
    const value = item[key] || 'not-set';
    acc[value] = (acc[value] || 0) + 1;
    return acc;
  }, {});
}

function topValue(counts) {
  const entries = Object.entries(counts).sort((a, b) => b[1] - a[1]);
  return entries.length ? entries[0][0] : '—';
}

function render() {
  const { visits, leads } = readData();
  document.getElementById('visitsCount').textContent = visits.length;
  document.getElementById('leadsCount').textContent = leads.length;
  const themeCounts = countBy(visits, 'theme');
  const cityCounts = countBy(visits, 'city');
  const topTheme = topValue(themeCounts);
  document.getElementById('topTheme').textContent = themeNames[topTheme] || topTheme;
  document.getElementById('topCity').textContent = topValue(cityCounts);

  const themeTable = document.getElementById('themeTable');
  themeTable.innerHTML = Object.keys(themeNames).map(theme => {
    const visitsForTheme = visits.filter(v => v.theme === theme).length;
    const leadsForTheme = leads.filter(l => l.theme === theme || l.reason === theme).length;
    return `<tr><td>${themeNames[theme]}</td><td>${visitsForTheme}</td><td>${leadsForTheme}</td><td>${angles[theme]}</td></tr>`;
  }).join('');

  const leadTable = document.getElementById('leadTable');
  if (!leads.length) {
    leadTable.innerHTML = '<tr><td colspan="6">No demo leads yet. Submit the landing page form to populate this table.</td></tr>';
  } else {
    leadTable.innerHTML = leads.slice().reverse().map(lead => `<tr><td>${new Date(lead.date).toLocaleString()}</td><td>${lead.name}</td><td>${lead.phone}</td><td>${themeNames[lead.theme] || lead.theme}</td><td>${lead.property_city || lead.city}</td><td>${lead.campaign}</td></tr>`).join('');
  }

  const recommendations = document.getElementById('recommendations');
  const leadThemeCounts = countBy(leads, 'theme');
  const bestLeadTheme = topValue(leadThemeCounts);
  recommendations.innerHTML = `
    <div><strong>1. Match ad themes to landing page copy.</strong><span>Each URL changes the headline, CTA, FAQ, and chat opening message.</span></div>
    <div><strong>2. Watch high-click, low-lead themes.</strong><span>If a theme gets traffic but no leads, test a softer CTA or shorter form.</span></div>
    <div><strong>3. Current top lead theme:</strong><span>${themeNames[bestLeadTheme] || bestLeadTheme}</span></div>
  `;
}

render();
