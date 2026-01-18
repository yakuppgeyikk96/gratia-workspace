import { Express, Router } from "express";
import authRoutes from "../modules/auth/auth.routes";
import brandRoutes from "../modules/brand/brand.routes";
import { cartRoutes } from "../modules/cart";
import categoryRoutes from "../modules/category/category.routes";
import checkoutRoutes from "../modules/checkout/checkout.routes";
import collectionRoutes from "../modules/collection/collection.routes";
import locationRoutes from "../modules/location/location.routes";
import navigationRoutes from "../modules/navigation/navigation.routes";
import orderRoutes from "../modules/order/order.routes";
import { productRoutes } from "../modules/product";
import vendorRoutes from "../modules/vendor/vendor.routes";
import { authMiddleware } from "../shared/middlewares";

const basePath = "/api";

const router: Router = Router();

export const routesConfig = (app: Express) => {
  router.use("/auth", authRoutes);
  router.use("/categories", categoryRoutes);
  router.use("/collections", collectionRoutes);
  router.use("/products", productRoutes);
  router.use("/vendors", vendorRoutes);
  router.use("/brands", brandRoutes);
  router.use("/navigation", navigationRoutes);

  // Public routes (authenticated and guest users)
  router.use("/checkout", checkoutRoutes);
  router.use("/location", locationRoutes);
  router.use("/orders", orderRoutes);

  // Protected routes
  router.use("/cart", authMiddleware, cartRoutes);

  app.use(`${basePath}`, router);
};
