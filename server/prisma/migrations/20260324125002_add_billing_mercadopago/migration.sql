-- AlterTable
ALTER TABLE "User" ADD COLUMN     "billingPlan" TEXT NOT NULL DEFAULT 'trial',
ADD COLUMN     "billingStatus" TEXT NOT NULL DEFAULT 'trialing',
ADD COLUMN     "mercadoPagoPreapprovalId" TEXT,
ADD COLUMN     "mercadoPagoStatus" TEXT,
ADD COLUMN     "mercadoPagoSubscriptionUrl" TEXT,
ADD COLUMN     "subscriptionEndsAt" TIMESTAMP(3),
ADD COLUMN     "trialEndsAt" TIMESTAMP(3);
