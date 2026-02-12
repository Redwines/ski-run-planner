import { PrismaClient, LiftType, TerrainType, Difficulty } from '@prisma/client'
import tsugaikeData from '../src/data/tsugaike.json'

const prisma = new PrismaClient()

async function main() {
  console.log('Seeding database...')

  // Clear existing data
  await prisma.runEndLift.deleteMany()
  await prisma.run.deleteMany()
  await prisma.baseAreaLift.deleteMany()
  await prisma.lift.deleteMany()
  await prisma.baseArea.deleteMany()
  await prisma.resort.deleteMany()

  // Create resort
  const resort = await prisma.resort.create({
    data: {
      id: tsugaikeData.id,
      name: tsugaikeData.name,
      region: tsugaikeData.region,
    },
  })
  console.log(`Created resort: ${resort.name}`)

  // Create lifts
  for (const lift of tsugaikeData.lifts) {
    await prisma.lift.create({
      data: {
        id: lift.id,
        resortId: resort.id,
        name: lift.name,
        nameJa: lift.nameJa,
        type: lift.type as LiftType,
        baseElevation: lift.baseElevation,
        topElevation: lift.topElevation,
        positionX: lift.positionX,
        positionY: lift.positionY,
      },
    })
  }
  console.log(`Created ${tsugaikeData.lifts.length} lifts`)

  // Create base areas and their lift connections
  for (const baseArea of tsugaikeData.baseAreas) {
    await prisma.baseArea.create({
      data: {
        id: baseArea.id,
        resortId: resort.id,
        name: baseArea.name,
        lifts: {
          create: baseArea.liftIds.map((liftId) => ({
            liftId,
          })),
        },
      },
    })
  }
  console.log(`Created ${tsugaikeData.baseAreas.length} base areas`)

  // Create runs and their end lift connections
  for (const run of tsugaikeData.runs) {
    await prisma.run.create({
      data: {
        id: run.id,
        resortId: resort.id,
        name: run.name,
        nameJa: run.nameJa,
        difficultyStandard: run.difficultyStandard as Difficulty,
        difficultyRaw: run.difficultyRaw,
        terrainType: run.terrainType as TerrainType,
        length: run.length,
        maxGrade: run.maxGrade,
        startLiftId: run.startLiftId,
        endLifts: {
          create: run.endLiftIds.map((liftId) => ({
            liftId,
          })),
        },
      },
    })
  }
  console.log(`Created ${tsugaikeData.runs.length} runs`)

  console.log('Database seeded successfully!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
