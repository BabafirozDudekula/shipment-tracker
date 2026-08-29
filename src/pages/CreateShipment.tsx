import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../convex/_generated/api";
import { AppLayout } from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Package, ArrowRight } from "lucide-react";
import { Link, useNavigate } from "react-router";
import { toast } from "sonner";

interface EntityOption {
  _id: string;
  name: string;
  city?: string;
  country?: string;
}

export default function CreateShipment() {
  const navigate = useNavigate();
  const products = useQuery(api.products.list);
  const suppliers = useQuery(api.suppliers.list);
  const warehouses = useQuery(api.warehouses.list);
  const transporters = useQuery(api.transporters.list);
  const customers = useQuery(api.customers.list);
  const createShipment = useMutation(api.shipments.create);

  const [formData, setFormData] = useState({
    productId: "",
    quantity: 1,
    sourceType: "" as "" | "SUPPLIER" | "WAREHOUSE" | "TRANSPORTER" | "CUSTOMER",
    sourceId: "",
    destinationType: "" as "" | "SUPPLIER" | "WAREHOUSE" | "TRANSPORTER" | "CUSTOMER",
    destinationId: "",
    expectedDeliveryDate: "",
  });
  const [loading, setLoading] = useState(false);

  const getEntities = (type: string): EntityOption[] => {
    switch (type) {
      case "SUPPLIER": return (suppliers ?? []) as EntityOption[];
      case "WAREHOUSE": return (warehouses ?? []) as EntityOption[];
      case "TRANSPORTER": return (transporters ?? []) as EntityOption[];
      case "CUSTOMER": return (customers ?? []) as EntityOption[];
      default: return [];
    }
  };

  const getSourceOptions = () => ["SUPPLIER", "WAREHOUSE", "TRANSPORTER"];
  const getDestOptions = () => ["WAREHOUSE", "TRANSPORTER", "CUSTOMER"];

  const getEntityName = (type: string, id: string): string => {
    const entities = getEntities(type);
    const entity = entities.find((e) => e._id === id);
    if (!entity) return id;
    return entity.city ? `${entity.name} (${entity.city})` : entity.name;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.productId || !formData.sourceType || !formData.sourceId ||
        !formData.destinationType || !formData.destinationId || !formData.expectedDeliveryDate) {
      toast.error("Please fill all required fields");
      return;
    }

    setLoading(true);
    try {
      const product = (products ?? []).find((p: any) => p._id === formData.productId);
      const result = await createShipment({
        productId: formData.productId as any,
        productName: product?.name || "Unknown Product",
        quantity: formData.quantity,
        source: getEntityName(formData.sourceType, formData.sourceId),
        sourceId: formData.sourceId,
        sourceType: formData.sourceType as any,
        destination: getEntityName(formData.destinationType, formData.destinationId),
        destinationId: formData.destinationId,
        destinationType: formData.destinationType as any,
        expectedDeliveryDate: new Date(formData.expectedDeliveryDate).getTime(),
      });
      toast.success(`Shipment ${result.shipmentId} created`);
      navigate(`/shipments/${result.shipmentId}`);
    } catch (err: any) {
      toast.error(err.message || "Failed to create shipment");
    }
    setLoading(false);
  };

  const selectClass =
    "flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring";

  return (
    <AppLayout>
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="flex items-center gap-3">
          <Link
            to="/shipments"
            className="p-1.5 rounded hover:bg-accent text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="size-4" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              Create Shipment
            </h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              Set up a new shipment with source and destination
            </p>
          </div>
        </div>

        <Card className="border-border/60 shadow-none">
          <CardHeader>
            <div className="mb-2 flex size-9 items-center justify-center rounded-lg bg-primary/10">
              <Package className="size-4.5 text-primary" />
            </div>
            <CardTitle className="text-base">Shipment Details</CardTitle>
            <CardDescription>
              Select the product, source party, and destination for this shipment.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Product */}
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-muted-foreground">
                  Product <span className="text-destructive">*</span>
                </Label>
                <select
                  value={formData.productId}
                  onChange={(e) => setFormData((p) => ({ ...p, productId: e.target.value }))}
                  className={selectClass}
                  required
                >
                  <option value="">Select a product...</option>
                  {(products ?? []).map((p: any) => (
                    <option key={p._id} value={p._id}>
                      {p.name} ({p.sku})
                    </option>
                  ))}
                </select>
                {products && products.length === 0 && (
                  <p className="text-xs text-muted-foreground">
                    No products available.{' '}
                    <Link to="/products" className="text-primary hover:underline inline-flex items-center gap-0.5">
                      Add products first
                      <ArrowRight className="size-3" />
                    </Link>
                  </p>
                )}
              </div>

              {/* Quantity */}
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-muted-foreground">
                  Quantity <span className="text-destructive">*</span>
                </Label>
                <Input
                  type="number"
                  min={1}
                  value={formData.quantity}
                  onChange={(e) => setFormData((p) => ({ ...p, quantity: Number(e.target.value) }))}
                  required
                />
              </div>

              {/* Source */}
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-muted-foreground">
                  Source Type <span className="text-destructive">*</span>
                </Label>
                <select
                  value={formData.sourceType}
                  onChange={(e) =>
                    setFormData((p) => ({
                      ...p,
                      sourceType: e.target.value as any,
                      sourceId: "",
                    }))
                  }
                  className={selectClass}
                  required
                >
                  <option value="">Select source type...</option>
                  {getSourceOptions().map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>

              {formData.sourceType && (
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium text-muted-foreground">
                    Source <span className="text-destructive">*</span>
                  </Label>
                  <select
                    value={formData.sourceId}
                    onChange={(e) => setFormData((p) => ({ ...p, sourceId: e.target.value }))}
                    className={selectClass}
                    required
                  >
                    <option value="">Select source...</option>
                    {getEntities(formData.sourceType).map((e: EntityOption) => (
                      <option key={e._id} value={e._id}>
                        {e.name}{e.city ? ` (${e.city})` : ""}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Destination */}
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-muted-foreground">
                  Destination Type <span className="text-destructive">*</span>
                </Label>
                <select
                  value={formData.destinationType}
                  onChange={(e) =>
                    setFormData((p) => ({
                      ...p,
                      destinationType: e.target.value as any,
                      destinationId: "",
                    }))
                  }
                  className={selectClass}
                  required
                >
                  <option value="">Select destination type...</option>
                  {getDestOptions().map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>

              {formData.destinationType && (
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium text-muted-foreground">
                    Destination <span className="text-destructive">*</span>
                  </Label>
                  <select
                    value={formData.destinationId}
                    onChange={(e) => setFormData((p) => ({ ...p, destinationId: e.target.value }))}
                    className={selectClass}
                    required
                  >
                    <option value="">Select destination...</option>
                    {getEntities(formData.destinationType).map((e: EntityOption) => (
                      <option key={e._id} value={e._id}>
                        {e.name}{e.city ? ` (${e.city})` : ""}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Expected delivery date */}
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-muted-foreground">
                  Expected Delivery Date <span className="text-destructive">*</span>
                </Label>
                <Input
                  type="date"
                  value={formData.expectedDeliveryDate}
                  onChange={(e) =>
                    setFormData((p) => ({ ...p, expectedDeliveryDate: e.target.value }))
                  }
                  required
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Link
                  to="/shipments"
                  className="inline-flex items-center justify-center rounded-md border border-input px-4 py-2 text-sm font-medium hover:bg-accent transition-colors"
                >
                  Cancel
                </Link>
                <Button type="submit" disabled={loading}>
                  {loading ? "Creating..." : "Create Shipment"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
