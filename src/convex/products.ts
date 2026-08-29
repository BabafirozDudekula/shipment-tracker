import { v } from "convex/values";
import { query, mutation } from "./_generated/server";

export const list = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("products").order("desc").collect();
  },
});

export const get = query({
  args: { id: v.id("products") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

export const create = mutation({
  args: {
    name: v.string(),
    sku: v.string(),
    category: v.string(),
    quantity: v.number(),
    description: v.string(),
    unit: v.string(),
    weight: v.number(),
  },
  handler: async (ctx, args) => {
    // Validate: name and SKU must not be empty
    if (!args.name.trim()) throw new Error("Product name cannot be empty");
    if (!args.sku.trim()) throw new Error("SKU cannot be empty");

    // Validate: quantity cannot be negative
    if (args.quantity < 0) throw new Error("Quantity cannot be negative");

    // Check for duplicate SKU
    const existing = await ctx.db
      .query("products")
      .withIndex("by_sku", (q) => q.eq("sku", args.sku.trim()))
      .first();
    if (existing) {
      throw new Error(`A product with SKU "${args.sku}" already exists`);
    }

    return await ctx.db.insert("products", {
      name: args.name.trim(),
      sku: args.sku.trim(),
      category: args.category.trim(),
      quantity: args.quantity,
      description: args.description.trim(),
      unit: args.unit.trim(),
      weight: args.weight,
      createdAt: Date.now(),
    });
  },
});

export const update = mutation({
  args: {
    id: v.id("products"),
    name: v.string(),
    sku: v.string(),
    category: v.string(),
    quantity: v.number(),
    description: v.string(),
    unit: v.string(),
    weight: v.number(),
  },
  handler: async (ctx, args) => {
    // Validate: name and SKU must not be empty
    if (!args.name.trim()) throw new Error("Product name cannot be empty");
    if (!args.sku.trim()) throw new Error("SKU cannot be empty");

    // Validate: quantity cannot be negative
    if (args.quantity < 0) throw new Error("Quantity cannot be negative");

    // Check for duplicate SKU (exclude the product being updated)
    const existing = await ctx.db
      .query("products")
      .withIndex("by_sku", (q) => q.eq("sku", args.sku.trim()))
      .first();
    if (existing && existing._id !== args.id) {
      throw new Error(`A product with SKU "${args.sku}" already exists`);
    }

    const { id, ...data } = args;
    await ctx.db.patch(id, {
      name: data.name.trim(),
      sku: data.sku.trim(),
      category: data.category.trim(),
      quantity: data.quantity,
      description: data.description.trim(),
      unit: data.unit.trim(),
      weight: data.weight,
    });
    return id;
  },
});

export const remove = mutation({
  args: { id: v.id("products") },
  handler: async (ctx, args) => {
    const product = await ctx.db.get(args.id);
    if (!product) throw new Error("Product not found");

    // Check if any shipments reference this product
    const shipments = await ctx.db.query("shipments").collect();
    if (shipments.some((s) => s.productId === args.id)) {
      throw new Error("Cannot delete this product because it is referenced by existing shipments.");
    }

    await ctx.db.delete(args.id);
    return args.id;
  },
});
