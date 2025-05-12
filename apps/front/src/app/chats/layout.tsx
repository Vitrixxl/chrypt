import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from '@/components/ui/sidebar';
import { Outlet } from 'react-router-dom';
import { AppSidebar } from './_components/app-sidebar';
import { AppInput } from './_components/app-input';
import { useAtomValue } from 'jotai';
import { $user } from '@/stores/user';

export default function ChatLayout() {
  const user = useAtomValue($user);

  if (!user) {
    // navigate("/auth/login");
    console.log('no user');
    return null;
  }

  return (
    <SidebarProvider>
      <AppSidebar user={user} />
      <SidebarInset>
        <main className='p-4 grid grid-rows-[minmax(0,1fr)_auto] h-full relative'>
          <SidebarTrigger className='absolute top-4 left-4' />
          <div className='h-full'>
            <Outlet />
          </div>
          <AppInput />
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
