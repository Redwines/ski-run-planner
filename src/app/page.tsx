import Link from 'next/link'

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-6">
      <div className="text-center space-y-6 max-w-md">
        <h1 className="text-4xl font-bold tracking-tight">
          Ski Run Planner
        </h1>
        <p className="text-muted-foreground text-lg">
          Plan the perfect ski day for your group based on everyone&apos;s skill level.
        </p>
        <Link
          href="/resort/tsugaike"
          className="inline-flex items-center justify-center rounded-md bg-primary px-8 py-4 text-lg font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
        >
          Start Planning
        </Link>
        <p className="text-sm text-muted-foreground">
          Currently featuring Tsugaike Kogen
        </p>
      </div>
    </main>
  )
}
