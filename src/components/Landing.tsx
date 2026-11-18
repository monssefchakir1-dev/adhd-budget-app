type LandingProps = {
  onOpenPlanner: () => void
  onOpenDemo: () => void
}

export function Landing({ onOpenPlanner, onOpenDemo }: LandingProps) {
  return (
    <div className="landing">
      <header className="landing-nav">
        <div className="brand-mark">
          <span className="dot" aria-hidden />
          Sakina
        </div>
        <button type="button" className="btn btn-ghost btn-small" onClick={onOpenDemo}>
          Try the demo
        </button>
      </header>

      <section className="landing-hero" aria-label="Sakina hero">
        <div className="hero-copy">
          <p className="hero-brand">Sakina</p>
          <h2>A calm ADHD budget planner for Morocco</h2>
          <p>
            See your month clearly — income, expenses, and a Vacation fund — without spreadsheet
            chaos. Money stays on your device. No bank connection.
          </p>
          <div className="cta-row">
            <button type="button" className="btn btn-primary" onClick={onOpenPlanner}>
              Open my planner
            </button>
            <button type="button" className="btn btn-ghost" onClick={onOpenDemo}>
              Explore with sample data
            </button>
          </div>
        </div>
      </section>
    </div>
  )
}
