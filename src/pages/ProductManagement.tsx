import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../convex/_generated/api";
import { AppLayout } from "@/components/AppLayout";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Pencil, Trash2, Package } from "lucide-react";
import { toast } from "sonner";

const CATEGORIES = [
  "Electronics",
  "Furniture",
  "Clothing",
  "Food & Beverage",
  "Raw Materials",
  "Chemicals",
  "Machinery",
  "Medical Supplies",
  "Office Supplies",
  "Other",
];

const UNITS = ["pcs", "kg", "lbs", "liters", "meters", "boxes", "pallets", "tons"];

interface ProductForm {
  name: string;
  sku: string;
  category: string;
  quantity: number;
  description: string;
  unit: string;
  weight: number;
}

const emptyForm: ProductForm = {
  name: "",
  sku: "",
  category: "",
  quantity: 0,
  description: "",
  unit: "pcs",
  weight: 0,
};

export default function ProductManagement() {
  const products = useQuery(api.products.list);
  const createProduct = useMutation(api.products.create);
  const updateProduct = useMutation(api.products.update);
  const removeProduct = useMutation(api.products.remove);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [form, setForm] = useState<ProductForm>(emptyForm);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setErrors({});
    setDialogOpen(true);
  };

  const openEdit = (product: any) => {
    setEditing(product);
    setForm({
      name: product.name,
      sku: product.sku,
      category: product.category,
      quantity: product.quantity,
      description: product.description,
      unit: product.unit,
      weight: product.weight,
    });
    setErrors({});
    setDialogOpen(true);
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!form.name.trim()) newErrors.name = "Product name is required";
    if (!form.sku.trim()) newErrors.sku = "SKU is required";
    if (form.quantity < 0) newErrors.quantity = "Quantity cannot be negative";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      if (editing) {
        await updateProduct({
          id: editing._id,
          name: form.name,
          sku: form.sku,
          category: form.category,
          quantity: form.quantity,
          description: form.description,
          unit: form.unit,
          weight: form.weight,
        });
        toast.success("Product updated");
      } else {
        await createProduct({
          name: form.name,
          sku: form.sku,
          category: form.category,
          quantity: form.quantity,
          description: form.description,
          unit: form.unit,
          weight: form.weight,
        });
        toast.success("Product created");
      }
      setDialogOpen(false);
    } catch (err: any) {
      toast.error(err.message || "Failed to save product");
    }
    setLoading(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this product?")) return;
    try {
      await removeProduct({ id: id as any });
      toast.success("Product deleted");
    } catch (err: any) {
      toast.error(err.message || "Failed to delete product");
    }
  };

  const setField = (field: keyof ProductForm, value: string | number) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  const selectClass =
    "flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring";

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              Products
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Manage your product catalog
            </p>
          </div>
          <Button size="sm" className="gap-1.5" onClick={openCreate}>
            <Plus className="size-3.5" />
            Add Product
          </Button>
        </div>

        <Card className="border-border/60 shadow-none">
          <CardContent className="p-0">
            {products === undefined ? (
              <div className="p-8 text-center text-sm text-muted-foreground">
                Loading products...
              </div>
            ) : products.length === 0 ? (
              <div className="p-8 text-center">
                <Package className="size-8 text-muted-foreground/40 mx-auto mb-3" />
                <p className="text-sm text-muted-foreground">
                  No products yet
                </p>
                <p className="text-xs text-muted-foreground/60 mt-1">
                  Add your first product to start creating shipments
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border/60">
                      <th className="px-5 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wide">
                        Product
                      </th>
                      <th className="px-5 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wide">
                        SKU
                      </th>
                      <th className="px-5 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wide">
                        Category
                      </th>
                      <th className="px-5 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wide">
                        Stock
                      </th>
                      <th className="px-5 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wide">
                        Weight
                      </th>
                      <th className="px-5 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wide">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/60">
                    {products.map((p) => (
                      <tr
                        key={p._id}
                        className="hover:bg-accent/30 transition-colors"
                      >
                        <td className="px-5 py-3">
                          <p className="font-medium text-foreground">
                            {p.name}
                          </p>
                          <p className="text-xs text-muted-foreground truncate max-w-[240px]">
                            {p.description || "No description"}
                          </p>
                        </td>
                        <td className="px-5 py-3">
                          <span className="inline-flex rounded border border-border bg-muted px-2 py-0.5 text-xs font-mono text-foreground">
                            {p.sku}
                          </span>
                        </td>
                        <td className="px-5 py-3">
                          <span className="text-xs text-muted-foreground">
                            {p.category || "\u2014"}
                          </span>
                        </td>
                        <td className="px-5 py-3 text-right">
                          <span className="text-sm font-medium text-foreground">
                            {p.quantity.toLocaleString()}
                          </span>
                          <span className="text-xs text-muted-foreground ml-1">
                            {p.unit}
                          </span>
                        </td>
                        <td className="px-5 py-3 text-right">
                          <span className="text-sm text-muted-foreground">
                            {p.weight > 0 ? `${p.weight} kg` : "\u2014"}
                          </span>
                        </td>
                        <td className="px-5 py-3 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => openEdit(p)}
                              className="p-1.5 rounded hover:bg-accent text-muted-foreground hover:text-foreground transition-colors"
                            >
                              <Pencil className="size-3.5" />
                            </button>
                            <button
                              onClick={() => handleDelete(p._id)}
                              className="p-1.5 rounded hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
                            >
                              <Trash2 className="size-3.5" />
                            </button>
                          </div>
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

      {/* Create / Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editing ? "Edit Product" : "Add Product"}
            </DialogTitle>
            <DialogDescription>
              {editing
                ? "Update the product details below."
                : "Add a new product to your catalog."}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 mt-2">
            {/* Product Name */}
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-muted-foreground">
                Product Name <span className="text-destructive">*</span>
              </Label>
              <Input
                value={form.name}
                onChange={(e) => setField("name", e.target.value)}
                placeholder="e.g. Industrial Bearing Set"
              />
              {errors.name && (
                <p className="text-xs text-destructive">{errors.name}</p>
              )}
            </div>

            {/* SKU */}
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-muted-foreground">
                SKU / Product Code <span className="text-destructive">*</span>
              </Label>
              <Input
                value={form.sku}
                onChange={(e) => setField("sku", e.target.value)}
                placeholder="e.g. PRD-001"
                className="font-mono"
              />
              {errors.sku && (
                <p className="text-xs text-destructive">{errors.sku}</p>
              )}
            </div>

            {/* Category */}
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-muted-foreground">
                Category
              </Label>
              <select
                value={form.category}
                onChange={(e) => setField("category", e.target.value)}
                className={selectClass}
              >
                <option value="">Select category...</option>
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            {/* Quantity + Unit */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-muted-foreground">
                  Initial Stock <span className="text-destructive">*</span>
                </Label>
                <Input
                  type="number"
                  min={0}
                  value={form.quantity}
                  onChange={(e) =>
                    setField("quantity", Number(e.target.value))
                  }
                />
                {errors.quantity && (
                  <p className="text-xs text-destructive">{errors.quantity}</p>
                )}
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-muted-foreground">
                  Unit
                </Label>
                <select
                  value={form.unit}
                  onChange={(e) => setField("unit", e.target.value)}
                  className={selectClass}
                >
                  {UNITS.map((u) => (
                    <option key={u} value={u}>
                      {u}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Weight */}
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-muted-foreground">
                Weight (kg)
              </Label>
              <Input
                type="number"
                min={0}
                step={0.1}
                value={form.weight}
                onChange={(e) => setField("weight", Number(e.target.value))}
              />
            </div>

            {/* Description */}
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-muted-foreground">
                Description
              </Label>
              <textarea
                value={form.description}
                onChange={(e) => setField("description", e.target.value)}
                placeholder="Optional product description..."
                className="flex min-h-[80px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              />
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-2 pt-2">
              <Button
                variant="outline"
                onClick={() => setDialogOpen(false)}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button onClick={handleSubmit} disabled={loading}>
                {loading
                  ? "Saving..."
                  : editing
                    ? "Update Product"
                    : "Create Product"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}
