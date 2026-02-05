import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Users, Brain, Swords, BookOpen, X } from "lucide-react";
import type { Character } from "../../../drizzle/schema";

export default function Characters() {
  const { data: characters, isLoading } = trpc.characters.list.useQuery();
  const [selectedCharacter, setSelectedCharacter] = useState<Character | null>(null);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-primary neon-glow animate-pulse">Cargando registros de personajes...</div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <div className="p-3 rounded bg-primary/10">
          <Users className="w-6 h-6 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-primary neon-glow" style={{ fontFamily: 'Orbitron, sans-serif' }}>
            PERSONAJES
          </h1>
          <p className="text-muted-foreground text-sm">Base de datos de entidades del universo GAIA</p>
        </div>
        <div className="flex-1 h-px bg-gradient-to-r from-primary/50 to-transparent" />
      </div>

      {/* Characters Grid */}
      {characters && characters.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {characters.map((character) => (
            <Card
              key={character.id}
              className="terminal-card hover:neon-border transition-all cursor-pointer group"
              onClick={() => setSelectedCharacter(character)}
            >
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <CardTitle className="text-primary group-hover:neon-glow transition-all">
                    {character.name}
                  </CardTitle>
                  {character.archetype && (
                    <Badge variant="outline" className="text-xs border-secondary text-secondary">
                      {character.archetype}
                    </Badge>
                  )}
                </div>
                {character.alias && (
                  <p className="text-sm text-muted-foreground italic">"{character.alias}"</p>
                )}
              </CardHeader>
              <CardContent>
                {character.role && (
                  <p className="text-sm text-secondary mb-2">{character.role}</p>
                )}
                {character.description && (
                  <p className="text-sm text-muted-foreground line-clamp-3">
                    {character.description}
                  </p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="terminal-card">
          <CardContent className="p-12 text-center">
            <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No hay personajes registrados en la base de datos.</p>
            <p className="text-xs text-muted-foreground mt-2">
              Utilice el panel de administración para agregar personajes.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Character Detail Dialog */}
      <Dialog open={!!selectedCharacter} onOpenChange={() => setSelectedCharacter(null)}>
        <DialogContent className="terminal-card border-primary/30 max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-start justify-between">
              <div>
                <DialogTitle className="text-2xl text-primary neon-glow" style={{ fontFamily: 'Orbitron, sans-serif' }}>
                  {selectedCharacter?.name}
                </DialogTitle>
                {selectedCharacter?.alias && (
                  <p className="text-sm text-muted-foreground italic mt-1">"{selectedCharacter.alias}"</p>
                )}
              </div>
              {selectedCharacter?.archetype && (
                <Badge className="bg-secondary text-secondary-foreground">
                  {selectedCharacter.archetype}
                </Badge>
              )}
            </div>
          </DialogHeader>

          <div className="space-y-6 mt-4">
            {selectedCharacter?.role && (
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <BookOpen className="w-4 h-4 text-primary" />
                  <span className="text-xs text-muted-foreground uppercase tracking-wider">Rol</span>
                </div>
                <p className="text-secondary">{selectedCharacter.role}</p>
              </div>
            )}

            {selectedCharacter?.description && (
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Users className="w-4 h-4 text-primary" />
                  <span className="text-xs text-muted-foreground uppercase tracking-wider">Descripción</span>
                </div>
                <p className="text-foreground whitespace-pre-wrap">{selectedCharacter.description}</p>
              </div>
            )}

            {selectedCharacter?.psychology && (
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Brain className="w-4 h-4 text-primary" />
                  <span className="text-xs text-muted-foreground uppercase tracking-wider">Psicología</span>
                </div>
                <p className="text-foreground whitespace-pre-wrap">{selectedCharacter.psychology}</p>
              </div>
            )}

            {selectedCharacter?.conflicts && (
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Swords className="w-4 h-4 text-secondary" />
                  <span className="text-xs text-muted-foreground uppercase tracking-wider">Conflictos</span>
                </div>
                <p className="text-foreground whitespace-pre-wrap">{selectedCharacter.conflicts}</p>
              </div>
            )}

            {selectedCharacter?.references && (
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <BookOpen className="w-4 h-4 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground uppercase tracking-wider">Referencias</span>
                </div>
                <p className="text-muted-foreground">{selectedCharacter.references}</p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
