import { PipeTransform, Injectable, BadRequestException, Logger } from '@nestjs/common';
import { ZodSchema, ZodError } from 'zod';

@Injectable()
export class ZodValidationPipe implements PipeTransform {
  private readonly logger = new Logger(ZodValidationPipe.name);

  constructor(private schema: ZodSchema) {}

  transform(value: any) {
    this.logger.debug(`Validation input: ${JSON.stringify(value)}`);

    try {
      const parsed_value = this.schema.parse(value);
      this.logger.debug(`Validation success: ${JSON.stringify(parsed_value)}`);
      return parsed_value;
    } catch (error) {
      if (error instanceof ZodError) {
        this.logger.warn(`Validation failed: ${JSON.stringify(error.errors)}`);
        throw new BadRequestException({
          message: 'Validation failed',
          errors: error.errors,
          timestamp: new Date().toISOString(),
        });
      }
      this.logger.error(`Validation unknown error: ${error}`);
      throw new BadRequestException({
        message: 'Validation failed',
        error: error,
        timestamp: new Date().toISOString(),
      });
    }
  }
}
