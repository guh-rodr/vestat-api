export const PRODUCT_FILTERS_MAP = {
  name: { type: 'text' },
  categoryId: { type: 'text' },
  quantity: { type: 'number' },
  // TODO: adicionar o campo 'price' e tipo 'price_range' no buildPrismaFilter para suportar intervalo de valores
};
