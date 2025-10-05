import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const list = query({
  args: {
    activeOnly: v.optional(v.boolean()),
  },
  handler: async (ctx, { activeOnly }) => {
    if (activeOnly) {
      return await ctx.db
        .query("products")
        .withIndex("by_active", (q) => q.eq("active", true))
        .collect();
    }
    
    return await ctx.db.query("products").collect();
  },
});

export const get = query({
  args: { id: v.id("products") },
  handler: async (ctx, { id }) => {
    return await ctx.db.get(id);
  },
});

export const getBySku = query({
  args: { sku: v.string() },
  handler: async (ctx, { sku }) => {
    return await ctx.db
      .query("products")
      .withIndex("by_sku", (q) => q.eq("sku", sku))
      .first();
  },
});

export const create = mutation({
  args: {
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
    weightUnit: v.union(v.literal("oz"), v.literal("lb"), v.literal("g"), v.literal("kg")),
    length: v.number(),
    width: v.number(),
    height: v.number(),
    dimensionUnit: v.union(v.literal("in"), v.literal("ft"), v.literal("cm"), v.literal("mm"), v.literal("m")),
    countryOfOrigin: v.optional(v.string()),
    hsTariffCode: v.optional(v.string()),
    lotTracked: v.optional(v.boolean()),
    serialTracked: v.optional(v.boolean()),
    expirationTracked: v.optional(v.boolean()),
    minStockLevel: v.optional(v.number()),
    maxStockLevel: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("products")
      .withIndex("by_sku", (q) => q.eq("sku", args.sku))
      .first();
    
    if (existing) {
      throw new Error(`Product with SKU "${args.sku}" already exists`);
    }
    
    const productId = await ctx.db.insert("products", {
      ...args,
      lotTracked: args.lotTracked ?? false,
      serialTracked: args.serialTracked ?? false,
      expirationTracked: args.expirationTracked ?? false,
      active: true,
    });
    
    return productId;
  },
});

export const update = mutation({
  args: {
    id: v.id("products"),
    sku: v.optional(v.string()),
    upc: v.optional(v.string()),
    title: v.optional(v.string()),
    description: v.optional(v.string()),
    productType: v.optional(
      v.union(
        v.literal("rigid"),
        v.literal("textile"),
        v.literal("fragile"),
        v.literal("perishable"),
        v.literal("hazmat"),
        v.literal("liquid"),
        v.literal("other")
      )
    ),
    weight: v.optional(v.number()),
    weightUnit: v.optional(v.union(v.literal("oz"), v.literal("lb"), v.literal("g"), v.literal("kg"))),
    length: v.optional(v.number()),
    width: v.optional(v.number()),
    height: v.optional(v.number()),
    dimensionUnit: v.optional(v.union(v.literal("in"), v.literal("ft"), v.literal("cm"), v.literal("mm"), v.literal("m"))),
    countryOfOrigin: v.optional(v.string()),
    hsTariffCode: v.optional(v.string()),
    lotTracked: v.optional(v.boolean()),
    serialTracked: v.optional(v.boolean()),
    expirationTracked: v.optional(v.boolean()),
    minStockLevel: v.optional(v.number()),
    maxStockLevel: v.optional(v.number()),
    active: v.optional(v.boolean()),
  },
  handler: async (ctx, { id, ...updates }) => {
    const product = await ctx.db.get(id);
    if (!product) {
      throw new Error("Product not found");
    }
    
    if (updates.sku && updates.sku !== product.sku) {
      const existing = await ctx.db
        .query("products")
        .withIndex("by_sku", (q) => q.eq("sku", updates.sku!))
        .first();
      
      if (existing && existing._id !== id) {
        throw new Error(`Product with SKU "${updates.sku}" already exists`);
      }
    }
    
    await ctx.db.patch(id, updates);
  },
});

export const remove = mutation({
  args: { id: v.id("products") },
  handler: async (ctx, { id }) => {
    await ctx.db.delete(id);
  },
});

export const toggleActive = mutation({
  args: { id: v.id("products") },
  handler: async (ctx, { id }) => {
    const product = await ctx.db.get(id);
    if (!product) {
      throw new Error("Product not found");
    }
    await ctx.db.patch(id, { active: !product.active });
  },
});
