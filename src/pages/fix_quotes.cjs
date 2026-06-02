const fs = require('fs');
const path = require('path');

const pagesDir = 'e:/ROLES AND PERMISSIONS/frontend-react/src/pages';
const files = ['Dashboard.jsx', 'Contracts.jsx', 'Invoices.jsx', 'Performance.jsx', 'Procurement.jsx', 'RiskCompliance.jsx', 'VendorPortal.jsx'];

files.forEach(file => {
  const filePath = path.join(pagesDir, file);
  if (!fs.existsSync(filePath)) return;

  let content = fs.readFileSync(filePath, 'utf8');

  // Fix the backtick issue
  // The string looks like api.get('/api/vendor-dashboard?filter=${encodeURIComponent(spendFilter)}`)
  // It should be api.get(`/api/vendor-dashboard?filter=${encodeURIComponent(spendFilter)}`)
  content = content.replace(/api\.(get|post|put|delete|patch)\('\/api\/([^`]+)`\)/g, "api.$1(`/api/$2`)");
  
  // What about if it ended with }`) ? The regex above catches it.
  
  fs.writeFileSync(filePath, content);
});

console.log('Fixed quotes');
