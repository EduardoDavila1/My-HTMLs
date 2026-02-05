import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Globe, Shield, Building, Users, MapPin } from "lucide-react";
import type { Faction } from "../../../drizzle/schema";

const typeIcons: Record<string, typeof Globe> = {
  government: Building,
  military: Shield,
  organization: Users,
  other: Globe,
};

const typeLabels: Record<string, string> = {
  government: "Gobierno",
  military: "Militar",
  organization: "Organización",
  other: "Otro",
};

export default function Factions() {
  const { data: factions, isLoading } = trpc.factions.list.useQuery();
  const [selectedFaction, setSelectedFaction] = useState<Faction | null>(null);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-secondary neon-glow-magenta animate-pulse">Cargando registros de facciones...</div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <div className="p-3 rounded bg-secondary/10">
          <Globe className="w-6 h-6 text-secondary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-secondary neon-glow-magenta" style={{ fontFamily: 'Orbitron, sans-serif' }}>
            FACCIONES
          </h1>
          <p className="text-muted-foreground text-sm">Organizaciones y poderes del universo GAIA</p>
        </div>
        <div className="flex-1 h-px bg-gradient-to-r from-secondary/50 to-transparent" />
      </div>

      {/* Factions Grid */}
      {factions && factions.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {factions.map((faction) => {
            const TypeIcon = typeIcons[faction.type || "other"];
            return (
              <Card
                key={faction.id}
                className="terminal-card hover:neon-border-magenta transition-all cursor-pointer group"
                onClick={() => setSelectedFaction(faction)}
              >
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded bg-secondary/10">
                        <TypeIcon className="w-5 h-5 text-secondary" />
                      </div>
                      <CardTitle className="text-secondary group-hover:neon-glow-magenta transition-all">
                        {faction.name}
                      </CardTitle>
                    </div>
                    <Badge variant="outline" className="text-xs border-muted-foreground text-muted-foreground">
                      {typeLabels[faction.type || "other"]}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  {faction.motto && (
                    <p className="text-sm text-primary italic mb-2">"{faction.motto}"</p>
                  )}
                  {faction.description && (
                    <p className="text-sm text-muted-foreground line-clamp-3">
                      {faction.description}
                    </p>
                  )}
                  {faction.territory && (
                    <div className="flex items-center gap-2 mt-3 text-xs text-muted-foreground">
                      <MapPin className="w-3 h-3" />
                      <span>{faction.territory}</span>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <Card className="terminal-card">
          <CardContent className="p-12 text-center">
            <Globe className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No hay facciones registradas en la base de datos.</p>
            <p className="text-xs text-muted-foreground mt-2">
              Utilice el panel de administración para agregar facciones.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Faction Detail Dialog */}
      <Dialog open={!!selectedFaction} onOpenChange={() => setSelectedFaction(null)}>
        <DialogContent className="terminal-card border-secondary/30 max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-start justify-between">
              <DialogTitle className="text-2xl text-secondary neon-glow-magenta" style={{ fontFamily: 'Orbitron, sans-serif' }}>
                {selectedFaction?.name}
              </DialogTitle>
              <Badge className="bg-secondary/20 text-secondary border border-secondary/50">
                {typeLabels[selectedFaction?.type || "other"]}
              </Badge>
            </div>
            {selectedFaction?.motto && (
              <p className="text-primary italic mt-2">"{selectedFaction.motto}"</p>
            )}
          </DialogHeader>

          <div className="space-y-6 mt-4">
            {selectedFaction?.description && (
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Globe className="w-4 h-4 text-secondary" />
                  <span className="text-xs text-muted-foreground uppercase tracking-wider">Descripción</span>
                </div>
                <p className="text-foreground whitespace-pre-wrap">{selectedFaction.description}</p>
              </div>
            )}

            {selectedFaction?.politics && (
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Building className="w-4 h-4 text-secondary" />
                  <span className="text-xs text-muted-foreground uppercase tracking-wider">Sistema Político</span>
                </div>
                <p className="text-foreground whitespace-pre-wrap">{selectedFaction.politics}</p>
              </div>
            )}

            {selectedFaction?.territory && (
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <MapPin className="w-4 h-4 text-secondary" />
                  <span className="text-xs text-muted-foreground uppercase tracking-wider">Territorio</span>
                </div>
                <p className="text-foreground">{selectedFaction.territory}</p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
