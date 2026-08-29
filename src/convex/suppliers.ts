import { v } from "convex/values";
import { query, mutation } from "./_generated/server";

export const list = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("suppliers").order("desc").collect();
  },
});

export const get = query({
  args: { id: v.id("suppliers") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

export const create = mutation({
  args: {
    name: v.string(),
    code: v.optional(v.string()),
    contactPerson: v.string(),
    email: v.string(),
    phone: v.string(),
    address: v.string(),
    city: v.string(),
    country: v.string(),
  },
  handler: async (ctx, args) => {
    const name = args.name.trim();
    const code = args.code?.trim() || "";
    if (!name) throw new Error("Supplier name cannot be empty");
    if (!code) throw new Error("Supplier ID cannot be empty");
    if (!args.contactPerson.trim()) throw new Error("Contact person cannot be empty");
    if (!args.email.trim()) throw new Error("Email cannot be empty");
    if (!args.phone.trim()) throw new Error("Phone cannot be empty");

    const normalizedCode = code.toLowerCase();
    const existing = await ctx.db
      .query("suppliers")
      .withIndex("by_code", (q) => q.eq("code", normalizedCode))
      .first();
    if (existing) {
      throw new Error(`Supplier ID "${code}" already exists. Please use a unique Supplier ID.`);
    }

    return await ctx.db.insert("suppliers", {
      name,
      code: normalizedCode,
      contactPerson: args.contactPerson.trim(),
      email: args.email.trim(),
      phone: args.phone.trim(),
      address: args.address.trim(),
      city: args.city.trim(),
      country: args.country.trim(),
      createdAt: Date.now(),
    });
  },
});

export const update = mutation({
  args: {
    id: v.id("suppliers"),
    name: v.string(),
    code: v.optional(v.string()),
    contactPerson: v.string(),
    email: v.string(),
    phone: v.string(),
    address: v.string(),
    city: v.string(),
    country: v.string(),
  },
  handler: async (ctx, args) => {
    const name = args.name.trim();
    const code = args.code?.trim() || "";
    if (!name) throw new Error("Supplier name cannot be empty");
    if (!code) throw new Error("Supplier ID cannot be empty");

    const normalizedCode = code.toLowerCase();
    const existing = await ctx.db
      .query("suppliers")
      .withIndex("by_code", (q) => q.eq("code", normalizedCode))
      .first();
    if (existing && existing._id !== args.id) {
      throw new Error(`Supplier ID "${code}" already exists. Please use a unique Supplier ID.`);
    }

    const { id, ...data } = args;
    await ctx.db.patch(id, {
      name,
      code: normalizedCode,
      contactPerson: data.contactPerson.trim(),
      email: data.email.trim(),
      phone: data.phone.trim(),
      address: data.address.trim(),
      city: data.city.trim(),
      country: data.country.trim(),
    });
    return id;
  },
});

export const remove = mutation({
  args: { id: v.id("suppliers") },
  handler: async (ctx, args) => {
    const supplier = await ctx.db.get(args.id);
    if (!supplier) throw new Error("Supplier not found");

    // Check if referenced by any shipments
    const shipments = await ctx.db
      .query("shipments")
      .withIndex("by_source", (q) => q.eq("sourceType", "SUPPLIER").eq("sourceId", args.id))
      .first();
    if (shipments) {
      throw new Error("Cannot delete this supplier because it is referenced by existing shipments.");
    }

    await ctx.db.delete(args.id);
    return args.id;
  },
});
