import type { LucideIcon } from "lucide-react";

type Props = {
  title: string;
  value: number;
  subtitle: string;
  icon: LucideIcon;
  variant?: "blue" | "red" | "amber" | "green";
};

export default function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  variant = "blue",
}: Props) {
  const styles = {
    blue: "bg-blue-500/10 text-blue-400",
    red: "bg-red-500/10 text-red-400",
    amber: "bg-amber-500/10 text-amber-400",
    green: "bg-emerald-500/10 text-emerald-400",
  };

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 transition hover:border-slate-700">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-slate-500">
            {title}
          </p>

          <p className="mt-3 text-3xl font-bold text-white">
            {value}
          </p>

          <p className="mt-2 text-xs text-slate-600">
            {subtitle}
          </p>
        </div>

        <div
          className={`flex h-11 w-11 items-center justify-center rounded-xl ${styles[variant]}`}
        >
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </div>
  );
}