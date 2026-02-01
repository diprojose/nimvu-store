"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react"; // Asumo que tienes lucide-react instalado

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title?: string;
}

export const Modal = ({ isOpen, onClose, children, title }: ModalProps) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    
    // Opcional: Cerrar con la tecla ESC
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [onClose]);

  // Evita errores de hidratación en Next.js
  if (!mounted) return null;

  // Si no está abierto, no renderizamos nada
  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* 1. OVERLAY (FONDO OSCURO) */}
      <div 
        className="fixed inset-0 bg-black/50 transition-opacity backdrop-blur-sm" 
        onClick={onClose} // Cierra al hacer click fuera
      />

      {/* 2. CONTENIDO DEL MODAL */}
      <div className="relative bg-white rounded-lg shadow-xl max-w-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200 w-200">
        
        {/* Cabecera (Opcional) */}
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <h3 className="font-semibold text-lg">{title || "Detalle"}</h3>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-black transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Cuerpo */}
        <div>
          {children}
        </div>
      </div>
    </div>,
    document.body // Se renderiza directamente en el body
  );
};