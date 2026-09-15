import {
  AlertTriangle,
  ArrowDown,
  BrainCircuit,
  CheckCircle2,
  Database,
  FileText,
  GitBranch,
  Layers3,
  Search,
  Server,
  ShieldCheck,
  Sparkles,
  Workflow,
} from "lucide-react";

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-[1600px] space-y-10 p-6 lg:p-8">

      {/* HEADER */}
      <section>
        <div className="flex items-center gap-2 text-blue-400">
          <BrainCircuit className="h-4 w-4" />

          <span className="text-xs font-bold uppercase tracking-[0.2em]">
            AI System
          </span>
        </div>

        <h1 className="mt-3 text-3xl font-bold tracking-tight text-white">
          Emergency Intelligence Architecture
        </h1>

        <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-400">
          An AI-assisted decision-support platform that combines
          historical emergency incident retrieval with large language
          model analysis to support situational awareness for first
          responders.
        </p>
      </section>

      {/* MAIN INTRO */}
      <section className="overflow-hidden rounded-2xl border border-blue-500/20 bg-gradient-to-br from-blue-500/10 via-slate-900/60 to-slate-900/60">
        <div className="grid gap-8 p-7 lg:grid-cols-[1.3fr_0.7fr] lg:p-9">
          <div>
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-600">
              <BrainCircuit className="h-6 w-6 text-white" />
            </div>

            <h2 className="mt-5 text-2xl font-bold text-white">
              Advanced Situational Awareness for First Responders
            </h2>

            <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-400">
              Emergency information can be incomplete, unstructured and
              time-sensitive. This prototype analyses a newly reported
              incident, retrieves relevant historical emergency records
              and provides structured AI-assisted decision-support
              information.
            </p>

            <div className="mt-6 flex flex-wrap gap-2">
              <Tag>Retrieval-Augmented Analysis</Tag>
              <Tag>TF-IDF</Tag>
              <Tag>Cosine Similarity</Tag>
              <Tag>Large Language Model</Tag>
              <Tag>Human Review</Tag>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-6">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500">
              System Purpose
            </p>

            <div className="mt-5 space-y-4">
              <PurposeItem text="Interpret emergency incident information" />
              <PurposeItem text="Retrieve relevant historical incidents" />
              <PurposeItem text="Assess risk and response priority" />
              <PurposeItem text="Recommend appropriate responders" />
              <PurposeItem text="Support human emergency decision-making" />
            </div>
          </div>
        </div>
      </section>

      {/* SYSTEM ARCHITECTURE */}
      <section>
        <SectionHeading
          eyebrow="Architecture"
          title="How the System Works"
          description="The prototype uses a retrieval-assisted pipeline rather than training the language model directly on the emergency dataset."
        />

        <div className="mt-6 rounded-2xl border border-slate-800 bg-slate-900/60 p-6 lg:p-8">

          <PipelineStep
            number="01"
            icon={<FileText className="h-5 w-5" />}
            title="Emergency Incident Input"
            description="The user provides the current incident description and available contextual information such as location, time, people involved, weapon information and reported injuries."
          />

          <PipelineArrow />

          <PipelineStep
            number="02"
            icon={<Layers3 className="h-5 w-5" />}
            title="TF-IDF Vectorisation"
            description="Emergency text is transformed into TF-IDF feature vectors so that the current report can be compared with historical emergency records."
          />

          <PipelineArrow />

          <PipelineStep
            number="03"
            icon={<Search className="h-5 w-5" />}
            title="Cosine Similarity Retrieval"
            description="Cosine similarity measures lexical similarity between the new emergency report and historical incidents in the reference dataset."
          />

          <PipelineArrow />

          <PipelineStep
            number="04"
            icon={<Database className="h-5 w-5" />}
            title="Top-K Historical Incidents"
            description="The most relevant historical incidents are retrieved and used as supporting contextual information."
          />

          <PipelineArrow />

          <PipelineStep
            number="05"
            icon={<BrainCircuit className="h-5 w-5" />}
            title="LLM Analysis"
            description="The current incident and retrieved historical context are provided to the language model through the prompt for structured analysis."
          />

          <PipelineArrow />

          <PipelineStep
            number="06"
            icon={<Sparkles className="h-5 w-5" />}
            title="Structured Decision Support"
            description="The system returns incident type, risk level, confidence, priority, recommended responders, key risks, summary, recommended response and reasoning."
          />

          <PipelineArrow />

          <PipelineStep
            number="07"
            icon={<ShieldCheck className="h-5 w-5" />}
            title="Human Review"
            description="AI-generated information is treated as decision support. Low-confidence or weak-evidence cases can be flagged for human review."
            last
          />
        </div>
      </section>

      {/* IMPORTANT RAG EXPLANATION */}
      <section className="grid gap-6 lg:grid-cols-2">
        <InfoCard
          icon={<GitBranch className="h-5 w-5" />}
          title="Retrieval-Augmented Analysis"
        >
          <p>
            The system does not train the LLM directly on the Kaggle
            emergency dataset. Instead, TF-IDF and cosine similarity
            retrieve relevant historical incidents.
          </p>

          <p className="mt-3">
            Those retrieved incidents are then supplied as contextual
            information to the LLM together with the current emergency
            report.
          </p>
        </InfoCard>

        <InfoCard
          icon={<AlertTriangle className="h-5 w-5" />}
          title="Why Human Review Matters"
        >
          <p>
            Historical context can help provide useful information, but
            retrieved records may also introduce irrelevant or
            conflicting details.
          </p>

          <p className="mt-3">
            The prototype therefore treats AI output as decision
            support rather than autonomous emergency decision-making.
          </p>
        </InfoCard>
      </section>

      {/* DATASET */}
      <section>
        <SectionHeading
          eyebrow="Historical Intelligence"
          title="Emergency Dataset"
          description="Historical emergency records provide the retrieval knowledge source used by the prototype."
        />

        <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <MetricCard
            value="663,522"
            label="Emergency Records"
            detail="Kaggle 911 dataset"
          />

          <MetricCard
            value="80%"
            label="Reference Dataset"
            detail="530,817 incidents"
          />

          <MetricCard
            value="20%"
            label="Test Dataset"
            detail="132,705 incidents"
          />

          <MetricCard
            value="3"
            label="Broad Categories"
            detail="EMS • Traffic • Fire"
          />
        </div>
      </section>

      {/* EVALUATION */}
      <section>
        <SectionHeading
          eyebrow="Evaluation"
          title="Prototype Performance"
          description="Initial experimental evaluation was conducted on held-out historical emergency records."
        />

        <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <MetricCard
            value="89.33%"
            label="Retrieval Accuracy"
            detail="Best tested configuration"
            accent
          />

          <MetricCard
            value="0.8932"
            label="F1 Score"
            detail="Historical retrieval"
            accent
          />

          <MetricCard
            value="0.50"
            label="Similarity Threshold"
            detail="Experimental threshold"
          />

          <MetricCard
            value="10.67%"
            label="Human Review"
            detail="At selected threshold"
          />
        </div>

        <div className="mt-6 rounded-2xl border border-slate-800 bg-slate-900/60 p-6">
          <div className="flex items-start gap-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-500/10">
              <AlertTriangle className="h-5 w-5 text-amber-400" />
            </div>

            <div>
              <h3 className="font-semibold text-white">
                Experimental Results
              </h3>

              <p className="mt-2 text-sm leading-6 text-slate-400">
                These results represent prototype evaluation and should
                not be interpreted as operational emergency-service
                validation. Further testing with larger and more
                representative scenarios is required.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* TECHNOLOGY */}
      <section>
        <SectionHeading
          eyebrow="Technology"
          title="Technology Stack"
          description="The prototype combines modern web development, information retrieval and generative AI technologies."
        />

        <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          <TechnologyCard
            icon={<Workflow className="h-5 w-5" />}
            title="Frontend"
            items={[
              "Next.js",
              "TypeScript",
              "Tailwind CSS",
            ]}
          />

          <TechnologyCard
            icon={<Server className="h-5 w-5" />}
            title="AI Backend"
            items={[
              "Python",
              "FastAPI",
              "Pydantic",
            ]}
          />

          <TechnologyCard
            icon={<Search className="h-5 w-5" />}
            title="Retrieval"
            items={[
              "TF-IDF",
              "Cosine Similarity",
              "Top-K Retrieval",
            ]}
          />

          <TechnologyCard
            icon={<BrainCircuit className="h-5 w-5" />}
            title="Generative AI"
            items={[
              "Large Language Model",
              "Prompt Engineering",
              "Retrieved Context",
            ]}
          />

          <TechnologyCard
            icon={<Database className="h-5 w-5" />}
            title="Data"
            items={[
              "Kaggle 911 Dataset",
              "Supabase",
              "Historical Incidents",
            ]}
          />

          <TechnologyCard
            icon={<ShieldCheck className="h-5 w-5" />}
            title="Safety & Evaluation"
            items={[
              "Similarity Threshold",
              "Human Review",
              "Hallucination Testing",
            ]}
          />
        </div>
      </section>

      {/* FINAL MESSAGE */}
      <section className="rounded-2xl border border-blue-500/20 bg-blue-500/5 p-7">
        <div className="flex flex-col gap-5 md:flex-row md:items-center">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-600">
            <ShieldCheck className="h-6 w-6 text-white" />
          </div>

          <div>
            <h2 className="text-lg font-semibold text-white">
              AI-Assisted, Human-Centred Decision Support
            </h2>

            <p className="mt-2 max-w-4xl text-sm leading-6 text-slate-400">
              The objective of the prototype is not to replace first
              responders or emergency operators. It investigates how
              historical incident retrieval and generative AI can
              improve access to relevant information and support faster,
              more structured situational awareness.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*                               COMPONENTS                                   */
/* -------------------------------------------------------------------------- */

function SectionHeading({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description: string;
}) {
  return (
    <div>
      <p className="text-xs font-bold uppercase tracking-[0.2em] text-blue-400">
        {eyebrow}
      </p>

      <h2 className="mt-2 text-2xl font-bold text-white">
        {title}
      </h2>

      <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-500">
        {description}
      </p>
    </div>
  );
}

function PipelineStep({
  number,
  icon,
  title,
  description,
  last = false,
}: {
  number: string;
  icon: React.ReactNode;
  title: string;
  description: string;
  last?: boolean;
}) {
  return (
    <div
      className={`flex gap-4 rounded-xl border p-5 ${
        last
          ? "border-emerald-500/20 bg-emerald-500/5"
          : "border-slate-800 bg-slate-950/50"
      }`}
    >
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-500/10 text-blue-400">
        {icon}
      </div>

      <div>
        <div className="flex items-center gap-3">
          <span className="text-xs font-bold text-blue-500">
            {number}
          </span>

          <h3 className="font-semibold text-white">
            {title}
          </h3>
        </div>

        <p className="mt-2 max-w-4xl text-sm leading-6 text-slate-500">
          {description}
        </p>
      </div>
    </div>
  );
}

function PipelineArrow() {
  return (
    <div className="flex justify-center py-2">
      <ArrowDown className="h-5 w-5 text-slate-700" />
    </div>
  );
}

function Tag({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <span className="rounded-lg border border-blue-500/20 bg-blue-500/10 px-3 py-1.5 text-xs font-medium text-blue-300">
      {children}
    </span>
  );
}

function PurposeItem({
  text,
}: {
  text: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" />

      <span className="text-sm text-slate-400">
        {text}
      </span>
    </div>
  );
}

function InfoCard({
  icon,
  title,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/10 text-blue-400">
          {icon}
        </div>

        <h3 className="font-semibold text-white">
          {title}
        </h3>
      </div>

      <div className="mt-4 text-sm leading-6 text-slate-400">
        {children}
      </div>
    </div>
  );
}

function MetricCard({
  value,
  label,
  detail,
  accent = false,
}: {
  value: string;
  label: string;
  detail: string;
  accent?: boolean;
}) {
  return (
    <div
      className={`rounded-2xl border p-5 ${
        accent
          ? "border-blue-500/20 bg-blue-500/5"
          : "border-slate-800 bg-slate-900/60"
      }`}
    >
      <p
        className={`text-3xl font-bold ${
          accent ? "text-blue-400" : "text-white"
        }`}
      >
        {value}
      </p>

      <p className="mt-3 text-sm font-semibold text-slate-300">
        {label}
      </p>

      <p className="mt-1 text-xs text-slate-600">
        {detail}
      </p>
    </div>
  );
}

function TechnologyCard({
  icon,
  title,
  items,
}: {
  icon: React.ReactNode;
  title: string;
  items: string[];
}) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6">
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/10 text-blue-400">
        {icon}
      </div>

      <h3 className="mt-4 font-semibold text-white">
        {title}
      </h3>

      <div className="mt-4 flex flex-wrap gap-2">
        {items.map((item) => (
          <span
            key={item}
            className="rounded-lg bg-slate-950 px-3 py-1.5 text-xs text-slate-400"
          >
            {item}
          </span>
        ))}
      </div>
    </div>
  );
}