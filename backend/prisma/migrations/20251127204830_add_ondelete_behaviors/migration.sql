-- DropForeignKey
ALTER TABLE "public"."damage_reports" DROP CONSTRAINT "damage_reports_apartment_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."damage_reports" DROP CONSTRAINT "damage_reports_reported_by_fkey";

-- DropForeignKey
ALTER TABLE "public"."notifications" DROP CONSTRAINT "notifications_user_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."payments" DROP CONSTRAINT "payments_user_id_fkey";

-- AddForeignKey
ALTER TABLE "damage_reports" ADD CONSTRAINT "damage_reports_apartment_id_fkey" FOREIGN KEY ("apartment_id") REFERENCES "apartments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "damage_reports" ADD CONSTRAINT "damage_reports_reported_by_fkey" FOREIGN KEY ("reported_by") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
