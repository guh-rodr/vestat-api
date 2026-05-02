-- This is an empty migration.

CREATE VIEW "ProductStats" AS
SELECT m.id,
       m.name,
       c.id as "categoryId",
       c.name as "categoryName",
       m."isVariable",
       COUNT(mv.id)::INT AS "variantCount",
       SUM(mv.quantity)::INT AS "quantity",
       MIN(mv."salePrice") AS "minSalePrice",
       MAX(mv."salePrice") AS "maxSalePrice"
FROM "Product" m
LEFT JOIN "Category" c ON c.id = m."categoryId"
LEFT JOIN "ProductVariant" mv ON mv."productId" = m.id
GROUP BY m.id,
         m.name,
         c.id,
         c.name