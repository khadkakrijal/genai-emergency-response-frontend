"use client";

import {
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

type Props = {
  high: number;
  medium: number;
  low: number;
};

export default function RiskChart({
  high,
  medium,
  low,
}: Props) {
  const total = high + medium + low;

  const data = [
    {
      name: "High",
      value: high,
      fill: "#ef4444",
    },
    {
      name: "Medium",
      value: medium,
      fill: "#f59e0b",
    },
    {
      name: "Low",
      value: low,
      fill: "#10b981",
    },
  ];

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6">
      <h2 className="font-semibold text-white">
        Risk Distribution
      </h2>

      <p className="mt-1 text-xs text-slate-500">
        AI-classified incident severity
      </p>

      {total === 0 ? (
        <div className="flex h-[280px] items-center justify-center text-sm text-slate-500">
          No risk data available.
        </div>
      ) : (
        <>
          <div className="relative mt-4 h-[230px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={65}
                  outerRadius={90}
                  paddingAngle={4}
                  strokeWidth={0}
                >
                  {data.map((entry) => (
                    <Cell
                      key={entry.name}
                      fill={entry.fill}
                    />
                  ))}
                </Pie>

                <Tooltip
                  contentStyle={{
                    background: "#020617",
                    border: "1px solid #1e293b",
                    borderRadius: "12px",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>

            <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-3xl font-bold">
                {total}
              </span>

              <span className="text-xs text-slate-500">
                Incidents
              </span>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <Legend
              label="High"
              value={high}
              dot="bg-red-500"
            />

            <Legend
              label="Medium"
              value={medium}
              dot="bg-amber-500"
            />

            <Legend
              label="Low"
              value={low}
              dot="bg-emerald-500"
            />
          </div>
        </>
      )}
    </div>
  );
}

function Legend({
  label,
  value,
  dot,
}: {
  label: string;
  value: number;
  dot: string;
}) {
  return (
    <div className="rounded-xl bg-slate-950/60 p-3">
      <div className="flex items-center gap-2">
        <span
          className={`h-2 w-2 rounded-full ${dot}`}
        />

        <span className="text-xs text-slate-500">
          {label}
        </span>
      </div>

      <p className="mt-2 text-lg font-semibold">
        {value}
      </p>
    </div>
  );
}