/*
  Warnings:

  - You are about to drop the column `costPrice` on the `Model` table. All the data in the column will be lost.
  - You are about to drop the column `salePrice` on the `Model` table. All the data in the column will be lost.
  - You are about to drop the column `modelId` on the `SaleItem` table. All the data in the column will be lost.
  - You are about to drop the column `print` on the `SaleItem` table. All the data in the column will be lost.
  - Added the required column `variantId` to the `SaleItem` table without a default value. This is not possible if the table is not empty.

*/
-- CreateTable
CREATE TABLE "ModelVariant" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "color" TEXT,
    "size" TEXT,
    "costPrice" INTEGER NOT NULL,
    "salePrice" INTEGER NOT NULL,
    "quantity" INTEGER NOT NULL,
    "modelId" TEXT NOT NULL,
    CONSTRAINT "ModelVariant_modelId_fkey" FOREIGN KEY ("modelId") REFERENCES "Model" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Model" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "categoryId" TEXT,
    CONSTRAINT "Model_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Model" ("categoryId", "id", "name") SELECT "categoryId", "id", "name" FROM "Model";
DROP TABLE "Model";
ALTER TABLE "new_Model" RENAME TO "Model";
CREATE TABLE "new_SaleItem" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "saleId" TEXT NOT NULL,
    "variantId" TEXT NOT NULL,
    "modelName" TEXT NOT NULL,
    "categoryName" TEXT NOT NULL,
    "costPrice" INTEGER NOT NULL,
    "salePrice" INTEGER NOT NULL,
    "color" TEXT,
    "size" TEXT,
    CONSTRAINT "SaleItem_saleId_fkey" FOREIGN KEY ("saleId") REFERENCES "Sale" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "SaleItem_variantId_fkey" FOREIGN KEY ("variantId") REFERENCES "ModelVariant" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_SaleItem" ("categoryName", "color", "costPrice", "id", "modelName", "saleId", "salePrice", "size") SELECT "categoryName", "color", "costPrice", "id", "modelName", "saleId", "salePrice", "size" FROM "SaleItem";
DROP TABLE "SaleItem";
ALTER TABLE "new_SaleItem" RENAME TO "SaleItem";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "ModelVariant_modelId_color_size_key" ON "ModelVariant"("modelId", "color", "size");
