import { AlertTriangle } from "lucide-react";

export function ErrorMessage({ message }: { message: string | null }) {
  if (!message) {
    return null;
  }

  return (
    <div
      className="flex gap-3 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-900"
      role="alert"
    >
      <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" aria-hidden="true" />
      <p className="whitespace-pre-line leading-6">{message}</p>
    </div>
  );
}
