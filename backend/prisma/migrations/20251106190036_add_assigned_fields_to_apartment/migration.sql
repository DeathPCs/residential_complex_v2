-- AlterTable
ALTER TABLE "apartments" ADD COLUMN     "assignedRole" TEXT,
ADD COLUMN     "assigned_user_id" TEXT;

-- AddForeignKey
ALTER TABLE "apartments" ADD CONSTRAINT "apartments_assigned_user_id_fkey" FOREIGN KEY ("assigned_user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
