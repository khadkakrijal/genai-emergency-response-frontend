import { BrainCircuit } from "lucide-react";

const steps = [
  {
    number: "01",
    title: "Incident Input",
    text: "Emergency information",
  },
  {
    number: "02",
    title: "TF-IDF",
    text: "Text vectorisation",
  },
  {
    number: "03",
    title: "Historical Retrieval",
    text: "Cosine similarity",
  },
  {
    number: "04",
    title: "LLM Analysis",
    text: "Contextual reasoning",
  },
  {
    number: "05",
    title: "Decision Support",
    text: "Responder guidance",
  },
];

export default function Pipeline() {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6">
      <div className="mb-6 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/10">
          <BrainCircuit className="h-5 w-5 text-blue-400" />
        </div>

        <div>
          <h2 className="font-semibold">
            AI Decision-Support Pipeline
          </h2>

          <p className="mt-1 text-xs text-slate-500">
            Emergency incident processing workflow
          </p>
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-5">
        {steps.map((step) => (
          <div
            key={step.number}
            className="rounded-xl border border-slate-800 bg-slate-950/50 p-4 transition hover:border-blue-500/30"
          >
            <span className="text-xs font-bold text-blue-500">
              {step.number}
            </span>

            <p className="mt-3 text-sm font-semibold">
              {step.title}
            </p>

            <p className="mt-1 text-xs text-slate-600">
              {step.text}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}