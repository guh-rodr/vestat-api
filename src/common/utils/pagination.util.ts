import { ListCustomersQueryDto } from 'src/modules/customer/dto/list-customers.dto';

export function buildPrismaPagination(options: ListCustomersQueryDto) {
  const { page } = options;

  const take = 10;
  const skip = (page - 1) * take;

  return {
    take,
    skip,
  };
}
