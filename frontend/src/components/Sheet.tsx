import { X } from "../assets/icons";
import type { ReactNode } from "react";
import { useTranslation } from "../i18n/useTranslation";

type Props = {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
};

export function Sheet({ open, onClose, title, children }: Props) {
  const { t } = useTranslation();
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="glass-card w-full max-w-md rounded-t-3xl p-5"
        style={{ paddingBottom: "calc(env(safe-area-inset-bottom, 0px) + 1.5rem)" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-base font-semibold">{title}</h2>
          <button
            onClick={onClose}
            className="rounded-full p-1.5 opacity-70 transition hover:bg-white/10 hover:opacity-100"
            aria-label={t("common.close")}
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
