/**
 * Seed script — run with:
 *   npx tsx scripts/seed.ts
 *
 * Make sure MONGODB_URI is set in your .env.local
 */
import mongoose from 'mongoose'
import dotenv from 'dotenv'
import { imageForSlug } from './product-images'
dotenv.config({ path: '.env.local' })

const MONGO_URI = process.env.MONGODB_URI!
if (!MONGO_URI) { console.error('MONGODB_URI missing'); process.exit(1) }

const CategorySchema = new mongoose.Schema({ name: String, slug: String, isActive: Boolean, sortOrder: Number }, { timestamps: true })
const ProductSchema  = new mongoose.Schema({
  name: String, slug: String, description: String, price: Number, discountedPrice: Number,
  category: mongoose.Schema.Types.ObjectId, images: [String], isVeg: Boolean, isAvailable: Boolean,
  isBestseller: Boolean, isSpicy: Boolean, isFeatured: Boolean,
  ratings: { avg: Number, count: Number }, sortOrder: Number,
}, { timestamps: true })

const Category = mongoose.model('Category', CategorySchema)
const Product  = mongoose.model('Product',  ProductSchema)

const CouponSchema = new mongoose.Schema({
  code: String, type: String, value: Number, minOrder: Number, maxDiscount: Number,
  usageLimit: Number, usedCount: Number, isActive: Boolean,
}, { timestamps: true })
const Coupon = mongoose.model('Coupon', CouponSchema)

const categories = [
  { name: 'Pizza',     slug: 'pizza',     isActive: true, sortOrder: 1 },
  { name: 'Burger',    slug: 'burger',    isActive: true, sortOrder: 2 },
  { name: 'Sandwich',  slug: 'sandwich',  isActive: true, sortOrder: 3 },
  { name: 'Maggi',     slug: 'maggi',     isActive: true, sortOrder: 4 },
  { name: 'Drinks',    slug: 'drinks',    isActive: true, sortOrder: 5 },
]

async function seed() {
  await mongoose.connect(MONGO_URI)
  console.log('Connected to MongoDB')

  // Clear existing
  await Category.deleteMany({})
  await Product.deleteMany({})

  // Insert categories
  const cats = await Category.insertMany(categories)
  const catMap = Object.fromEntries(cats.map((c: any) => [c.slug, c._id]))
  console.log(`✅ Created ${cats.length} categories`)

  // Insert products
  const products = [
    { name: 'Margherita Pizza',       slug: 'margherita-pizza',       description: 'Classic tomato base, mozzarella, fresh basil',                     price: 199, category: catMap.pizza,    isVeg: true,  isBestseller: true,  isFeatured: true,  sortOrder: 1, ratings: { avg: 4.6, count: 82 } },
    { name: 'Pepperoni Pizza',        slug: 'pepperoni-pizza',        description: 'Loaded with pepperoni, extra cheese and oregano',                   price: 249, category: catMap.pizza,    isVeg: false, isBestseller: true,  isSpicy: true,    sortOrder: 2, ratings: { avg: 4.7, count: 95 } },
    { name: 'BBQ Chicken Pizza',      slug: 'bbq-chicken-pizza',      description: 'Smoky BBQ sauce, grilled chicken, capsicum, onion',                 price: 279, category: catMap.pizza,    isVeg: false, isFeatured: true,                    sortOrder: 3, ratings: { avg: 4.5, count: 60 } },
    { name: 'Paneer Tikka Pizza',     slug: 'paneer-tikka-pizza',     description: 'Spiced paneer, onions, capsicum on green chutney base',             price: 229, category: catMap.pizza,    isVeg: true,  isSpicy: true,                        sortOrder: 4, ratings: { avg: 4.4, count: 44 } },
    { name: 'Classic Veg Burger',     slug: 'classic-veg-burger',     description: 'Crispy aloo patty, lettuce, tomato, special sauce',                 price: 99,  category: catMap.burger,   isVeg: true,  isBestseller: true,  isFeatured: true,  sortOrder: 1, ratings: { avg: 4.3, count: 110 } },
    { name: 'Chicken Zinger Burger',  slug: 'chicken-zinger-burger',  description: 'Crispy fried chicken, coleslaw, spicy mayo',                        price: 149, category: catMap.burger,   isVeg: false, isBestseller: true,  isSpicy: true,    sortOrder: 2, ratings: { avg: 4.8, count: 135 } },
    { name: 'Double Smash Burger',    slug: 'double-smash-burger',    description: 'Double smashed patty, cheddar, caramelised onions, pickles',        price: 179, category: catMap.burger,   isVeg: false, isFeatured: true,                    sortOrder: 3, ratings: { avg: 4.6, count: 58 } },
    { name: 'Veg Grill Sandwich',     slug: 'veg-grill-sandwich',     description: 'Grilled veggies, cheese slice, mint chutney, toasted bread',        price: 79,  category: catMap.sandwich, isVeg: true,                                         sortOrder: 1, ratings: { avg: 4.1, count: 35 } },
    { name: 'Chicken Club Sandwich',  slug: 'chicken-club-sandwich',  description: 'Triple layer: chicken, boiled egg, lettuce, mayo',                  price: 129, category: catMap.sandwich, isVeg: false, isBestseller: true,                    sortOrder: 2, ratings: { avg: 4.5, count: 72 } },
    { name: 'Masala Maggi',           slug: 'masala-maggi',           description: 'Classic 2-minute noodles with a desi masala twist',                 price: 59,  category: catMap.maggi,    isVeg: true,  isBestseller: true,  isFeatured: true,  sortOrder: 1, ratings: { avg: 4.7, count: 200 } },
    { name: 'Egg Maggi',              slug: 'egg-maggi',              description: 'Maggi with scrambled egg, spring onions and extra masala',           price: 79,  category: catMap.maggi,    isVeg: false,                                        sortOrder: 2, ratings: { avg: 4.4, count: 90 } },
    { name: 'Cheese Maggi',           slug: 'cheese-maggi',           description: 'Loaded with melted cheese, butter and crushed black pepper',        price: 89,  category: catMap.maggi,    isVeg: true,  isSpicy: true,                        sortOrder: 3, ratings: { avg: 4.6, count: 120 } },
    { name: 'Cold Coffee',            slug: 'cold-coffee',            description: 'Chilled blended coffee with vanilla ice cream',                      price: 79,  category: catMap.drinks,   isVeg: true,                                         sortOrder: 1, ratings: { avg: 4.5, count: 50 } },
    { name: 'Mango Shake',            slug: 'mango-shake',            description: 'Fresh Alphonso mango, chilled milk, a hint of cardamom',            price: 69,  category: catMap.drinks,   isVeg: true,                       isFeatured: true,  sortOrder: 2, ratings: { avg: 4.8, count: 65 } },
    { name: 'Masala Chaas',           slug: 'masala-chaas',           description: 'Chilled spiced buttermilk with roasted cumin and mint',             price: 49,  category: catMap.drinks,   isVeg: true,                                         sortOrder: 3, ratings: { avg: 4.2, count: 30 } },
  ].map(p => ({ ...p, isAvailable: true, images: imageForSlug(p.slug) }))

  await Product.insertMany(products)
  console.log(`✅ Created ${products.length} products`)

  // Coupons
  await Coupon.deleteMany({})
  await Coupon.insertMany([
    { code: 'WELCOME20', type: 'percent', value: 20, minOrder: 199, maxDiscount: 100, usageLimit: 500, usedCount: 0, isActive: true },
    { code: 'FLAT50',    type: 'flat',    value: 50, minOrder: 299, usageLimit: 500, usedCount: 0, isActive: true },
    { code: 'PIZZA30',   type: 'percent', value: 30, minOrder: 199, maxDiscount: 80, usageLimit: 500, usedCount: 0, isActive: true },
    { code: 'FREEMAGGI', type: 'flat',    value: 30, minOrder: 99,  usageLimit: 500, usedCount: 0, isActive: true },
  ])
  console.log('✅ Created 4 coupons')

  await mongoose.disconnect()
  console.log('Done! 🎉')
}

seed().catch(e => { console.error(e); process.exit(1) })
