import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";
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
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];
    return await ctx.db
      .query("shipments")
      .withIndex("by_createdBy", (q) => q.eq("createdBy", userId))
      .order("desc")
      .collect();
  },
});

export const get = query({
  args: { id: v.id("shipments") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    const shipment = await ctx.db.get(args.id);
    if (!shipment) return null;
    // Only return if owned by current user
    if (userId && shipment.createdBy && shipment.createdBy !== userId) return null;
    return shipment;
  },
});

export const getByShipmentId = query({
  args: { shipmentId: v.string() },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    const results = await ctx.db
      .query("shipments")
      .withIndex("by_shipmentId", (q) => q.eq("shipmentId", args.shipmentId))
      .collect();
    const shipment = results[0] ?? null;
    if (!shipment) return null;
    if (userId && shipment.createdBy && shipment.createdBy !== userId) return null;
    return shipment;
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
    const userId = await getAuthUserId(ctx);
    if (!userId) return { total: 0, inTransit: 0, delivered: 0, pendingHandovers: 0 };

    const allShipments = await ctx.db
      .query("shipments")
      .withIndex("by_createdBy", (q) => q.eq("createdBy", userId))
      .collect();

    // Get shipment IDs owned by user to filter handovers
    const userShipmentIds = new Set(allShipments.map(s => s.shipmentId));

    const pendingHandovers = await ctx.db
      .query("handovers")
      .withIndex("by_status", (q) => q.eq("handoverStatus", "PENDING"))
      .collect();

    const userPendingHandovers = pendingHandovers.filter(h => userShipmentIds.has(h.shipmentId));

    return {
      total: allShipments.length,
      inTransit: allShipments.filter(
        (s) =>
          s.status === "IN_TRANSIT" ||
          s.status === "SHIPPED" ||
          s.status === "OUT_FOR_DELIVERY",
      ).length,
      delivered: allShipments.filter((s) => s.status === "DELIVERED").length,
      pendingHandovers: userPendingHandovers.length,
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
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("You must be signed in to create a shipment");

    // Validate quantity
    if (args.quantity <= 0) {
      throw new Error("Quantity must be greater than zero.");
    }

    // Validate source != destination (same entity)
    if (args.sourceType === args.destinationType && args.sourceId === args.destinationId) {
      throw new Error("Source and destination cannot be the same entity.");
    }

    // Validate product exists and belongs to user
    const product = await ctx.db.get(args.productId);
    if (!product) {
      throw new Error("Selected product does not exist.");
    }
    if (product.createdBy && product.createdBy !== userId) {
      throw new Error("Selected product does not exist.");
    }

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
      createdBy: userId,
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
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("You must be signed in");

    const shipment = await ctx.db.get(args.id);
    if (!shipment) {
      throw new Error("Shipment not found");
    }
    if (shipment.createdBy && shipment.createdBy !== userId) {
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
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("You must be signed in");

    const shipment = await ctx.db.get(args.id);
    if (!shipment) throw new Error("Shipment not found");
    if (shipment.createdBy && shipment.createdBy !== userId) {
      throw new Error("Shipment not found");
    }

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
