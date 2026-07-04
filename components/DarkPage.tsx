import type { ReactNode } from "react";

// El <main> compartido en app/layout.tsx tiene `max-w-3xl mx-auto p-4` para las
// páginas viejas (todavía con el look claro). Cancelar el padding con márgenes
// negativos (como hacíamos antes) no alcanza: el fondo oscuro seguía preso
// dentro del `max-w-3xl` de <main>, dejando ver el fondo claro viejo en los
// costados en pantallas anchas. El truco real es el clásico "full-bleed":
// `w-screen` + margin calculado para centrar respecto al viewport, no al
// contenedor — así el fondo cubre TODO el ancho sin importar los límites de
// <main>. El contenido interno vuelve a acotarse a max-w-3xl para que se siga
// leyendo igual de cómodo.
// Esto es transitorio: cuando todas las páginas estén migradas, este wrapper
// se puede borrar y mover `bg-background` directo al `body`.
export default function DarkPage({ children }: { children: ReactNode }) {
  return (
    <div className="relative w-screen ml-[calc(50%-50vw)] mr-[calc(50%-50vw)] -mt-4 sm:-mt-6 min-h-[calc(100dvh-57px)] bg-background text-foreground">
      <div className="max-w-3xl mx-auto px-4 pt-6 pb-10 sm:px-6 sm:pb-14">{children}</div>
    </div>
  );
}
