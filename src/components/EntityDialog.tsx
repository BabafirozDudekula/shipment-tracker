import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState, useEffect } from "react";

export interface FieldDef {
  name: string;
  label: string;
  type?: "text" | "number" | "email" | "textarea" | "select";
  placeholder?: string;
  required?: boolean;
  options?: string[];
}

interface EntityDialogProps {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  fields: FieldDef[];
  values: Record<string, string | number>;
  onChange: (name: string, value: string | number) => void;
  onSubmit: () => void;
  isEditing?: boolean;
  loading?: boolean;
}

export function EntityDialog({
  open,
  onClose,
  title,
  description,
  fields,
  values,
  onChange,
  onSubmit,
  isEditing,
  loading,
}: EntityDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEditing ? `Edit ${title}` : `New ${title}`}</DialogTitle>
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            onSubmit();
          }}
          className="space-y-4 mt-2"
        >
          {fields.map((field) => (
            <div key={field.name} className="space-y-1.5">
              <Label className="text-xs font-medium text-muted-foreground">
                {field.label}
                {field.required !== false && (
                  <span className="text-destructive ml-0.5">*</span>
                )}
              </Label>
              {field.type === "select" && field.options ? (
                <select
                  value={values[field.name] ?? ""}
                  onChange={(e) => onChange(field.name, e.target.value)}
                  className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  required={field.required !== false}
                >
                  <option value="">Select...</option>
                  {field.options.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              ) : field.type === "textarea" ? (
                <textarea
                  value={values[field.name] ?? ""}
                  onChange={(e) => onChange(field.name, e.target.value)}
                  placeholder={field.placeholder}
                  className="flex min-h-[80px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  required={field.required !== false}
                />
              ) : (
                <Input
                  type={field.type || "text"}
                  value={values[field.name] ?? ""}
                  onChange={(e) =>
                    onChange(
                      field.name,
                      field.type === "number"
                        ? e.target.value === ""
                          ? ""
                          : Number(e.target.value)
                        : e.target.value,
                    )
                  }
                  placeholder={field.placeholder}
                  required={field.required !== false}
                  min={field.type === "number" ? 0 : undefined}
                />
              )}
            </div>
          ))}
          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Saving..." : isEditing ? "Update" : "Create"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
