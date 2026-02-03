'use client';

import { use } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Globe } from 'lucide-react';

interface AuthLayoutProps {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}

export default function AuthLayout({ children, params }: AuthLayoutProps) {
  const { locale } = use(params);

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header with language switcher */}
      <header className="absolute top-0 right-0 p-4">
        <LanguageSwitcher currentLocale={locale} />
      </header>

      {/* Centered content */}
      <main className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md">{children}</div>
      </main>

      {/* Footer */}
      <footer className="p-4 text-center text-sm text-muted-foreground">
        <p>&copy; 2026 AIRM-IP. All rights reserved.</p>
      </footer>
    </div>
  );
}

function LanguageSwitcher({ currentLocale }: { currentLocale: string }) {
  const router = useRouter();
  const pathname = usePathname();

  const switchLocale = (newLocale: string) => {
    if (!pathname) return;
    const newPath = pathname.replace(`/${currentLocale}`, `/${newLocale}`);
    router.push(newPath);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon">
          <Globe className="h-5 w-5" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => switchLocale('en')}>
          <span className={currentLocale === 'en' ? 'font-bold' : ''}>
            🇺🇸 English
          </span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => switchLocale('vi')}>
          <span className={currentLocale === 'vi' ? 'font-bold' : ''}>
            🇻🇳 Tiếng Việt
          </span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
