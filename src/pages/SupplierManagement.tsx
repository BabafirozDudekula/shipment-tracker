import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../convex/_generated/api";
import { AppLayout } from "@/components/AppLayout";
import { EntityDialog, FieldDef } from "@/components/EntityDialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, Pencil, Trash2, Truck } from "lucide-react";
import { toast } from "sonner";

const fields: FieldDef[] = [
  { name: "name", label: "Company Name", placeholder: "ABC Electronics" },
  { name: "code", label: "Supplier ID", placeholder: "SUP-001" },
  { name: "contactPerson", label: "Contact Person", placeholder: "John Doe" },
  { name: "email", label: "Email", type: "email", placeholder: "contact@acme.com" },
  { name: "phone", label: "Phone", placeholder: "+1 234 567 8900" },
  { name: "address", label: "Address", placeholder: "123 Industrial Lane" },
  { name: "city", label: "City", placeholder: "New York" },
  { name: "country", label: "Country", placeholder: "USA" },
];

const emptyValues: Record<string, string | number> = {
  name: "",
  code: "",
  contactPerson: "",
  email: "",
  phone: "",
  address: "",
  city: "",
  country: "",
};

export default function SupplierManagement() {
  const suppliers = useQuery(api.suppliers.list);
  const createSupplier = useMutation(api.suppliers.create);
  const updateSupplier = useMutation(api.suppliers.update);
  const removeSupplier = useMutation(api.suppliers.remove);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [values, setValues] = useState<Record<string, string | number>>(emptyValues);
  const [loading, setLoading] = useState(false);

  const openCreate = () => {
    setEditing(null);
    setValues(emptyValues);
    setDialogOpen(true);
  };

  const openEdit = (supplier: any) => {
    setEditing(supplier);
    setValues({
      name: supplier.name,
      code: supplier.code,
      contactPerson: supplier.contactPerson,
      email: supplier.email,
      phone: supplier.phone,
      address: supplier.address,
      city: supplier.city,
      country: supplier.country,
    });
    setDialogOpen(true);
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      if (editing) {
        await updateSupplier({
          id: editing._id,
          name: values.name as string,
          code: (values.code as string) || "",
          contactPerson: values.contactPerson as string,
          email: values.email as string,
          phone: values.phone as string,
          address: values.address as string,
          city: values.city as string,
          country: values.country as string,
        });
        toast.success("Supplier updated");
      } else {
        await createSupplier({
          name: values.name as string,
          code: (values.code as string) || "",
          contactPerson: values.contactPerson as string,
          email: values.email as string,
          phone: values.phone as string,
          address: values.address as string,
          city: values.city as string,
          country: values.country as string,
        });
        toast.success("Supplier created");
      }
      setDialogOpen(false);
    } catch (err: any) {
      toast.error(err.message || "Failed to save supplier");
    }
    setLoading(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this supplier?")) return;
    await removeSupplier({ id: id as any });
    toast.success("Supplier deleted");
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              Suppliers
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Manage your supplier network
            </p>
          </div>
          <Button size="sm" className="gap-1.5" onClick={openCreate}>
            <Plus className="size-3.5" />
            Add Supplier
          </Button>
        </div>

        <Card className="border-border/60 shadow-none">
          <CardContent className="p-0">
            {suppliers === undefined ? (
              <div className="p-8 text-center text-sm text-muted-foreground">
                Loading suppliers...
              </div>
            ) : suppliers.length === 0 ? (
              <div className="p-8 text-center">
                <Truck className="size-8 text-muted-foreground/40 mx-auto mb-3" />
                <p className="text-sm text-muted-foreground">No suppliers yet</p>
                <p className="text-xs text-muted-foreground/60 mt-1">
                  Add your first supplier to get started
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border/60">
                      <th className="px-5 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wide">
                        Name
                      </th>
                      <th className="px-5 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wide">
                        Contact
                      </th>
                      <th className="px-5 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wide">
                        Location
                      </th>
                      <th className="px-5 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wide">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/60">
                    {suppliers.map((s) => (
                      <tr key={s._id} className="hover:bg-accent/30 transition-colors">
                        <td className="px-5 py-3">
                          <div className="flex items-center gap-2">
                            <span className="inline-flex rounded border border-border bg-muted px-2 py-0.5 text-xs font-mono text-foreground">
                              {s.code}
                            </span>
                            <div>
                              <p className="font-medium text-foreground">{s.name}</p>
                              <p className="text-xs text-muted-foreground">{s.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-3">
                          <p className="text-foreground">{s.contactPerson}</p>
                          <p className="text-xs text-muted-foreground">{s.phone}</p>
                        </td>
                        <td className="px-5 py-3">
                          <p className="text-foreground">{s.city}, {s.country}</p>
                          <p className="text-xs text-muted-foreground truncate max-w-[200px]">
                            {s.address}
                          </p>
                        </td>
                        <td className="px-5 py-3 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => openEdit(s)}
                              className="p-1.5 rounded hover:bg-accent text-muted-foreground hover:text-foreground transition-colors"
                            >
                              <Pencil className="size-3.5" />
                            </button>
                            <button
                              onClick={() => handleDelete(s._id)}
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

      <EntityDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        title="Supplier"
        description="Add or edit supplier details"
        fields={fields}
        values={values}
        onChange={(name, val) => setValues((prev) => ({ ...prev, [name]: val }))}
        onSubmit={handleSubmit}
        isEditing={!!editing}
        loading={loading}
      />
    </AppLayout>
  );
}
