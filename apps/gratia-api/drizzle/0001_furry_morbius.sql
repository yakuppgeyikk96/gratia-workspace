CREATE INDEX "cart_items_cart_id_idx" ON "cart_items" USING btree ("cart_id");--> statement-breakpoint
CREATE INDEX "cart_items_sku_idx" ON "cart_items" USING btree ("sku");--> statement-breakpoint
CREATE INDEX "cart_items_cart_id_sku_idx" ON "cart_items" USING btree ("cart_id","sku");