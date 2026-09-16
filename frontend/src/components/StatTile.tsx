import type { ComponentType, ReactNode } from "react";

type Props = {
  icon: ComponentType<{ className?: string }>;
  label: string;
  value: ReactNode;
  unit?: string;
  subtitle?: string;
};

export function StatTile({ icon: Icon, label, value, unit, subtitle }: Props) {
  return (
    <div className="glass-card flex flex-col rounded-3xl p-5">
      <div className="flex items-center gap-2 text-sm opacity-80">
        <Icon className="h-4 w-4" />
        {label}
      </div>
      <div className="mt-3 flex items-baseline gap-1">
        <span className="text-3xl font-semibold tabular-nums">{value}</span>
        {unit && <span className="text-sm opacity-70">{unit}</span>}
      </div>
      {subtitle && <p className="mt-2 text-xs leading-snug opacity-60">{subtitle}</p>}
    </div>
  );
}
