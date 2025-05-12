import { ReziseTextArea } from '@/components/resize-textarea';
import { Button } from '@/components/ui/button';
import { useAutoFocus } from '@/hooks/use-autofocus';
import { useSendMessage } from '@/hooks/use-send-message';
import { LucideLoaderCircle, LucideSend } from 'lucide-react';
import React from 'react';
import { useParams } from 'react-router-dom';

export function AppInput() {
  const [inputValue, setInputValue] = React.useState('');
  const inputRef = React.useRef<HTMLTextAreaElement | null>(null);
  const { chatId } = useParams();
  const sendMutation = useSendMessage();
  useAutoFocus(inputRef);

  const handleSubmit = async () => {
    if (!chatId || inputValue == '') return;
    await sendMutation.mutateAsync({ content: inputValue, chatId });
    setInputValue('');
  };
  const handleKeyDown = async (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.code == 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <form className='max-w-[900px] mx-auto w-full mt-auto'>
      <div className='flex gap-2 p-2 border rounded-lg  items-end pl-3  w-full h-full'>
        <ReziseTextArea
          ref={inputRef}
          value={inputValue}
          onKeyDown={handleKeyDown}
          onChange={(e) => setInputValue(e.currentTarget.value)}
          rows={1}
          className='flex-1 max-h-[25svh] resize-none outline-none mt-auto mb-auto'
          placeholder='Type your message'
        />
        <Button
          size='icon'
          className='size-8'
          disabled={!Boolean(chatId) || inputValue == '' ||
            sendMutation.isPending}
          onClick={(e) => {
            e.preventDefault();
            handleSubmit();
          }}
        >
          {sendMutation.isPending
            ? <LucideLoaderCircle className='animate-spin ' />
            : <LucideSend />}
        </Button>
      </div>
    </form>
  );
}
