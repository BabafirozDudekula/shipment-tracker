import { authTables } from "@convex-dev/auth/server";
import { defineSchema, defineTable } from "convex/server";
import { Infer, v } from "convex/values";

// Shipment status states
export const SHIPMENT_STATUSES = {
  CREATED: "CREATED",
  PACKED: "PACKED",
  SHIPPED: "SHIPPED",
  IN_TRANSIT: "IN_TRANSIT",
  OUT_FOR_DELIVERY: "OUT_FOR_DELIVERY",
  DELIVERED: "DELIVERED",
} as const;

export const shipmentStatusValidator = v.union(
  v.literal("CREATED"),
  v.literal("PACKED"),
  v.literal("SHIPPED"),
  v.literal("IN_TRANSIT"),
  v.literal("OUT_FOR_DELIVERY"),
  v.literal("DELIVERED"),
);
export type ShipmentStatus = Infer<typeof shipmentStatusValidator>;

// Valid state transitions
export const VALID_TRANSITIONS: Record<string, string[]> = {
  CREATED: ["PACKED"],
  PACKED: ["SHIPPED"],
  SHIPPED: ["IN_TRANSIT"],
  IN_TRANSIT: ["OUT_FOR_DELIVERY"],
  OUT_FOR_DELIVERY: ["DELIVERED"],
  DELIVERED: [],
};

// Handover status
export const HANDOVER_STATUSES = {
  PENDING: "PENDING",
  ACCEPTED: "ACCEPTED",
  REJECTED: "REJECTED",
} as const;

export const handoverStatusValidator = v.union(
  v.literal("PENDING"),
  v.literal("ACCEPTED"),
  v.literal("REJECTED"),
);

// Party type for handovers
export const PARTY_TYPES = {
  SUPPLIER: "SUPPLIER",
  WAREHOUSE: "WAREHOUSE",
  TRANSPORTER: "TRANSPORTER",
  CUSTOMER: "CUSTOMER",
} as const;

export const partyTypeValidator = v.union(
  v.literal("SUPPLIER"),
  v.literal("WAREHOUSE"),
  v.literal("TRANSPORTER"),
  v.literal("CUSTOMER"),
);

const schema = defineSchema(
  {
    ...authTables,

    users: defineTable({
      name: v.optional(v.string()),
      image: v.optional(v.string()),
      email: v.optional(v.string()),
      emailVerificationTime: v.optional(v.number()),
      isAnonymous: v.optional(v.boolean()),
      role: v.optional(
        v.union(
          v.literal("admin"),
          v.literal("user"),
          v.literal("member"),
        ),
      ),
    }).index("email", ["email"]),

    suppliers: defineTable({
      name: v.string(),
      code: v.string(),
      contactPerson: v.string(),
      email: v.string(),
      phone: v.string(),
      address: v.string(),
      city: v.string(),
      country: v.string(),
      createdAt: v.number(),
    }).index("by_code", ["code"]),

    warehouses: defineTable({
      name: v.string(),
      code: v.string(),
      contactPerson: v.string(),
      email: v.string(),
      phone: v.string(),
      address: v.string(),
      city: v.string(),
      country: v.string(),
      capacity: v.number(),
      createdAt: v.number(),
    }),

    transporters: defineTable({
      name: v.string(),
      code: v.string(),
      contactPerson: v.string(),
      email: v.string(),
      phone: v.string(),
      address: v.string(),
      city: v.string(),
      country: v.string(),
      vehicleType: v.string(),
      createdAt: v.number(),
    }).index("by_code", ["code"]),

    customers: defineTable({
      name: v.string(),
      code: v.string(),
      contactPerson: v.string(),
      email: v.string(),
      phone: v.string(),
      address: v.string(),
      city: v.string(),
      country: v.string(),
      createdAt: v.number(),
    }).index("by_code", ["code"]),

    products: defineTable({
      name: v.string(),
      sku: v.string(),
      category: v.string(),
      quantity: v.number(),
      description: v.string(),
      unit: v.string(),
      weight: v.number(),
      createdAt: v.number(),
    }).index("by_sku", ["sku"]),

    shipments: defineTable({
      shipmentId: v.string(),
      productId: v.id("products"),
      productName: v.string(),
      quantity: v.number(),
      source: v.string(),
      sourceId: v.string(),
      sourceType: partyTypeValidator,
      destination: v.string(),
      destinationId: v.string(),
      destinationType: partyTypeValidator,
      currentLocation: v.string(),
      currentResponsibleParty: v.string(),
      currentResponsiblePartyId: v.string(),
      currentResponsiblePartyType: partyTypeValidator,
      status: shipmentStatusValidator,
      expectedDeliveryDate: v.number(),
      createdAt: v.number(),
      updatedAt: v.number(),
    })
      .index("by_shipmentId", ["shipmentId"])
      .index("by_status", ["status"])
      .index("by_source", ["sourceType", "sourceId"])
      .index("by_destination", ["destinationType", "destinationId"])
      .index("by_currentParty", ["currentResponsiblePartyType", "currentResponsiblePartyId"]),

    handovers: defineTable({
      shipmentId: v.string(),
      shipmentDocId: v.id("shipments"),
      fromParty: v.string(),
      fromPartyId: v.string(),
      fromPartyType: partyTypeValidator,
      toParty: v.string(),
      toPartyId: v.string(),
      toPartyType: partyTypeValidator,
      timestamp: v.number(),
      location: v.string(),
      handoverStatus: handoverStatusValidator,
      notes: v.optional(v.string()),
      createdAt: v.number(),
    })
      .index("by_shipment", ["shipmentId"])
      .index("by_shipmentDoc", ["shipmentDocId"])
      .index("by_status", ["handoverStatus"]),
  },
  {
    schemaValidation: false,
  },
);

export default schema;
