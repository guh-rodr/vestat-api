SELECT
  t.id,
  t.description,
  t.category,
  t.value,
  t.flow,
  t.date,
  t."createdAt",
  s.id AS "saleId"
FROM
  (
    "CashFlowTransaction" t
    LEFT JOIN "Sale" s ON ((s.id = t."saleId"))
  );