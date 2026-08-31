import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";
import { partyTypeValidator, handoverStatusValidator } from "./schema";

export const list = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];
    // Get user's shipment IDs to scope handovers
    const userShipments = await ctx.db
      .query("shipments")
      .withIndex("by_createdBy", (q) => q.eq("createdBy", userId))
      .collect();
    const userShipmentIds = new Set(userShipments.map((s) => s.shipmentId));
    const allHandovers = await ctx.db.query("handovers").order("desc").collect();
    return allHandovers.filter((h) => userShipmentIds.has(h.shipmentId));
  },
});

export const getByShipment = query({
  args: { shipmentDocId: v.id("shipments") },
  handler: async (ctx, args) => {
    // Verify user owns this shipment
    const userId = await getAuthUserId(ctx);
    const shipment = await ctx.db.get(args.shipmentDocId);
    if (!shipment) return [];
    if (userId && shipment.createdBy && shipment.createdBy !== userId) return [];

    return await ctx.db
      .query("handovers")
      .withIndex("by_shipmentDoc", (q) =>
        q.eq("shipmentDocId", args.shipmentDocId),
      )
      .order("asc")
      .collect();
  },
});

export const create = mutation({
  args: {
    shipmentDocId: v.id("shipments"),
    fromParty: v.string(),
    fromPartyId: v.string(),
    fromPartyType: partyTypeValidator,
    toParty: v.string(),
    toPartyId: v.string(),
    toPartyType: partyTypeValidator,
    location: v.string(),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("You must be signed in");

    const shipment = await ctx.db.get(args.shipmentDocId);
    if (!shipment) {
      throw new Error("Shipment not found");
    }
    if (shipment.createdBy && shipment.createdBy !== userId) {
      throw new Error("Shipment not found");
    }

    // Validate that the shipment is currently with the fromParty
    if (shipment.currentResponsiblePartyId !== args.fromPartyId) {
      throw new Error(
        `Shipment is currently with "${shipment.currentResponsibleParty}", not "${args.fromParty}". Cannot handover.`,
      );
    }

    // Validate not handing over to self
    if (args.fromPartyId === args.toPartyId) {
      throw new Error("Cannot handover a shipment to the same party.");
    }

    // Validate shipment is not already delivered
    if (shipment.status === "DELIVERED") {
      throw new Error("Cannot handover a delivered shipment.");
    }

    const now = Date.now();
    const handoverId = await ctx.db.insert("handovers", {
      shipmentId: shipment.shipmentId,
      shipmentDocId: args.shipmentDocId,
      fromParty: args.fromParty,
      fromPartyId: args.fromPartyId,
      fromPartyType: args.fromPartyType,
      toParty: args.toParty,
      toPartyId: args.toPartyId,
      toPartyType: args.toPartyType,
      timestamp: now,
      location: args.location,
      handoverStatus: "PENDING",
      notes: args.notes,
      createdAt: now,
      createdBy: userId,
    });

    return handoverId;
  },
});

export const accept = mutation({
  args: {
    id: v.id("handovers"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("You must be signed in");

    const handover = await ctx.db.get(args.id);
    if (!handover) {
      throw new Error("Handover not found");
    }

    // Verify user owns the shipment
    const shipment = await ctx.db.get(handover.shipmentDocId);
    if (!shipment) throw new Error("Shipment not found");
    if (shipment.createdBy && shipment.createdBy !== userId) throw new Error("Handover not found");

    if (handover.handoverStatus !== "PENDING") {
      throw new Error(
        `Handover is already ${handover.handoverStatus}. Only PENDING handovers can be accepted.`,
      );
    }

    // Update handover status
    await ctx.db.patch(args.id, { handoverStatus: "ACCEPTED" });

    // Update shipment's current responsible party
    await ctx.db.patch(handover.shipmentDocId, {
      currentResponsibleParty: handover.toParty,
      currentResponsiblePartyId: handover.toPartyId,
      currentResponsiblePartyType: handover.toPartyType,
      currentLocation: handover.location,
      updatedAt: Date.now(),
    });

    return args.id;
  },
});

export const reject = mutation({
  args: {
    id: v.id("handovers"),
    reason: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("You must be signed in");

    const handover = await ctx.db.get(args.id);
    if (!handover) {
      throw new Error("Handover not found");
    }

    // Verify user owns the shipment
    const shipment = await ctx.db.get(handover.shipmentDocId);
    if (!shipment) throw new Error("Shipment not found");
    if (shipment.createdBy && shipment.createdBy !== userId) throw new Error("Handover not found");

    if (handover.handoverStatus !== "PENDING") {
      throw new Error(
        `Handover is already ${handover.handoverStatus}. Only PENDING handovers can be rejected.`,
      );
    }

    await ctx.db.patch(args.id, { handoverStatus: "REJECTED" });
    return args.id;
  },
});

export const pendingCount = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return 0;

    const userShipments = await ctx.db
      .query("shipments")
      .withIndex("by_createdBy", (q) => q.eq("createdBy", userId))
      .collect();
    const userShipmentIds = new Set(userShipments.map((s) => s.shipmentId));

    const pending = await ctx.db
      .query("handovers")
      .withIndex("by_status", (q) => q.eq("handoverStatus", "PENDING"))
      .collect();
    return pending.filter((h) => userShipmentIds.has(h.shipmentId)).length;
  },
});
