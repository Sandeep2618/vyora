import { Injectable, OnApplicationBootstrap, Logger } from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection } from 'mongoose';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class DatabaseSeederService implements OnApplicationBootstrap {
  private readonly logger = new Logger('DatabaseSeederService');

  constructor(@InjectConnection() private readonly connection: Connection) {}

  async onApplicationBootstrap() {
    try {
      await this.seedInitialData();
    } catch (err: any) {
      this.logger.warn(`Database seeding skipped or failed: ${err.message}`);
    }
  }

  private async seedInitialData() {
    const userModel = this.connection.model('User');
    const existingUsers = await userModel.countDocuments();
    if (existingUsers > 0) {
      this.logger.log('Database already initialized with existing users.');
      return;
    }

    this.logger.log('Empty database detected. Seeding demo business, products, customers, and invoice...');

    const businessModel = this.connection.model('Business');
    const membershipModel = this.connection.model('Membership');
    const productModel = this.connection.model('Product');
    const partyModel = this.connection.model('Party');
    const invoiceModel = this.connection.model('Invoice');
    const stockModel = this.connection.model('StockMovement');

    // 1. Create Demo User (Owner: Rahul Sharma)
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash('password123', salt);

    const demoUser = await userModel.create({
      name: 'Rahul Sharma',
      email: 'demo@vyora.com',
      passwordHash,
      role: 'OWNER',
    });

    // 2. Create Demo Business Profile (Theme B: Sharma Retail & Supplies)
    const demoBusiness = await businessModel.create({
      name: 'Sharma Retail & Supplies',
      legalName: 'Sharma Retail & Supplies Pvt. Ltd.',
      phone: '9876543210',
      email: 'demo@vyora.com',
      gstin: '27AABCU9603R1ZM',
      pan: 'AABCU9603R',
      addressLine1: 'Shop 14, Commercial Plaza, Andheri East',
      city: 'Mumbai',
      state: 'Maharashtra',
      stateCode: '27',
      pincode: '400069',
      currency: 'INR',
      invoicePrefix: 'INV-',
      invoiceNumberPadding: 4,
      nextInvoiceNumber: 2,
      purchasePrefix: 'BILL-',
      nextPurchaseNumber: 1,
      ownerUserId: demoUser._id.toString(),
      termsAndConditions: '1. Goods once sold will not be taken back.\n2. Payment due within 15 days.',
    });

    const businessIdStr = demoBusiness._id.toString();
    const userIdStr = demoUser._id.toString();

    // 3. Link Membership & Default Business
    await membershipModel.create({
      userId: userIdStr,
      businessId: businessIdStr,
      role: 'OWNER',
    });

    demoUser.defaultBusinessId = businessIdStr;
    await demoUser.save();

    // 4. Create Sample Parties (1 Customer, 1 Supplier)
    const customer = await partyModel.create({
      businessId: businessIdStr,
      type: 'CUSTOMER',
      name: 'Apex Tech Solutions Pvt Ltd',
      contactPerson: 'Aditya Roy',
      phone: '9820012345',
      email: 'accounts@apextech.in',
      gstin: '27AAACA1234A1Z5',
      pan: 'AAACA1234A',
      billingAddress: {
        line1: 'B-402, Lotus IT Park, Powai',
        city: 'Mumbai',
        state: 'Maharashtra',
        stateCode: '27',
        pincode: '400076',
      },
      openingBalanceMinor: 0,
      currentBalanceMinor: 0,
      isArchived: false,
    });

    await partyModel.create({
      businessId: businessIdStr,
      type: 'SUPPLIER',
      name: 'National Electronics Distributors',
      contactPerson: 'Karan Mehra',
      phone: '9819987654',
      email: 'sales@nationalelec.com',
      gstin: '27AABCN5678B1Z2',
      pan: 'AABCN5678B',
      billingAddress: {
        line1: 'G-12, Lamington Road',
        city: 'Mumbai',
        state: 'Maharashtra',
        stateCode: '27',
        pincode: '400007',
      },
      openingBalanceMinor: 0,
      currentBalanceMinor: 0,
      isArchived: false,
    });

    // 5. Create Sample Products
    const p1 = await productModel.create({
      businessId: businessIdStr,
      name: 'Logitech MX Master 3S Wireless Mouse',
      sku: 'MOU-LOG-01',
      hsnCode: '8471',
      description: 'Performance wireless ergonomic mouse with 8K DPI',
      unit: 'PCS',
      sellingPriceMinor: 899500, // ₹8,995.00
      purchasePriceMinor: 650000,
      taxRatePercent: 18,
      openingStock: 50,
      currentStock: 48, // 2 sold in demo invoice
      reorderLevel: 10,
      isArchived: false,
    });

    const p2 = await productModel.create({
      businessId: businessIdStr,
      name: 'Dell UltraSharp 27" 4K Monitor',
      sku: 'MON-DEL-27',
      hsnCode: '8528',
      description: 'Color-accurate IPS display with USB-C Hub',
      unit: 'PCS',
      sellingPriceMinor: 4250000, // ₹42,500.00
      purchasePriceMinor: 3400000,
      taxRatePercent: 18,
      openingStock: 20,
      currentStock: 19, // 1 sold in demo invoice
      reorderLevel: 5,
      isArchived: false,
    });

    const p3 = await productModel.create({
      businessId: businessIdStr,
      name: 'Keychron K2 RGB Mechanical Keyboard',
      sku: 'KEY-K2-RGB',
      hsnCode: '8471',
      description: 'Wireless Bluetooth 75% Layout Gateron Brown Switches',
      unit: 'PCS',
      sellingPriceMinor: 749900, // ₹7,499.00
      purchasePriceMinor: 550000,
      taxRatePercent: 18,
      openingStock: 35,
      currentStock: 35,
      reorderLevel: 8,
      isArchived: false,
    });

    const p4 = await productModel.create({
      businessId: businessIdStr,
      name: 'Belkin 100W USB-C Braided Cable',
      sku: 'CAB-BLK-100',
      hsnCode: '8544',
      description: 'Durable nylon 2-meter fast charging cable',
      unit: 'PCS',
      sellingPriceMinor: 129900, // ₹1,299.00
      purchasePriceMinor: 75000,
      taxRatePercent: 18,
      openingStock: 120,
      currentStock: 120,
      reorderLevel: 25,
      isArchived: false,
    });

    // 6. Record Opening Stock Ledger Movements
    for (const prod of [p1, p2, p3, p4]) {
      await stockModel.create({
        businessId: businessIdStr,
        productId: prod._id.toString(),
        movementType: 'OPENING',
        quantityDelta: prod.openingStock,
        resultingStock: prod.openingStock,
        reason: 'Initial opening stock ledger entry',
        referenceType: 'INITIAL_SETUP',
        performedByUserId: userIdStr,
      });
    }

    // 7. Create Demo Paid Invoice (INV-0001)
    // 2 x p1 (₹17,990) + 1 x p2 (₹42,500) = Subtotal ₹60,490.00
    // Taxable: ₹60,490.00, 18% GST (Intra-state Maharashtra: 9% CGST ₹5,444.10, 9% SGST ₹5,444.10)
    // Grand Total: ₹71,378.20 -> Round off: -₹0.20 -> ₹71,378.00
    const today = new Date().toISOString().split('T')[0];
    const dueDate = new Date(Date.now() + 15 * 86400000).toISOString().split('T')[0];

    const demoInvoice = await invoiceModel.create({
      businessId: businessIdStr,
      invoiceNumber: 'INV-0001',
      customerId: customer._id.toString(),
      customerSnapshot: {
        name: customer.name,
        phone: customer.phone,
        email: customer.email,
        gstin: customer.gstin,
        address: customer.billingAddress.line1,
        state: customer.billingAddress.state,
        stateCode: customer.billingAddress.stateCode,
      },
      businessSnapshot: {
        name: demoBusiness.name,
        legalName: demoBusiness.legalName,
        phone: demoBusiness.phone,
        email: demoBusiness.email,
        gstin: demoBusiness.gstin,
        address: demoBusiness.addressLine1,
        city: demoBusiness.city,
        state: demoBusiness.state,
        pincode: demoBusiness.pincode,
      },
      status: 'PAID',
      issueDate: today,
      dueDate,
      isInterState: false,
      items: [
        {
          productId: p1._id.toString(),
          productName: p1.name,
          sku: p1.sku,
          hsnCode: p1.hsnCode,
          unit: 'PCS',
          quantity: 2,
          unitPriceMinor: 899500,
          discountPercent: 0,
          discountAmountMinor: 0,
          taxableAmountMinor: 1799000,
          taxRatePercent: 18,
          cgstMinor: 161910,
          sgstMinor: 161910,
          igstMinor: 0,
          totalTaxMinor: 323820,
          lineTotalMinor: 2122820,
        },
        {
          productId: p2._id.toString(),
          productName: p2.name,
          sku: p2.sku,
          hsnCode: p2.hsnCode,
          unit: 'PCS',
          quantity: 1,
          unitPriceMinor: 4250000,
          discountPercent: 0,
          discountAmountMinor: 0,
          taxableAmountMinor: 4250000,
          taxRatePercent: 18,
          cgstMinor: 382500,
          sgstMinor: 382500,
          igstMinor: 0,
          totalTaxMinor: 765000,
          lineTotalMinor: 5015000,
        },
      ],
      subtotalMinor: 6049000,
      totalDiscountMinor: 0,
      totalTaxableAmountMinor: 6049000,
      cgstMinor: 544410,
      sgstMinor: 544410,
      igstMinor: 0,
      totalTaxMinor: 1088820,
      roundOffMinor: -20,
      grandTotalMinor: 7137800, // ₹71,378.00
      paidAmountMinor: 7137800,
      dueAmountMinor: 0,
      notes: 'Thank you for your business!',
      terms: demoBusiness.termsAndConditions,
    });

    // Record Stock Outward Movements for the demo invoice
    await stockModel.create({
      businessId: businessIdStr,
      productId: p1._id.toString(),
      movementType: 'SALE',
      quantityDelta: -2,
      resultingStock: 48,
      reason: `Invoice INV-0001 Finalization`,
      referenceType: 'INVOICE',
      referenceId: demoInvoice._id.toString(),
      performedByUserId: userIdStr,
    });

    await stockModel.create({
      businessId: businessIdStr,
      productId: p2._id.toString(),
      movementType: 'SALE',
      quantityDelta: -1,
      resultingStock: 19,
      reason: `Invoice INV-0001 Finalization`,
      referenceType: 'INVOICE',
      referenceId: demoInvoice._id.toString(),
      performedByUserId: userIdStr,
    });

    this.logger.log('Demo seed completed successfully! Login with: demo@vyora.com / password123');
  }
}
