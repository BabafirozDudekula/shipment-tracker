import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../convex/_generated/api";
import { AppLayout } from "@/components/AppLayout";
import { EntityDialog, FieldDef } from "@/components/EntityDialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, Pencil, Trash2, Users } from "lucide-react";
import { toast } from "sonner";

const fields: FieldDef[] = [
  { name: "name", label: "Company Name", placeholder: "Retail Corp" },
  { name: "code", label: "Customer ID", placeholder: "CUS-001" },
  { name: "contactPerson", label: "Contact Person", placeholder: "Sarah Williams" },
  { name: "email", label: "Email", type: "email", placeholder: "orders@retailcorp.com" },
  { name: "phone", label: "Phone", placeholder: "+1 234 567 8900" },
  { name: "address", label: "Address", placeholder: "321 Commerce Street" },
  { name: "city", label: "City", placeholder: "Los Angeles" },
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

export default function CustomerManagement() {
  const customers = useQuery(api.customers.list);
  const createCustomer = useMutation(api.customers.create);
  const updateCustomer = useMutation(api.customers.update);
  const removeCustomer = useMutation(api.customers.remove);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [values, setValues] = useState<Record<string, string | number>>(emptyValues);
  const [loading, setLoading] = useState(false);

  const openCreate = () => {
    setEditing(null);
    setValues(emptyValues);
    setDialogOpen(true);
  };

  const openEdit = (c: any) => {
    setEditing(c);
    setValues({
      name: c.name,
      code: c.code,
      contactPerson: c.contactPerson,
      email: c.email,
      phone: c.phone,
      address: c.address,
      city: c.city,
      country: c.country,
    });
    setDialogOpen(true);
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      if (editing) {
        await updateCustomer({
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
        toast.success("Customer updated");
      } else {
        await createCustomer({
          name: values.name as string,
          code: (values.code as string) || "",
          contactPerson: values.contactPerson as string,
          email: values.email as string,
          phone: values.phone as string,
          address: values.address as string,
          city: values.city as string,
          country: values.country as string,
        });
        toast.success("Customer created");
      }
      setDialogOpen(false);
    } catch (err: any) {
      toast.error(err.message || "Failed to save customer");
    }
    setLoading(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this customer?")) return;
    await removeCustomer({ id: id as any });
    toast.success("Customer deleted");
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              Customers
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Manage your customer accounts
            </p>
          </div>
          <Button size="sm" className="gap-1.5" onClick={openCreate}>
            <Plus className="size-3.5" />
            Add Customer
          </Button>
        </div>

        <Card className="border-border/60 shadow-none">
          <CardContent className="p-0">
            {customers === undefined ? (
              <div className="p-8 text-center text-sm text-muted-foreground">
                Loading customers...
              </div>
            ) : customers.length === 0 ? (
              <div className="p-8 text-center">
                <Users className="size-8 text-muted-foreground/40 mx-auto mb-3" />
                <p className="text-sm text-muted-foreground">No customers yet</p>
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
                    {customers.map((c) => (
                      <tr key={c._id} className="hover:bg-accent/30 transition-colors">
                        <td className="px-5 py-3">
                          <div className="flex items-center gap-2">
                            <span className="inline-flex rounded border border-border bg-muted px-2 py-0.5 text-xs font-mono text-foreground">
                              {c.code}
                            </span>
                            <div>
                              <p className="font-medium text-foreground">{c.name}</p>
                              <p className="text-xs text-muted-foreground">{c.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-3">
                          <p className="text-foreground">{c.contactPerson}</p>
                          <p className="text-xs text-muted-foreground">{c.phone}</p>
                        </td>
                        <td className="px-5 py-3">
                          <p className="text-foreground">{c.city}, {c.country}</p>
                          <p className="text-xs text-muted-foreground truncate max-w-[200px]">
                            {c.address}
                          </p>
                        </td>
                        <td className="px-5 py-3 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => openEdit(c)}
                              className="p-1.5 rounded hover:bg-accent text-muted-foreground hover:text-foreground transition-colors"
                            >
                              <Pencil className="size-3.5" />
                            </button>
                            <button
                              onClick={() => handleDelete(c._id)}
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
        title="Customer"
        description="Add or edit customer details"
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
