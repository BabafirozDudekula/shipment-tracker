import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../convex/_generated/api";
import { AppLayout } from "@/components/AppLayout";
import { EntityDialog, FieldDef } from "@/components/EntityDialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, Pencil, Trash2, Warehouse } from "lucide-react";
import { toast } from "sonner";

const fields: FieldDef[] = [
  { name: "name", label: "Warehouse Name", placeholder: "Central Distribution Center" },
  { name: "code", label: "Warehouse Code", placeholder: "WH-001" },
  { name: "contactPerson", label: "Contact Person", placeholder: "Jane Smith" },
  { name: "email", label: "Email", type: "email", placeholder: "ops@warehouse.com" },
  { name: "phone", label: "Phone", placeholder: "+1 234 567 8900" },
  { name: "address", label: "Address", placeholder: "456 Storage Blvd" },
  { name: "city", label: "City", placeholder: "Chicago" },
  { name: "country", label: "Country", placeholder: "USA" },
  { name: "capacity", label: "Capacity (units)", type: "number", placeholder: "10000" },
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
  capacity: 0,
};

export default function WarehouseManagement() {
  const warehouses = useQuery(api.warehouses.list);
  const createWarehouse = useMutation(api.warehouses.create);
  const updateWarehouse = useMutation(api.warehouses.update);
  const removeWarehouse = useMutation(api.warehouses.remove);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [values, setValues] = useState<Record<string, string | number>>(emptyValues);
  const [loading, setLoading] = useState(false);

  const openCreate = () => {
    setEditing(null);
    setValues(emptyValues);
    setDialogOpen(true);
  };

  const openEdit = (wh: any) => {
    setEditing(wh);
    setValues({
      name: wh.name,
      code: wh.code,
      contactPerson: wh.contactPerson,
      email: wh.email,
      phone: wh.phone,
      address: wh.address,
      city: wh.city,
      country: wh.country,
      capacity: wh.capacity,
    });
    setDialogOpen(true);
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      if (editing) {
        await updateWarehouse({
          id: editing._id,
          name: values.name as string,
          code: values.code as string,
          contactPerson: values.contactPerson as string,
          email: values.email as string,
          phone: values.phone as string,
          address: values.address as string,
          city: values.city as string,
          country: values.country as string,
          capacity: Number(values.capacity),
        });
        toast.success("Warehouse updated");
      } else {
        await createWarehouse({
          name: values.name as string,
          code: values.code as string,
          contactPerson: values.contactPerson as string,
          email: values.email as string,
          phone: values.phone as string,
          address: values.address as string,
          city: values.city as string,
          country: values.country as string,
          capacity: Number(values.capacity),
        });
        toast.success("Warehouse created");
      }
      setDialogOpen(false);
    } catch (err: any) {
      toast.error(err.message || "Failed to save warehouse");
    }
    setLoading(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this warehouse?")) return;
    if (loading) return;
    setLoading(true);
    try {
      await removeWarehouse({ id: id as any });
      toast.success("Warehouse deleted");
    } catch (err: any) {
      toast.error(err.message || "Failed to delete warehouse");
    }
    setLoading(false);
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              Warehouses
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Manage storage facilities
            </p>
          </div>
          <Button size="sm" className="gap-1.5" onClick={openCreate}>
            <Plus className="size-3.5" />
            Add Warehouse
          </Button>
        </div>

        <Card className="border-border/60 shadow-none">
          <CardContent className="p-0">
            {warehouses === undefined ? (
              <div className="p-8 text-center text-sm text-muted-foreground">
                Loading warehouses...
              </div>
            ) : warehouses.length === 0 ? (
              <div className="p-8 text-center">
                <Warehouse className="size-8 text-muted-foreground/40 mx-auto mb-3" />
                <p className="text-sm text-muted-foreground">No warehouses yet</p>
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
                        Code
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
                    {warehouses.map((w) => (
                      <tr key={w._id} className="hover:bg-accent/30 transition-colors">
                        <td className="px-5 py-3">
                          <p className="font-medium text-foreground">{w.name}</p>
                          <p className="text-xs text-muted-foreground">{w.email}</p>
                        </td>
                        <td className="px-5 py-3">
                          <span className="inline-flex rounded border border-border bg-muted px-2 py-0.5 text-xs font-mono text-foreground">
                            {w.code}
                          </span>
                        </td>
                        <td className="px-5 py-3">
                          <p className="text-foreground">{w.contactPerson}</p>
                          <p className="text-xs text-muted-foreground">{w.phone}</p>
                        </td>
                        <td className="px-5 py-3">
                          <p className="text-foreground">{w.city}, {w.country}</p>
                          <p className="text-xs text-muted-foreground">
                            Cap: {w.capacity.toLocaleString()} units
                          </p>
                        </td>
                        <td className="px-5 py-3 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => openEdit(w)}
                              className="p-1.5 rounded hover:bg-accent text-muted-foreground hover:text-foreground transition-colors"
                            >
                              <Pencil className="size-3.5" />
                            </button>
                            <button
                              onClick={() => handleDelete(w._id)}
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
        title="Warehouse"
        description="Add or edit warehouse details"
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
