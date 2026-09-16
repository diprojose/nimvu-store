"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import colombiaData from "@/data/colombia.min.json";

export interface AddressFormData {
  first_name: string;
  last_name: string;
  address_1: string;
  company: string;
  postal_code: string;
  city: string;
  country_code: string;
  province: string;
  phone: string;
}

export interface AddressFormProps {
  initialData?: Partial<AddressFormData>;
  onSubmit: (data: AddressFormData) => void;
  onCancel?: () => void;
  loading?: boolean;
  submitLabel?: string;
}

// Separa el address_1 guardado en (calle principal, apto/casa) usando la última coma.
// Permite editar direcciones existentes con el detalle ya en una línea.
const splitAddressUnit = (full: string): { main: string; unit: string } => {
  if (!full) return { main: "", unit: "" };
  const idx = full.lastIndexOf(",");
  if (idx === -1) return { main: full, unit: "" };
  return {
    main: full.substring(0, idx).trim(),
    unit: full.substring(idx + 1).trim(),
  };
};

export default function AddressForm({ initialData, onSubmit, onCancel, loading, submitLabel = "Guardar Dirección" }: AddressFormProps) {
  const initialSplit = splitAddressUnit(initialData?.address_1 || "");

  const [formData, setFormData] = useState<AddressFormData>({
    first_name: "",
    last_name: "",
    company: "",
    postal_code: "",
    city: "",
    country_code: "Colombia",
    province: "",
    phone: "",
    ...(initialData || {}), // Override defaults with initialData si existe
    address_1: initialSplit.main, // Solo la calle principal en el input (sin apto/casa)
  });

  const [unitDetails, setUnitDetails] = useState(initialSplit.unit);
  const [cities, setCities] = useState<string[]>([]);
  const [errors, setErrors] = useState<Partial<Record<keyof AddressFormData, string>>>({});

  // Update cities when province changes
  useEffect(() => {
    if (formData.province) {
      const selectedDept = colombiaData.find((d) => d.departamento === formData.province);
      if (selectedDept) {
        setCities(selectedDept.ciudades);
      } else {
        setCities([]);
      }
    } else {
      // Sin departamento no hay lista de ciudades válida que ofrecer.
      setCities([]);
    }
  }, [formData.province]);

  const handleChange = (field: keyof AddressFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Limpiar el error en cuanto el usuario corrige el campo.
    setErrors((prev) => (prev[field] ? { ...prev, [field]: undefined } : prev));
  };

  const handleProvinceChange = (value: string) => {
    // Cambiar de departamento invalida la ciudad elegida: las ciudades dependen
    // del departamento. Se avisa con un error visible para que el borrado no
    // pase desapercibido (antes se limpiaba en silencio y se enviaba vacía).
    setFormData((prev) => ({ ...prev, province: value, city: "" }));
    setErrors((prev) => ({
      ...prev,
      province: undefined,
      city: "Selecciona la ciudad para este departamento",
    }));
  };

  /**
   * Validación propia. No se delega en el atributo `required` de los Select:
   * Radix monta un <select> nativo oculto que solo incluye una opción vacía
   * cuando el valor es `undefined`. Como aquí la ciudad arranca en "", el
   * navegador da por seleccionada la primera opción de la lista y considera el
   * campo válido, dejando pasar pedidos sin ciudad ni departamento.
   */
  const validate = (): Partial<Record<keyof AddressFormData, string>> => {
    const next: Partial<Record<keyof AddressFormData, string>> = {};

    if (!formData.first_name.trim()) next.first_name = "Ingresa el nombre";
    if (!formData.last_name.trim()) next.last_name = "Ingresa el apellido";
    if (!formData.address_1.trim()) next.address_1 = "Ingresa la dirección";

    const phoneDigits = formData.phone.replace(/\D/g, "");
    if (!phoneDigits) next.phone = "Ingresa el teléfono";
    else if (phoneDigits.length < 7) next.phone = "El teléfono no parece completo";

    if (!formData.province.trim()) next.province = "Selecciona un departamento";

    if (!formData.city.trim()) {
      next.city = "Selecciona una ciudad";
    } else if (cities.length > 0 && !cities.includes(formData.city)) {
      // La ciudad quedó de un departamento anterior y ya no corresponde.
      next.city = "Selecciona una ciudad de este departamento";
    }

    return next;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const found = validate();
    if (Object.keys(found).length > 0) {
      setErrors(found);
      return;
    }

    const main = formData.address_1.trim();
    const unit = unitDetails.trim();
    const combinedAddress = unit ? `${main}, ${unit}` : main;
    const finalPostalCode = formData.postal_code.trim() || "110111";
    setErrors({});
    onSubmit({
      ...formData,
      first_name: formData.first_name.trim(),
      last_name: formData.last_name.trim(),
      phone: formData.phone.trim(),
      city: formData.city.trim(),
      province: formData.province.trim(),
      address_1: combinedAddress,
      postal_code: finalPostalCode,
    });
  };

  /** Mensaje de error bajo un campo. */
  const FieldError = ({ field }: { field: keyof AddressFormData }) =>
    errors[field] ? (
      <p className="text-sm text-red-600" role="alert">
        {errors[field]}
      </p>
    ) : null;

  /** Borde rojo cuando el campo está en error. */
  const errorRing = (field: keyof AddressFormData) =>
    errors[field] ? "border-red-500 focus-visible:ring-red-500" : "";

  // Sort departments alphabetically
  const departments = [...colombiaData].sort((a, b) => a.departamento.localeCompare(b.departamento));

  return (
    // noValidate: toda la validación pasa por validate(), así los mensajes son
    // consistentes e inline en vez de mezclar tooltips nativos con los Select
    // de Radix, cuya validación nativa no es fiable (ver validate()).
    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Nombre *</Label>
          <Input
            autoComplete="given-name"
            aria-invalid={!!errors.first_name}
            className={errorRing("first_name")}
            value={formData.first_name}
            onChange={(e) => handleChange("first_name", e.target.value)}
          />
          <FieldError field="first_name" />
        </div>
        <div className="space-y-2">
          <Label>Apellido *</Label>
          <Input
            autoComplete="family-name"
            aria-invalid={!!errors.last_name}
            className={errorRing("last_name")}
            value={formData.last_name}
            onChange={(e) => handleChange("last_name", e.target.value)}
          />
          <FieldError field="last_name" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Teléfono *</Label>
          <Input
            type="tel"
            autoComplete="tel"
            placeholder="Ej: 300 123 4567"
            aria-invalid={!!errors.phone}
            className={errorRing("phone")}
            value={formData.phone}
            onChange={(e) => handleChange("phone", e.target.value)}
          />
          <FieldError field="phone" />
        </div>
        <div className="space-y-2">
          <Label>Empresa (Opcional)</Label>
          <Input 
            autoComplete="organization"
            value={formData.company} 
            onChange={(e) => handleChange("company", e.target.value)} 
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Dirección *</Label>
          <Input
            autoComplete="address-line1"
            placeholder="Ej: Calle 123 # 45 - 67"
            aria-invalid={!!errors.address_1}
            className={errorRing("address_1")}
            value={formData.address_1}
            onChange={(e) => handleChange("address_1", e.target.value)}
          />
          <FieldError field="address_1" />
        </div>
        <div className="space-y-2">
          <Label>Apto / Casa / Local (Opcional)</Label>
          <Input
            autoComplete="address-line2"
            placeholder="Apto, Casa, Torre, Oficina..."
            value={unitDetails}
            onChange={(e) => setUnitDetails(e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Departamento *</Label>
          {/* Sin `required`: en Radix ese atributo da una falsa sensación de
              seguridad (nunca llega a marcar el campo como vacío). Valida validate(). */}
          <Select value={formData.province || undefined} onValueChange={handleProvinceChange}>
            <SelectTrigger aria-invalid={!!errors.province} className={errorRing("province")}>
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
          <FieldError field="province" />
        </div>

        <div className="space-y-2">
          <Label>Ciudad *</Label>
          <Select
            value={formData.city || undefined}
            onValueChange={(val) => handleChange("city", val)}
            disabled={!formData.province}
          >
            <SelectTrigger aria-invalid={!!errors.city} className={errorRing("city")}>
              <SelectValue
                placeholder={formData.province ? "Selecciona una ciudad" : "Elige primero el departamento"}
              />
            </SelectTrigger>
            <SelectContent className="max-h-[300px]">
              {cities.map((city) => (
                <SelectItem key={city} value={city}>
                  {city}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <FieldError field="city" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Código Postal (Opcional)</Label>
          <Input 
            autoComplete="postal-code"
            placeholder="Ej: 110111"
            value={formData.postal_code} 
            onChange={(e) => handleChange("postal_code", e.target.value)} 
          />
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
