import { PrismaClient } from "@prisma/client"
import bcrypt from "bcryptjs"

const prisma = new PrismaClient()

async function main() {
  console.log("Seeding database...")

  // Create admin user
  const adminPassword = await bcrypt.hash("admin123", 10)
  const admin = await prisma.user.upsert({
    where: { email: "admin@stylino.ir" },
    update: {},
    create: {
      email: "admin@stylino.ir",
      password: adminPassword,
      name: "مدیر سیستم",
      role: "admin",
      affiliateCode: "ADMIN001",
    },
  })

  // Create affiliate user
  const affiliatePassword = await bcrypt.hash("affiliate123", 10)
  const affiliate = await prisma.user.upsert({
    where: { email: "affiliate@stylino.ir" },
    update: {},
    create: {
      email: "affiliate@stylino.ir",
      password: affiliatePassword,
      name: "همکار نمونه",
      role: "affiliate",
      affiliateCode: "AFF001",
    },
  })

  // Create categories
  const category1 = await prisma.category.upsert({
    where: { slug: "dress" },
    update: {},
    create: {
      name: "لباس",
      nameEn: "Dress",
      slug: "dress",
      description: "لباس‌های زنانه",
      order: 1,
    },
  })

  const category2 = await prisma.category.upsert({
    where: { slug: "top" },
    update: {},
    create: {
      name: "تاپ",
      nameEn: "Top",
      slug: "top",
      description: "تاپ‌های زنانه",
      order: 2,
    },
  })

  // Create products with variants
  const product1 = await prisma.product.upsert({
    where: { slug: "dress-1" },
    update: {},
    create: {
      name: "لباس مجلسی قرمز",
      nameEn: "Red Evening Dress",
      slug: "dress-1",
      description: "لباس مجلسی زیبا و شیک",
      basePrice: 500000,
      categoryId: category1.id,
      images: [
        "https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=800",
        "https://images.unsplash.com/photo-1566479179817-278a42ee8e8e?w=800",
      ],
      featured: true,
      variants: {
        create: [
          {
            size: "S",
            color: "قرمز",
            colorHex: "#DC2626",
            stockOnHand: 10,
            sku: "DRS-001-S-RED",
          },
          {
            size: "M",
            color: "قرمز",
            colorHex: "#DC2626",
            stockOnHand: 15,
            sku: "DRS-001-M-RED",
          },
          {
            size: "L",
            color: "قرمز",
            colorHex: "#DC2626",
            stockOnHand: 8,
            sku: "DRS-001-L-RED",
          },
        ],
      },
    },
  })

  const product2 = await prisma.product.upsert({
    where: { slug: "top-1" },
    update: {},
    create: {
      name: "تاپ سفید ساده",
      nameEn: "Simple White Top",
      slug: "top-1",
      description: "تاپ ساده و راحت",
      basePrice: 150000,
      categoryId: category2.id,
      images: [
        "https://images.unsplash.com/photo-1576566588028-43c2ad127aee?w=800",
      ],
      variants: {
        create: [
          {
            size: "XS",
            color: "سفید",
            colorHex: "#FFFFFF",
            stockOnHand: 20,
            sku: "TOP-001-XS-WHT",
          },
          {
            size: "S",
            color: "سفید",
            colorHex: "#FFFFFF",
            stockOnHand: 25,
            sku: "TOP-001-S-WHT",
          },
          {
            size: "M",
            color: "سفید",
            colorHex: "#FFFFFF",
            stockOnHand: 18,
            sku: "TOP-001-M-WHT",
          },
        ],
      },
    },
  })

  // Create settings
  await prisma.settings.upsert({
    where: { key: "shipping_cost" },
    update: {},
    create: {
      key: "shipping_cost",
      value: "50000",
      description: "هزینه ارسال (تومان)",
    },
  })

  await prisma.settings.upsert({
    where: { key: "commission_level1_percentage" },
    update: {},
    create: {
      key: "commission_level1_percentage",
      value: "10",
      description: "درصد کمیسیون سطح 1",
    },
  })

  await prisma.settings.upsert({
    where: { key: "commission_level2_percentage" },
    update: {},
    create: {
      key: "commission_level2_percentage",
      value: "5",
      description: "درصد کمیسیون سطح 2",
    },
  })

  console.log("Seeding completed!")
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

