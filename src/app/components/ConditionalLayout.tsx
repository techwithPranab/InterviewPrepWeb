'use client';

import { usePathname } from 'next/navigation';
import Header from './Header';
import Footer from './Footer';

export default function ConditionalLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  
  // Don't show header and footer on admin pages
  const isAdminPage = pathname?.startsWith('/admin');
  
  // Don't show footer on interview pages
  const isInterviewPage = pathname?.startsWith('/interview');

  if (isAdminPage) {
    return <>{children}</>;
  }

  return (
    <>
      <Header />
      <main>{children}</main>
      {!isInterviewPage && <Footer />}
    </>
  );
}
