/**
 * Patch existing products with images (no data wipe).
 * Run: npm run db:images
 */
import mongoose from 'mongoose'
import dotenv from 'dotenv'
import { imageForSlug } from './product-images'

dotenv.config({ path: '.env.local' })

const MONGO_URI = process.env.MONGODB_URI!
if (!MONGO_URI) {
  console.error('MONGODB_URI missing')
  process.exit(1)
}

async function main() {
  await mongoose.connect(MONGO_URI, { dbName: process.env.MONGODB_DB_NAME || 'cravebox' })
  const products = mongoose.connection.collection('products')

  const all = await products.find({}).toArray()
  let updated = 0

  for (const p of all) {
    const slug = p.slug as string
    const images = imageForSlug(slug)
    if (!images.length) {
      console.log(`  skip (no image map): ${slug}`)
      continue
    }
    if (p.images?.[0] === images[0]) continue

    await products.updateOne({ _id: p._id }, { $set: { images } })
    updated++
    console.log(`  ✓ ${p.name}`)
  }

  console.log(`\nUpdated ${updated} product(s) with images.`)
  await mongoose.disconnect()
}

main().catch(e => {
  console.error(e)
  process.exit(1)
})
