import type { Metadata } from 'next';

const siteName = 'Market Ops Console';

export function createPageMetadata(title: string, description: string): Metadata {
  return {
    title,
    description,
    openGraph: {
      title: `${title} | ${siteName}`,
      description,
      siteName,
      type: 'website',
    },
  };
}
