import NextLink from 'next/link';
import { useLocale } from 'next-intl';
import { ComponentProps } from 'react';

type LinkProps = ComponentProps<typeof NextLink>;

export function Link({ href, ...props }: LinkProps) {
  const locale = useLocale();
  const localizedHref =
    typeof href === 'string' ? `/${locale}${href}` : href;

  return <NextLink href={localizedHref} {...props} />;
}
