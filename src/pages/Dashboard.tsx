import { useQuery } from "convex/react";
import { api } from "../convex/_generated/api";
import { AppLayout } from "@/components/AppLayout";
import { Card, CardContent } from "@/components/ui/card";
import {
  Package,
  Truck,
  CheckCircle,
  Clock,
  ArrowRight,
  Plus,
} from "lucide-react";
import { Link } from "react-router";
import { motion } from "framer-motion";

const statCards = [
  {
    key: "total",
    label: "Total Shipments",
    icon: Package,
    color: "bg-primary/10 text-primary",
  },
  {
    key: "inTransit",
    label: "In Transit",
    icon: Truck,
    color: "bg-amber-100 text-amber-700",
  },
  {
    key: "delivered",
    label: "Delivered",
    icon: CheckCircle,
    color: "bg-emerald-100 text-emerald-700",
  },
  {
    key: "pendingHandovers",
    label: "Pending Handovers",
    icon: Clock,
    color: "bg-rose-100 text-rose-700",
  },
] as const;

export default function Dashboard() {
  const stats = useQuery(api.shipments.dashboardStats);
  const recentShipments = useQuery(api.shipments.list);

  return (
    <AppLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Dashboard
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Overview of your supply chain operations
          </p>
        </div>

        {/* Stats */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {statCards.map((card, i) => (
            <motion.div
              key={card.key}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.05 * i }}
            >
              <Card className="border-border/60 shadow-none hover:shadow-sm transition-shadow">
                <CardContent className="p-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                        {card.label}
                      </p>
                      <p className="mt-2 text-2xl font-bold text-foreground">
                        {stats === undefined ? (
                          <span className="inline-block h-7 w-10 animate-pulse rounded bg-muted" />
                        ) : (
                          stats[card.key]
                        )}
                      </p>
                    </div>
                    <div className={`flex size-10 items-center justify-center rounded-lg ${card.color}`}>
                      <card.icon className="size-5" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Quick actions */}
        <div className="flex flex-wrap gap-2">
          <Link
            to="/shipments/create"
            className="inline-flex items-center gap-1.5 rounded-md bg-primary px-4 py-2 text-xs font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            <Plus className="size-3.5" />
            New Shipment
          </Link>
          <Link
            to="/suppliers"
            className="inline-flex items-center gap-1.5 rounded-md border border-border px-4 py-2 text-xs font-medium text-foreground hover:bg-accent transition-colors"
          >
            Manage Suppliers
          </Link>
          <Link
            to="/warehouses"
            className="inline-flex items-center gap-1.5 rounded-md border border-border px-4 py-2 text-xs font-medium text-foreground hover:bg-accent transition-colors"
          >
            Manage Warehouses
          </Link>
          <Link
            to="/transporters"
            className="inline-flex items-center gap-1.5 rounded-md border border-border px-4 py-2 text-xs font-medium text-foreground hover:bg-accent transition-colors"
          >
            Manage Transporters
          </Link>
        </div>

        {/* Recent shipments */}
        <Card className="border-border/60 shadow-none">
          <CardContent className="p-0">
            <div className="flex items-center justify-between px-5 py-4 border-b border-border/60">
              <h2 className="text-sm font-semibold text-foreground">
                Recent Shipments
              </h2>
              <Link
                to="/shipments"
                className="inline-flex items-center gap-1 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                View all
                <ArrowRight className="size-3" />
              </Link>
            </div>
            {recentShipments === undefined ? (
              <div className="p-8 text-center text-sm text-muted-foreground">
                Loading shipments...
              </div>
            ) : recentShipments.length === 0 ? (
              <div className="p-8 text-center">
                <Package className="size-8 text-muted-foreground/40 mx-auto mb-3" />
                <p className="text-sm text-muted-foreground">
                  No shipments yet
                </p>
                <Link
                  to="/shipments/create"
                  className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
                >
                  Create your first shipment
                  <ArrowRight className="size-3" />
                </Link>
              </div>
            ) : (
              <div className="divide-y divide-border/60">
                {recentShipments.slice(0, 5).map((shipment) => (
                  <Link
                    key={shipment._id}
                    to={`/shipments/${shipment.shipmentId}`}
                    className="flex items-center justify-between px-5 py-3 hover:bg-accent/30 transition-colors"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-foreground truncate">
                          {shipment.productName}
                        </span>
                        <StatusBadge status={shipment.status} />
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {shipment.source} → {shipment.destination}
                      </p>
                    </div>
                    <div className="text-right ml-4">
                      <p className="text-xs font-mono text-muted-foreground">
                        {shipment.shipmentId}
                      </p>
                      <p className="text-[10px] text-muted-foreground/70 mt-0.5">
                        Qty: {shipment.quantity}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}

function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    CREATED: "bg-slate-100 text-slate-600 border-slate-200",
    PACKED: "bg-blue-50 text-blue-600 border-blue-200",
    SHIPPED: "bg-indigo-50 text-indigo-600 border-indigo-200",
    IN_TRANSIT: "bg-amber-50 text-amber-600 border-amber-200",
    OUT_FOR_DELIVERY: "bg-orange-50 text-orange-600 border-orange-200",
    DELIVERED: "bg-emerald-50 text-emerald-600 border-emerald-200",
  };
  return (
    <span
      className={`inline-flex items-center rounded border px-1.5 py-0.5 text-[10px] font-medium ${colors[status] || "bg-muted text-muted-foreground"}`}
    >
      {status.replace(/_/g, " ")}
    </span>
  );
}
