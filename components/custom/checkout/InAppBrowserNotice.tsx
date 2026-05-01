"use client";

import { useEffect, useState } from "react";
import { AlertTriangle, Copy, Check } from "lucide-react";

const detectInAppBrowser = (): { isInApp: boolean; platform: string } => {
  if (typeof navigator === "undefined") return { isInApp: false, platform: "" };
  const ua = navigator.userAgent || "";
  if (/Instagram/i.test(ua)) return { isInApp: true, platform: "Instagram" };
  if (/FBAN|FBAV|FB_IAB/i.test(ua)) return { isInApp: true, platform: "Facebook" };
  if (/TikTok/i.test(ua)) return { isInApp: true, platform: "TikTok" };
  return { isInApp: false, platform: "" };
};

export function InAppBrowserNotice() {
  const [info, setInfo] = useState<{ isInApp: boolean; platform: string }>({
    isInApp: false,
    platform: "",
  });
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setInfo(detectInAppBrowser());
  }, []);

  if (!info.isInApp) return null;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // ignore
    }
  };

  return (
    <div className="rounded-md border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900">
      <div className="flex items-start gap-3">
        <AlertTriangle className="h-5 w-5 flex-shrink-0 mt-0.5" />
        <div className="flex-1">
          <p className="font-semibold mb-1">
            Estás navegando desde {info.platform}
          </p>
          <p className="mb-3">
            Para que el pago funcione correctamente, abre esta página en tu navegador
            (Chrome, Safari, etc.). Toca el menú <strong>···</strong> arriba a la derecha
            y selecciona <strong>“Abrir en el navegador”</strong>.
          </p>
          <button
            onClick={handleCopy}
            className="inline-flex items-center gap-2 px-3 py-1.5 bg-amber-900 text-white rounded text-xs font-medium hover:bg-amber-800 transition-colors"
          >
            {copied ? (
              <>
                <Check className="h-3.5 w-3.5" /> ¡Copiado!
              </>
            ) : (
              <>
                <Copy className="h-3.5 w-3.5" /> Copiar enlace
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
