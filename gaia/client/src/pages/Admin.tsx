import { useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import {
  AlertTriangle, CheckCircle, Clock, Shield, Plus, Trash2, Edit, Save, X,
  Users, Globe, MapPin, Lightbulb, Zap
} from "lucide-react";

export default function Admin() {
  const { user, loading } = useAuth();
  const utils = trpc.useUtils();

  // Glitches
  const { data: glitches } = trpc.glitches.list.useQuery();
  const resolveGlitch = trpc.glitches.resolve.useMutation({
    onSuccess: () => {
      utils.glitches.list.invalidate();
      utils.glitches.unresolved.invalidate();
      toast.success("Glitch resuelto exitosamente");
    },
  });

  // Characters
  const { data: characters } = trpc.characters.list.useQuery();
  const createCharacter = trpc.characters.create.useMutation({
    onSuccess: () => {
      utils.characters.list.invalidate();
      toast.success("Personaje creado");
    },
  });
  const deleteCharacter = trpc.characters.delete.useMutation({
    onSuccess: () => {
      utils.characters.list.invalidate();
      toast.success("Personaje eliminado");
    },
  });

  // Factions
  const { data: factions } = trpc.factions.list.useQuery();
  const createFaction = trpc.factions.create.useMutation({
    onSuccess: () => {
      utils.factions.list.invalidate();
      toast.success("Facción creada");
    },
  });
  const deleteFaction = trpc.factions.delete.useMutation({
    onSuccess: () => {
      utils.factions.list.invalidate();
      toast.success("Facción eliminada");
    },
  });

  // Locations
  const { data: locations } = trpc.locations.list.useQuery();
  const createLocation = trpc.locations.create.useMutation({
    onSuccess: () => {
      utils.locations.list.invalidate();
      toast.success("Ubicación creada");
    },
  });
  const deleteLocation = trpc.locations.delete.useMutation({
    onSuccess: () => {
      utils.locations.list.invalidate();
      toast.success("Ubicación eliminada");
    },
  });

  // Events
  const { data: events } = trpc.events.list.useQuery();
  const createEvent = trpc.events.create.useMutation({
    onSuccess: () => {
      utils.events.list.invalidate();
      toast.success("Evento creado");
    },
  });
  const deleteEvent = trpc.events.delete.useMutation({
    onSuccess: () => {
      utils.events.list.invalidate();
      toast.success("Evento eliminado");
    },
  });

  // Concepts
  const { data: concepts } = trpc.concepts.list.useQuery();
  const createConcept = trpc.concepts.create.useMutation({
    onSuccess: () => {
      utils.concepts.list.invalidate();
      toast.success("Concepto creado");
    },
  });
  const deleteConcept = trpc.concepts.delete.useMutation({
    onSuccess: () => {
      utils.concepts.list.invalidate();
      toast.success("Concepto eliminado");
    },
  });

  // Glitches management
  const createGlitch = trpc.glitches.create.useMutation({
    onSuccess: () => {
      utils.glitches.list.invalidate();
      utils.glitches.unresolved.invalidate();
      toast.success("Glitch registrado");
    },
  });

  const [resolution, setResolution] = useState<Record<number, string>>({});

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-primary animate-pulse">Verificando credenciales...</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="max-w-md mx-auto mt-20">
        <Card className="terminal-card border-destructive/50">
          <CardContent className="p-8 text-center">
            <Shield className="w-12 h-12 text-destructive mx-auto mb-4" />
            <h2 className="text-xl font-bold text-destructive mb-2">ACCESO DENEGADO</h2>
            <p className="text-muted-foreground mb-4">
              Se requiere autenticación para acceder al panel de administración.
            </p>
            <Button onClick={() => (window.location.href = getLoginUrl())}>
              Iniciar Sesión
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (user.role !== "admin") {
    return (
      <div className="max-w-md mx-auto mt-20">
        <Card className="terminal-card border-destructive/50">
          <CardContent className="p-8 text-center">
            <Shield className="w-12 h-12 text-destructive mx-auto mb-4" />
            <h2 className="text-xl font-bold text-destructive mb-2">PERMISOS INSUFICIENTES</h2>
            <p className="text-muted-foreground">
              Solo el Doctor tiene acceso a este módulo.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const unresolvedGlitches = glitches?.filter((g) => !g.resolved) || [];
  const resolvedGlitches = glitches?.filter((g) => g.resolved) || [];

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <div className="p-3 rounded bg-destructive/10">
          <AlertTriangle className="w-6 h-6 text-destructive" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-destructive" style={{ fontFamily: 'Orbitron, sans-serif' }}>
            PANEL DE ADMINISTRACIÓN
          </h1>
          <p className="text-muted-foreground text-sm">Gestión de contenido y resolución de glitches narrativos</p>
        </div>
        <div className="flex-1 h-px bg-gradient-to-r from-destructive/50 to-transparent" />
      </div>

      <Tabs defaultValue="glitches" className="space-y-4">
        <TabsList className="bg-muted/50">
          <TabsTrigger value="glitches" className="gap-2">
            <AlertTriangle className="w-4 h-4" />
            Glitches ({unresolvedGlitches.length})
          </TabsTrigger>
          <TabsTrigger value="characters" className="gap-2">
            <Users className="w-4 h-4" />
            Personajes
          </TabsTrigger>
          <TabsTrigger value="factions" className="gap-2">
            <Globe className="w-4 h-4" />
            Facciones
          </TabsTrigger>
          <TabsTrigger value="locations" className="gap-2">
            <MapPin className="w-4 h-4" />
            Ubicaciones
          </TabsTrigger>
          <TabsTrigger value="events" className="gap-2">
            <Clock className="w-4 h-4" />
            Eventos
          </TabsTrigger>
          <TabsTrigger value="concepts" className="gap-2">
            <Lightbulb className="w-4 h-4" />
            Conceptos
          </TabsTrigger>
        </TabsList>

        {/* GLITCHES TAB */}
        <TabsContent value="glitches" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-bold text-primary">Glitches Narrativos</h3>
            <Dialog>
              <DialogTrigger asChild>
                <Button size="sm" className="gap-2">
                  <Plus className="w-4 h-4" />
                  Registrar Glitch
                </Button>
              </DialogTrigger>
              <DialogContent className="terminal-card">
                <DialogHeader>
                  <DialogTitle>Nuevo Glitch</DialogTitle>
                </DialogHeader>
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    const form = e.target as HTMLFormElement;
                    const formData = new FormData(form);
                    createGlitch.mutate({
                      title: formData.get("title") as string,
                      severity: formData.get("severity") as "critical" | "major" | "minor",
                      description: formData.get("description") as string,
                      versionA: formData.get("versionA") as string,
                      versionB: formData.get("versionB") as string,
                    });
                    form.reset();
                  }}
                  className="space-y-4"
                >
                  <div>
                    <Label>Título</Label>
                    <Input name="title" required className="bg-input" />
                  </div>
                  <div>
                    <Label>Severidad</Label>
                    <Select name="severity" defaultValue="major">
                      <SelectTrigger className="bg-input">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="critical">Crítico</SelectItem>
                        <SelectItem value="major">Mayor</SelectItem>
                        <SelectItem value="minor">Menor</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Descripción</Label>
                    <Textarea name="description" className="bg-input" />
                  </div>
                  <div>
                    <Label>Versión A</Label>
                    <Textarea name="versionA" className="bg-input" />
                  </div>
                  <div>
                    <Label>Versión B</Label>
                    <Textarea name="versionB" className="bg-input" />
                  </div>
                  <Button type="submit" className="w-full">Registrar</Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          {/* Unresolved Glitches */}
          {unresolvedGlitches.length > 0 && (
            <div className="space-y-4">
              <h4 className="text-sm text-muted-foreground">// SIN RESOLVER</h4>
              {unresolvedGlitches.map((glitch) => (
                <Card key={glitch.id} className="terminal-card border-destructive/30">
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <AlertTriangle className={`w-5 h-5 ${
                          glitch.severity === "critical" ? "text-destructive glitch-text" :
                          glitch.severity === "major" ? "text-chart-4" : "text-muted-foreground"
                        }`} />
                        <CardTitle className="text-lg">{glitch.title}</CardTitle>
                      </div>
                      <Badge variant={glitch.severity === "critical" ? "destructive" : "outline"}>
                        {glitch.severity?.toUpperCase()}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {glitch.description && (
                      <p className="text-muted-foreground">{glitch.description}</p>
                    )}
                    <div className="grid md:grid-cols-2 gap-4">
                      {glitch.versionA && (
                        <div className="p-3 bg-muted/50 rounded">
                          <p className="text-xs text-muted-foreground mb-1">VERSIÓN A</p>
                          <p className="text-sm">{glitch.versionA}</p>
                        </div>
                      )}
                      {glitch.versionB && (
                        <div className="p-3 bg-muted/50 rounded">
                          <p className="text-xs text-muted-foreground mb-1">VERSIÓN B</p>
                          <p className="text-sm">{glitch.versionB}</p>
                        </div>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label>Resolución</Label>
                      <Textarea
                        placeholder="Ingrese la resolución canónica para este conflicto..."
                        value={resolution[glitch.id] || ""}
                        onChange={(e) => setResolution({ ...resolution, [glitch.id]: e.target.value })}
                        className="bg-input"
                      />
                      <Button
                        onClick={() => {
                          if (resolution[glitch.id]) {
                            resolveGlitch.mutate({ id: glitch.id, resolution: resolution[glitch.id] });
                          }
                        }}
                        disabled={!resolution[glitch.id]}
                        className="gap-2"
                      >
                        <CheckCircle className="w-4 h-4" />
                        Resolver Glitch
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Resolved Glitches */}
          {resolvedGlitches.length > 0 && (
            <div className="space-y-4">
              <h4 className="text-sm text-muted-foreground">// RESUELTOS</h4>
              {resolvedGlitches.map((glitch) => (
                <Card key={glitch.id} className="terminal-card border-chart-3/30 opacity-75">
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <CheckCircle className="w-5 h-5 text-chart-3" />
                        <CardTitle className="text-lg text-muted-foreground">{glitch.title}</CardTitle>
                      </div>
                      <Badge variant="outline" className="text-chart-3 border-chart-3">
                        RESUELTO
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {glitch.resolution && (
                      <div className="p-3 bg-chart-3/10 rounded border border-chart-3/30">
                        <p className="text-xs text-chart-3 mb-1">RESOLUCIÓN CANÓNICA</p>
                        <p className="text-sm">{glitch.resolution}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {glitches?.length === 0 && (
            <Card className="terminal-card">
              <CardContent className="p-8 text-center">
                <CheckCircle className="w-12 h-12 text-chart-3 mx-auto mb-4" />
                <p className="text-muted-foreground">No hay glitches registrados.</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* CHARACTERS TAB */}
        <TabsContent value="characters" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-bold text-primary">Gestión de Personajes</h3>
            <Dialog>
              <DialogTrigger asChild>
                <Button size="sm" className="gap-2">
                  <Plus className="w-4 h-4" />
                  Nuevo Personaje
                </Button>
              </DialogTrigger>
              <DialogContent className="terminal-card max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Crear Personaje</DialogTitle>
                </DialogHeader>
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    const form = e.target as HTMLFormElement;
                    const formData = new FormData(form);
                    createCharacter.mutate({
                      name: formData.get("name") as string,
                      alias: formData.get("alias") as string || undefined,
                      archetype: formData.get("archetype") as string || undefined,
                      role: formData.get("role") as string || undefined,
                      description: formData.get("description") as string || undefined,
                      psychology: formData.get("psychology") as string || undefined,
                      conflicts: formData.get("conflicts") as string || undefined,
                      references: formData.get("references") as string || undefined,
                    });
                    form.reset();
                  }}
                  className="space-y-4"
                >
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Nombre *</Label>
                      <Input name="name" required className="bg-input" />
                    </div>
                    <div>
                      <Label>Alias</Label>
                      <Input name="alias" className="bg-input" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Arquetipo (MBTI)</Label>
                      <Input name="archetype" placeholder="INTJ, ENFP..." className="bg-input" />
                    </div>
                    <div>
                      <Label>Rol</Label>
                      <Input name="role" className="bg-input" />
                    </div>
                  </div>
                  <div>
                    <Label>Descripción</Label>
                    <Textarea name="description" className="bg-input" />
                  </div>
                  <div>
                    <Label>Psicología</Label>
                    <Textarea name="psychology" className="bg-input" />
                  </div>
                  <div>
                    <Label>Conflictos</Label>
                    <Textarea name="conflicts" className="bg-input" />
                  </div>
                  <div>
                    <Label>Referencias</Label>
                    <Input name="references" placeholder="Tony Stark, Sherlock..." className="bg-input" />
                  </div>
                  <Button type="submit" className="w-full">Crear Personaje</Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>
          <div className="grid gap-2">
            {characters?.map((c) => (
              <div key={c.id} className="flex items-center justify-between p-3 terminal-card rounded">
                <div>
                  <span className="text-primary font-medium">{c.name}</span>
                  {c.role && <span className="text-muted-foreground text-sm ml-2">- {c.role}</span>}
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => deleteCharacter.mutate({ id: c.id })}
                  className="text-destructive hover:text-destructive"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>
        </TabsContent>

        {/* FACTIONS TAB */}
        <TabsContent value="factions" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-bold text-secondary">Gestión de Facciones</h3>
            <Dialog>
              <DialogTrigger asChild>
                <Button size="sm" className="gap-2">
                  <Plus className="w-4 h-4" />
                  Nueva Facción
                </Button>
              </DialogTrigger>
              <DialogContent className="terminal-card max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Crear Facción</DialogTitle>
                </DialogHeader>
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    const form = e.target as HTMLFormElement;
                    const formData = new FormData(form);
                    createFaction.mutate({
                      name: formData.get("name") as string,
                      type: formData.get("type") as "government" | "military" | "organization" | "other",
                      motto: formData.get("motto") as string || undefined,
                      description: formData.get("description") as string || undefined,
                      politics: formData.get("politics") as string || undefined,
                      territory: formData.get("territory") as string || undefined,
                    });
                    form.reset();
                  }}
                  className="space-y-4"
                >
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Nombre *</Label>
                      <Input name="name" required className="bg-input" />
                    </div>
                    <div>
                      <Label>Tipo</Label>
                      <Select name="type" defaultValue="organization">
                        <SelectTrigger className="bg-input">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="government">Gobierno</SelectItem>
                          <SelectItem value="military">Militar</SelectItem>
                          <SelectItem value="organization">Organización</SelectItem>
                          <SelectItem value="other">Otro</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div>
                    <Label>Lema</Label>
                    <Input name="motto" className="bg-input" />
                  </div>
                  <div>
                    <Label>Descripción</Label>
                    <Textarea name="description" className="bg-input" />
                  </div>
                  <div>
                    <Label>Sistema Político</Label>
                    <Textarea name="politics" className="bg-input" />
                  </div>
                  <div>
                    <Label>Territorio</Label>
                    <Input name="territory" className="bg-input" />
                  </div>
                  <Button type="submit" className="w-full">Crear Facción</Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>
          <div className="grid gap-2">
            {factions?.map((f) => (
              <div key={f.id} className="flex items-center justify-between p-3 terminal-card rounded">
                <div>
                  <span className="text-secondary font-medium">{f.name}</span>
                  {f.type && <span className="text-muted-foreground text-sm ml-2">({f.type})</span>}
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => deleteFaction.mutate({ id: f.id })}
                  className="text-destructive hover:text-destructive"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>
        </TabsContent>

        {/* LOCATIONS TAB */}
        <TabsContent value="locations" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-bold text-primary">Gestión de Ubicaciones</h3>
            <Dialog>
              <DialogTrigger asChild>
                <Button size="sm" className="gap-2">
                  <Plus className="w-4 h-4" />
                  Nueva Ubicación
                </Button>
              </DialogTrigger>
              <DialogContent className="terminal-card max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Crear Ubicación</DialogTitle>
                </DialogHeader>
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    const form = e.target as HTMLFormElement;
                    const formData = new FormData(form);
                    createLocation.mutate({
                      name: formData.get("name") as string,
                      type: formData.get("type") as "planet" | "region" | "city" | "structure" | "other",
                      description: formData.get("description") as string || undefined,
                      characteristics: formData.get("characteristics") as string || undefined,
                      inhabitants: formData.get("inhabitants") as string || undefined,
                      significance: formData.get("significance") as string || undefined,
                    });
                    form.reset();
                  }}
                  className="space-y-4"
                >
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Nombre *</Label>
                      <Input name="name" required className="bg-input" />
                    </div>
                    <div>
                      <Label>Tipo</Label>
                      <Select name="type" defaultValue="planet">
                        <SelectTrigger className="bg-input">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="planet">Planeta</SelectItem>
                          <SelectItem value="region">Región</SelectItem>
                          <SelectItem value="city">Ciudad</SelectItem>
                          <SelectItem value="structure">Estructura</SelectItem>
                          <SelectItem value="other">Otro</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div>
                    <Label>Descripción</Label>
                    <Textarea name="description" className="bg-input" />
                  </div>
                  <div>
                    <Label>Características</Label>
                    <Textarea name="characteristics" className="bg-input" />
                  </div>
                  <div>
                    <Label>Habitantes</Label>
                    <Textarea name="inhabitants" className="bg-input" />
                  </div>
                  <div>
                    <Label>Importancia Narrativa</Label>
                    <Textarea name="significance" className="bg-input" />
                  </div>
                  <Button type="submit" className="w-full">Crear Ubicación</Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>
          <div className="grid gap-2">
            {locations?.map((l) => (
              <div key={l.id} className="flex items-center justify-between p-3 terminal-card rounded">
                <div>
                  <span className="text-primary font-medium">{l.name}</span>
                  {l.type && <span className="text-muted-foreground text-sm ml-2">({l.type})</span>}
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => deleteLocation.mutate({ id: l.id })}
                  className="text-destructive hover:text-destructive"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>
        </TabsContent>

        {/* EVENTS TAB */}
        <TabsContent value="events" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-bold text-secondary">Gestión de Eventos</h3>
            <Dialog>
              <DialogTrigger asChild>
                <Button size="sm" className="gap-2">
                  <Plus className="w-4 h-4" />
                  Nuevo Evento
                </Button>
              </DialogTrigger>
              <DialogContent className="terminal-card">
                <DialogHeader>
                  <DialogTitle>Crear Evento</DialogTitle>
                </DialogHeader>
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    const form = e.target as HTMLFormElement;
                    const formData = new FormData(form);
                    createEvent.mutate({
                      year: parseInt(formData.get("year") as string),
                      title: formData.get("title") as string,
                      description: formData.get("description") as string || undefined,
                      category: formData.get("category") as "origin" | "discovery" | "tragedy" | "conflict" | "expansion",
                    });
                    form.reset();
                  }}
                  className="space-y-4"
                >
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Año *</Label>
                      <Input name="year" type="number" required className="bg-input" />
                    </div>
                    <div>
                      <Label>Categoría</Label>
                      <Select name="category" defaultValue="origin">
                        <SelectTrigger className="bg-input">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="origin">Origen</SelectItem>
                          <SelectItem value="discovery">Descubrimiento</SelectItem>
                          <SelectItem value="tragedy">Tragedia</SelectItem>
                          <SelectItem value="conflict">Conflicto</SelectItem>
                          <SelectItem value="expansion">Expansión</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div>
                    <Label>Título *</Label>
                    <Input name="title" required className="bg-input" />
                  </div>
                  <div>
                    <Label>Descripción</Label>
                    <Textarea name="description" className="bg-input" />
                  </div>
                  <Button type="submit" className="w-full">Crear Evento</Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>
          <div className="grid gap-2">
            {events?.map((e) => (
              <div key={e.id} className="flex items-center justify-between p-3 terminal-card rounded">
                <div>
                  <span className="text-secondary font-bold mr-2">{e.year}</span>
                  <span className="text-primary">{e.title}</span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => deleteEvent.mutate({ id: e.id })}
                  className="text-destructive hover:text-destructive"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>
        </TabsContent>

        {/* CONCEPTS TAB */}
        <TabsContent value="concepts" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-bold text-primary">Gestión de Conceptos</h3>
            <Dialog>
              <DialogTrigger asChild>
                <Button size="sm" className="gap-2">
                  <Plus className="w-4 h-4" />
                  Nuevo Concepto
                </Button>
              </DialogTrigger>
              <DialogContent className="terminal-card max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Crear Concepto</DialogTitle>
                </DialogHeader>
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    const form = e.target as HTMLFormElement;
                    const formData = new FormData(form);
                    createConcept.mutate({
                      name: formData.get("name") as string,
                      category: formData.get("category") as "energy" | "technology" | "entity" | "philosophy" | "other",
                      shortDescription: formData.get("shortDescription") as string || undefined,
                      fullDescription: formData.get("fullDescription") as string || undefined,
                      properties: formData.get("properties") as string || undefined,
                      manifestations: formData.get("manifestations") as string || undefined,
                    });
                    form.reset();
                  }}
                  className="space-y-4"
                >
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Nombre *</Label>
                      <Input name="name" required className="bg-input" />
                    </div>
                    <div>
                      <Label>Categoría</Label>
                      <Select name="category" defaultValue="other">
                        <SelectTrigger className="bg-input">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="energy">Energía</SelectItem>
                          <SelectItem value="technology">Tecnología</SelectItem>
                          <SelectItem value="entity">Entidad</SelectItem>
                          <SelectItem value="philosophy">Filosofía</SelectItem>
                          <SelectItem value="other">Otro</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div>
                    <Label>Descripción Corta</Label>
                    <Input name="shortDescription" className="bg-input" />
                  </div>
                  <div>
                    <Label>Descripción Completa</Label>
                    <Textarea name="fullDescription" className="bg-input" rows={4} />
                  </div>
                  <div>
                    <Label>Propiedades</Label>
                    <Textarea name="properties" className="bg-input" />
                  </div>
                  <div>
                    <Label>Manifestaciones</Label>
                    <Textarea name="manifestations" className="bg-input" />
                  </div>
                  <Button type="submit" className="w-full">Crear Concepto</Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>
          <div className="grid gap-2">
            {concepts?.map((c) => (
              <div key={c.id} className="flex items-center justify-between p-3 terminal-card rounded">
                <div>
                  <span className="text-primary font-medium">{c.name}</span>
                  {c.category && <span className="text-muted-foreground text-sm ml-2">({c.category})</span>}
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => deleteConcept.mutate({ id: c.id })}
                  className="text-destructive hover:text-destructive"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
