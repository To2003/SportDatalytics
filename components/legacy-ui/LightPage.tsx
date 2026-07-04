import type { ReactNode } from "react";

// Contraparte de components/DarkPage.tsx: ahora que el `body` de base es dark,
// /profile (la única página que sigue con el look claro/legacy) necesita su
// propio full-bleed claro, con el mismo truco de w-screen + margen contra el
// viewport (ver comentario en DarkPage.tsx para el detalle técnico).
//
// El fondo va como `background` directo del div exterior (no en un hijo
// `absolute inset-0`): un hijo absoluto no participa del alto automático del
// padre, así que si el contenido es más alto que el viewport, el fondo podía
// quedarse corto y dejar ver el negro del `body` de base al scrollear.
export default function LightPage({ children }: { children: ReactNode }) {
  return (
    <div
      className="relative w-screen ml-[calc(50%-50vw)] mr-[calc(50%-50vw)] -mt-4 sm:-mt-6 min-h-[calc(100dvh-57px)] text-[#14231c]"
      style={{
        background:
          "radial-gradient(1200px 600px at 100% -10%, color-mix(in srgb, #aeedc8 35%, transparent), transparent), radial-gradient(900px 500px at -10% 0%, color-mix(in srgb, #fdba74 25%, transparent), transparent), #f6f8f5",
      }}
    >
      <div className="max-w-3xl mx-auto px-4 pt-6 pb-10 sm:px-6 sm:pb-14">{children}</div>
    </div>
  );
}
