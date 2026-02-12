import { notFound } from 'next/navigation'
import tsugaikeData from '@/data/tsugaike.json'
import { Resort } from '@/lib/graph'
import { ResortPageClient } from './ResortPageClient'

// Available resorts (static for POC)
const resorts: Record<string, Resort> = {
  tsugaike: tsugaikeData as Resort,
}

interface PageProps {
  params: { id: string }
}

export function generateStaticParams() {
  return Object.keys(resorts).map((id) => ({ id }))
}

export default function ResortPage({ params }: PageProps) {
  const resort = resorts[params.id]

  if (!resort) {
    notFound()
  }

  return <ResortPageClient resort={resort} />
}
