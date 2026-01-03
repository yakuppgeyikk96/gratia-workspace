import mongoose, { Document, ObjectId, Schema } from "mongoose";

export interface VendorStats {
  totalProducts: number;
  totalOrders: number;
  rating: number;
  totalReviews: number;
}

export interface VendorDoc extends Document {
  userId: ObjectId;
  storeName: string;
  storeSlug: string;
  storeDescription?: string;
  email: string;
  phone?: string;
  logo?: string;
  banner?: string;
  stats: VendorStats;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const VendorSchema: Schema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User ID is required"],
      unique: true,
    },
    storeName: {
      type: String,
      required: [true, "Store name is required"],
      trim: true,
      maxlength: [100, "Store name cannot exceed 100 characters"],
    },
    storeSlug: {
      type: String,
      required: [true, "Store slug is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Please enter a valid slug"],
    },
    storeDescription: {
      type: String,
      trim: true,
      maxlength: [500, "Description cannot exceed 500 characters"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      lowercase: true,
      trim: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        "Please enter a valid email",
      ],
    },
    phone: {
      type: String,
      trim: true,
      match: [/^[\+]?[1-9][\d]{0,15}$/, "Please enter a valid phone number"],
    },
    logo: {
      type: String,
      trim: true,
    },
    banner: {
      type: String,
      trim: true,
    },
    stats: {
      totalProducts: {
        type: Number,
        default: 0,
        min: [0, "Total products cannot be negative"],
      },
      totalOrders: {
        type: Number,
        default: 0,
        min: [0, "Total orders cannot be negative"],
      },
      rating: {
        type: Number,
        default: 0,
        min: [0, "Rating cannot be negative"],
        max: [5, "Rating cannot exceed 5"],
      },
      totalReviews: {
        type: Number,
        default: 0,
        min: [0, "Total reviews cannot be negative"],
      },
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for performance
VendorSchema.index({ storeSlug: 1 });
VendorSchema.index({ userId: 1 });
VendorSchema.index({ isActive: 1 });
VendorSchema.index({ "stats.rating": -1 }); // For sorting by rating

export default mongoose.model<VendorDoc>("Vendor", VendorSchema);
