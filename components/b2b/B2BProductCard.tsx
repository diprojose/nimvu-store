"use client";

import { useState } from 'react';
import Image from 'next/image';
import { FrontendProduct } from '@/lib/api';
import { useCartStore } from '@/store/cart';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

interface B2BProductCardProps {
  product: FrontendProduct;
}

export function B2BProductCard({ product }: B2BProductCardProps) {
  const [quantity, setQuantity] = useState(12);
  const [isCustom, setIsCustom] = useState(false);
  const addItem = useCartStore((state) => state.addItem);

  // Generamos los escalafones de descuento B2B mediante regla global matemática
  const tiers = [
    { batchSize: 12, price: product.price * 0.90 }, // 10% de descuento
    { batchSize: 50, price: product.price * 0.80 }, // 20% de descuento
    { batchSize: 200, price: product.price * 0.75 } // 25% de descuento
  ];

  const handleAddToCart = () => {
    let finalQty = quantity;
    if (finalQty < 12) finalQty = 12; // Validación de seguridad mínima

    addItem(product, product.variants?.[0]?.id || product.id, finalQty);

    toast.success(`${finalQty} x ${product.title} agregados al carrito`);
    if (isCustom) setIsCustom(false);
    setQuantity(12);
  };

  const sku = `NIM-${product.id.substring(0, 6).toUpperCase()}`;

  // Calcular precio unitario estimado para mostrar en el botón
  let estimatedPrice = product.price;
  if (quantity >= 200) estimatedPrice = product.price * 0.75;
  else if (quantity >= 50) estimatedPrice = product.price * 0.80;
  else if (quantity >= 12) estimatedPrice = product.price * 0.90;

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-md transition-shadow flex flex-col">
      <div className="relative aspect-square bg-gray-100">
        <Image
          src={product.thumbnail || '/placeholder.jpg'}
          alt={product.title}
          fill
          className="object-cover"
          unoptimized
        />
        <div className="absolute top-2 right-2 bg-blue-600 text-white text-[10px] font-bold px-2 py-1 rounded">
          PRECIOS POR VOLUMEN
        </div>
      </div>

      <div className="p-5 flex-grow flex flex-col">
        <h3 className="font-bold text-gray-900 text-lg leading-tight mb-1">{product.title}</h3>
        <p className="text-xs text-gray-500 mb-4">SKU: {sku}</p>

        <div className="mt-auto">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Seleccionar Volumen</p>

          <div className="grid grid-cols-2 gap-2 mb-4">
            {tiers.map((tier, idx) => (
              <div
                key={idx}
                className={`border rounded px-1 flex flex-col items-center justify-center py-2 cursor-pointer transition-colors ${!isCustom && quantity === tier.batchSize ? 'border-blue-600 bg-blue-50 ring-1 ring-blue-600' : 'border-gray-200 hover:border-blue-400'}`}
                onClick={() => { setIsCustom(false); setQuantity(tier.batchSize); }}
              >
                <span className="text-[10px] font-bold text-blue-600">Volumen {tier.batchSize}</span>
                <span className="text-sm font-bold text-gray-900">${tier.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              </div>
            ))}
            
            <div
              className={`border rounded px-1 flex flex-col items-center justify-center py-2 cursor-pointer transition-colors ${isCustom ? 'border-blue-600 bg-blue-50 ring-1 ring-blue-600' : 'border-gray-200 hover:border-blue-400'}`}
              onClick={() => setIsCustom(true)}
            >
              <span className="text-[10px] font-bold text-blue-600">Personalizado</span>
              <span className="text-[10px] font-medium text-gray-500 mt-1">Más de 12 unid.</span>
            </div>
          </div>

          <div className="mb-4 relative pb-5">
            <label className={`text-[10px] font-bold uppercase tracking-widest block mb-2 transition-colors ${isCustom ? 'text-gray-600' : 'text-gray-400'}`}>
              Cantidad a Operar
            </label>
            <Input
              type="number"
              min="12"
              value={quantity}
              onChange={(e) => setQuantity(parseInt(e.target.value) || 0)}
              className={`w-full font-medium transition-all ${!isCustom ? 'bg-gray-50 opacity-60 cursor-not-allowed text-gray-400' : ''}`}
              placeholder="Mínimo 12"
              disabled={!isCustom}
            />
            {isCustom && quantity < 12 && quantity > 0 && (
              <p className="text-red-500 text-[10px] mt-1 absolute bottom-1 left-0 leading-tight">Mínimo B2B es 12 unid.</p>
            )}
          </div>

          <Button 
            onClick={handleAddToCart} 
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm flex flex-col h-auto py-2"
            disabled={isCustom && quantity < 12}
          >
            <span>Agregar {Math.max(quantity, 12)} unidades</span>
            <span className="text-[10px] font-normal opacity-80 mt-0.5">
              ${(Math.max(quantity, 12) * estimatedPrice).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} en total
            </span>
          </Button>
        </div>
      </div>
    </div>
  );
}
