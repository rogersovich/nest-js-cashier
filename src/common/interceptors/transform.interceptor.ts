import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable()
export class TransformInterceptor<T> implements NestInterceptor<T, any> {
  intercept(context: ExecutionContext, next: CallHandler<T>): Observable<any> {
    return next.handle().pipe(
      map((res: any): { status: string; data: T; message: string } => {
        const hasDataField = res && typeof res === 'object' && 'data' in res;

        const data = hasDataField ? (res.data as T) : (res as T);
        const message = hasDataField
          ? (res.message ?? 'Request successful')
          : 'Request successful';

        return {
          status: 'success',
          data,
          message,
        };
      }),
    );
  }
}
