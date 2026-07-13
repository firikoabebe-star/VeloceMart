-- AlterTable
ALTER TABLE "product_variants" ADD COLUMN "size" TEXT,
ADD COLUMN "color" TEXT;

-- CreateIndex
CREATE INDEX "product_variants_size_idx" ON "product_variants"("size");

-- CreateIndex
CREATE INDEX "product_variants_color_idx" ON "product_variants"("color");
