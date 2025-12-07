export default function Features() {
  return (
    <section className="w-full max-w-5xl px-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <FeatureCard
          title="Medical Q&A"
          desc="Ask about symptoms, conditions, medications, and wellness - get accurate, evidence-based answers."
        />
        <FeatureCard
          title="Sentiment Analysis"
          desc="AI detects your emotional state and provides personalized support and motivation."
        />
        <FeatureCard
          title="Safe & Reliable"
          desc="Anti-hallucination measures ensure you get factual medical information with proper disclaimers."
        />
      </div>
    </section>
  );
}

function FeatureCard({ title, desc }) {
  return (
    <div className="rounded-lg border border-border bg-card p-5 text-card-foreground shadow-sm">
      <h3 className="text-lg font-semibold">{title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
        {desc}
      </p>
    </div>
  );
}
