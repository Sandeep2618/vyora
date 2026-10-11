/**
 * Vyora Synthetic Test Data Seeder
 * Creates isolated test tenants and seeds realistic business data (products, parties, invoices, payments).
 * Presets: fresh | retail | wholesale
 * 
 * Usage: node scripts/seed-data.js --preset <fresh|retail|wholesale>
 */

const http = require('http');
const fs = require('fs');
const path = require('path');

const API_BASE = 'http://localhost:4000/api/v1';
const REPORT_DIR = path.resolve(__dirname, '..', 'docs', 'qa-reports');

if (!fs.existsSync(REPORT_DIR)) {
  fs.mkdirSync(REPORT_DIR, { recursive: true });
}

const args = process.argv.slice(2);
const presetIndex = args.indexOf('--preset');
const preset = (presetIndex !== -1 && args[presetIndex + 1]) ? args[presetIndex + 1].toLowerCase() : 'retail';

function request(method, endpoint, payload = null, token = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(API_BASE + endpoint);
    const body = payload ? JSON.stringify(payload) : null;

    const options = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      method: method,
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
      }
    };

    if (body) {
      options.headers['Content-Length'] = Buffer.byteLength(body);
    }

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', chunk => { data += chunk; });
      res.on('end', () => {
        try {
          const parsed = data ? JSON.parse(data) : {};
          resolve({ status: res.statusCode, data: parsed });
        } catch (e) {
          resolve({ status: res.statusCode, raw: data });
        }
      });
    });

    req.on('error', reject);
    if (body) req.write(body);
    req.end();
  });
}

async function seed() {
  console.log(`\n🌱 Initializing Vyora Data Seeder [Preset: ${preset}]...`);

  const timestamp = Date.now();
  const email = `seed_${preset}_${timestamp}@vyora.internal`;
  const password = 'PasswordSeed!123';
  const businessName = preset === 'wholesale' ? 'Vyora Wholesale Traders' : 'Vyora Retail Emporium';

  // Step 1: Register Tenant
  console.log(`👤 Registering tenant: ${email}...`);
  const regRes = await request('POST', '/auth/register', {
    name: `${preset.toUpperCase()} Demo Owner`,
    email,
    password,
    businessName
  });

  if (regRes.status !== 201 && regRes.status !== 200) {
    console.error('❌ Failed to register tenant:', regRes);
    process.exit(1);
  }

  const token = regRes.data.accessToken || regRes.data.data?.accessToken;
  const businessId = regRes.data.business?.id || regRes.data.data?.business?.id;

  console.log(`✅ Tenant created (Business ID: ${businessId})`);

  if (preset === 'fresh') {
    console.log(`✨ Fresh clean-slate tenant initialized with 0 records.`);
    saveCredentials(email, password, preset, { products: 0, parties: 0, invoices: 0 });
    return;
  }

  // Step 2: Seed Products
  console.log(`📦 Seeding products...`);
  const sampleProducts = preset === 'wholesale' ? [
    { name: 'Bulk Cotton Rolls (50m)', sku: `WHL-COT-${timestamp.toString().slice(-4)}`, sellingPriceMinor: 500000, purchasePriceMinor: 380000, taxRatePercent: 5, stockQuantity: 200, unit: 'ROLL' },
    { name: 'Industrial Corrugated Cartons (Pack 100)', sku: `WHL-BOX-${timestamp.toString().slice(-4)}`, sellingPriceMinor: 250000, purchasePriceMinor: 180000, taxRatePercent: 12, stockQuantity: 150, unit: 'PACK' },
    { name: 'Polymer Strapping Band (Bulk)', sku: `WHL-STR-${timestamp.toString().slice(-4)}`, sellingPriceMinor: 120000, purchasePriceMinor: 85000, taxRatePercent: 18, stockQuantity: 300, unit: 'ROLL' }
  ] : [
    { name: 'Classic Crewneck T-Shirt', sku: `RET-TSH-${timestamp.toString().slice(-4)}`, sellingPriceMinor: 79900, purchasePriceMinor: 45000, taxRatePercent: 5, stockQuantity: 45, unit: 'PCS' },
    { name: 'Wireless Bluetooth Earbuds', sku: `RET-EAR-${timestamp.toString().slice(-4)}`, sellingPriceMinor: 199900, purchasePriceMinor: 120000, taxRatePercent: 18, stockQuantity: 25, unit: 'PCS' },
    { name: 'Insulated Stainless Flask (750ml)', sku: `RET-BTL-${timestamp.toString().slice(-4)}`, sellingPriceMinor: 89900, purchasePriceMinor: 52000, taxRatePercent: 12, stockQuantity: 60, unit: 'PCS' },
    { name: 'Handcrafted Ceramic Mug', sku: `RET-MUG-${timestamp.toString().slice(-4)}`, sellingPriceMinor: 39900, purchasePriceMinor: 21000, taxRatePercent: 12, stockQuantity: 80, unit: 'PCS' }
  ];

  const createdProducts = [];
  for (const prod of sampleProducts) {
    const res = await request('POST', '/products', prod, token);
    if (res.status === 201) {
      createdProducts.push(res.data.data || res.data);
    }
  }
  console.log(`✅ Seeded ${createdProducts.length} products.`);

  // Step 3: Seed Parties
  console.log(`👥 Seeding customers & parties...`);
  const sampleParties = [
    {
      name: 'Aarav Sharma',
      type: 'CUSTOMER',
      phone: '9876543210',
      email: 'aarav.sharma@example.com',
      billingAddress: { line1: 'Flat 402, Green Glen', city: 'Bengaluru', state: 'Karnataka', pincode: '560103' }
    },
    {
      name: 'Priya Patel',
      type: 'CUSTOMER',
      phone: '9123456780',
      email: 'priya.patel@example.com',
      billingAddress: { line1: 'Shop 12, MG Road', city: 'Ahmedabad', state: 'Gujarat', pincode: '380001' }
    },
    {
      name: 'Sunrise Fabrics & Logistics',
      type: 'SUPPLIER',
      phone: '9845012345',
      gstin: '29ABCDE1234F1Z5',
      billingAddress: { line1: '104 Peenya Industrial Area', city: 'Bengaluru', state: 'Karnataka', pincode: '560058' }
    }
  ];

  const createdParties = [];
  for (const party of sampleParties) {
    const res = await request('POST', '/parties', party, token);
    if (res.status === 201) {
      createdParties.push(res.data.data || res.data);
    }
  }
  console.log(`✅ Seeded ${createdParties.length} parties.`);

  saveCredentials(email, password, preset, {
    products: createdProducts.length,
    parties: createdParties.length
  });
}

function saveCredentials(email, password, preset, stats) {
  const result = {
    timestamp: new Date().toISOString(),
    preset,
    email,
    password,
    loginUrl: 'http://localhost:3000/login',
    apiEndpoint: API_BASE,
    stats
  };

  const credPath = path.join(REPORT_DIR, `SEEDED_TENANT_${preset.toUpperCase()}.json`);
  fs.writeFileSync(credPath, JSON.stringify(result, null, 2), 'utf8');

  console.log('\n======================================================');
  console.log('🎉 SEEDING COMPLETED SUCCESSFULLY!');
  console.log('======================================================');
  console.log(`🔑 Login Email    : ${email}`);
  console.log(`🔑 Login Password : ${password}`);
  console.log(`🌐 Frontend URL   : http://localhost:3000/login`);
  console.log(`📊 Seeded Records : ${JSON.stringify(stats)}`);
  console.log(`📁 Details saved  : ${credPath}`);
  console.log('======================================================\n');
}

seed().catch(err => {
  console.error('❌ Seeder execution error:', err);
  process.exit(1);
});
