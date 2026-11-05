export type IconName =
  | "home"
  | "tasks"
  | "settings"
  | "account"
  | "link"
  | "arrow"
  | "chevron"
  | "clock"
  | "list"
  | "heart"
  | "users"
  | "message"
  | "refresh"
  | "close"
  | "check"
  | "menu"
  | "external";
const paths: Record<IconName, string> = {
  home: "m3 10 9-7 9 7v10a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1Z",
  tasks: "M8 3h12v18H4V3h4m0 5h1m3 0h5M8 12h1m3 0h5M8 16h1m3 0h5",
  settings:
    "M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8M10 3h4l1 3 3 1 3-1 2 4-2 2v3l2 2-2 4-3-1-3 1-1 3h-4l-1-3-3-1-3 1-2-4 2-2v-3L1 10l2-4 3 1 3-1Z",
  account: "M16 7a4 4 0 1 1-8 0 4 4 0 0 1 8 0M4 21v-3a8 8 0 0 1 16 0v3Z",
  link: "m10 14 4-4M8 16l-1 1a4 4 0 0 1-6-6l5-5a4 4 0 0 1 6 0m0 12a4 4 0 0 0 6 0l5-5a4 4 0 0 0-6-6l-1 1",
  arrow: "M4 12h16m-6-6 6 6-6 6",
  chevron: "m9 5 7 7-7 7",
  clock: "M12 8v5l3 2M22 12a10 10 0 1 1-20 0 10 10 0 0 1 20 0",
  list: "M4 5h16v15H4ZM8 2v6m8-6v6M4 11h16",
  heart: "M12 21 3 12A6 6 0 0 1 12 4a6 6 0 0 1 9 8Z",
  users:
    "M15 7a4 4 0 1 1-8 0 4 4 0 0 1 8 0M3 21v-3a8 8 0 0 1 16 0v3m-1-17a4 4 0 0 1 0 8m3 9v-3a8 8 0 0 0-3-6",
  message: "M21 3H3v14h5l4 4 4-4h5Z",
  refresh: "M20 8a8 8 0 1 0 0 9M20 3v6h-6",
  close: "m6 6 12 12M6 18 18 6",
  check: "m5 12 4 4L19 6",
  menu: "M4 6h16M4 12h16M4 18h16",
  external: "M14 3h7v7m0-7L10 14M10 3H3v18h18v-7",
};
export function Icon({ name, size = 20 }: { name: IconName; size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.65"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d={paths[name]} />
    </svg>
  );
}
