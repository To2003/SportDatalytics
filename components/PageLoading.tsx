import { Loader2 } from "lucide-react";
import DarkPage from "@/components/DarkPage";

// Usado por los `loading.tsx` de cada ruta — Next.js lo muestra automáticamente
// mientras el Server Component de la página siguiente hace sus queries, así que
// cambiar de vista (entrar a un equipo, un partido, etc.) no se queda "en blanco".
export default function PageLoading() {
  return (
    <DarkPage>
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    </DarkPage>
  );
}
