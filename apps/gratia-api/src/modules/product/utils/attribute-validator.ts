import { z } from "zod";
import type { AttributeDefinition } from "../../../db/schema/category-attribute-template.schema";

/**
 * Create attribute validation schema based on category template
 */
export function createAttributeValidationSchema(
  attributeDefinitions: AttributeDefinition[]
): z.ZodObject<any> {
  const schemaShape: Record<string, z.ZodTypeAny> = {};

  for (const def of attributeDefinitions) {
    let fieldSchema: z.ZodTypeAny;

    switch (def.type) {
      case "string":
        fieldSchema = z.string();
        break;

      case "number":
        let numSchema = z.number();
        if (def.min !== undefined) {
          numSchema = numSchema.min(def.min);
        }
        if (def.max !== undefined) {
          numSchema = numSchema.max(def.max);
        }
        fieldSchema = numSchema;
        break;

      case "boolean":
        fieldSchema = z.boolean();
        break;

      case "enum":
        if (!def.enumValues || def.enumValues.length === 0) {
          throw new Error(`Enum values required for attribute: ${def.key}`);
        }
        // Zod enum requires at least one value
        fieldSchema = z.enum(
          def.enumValues as [string, ...string[]]
        ) as z.ZodTypeAny;
        break;

      default:
        throw new Error(`Unknown attribute type: ${def.type}`);
    }

    // Required/optional handling
    if (def.required) {
      schemaShape[def.key] = fieldSchema;
    } else {
      schemaShape[def.key] = fieldSchema.optional();
    }

    // Default value handling
    if (def.defaultValue !== undefined) {
      schemaShape[def.key] = fieldSchema.default(def.defaultValue);
    }
  }

  return z.object(schemaShape);
}

/**
 * Validate product attributes based on category template
 */
export function validateProductAttributes(
  attributes: Record<string, any>,
  attributeDefinitions: AttributeDefinition[]
): { valid: boolean; errors: string[] } {
  if (attributeDefinitions.length === 0) {
    // If template is not present, attributes can be empty or any other value
    return { valid: true, errors: [] };
  }

  try {
    const schema = createAttributeValidationSchema(attributeDefinitions);
    schema.parse(attributes);
    return { valid: true, errors: [] };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        valid: false,
        errors: error.issues.map((e) => `${e.path.join(".")}: ${e.message}`),
      };
    }
    return { valid: false, errors: [String(error)] };
  }
}

/**
 * Check if required attributes are present
 */
export function validateRequiredAttributes(
  attributes: Record<string, any>,
  attributeDefinitions: AttributeDefinition[]
): { valid: boolean; missing: string[] } {
  const requiredKeys = attributeDefinitions
    .filter((def) => def.required)
    .map((def) => def.key);

  const missing = requiredKeys.filter(
    (key) => attributes[key] === undefined || attributes[key] === null
  );

  return {
    valid: missing.length === 0,
    missing,
  };
}
