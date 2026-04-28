SELECT
  c.id,
  c.name,
  c.phone,
  c."createdAt",
  COALESCE(sum(s.total), (0) :: bigint) AS "totalSpent",
  (
    COALESCE(sum(s.total), (0) :: bigint) - COALESCE(sum(t.value), (0) :: bigint)
  ) AS debt,
  max(s."purchasedAt") AS "lastPurchaseAt"
FROM
  (
    (
      "Customer" c
      LEFT JOIN "Sale" s ON ((s."customerId" = c.id))
    )
    LEFT JOIN "CashFlowTransaction" t ON ((t."saleId" = s.id))
  )
GROUP BY
  c.id,
  c.name;