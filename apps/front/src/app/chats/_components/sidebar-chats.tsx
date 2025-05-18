import { List } from '@/components/list';
import { useChats } from '@/hooks/use-chats';
import { LucideLoaderCircle } from 'lucide-react';
import { ChatButton } from './chat-button';
import { User } from '@shrymp/types';

export function SidebarChats({ user }: { user: User }) {
  const { data, isLoading, fetchNextPage } = useChats();
  return (
    <List className='' onMaxScroll={fetchNextPage}>
      {isLoading
        ? (
          <div className='w-full flex items-center justify-center '>
            <LucideLoaderCircle className='animate-spin' />
          </div>
        )
        : data
        ? data.pages.flatMap((p) => (p.chats)).sort((a, b) =>
          (a instanceof Date ? a.getTime() : new Date(a.updatedAt).getTime()) -
          (b instanceof Date ? b.getTime() : new Date(b.updatedAt).getTime())
        ).map((c) => <ChatButton chat={c} user={user} key={c.id} />)
        : ''}
    </List>
  );
}
