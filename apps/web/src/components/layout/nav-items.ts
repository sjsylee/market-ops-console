import { Activity, Boxes, Home, MonitorPlay, type LucideIcon } from "lucide-react";

export type NavItem = {
  href: string;
  label: string;
  shortLabel: string;
  description: string;
  icon: LucideIcon;
};

export const navItems: NavItem[] = [
  {
    href: "/",
    label: "홈",
    shortLabel: "홈",
    description: "전체 운영 상태 확인",
    icon: Home,
  },
  {
    href: "/demo",
    label: "데모",
    shortLabel: "데모",
    description: "포트폴리오 공개 범위",
    icon: MonitorPlay,
  },
  {
    href: "/current",
    label: "입찰 관리",
    shortLabel: "입찰",
    description: "보관, 일반 입찰 관리",
    icon: Activity,
  },
  {
    href: "/jobs",
    label: "매크로",
    shortLabel: "매크로",
    description: "매크로 작동, 관리",
    icon: Boxes,
  },
];
