import { useState, useEffect } from "react";
import { Link } from "wouter";
import { trpc } from "@/lib/trpc";
import { Card, CardContent } from "@/components/ui/card";
import { Users, Globe, MapPin, Clock, Lightbulb, AlertTriangle, ChevronRight } from "lucide-react";

const bootSequence = [
  { text: "[SYSTEM] Initializing G.A.I.A. Operating System...", delay: 0 },
  { text: "[KERNEL] Loading neural network modules...", delay: 400 },
  { text: "[MEMORY] Allocating quantum memory banks...", delay: 800 },
  { text: "[CHAITZ] Establishing connection to energy matrix...", delay: 1200 },
  { text: "[DATABASE] Mounting lore archives...", delay: 1600 },
  { text: "[SECURITY] Verifying Doctor credentials...", delay: 2000 },
  { text: "[STATUS] All systems operational.", delay: 2400 },
  { text: "", delay: 2800 },
  { text: "╔══════════════════════════════════════════════════════════╗", delay: 3000 },
  { text: "║                                                          ║", delay: 3050 },
  { text: "║     ██████╗  █████╗ ██╗ █████╗                          ║", delay: 3100 },
  { text: "║    ██╔════╝ ██╔══██╗██║██╔══██╗                         ║", delay: 3150 },
  { text: "║    ██║  ███╗███████║██║███████║                         ║", delay: 3200 },
  { text: "║    ██║   ██║██╔══██║██║██╔══██║                         ║", delay: 3250 },
  { text: "║    ╚██████╔╝██║  ██║██║██║  ██║                         ║", delay: 3300 },
  { text: "║     ╚═════╝ ╚═╝  ╚═╝╚═╝╚═╝  ╚═╝                         ║", delay: 3350 },
  { text: "║                                                          ║", delay: 3400 },
  { text: "║            G 01 1 01 - UNIVERSE DATABASE                 ║", delay: 3450 },
  { text: "║                                                          ║", delay: 3500 },
  { text: "╚══════════════════════════════════════════════════════════╝", delay: 3550 },
  { text: "", delay: 3600 },
  { text: "Bienvenido, Doctor. Sistema listo para recibir comandos.", delay: 3800 },
];

const quickLinks = [
  { path: "/characters", label: "Personajes", icon: Users, count: "characters", color: "primary" },
  { path: "/factions", label: "Facciones", icon: Globe, count: "factions", color: "secondary" },
  { path: "/locations", label: "Ubicaciones", icon: MapPin, count: "locations", color: "primary" },
  { path: "/timeline", label: "Cronología", icon: Clock, count: "events", color: "secondary" },
  { path: "/concepts", label: "Conceptos", icon: Lightbulb, count: "concepts", color: "primary" },
];

export default function Home() {
  const [visibleLines, setVisibleLines] = useState<number>(0);
  const [bootComplete, setBootComplete] = useState(false);

  const { data: characters } = trpc.characters.list.useQuery();
  const { data: factions } = trpc.factions.list.useQuery();
  const { data: locations } = trpc.locations.list.useQuery();
  const { data: events } = trpc.events.list.useQuery();
  const { data: concepts } = trpc.concepts.list.useQuery();
  const { data: glitches } = trpc.glitches.unresolved.useQuery();

  const counts: Record<string, number> = {
    characters: characters?.length || 0,
    factions: factions?.length || 0,
    locations: locations?.length || 0,
    events: events?.length || 0,
    concepts: concepts?.length || 0,
  };

  useEffect(() => {
    const timers: NodeJS.Timeout[] = [];
    bootSequence.forEach((line, index) => {
      const timer = setTimeout(() => {
        setVisibleLines(index + 1);
        if (index === bootSequence.length - 1) {
          setTimeout(() => setBootComplete(true), 500);
        }
      }, line.delay);
      timers.push(timer);
    });
    return () => timers.forEach(clearTimeout);
  }, []);

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Terminal Boot Sequence */}
      <Card className="terminal-card overflow-hidden">
        <CardContent className="p-0">
          <div className="bg-card/50 px-4 py-2 border-b border-border flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-destructive" />
            <div className="w-3 h-3 rounded-full bg-chart-4" />
            <div className="w-3 h-3 rounded-full bg-chart-3" />
            <span className="ml-4 text-xs text-muted-foreground">GaiOs Terminal v01.101</span>
          </div>
          <div className="p-6 font-mono text-sm min-h-[400px] terminal-flicker">
            {bootSequence.slice(0, visibleLines).map((line, index) => (
              <div
                key={index}
                className={`${
                  line.text.startsWith("[SYSTEM]") || line.text.startsWith("[STATUS]")
                    ? "text-primary neon-glow"
                    : line.text.startsWith("[")
                    ? "text-muted-foreground"
                    : line.text.includes("═") || line.text.includes("║") || line.text.includes("█")
                    ? "text-secondary neon-glow-magenta"
                    : line.text.includes("Bienvenido")
                    ? "text-primary neon-glow mt-2"
                    : "text-foreground"
                }`}
              >
                {line.text}
                {index === visibleLines - 1 && !bootComplete && (
                  <span className="inline-block w-2 h-4 bg-primary ml-1 animate-pulse" />
                )}
              </div>
            ))}
            {bootComplete && (
              <div className="mt-4 flex items-center text-primary">
                <span className="text-secondary">root@gaia</span>
                <span className="text-muted-foreground">:</span>
                <span className="text-primary">~</span>
                <span className="text-muted-foreground">$</span>
                <span className="ml-2 cursor-blink pl-1">_</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Quick Access Grid */}
      {bootComplete && (
        <div className="space-y-6 animate-in fade-in duration-500">
          <div className="flex items-center gap-4">
            <h2 className="text-lg font-bold text-primary" style={{ fontFamily: 'Orbitron, sans-serif' }}>
              MÓDULOS DISPONIBLES
            </h2>
            <div className="flex-1 h-px bg-gradient-to-r from-primary/50 to-transparent" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {quickLinks.map((link) => {
              const Icon = link.icon;
              const isSecondary = link.color === "secondary";
              return (
                <Link key={link.path} href={link.path}>
                  <Card className={`terminal-card hover:scale-[1.02] transition-all cursor-pointer group ${
                    isSecondary ? "hover:neon-border-magenta" : "hover:neon-border"
                  }`}>
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div className={`p-3 rounded ${isSecondary ? "bg-secondary/10" : "bg-primary/10"}`}>
                          <Icon className={`w-6 h-6 ${isSecondary ? "text-secondary" : "text-primary"}`} />
                        </div>
                        <ChevronRight className={`w-5 h-5 opacity-0 group-hover:opacity-100 transition-opacity ${
                          isSecondary ? "text-secondary" : "text-primary"
                        }`} />
                      </div>
                      <h3 className={`mt-4 font-bold ${isSecondary ? "text-secondary" : "text-primary"}`} style={{ fontFamily: 'Orbitron, sans-serif' }}>
                        {link.label.toUpperCase()}
                      </h3>
                      <p className="text-muted-foreground text-sm mt-1">
                        {counts[link.count]} {counts[link.count] === 1 ? "registro" : "registros"} en base de datos
                      </p>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}

            {/* Glitches Card */}
            {(glitches?.length || 0) > 0 && (
              <Link href="/admin">
                <Card className="terminal-card hover:scale-[1.02] transition-all cursor-pointer group border-destructive/50 hover:border-destructive">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="p-3 rounded bg-destructive/10">
                        <AlertTriangle className="w-6 h-6 text-destructive glitch-text" />
                      </div>
                      <span className="bg-destructive text-destructive-foreground text-xs px-2 py-1 rounded-full">
                        {glitches?.length} CRÍTICOS
                      </span>
                    </div>
                    <h3 className="mt-4 font-bold text-destructive" style={{ fontFamily: 'Orbitron, sans-serif' }}>
                      GLITCHES DETECTADOS
                    </h3>
                    <p className="text-muted-foreground text-sm mt-1">
                      Conflictos narrativos requieren resolución
                    </p>
                  </CardContent>
                </Card>
              </Link>
            )}
          </div>

          {/* System Info */}
          <Card className="terminal-card">
            <CardContent className="p-6">
              <div className="flex items-center gap-4 mb-4">
                <h3 className="text-sm font-bold text-primary" style={{ fontFamily: 'Orbitron, sans-serif' }}>
                  ESTADO DEL SISTEMA
                </h3>
                <div className="flex-1 h-px bg-gradient-to-r from-primary/50 to-transparent" />
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Versión:</span>
                  <span className="text-primary ml-2">v01.101</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Chaitz:</span>
                  <span className="text-chart-3 ml-2">ESTABLE</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Conexión:</span>
                  <span className="text-chart-3 ml-2">ACTIVA</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Modo:</span>
                  <span className="text-secondary ml-2">NEURÓTICA</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
