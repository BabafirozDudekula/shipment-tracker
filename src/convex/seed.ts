import { v } from "convex/values";
import { mutation } from "./_generated/server";

export const seedEntities = mutation({
  args: {},
  handler: async (ctx) => {
    // Check if data already exists
    const existingSuppliers = await ctx.db.query("suppliers").first();
    if (existingSuppliers) {
      return { message: "Data already seeded", skipped: true };
    }

    const now = Date.now();

    // Seed Suppliers
    await ctx.db.insert("suppliers", {
      name: "ABC Electronics",
      code: "SUP-001",
      contactPerson: "Rajesh Kumar",
      email: "rajesh@abcelectronics.com",
      phone: "+91 98765 43210",
      address: "123 Electronics Market, Gandhi Nagar",
      city: "Hyderabad",
      country: "India",
      createdAt: now,
    });
    await ctx.db.insert("suppliers", {
      name: "Global Garments",
      code: "SUP-002",
      contactPerson: "Priya Sharma",
      email: "priya@globalgarments.com",
      phone: "+91 87654 32109",
      address: "45 Textile Hub, Banjara Hills",
      city: "Mumbai",
      country: "India",
      createdAt: now,
    });

    // Seed Warehouses
    await ctx.db.insert("warehouses", {
      name: "Hyderabad Central Warehouse",
      code: "WH-001",
      contactPerson: "Suresh Reddy",
      email: "suresh@hydwarehouse.com",
      phone: "+91 76543 21098",
      address: "78 Industrial Area, Uppal",
      city: "Hyderabad",
      country: "India",
      capacity: 50000,
      createdAt: now,
    });
    await ctx.db.insert("warehouses", {
      name: "Secunderabad Distribution Center",
      code: "WH-002",
      contactPerson: "Anitha Nair",
      email: "anitha@secdistcenter.com",
      phone: "+91 65432 10987",
      address: "234 Logistics Park, Trimulgherry",
      city: "Secunderabad",
      country: "India",
      capacity: 35000,
      createdAt: now,
    });

    // Seed Transporters
    await ctx.db.insert("transporters", {
      name: "FastTrack Logistics",
      code: "TRN-001",
      contactPerson: "Mohammed Ali",
      email: "ali@fasttracklogistics.com",
      phone: "+91 54321 09876",
      address: "67 Transport Nagar, ECIL",
      city: "Hyderabad",
      country: "India",
      vehicleType: "Truck",
      createdAt: now,
    });
    await ctx.db.insert("transporters", {
      name: "BlueLine Transport",
      code: "TRN-002",
      contactPerson: "Vikram Patel",
      email: "vikram@bluelinetransport.com",
      phone: "+91 43210 98765",
      address: "89 Freight Terminal, Begumpet",
      city: "Pune",
      country: "India",
      vehicleType: "Container Ship",
      createdAt: now,
    });

    // Seed Customers
    await ctx.db.insert("customers", {
      name: "XYZ Retail Pvt Ltd",
      code: "CUS-001",
      contactPerson: "Deepika Menon",
      email: "deepika@xyzretail.com",
      phone: "+91 32109 87654",
      address: "12 Commercial Complex, Jubilee Hills",
      city: "Bangalore",
      country: "India",
      createdAt: now,
    });
    await ctx.db.insert("customers", {
      name: "Metro Stores",
      code: "CUS-002",
      contactPerson: "Arjun Das",
      email: "arjun@metrostores.com",
      phone: "+91 21098 76543",
      address: "56 Market Road, Ameerpet",
      city: "Hyderabad",
      country: "India",
      createdAt: now,
    });

    return { message: "Sample data seeded successfully", skipped: false };
  },
});
