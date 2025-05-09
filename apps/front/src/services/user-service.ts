import { api } from '@/lib/api';
import { User } from '@shrymp/types';

export const searchUsers = async (
  { pageParam = 0, query }: { query: string; pageParam: number },
) => {
  if (query == '') return { users: [], nextCursor: undefined };
  const { data, error } = await api.get<{ users: User[]; nextCursor: number }>(
    `/user/search?query=${query}&cursor=${pageParam}`,
  );

  if (error) {
    throw new Error(error.message);
  }

  return data;
};
