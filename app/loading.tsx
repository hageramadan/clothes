// app/loading.tsx
import { Loader2 } from "lucide-react";

export default function Loading() {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-white">
      <div className="text-center">
        <Loader2 className="h-12 w-12 animate-spin text-red-500 mx-auto mb-4" />
        <p className="text-[#112B40] font-semibold">جاري التحميل...</p>
      </div>
    </div>
  );
}