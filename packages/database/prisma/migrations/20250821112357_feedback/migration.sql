-- AlterTable
ALTER TABLE "campaign" ADD COLUMN     "feedbackAt" TIMESTAMP(3),
ADD COLUMN     "feedbackMessage" TEXT,
ADD COLUMN     "feedbackSubmitted" BOOLEAN NOT NULL DEFAULT false;
