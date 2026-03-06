// database populator
// automates creation of dummy data for testing

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // 1. Clean existing data (Optional: prevents duplicates during testing)
  await prisma.payment.deleteMany();
  await prisma.invoiceLine.deleteMany();
  await prisma.invoice.deleteMany();

  // 2. Create a Sample Invoice with Line Items and a Partial Payment
  const invoice = await prisma.invoice.create({
    data: {
      invoiceNumber: "INV-2026-001",
      customerName: "Monefy Tech Solutions",
      issueDate: new Date("2026-03-01"),
      dueDate: new Date("2026-03-15"),
      status: "DRAFT",
      total: 1000.00,
      amountPaid: 400.00,
      balanceDue: 600.00,
      isArchived: false,
      lineItems: {
        create: [
          {
            description: "Full-stack Development",
            quantity: 1,
            unitPrice: 800.00,
            lineTotal: 800.00,
          },
          {
            description: "Cloud Hosting Setup",
            quantity: 2,
            unitPrice: 100.00,
            lineTotal: 200.00,
          }
        ]
      },
      payments: {
        create: [
          {
            amount: 400.00,
            paymentDate: new Date(),
          }
        ]
      }
    }
  });

  console.log(`Seeded Invoice ID: ${invoice.id}`);
}

main()
  .catch((e) => {
    console.error('Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });