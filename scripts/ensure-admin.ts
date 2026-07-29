/**
 * Ensure ADMIN_EMAIL user exists as admin (or promote existing).
 * Run: npx tsx scripts/ensure-admin.ts
 */
import mongoose from 'mongoose'
import bcrypt from 'bcryptjs'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

async function main() {
  const uri = process.env.MONGODB_URI
  const adminEmail = (process.env.ADMIN_EMAIL || '').toLowerCase().trim()
  if (!uri || !adminEmail) {
    console.error('MONGODB_URI and ADMIN_EMAIL required in .env.local')
    process.exit(1)
  }

  await mongoose.connect(uri, { dbName: process.env.MONGODB_DB_NAME || 'cravebox' })
  const users = mongoose.connection.collection('users')

  const existing = await users.findOne({ email: adminEmail })
  if (existing) {
    await users.updateOne({ email: adminEmail }, { $set: { role: 'admin', isActive: true } })
    console.log(`Promoted existing user to admin: ${adminEmail}`)
  } else {
    const password = process.env.ADMIN_PASSWORD || 'Admin@123'
    const hash = await bcrypt.hash(password, 12)
    await users.insertOne({
      name: 'Admin',
      email: adminEmail,
      password: hash,
      role: 'admin',
      isActive: true,
      loyaltyPoints: 0,
      addresses: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    })
    console.log(`Created admin user: ${adminEmail}`)
    console.log(`Password: ${password}`)
  }

  await mongoose.disconnect()
}

main().catch(e => {
  console.error(e)
  process.exit(1)
})
