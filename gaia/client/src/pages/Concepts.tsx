import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Lightbulb, Zap, Cpu, Bot, BookOpen, ChevronDown, Sparkles } from "lucide-react";
import type { Concept } from "../../../drizzle/schema";

const categoryConfig: Record<string, { icon: typeof Lightbulb; color: string; label: string }> = {
  energy: { icon: Zap, color: "text-chart-4", label: "Energía" },
  technology: { icon: Cpu, color: "text-primary", label: "Tecnología" },
  entity: { icon: Bot, color: "text-secondary", label: "Entidad" },
  philosophy: { icon: BookOpen, color: "text-chart-3", label: "Filosofía" },
  other: { icon: Lightbulb, color: "text-muted-foreground", label: "Otro" },
};

export default function Concepts() {
  const { data: concepts, isLoading } = trpc.concepts.list.useQuery();
  const [expandedId, setExpandedId] = useState<number | null>(null);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-primary neon-glow animate-pulse">Cargando conceptos fundamentales...</div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <div className="p-3 rounded bg-primary/10">
          <Lightbulb className="w-6 h-6 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-primary neon-glow" style={{ fontFamily: 'Orbitron, sans-serif' }}>
            CONCEPTOS
          </h1>
          <p className="text-muted-foreground text-sm">Fundamentos del universo GAIA: energías, tecnologías y entidades</p>
        </div>
        <div className="flex-1 h-px bg-gradient-to-r from-primary/50 to-transparent" />
      </div>

      {/* Concepts List */}
      {concepts && concepts.length > 0 ? (
        <div className="space-y-4">
          {concepts.map((concept) => {
            const config = categoryConfig[concept.category || "other"];
            const Icon = config.icon;
            const isExpanded = expandedId === concept.id;

            return (
              <Collapsible
                key={concept.id}
                open={isExpanded}
                onOpenChange={() => setExpandedId(isExpanded ? null : concept.id)}
              >
                <Card className={`terminal-card transition-all ${isExpanded ? "neon-border" : "hover:neon-border"}`}>
                  <CollapsibleTrigger className="w-full text-left">
                    <CardHeader className="pb-2">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-4">
                          <div className={`p-3 rounded bg-muted ${config.color}`}>
                            <Icon className="w-6 h-6" />
                          </div>
                          <div>
                            <CardTitle className={`text-xl ${isExpanded ? "neon-glow text-primary" : "text-primary"}`}>
                              {concept.name}
                            </CardTitle>
                            {concept.shortDescription && (
                              <p className="text-sm text-muted-foreground mt-1">
                                {concept.shortDescription}
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className={`${config.color} border-current`}>
                            {config.label}
                          </Badge>
                          <ChevronDown
                            className={`w-5 h-5 text-muted-foreground transition-transform ${
                              isExpanded ? "rotate-180" : ""
                            }`}
                          />
                        </div>
                      </div>
                    </CardHeader>
                  </CollapsibleTrigger>

                  <CollapsibleContent>
                    <CardContent className="pt-0 pb-6">
                      <div className="border-t border-border pt-4 mt-2 space-y-6">
                        {concept.fullDescription && (
                          <div>
                            <div className="flex items-center gap-2 mb-2">
                              <BookOpen className="w-4 h-4 text-primary" />
                              <span className="text-xs text-muted-foreground uppercase tracking-wider">
                                Descripción Completa
                              </span>
                            </div>
                            <p className="text-foreground whitespace-pre-wrap">{concept.fullDescription}</p>
                          </div>
                        )}

                        {concept.properties && (
                          <div>
                            <div className="flex items-center gap-2 mb-2">
                              <Sparkles className="w-4 h-4 text-secondary" />
                              <span className="text-xs text-muted-foreground uppercase tracking-wider">
                                Propiedades
                              </span>
                            </div>
                            <p className="text-foreground whitespace-pre-wrap">{concept.properties}</p>
                          </div>
                        )}

                        {concept.manifestations && (
                          <div>
                            <div className="flex items-center gap-2 mb-2">
                              <Zap className="w-4 h-4 text-chart-4" />
                              <span className="text-xs text-muted-foreground uppercase tracking-wider">
                                Manifestaciones
                              </span>
                            </div>
                            <p className="text-foreground whitespace-pre-wrap">{concept.manifestations}</p>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </CollapsibleContent>
                </Card>
              </Collapsible>
            );
          })}
        </div>
      ) : (
        <Card className="terminal-card">
          <CardContent className="p-12 text-center">
            <Lightbulb className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No hay conceptos registrados en la base de datos.</p>
            <p className="text-xs text-muted-foreground mt-2">
              Utilice el panel de administración para agregar conceptos.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
