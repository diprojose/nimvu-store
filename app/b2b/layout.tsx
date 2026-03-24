import B2BHeader from '@/components/b2b/B2BHeader';
import B2BFooter from '@/components/b2b/B2BFooter';

export default function B2BLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col min-h-screen bg-[#F8F9FA]">
      <B2BHeader />
      <main className="flex-grow pt-16">
        {children}
      </main>
      <B2BFooter />
    </div>
  );
}
