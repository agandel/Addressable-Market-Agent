/** Minimal Zod-to-JSON-Schema converter for tool input_schema generation. */

import { z } from "zod";

export function zodToJsonSchema(schema: z.ZodType<unknown>): Record<string, unknown> {
  return convertSchema(schema);
}

function convertSchema(schema: z.ZodType<unknown>): Record<string, unknown> {
  const def = (schema as unknown as { _def: Record<string, unknown> })._def;
  const typeName = def.typeName as string;

  switch (typeName) {
    case "ZodObject": {
      const shape = (schema as z.ZodObject<z.ZodRawShape>).shape;
      const properties: Record<string, unknown> = {};
      const required: string[] = [];

      for (const [key, value] of Object.entries(shape)) {
        const fieldSchema = value as z.ZodType<unknown>;
        properties[key] = convertSchema(fieldSchema);
        if (!isOptional(fieldSchema)) {
          required.push(key);
        }
      }

      const result: Record<string, unknown> = {
        type: "object",
        properties,
      };
      if (required.length > 0) {
        result.required = required;
      }
      return result;
    }

    case "ZodString": {
      const result: Record<string, unknown> = { type: "string" };
      if (def.description) result.description = def.description;
      return result;
    }

    case "ZodNumber": {
      const result: Record<string, unknown> = { type: "number" };
      if (def.description) result.description = def.description;
      return result;
    }

    case "ZodBoolean":
      return { type: "boolean" };

    case "ZodArray": {
      const innerType = (def as Record<string, unknown>).type as z.ZodType<unknown>;
      return {
        type: "array",
        items: convertSchema(innerType),
      };
    }

    case "ZodNullable": {
      const inner = convertSchema(
        (def as Record<string, unknown>).innerType as z.ZodType<unknown>,
      );
      return { ...inner, nullable: true };
    }

    case "ZodOptional": {
      return convertSchema(
        (def as Record<string, unknown>).innerType as z.ZodType<unknown>,
      );
    }

    case "ZodDefault": {
      const innerSchema = convertSchema(
        (def as Record<string, unknown>).innerType as z.ZodType<unknown>,
      );
      return { ...innerSchema, default: (def as Record<string, unknown>).defaultValue };
    }

    case "ZodEnum": {
      return {
        type: "string",
        enum: (def as Record<string, unknown>).values,
      };
    }

    default:
      return { type: "string" };
  }
}

function isOptional(schema: z.ZodType<unknown>): boolean {
  const def = (schema as unknown as { _def: Record<string, unknown> })._def;
  const typeName = def.typeName as string;

  if (typeName === "ZodOptional") return true;
  if (typeName === "ZodNullable") {
    return isOptional(
      (def as Record<string, unknown>).innerType as z.ZodType<unknown>,
    );
  }
  return false;
}
