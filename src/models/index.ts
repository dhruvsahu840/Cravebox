import mongoose, { Schema, Document, Types } from 'mongoose'

// ─── User ──────────────────────────────────────────────────────────────────────
export interface IUser extends Document {
  name: string
  email: string
  password?: string
  phone?: string
  role: 'user' | 'admin'
  avatar?: string
  addresses: {
    _id: Types.ObjectId
    label: string
    line1: string
    city: string
    pincode: string
    isDefault: boolean
  }[]
  loyaltyPoints: number
  referralCode: string
  isActive: boolean
  createdAt: Date
}

const UserSchema = new Schema<IUser>({
  name:      { type: String, required: true, trim: true },
  email:     { type: String, required: true, unique: true, lowercase: true },
  password:  { type: String, select: false },
  phone:     { type: String },
  role:      { type: String, enum: ['user', 'admin'], default: 'user' },
  avatar:    { type: String },
  addresses: [{
    label:     { type: String, default: 'Home' },
    line1:     { type: String, required: true },
    city:      { type: String, required: true },
    pincode:   { type: String, required: true },
    isDefault: { type: Boolean, default: false },
  }],
  loyaltyPoints: { type: Number, default: 0 },
  referralCode:  { type: String, unique: true, sparse: true, default: undefined },
  isActive: { type: Boolean, default: true },
}, { timestamps: true })

// ─── Category ──────────────────────────────────────────────────────────────────
export interface ICategory extends Document {
  name: string
  slug: string
  image?: string
  isActive: boolean
  sortOrder: number
}

const CategorySchema = new Schema<ICategory>({
  name:      { type: String, required: true, trim: true },
  slug:      { type: String, required: true, unique: true, lowercase: true },
  image:     { type: String },
  isActive:  { type: Boolean, default: true },
  sortOrder: { type: Number, default: 0 },
}, { timestamps: true })

// ─── Product ───────────────────────────────────────────────────────────────────
export interface IProduct extends Document {
  name: string
  slug: string
  description: string
  price: number
  discountedPrice?: number
  category: Types.ObjectId
  images: string[]
  tags: string[]
  isVeg: boolean
  isAvailable: boolean
  isFeatured: boolean
  isBestseller: boolean
  isSpicy: boolean
  calories?: number
  allergens?: string[]
  isCombo: boolean
  customizations?: {
    name: string
    options: { label: string; price: number }[]
  }[]
  ratings: { avg: number; count: number }
  sortOrder: number
}

const ProductSchema = new Schema<IProduct>({
  name:             { type: String, required: true, trim: true },
  slug:             { type: String, required: true, unique: true, lowercase: true },
  description:      { type: String, required: true },
  price:            { type: Number, required: true, min: 0 },
  discountedPrice:  { type: Number },
  category:         { type: Schema.Types.ObjectId, ref: 'Category', required: true },
  images:           [{ type: String }],
  tags:             [{ type: String }],
  isVeg:            { type: Boolean, default: false },
  isAvailable:      { type: Boolean, default: true },
  isFeatured:       { type: Boolean, default: false },
  isBestseller:     { type: Boolean, default: false },
  isSpicy:          { type: Boolean, default: false },
  calories:         { type: Number },
  allergens:        [{ type: String }],
  isCombo:          { type: Boolean, default: false },
  customizations:   [{
    name:    String,
    options: [{ label: String, price: Number }],
  }],
  ratings:  { avg: { type: Number, default: 0 }, count: { type: Number, default: 0 } },
  sortOrder: { type: Number, default: 0 },
}, { timestamps: true })

// ─── Order ─────────────────────────────────────────────────────────────────────
export type OrderStatus = 'pending' | 'confirmed' | 'preparing' | 'out_for_delivery' | 'delivered' | 'cancelled'

export interface IOrder extends Document {
  orderNumber: string
  user: Types.ObjectId
  items: {
    product: Types.ObjectId
    name: string
    image: string
    price: number
    qty: number
    customizations?: string
  }[]
  address: {
    line1: string
    city: string
    pincode: string
  }
  status: OrderStatus
  statusHistory: { status: OrderStatus; time: Date; note?: string }[]
  subtotal: number
  deliveryFee: number
  tax: number
  discount: number
  total: number
  payment: {
    method: 'razorpay' | 'cod'
    status: 'pending' | 'paid' | 'failed' | 'refunded'
    razorpayOrderId?: string
    razorpayPaymentId?: string
    razorpaySignature?: string
    paidAt?: Date
  }
  deliveryAgent?: {
    name: string
    phone: string
    location?: { lat: number; lng: number }
  }
  estimatedDelivery?: Date
  scheduledFor?: Date
  specialInstructions?: string
  rating?: { score: number; comment: string; deliveryScore?: number }
  createdAt: Date
}

const OrderSchema = new Schema<IOrder>({
  orderNumber: { type: String, unique: true },
  user:        { type: Schema.Types.ObjectId, ref: 'User', required: true },
  items: [{
    product:        { type: Schema.Types.ObjectId, ref: 'Product' },
    name:           String,
    image:          String,
    price:          Number,
    qty:            Number,
    customizations: String,
  }],
  address: { line1: String, city: String, pincode: String },
  status:  { type: String, enum: ['pending','confirmed','preparing','out_for_delivery','delivered','cancelled'], default: 'pending' },
  statusHistory: [{ status: String, time: { type: Date, default: Date.now }, note: String }],
  subtotal:    Number,
  deliveryFee: { type: Number, default: 0 },
  tax:         Number,
  discount:    { type: Number, default: 0 },
  total:       Number,
  payment: {
    method:             { type: String, enum: ['razorpay', 'cod'], default: 'cod' },
    status:             { type: String, enum: ['pending','paid','failed','refunded'], default: 'pending' },
    razorpayOrderId:    String,
    razorpayPaymentId:  String,
    razorpaySignature:  String,
    paidAt:             Date,
  },
  deliveryAgent:        { name: String, phone: String, location: { lat: Number, lng: Number } },
  estimatedDelivery:    Date,
  scheduledFor:         Date,
  specialInstructions:  String,
  rating:               { score: Number, comment: String, deliveryScore: Number },
}, { timestamps: true })

OrderSchema.pre('save', async function (next) {
  if (!this.orderNumber) {
    const count = await mongoose.model('Order').countDocuments()
    this.orderNumber = `CRV${String(count + 1).padStart(5, '0')}`
  }
  next()
})

// ─── Review ────────────────────────────────────────────────────────────────────
const ReviewSchema = new Schema({
  product: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
  user:    { type: Schema.Types.ObjectId, ref: 'User', required: true },
  order:   { type: Schema.Types.ObjectId, ref: 'Order' },
  rating:  { type: Number, required: true, min: 1, max: 5 },
  comment: String,
}, { timestamps: true })

// ─── Exports ───────────────────────────────────────────────────────────────────
export const User     = mongoose.models.User     || mongoose.model<IUser>('User', UserSchema)
export const Category = mongoose.models.Category || mongoose.model<ICategory>('Category', CategorySchema)
export const Product  = mongoose.models.Product  || mongoose.model<IProduct>('Product', ProductSchema)
export const Order    = mongoose.models.Order    || mongoose.model<IOrder>('Order', OrderSchema)
export const Review   = mongoose.models.Review   || mongoose.model('Review', ReviewSchema)

// ─── Coupon ────────────────────────────────────────────────────────────────────
export interface ICoupon extends Document {
  code: string
  type: 'percent' | 'flat'
  value: number
  minOrder: number
  maxDiscount?: number
  usageLimit: number
  usedCount: number
  expiresAt?: Date
  isActive: boolean
}

const CouponSchema = new Schema<ICoupon>({
  code:        { type: String, required: true, unique: true, uppercase: true, trim: true },
  type:        { type: String, enum: ['percent', 'flat'], required: true },
  value:       { type: Number, required: true },
  minOrder:    { type: Number, default: 0 },
  maxDiscount: { type: Number },
  usageLimit:  { type: Number, default: 100 },
  usedCount:   { type: Number, default: 0 },
  expiresAt:   { type: Date },
  isActive:    { type: Boolean, default: true },
}, { timestamps: true })

export const Coupon = mongoose.models.Coupon || mongoose.model<ICoupon>('Coupon', CouponSchema)

// ─── Newsletter ────────────────────────────────────────────────────────────────
const NewsletterSchema = new Schema({
  email: { type: String, required: true, unique: true, lowercase: true },
}, { timestamps: true })

export const Newsletter = mongoose.models.Newsletter || mongoose.model('Newsletter', NewsletterSchema)

// ─── Store Settings (singleton) ────────────────────────────────────────────────
export interface IStoreSettings extends Document {
  key: string
  taxRate: number
  deliveryFee: number
  freeDeliveryMin: number
  minOrder: number
}

const StoreSettingsSchema = new Schema<IStoreSettings>({
  key:             { type: String, default: 'store', unique: true },
  taxRate:         { type: Number, default: 0.05, min: 0, max: 0.3 },
  deliveryFee:     { type: Number, default: 40, min: 0, max: 500 },
  freeDeliveryMin: { type: Number, default: 299, min: 0 },
  minOrder:        { type: Number, default: 99, min: 0 },
}, { timestamps: true })

export const StoreSettings = mongoose.models.StoreSettings || mongoose.model<IStoreSettings>('StoreSettings', StoreSettingsSchema)
