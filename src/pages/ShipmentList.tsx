import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "../convex/_generated/api";
import { AppLayout } from "@/components/AppLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "react-router";
import { Package, ArrowRight } from "lucide-react";

const STATUS_OPTIONS = [
  "",
  "CREATED",
  "PACKED",
  "SHIPPED",
  "IN_TRANSIT",
  "OUT_FOR_DELIVERY",
  "DELIVERED",
];

const statusColors: Record<string, string> = {
  CREATED: "bg-slate-100 text-slate-600 border-slate-200",
  PACKED: "bg-blue-50 text-blue-600 border-blue-200",
  SHIPPED: "bg-indigo-50 text-indigo-600 border-indigo-200",
  IN_TRANSIT: "bg-amber-50 text-amber-600 border-amber-200",
  OUT_FOR_DELIVERY: "bg-orange-50 text-orange-600 border-orange-200",
  DELIVERED: "bg-emerald-50 text-emerald-600 border-emerald-200",
};

export default function ShipmentList() {
  const shipments = useQuery(api.shipments.list);
  const [filterStatus, setFilterStatus] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  const filtered = (shipments ?? []).filter((s) => {
    if (filterStatus && s.status !== filterStatus) return false;
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      return (
        s.shipmentId.toLowerCase().includes(q) ||
        s.productName.toLowerCase().includes(q) ||
        s.source.toLowerCase().includes(q) ||
        s.destination.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Shipments
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Track all shipments across your supply chain
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            placeholder="Search by ID, product, source, or destination..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex h-9 rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring max-w-md"
          />
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="flex h-9 rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring w-48"
          >
            <option value="">All Statuses</option>
            {STATUS_OPTIONS.filter(Boolean).map((s) => (
              <option key={s} value={s}>
                {s.replace(/_/g, " ")}
              </option>
            ))}
          </select>
        </div>

        <Card className="border-border/60 shadow-none">
          <CardContent className="p-0">
            {shipments === undefined ? (
              <div className="p-8 text-center text-sm text-muted-foreground">
                Loading shipments...
              </div>
            ) : filtered.length === 0 ? (
              <div className="p-8 text-center">
                <Package className="size-8 text-muted-foreground/40 mx-auto mb-3" />
                <p className="text-sm text-muted-foreground">
                  {shipments.length === 0
                    ? "No shipments yet"
                    : "No shipments match your filters"}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border/60">
                      <th className="px-5 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wide">
                        Shipment ID
                      </th>
                      <th className="px-5 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wide">
                        Product
                      </th>
                      <th className="px-5 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wide">
                        Route
                      </th>
                      <th className="px-5 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wide">
                        Status
                      </th>
                      <th className="px-5 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wide">
                        Responsible Party
                      </th>
                      <th className="px-5 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wide">
                        Details
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/60">
                    {filtered.map((s) => (
                      <tr
                        key={s._id}
                        className="hover:bg-accent/30 transition-colors"
                      >
                        <td className="px-5 py-3">
                          <span className="font-mono text-xs font-medium text-foreground">
                            {s.shipmentId}
                          </span>
                        </td>
                        <td className="px-5 py-3">
                          <p className="font-medium text-foreground">{s.productName}</p>
                          <p className="text-xs text-muted-foreground">Qty: {s.quantity}</p>
                        </td>
                        <td className="px-5 py-3">
                          <div className="flex items-center gap-1.5 text-xs">
                            <span className="text-foreground truncate max-w-[120px]">
                              {s.source}
                            </span>
                            <ArrowRight className="size-3 text-muted-foreground shrink-0" />
                            <span className="text-foreground truncate max-w-[120px]">
                              {s.destination}
                            </span>
                          </div>
                        </td>
                        <td className="px-5 py-3">
                          <span
                            className={`inline-flex items-center rounded border px-2 py-0.5 text-[10px] font-medium ${statusColors[s.status] || ""}`}
                          >
                            {s.status.replace(/_/g, " ")}
                          </span>
                        </td>
                        <td className="px-5 py-3">
                          <p className="text-xs text-foreground truncate max-w-[140px]">
                            {s.currentResponsibleParty}
                          </p>
                        </td>
                        <td className="px-5 py-3 text-right">
                          <Link
                            to={`/shipments/${s.shipmentId}`}
                            className="inline-flex items-center gap-1 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
                          >
                            View
                            <ArrowRight className="size-3" />
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
