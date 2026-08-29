import { v } from "convex/values";
import { query, mutation } from "./_generated/server";

export const list = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("transporters").order("desc").collect();
  },
});

export const get = query({
  args: { id: v.id("transporters") },
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
    vehicleType: v.string(),
  },
  handler: async (ctx, args) => {
    const name = args.name.trim();
    const code = args.code?.trim() || "";
    if (!name) throw new Error("Transporter name cannot be empty");
    if (!code) throw new Error("Transporter ID cannot be empty");
    if (!args.contactPerson.trim()) throw new Error("Contact person cannot be empty");

    const normalizedCode = code.toLowerCase();
    const existing = await ctx.db
      .query("transporters")
      .withIndex("by_code", (q) => q.eq("code", normalizedCode))
      .first();
    if (existing) {
      throw new Error(`Transporter ID "${code}" already exists. Please use a unique Transporter ID.`);
    }

    return await ctx.db.insert("transporters", {
      name,
      code: normalizedCode,
      contactPerson: args.contactPerson.trim(),
      email: args.email.trim(),
      phone: args.phone.trim(),
      address: args.address.trim(),
      city: args.city.trim(),
      country: args.country.trim(),
      vehicleType: args.vehicleType.trim(),
      createdAt: Date.now(),
    });
  },
});

export const update = mutation({
  args: {
    id: v.id("transporters"),
    name: v.string(),
    code: v.optional(v.string()),
    contactPerson: v.string(),
    email: v.string(),
    phone: v.string(),
    address: v.string(),
    city: v.string(),
    country: v.string(),
    vehicleType: v.string(),
  },
  handler: async (ctx, args) => {
    const name = args.name.trim();
    const code = args.code?.trim() || "";
    if (!name) throw new Error("Transporter name cannot be empty");
    if (!code) throw new Error("Transporter ID cannot be empty");

    const normalizedCode = code.toLowerCase();
    const existing = await ctx.db
      .query("transporters")
      .withIndex("by_code", (q) => q.eq("code", normalizedCode))
      .first();
    if (existing && existing._id !== args.id) {
      throw new Error(`Transporter ID "${code}" already exists. Please use a unique Transporter ID.`);
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
      vehicleType: data.vehicleType.trim(),
    });
    return id;
  },
});

export const remove = mutation({
  args: { id: v.id("transporters") },
  handler: async (ctx, args) => {
    const transporter = await ctx.db.get(args.id);
    if (!transporter) throw new Error("Transporter not found");

    const srcShipments = await ctx.db
      .query("shipments")
      .withIndex("by_source", (q) => q.eq("sourceType", "TRANSPORTER").eq("sourceId", args.id))
      .first();
    if (srcShipments) {
      throw new Error("Cannot delete this transporter because it is referenced by existing shipments.");
    }

    const destShipments = await ctx.db
      .query("shipments")
      .withIndex("by_destination", (q) => q.eq("destinationType", "TRANSPORTER").eq("destinationId", args.id))
      .first();
    if (destShipments) {
      throw new Error("Cannot delete this transporter because it is referenced by existing shipments.");
    }

    await ctx.db.delete(args.id);
    return args.id;
  },
});
