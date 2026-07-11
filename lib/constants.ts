/**
 * Umbral (en COP) a partir del cual el envío es gratis.
 *
 * Se usa solo para la UX (franja superior, resumen del checkout). El backend
 * mantiene su propia copia autoritativa y recalcula el envío al crear la orden,
 * así que este valor no puede ser explotado para obtener envío gratis indebido.
 * Si cambias el monto, actualízalo también en el backend
 * (`src/shipping/shipping.service.ts` → FREE_SHIPPING_THRESHOLD).
 */
export const FREE_SHIPPING_THRESHOLD = 150000;
