import { NextRequest, NextResponse } from 'next/server'
import tsugaikeData from '@/data/tsugaike.json'

// For POC, serve directly from JSON. Can switch to Prisma once database is configured.
const resorts: Record<string, typeof tsugaikeData> = {
  tsugaike: tsugaikeData,
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const resort = resorts[params.id]

  if (!resort) {
    return NextResponse.json(
      { error: 'Resort not found' },
      { status: 404 }
    )
  }

  return NextResponse.json(resort)
}
