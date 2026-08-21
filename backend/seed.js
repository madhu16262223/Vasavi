import prisma from './db.js';
import bcrypt from 'bcryptjs';
import { INITIAL_CATEGORIES, INITIAL_PRODUCTS, INITIAL_ORDERS } from '../src/data/mockData.js';

async function main() {
  console.log('🌱 Starting Vasavi Fancy Store Database Seed...');

  // 1. Seed Admin Account
  const passwordHash = await bcrypt.hash('admin123', 10);
  const admin = await prisma.admin.upsert({
    where: { email: 'admin@vasavi.com' },
    update: { passwordHash },
    create: {
      name: 'Vasavi Store Manager',
      email: 'admin@vasavi.com',
      passwordHash
    }
  });
  console.log('✅ Admin Account created:', admin.email);

  // 2. Seed Categories
  for (const cat of INITIAL_CATEGORIES) {
    await prisma.category.upsert({
      where: { slug: cat.slug },
      update: {
        name: cat.name,
        description: cat.description,
        imageUrl: cat.image
      },
      create: {
        id: cat.id,
        name: cat.name,
        slug: cat.slug,
        description: cat.description,
        imageUrl: cat.image
      }
    });
  }
  console.log(`✅ ${INITIAL_CATEGORIES.length} Categories seeded.`);

  // 3. Seed Products
  for (const prod of INITIAL_PRODUCTS) {
    await prisma.product.upsert({
      where: { id: prod.id },
      update: {
        name: prod.name,
        description: prod.description,
        price: prod.price,
        originalPrice: prod.originalPrice,
        stock: prod.stock,
        imageUrl: prod.image,
        brand: prod.brand,
        shade: prod.shade,
        isTrending: prod.isTrending || false,
        isBestSeller: prod.isBestSeller || false
      },
      create: {
        id: prod.id,
        name: prod.name,
        description: prod.description,
        price: prod.price,
        originalPrice: prod.originalPrice,
        stock: prod.stock,
        imageUrl: prod.image,
        brand: prod.brand,
        shade: prod.shade,
        isTrending: prod.isTrending || false,
        isBestSeller: prod.isBestSeller || false,
        categoryId: prod.categoryId
      }
    });
  }
  console.log(`✅ ${INITIAL_PRODUCTS.length} Products seeded.`);

  // 4. Seed Orders & OrderItems
  for (const ord of INITIAL_ORDERS) {
    await prisma.order.upsert({
      where: { orderNumber: ord.orderNumber },
      update: {
        status: ord.status,
        totalAmount: ord.totalAmount
      },
      create: {
        id: ord.id,
        orderNumber: ord.orderNumber,
        customerName: ord.customerName,
        customerPhone: ord.customerPhone,
        address: ord.customerAddress,
        totalAmount: ord.totalAmount,
        status: ord.status,
        createdAt: new Date(ord.createdAt),
        items: {
          create: ord.items.map((item) => ({
            productId: item.productId,
            productName: item.productName,
            quantity: item.quantity,
            price: item.price,
            subtotal: item.subtotal
          }))
        }
      }
    });
  }
  console.log(`✅ ${INITIAL_ORDERS.length} Sample Orders seeded.`);

  console.log('✨ Vasavi Store Database Seeding Script Ready!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
