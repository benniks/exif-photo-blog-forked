import { auth } from '@/auth';
import LoginButton from '@/components/LoginButton';
import { cc } from '@/utility/css';
import Link from 'next/link';
import { redirect } from 'next/navigation';

export default async function SignInPage() {
  const session = await auth();
  if (session?.user) {
    redirect('/');
  }
  return (
    <div className={cc(
      'fixed top-0 left-0 right-0 bottom-0',
      'flex items-center justify-center flex-col gap-8',
    )}>
      <LoginButton />
      <Link href="/">Home</Link>
    </div>
  );
}
