import Link from "next/link";
import { signup } from "./actions";
import GoogleSignInButton from "@/components/GoogleSignInButton";
import DarkPage from "@/components/DarkPage";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import SubmitButton from "@/components/SubmitButton";

export default async function SignupPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  return (
    <DarkPage>
      <div className="max-w-sm mx-auto flex flex-col items-center gap-6 py-6">
        <div className="text-center">
          <p className="font-heading text-2xl font-bold uppercase tracking-widest">
            Sports Datalytics
          </p>
          <p className="text-sm text-muted-foreground mt-1">
            Creá tu cuenta y empezá a gestionar convocatorias y estadísticas.
          </p>
        </div>

        <Card className="w-full">
          <CardContent className="flex flex-col gap-4">
            {error && <p className="text-sm text-destructive">{error}</p>}
            <form action={signup} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="signup-email">Email</Label>
                <Input id="signup-email" name="email" type="email" required placeholder="vos@email.com" />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="signup-password">Contraseña</Label>
                <Input
                  id="signup-password"
                  name="password"
                  type="password"
                  required
                  minLength={6}
                  placeholder="••••••••"
                />
              </div>
              <SubmitButton
                variant="secondary"
                className="w-full mt-1"
                pendingLabel="Creando cuenta..."
              >
                Crear cuenta
              </SubmitButton>
            </form>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <div className="flex-1 border-t border-border" />o
              <div className="flex-1 border-t border-border" />
            </div>
            <GoogleSignInButton />
          </CardContent>
        </Card>

        <p className="text-sm text-muted-foreground">
          ¿Ya tenés cuenta?{" "}
          <Link href="/login" className="font-medium text-primary hover:underline">
            Ingresar
          </Link>
        </p>
      </div>
    </DarkPage>
  );
}
