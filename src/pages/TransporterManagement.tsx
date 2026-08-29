import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../convex/_generated/api";
import { AppLayout } from "@/components/AppLayout";
import { EntityDialog, FieldDef } from "@/components/EntityDialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, Pencil, Trash2, Boxes } from "lucide-react";
import { toast } from "sonner";

const fields: FieldDef[] = [
  { name: "name", label: "Company Name", placeholder: "FastFreight Logistics" },
  { name: "code", label: "Transporter ID", placeholder: "TRN-001" },
  { name: "contactPerson", label: "Contact Person", placeholder: "Mike Johnson" },
  { name: "email", label: "Email", type: "email", placeholder: "dispatch@fastfreight.com" },
  { name: "phone", label: "Phone", placeholder: "+1 234 567 8900" },
  { name: "address", label: "Address", placeholder: "789 Transport Way" },
  { name: "city", label: "City", placeholder: "Dallas" },
  { name: "country", label: "Country", placeholder: "USA" },
  {
    name: "vehicleType",
    label: "Vehicle Type",
    type: "select",
    options: ["Truck", "Van", "Container Ship", "Rail", "Air Freight"],
  },
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
  vehicleType: "",
};

export default function TransporterManagement() {
  const transporters = useQuery(api.transporters.list);
  const createTransporter = useMutation(api.transporters.create);
  const updateTransporter = useMutation(api.transporters.update);
  const removeTransporter = useMutation(api.transporters.remove);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [values, setValues] = useState<Record<string, string | number>>(emptyValues);
  const [loading, setLoading] = useState(false);

  const openCreate = () => {
    setEditing(null);
    setValues(emptyValues);
    setDialogOpen(true);
  };

  const openEdit = (t: any) => {
    setEditing(t);
    setValues({
      name: t.name,
      code: t.code,
      contactPerson: t.contactPerson,
      email: t.email,
      phone: t.phone,
      address: t.address,
      city: t.city,
      country: t.country,
      vehicleType: t.vehicleType,
    });
    setDialogOpen(true);
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      if (editing) {
        await updateTransporter({
          id: editing._id,
          name: values.name as string,
          code: (values.code as string) || "",
          contactPerson: values.contactPerson as string,
          email: values.email as string,
          phone: values.phone as string,
          address: values.address as string,
          city: values.city as string,
          country: values.country as string,
          vehicleType: values.vehicleType as string,
        });
        toast.success("Transporter updated");
      } else {
        await createTransporter({
          name: values.name as string,
          code: (values.code as string) || "",
          contactPerson: values.contactPerson as string,
          email: values.email as string,
          phone: values.phone as string,
          address: values.address as string,
          city: values.city as string,
          country: values.country as string,
          vehicleType: values.vehicleType as string,
        });
        toast.success("Transporter created");
      }
      setDialogOpen(false);
    } catch (err: any) {
      toast.error(err.message || "Failed to save transporter");
    }
    setLoading(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this transporter?")) return;
    if (loading) return;
    setLoading(true);
    try {
      await removeTransporter({ id: id as any });
      toast.success("Transporter deleted");
    } catch (err: any) {
      toast.error(err.message || "Failed to delete transporter");
    }
    setLoading(false);
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              Transporters
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Manage transportation providers
            </p>
          </div>
          <Button size="sm" className="gap-1.5" onClick={openCreate}>
            <Plus className="size-3.5" />
            Add Transporter
          </Button>
        </div>

        <Card className="border-border/60 shadow-none">
          <CardContent className="p-0">
            {transporters === undefined ? (
              <div className="p-8 text-center text-sm text-muted-foreground">
                Loading transporters...
              </div>
            ) : transporters.length === 0 ? (
              <div className="p-8 text-center">
                <Boxes className="size-8 text-muted-foreground/40 mx-auto mb-3" />
                <p className="text-sm text-muted-foreground">No transporters yet</p>
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
                        Vehicle
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
                    {transporters.map((t) => (
                      <tr key={t._id} className="hover:bg-accent/30 transition-colors">
                        <td className="px-5 py-3">
                          <div className="flex items-center gap-2">
                            <span className="inline-flex rounded border border-border bg-muted px-2 py-0.5 text-xs font-mono text-foreground">
                              {t.code}
                            </span>
                            <div>
                              <p className="font-medium text-foreground">{t.name}</p>
                              <p className="text-xs text-muted-foreground">{t.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-3">
                          <p className="text-foreground">{t.contactPerson}</p>
                          <p className="text-xs text-muted-foreground">{t.phone}</p>
                        </td>
                        <td className="px-5 py-3">
                          <span className="inline-flex rounded border border-border bg-muted px-2 py-0.5 text-xs text-foreground">
                            {t.vehicleType}
                          </span>
                        </td>
                        <td className="px-5 py-3">
                          <p className="text-foreground">{t.city}, {t.country}</p>
                        </td>
                        <td className="px-5 py-3 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => openEdit(t)}
                              className="p-1.5 rounded hover:bg-accent text-muted-foreground hover:text-foreground transition-colors"
                            >
                              <Pencil className="size-3.5" />
                            </button>
                            <button
                              onClick={() => handleDelete(t._id)}
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
        title="Transporter"
        description="Add or edit transporter details"
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
