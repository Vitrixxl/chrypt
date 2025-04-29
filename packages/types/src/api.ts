import { Result } from '../../utils';

export type ApiResponse<T> = Result<T, {
  message: string;
  details: Record<string, any> | null;
}>;
