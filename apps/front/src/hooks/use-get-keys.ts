import { safeFetch } from '@/lib/utils';
import { UserPrivateKey } from '@shrymp/types';

export const useGetKeys = () => {
  return async () => {
    return await safeFetch<
      UserPrivateKey[]
    >(
      '/user/keys',
    );
  };
};
