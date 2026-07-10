/**
 * One-time migration: merge `test` database into `cravebox`, then seed if catalog is sparse.
 * Run: npx tsx scripts/consolidate-db.ts
 */
import mongoose from 'mongoose'
import dotenv from 'dotenv'
import { execSync } from 'child_process'

dotenv.config({ path: '.env.local' })

const rawUri = process.env.MONGODB_URI!
if (!rawUri) {
  console.error('MONGODB_URI missing in .env.local')
  process.exit(1)
}

function craveboxUri(uri: string) {
  return uri.replace(/(mongodb\+srv:\/\/[^/]+)(\/[^?]*)?(\?|$)/, '$1/cravebox$3')
}

async function consolidate() {
  const uri = craveboxUri(rawUri)
  await mongoose.connect(uri)
  const client = mongoose.connection.getClient()
  const testDb = client.db('test')
  const craveboxDb = client.db('cravebox')

  console.log('Connected — target database: cravebox')

  const collections = ['users', 'categories', 'products', 'coupons', 'orders', 'reviews', 'newsletters'] as const

  for (const name of collections) {
    const docs = await testDb.collection(name).find().toArray()
    if (docs.length === 0) continue

    if (name === 'users') {
      let merged = 0
      for (const doc of docs) {
        const email = (doc.email as string)?.toLowerCase()
        if (!email) continue
        const res = await craveboxDb.collection(name).updateOne(
          { email },
          { $setOnInsert: doc },
          { upsert: true },
        )
        if (res.upsertedCount) merged++
      }
      console.log(`  users: merged ${merged} from test (${docs.length} in test)`)
      continue
    }

    const existing = await craveboxDb.collection(name).countDocuments()
    if (existing === 0) {
      await craveboxDb.collection(name).insertMany(docs)
      console.log(`  ${name}: copied ${docs.length} documents`)
    } else {
      console.log(`  ${name}: skipped (${existing} already in cravebox)`)
    }
  }

  const productCount = await craveboxDb.collection('products').countDocuments()
  const userCount = await craveboxDb.collection('users').countDocuments()
  console.log(`\nCravebox now has ${productCount} products, ${userCount} users`)

  await mongoose.disconnect()

  if (productCount < 5) {
    console.log('\nCatalog is sparse — running seed script...')
    execSync('npx tsx scripts/seed.ts', { stdio: 'inherit', cwd: process.cwd() })
  }

  console.log('\nDone. Set MONGODB_URI to use /cravebox and restart the dev server.')
}

consolidate().catch((e) => {
  console.error(e)
  process.exit(1)
})
