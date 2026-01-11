import { Vendor } from "../../db/schema/vendor.schema";
import { AppError, ErrorCode } from "../../shared/errors/base.errors";
import { findUserById } from "../user/user.repository";
import { VENDOR_MESSAGES } from "./vendor.constants";
import {
  createVendor,
  findActiveVendors,
  findAllVendors,
  findVendorById,
  findVendorBySlug,
  findVendorByUserId,
  updateVendor,
} from "./vendor.repository";
import type { CreateVendorDto, UpdateVendorDto } from "./vendor.validations";

export const createVendorService = async (
  data: CreateVendorDto
): Promise<Vendor> => {
  const userExists = await findUserById(data.userId);
  if (!userExists) {
    throw new AppError(VENDOR_MESSAGES.USER_NOT_FOUND, ErrorCode.NOT_FOUND);
  }

  /**
   * Check if the vendor slug already exists
   */
  const existingSlug = await findVendorBySlug(data.storeSlug);
  if (existingSlug) {
    throw new AppError(
      VENDOR_MESSAGES.VENDOR_SLUG_ALREADY_EXISTS,
      ErrorCode.DUPLICATE_ENTRY
    );
  }

  /**
   * Check if user already has a vendor account
   */
  const existingUser = await findVendorByUserId(data.userId);
  if (existingUser) {
    throw new AppError(
      VENDOR_MESSAGES.VENDOR_USER_ALREADY_EXISTS,
      ErrorCode.DUPLICATE_ENTRY
    );
  }

  /**
   * Create the vendor
   */
  const vendor = await createVendor({
    userId: data.userId,
    storeName: data.storeName,
    storeSlug: data.storeSlug,
    storeDescription: data.storeDescription,
    email: data.email,
    phone: data.phone,
    logo: data.logo,
    banner: data.banner,
    isActive: data.isActive,
  });

  if (!vendor) {
    throw new AppError(
      VENDOR_MESSAGES.VENDOR_CREATION_FAILED,
      ErrorCode.INTERNAL_SERVER_ERROR
    );
  }

  return vendor;
};

export const getVendorsService = async (): Promise<Vendor[]> => {
  return await findAllVendors();
};

export const getActiveVendorsService = async (): Promise<Vendor[]> => {
  return await findActiveVendors();
};

export const getVendorByIdService = async (id: number): Promise<Vendor> => {
  const vendor = await findVendorById(id);

  if (!vendor) {
    throw new AppError(VENDOR_MESSAGES.VENDOR_NOT_FOUND, ErrorCode.NOT_FOUND);
  }

  return vendor;
};

export const getVendorBySlugService = async (slug: string): Promise<Vendor> => {
  const vendor = await findVendorBySlug(slug);

  if (!vendor) {
    throw new AppError(VENDOR_MESSAGES.VENDOR_NOT_FOUND, ErrorCode.NOT_FOUND);
  }

  return vendor;
};

export const updateVendorService = async (
  id: number,
  data: UpdateVendorDto
): Promise<Vendor> => {
  // Filter out undefined values
  const updateData: Record<string, any> = {};
  if (data.storeName !== undefined) updateData.storeName = data.storeName;
  if (data.storeSlug !== undefined) updateData.storeSlug = data.storeSlug;
  if (data.storeDescription !== undefined)
    updateData.storeDescription = data.storeDescription;
  if (data.email !== undefined) updateData.email = data.email;
  if (data.phone !== undefined) updateData.phone = data.phone;
  if (data.logo !== undefined) updateData.logo = data.logo;
  if (data.banner !== undefined) updateData.banner = data.banner;
  if (data.isActive !== undefined) updateData.isActive = data.isActive;

  const vendor = await updateVendor(id, updateData);

  if (!vendor) {
    throw new AppError(
      VENDOR_MESSAGES.VENDOR_UPDATE_FAILED,
      ErrorCode.INTERNAL_SERVER_ERROR
    );
  }

  return vendor;
};
