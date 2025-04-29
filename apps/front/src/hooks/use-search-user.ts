import { safeFetch } from '@/lib/utils';
import { User } from '@shrymp/types';
import { useQuery } from '@tanstack/react-query';

type UseSearchUserParams = {
  query: string;
};
export function useSearchUser({ query }: UseSearchUserParams) {
  const fetchUsers = async (query: string) => {
    if (query == '') return null;

    const { data, error } = await safeFetch<User[]>(`/profiles?query=${query}`);
    if (error) throw error;
    return data;
  };

  const { data, error, isLoading } = useQuery({
    queryKey: ['search-user', query],
    queryFn: async () => fetchUsers(query),
  });

  return { data, error, isLoading };
}
