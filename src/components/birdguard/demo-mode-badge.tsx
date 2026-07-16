export function DemoModeBadge({ enabled }: { enabled: boolean }) {
  if (!enabled) {
    return null;
  }

  return (
    <span className="inline-flex items-center rounded-full border border-amber-300 bg-amber-50 px-3 py-1 text-sm font-medium text-amber-900">
      데모 모드
    </span>
  );
}
