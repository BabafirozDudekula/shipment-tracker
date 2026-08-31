import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

export const list = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];
    return await ctx.db
      .query("warehouses")
      .withIndex("by_createdBy", (q) => q.eq("createdBy", userId))
      .order("desc")
      .collect();
  },
});

export const get = query({
  args: { id: v.id("warehouses") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    const wh = await ctx.db.get(args.id);
    if (!wh) return null;
    if (userId && wh.createdBy && wh.createdBy !== userId) return null;
    return wh;
  },
});

export const create = mutation({
  args: {
    name: v.string(),
    code: v.string(),
    contactPerson: v.string(),
    email: v.string(),
    phone: v.string(),
    address: v.string(),
    city: v.string(),
    country: v.string(),
    capacity: v.number(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("You must be signed in");

    const name = args.name.trim();
    const code = args.code.trim();
    if (!name) throw new Error("Warehouse name cannot be empty");
    if (!code) throw new Error("Warehouse code cannot be empty");
    if (!args.contactPerson.trim()) throw new Error("Contact person cannot be empty");
    if (args.capacity < 0) throw new Error("Capacity cannot be negative");

    const normalizedCode = code.toLowerCase();

    // Check suppliers
    const existingSupplier = await ctx.db
      .query("suppliers")
      .withIndex("by_code", (q) => q.eq("code", normalizedCode))
      .first();
    if (existingSupplier) {
      throw new Error(`Code "${code}" already exists as a Supplier. Please use a unique code.`);
    }

    // Check transporters
    const existingTransporter = await ctx.db
      .query("transporters")
      .withIndex("by_code", (q) => q.eq("code", normalizedCode))
      .first();
    if (existingTransporter) {
      throw new Error(`Code "${code}" already exists as a Transporter. Please use a unique code.`);
    }

    // Check customers
    const existingCustomer = await ctx.db
      .query("customers")
      .withIndex("by_code", (q) => q.eq("code", normalizedCode))
      .first();
    if (existingCustomer) {
      throw new Error(`Code "${code}" already exists as a Customer. Please use a unique code.`);
    }

    // Check other warehouses
    const allWarehouses = await ctx.db.query("warehouses").collect();
    if (allWarehouses.some((w) => w.code.toLowerCase() === normalizedCode)) {
      throw new Error(`Warehouse ID "${code}" already exists. Please use a unique Warehouse ID.`);
    }

    return await ctx.db.insert("warehouses", {
      name,
      code: normalizedCode,
      contactPerson: args.contactPerson.trim(),
      email: args.email.trim(),
      phone: args.phone.trim(),
      address: args.address.trim(),
      city: args.city.trim(),
      country: args.country.trim(),
      capacity: args.capacity,
      createdAt: Date.now(),
      createdBy: userId,
    });
  },
});

export const update = mutation({
  args: {
    id: v.id("warehouses"),
    name: v.string(),
    code: v.string(),
    contactPerson: v.string(),
    email: v.string(),
    phone: v.string(),
    address: v.string(),
    city: v.string(),
    country: v.string(),
    capacity: v.number(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("You must be signed in");

    const existingWh = await ctx.db.get(args.id);
    if (!existingWh) throw new Error("Warehouse not found");
    if (existingWh.createdBy && existingWh.createdBy !== userId) throw new Error("Warehouse not found");

    const name = args.name.trim();
    const code = args.code.trim();
    if (!name) throw new Error("Warehouse name cannot be empty");
    if (!code) throw new Error("Warehouse code cannot be empty");
    if (args.capacity < 0) throw new Error("Capacity cannot be negative");

    const normalizedCode = code.toLowerCase();

    // Check other warehouses for duplicate
    const allWarehouses = await ctx.db.query("warehouses").collect();
    if (allWarehouses.some((w) => w.code.toLowerCase() === normalizedCode && w._id !== args.id)) {
      throw new Error(`Warehouse ID "${code}" already exists. Please use a unique Warehouse ID.`);
    }

    // Check cross-entity uniqueness
    const existingSupplier = await ctx.db
      .query("suppliers")
      .withIndex("by_code", (q) => q.eq("code", normalizedCode))
      .first();
    if (existingSupplier) {
      throw new Error(`Code "${code}" already exists as a Supplier.`);
    }

    const existingTransporter = await ctx.db
      .query("transporters")
      .withIndex("by_code", (q) => q.eq("code", normalizedCode))
      .first();
    if (existingTransporter) {
      throw new Error(`Code "${code}" already exists as a Transporter.`);
    }

    const existingCustomer = await ctx.db
      .query("customers")
      .withIndex("by_code", (q) => q.eq("code", normalizedCode))
      .first();
    if (existingCustomer) {
      throw new Error(`Code "${code}" already exists as a Customer.`);
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
      capacity: data.capacity,
    });
    return id;
  },
});

export const remove = mutation({
  args: { id: v.id("warehouses") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("You must be signed in");

    const warehouse = await ctx.db.get(args.id);
    if (!warehouse) throw new Error("Warehouse not found");
    if (warehouse.createdBy && warehouse.createdBy !== userId) throw new Error("Warehouse not found");

    const shipments = await ctx.db
      .query("shipments")
      .withIndex("by_source", (q) => q.eq("sourceType", "WAREHOUSE").eq("sourceId", args.id))
      .first();
    if (shipments) {
      throw new Error("Cannot delete this warehouse because it is referenced by existing shipments.");
    }

    const destShipments = await ctx.db
      .query("shipments")
      .withIndex("by_destination", (q) => q.eq("destinationType", "WAREHOUSE").eq("destinationId", args.id))
      .first();
    if (destShipments) {
      throw new Error("Cannot delete this warehouse because it is referenced by existing shipments.");
    }

    await ctx.db.delete(args.id);
    return args.id;
  },
});
