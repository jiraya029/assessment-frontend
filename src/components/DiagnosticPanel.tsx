const PLATFORMS: { name: string; tag: string; level: "L1" | "L2" | "L3" }[] = [
  { name: "AWS", tag: "cloud", level: "L2" },
  { name: "Azure", tag: "cloud", level: "L1" },
  { name: "Database", tag: "data", level: "L3" },
  { name: "Automation", tag: "ops", level: "L2" },
  { name: "Frontend", tag: "web", level: "L1" },
  { name: "Backend", tag: "web", level: "L2" },
];

export function DiagnosticPanel() {
  return (
    <div className="flex h-full flex-col justify-center px-10 py-12 lg:px-14">
      <p className="font-mono text-xs tracking-[0.2em] text-muted uppercase">
        System scope
      </p>
      <h2 className="mt-3 font-display text-2xl font-semibold text-text">
        Every track, every level,
        <br />
        one assessment loop.
      </h2>

      <div className="mt-10 divide-y divide-panel-line border-y border-panel-line">
        {PLATFORMS.map((p, i) => (
          <div
            key={p.name}
            className="flex items-center justify-between py-3.5"
          >
            <div className="flex items-center gap-3">
              <span
                className="chase-dot h-1.5 w-1.5 rounded-full bg-accent"
                style={{ animationDelay: `${i}s` }}
              />
              <span className="font-body text-sm text-text">{p.name}</span>
              <span className="font-mono text-[11px] text-muted">{p.tag}</span>
            </div>
            <span className="font-mono text-[11px] tracking-wide text-accent-amber">
              {p.level}
            </span>
          </div>
        ))}
      </div>

      <p className="mt-8 max-w-xs font-body text-sm leading-relaxed text-muted">
        Questions are generated fresh for each attempt, calibrated to the
        role's platform and level.
      </p>
    </div>
  );
}
