SELECT
  c.name AS "customerName",
  c.id AS "customerId",
  s.id,
  s.total,
  s.profit,
  s."purchasedAt",
  s."createdAt",
  COALESCE(i."itemCount", (0) :: bigint) AS "itemCount",
  CASE
    WHEN (COALESCE(p."totalPaid", (0) :: bigint) >= s.total) THEN 'paid' :: text
    ELSE 'pending' :: text
  END AS STATUS
FROM
  (
    (
      (
        "Sale" s
        LEFT JOIN "Customer" c ON ((s."customerId" = c.id))
      )
      LEFT JOIN (
        SELECT
          "SaleItem"."saleId",
          count(*) AS "itemCount"
        FROM
          "SaleItem"
        GROUP BY
          "SaleItem"."saleId"
      ) i ON ((i."saleId" = s.id))
    )
    LEFT JOIN (
      SELECT
        "CashFlowTransaction"."saleId",
        sum("CashFlowTransaction".value) AS "totalPaid"
      FROM
        "CashFlowTransaction"
      GROUP BY
        "CashFlowTransaction"."saleId"
    ) p ON ((p."saleId" = s.id))
  );