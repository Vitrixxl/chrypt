import { useInfiniteMessage } from '@/hooks/use-infinite-message';
import { Message } from './message';
import { useAtom, useAtomValue } from 'jotai';
import { $user } from '@/stores/user';
import { LucideLoaderCircle } from 'lucide-react';
import React from 'react';
import { UserMessage } from './user-message';
import { List } from '@/components/list';
import { $newMessageTrigger } from '@/stores/chat';

type MessageListProps = {
  chatId: string;
};

export const MessageList = ({ chatId }: MessageListProps) => {
  const user = useAtomValue($user);
  const [newMessageTrigger, setNewMessageTrigger] = useAtom($newMessageTrigger);
  const containerRef = React.useRef<HTMLDivElement | null>(null);

  const {
    data,
    isPending,
    fetchNextPage,
    isFetchingNextPage,
  } = useInfiniteMessage(chatId);

  const scrollToBottom = () => {
    if (!containerRef.current) return;
    containerRef.current.scrollTo({ top: containerRef.current.scrollHeight });
  };

  React.useEffect(() => {
    scrollToBottom();
  }, [chatId]);

  React.useEffect(() => {
    if (data && data.pages.length == 1) {
      scrollToBottom();
      return;
    }
  }, [data]);

  React.useEffect(() => {
    if (newMessageTrigger) {
      scrollToBottom();
      setNewMessageTrigger(false);
    }
  }, [newMessageTrigger]);

  if (!user || isPending) {
    return (
      <div className='flex w-full items-center justify-center p-4'>
        <LucideLoaderCircle className='animate-spin size-12' />
      </div>
    );
  }

  if (!data) return null;

  return (
    <List
      className='overflow-y-auto overflow-x-hidden w-full flex flex-col max-h-full h-fit mt-auto gap-4  pb-4 overscroll-none'
      order='up'
      onMaxScroll={fetchNextPage}
      ref={containerRef}
    >
      {isFetchingNextPage && (
        <div className='w-full flex justify-center items-center'>
          <LucideLoaderCircle className='animate-spin' />
        </div>
      )}

      <div className='max-w-[900px] mx-auto flex flex-col gap-3 w-full'>
        {data.pages
          .flatMap((page) => page.decryptedMessages)
          .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime())
          .map((message) =>
            message.userId === user.id
              ? <UserMessage user={user} message={message} key={message.id} />
              : <Message message={message} key={message.id} />
          )}
      </div>
    </List>
  );
};
