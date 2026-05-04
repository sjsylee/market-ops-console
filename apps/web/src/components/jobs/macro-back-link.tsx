import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';

export function MacroBackLink() {
  return (
    <Link
      href="/jobs"
      className="inline-flex items-center gap-2 text-sm text-text-secondary transition hover:text-text-primary"
    >
      <ChevronLeft size={16} />
      <span>매크로로 돌아가기</span>
    </Link>
  );
}
