import { Express, Router } from "express";
import authRoutes from "../modules/auth/auth.routes";
import brandRoutes from "../modules/brand/brand.routes";
import { cartRoutes } from "../modules/cart";
import categoryRoutes from "../modules/category/category.routes";
import categoryAttributeTemplateRoutes from "../modules/category-attribute-template/category-attribute-template.routes";
import checkoutRoutes from "../modules/checkout/checkout.routes";
import collectionRoutes from "../modules/collection/collection.routes";
import locationRoutes from "../modules/location/location.routes";
import navigationRoutes from "../modules/navigation/navigation.routes";
import orderRoutes from "../modules/order/order.routes";
import { productRoutes } from "../modules/product";
import seedRoutes from "../modules/seed/seed.routes";
import vendorRoutes from "../modules/vendor/vendor.routes";

const basePath = "/api";

const router: Router = Router();

export const routesConfig = (app: Express) => {
  router.use("/auth", authRoutes);
  router.use("/categories", categoryRoutes);
  router.use("/collections", collectionRoutes);
  router.use("/products", productRoutes);
  router.use("/vendors", vendorRoutes);
  router.use("/brands", brandRoutes);
  router.use(
    "/category-attribute-templates",
    categoryAttributeTemplateRoutes,
  );
  router.use("/navigation", navigationRoutes);
  router.use("/seed", seedRoutes);

  // Public routes (authenticated and guest users)
  router.use("/checkout", checkoutRoutes);
  router.use("/location", locationRoutes);
  router.use("/orders", orderRoutes);

  // Cart routes (guest + authenticated)
  router.use("/cart", cartRoutes);

  app.use(`${basePath}`, router);
};
