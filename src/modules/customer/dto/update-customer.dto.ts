import { PartialType } from '@nestjs/swagger';
import { CreateCustomerBodyDto } from './create-customer.dto';

export class UpdateCustomerBodyDto extends PartialType(CreateCustomerBodyDto) {}
