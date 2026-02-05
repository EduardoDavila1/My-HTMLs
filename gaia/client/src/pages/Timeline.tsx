import { useState, useMemo } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Clock, ChevronLeft, ChevronRight, Zap, Search as SearchIcon, Skull, Swords, Rocket } from "lucide-react";
import type { Event } from "../../../drizzle/schema";

const categoryConfig: Record<string, { icon: typeof Zap; color: string; label: string }> = {
  origin: { icon: Zap, color: "text-primary", label: "Origen" },
  discovery: { icon: SearchIcon, color: "text-chart-3", label: "Descubrimiento" },
  tragedy: { icon: Skull, color: "text-destructive", label: "Tragedia" },
  conflict: { icon: Swords, color: "text-secondary", label: "Conflicto" },
  expansion: { icon: Rocket, color: "text-chart-4", label: "Expansión" },
};

const decades = [
  { start: 1960, end: 1969, label: "1960s" },
  { start: 1970, end: 1979, label: "1970s" },
  { start: 1980, end: 1989, label: "1980s" },
  { start: 1990, end: 1999, label: "1990s" },
  { start: 2000, end: 2099, label: "2000+" },
];

export default function Timeline() {
  const { data: events, isLoading } = trpc.events.list.useQuery();
  const [selectedDecade, setSelectedDecade] = useState<number>(0);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);

  const filteredEvents = useMemo(() => {
    if (!events) return [];
    const decade = decades[selectedDecade];
    return events.filter((e) => e.year >= decade.start && e.year <= decade.end);
  }, [events, selectedDecade]);

  const eventsByYear = useMemo(() => {
    const grouped: Record<number, Event[]> = {};
    filteredEvents.forEach((event) => {
      if (!grouped[event.year]) grouped[event.year] = [];
      grouped[event.year].push(event);
    });
    return Object.entries(grouped)
      .sort(([a], [b]) => Number(a) - Number(b))
      .map(([year, events]) => ({ year: Number(year), events }));
  }, [filteredEvents]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-secondary neon-glow-magenta animate-pulse">Cargando línea temporal...</div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <div className="p-3 rounded bg-secondary/10">
          <Clock className="w-6 h-6 text-secondary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-secondary neon-glow-magenta" style={{ fontFamily: 'Orbitron, sans-serif' }}>
            CRONOLOGÍA
          </h1>
          <p className="text-muted-foreground text-sm">Línea temporal de eventos del universo GAIA</p>
        </div>
        <div className="flex-1 h-px bg-gradient-to-r from-secondary/50 to-transparent" />
      </div>

      {/* Decade Navigation */}
      <Card className="terminal-card">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSelectedDecade(Math.max(0, selectedDecade - 1))}
              disabled={selectedDecade === 0}
              className="text-muted-foreground hover:text-primary"
            >
              <ChevronLeft className="w-4 h-4 mr-1" />
              Anterior
            </Button>
            
            <div className="flex gap-2">
              {decades.map((decade, index) => (
                <Button
                  key={decade.label}
                  variant={selectedDecade === index ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedDecade(index)}
                  className={selectedDecade === index ? "bg-secondary text-secondary-foreground" : ""}
                >
                  {decade.label}
                </Button>
              ))}
            </div>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSelectedDecade(Math.min(decades.length - 1, selectedDecade + 1))}
              disabled={selectedDecade === decades.length - 1}
              className="text-muted-foreground hover:text-primary"
            >
              Siguiente
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Timeline */}
      {eventsByYear.length > 0 ? (
        <div className="relative">
          {/* Vertical line */}
          <div className="absolute left-8 top-0 bottom-0 w-px bg-gradient-to-b from-secondary via-primary to-secondary/30" />
          
          <div className="space-y-8">
            {eventsByYear.map(({ year, events: yearEvents }) => (
              <div key={year} className="relative pl-20">
                {/* Year marker */}
                <div className="absolute left-0 w-16 flex items-center justify-center">
                  <div className="w-4 h-4 rounded-full bg-secondary neon-border-magenta" />
                </div>
                <div className="absolute left-0 -top-1 w-16 text-center">
                  <span className="text-2xl font-bold text-secondary neon-glow-magenta" style={{ fontFamily: 'Orbitron, sans-serif' }}>
                    {year}
                  </span>
                </div>
                
                {/* Events for this year */}
                <div className="space-y-3 pt-8">
                  {yearEvents.map((event) => {
                    const config = categoryConfig[event.category || "origin"];
                    const Icon = config.icon;
                    return (
                      <Card
                        key={event.id}
                        className="terminal-card hover:neon-border transition-all cursor-pointer group"
                        onClick={() => setSelectedEvent(event)}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-start gap-4">
                            <div className={`p-2 rounded bg-muted ${config.color}`}>
                              <Icon className="w-4 h-4" />
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <h3 className="font-bold text-primary group-hover:neon-glow transition-all">
                                  {event.title}
                                </h3>
                                <Badge variant="outline" className={`text-xs ${config.color} border-current`}>
                                  {config.label}
                                </Badge>
                              </div>
                              {event.description && (
                                <p className="text-sm text-muted-foreground line-clamp-2">
                                  {event.description}
                                </p>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <Card className="terminal-card">
          <CardContent className="p-12 text-center">
            <Clock className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">
              No hay eventos registrados para la década {decades[selectedDecade].label}.
            </p>
            <p className="text-xs text-muted-foreground mt-2">
              Utilice el panel de administración para agregar eventos.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Event Detail Modal */}
      {selectedEvent && (
        <div
          className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedEvent(null)}
        >
          <Card
            className="terminal-card border-primary/30 max-w-2xl w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <span className="text-4xl font-bold text-secondary neon-glow-magenta" style={{ fontFamily: 'Orbitron, sans-serif' }}>
                    {selectedEvent.year}
                  </span>
                  <h2 className="text-xl font-bold text-primary mt-2">{selectedEvent.title}</h2>
                </div>
                <Badge className={`${categoryConfig[selectedEvent.category || "origin"].color} bg-muted`}>
                  {categoryConfig[selectedEvent.category || "origin"].label}
                </Badge>
              </div>
              {selectedEvent.description && (
                <p className="text-foreground whitespace-pre-wrap">{selectedEvent.description}</p>
              )}
              <Button
                variant="outline"
                className="mt-6"
                onClick={() => setSelectedEvent(null)}
              >
                Cerrar
              </Button>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
