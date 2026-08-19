ALTER TABLE "drinks" DROP CONSTRAINT "drinks_flavour_unique";--> statement-breakpoint
ALTER TABLE "brands" ADD COLUMN "slug" text;--> statement-breakpoint
ALTER TABLE "drinks" ADD COLUMN "slug" text;--> statement-breakpoint
UPDATE "brands" SET "slug" = lower(regexp_replace(regexp_replace(trim("name"), '[^a-zA-Z0-9]+', '-', 'g'), '(^-+|-+$)', '', 'g')) WHERE "slug" IS NULL;--> statement-breakpoint
UPDATE "drinks" SET "slug" = lower(regexp_replace(regexp_replace(trim("flavour"), '[^a-zA-Z0-9]+', '-', 'g'), '(^-+|-+$)', '', 'g')) WHERE "slug" IS NULL;--> statement-breakpoint
ALTER TABLE "brands" ALTER COLUMN "slug" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "drinks" ALTER COLUMN "slug" SET NOT NULL;--> statement-breakpoint
CREATE UNIQUE INDEX "brands_slug_unique" ON "brands" USING btree ("slug");--> statement-breakpoint
CREATE UNIQUE INDEX "drinks_brand_slug_unique" ON "drinks" USING btree ("brand_id","slug");
