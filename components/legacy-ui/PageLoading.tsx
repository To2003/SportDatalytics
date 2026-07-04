import { Loader2 } from "lucide-react";
import LightPage from "@/components/legacy-ui/LightPage";

export default function PageLoading() {
  return (
    <LightPage>
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-brand-600" />
      </div>
    </LightPage>
  );
}
