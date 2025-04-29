import { safeFetch } from '@/lib/utils';
import { PopulatedChat } from '@shrymp/types';
import { useQuery } from '@tanstack/react-query';
export const useChats = () => {
  const getChats = async () => {
    const { data, error } = await safeFetch<PopulatedChat[]>('/chats');

    if (data) {
      return data;
    }
    throw error;
  };

  const { data, error, isLoading } = useQuery({
    queryKey: ['chats'],
    queryFn: getChats,
  });

  return { data, error, isLoading };
};
