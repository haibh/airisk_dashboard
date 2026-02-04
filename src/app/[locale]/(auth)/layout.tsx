'use client';

import { use } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useTheme } from 'next-themes';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Globe, Sun, Moon } from 'lucide-react';
import { AIRiskAnimatedBackground } from '@/components/auth/ai-risk-animated-background';
import { LoginMouseGlowTracker } from '@/components/auth/login-mouse-glow-tracker';

interface AuthLayoutProps {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}

export default function AuthLayout({ children, params }: AuthLayoutProps) {
  const { locale } = use(params);

  return (
    <div className="min-h-screen flex flex-col auth-adaptive-bg">
      {/* AI Risk themed background visuals */}
      <AIRiskAnimatedBackground />
      <LoginMouseGlowTracker />

      {/* Header with theme toggle + language switcher */}
      <header className="absolute top-0 right-0 p-4 z-10 flex items-center gap-1">
        <ThemeToggle />
        <LanguageSwitcher currentLocale={locale} />
      </header>

      {/* Centered content */}
      <main className="relative z-10 flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md">{children}</div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 p-4 text-center text-sm text-muted-foreground">
        <p>&copy; 2026 AIRM-IP. All rights reserved.</p>
      </footer>
    </div>
  );
}

function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
      className="text-muted-foreground hover:text-foreground hover:bg-accent"
      aria-label="Toggle theme"
    >
      <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
      <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
    </Button>
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
        <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground hover:bg-accent">
          <Globe className="h-5 w-5" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => switchLocale('en')}>
          <span className={currentLocale === 'en' ? 'font-bold' : ''}>
            English
          </span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => switchLocale('vi')}>
          <span className={currentLocale === 'vi' ? 'font-bold' : ''}>
            Tiếng Việt
          </span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
