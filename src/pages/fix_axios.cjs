const fs = require('fs');
const path = require('path');

const pagesDir = 'e:/ROLES AND PERMISSIONS/frontend-react/src/pages';
const files = ['Dashboard.jsx', 'Contracts.jsx', 'Invoices.jsx', 'Performance.jsx', 'Procurement.jsx', 'RiskCompliance.jsx', 'VendorPortal.jsx'];

files.forEach(file => {
  const filePath = path.join(pagesDir, file);
  if (!fs.existsSync(filePath)) return;

  let content = fs.readFileSync(filePath, 'utf8');

  // Remove import axios
  content = content.replace(/import axios from 'axios';\n?/g, '');

  // Remove api instance creations
  content = content.replace(/const api = axios\.create\(\{[\s\S]*?\}\);\n?/g, '');
  content = content.replace(/const API_BASE_URL = ['"`]http:\/\/localhost:8080\/api.*?['"`];\n?/g, '');

  // Add import api from '../services/api' at the top if not present
  if (!content.includes("import api from '../services/api';")) {
    content = content.replace(/(import[^;]+;\n)/, match => match + "import api from '../services/api';\n");
  }

  // Replace endpoints
  content = content.replace(/api\.(get|post|put|delete|patch)\(['"`]\//g, "api.$1('/api/");
  content = content.replace(/api\.(get|post|put|delete|patch)\(`\//g, "api.$1(`/api/");
  
  // Clean up double /api/api
  content = content.replace(/\/api\/api\//g, '/api/');

  fs.writeFileSync(filePath, content);
});

console.log('Done');
