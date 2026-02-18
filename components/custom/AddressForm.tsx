"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import colombiaData from "@/data/colombia.min.json";

interface AddressFormProps {
  initialData?: any;
  onSubmit: (data: any) => void;
  onCancel?: () => void;
  loading?: boolean;
  submitLabel?: string;
}

export default function AddressForm({ initialData, onSubmit, onCancel, loading, submitLabel = "Guardar Dirección" }: AddressFormProps) {
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    address_1: "",
    company: "",
    postal_code: "",
    city: "",
    country_code: "Colombia",
    province: "",
    phone: "",
    ...initialData // Override defaults with initialData if present
  });

  const [cities, setCities] = useState<string[]>([]);

  // Update cities when province changes
  useEffect(() => {
    if (formData.province) {
      const selectedDept = colombiaData.find((d) => d.departamento === formData.province);
      if (selectedDept) {
        setCities(selectedDept.ciudades);
      } else {
        setCities([]);
      }
    }
  }, [formData.province]);

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleProvinceChange = (value: string) => {
    setFormData((prev) => ({ ...prev, province: value, city: "" })); // Reset city when department changes
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  // Sort departments alphabetically
  const departments = [...colombiaData].sort((a, b) => a.departamento.localeCompare(b.departamento));

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Nombre *</Label>
          <Input required value={formData.first_name} onChange={(e) => handleChange("first_name", e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label>Apellido *</Label>
          <Input required value={formData.last_name} onChange={(e) => handleChange("last_name", e.target.value)} />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Teléfono *</Label>
          <Input required value={formData.phone} onChange={(e) => handleChange("phone", e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label>Empresa (Opcional)</Label>
          <Input value={formData.company} onChange={(e) => handleChange("company", e.target.value)} />
        </div>
      </div>

      <div className="space-y-2">
        <Label>Dirección *</Label>
        <Input required placeholder="Calle 123 # 45 - 67" value={formData.address_1} onChange={(e) => handleChange("address_1", e.target.value)} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Departamento *</Label>
          <Select value={formData.province} onValueChange={handleProvinceChange} required>
            <SelectTrigger>
              <SelectValue placeholder="Selecciona un departamento" />
            </SelectTrigger>
            <SelectContent className="max-h-[300px]">
              {departments.map((dept) => (
                <SelectItem key={dept.id} value={dept.departamento}>
                  {dept.departamento}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Ciudad *</Label>
          <Select value={formData.city} onValueChange={(val) => handleChange("city", val)} required disabled={!formData.province}>
            <SelectTrigger>
              <SelectValue placeholder="Selecciona una ciudad" />
            </SelectTrigger>
            <SelectContent className="max-h-[300px]">
              {cities.map((city) => (
                <SelectItem key={city} value={city}>
                  {city}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Código Postal *</Label>
          <Input required value={formData.postal_code} onChange={(e) => handleChange("postal_code", e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label>País</Label>
          <Input value="Colombia" disabled className="bg-gray-100" />
        </div>
      </div>

      <div className="md:col-span-2 pt-4 flex gap-3">
        <Button type="submit" className="flex-1 bg-black text-white hover:bg-gray-800" disabled={loading}>
          {loading ? "Guardando..." : submitLabel}
        </Button>
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancelar
          </Button>
        )}
      </div>
    </form>
  );
}
