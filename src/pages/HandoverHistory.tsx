import { useQuery } from "convex/react";
import { api } from "../convex/_generated/api";
import { AppLayout } from "@/components/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ArrowLeft,
  Package,
  ArrowRight,
  CheckCircle,
  Clock,
  XCircle,
  MapPin,
  Truck,
  Warehouse,
  Users,
  Boxes,
} from "lucide-react";
import { Link, useParams } from "react-router";

export default function HandoverHistory() {
  const { shipmentId } = useParams<{ shipmentId: string }>();
  const shipment = useQuery(
    api.shipments.getByShipmentId,
    shipmentId ? { shipmentId } : "skip",
  );
  const handovers = useQuery(
    api.shipments.getHandovers,
    shipmentId ? { shipmentId } : "skip",
  );

  if (shipment === undefined || handovers === undefined) {
    return (
      <AppLayout>
        <div className="p-8 text-center text-sm text-muted-foreground">
          Loading handover history...
        </div>
      </AppLayout>
    );
  }

  if (!shipment) {
    return (
      <AppLayout>
        <div className="p-8 text-center">
          <p className="text-sm text-muted-foreground">Shipment not found</p>
        </div>
      </AppLayout>
    );
  }

  const partyIcon = (type: string, size = "size-4") => {
    switch (type) {
      case "SUPPLIER": return <Truck className={size} />;
      case "WAREHOUSE": return <Warehouse className={size} />;
      case "TRANSPORTER": return <Boxes className={size} />;
      case "CUSTOMER": return <Users className={size} />;
      default: return <Package className={size} />;
    }
  };

  const statusConfig = (status: string) => {
    switch (status) {
      case "ACCEPTED":
        return {
          icon: CheckCircle,
          color: "text-emerald-600",
          bgColor: "bg-emerald-50 border-emerald-200",
          dotColor: "bg-emerald-500",
          label: "Accepted",
        };
      case "REJECTED":
        return {
          icon: XCircle,
          color: "text-rose-600",
          bgColor: "bg-rose-50 border-rose-200",
          dotColor: "bg-rose-500",
          label: "Rejected",
        };
      default:
        return {
          icon: Clock,
          color: "text-amber-600",
          bgColor: "bg-amber-50 border-amber-200",
          dotColor: "bg-amber-500",
          label: "Pending",
        };
    }
  };

  // Build the full timeline: start with creation, then handovers
  const timelineEvents: Array<{
    id: string;
    type: "created" | "handover";
    timestamp: number;
    party?: string;
    partyType?: string;
    toParty?: string;
    toPartyType?: string;
    location?: string;
    status?: string;
  }> = [
    {
      id: "created",
      type: "created",
      timestamp: shipment.createdAt,
      party: shipment.source,
      partyType: shipment.sourceType,
    },
  ];

  handovers.forEach((h) => {
    timelineEvents.push({
      id: h._id,
      type: "handover",
      timestamp: h.timestamp,
      party: h.fromParty,
      partyType: h.fromPartyType,
      toParty: h.toParty,
      toPartyType: h.toPartyType,
      location: h.location,
      status: h.handoverStatus,
    });
  });

  // Sort by timestamp ascending
  timelineEvents.sort((a, b) => a.timestamp - b.timestamp);

  return (
    <AppLayout>
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="flex items-center gap-3">
          <Link
            to={`/shipments/${shipmentId}`}
            className="p-1.5 rounded hover:bg-accent text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="size-4" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              Shipment History
            </h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              {shipment.shipmentId} — {shipment.productName}
            </p>
          </div>
        </div>

        {/* Shipment summary */}
        <Card className="border-border/60 shadow-none">
          <CardContent className="p-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <p className="text-sm font-medium text-foreground">
                  {shipment.productName}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Quantity: {shipment.quantity} · Currently with:{" "}
                  {shipment.currentResponsibleParty}
                </p>
              </div>
              <span
                className={`inline-flex items-center rounded border px-2 py-0.5 text-[10px] font-medium self-start ${
                  shipment.status === "DELIVERED"
                    ? "bg-emerald-50 text-emerald-600 border-emerald-200"
                    : "bg-amber-50 text-amber-600 border-amber-200"
                }`}
              >
                {shipment.status.replace(/_/g, " ")}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Visual Timeline */}
        <Card className="border-border/60 shadow-none">
          <CardHeader>
            <CardTitle className="text-sm">Movement Timeline</CardTitle>
          </CardHeader>
          <CardContent className="p-5 pt-0">
            <div className="relative">
              {/* Vertical line */}
              <div className="absolute left-[18px] top-0 bottom-0 w-px bg-border" />

              <div className="space-y-0">
                {timelineEvents.map((event, i) => {
                  const isLast = i === timelineEvents.length - 1;
                  const isHandover = event.type === "handover";
                  const statusInfo = isHandover ? statusConfig(event.status!) : null;
                  const StatusIcon = statusInfo?.icon;

                  return (
                    <div key={event.id} className="relative flex gap-4 pb-6 last:pb-0">
                      {/* Dot */}
                      <div className="relative z-10 shrink-0">
                        <div
                          className={`flex size-9 items-center justify-center rounded-full border-2 ${
                            isHandover
                              ? statusInfo!.bgColor
                              : "bg-primary/10 border-primary/30"
                          }`}
                        >
                          {isHandover ? (
                            StatusIcon && (
                              <StatusIcon className={`size-4 ${statusInfo!.color}`} />
                            )
                          ) : (
                            <Package className="size-4 text-primary" />
                          )}
                        </div>
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0 pt-0.5">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            {event.type === "created" ? (
                              <div>
                                <p className="text-sm font-medium text-foreground">
                                  Shipment Created
                                </p>
                                <p className="text-xs text-muted-foreground mt-0.5">
                                  Origin: {event.party}
                                </p>
                              </div>
                            ) : (
                              <div>
                                <div className="flex items-center gap-1.5 text-sm">
                                  <span className="flex items-center gap-1 font-medium text-foreground">
                                    {partyIcon(event.partyType!, "size-3.5")}
                                    {event.party}
                                  </span>
                                  <ArrowRight className="size-3 text-muted-foreground" />
                                  <span className="flex items-center gap-1 font-medium text-foreground">
                                    {partyIcon(event.toPartyType!, "size-3.5")}
                                    {event.toParty}
                                  </span>
                                </div>
                                {event.location && (
                                  <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1">
                                    <MapPin className="size-3" />
                                    {event.location}
                                  </p>
                                )}
                                {event.status && (
                                  <span
                                    className={`inline-flex items-center rounded border px-1.5 py-0.5 text-[10px] font-medium mt-1 ${statusInfo!.bgColor} ${statusInfo!.color}`}
                                  >
                                    {statusInfo!.label}
                                  </span>
                                )}
                              </div>
                            )}
                          </div>
                          <span className="text-[10px] text-muted-foreground whitespace-nowrap">
                            {new Date(event.timestamp).toLocaleString()}
                          </span>
                        </div>

                        {/* Connection line indicator */}
                        {!isLast && event.type === "handover" && event.status === "ACCEPTED" && (
                          <div className="mt-2 flex items-center gap-1 text-[10px] text-emerald-600">
                            <CheckCircle className="size-3" />
                            Responsibility transferred
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Handover table */}
        {handovers.length > 0 && (
          <Card className="border-border/60 shadow-none">
            <CardHeader>
              <CardTitle className="text-sm">Handover Records</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border/60">
                      <th className="px-5 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wide">
                        From
                      </th>
                      <th className="px-5 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wide">
                        To
                      </th>
                      <th className="px-5 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wide">
                        Location
                      </th>
                      <th className="px-5 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wide">
                        Status
                      </th>
                      <th className="px-5 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wide">
                        Time
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/60">
                    {handovers.map((h) => {
                      const sc = statusConfig(h.handoverStatus);
                      return (
                        <tr key={h._id} className="hover:bg-accent/30 transition-colors">
                          <td className="px-5 py-3">
                            <div className="flex items-center gap-1.5">
                              {partyIcon(h.fromPartyType)}
                              <span className="text-foreground text-xs">{h.fromParty}</span>
                            </div>
                          </td>
                          <td className="px-5 py-3">
                            <div className="flex items-center gap-1.5">
                              {partyIcon(h.toPartyType)}
                              <span className="text-foreground text-xs">{h.toParty}</span>
                            </div>
                          </td>
                          <td className="px-5 py-3">
                            <span className="text-xs text-muted-foreground">{h.location}</span>
                          </td>
                          <td className="px-5 py-3">
                            <span
                              className={`inline-flex items-center rounded border px-1.5 py-0.5 text-[10px] font-medium ${sc.bgColor} ${sc.color}`}
                            >
                              {sc.label}
                            </span>
                          </td>
                          <td className="px-5 py-3 text-right">
                            <span className="text-[10px] text-muted-foreground">
                              {new Date(h.timestamp).toLocaleString()}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </AppLayout>
  );
}
