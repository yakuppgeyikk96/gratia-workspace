import Vendor, { VendorDoc } from "../../../shared/models/vendor.model";
import { CreateVendorDto } from "../validations/vendor.validations";

export const createVendor = async (
  vendorData: CreateVendorDto
): Promise<VendorDoc> => {
  const vendor = new Vendor(vendorData);
  return await vendor.save();
};

export const findVendorById = async (
  id: string
): Promise<VendorDoc | null> => {
  return await Vendor.findById(id);
};

export const findVendorBySlug = async (
  slug: string
): Promise<VendorDoc | null> => {
  return await Vendor.findOne({ storeSlug: slug.toLowerCase() });
};

export const findVendorByUserId = async (
  userId: string
): Promise<VendorDoc | null> => {
  return await Vendor.findOne({ userId });
};

export const findAllVendors = async (): Promise<VendorDoc[]> => {
  return await Vendor.find().sort({ createdAt: -1 });
};

export const findActiveVendors = async (): Promise<VendorDoc[]> => {
  return await Vendor.find({ isActive: true }).sort({ "stats.rating": -1 });
};

export const updateVendor = async (
  id: string,
  data: Partial<VendorDoc>
): Promise<VendorDoc | null> => {
  return await Vendor.findByIdAndUpdate(id, data, { new: true });
};