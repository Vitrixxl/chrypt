import { StartChatDialog } from './_components/start-chat-dialog';

export default function ChatPage() {
  return (
    <div className='h-full flex  flex-col items-center justify-center gap-4'>
      <h1 className='text-4xl font-medium'>Welcome to Shrymp</h1>
      <h1 className='text-2xl font-medium text-muted-foreground'>
        Start a chat now!
      </h1>
      <div>
        <StartChatDialog />
      </div>
    </div>
  );
}
