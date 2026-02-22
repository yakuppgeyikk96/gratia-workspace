"use client";

import { useCallback, useEffect, useState } from "react";
import { useForm, useWatch, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import Button from "@gratia/ui/components/Button";
import FormField from "@gratia/ui/components/FormField";
import Input from "@gratia/ui/components/Input";
import Select from "@gratia/ui/components/Select";
import type { SelectOption } from "@gratia/ui/components/Select";
import Textarea from "@gratia/ui/components/Textarea";
import { useToastContext } from "@gratia/ui/components/Toast";
import { slugify } from "@/lib/utils/slugify";
import type { IAttributeDefinition } from "@/types";
import {
  useBrands,
  useCategories,
  useCategoryAttributeTemplate,
  useCreateProduct,
} from "../hooks";
import {
  createProductFormSchema,
  type CreateProductFormValues,
} from "../validations";
import styles from "./ProductCreateForm.module.scss";

export default function ProductCreateForm() {
  const router = useRouter();
  const { addToast } = useToastContext();
  const [attributes, setAttributes] = useState<Record<string, string>>({});

  const { data: categories, isLoading: categoriesLoading } = useCategories();
  const { data: brands, isLoading: brandsLoading } = useBrands();
  const createProduct = useCreateProduct();

  const {
    register,
    handleSubmit,
    control,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<CreateProductFormValues>({
    resolver: zodResolver(createProductFormSchema),
    defaultValues: {
      name: "",
      slug: "",
      description: "",
      sku: "",
      categoryId: "",
      brandId: "",
      price: "",
      discountedPrice: "",
      stock: "0",
      metaTitle: "",
      metaDescription: "",
      isActive: true,
    },
    mode: "onBlur",
  });

  const nameValue = useWatch({ control, name: "name" });
  const categoryIdValue = useWatch({ control, name: "categoryId" });
  const selectedCategoryId = categoryIdValue ? Number(categoryIdValue) : 0;

  const { data: attributeTemplate } =
    useCategoryAttributeTemplate(selectedCategoryId);

  // Auto-generate slug from name
  useEffect(() => {
    if (nameValue) {
      setValue("slug", slugify(nameValue), { shouldValidate: false });
    }
  }, [nameValue, setValue]);

  const handleCategoryChange = useCallback(
    (value: string, fieldOnChange: (value: string) => void) => {
      fieldOnChange(value);
      setAttributes({});
    },
    [],
  );

  const handleAttributeChange = useCallback(
    (key: string, value: string) => {
      setAttributes((prev) => ({ ...prev, [key]: value }));
    },
    [],
  );

  const categoryOptions: SelectOption[] = (categories ?? []).map((cat) => ({
    label: cat.name,
    value: String(cat.id),
  }));

  const brandOptions: SelectOption[] = (brands ?? []).map((brand) => ({
    label: brand.name,
    value: String(brand.id),
  }));

  const onSubmit = async (formData: CreateProductFormValues) => {
    // Build attributes object from dynamic fields
    const productAttributes: Record<string, unknown> = {};
    if (attributeTemplate?.attributeDefinitions) {
      for (const def of attributeTemplate.attributeDefinitions) {
        const value = attributes[def.key];
        if (value !== undefined && value !== "") {
          if (def.type === "number") {
            productAttributes[def.key] = Number(value);
          } else if (def.type === "boolean") {
            productAttributes[def.key] = value === "true";
          } else {
            productAttributes[def.key] = value;
          }
        }
      }
    }

    const result = await createProduct.mutateAsync({
      name: formData.name,
      slug: formData.slug,
      description: formData.description || undefined,
      sku: formData.sku,
      categoryId: Number(formData.categoryId),
      brandId: formData.brandId ? Number(formData.brandId) : undefined,
      price: formData.price,
      discountedPrice: formData.discountedPrice || undefined,
      stock: parseInt(formData.stock, 10),
      attributes: productAttributes,
      metaTitle: formData.metaTitle || undefined,
      metaDescription: formData.metaDescription || undefined,
      isActive: formData.isActive,
    });

    if (result.success) {
      addToast({
        variant: "success",
        title: "Product Created",
        description: "Your product has been created successfully.",
      });
      router.push("/products");
    } else {
      addToast({
        variant: "error",
        title: "Error",
        description: result.message || "Failed to create product.",
      });
    }
  };

  const renderAttributeFields = (definitions: IAttributeDefinition[]) => {
    return definitions
      .sort((a, b) => a.sortOrder - b.sortOrder)
      .map((def) => {
        if (def.type === "enum" && def.enumValues) {
          const enumOptions: SelectOption[] = def.enumValues.map((val) => ({
            label: val,
            value: val,
          }));

          return (
            <FormField
              key={def.key}
              label={`${def.label}${def.unit ? ` (${def.unit})` : ""}`}
              required={def.required}
            >
              <Select
                items={enumOptions}
                value={attributes[def.key] ?? ""}
                onValueChange={(val) => handleAttributeChange(def.key, val)}
                placeholder={`Select ${def.label.toLowerCase()}`}
              />
            </FormField>
          );
        }

        if (def.type === "boolean") {
          const boolOptions: SelectOption[] = [
            { label: "Yes", value: "true" },
            { label: "No", value: "false" },
          ];

          return (
            <FormField key={def.key} label={def.label} required={def.required}>
              <Select
                items={boolOptions}
                value={attributes[def.key] ?? ""}
                onValueChange={(val) => handleAttributeChange(def.key, val)}
                placeholder={`Select ${def.label.toLowerCase()}`}
              />
            </FormField>
          );
        }

        return (
          <FormField
            key={def.key}
            label={`${def.label}${def.unit ? ` (${def.unit})` : ""}`}
            required={def.required}
          >
            <Input
              type={def.type === "number" ? "number" : "text"}
              value={attributes[def.key] ?? ""}
              onChange={(e) => handleAttributeChange(def.key, e.target.value)}
              placeholder={`Enter ${def.label.toLowerCase()}`}
              min={def.min}
              max={def.max}
            />
          </FormField>
        );
      });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
      {/* Basic Info */}
      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>Basic Information</h2>
        <FormField
          label="Product Name"
          error={errors.name?.message}
          required
        >
          <Input
            {...register("name")}
            placeholder="Enter product name"
            error={!!errors.name}
          />
        </FormField>
        <div className={styles.fieldRow}>
          <FormField label="Slug" error={errors.slug?.message} required>
            <Input
              {...register("slug")}
              placeholder="product-slug"
              error={!!errors.slug}
            />
          </FormField>
          <FormField label="SKU" error={errors.sku?.message} required>
            <Input
              {...register("sku")}
              placeholder="e.g. PROD-001"
              error={!!errors.sku}
            />
          </FormField>
        </div>
        <FormField label="Description" error={errors.description?.message}>
          <Textarea
            {...register("description")}
            placeholder="Enter product description"
            rows={4}
          />
        </FormField>
      </div>

      {/* Classification */}
      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>Classification</h2>
        <div className={styles.fieldRow}>
          <FormField
            label="Category"
            error={errors.categoryId?.message}
            required
          >
            <Controller
              name="categoryId"
              control={control}
              render={({ field }) => (
                <Select
                  items={categoryOptions}
                  value={field.value}
                  onValueChange={(val) =>
                    handleCategoryChange(val, field.onChange)
                  }
                  onBlur={field.onBlur}
                  placeholder={
                    categoriesLoading ? "Loading..." : "Select category"
                  }
                  error={!!errors.categoryId}
                  disabled={categoriesLoading}
                  name={field.name}
                />
              )}
            />
          </FormField>
          <FormField label="Brand" error={errors.brandId?.message}>
            <Controller
              name="brandId"
              control={control}
              render={({ field }) => (
                <Select
                  items={brandOptions}
                  value={field.value ?? ""}
                  onValueChange={field.onChange}
                  onBlur={field.onBlur}
                  placeholder={brandsLoading ? "Loading..." : "Select brand"}
                  disabled={brandsLoading}
                  name={field.name}
                />
              )}
            />
          </FormField>
        </div>
      </div>

      {/* Price & Stock */}
      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>Price & Stock</h2>
        <div className={styles.fieldRow}>
          <FormField label="Price" error={errors.price?.message} required>
            <Input
              {...register("price")}
              placeholder="99.99"
              error={!!errors.price}
            />
          </FormField>
          <FormField
            label="Discounted Price"
            error={errors.discountedPrice?.message}
          >
            <Input
              {...register("discountedPrice")}
              placeholder="79.99"
              error={!!errors.discountedPrice}
            />
          </FormField>
          <FormField label="Stock" error={errors.stock?.message} required>
            <Input
              {...register("stock")}
              type="number"
              placeholder="0"
              min={0}
              error={!!errors.stock}
            />
          </FormField>
        </div>
      </div>

      {/* Attributes */}
      {selectedCategoryId > 0 && (
        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>Product Attributes</h2>
          {attributeTemplate?.attributeDefinitions &&
          attributeTemplate.attributeDefinitions.length > 0 ? (
            <div className={styles.attributeGrid}>
              {renderAttributeFields(
                attributeTemplate.attributeDefinitions,
              )}
            </div>
          ) : (
            <p className={styles.emptyAttributes}>
              No attribute template defined for this category.
            </p>
          )}
        </div>
      )}

      {/* SEO */}
      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>SEO</h2>
        <FormField label="Meta Title" error={errors.metaTitle?.message}>
          <Input
            {...register("metaTitle")}
            placeholder="SEO title (max 60 characters)"
            error={!!errors.metaTitle}
          />
        </FormField>
        <FormField
          label="Meta Description"
          error={errors.metaDescription?.message}
        >
          <Textarea
            {...register("metaDescription")}
            placeholder="SEO description (max 160 characters)"
            rows={3}
          />
        </FormField>
      </div>

      {/* Actions */}
      <div className={styles.actions}>
        <Button
          type="submit"
          disabled={isSubmitting || createProduct.isPending}
        >
          {createProduct.isPending ? "Creating..." : "Create Product"}
        </Button>
        <Button
          type="button"
          variant="outlined"
          onClick={() => router.push("/products")}
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}
