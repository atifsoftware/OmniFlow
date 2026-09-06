import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting OmniFlow ERP MySQL Database Seeding...');

  // 1. Seed Super Admin
  const hashedPassword = await bcrypt.hash('Admin@123456', 10);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@omniflow.io' },
    update: {},
    create: {
      email: 'admin@omniflow.io',
      name: 'OmniFlow Super Admin',
      password: hashedPassword,
      role: 'SUPER_ADMIN',
      phone: '+8801700000000',
    },
  });
  console.log('✅ Admin user created: admin@omniflow.io (Password: Admin@123456)');

  // 2. Seed Default Central Warehouse
  const warehouse = await prisma.warehouse.upsert({
    where: { code: 'WH-MAIN' },
    update: {},
    create: {
      name: 'Central Distribution Warehouse',
      code: 'WH-MAIN',
      location: 'Dhaka Logistics Hub, Bangladesh',
      isDefault: true,
    },
  });
  console.log('✅ Central Warehouse seeded:', warehouse.name);

  // 3. Seed Categories
  const electronics = await prisma.category.upsert({
    where: { slug: 'electronics' },
    update: {},
    create: {
      name: 'Electronics & Gadgets',
      slug: 'electronics',
      description: 'Smartphones, Laptops, Accessories',
    },
  });

  const fashion = await prisma.category.upsert({
    where: { slug: 'fashion' },
    update: {},
    create: {
      name: 'Fashion & Apparel',
      slug: 'fashion',
      description: 'Clothing, Shoes, Accessories',
    },
  });
  console.log('✅ Categories seeded: Electronics, Fashion');

  // 4. Seed Products & Inventory
  const product1 = await prisma.product.upsert({
    where: { sku: 'PROD-MACBOOK-M3' },
    update: {},
    create: {
      name: 'Apple MacBook Pro M3 (16GB/512GB)',
      slug: 'apple-macbook-pro-m3',
      sku: 'PROD-MACBOOK-M3',
      barcode: '190199123456',
      price: 1899.99,
      costPrice: 1550.00,
      categoryId: electronics.id,
      isFeatured: true,
    },
  });

  const product2 = await prisma.product.upsert({
    where: { sku: 'PROD-PREMIUM-TEE' },
    update: {},
    create: {
      name: 'OmniFlow Premium Cotton T-Shirt',
      slug: 'omniflow-premium-t-shirt',
      sku: 'PROD-PREMIUM-TEE',
      barcode: '890123456789',
      price: 29.99,
      costPrice: 12.50,
      categoryId: fashion.id,
      isFeatured: true,
    },
  });

  // Seed inventory records
  await prisma.inventory.upsert({
    where: {
      warehouseId_productId: {
        warehouseId: warehouse.id,
        productId: product1.id,
      },
    },
    update: { quantityOnHand: 45 },
    create: {
      warehouseId: warehouse.id,
      productId: product1.id,
      quantityOnHand: 45,
      reorderPoint: 5,
    },
  });

  await prisma.inventory.upsert({
    where: {
      warehouseId_productId: {
        warehouseId: warehouse.id,
        productId: product2.id,
      },
    },
    update: { quantityOnHand: 250 },
    create: {
      warehouseId: warehouse.id,
      productId: product2.id,
      quantityOnHand: 250,
      reorderPoint: 20,
    },
  });

  console.log('✅ Products & Stock seeded with initial warehouse inventory.');
  console.log('🎉 OmniFlow ERP Seeding Completed Successfully in MySQL!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
