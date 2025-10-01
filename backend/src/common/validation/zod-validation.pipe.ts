import { PipeTransform, Injectable, BadRequestException } from '@nestjs/common';
import { ZodSchema, ZodError } from 'zod';

@Injectable()
export class ZodValidationPipe implements PipeTransform {
  constructor(private schema: ZodSchema) {}

  transform(value: any) {
    try {
      const parsed_value = this.schema.parse(value);
      return parsed_value;
    } catch (error) {
      if (error instanceof ZodError) {
        throw new BadRequestException({
          message: 'Validation failed',
          errors: error.errors,
          timestamp: new Date().toISOString(),
        });
      }
      throw new BadRequestException({
        message: 'Validation failed',
        error: error,
        timestamp: new Date().toISOString(),
      });
    }
  }
}
