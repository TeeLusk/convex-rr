import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  tasks: defineTable({
    text: v.string(),
    isCompleted: v.boolean(),
  }),

  products: defineTable({
    sku: v.string(),
    upc: v.optional(v.string()),
    title: v.string(),
    description: v.optional(v.string()),
    productType: v.union(
      v.literal("rigid"),
      v.literal("textile"),
      v.literal("fragile"),
      v.literal("perishable"),
      v.literal("hazmat"),
      v.literal("liquid"),
      v.literal("other")
    ),
    
    weight: v.number(),
    weightUnit: v.union(
      v.literal("oz"),
      v.literal("lb"),
      v.literal("g"),
      v.literal("kg")
    ),
    
    length: v.number(),
    width: v.number(),
    height: v.number(),
    dimensionUnit: v.union(
      v.literal("in"),
      v.literal("ft"),
      v.literal("cm"),
      v.literal("mm"),
      v.literal("m")
    ),
    
    imageStorageId: v.optional(v.id("_storage")),
    
    countryOfOrigin: v.optional(v.string()),
    hsTariffCode: v.optional(v.string()),
    lotTracked: v.boolean(),
    serialTracked: v.boolean(),
    expirationTracked: v.boolean(),
    minStockLevel: v.optional(v.number()),
    maxStockLevel: v.optional(v.number()),
    
    active: v.boolean(),
  })
    .index("by_sku", ["sku"])
    .index("by_upc", ["upc"])
    .index("by_type", ["productType"])
    .index("by_active", ["active"]),
});
