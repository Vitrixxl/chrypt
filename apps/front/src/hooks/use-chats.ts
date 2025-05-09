import { getChats } from '@/services/chat-service';
import { useQuery } from '@tanstack/react-query';
export const useChats = () => {
  const { data, error, isLoading } = useQuery({
    queryKey: ['chats'],
    queryFn: getChats,
  });

  return {
    data,
    error,
    isLoading,
  };
};
