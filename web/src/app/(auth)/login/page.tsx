"use client";

import { useEffect, useRef, useState } from "react";

import { useRouter } from "next/navigation";

import { AlertTriangle, ShieldCheck } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogClose, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { api } from "@/lib/api";
import { auth } from "@/lib/auth";

export default function LoginPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);
  const [agreed, setAgreed] = useState(false);
  const [termsOpen, setTermsOpen] = useState(false);
  const [readToEnd, setReadToEnd] = useState(false);
  const termsBodyRef = useRef<HTMLDivElement>(null);

  // 滚动到条款底部（含无需滚动即可完整展示的情况）方可点击「同意」。
  function handleTermsScroll() {
    const el = termsBodyRef.current;
    if (!el) return;
    if (el.scrollTop + el.clientHeight >= el.scrollHeight - 8) setReadToEnd(true);
  }

  useEffect(() => {
    if (!termsOpen) return;
    // 打开时重置，并处理内容本就不足一屏、无法触发滚动的场景。
    setReadToEnd(false);
    const el = termsBodyRef.current;
    if (el && el.scrollHeight <= el.clientHeight + 8) setReadToEnd(true);
  }, [termsOpen]);

  useEffect(() => {
    // 已登录直接进主界面（静态导出下无 middleware 代劳这层跳转）。
    const token = auth.getToken();
    if (token) {
      // localStorage 可能仍有凭据但 cookie 已丢失。先同步，再发起全新请求，
      // 避免服务端守卫或路由缓存把跳转送回仍处于 checking 状态的登录页。
      auth.setToken(token);
      window.location.replace("/function/tasks");
      return;
    }
    api
      .authStatus()
      .then(({ initialized }) => {
        if (!initialized) router.replace("/setup");
      })
      .catch(() => setError("No se pudo conectar con el servidor"))
      .finally(() => setChecking(false));
  }, [router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!agreed) {
      setError("Lee y acepta las condiciones de uso primero");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const { token } = await api.login("ARTEX", password);
      auth.setToken(token);
      window.location.replace("/function/tasks");
    } catch {
      setError("Usuario o contraseña incorrectos");
    } finally {
      setLoading(false);
    }
  }

  if (checking) {
    return (
      <div role="status" className="flex min-h-dvh items-center justify-center text-muted-foreground">
        Comprobando el estado de la sesión…
      </div>
    );
  }

  return (
    <div className="flex h-dvh">
      {/* Left panel */}
      <div className="hidden flex-col items-center justify-center bg-primary p-12 text-center lg:flex lg:w-1/3">
        <div className="relative flex items-center justify-center">
          <div className="absolute size-80 rounded-full border border-primary-foreground/10" />
          <div className="absolute size-60 rounded-full border border-primary-foreground/15" />
          <div className="absolute size-40 rounded-full border border-primary-foreground/20" />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.png" alt="ARTEX" width={160} height={160} className="relative brightness-0 invert" />
        </div>
      </div>

      {/* Right panel */}
      <div className="flex w-full items-center justify-center bg-background p-8 lg:w-2/3">
        <div className="w-full max-w-md space-y-10 py-24 lg:py-32">
          <div className="space-y-4 text-center">
            <h2 className="text-2xl font-medium tracking-tight">Iniciar sesión</h2>
            <p className="mx-auto max-w-xl text-muted-foreground">Te damos la bienvenida. Introduce tu contraseña para continuar en ARTEX.</p>
          </div>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="username">Usuario</Label>
              <Input id="username" value="ARTEX" readOnly className="bg-muted text-muted-foreground" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="password">Contraseña</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Introduce tu contraseña"
                autoFocus
                autoComplete="current-password"
              />
            </div>
            <div className="flex items-start gap-2">
              <Checkbox
                id="agree-terms"
                checked={agreed}
                onCheckedChange={(v) => setAgreed(v === true)}
                className="mt-0.5"
              />
              <Label htmlFor="agree-terms" className="text-sm font-normal leading-relaxed text-muted-foreground">
                He leído y acepto{" "}
                <button
                  type="button"
                  onClick={() => setTermsOpen(true)}
                  className="mx-0.5 font-medium text-primary underline-offset-4 hover:underline"
                >
                  las condiciones de uso
                </button>
              </Label>
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
            <Button type="submit" className="w-full" disabled={loading || !password || !agreed}>
              {loading ? "Iniciando sesión..." : "Iniciar sesión"}
            </Button>
          </form>
        </div>
      </div>

      <Dialog open={termsOpen} onOpenChange={setTermsOpen}>
        <DialogContent className="gap-0 p-0 sm:max-w-2xl">
          <DialogHeader className="flex-row items-center gap-3 border-b px-6 py-4">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <ShieldCheck className="size-5" />
            </div>
            <div className="space-y-0.5">
              <DialogTitle className="text-base">Condiciones de uso y exención de responsabilidad de ARTEX</DialogTitle>
              <p className="text-xs text-muted-foreground">
                Versión 1.0 · Vigente desde el 18 de septiembre de 2026 · Lee todas las condiciones antes de iniciar sesión.
              </p>
            </div>
          </DialogHeader>

          <div
            ref={termsBodyRef}
            onScroll={handleTermsScroll}
            className="max-h-[60vh] space-y-5 overflow-y-auto px-6 py-5 text-sm leading-relaxed text-muted-foreground"
          >
            <p className="rounded-lg border bg-muted/40 p-3 text-foreground/80">
              Estas condiciones de uso y exención de responsabilidad (en adelante, «el aviso») constituyen un acuerdo entre tú y los
              autores y colaboradores de ARTEX sobre el uso de este software. Lee cuidadosamente y comprende todas las condiciones antes de utilizarlo, especialmente las limitaciones de responsabilidad y las prohibiciones destacadas.
              <span className="font-medium text-foreground">
                {" "}
                Al descargar, instalar, acceder o usar este software de cualquier forma, declaras haber leído, comprendido y aceptado todas estas condiciones.
              </span>
            </p>

            <section className="space-y-1.5">
              <h4 className="flex items-center gap-2 font-medium text-foreground">
                <span className="flex size-5 items-center justify-center rounded-md bg-muted text-xs font-semibold text-muted-foreground">
                  1
                </span>
                Artículo 1 · Definiciones y licencia de código abierto
              </h4>
              <p className="pl-7">
                ARTEX es un programa de código abierto distribuido bajo la licencia GNU Affero General Public License
                versión 3.0 (AGPL-3.0). Puedes utilizar, copiar, modificar y distribuir el software conforme a esa licencia; cualquier obra derivada, incluidos los servicios ofrecidos a terceros por Internet, también deberá distribuirse bajo la
                licencia AGPL-3.0 y facilitar su código fuente correspondiente a los usuarios. El texto de la licencia incluido en LICENSE es el que prevalece.
              </p>
            </section>

            <section className="space-y-1.5">
              <h4 className="flex items-center gap-2 font-medium text-foreground">
                <span className="flex size-5 items-center justify-center rounded-md bg-muted text-xs font-semibold text-muted-foreground">
                  2
                </span>
                Artículo 2 · Usos permitidos
              </h4>
              <p className="pl-7">
                Este software está destinado exclusivamente al aprendizaje personal, la investigación del código, el estudio de conceptos de seguridad informática y las verificaciones técnicas en entornos locales aislados creados por el usuario. Solo se permiten actividades educativas, académicas, de revisión de código y otras no ofensivas ni destructivas.
              </p>
            </section>

            <section className="space-y-2">
              <h4 className="flex items-center gap-2 font-medium text-destructive">
                <span className="flex size-5 items-center justify-center rounded-md bg-destructive/10 text-xs font-semibold text-destructive">
                  3
                </span>
                <AlertTriangle className="size-4" />
                Artículo 3 · Actividades prohibidas
              </h4>
              <ul className="ml-7 list-decimal space-y-1.5 rounded-lg border border-destructive/20 bg-destructive/5 p-3 pl-8 text-foreground/80 marker:text-destructive/70">
                <li>
                  Queda prohibido escanear, sondear, explotar o atacar cualquier sitio web, servicio en línea o sistema conectado a una red, independientemente de su titularidad o autorización;
                </li>
                <li>Queda prohibido utilizar este software en pruebas de penetración reales, ejercicios de confrontación ofensiva/defensiva o entornos de producción;</li>
                <li>Queda prohibido utilizarlo para intrusiones ilegales, robo de datos, extorsión, denegación de servicio (DoS/DDoS) u otras actividades destructivas o delictivas;</li>
                <li>Queda prohibido eliminar, modificar o eludir los avisos de derechos de autor, licencia o seguridad presentes en el software o sus resultados;</li>
                <li>Queda prohibida cualquier actividad contraria a las leyes o normativas aplicables en tu país o región.</li>
              </ul>
            </section>

            <section className="space-y-1.5">
              <h4 className="flex items-center gap-2 font-medium text-foreground">
                <span className="flex size-5 items-center justify-center rounded-md bg-muted text-xs font-semibold text-muted-foreground">
                  4
                </span>
                Artículo 4 · Propiedad intelectual
              </h4>
              <p className="pl-7">
                Los derechos de autor y otros derechos de propiedad intelectual del software pertenecen a sus autores y colaboradores. Se te conceden los derechos establecidos en la
                licencia AGPL-3.0; este aviso no concede ningún otro derecho, explícito o implícito.
              </p>
            </section>

            <section className="space-y-1.5">
              <h4 className="flex items-center gap-2 font-medium text-foreground">
                <span className="flex size-5 items-center justify-center rounded-md bg-muted text-xs font-semibold text-muted-foreground">
                  5
                </span>
                Artículo 5 · Datos y privacidad
              </h4>
              <p className="pl-7">
                Este programa es de código abierto y puede alojarse por cuenta propia. Sus autores no operan un servicio centralizado ni recopilan o cargan tus datos de uso. Eres responsable de la legalidad y seguridad de los datos que generes, proceses o utilices, así como de las consecuencias de su tratamiento inadecuado.
              </p>
            </section>

            <section className="space-y-1.5">
              <h4 className="flex items-center gap-2 font-medium text-foreground">
                <span className="flex size-5 items-center justify-center rounded-md bg-muted text-xs font-semibold text-muted-foreground">
                  6
                </span>
                Artículo 6 · Cumplimiento normativo y responsabilidad legal
              </h4>
              <p className="pl-7">
                Debes cumplir las leyes aplicables a la ciberseguridad, protección de datos y delitos informáticos en tu jurisdicción, incluidas, en China continental, la Ley de Ciberseguridad, la Ley de Seguridad de Datos y la Ley de Protección de Información Personal, entre otras.
                <span className="font-medium text-foreground">
                  {" "}
                  Asumes personalmente las consecuencias y responsabilidades legales derivadas de cualquier incumplimiento de esas leyes o de este aviso; los autores y colaboradores no serán responsables de ello.
                </span>
              </p>
            </section>

            <section className="space-y-1.5">
              <h4 className="flex items-center gap-2 font-medium text-foreground">
                <span className="flex size-5 items-center justify-center rounded-md bg-muted text-xs font-semibold text-muted-foreground">
                  7
                </span>
                Artículo 7 · Exención y limitación de responsabilidad
              </h4>
              <p className="pl-7">
                El software se proporciona «tal cual» (AS IS) y «según disponibilidad» (AS
                AVAILABLE), sin garantías expresas o implícitas, incluidas las de comerciabilidad, idoneidad para un fin particular, exactitud o no infracción. Hasta donde lo permita la ley, los autores y colaboradores no serán responsables de daños directos, indirectos, incidentales, especiales o consecuentes derivados del uso o imposibilidad de uso, incluidos pérdida de datos, daños a sistemas, interrupciones, pérdidas económicas o litigios.
              </p>
            </section>

            <section className="space-y-1.5">
              <h4 className="flex items-center gap-2 font-medium text-foreground">
                <span className="flex size-5 items-center justify-center rounded-md bg-muted text-xs font-semibold text-muted-foreground">
                  8
                </span>
                Artículo 8 · Modificación e interpretación de las condiciones
              </h4>
              <p className="pl-7">
                Los autores pueden actualizar estas condiciones para adaptarlas a la legislación o a las necesidades del proyecto. Las versiones actualizadas entrarán en vigor al publicarse; continuar utilizando el software implica aceptarlas. En la medida permitida por la ley, los autores conservan la facultad de interpretar estas condiciones. Si una disposición resultara inválida, las demás seguirán vigentes.
              </p>
            </section>
          </div>

          <DialogFooter className="mx-0 mb-0 flex-col items-stretch gap-2 rounded-b-xl px-6 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs text-muted-foreground">
              {readToEnd ? "Has revisado todas las condiciones" : "Desplázate hasta el final para confirmar"}
            </p>
            <DialogClose asChild>
              <Button
                type="button"
                disabled={!readToEnd}
                onClick={() => {
                  setAgreed(true);
                  setError("");
                }}
              >
                He leído y acepto todas las condiciones
              </Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
