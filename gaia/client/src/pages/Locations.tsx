import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { MapPin, Globe2, Building2, Mountain, Box, Users } from "lucide-react";
import type { Location } from "../../../drizzle/schema";

const typeIcons: Record<string, typeof MapPin> = {
  planet: Globe2,
  region: Mountain,
  city: Building2,
  structure: Box,
  other: MapPin,
};

const typeLabels: Record<string, string> = {
  planet: "Planeta",
  region: "Región",
  city: "Ciudad",
  structure: "Estructura",
  other: "Otro",
};

export default function Locations() {
  const { data: locations, isLoading } = trpc.locations.list.useQuery();
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-primary neon-glow animate-pulse">Cargando registros de ubicaciones...</div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <div className="p-3 rounded bg-primary/10">
          <MapPin className="w-6 h-6 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-primary neon-glow" style={{ fontFamily: 'Orbitron, sans-serif' }}>
            UBICACIONES
          </h1>
          <p className="text-muted-foreground text-sm">Planetas, regiones y estructuras del universo GAIA</p>
        </div>
        <div className="flex-1 h-px bg-gradient-to-r from-primary/50 to-transparent" />
      </div>

      {/* Locations Grid */}
      {locations && locations.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {locations.map((location) => {
            const TypeIcon = typeIcons[location.type || "other"];
            return (
              <Card
                key={location.id}
                className="terminal-card hover:neon-border transition-all cursor-pointer group"
                onClick={() => setSelectedLocation(location)}
              >
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded bg-primary/10">
                        <TypeIcon className="w-5 h-5 text-primary" />
                      </div>
                      <CardTitle className="text-primary group-hover:neon-glow transition-all">
                        {location.name}
                      </CardTitle>
                    </div>
                    <Badge variant="outline" className="text-xs border-primary/50 text-primary">
                      {typeLabels[location.type || "other"]}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  {location.description && (
                    <p className="text-sm text-muted-foreground line-clamp-3">
                      {location.description}
                    </p>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <Card className="terminal-card">
          <CardContent className="p-12 text-center">
            <MapPin className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No hay ubicaciones registradas en la base de datos.</p>
            <p className="text-xs text-muted-foreground mt-2">
              Utilice el panel de administración para agregar ubicaciones.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Location Detail Dialog */}
      <Dialog open={!!selectedLocation} onOpenChange={() => setSelectedLocation(null)}>
        <DialogContent className="terminal-card border-primary/30 max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-start justify-between">
              <DialogTitle className="text-2xl text-primary neon-glow" style={{ fontFamily: 'Orbitron, sans-serif' }}>
                {selectedLocation?.name}
              </DialogTitle>
              <Badge className="bg-primary/20 text-primary border border-primary/50">
                {typeLabels[selectedLocation?.type || "other"]}
              </Badge>
            </div>
          </DialogHeader>

          <div className="space-y-6 mt-4">
            {selectedLocation?.description && (
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <MapPin className="w-4 h-4 text-primary" />
                  <span className="text-xs text-muted-foreground uppercase tracking-wider">Descripción</span>
                </div>
                <p className="text-foreground whitespace-pre-wrap">{selectedLocation.description}</p>
              </div>
            )}

            {selectedLocation?.characteristics && (
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Mountain className="w-4 h-4 text-primary" />
                  <span className="text-xs text-muted-foreground uppercase tracking-wider">Características</span>
                </div>
                <p className="text-foreground whitespace-pre-wrap">{selectedLocation.characteristics}</p>
              </div>
            )}

            {selectedLocation?.inhabitants && (
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Users className="w-4 h-4 text-secondary" />
                  <span className="text-xs text-muted-foreground uppercase tracking-wider">Habitantes</span>
                </div>
                <p className="text-foreground whitespace-pre-wrap">{selectedLocation.inhabitants}</p>
              </div>
            )}

            {selectedLocation?.significance && (
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Globe2 className="w-4 h-4 text-secondary" />
                  <span className="text-xs text-muted-foreground uppercase tracking-wider">Importancia Narrativa</span>
                </div>
                <p className="text-foreground whitespace-pre-wrap">{selectedLocation.significance}</p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
