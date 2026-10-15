import mongoose, { Schema, Document, Types } from 'mongoose'

// ============================================================
// USER
// ============================================================

export interface IUser extends Document {
  name: string
  email?: string
  password?: string
  phone?: string
  phoneVerified: boolean
  googleId?: string

  role: 'user' | 'admin'

  // Kept for compatibility with current auth code
  isActive: boolean

  // Profile
  image?: string
  avatar?: string

  // Addresses
  addresses: {
    _id: Types.ObjectId
    label: string
    line1: string
    city: string
    pincode: string
    isDefault: boolean
  }[]

  // Loyalty / referral
  loyaltyPoints: number
  referralCode?: string

  // Password reset
  resetToken?: string
  resetTokenExpires?: Date

  createdAt: Date
  updatedAt: Date
}

const UserSchema = new Schema<IUser>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      sparse: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    password: {
      type: String,
      select: false,
    },

    phone: {
      type: String,
      sparse: true,
      unique: true,
      trim: true,
    },

    phoneVerified: {
      type: Boolean,
      default: false,
    },

    googleId: {
      type: String,
      sparse: true,
      unique: true,
    },

    role: {
      type: String,
      enum: ['user', 'admin'],
      default: 'user',
    },

    isActive: {
      type: Boolean,
      default: true,
    },

    image: {
      type: String,
    },

    avatar: {
      type: String,
    },

    addresses: [
      {
        label: {
          type: String,
          default: 'Home',
        },

        line1: {
          type: String,
          required: true,
        },

        city: {
          type: String,
          required: true,
        },

        pincode: {
          type: String,
          required: true,
        },

        isDefault: {
          type: Boolean,
          default: false,
        },
      },
    ],

    loyaltyPoints: {
      type: Number,
      default: 0,
    },

    referralCode: {
      type: String,
      unique: true,
      sparse: true,
      default: undefined,
    },

    resetToken: {
      type: String,
      select: false,
    },

    resetTokenExpires: {
      type: Date,
      select: false,
    },
  },
  {
    timestamps: true,
  }
)

// ============================================================
// CATEGORY
// ============================================================

export interface ICategory extends Document {
  name: string
  slug: string
  image?: string

  // Original Lifepizza fields
  isActive: boolean
  sortOrder: number

  // Compatibility with current code
  active?: boolean

  createdAt: Date
  updatedAt: Date
}

const CategorySchema = new Schema<ICategory>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    image: {
      type: String,
    },

    isActive: {
      type: Boolean,
      default: true,
    },

    sortOrder: {
      type: Number,
      default: 0,
    },

    // Compatibility with the temporary schema
    active: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
)

// ============================================================
// PRODUCT
// ============================================================

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
  isCombo: boolean

  calories?: number
  allergens?: string[]

  customizations?: {
    name: string
    options: {
      label: string
      price: number
    }[]
  }[]

  ratings: {
    avg: number
    count: number
  }

  sortOrder: number

  createdAt: Date
  updatedAt: Date
}

const ProductSchema = new Schema<IProduct>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    description: {
      type: String,
      required: true,
    },

    price: {
      type: Number,
      required: true,
      min: 0,
    },

    discountedPrice: {
      type: Number,
      min: 0,
    },

    category: {
      type: Schema.Types.ObjectId,
      ref: 'Category',
      required: true,
    },

    images: [
      {
        type: String,
      },
    ],

    tags: [
      {
        type: String,
      },
    ],

    isVeg: {
      type: Boolean,
      default: false,
    },

    isAvailable: {
      type: Boolean,
      default: true,
    },

    isFeatured: {
      type: Boolean,
      default: false,
    },

    isBestseller: {
      type: Boolean,
      default: false,
    },

    isSpicy: {
      type: Boolean,
      default: false,
    },

    calories: {
      type: Number,
    },

    allergens: [
      {
        type: String,
      },
    ],

    isCombo: {
      type: Boolean,
      default: false,
    },

    customizations: [
      {
        name: {
          type: String,
        },

        options: [
          {
            label: {
              type: String,
            },

            price: {
              type: Number,
            },
          },
        ],
      },
    ],

    ratings: {
      avg: {
        type: Number,
        default: 0,
      },

      count: {
        type: Number,
        default: 0,
      },
    },

    sortOrder: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
)

// ============================================================
// ORDER
// ============================================================

export type OrderStatus =
  | 'pending'
  | 'confirmed'
  | 'preparing'
  | 'out_for_delivery'
  | 'delivered'
  | 'cancelled'

export interface IOrderItem {
  product: Types.ObjectId
  name: string
  image: string
  price: number
  qty: number
  customizations?: string
}

export interface IOrder extends Document {
  orderNumber: string

  user: Types.ObjectId

  items: IOrderItem[]

  address: {
    line1: string
    city: string
    pincode: string
    landmark?: string
    state?: string
  }

  status: OrderStatus

  statusHistory: {
    status: OrderStatus
    time: Date
    note?: string
  }[]

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
    location?: {
      lat: number
      lng: number
    }
  }

  estimatedDelivery?: Date
  scheduledFor?: Date

  specialInstructions?: string
  couponCode?: string

  rating?: {
    score: number
    comment: string
    deliveryScore?: number
  }

  createdAt: Date
  updatedAt: Date
}

const OrderSchema = new Schema<IOrder>(
  {
    orderNumber: {
      type: String,
      unique: true,
      index: true,
    },

    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    items: [
      {
        product: {
          type: Schema.Types.ObjectId,
          ref: 'Product',
        },

        name: {
          type: String,
        },

        image: {
          type: String,
        },

        price: {
          type: Number,
        },

        qty: {
          type: Number,
          min: 1,
        },

        customizations: {
          type: String,
        },
      },
    ],

    address: {
      line1: String,
      city: String,
      pincode: String,
      landmark: String,
      state: String,
    },

    status: {
      type: String,
      enum: [
        'pending',
        'confirmed',
        'preparing',
        'out_for_delivery',
        'delivered',
        'cancelled',
      ],
      default: 'pending',
      index: true,
    },

    statusHistory: [
      {
        status: {
          type: String,
        },

        time: {
          type: Date,
          default: Date.now,
        },

        note: {
          type: String,
        },
      },
    ],

    subtotal: {
      type: Number,
    },

    deliveryFee: {
      type: Number,
      default: 0,
    },

    tax: {
      type: Number,
      default: 0,
    },

    discount: {
      type: Number,
      default: 0,
    },

    total: {
      type: Number,
    },

    payment: {
      method: {
        type: String,
        enum: ['razorpay', 'cod'],
        default: 'cod',
      },

      status: {
        type: String,
        enum: ['pending', 'paid', 'failed', 'refunded'],
        default: 'pending',
      },

      razorpayOrderId: {
        type: String,
      },

      razorpayPaymentId: {
        type: String,
      },

      razorpaySignature: {
        type: String,
      },

      paidAt: {
        type: Date,
      },
    },

    deliveryAgent: {
      name: String,
      phone: String,

      location: {
        lat: Number,
        lng: Number,
      },
    },

    estimatedDelivery: {
      type: Date,
    },

    scheduledFor: {
      type: Date,
    },

    specialInstructions: {
      type: String,
    },

    couponCode: {
      type: String,
    },

    rating: {
      score: Number,
      comment: String,
      deliveryScore: Number,
    },
  },
  {
    timestamps: true,
  }
)

// Automatically generate order number for new orders
OrderSchema.pre('save', async function (next) {
  if (!this.orderNumber) {
    const count = await mongoose.model('Order').countDocuments()

    this.orderNumber = `LPZ${String(count + 1).padStart(5, '0')}`
  }

  next()
})

// ============================================================
// REVIEW
// ============================================================

const ReviewSchema = new Schema(
  {
    product: {
      type: Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
    },

    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    order: {
      type: Schema.Types.ObjectId,
      ref: 'Order',
    },

    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },

    comment: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
)

// ============================================================
// COUPON
// ============================================================

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

const CouponSchema = new Schema<ICoupon>(
  {
    code: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
    },

    type: {
      type: String,
      enum: ['percent', 'flat'],
      required: true,
    },

    value: {
      type: Number,
      required: true,
    },

    minOrder: {
      type: Number,
      default: 0,
    },

    maxDiscount: {
      type: Number,
    },

    usageLimit: {
      type: Number,
      default: 100,
    },

    usedCount: {
      type: Number,
      default: 0,
    },

    expiresAt: {
      type: Date,
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
)

// ============================================================
// NEWSLETTER
// ============================================================

const NewsletterSchema = new Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    active: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
)

// ============================================================
// STORE SETTINGS
// ============================================================

export interface IStoreSettings extends Document {
  key: string

  taxRate: number
  deliveryFee: number
  freeDeliveryMin: number
  minOrder: number

  phone: string
  whatsapp: string
  adminNotifyPhone: string

  city: string

  openHour: number
  closeHour: number

  // Compatibility fields
  address?: string
  deliveryRadius?: number
  isOpen: boolean
  openingTime?: string
  closingTime?: string

  createdAt: Date
  updatedAt: Date
}

const StoreSettingsSchema = new Schema<IStoreSettings>(
  {
    key: {
      type: String,
      default: 'store',
      unique: true,
    },

    taxRate: {
      type: Number,
      default: 0.05,
      min: 0,
      max: 0.3,
    },

    deliveryFee: {
      type: Number,
      default: 40,
      min: 0,
      max: 500,
    },

    freeDeliveryMin: {
      type: Number,
      default: 299,
      min: 0,
    },

    minOrder: {
      type: Number,
      default: 99,
      min: 0,
    },

    phone: {
      type: String,
      default: '',
    },

    whatsapp: {
      type: String,
      default: '',
    },

    adminNotifyPhone: {
      type: String,
      default: '',
    },

    city: {
      type: String,
      default: 'bijawar',
    },

    openHour: {
      type: Number,
      default: 10,
      min: 0,
      max: 23,
    },

    closeHour: {
      type: Number,
      default: 23,
      min: 1,
      max: 24,
    },

    // Compatibility fields
    address: {
      type: String,
    },

    deliveryRadius: {
      type: Number,
    },

    isOpen: {
      type: Boolean,
      default: true,
    },

    openingTime: {
      type: String,
    },

    closingTime: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
)

// ============================================================
// OTP SESSION
// ============================================================

const OtpSessionSchema = new Schema(
  {
    phone: {
      type: String,
      required: true,
      index: true,
    },

    otpHash: {
      type: String,
      required: true,
    },

    name: {
      type: String,
      default: '',
    },

    purpose: {
      type: String,
      enum: ['login', 'link_phone'],
      default: 'login',
    },

    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },

    attempts: {
      type: Number,
      default: 0,
    },

    verified: {
      type: Boolean,
      default: false,
    },

    expiresAt: {
      type: Date,
      required: true,
    },
  },
  {
    timestamps: true,
  }
)

OtpSessionSchema.index(
  { expiresAt: 1 },
  { expireAfterSeconds: 0 }
)

// ============================================================
// PUSH SUBSCRIPTION
// Web Push — Admin Order Notifications
// ============================================================

export interface IPushSubscription extends Document {
  endpoint: string

  keys: {
    p256dh: string
    auth: string
  }

  user: Types.ObjectId

  role: 'admin' | 'user'

  createdAt: Date
  updatedAt: Date
}

const PushSubscriptionSchema = new Schema<IPushSubscription>(
  {
    endpoint: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },

    keys: {
      p256dh: {
        type: String,
        required: true,
      },

      auth: {
        type: String,
        required: true,
      },
    },

    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },

    role: {
      type: String,
      enum: ['admin', 'user'],
      required: true,
      index: true,
    },
  },
  {
    timestamps: true,
  }
)

// ============================================================
// MODEL EXPORTS
// ============================================================

export const User =
  mongoose.models.User ||
  mongoose.model<IUser>('User', UserSchema)

export const Category =
  mongoose.models.Category ||
  mongoose.model<ICategory>('Category', CategorySchema)

export const Product =
  mongoose.models.Product ||
  mongoose.model<IProduct>('Product', ProductSchema)

export const Order =
  mongoose.models.Order ||
  mongoose.model<IOrder>('Order', OrderSchema)

export const Review =
  mongoose.models.Review ||
  mongoose.model('Review', ReviewSchema)

export const Coupon =
  mongoose.models.Coupon ||
  mongoose.model<ICoupon>('Coupon', CouponSchema)

export const Newsletter =
  mongoose.models.Newsletter ||
  mongoose.model('Newsletter', NewsletterSchema)

export const StoreSettings =
  mongoose.models.StoreSettings ||
  mongoose.model<IStoreSettings>('StoreSettings', StoreSettingsSchema)

export const OtpSession =
  mongoose.models.OtpSession ||
  mongoose.model('OtpSession', OtpSessionSchema)

export const PushSubscription =
  mongoose.models.PushSubscription ||
  mongoose.model<IPushSubscription>(
    'PushSubscription',
    PushSubscriptionSchema
  )

