import { PipeTransform, Injectable, BadRequestException } from '@nestjs/common';
import { ZodSchema, ZodError } from 'zod';

@Injectable()
export class ZodValidationPipe implements PipeTransform {
  constructor(private schema: ZodSchema) {}

  transform(value: any) {
    console.log('🔍 Zod Validation - Input:', JSON.stringify(value, null, 2));

    try {
      const parsed_value = this.schema.parse(value);
      console.log('✅ Zod Validation - Success:', JSON.stringify(parsed_value, null, 2));
      return parsed_value;
    } catch (error) {
      if (error instanceof ZodError) {
        console.error('❌ Zod Validation - Failed:', JSON.stringify(error.errors, null, 2));
        throw new BadRequestException({
          message: 'Validation failed',
          errors: error.errors,
          timestamp: new Date().toISOString(),
        });
      }
      console.error('❌ Zod Validation - Unknown error:', error);
      throw new BadRequestException({
        message: 'Validation failed',
        error: error,
        timestamp: new Date().toISOString(),
      });
    }
  }
}
