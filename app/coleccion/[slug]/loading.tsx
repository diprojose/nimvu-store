import { Loader2 } from "lucide-react";

export default function Loading() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] w-full">
      <Loader2 className="w-8 h-8 animate-spin text-purple-900 mb-4" />
      <p className="text-gray-500 font-medium">Preparando colección...</p>
    </div>
  );
}
