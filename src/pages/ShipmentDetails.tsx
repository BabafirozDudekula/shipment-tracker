import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../convex/_generated/api";
import { AppLayout } from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { VALID_TRANSITIONS } from "../convex/schema";
import {
  ArrowLeft,
  ArrowRight,
  Package,
  MapPin,
  Clock,
  Handshake,
  ChevronRight,
  CheckCircle,
  Truck,
  Warehouse,
  Users,
  Boxes,
} from "lucide-react";
import { Link, useParams } from "react-router";
import { toast } from "sonner";

const statusColors: Record<string, string> = {
  CREATED: "bg-slate-100 text-slate-600 border-slate-200",
  PACKED: "bg-blue-50 text-blue-600 border-blue-200",
  SHIPPED: "bg-indigo-50 text-indigo-600 border-indigo-200",
  IN_TRANSIT: "bg-amber-50 text-amber-600 border-amber-200",
  OUT_FOR_DELIVERY: "bg-orange-50 text-orange-600 border-orange-200",
  DELIVERED: "bg-emerald-50 text-emerald-600 border-emerald-200",
};

const ALL_STATUSES = [
  "CREATED",
  "PACKED",
  "SHIPPED",
  "IN_TRANSIT",
  "OUT_FOR_DELIVERY",
  "DELIVERED",
];

export default function ShipmentDetails() {
  const { shipmentId } = useParams<{ shipmentId: string }>();
  const shipment = useQuery(
    api.shipments.getByShipmentId,
    shipmentId ? { shipmentId } : "skip",
  );
  const handovers = useQuery(
    api.shipments.getHandovers,
    shipmentId ? { shipmentId } : "skip",
  );

  const updateStatus = useMutation(api.shipments.updateStatus);
  const createHandover = useMutation(api.handovers.create);
  const acceptHandover = useMutation(api.handovers.accept);

  const [handoverOpen, setHandoverOpen] = useState(false);
  const [handoverForm, setHandoverForm] = useState({
    toPartyType: "" as "" | "WAREHOUSE" | "TRANSPORTER" | "CUSTOMER",
    toPartyId: "",
    toPartyName: "",
    location: "",
    notes: "",
  });
  const [loading, setLoading] = useState(false);

  const warehouses = useQuery(api.warehouses.list);
  const transporters = useQuery(api.transporters.list);
  const customers = useQuery(api.customers.list);

  if (shipment === undefined) {
    return (
      <AppLayout>
        <div className="p-8 text-center text-sm text-muted-foreground">
          Loading shipment...
        </div>
      </AppLayout>
    );
  }

  if (!shipment) {
    return (
      <AppLayout>
        <div className="p-8 text-center">
          <p className="text-sm text-muted-foreground">Shipment not found</p>
          <Link to="/shipments" className="mt-2 text-xs text-primary hover:underline">
            Back to shipments
          </Link>
        </div>
      </AppLayout>
    );
  }

  const allowedNext = VALID_TRANSITIONS[shipment.status] ?? [];
  const nextStatus = allowedNext[0];

  const handleStatusUpdate = async () => {
    if (!nextStatus) return;
    setLoading(true);
    try {
      await updateStatus({ id: shipment._id, newStatus: nextStatus as any });
      toast.success(`Status updated to ${nextStatus.replace(/_/g, " ")}`);
    } catch (err: any) {
      toast.error(err.message);
    }
    setLoading(false);
  };

  const getDestEntities = () => {
    switch (handoverForm.toPartyType) {
      case "WAREHOUSE": return (warehouses ?? []) as any[];
      case "TRANSPORTER": return (transporters ?? []) as any[];
      case "CUSTOMER": return (customers ?? []) as any[];
      default: return [];
    }
  };

  const handleCreateHandover = async () => {
    if (!handoverForm.toPartyType || !handoverForm.toPartyId || !handoverForm.location) {
      toast.error("Fill all handover fields");
      return;
    }
    if (loading) return;
    setLoading(true);
    try {
      const entity = getDestEntities().find(
        (e: any) => e._id === handoverForm.toPartyId,
      );
      const toName = entity?.city
        ? `${entity.name} (${entity.city})`
        : entity?.name || "Unknown";

      await createHandover({
        shipmentDocId: shipment._id,
        fromParty: shipment.currentResponsibleParty,
        fromPartyId: shipment.currentResponsiblePartyId,
        fromPartyType: shipment.currentResponsiblePartyType,
        toParty: toName,
        toPartyId: handoverForm.toPartyId,
        toPartyType: handoverForm.toPartyType as any,
        location: handoverForm.location,
        notes: handoverForm.notes || undefined,
      });
      toast.success("Handover record created (Pending acceptance)");
      setHandoverOpen(false);
      setHandoverForm({ toPartyType: "", toPartyId: "", toPartyName: "", location: "", notes: "" });
    } catch (err: any) {
      toast.error(err.message);
    }
    setLoading(false);
  };

  const handleAcceptHandover = async (id: string) => {
    try {
      await acceptHandover({ id: id as any });
      toast.success("Handover accepted — shipment responsibility transferred");
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const partyIcon = (type: string) => {
    switch (type) {
      case "SUPPLIER": return <Truck className="size-3.5" />;
      case "WAREHOUSE": return <Warehouse className="size-3.5" />;
      case "TRANSPORTER": return <Boxes className="size-3.5" />;
      case "CUSTOMER": return <Users className="size-3.5" />;
      default: return <Package className="size-3.5" />;
    }
  };

  const selectClass =
    "flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring";

  return (
    <AppLayout>
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="flex items-center gap-3">
          <Link
            to="/shipments"
            className="p-1.5 rounded hover:bg-accent text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="size-4" />
          </Link>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold tracking-tight text-foreground">
                {shipment.shipmentId}
              </h1>
              <span
                className={`inline-flex items-center rounded border px-2 py-0.5 text-[10px] font-medium ${statusColors[shipment.status] || ""}`}
              >
                {shipment.status.replace(/_/g, " ")}
              </span>
            </div>
            <p className="text-sm text-muted-foreground mt-0.5">
              {shipment.productName} — Qty: {shipment.quantity}
            </p>
          </div>
        </div>

        {/* Status Pipeline */}
        <Card className="border-border/60 shadow-none">
          <CardContent className="p-5">
            <div className="flex items-center gap-1 overflow-x-auto pb-1">
              {ALL_STATUSES.map((s, i) => {
                const currentIdx = ALL_STATUSES.indexOf(shipment.status);
                const isCompleted = i <= currentIdx;
                const isCurrent = i === currentIdx;
                return (
                  <div key={s} className="flex items-center gap-1">
                    <div
                      className={`flex items-center gap-1.5 rounded-full border px-3 py-1 text-[10px] font-medium whitespace-nowrap transition-colors ${
                        isCurrent
                          ? "border-primary bg-primary/10 text-primary"
                          : isCompleted
                            ? "border-emerald-300 bg-emerald-50 text-emerald-700"
                            : "border-border bg-muted text-muted-foreground"
                      }`}
                    >
                      {isCompleted && !isCurrent ? (
                        <CheckCircle className="size-3" />
                      ) : null}
                      {s.replace(/_/g, " ")}
                    </div>
                    {i < ALL_STATUSES.length - 1 && (
                      <ChevronRight className="size-3 text-border shrink-0" />
                    )}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Shipment info */}
        <div className="grid gap-4 sm:grid-cols-2">
          <Card className="border-border/60 shadow-none">
            <CardContent className="p-5 space-y-3">
              <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Route
              </h3>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  {partyIcon(shipment.sourceType)}
                  <span className="text-foreground font-medium">From:</span>
                  <span className="text-muted-foreground">{shipment.source}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  {partyIcon(shipment.destinationType)}
                  <span className="text-foreground font-medium">To:</span>
                  <span className="text-muted-foreground">{shipment.destination}</span>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-border/60 shadow-none">
            <CardContent className="p-5 space-y-3">
              <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Current Status
              </h3>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <MapPin className="size-3.5 text-muted-foreground" />
                  <span className="text-foreground">Location:</span>
                  <span className="text-muted-foreground">{shipment.currentLocation}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  {partyIcon(shipment.currentResponsiblePartyType)}
                  <span className="text-foreground">With:</span>
                  <span className="text-muted-foreground">{shipment.currentResponsibleParty}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Clock className="size-3.5 text-muted-foreground" />
                  <span className="text-foreground">Expected:</span>
                  <span className="text-muted-foreground">
                    {new Date(shipment.expectedDeliveryDate).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Actions */}
        {shipment.status !== "DELIVERED" && (
          <div className="flex flex-wrap gap-2">
            {nextStatus && (
              <Button
                size="sm"
                onClick={handleStatusUpdate}
                disabled={loading}
                className="gap-1.5"
              >
                Advance to {nextStatus.replace(/_/g, " ")}
                <ArrowRight className="size-3.5" />
              </Button>
            )}
            <Button
              size="sm"
              variant="outline"
              onClick={() => setHandoverOpen(true)}
              className="gap-1.5"
            >
              <Handshake className="size-3.5" />
              Initiate Handover
            </Button>
            <Link
              to={`/shipments/${shipment.shipmentId}/handovers`}
              className="inline-flex items-center gap-1.5 rounded-md border border-input px-3 py-1.5 text-xs font-medium text-foreground hover:bg-accent transition-colors"
            >
              <Clock className="size-3.5" />
              View Handover History
            </Link>
          </div>
        )}

        {/* Recent handovers */}
        {handovers && handovers.length > 0 && (
          <Card className="border-border/60 shadow-none">
            <CardHeader>
              <CardTitle className="text-sm">Recent Handovers</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-border/60">
                {handovers.slice(-3).reverse().map((h) => (
                  <div key={h._id} className="px-5 py-3 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1 text-xs text-foreground">
                        <span className="font-medium">{h.fromParty}</span>
                        <ArrowRight className="size-3 text-muted-foreground" />
                        <span className="font-medium">{h.toParty}</span>
                      </div>
                      <span className="text-[10px] text-muted-foreground">
                        {new Date(h.timestamp).toLocaleString()}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-[10px] font-medium px-1.5 py-0.5 rounded border ${
                          h.handoverStatus === "ACCEPTED"
                            ? "bg-emerald-50 text-emerald-600 border-emerald-200"
                            : h.handoverStatus === "REJECTED"
                              ? "bg-rose-50 text-rose-600 border-rose-200"
                              : "bg-amber-50 text-amber-600 border-amber-200"
                        }`}
                      >
                        {h.handoverStatus}
                      </span>
                      {h.handoverStatus === "PENDING" && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-6 text-[10px] px-2"
                          onClick={() => handleAcceptHandover(h._id)}
                        >
                          Accept
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Handover Dialog */}
      <Dialog open={handoverOpen} onOpenChange={setHandoverOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Create Handover</DialogTitle>
            <DialogDescription>
              Transfer shipment responsibility from {shipment.currentResponsibleParty} to another party.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 mt-2">
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-muted-foreground">
                Transfer To <span className="text-destructive">*</span>
              </Label>
              <select
                value={handoverForm.toPartyType}
                onChange={(e) =>
                  setHandoverForm((p) => ({
                    ...p,
                    toPartyType: e.target.value as any,
                    toPartyId: "",
                  }))
                }
                className={selectClass}
              >
                <option value="">Select party type...</option>
                <option value="WAREHOUSE">Warehouse</option>
                <option value="TRANSPORTER">Transporter</option>
                <option value="CUSTOMER">Customer</option>
              </select>
            </div>

            {handoverForm.toPartyType && (
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-muted-foreground">
                  Select Party <span className="text-destructive">*</span>
                </Label>
                <select
                  value={handoverForm.toPartyId}
                  onChange={(e) =>
                    setHandoverForm((p) => ({ ...p, toPartyId: e.target.value }))
                  }
                  className={selectClass}
                >
                  <option value="">Select...</option>
                  {getDestEntities().map((e: any) => (
                    <option key={e._id} value={e._id}>
                      {e.name}{e.city ? ` (${e.city})` : ""}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-muted-foreground">
                Handover Location <span className="text-destructive">*</span>
              </Label>
              <Input
                value={handoverForm.location}
                onChange={(e) =>
                  setHandoverForm((p) => ({ ...p, location: e.target.value }))
                }
                placeholder="e.g., Warehouse Dock A, Gate 3"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-muted-foreground">
                Notes (optional)
              </Label>
              <textarea
                value={handoverForm.notes}
                onChange={(e) =>
                  setHandoverForm((p) => ({ ...p, notes: e.target.value }))
                }
                placeholder="Any additional notes..."
                className="flex min-h-[60px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              />
            </div>

            <div className="flex justify-end gap-2 pt-1">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setHandoverOpen(false)}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={handleCreateHandover}
                disabled={loading}
                className="gap-1.5"
              >
                <Handshake className="size-3.5" />
                {loading ? "Creating..." : "Create Handover"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}
