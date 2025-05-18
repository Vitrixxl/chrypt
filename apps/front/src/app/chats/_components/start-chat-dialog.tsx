import { Button } from '@/components/ui/button';
import { v4 as uuid } from 'uuid';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { UserAvatar } from '@/components/user-avatar';
import { useAutoFocus } from '@/hooks/use-autofocus';
import { useDebounceState } from '@/hooks/use-debounce-state';
import { searchUsers } from '@/services/user-service';
import { ActivatedUser, User } from '@shrymp/types';
import { useInfiniteQuery } from '@tanstack/react-query';
import {
  LucideLoaderCircle,
  LucidePlus,
  LucideSquarePen,
  LucideX,
} from 'lucide-react';
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useCreateChat } from '@/hooks/use-create-chat';

export function StartChatDialog() {
  const [search, currentSearch, setSearch] = useDebounceState('', 300);
  const [selectedUsers, setSelectedUsers] = React.useState<User[]>([]);
  const [isOpen, setIsOpen] = React.useState(false);
  const inputRef = React.useRef<HTMLInputElement | null>(null);
  const containerRef = React.useRef<HTMLDivElement | null>(null);
  const navigate = useNavigate();

  const { data, fetchNextPage, hasNextPage, isFetching } = useInfiniteQuery({
    queryKey: ['search-user', search],
    queryFn: async ({ pageParam = 0 }) =>
      searchUsers({ pageParam, query: search }),
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    initialPageParam: 0,
  });

  useAutoFocus(inputRef);

  const { mutate, error, isPending } = useCreateChat(
    {
      onSuccess: (values) => {
        setIsOpen(false);
        setSelectedUsers([]);
        navigate(`/chats/${values.chatId}`);
      },
    },
  );
  const handleCreate = async () => {
    const id = uuid();
    mutate({ chatId: id, users: selectedUsers as ActivatedUser[] });
  };

  React.useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const scrollHeight = container.scrollHeight;
    container.style.maxHeight = `${Math.min(400, scrollHeight)}px`;
  }, [data]);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className='w-full'>
          <LucidePlus />
          Start a chat
        </Button>
      </DialogTrigger>

      <DialogContent className='translate-y-0 top-12 flex flex-col'>
        <DialogTitle>Search for your friends and start a chat</DialogTitle>
        <DialogDescription>
          You can make a simple chat or a group chat by selecting multiple users
        </DialogDescription>
        <div className='flex flex-col gap-4 w-full'>
          <div className='flex gap-2 '>
            <Input
              className='w-full'
              placeholder='John doe...'
              ref={inputRef}
              value={currentSearch}
              onChange={(e) => setSearch(e.currentTarget.value)}
            />
            {selectedUsers.length > 0 && (
              <Button size='icon' onClick={handleCreate}>
                {isPending ? <LucideLoaderCircle /> : <LucideSquarePen />}
              </Button>
            )}
          </div>

          {error && <p className='text-destructive text-sm'>{error.message}</p>}

          {selectedUsers.length > 0 && (
            <div className='flex gap-1 overflow-x-auto w-full scrollbar-hidden '>
              {selectedUsers.map((u) => (
                <div
                  className='bg-accent  rounded-lg max-w-content flex gap-1 text-sm items-center justify-center px-2 py-1 scrollbar-hidden text-muted-foreground hover:text-foreground transition-colors'
                  key={u.id}
                >
                  <span className='flex-1 text-nowrap'>{u.name}</span>
                  <button
                    onClick={() =>
                      setSelectedUsers((users) =>
                        users.filter((user) => user.id != u.id)
                      )}
                  >
                    <LucideX className='size-4' />
                  </button>
                </div>
              ))}
            </div>
          )}

          <div
            className='w-full rounded-lg  flex flex-col gap-2 transition-[max-height] max-h-0  duration-300 overflow-auto'
            ref={containerRef}
          >
            {data
              ? (
                <>
                  {data.pages.map((page, i) => (
                    <React.Fragment key={i}>
                      {page.users.map((u) => (
                        <Button
                          key={u.id}
                          className='justify-start px-2 py-2 h-auto'
                          variant='ghost'
                          size='lg'
                          onClick={() => {
                            if (
                              !selectedUsers.find((user) => user.id == u.id)
                            ) {
                              setSelectedUsers((s) => [...s, u]);
                            }
                          }}
                        >
                          <UserAvatar user={u} />

                          <span>{u.name}</span>
                        </Button>
                      ))}
                    </React.Fragment>
                  ))}
                  {hasNextPage &&
                    (isFetching
                      ? (
                        <LucideLoaderCircle className='animate-spin mx-auto text-primary' />
                      )
                      : (
                        <Button
                          className='outline mx-auto'
                          onClick={() => fetchNextPage()}
                        >
                          Load more
                        </Button>
                      ))}
                </>
              )
              : (
                isFetching && (
                  <LucideLoaderCircle className='animate-spin mx-auto text-primary' />
                )
              )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
