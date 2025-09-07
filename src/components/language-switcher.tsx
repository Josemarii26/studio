
'use client';
import { useChangeLocale, useCurrentLocale } from '@/locales/client';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';

const SpainFlag = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 3 2" className="h-4 w-6 rounded-sm">
        <path fill="#c60b1e" d="M0 0h3v2H0z"/>
        <path fill="#ffc400" d="M0 .5h3v1H0z"/>
    </svg>
);

const UKFlag = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 60 30" className="h-4 w-6 rounded-sm">
        <clipPath id="a"><path d="M0 0v30h60V0z"/></clipPath>
        <path d="M0 0v30h60V0z" fill="#012169"/>
        <path d="m0 0 60 30m0-30L0 30" stroke="#fff" strokeWidth="6" clipPath="url(#a)"/>
        <path d="m0 0 60 30m0-30L0 30" stroke="#c8102e" strokeWidth="4" clipPath="url(#a)"/>
        <path d="M30 0v30M0 15h60" stroke="#fff" strokeWidth="10"/>
        <path d="M30 0v30M0 15h60" stroke="#c8102e" strokeWidth="6"/>
    </svg>
);


export function LanguageSwitcher() {
  const changeLocale = useChangeLocale();
  const currentLocale = useCurrentLocale();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon">
          {currentLocale === 'es' ? <SpainFlag /> : <UKFlag />}
          <span className="sr-only">Change language</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem
          onClick={() => changeLocale('en')}
          disabled={currentLocale === 'en'}
          className="flex items-center gap-2"
        >
          <UKFlag />
          <span>English</span>
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => changeLocale('es')}
          disabled={currentLocale === 'es'}
           className="flex items-center gap-2"
        >
            <SpainFlag />
            <span>Español</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
