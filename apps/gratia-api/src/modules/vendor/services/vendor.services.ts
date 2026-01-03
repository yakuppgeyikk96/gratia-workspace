import { AppError, ErrorCode } from "../../../shared/errors/base.errors";
import { VendorDoc } from "../../../shared/models/vendor.model";
import { VENDOR_MESSAGES } from "../constants";
import {
  createVendor,
  findActiveVendors,
  findAllVendors,
  findVendorById,
  findVendorBySlug,
  findVendorByUserId,
  updateVendor,
} from "../repositories";
import { CreateVendorDto } from "../validations";

export const createVendorService = async (
  data: CreateVendorDto
): Promise<VendorDoc> => {
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
  const vendor = await createVendor(data);
  if (!vendor) {
    throw new AppError(
      VENDOR_MESSAGES.VENDOR_CREATION_FAILED,
      ErrorCode.INTERNAL_SERVER_ERROR
    );
  }

  return vendor;
};

export const getVendorsService = async (): Promise<VendorDoc[]> => {
  return await findAllVendors();
};

export const getActiveVendorsService = async (): Promise<VendorDoc[]> => {
  return await findActiveVendors();
};

export const getVendorByIdService = async (id: string): Promise<VendorDoc> => {
  const vendor = await findVendorById(id);

  if (!vendor) {
    throw new AppError(VENDOR_MESSAGES.VENDOR_NOT_FOUND, ErrorCode.NOT_FOUND);
  }

  return vendor;
};

export const getVendorBySlugService = async (
  slug: string
): Promise<VendorDoc> => {
  const vendor = await findVendorBySlug(slug);

  if (!vendor) {
    throw new AppError(VENDOR_MESSAGES.VENDOR_NOT_FOUND, ErrorCode.NOT_FOUND);
  }

  return vendor;
};

export const updateVendorService = async (
  id: string,
  data: Partial<VendorDoc>
): Promise<VendorDoc> => {
  const vendor = await updateVendor(id, data);

  if (!vendor) {
    throw new AppError(
      VENDOR_MESSAGES.VENDOR_UPDATE_FAILED,
      ErrorCode.INTERNAL_SERVER_ERROR
    );
  }

  return vendor;
};