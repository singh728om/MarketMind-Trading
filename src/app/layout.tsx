import type {Metadata} from 'next';
import './globals.css';
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { TopBar } from "@/components/top-bar";
import { FloatingDigi } from "@/components/floating-digi";
import { Toaster } from "@/components/ui/toaster";

export const metadata: Metadata = {
  title: 'TheDigiOcean - India\'s Most Intelligent AI Trading Platform',
  description: 'Trade Smarter. Not Harder. Let AI Protect You.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=DM+Sans:wght@400;500;700&family=JetBrains+Mono:wght@400;500;600&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased bg-background text-foreground">
        <SidebarProvider>
          <div className="flex min-h-screen w-full flex-col">
            <TopBar />
            <div className="flex flex-1 overflow-hidden pt-16">
              <AppSidebar />
              <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
                {children}
              </main>
            </div>
            <FloatingDigi />
          </div>
          <Toaster />
        </SidebarProvider>
      </body>
    </html>
  );
}
