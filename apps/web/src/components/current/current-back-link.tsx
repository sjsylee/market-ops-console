import { ChevronLeft } from 'lucide-react';
import Link from 'next/link';

export function CurrentBackLink() {
  return (
    <Link
      href="/current"
      className="inline-flex items-center gap-2 text-sm text-text-secondary transition hover:text-text-primary"
    >
      <ChevronLeft size={16} />
      <span>입찰로 돌아가기</span>
    </Link>
  );
}
