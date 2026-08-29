import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { shipmentStatusValidator, partyTypeValidator, VALID_TRANSITIONS } from "./schema";

// Generate a unique shipment ID
function generateShipmentId(): string {
  const prefix = "SHP";
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `${prefix}-${timestamp}-${random}`;
}

export const list = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("shipments").order("desc").collect();
  },
});

export const get = query({
  args: { id: v.id("shipments") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

export const getByShipmentId = query({
  args: { shipmentId: v.string() },
  handler: async (ctx, args) => {
    const results = await ctx.db
      .query("shipments")
      .withIndex("by_shipmentId", (q) => q.eq("shipmentId", args.shipmentId))
      .collect();
    return results[0] ?? null;
  },
});

export const getHandovers = query({
  args: { shipmentId: v.string() },
  handler: async (ctx, args) => {
    const results = await ctx.db
      .query("handovers")
      .withIndex("by_shipment", (q) => q.eq("shipmentId", args.shipmentId))
      .order("asc")
      .collect();
    return results;
  },
});

export const dashboardStats = query({
  args: {},
  handler: async (ctx) => {
    const allShipments = await ctx.db.query("shipments").collect();
    const pendingHandovers = await ctx.db
      .query("handovers")
      .withIndex("by_status", (q) => q.eq("handoverStatus", "PENDING"))
      .collect();

    return {
      total: allShipments.length,
      inTransit: allShipments.filter(
        (s) =>
          s.status === "IN_TRANSIT" ||
          s.status === "SHIPPED" ||
          s.status === "OUT_FOR_DELIVERY",
      ).length,
      delivered: allShipments.filter((s) => s.status === "DELIVERED").length,
      pendingHandovers: pendingHandovers.length,
    };
  },
});

export const create = mutation({
  args: {
    productId: v.id("products"),
    productName: v.string(),
    quantity: v.number(),
    source: v.string(),
    sourceId: v.string(),
    sourceType: partyTypeValidator,
    destination: v.string(),
    destinationId: v.string(),
    destinationType: partyTypeValidator,
    expectedDeliveryDate: v.number(),
  },
  handler: async (ctx, args) => {
    const shipmentId = generateShipmentId();
    const now = Date.now();
    const docId = await ctx.db.insert("shipments", {
      shipmentId,
      productId: args.productId,
      productName: args.productName,
      quantity: args.quantity,
      source: args.source,
      sourceId: args.sourceId,
      sourceType: args.sourceType,
      destination: args.destination,
      destinationId: args.destinationId,
      destinationType: args.destinationType,
      currentLocation: args.source,
      currentResponsibleParty: args.source,
      currentResponsiblePartyId: args.sourceId,
      currentResponsiblePartyType: args.sourceType,
      status: "CREATED",
      expectedDeliveryDate: args.expectedDeliveryDate,
      createdAt: now,
      updatedAt: now,
    });
    return { shipmentId, docId };
  },
});

export const updateStatus = mutation({
  args: {
    id: v.id("shipments"),
    newStatus: shipmentStatusValidator,
  },
  handler: async (ctx, args) => {
    const shipment = await ctx.db.get(args.id);
    if (!shipment) {
      throw new Error("Shipment not found");
    }

    const allowed = VALID_TRANSITIONS[shipment.status];
    if (!allowed || !allowed.includes(args.newStatus)) {
      throw new Error(
        `Invalid transition: ${shipment.status} → ${args.newStatus}. Allowed: ${allowed?.join(", ") || "none"}`,
      );
    }

    await ctx.db.patch(args.id, {
      status: args.newStatus,
      updatedAt: Date.now(),
    });

    return args.id;
  },
});

export const remove = mutation({
  args: { id: v.id("shipments") },
  handler: async (ctx, args) => {
    // Also remove related handovers
    const handovers = await ctx.db
      .query("handovers")
      .withIndex("by_shipmentDoc", (q) => q.eq("shipmentDocId", args.id))
      .collect();

    for (const handover of handovers) {
      await ctx.db.delete(handover._id);
    }

    await ctx.db.delete(args.id);
    return args.id;
  },
});
