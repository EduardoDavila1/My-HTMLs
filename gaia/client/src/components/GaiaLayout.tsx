import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { 
  Terminal, Users, Globe, MapPin, Clock, Lightbulb, 
  AlertTriangle, Search, Menu, X, ChevronRight, LogIn, LogOut
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { trpc } from "@/lib/trpc";

interface GaiaLayoutProps {
  children: React.ReactNode;
}

const navItems = [
  { path: "/", label: "TERMINAL", icon: Terminal, cmd: "./init" },
  { path: "/characters", label: "PERSONAJES", icon: Users, cmd: "./characters" },
  { path: "/factions", label: "FACCIONES", icon: Globe, cmd: "./factions" },
  { path: "/locations", label: "UBICACIONES", icon: MapPin, cmd: "./locations" },
  { path: "/timeline", label: "CRONOLOGÍA", icon: Clock, cmd: "./timeline" },
  { path: "/concepts", label: "CONCEPTOS", icon: Lightbulb, cmd: "./concepts" },
];

export default function GaiaLayout({ children }: GaiaLayoutProps) {
  const [location] = useLocation();
  const { user, loading, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  
  const { data: searchResults } = trpc.search.all.useQuery(
    { query: searchQuery },
    { enabled: searchQuery.length > 2 }
  );

  const { data: unresolvedGlitches } = trpc.glitches.unresolved.useQuery();
  const glitchCount = unresolvedGlitches?.length || 0;

  return (
    <div className="min-h-screen bg-background grid-pattern relative overflow-hidden">
      {/* Scanline effect */}
      <div className="fixed inset-0 pointer-events-none scanline z-50" />
      
      {/* Mobile menu button */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="fixed top-4 left-4 z-40 lg:hidden p-2 terminal-card rounded neon-border"
      >
        {sidebarOpen ? <X className="w-5 h-5 text-primary" /> : <Menu className="w-5 h-5 text-primary" />}
      </button>

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-full w-64 bg-sidebar border-r border-sidebar-border z-30 transition-transform duration-300 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } lg:translate-x-0`}
      >
        {/* Logo */}
        <div className="p-6 border-b border-sidebar-border">
          <Link href="/">
            <div className="flex items-center gap-3 group cursor-pointer">
              <div className="w-10 h-10 rounded border border-primary flex items-center justify-center pulse-glow">
                <span className="text-primary font-bold text-lg" style={{ fontFamily: 'Orbitron, sans-serif' }}>G</span>
              </div>
              <div>
                <h1 className="text-primary font-bold tracking-wider glitch-text-hover" style={{ fontFamily: 'Orbitron, sans-serif' }}>
                  G.A.I.A.
                </h1>
                <p className="text-xs text-muted-foreground">G 01 1 01</p>
              </div>
            </div>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="p-4 space-y-1">
          <p className="text-xs text-muted-foreground mb-3 px-2">// NAVEGACIÓN</p>
          {navItems.map((item) => {
            const isActive = location === item.path;
            const Icon = item.icon;
            return (
              <Link key={item.path} href={item.path}>
                <div
                  className={`flex items-center gap-3 px-3 py-2.5 rounded transition-all group cursor-pointer ${
                    isActive
                      ? "bg-sidebar-accent text-primary neon-border"
                      : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-primary"
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? "text-primary" : "text-muted-foreground group-hover:text-primary"}`} />
                  <span className="text-sm font-medium">{item.label}</span>
                  <ChevronRight className={`w-3 h-3 ml-auto transition-transform ${isActive ? "text-primary" : "opacity-0 group-hover:opacity-100"}`} />
                </div>
              </Link>
            );
          })}

          {/* Admin section */}
          {user?.role === "admin" && (
            <>
              <div className="border-t border-sidebar-border my-4" />
              <p className="text-xs text-muted-foreground mb-3 px-2">// ADMINISTRACIÓN</p>
              <Link href="/admin">
                <div
                  className={`flex items-center gap-3 px-3 py-2.5 rounded transition-all group cursor-pointer ${
                    location === "/admin"
                      ? "bg-sidebar-accent text-secondary neon-border-magenta"
                      : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-secondary"
                  }`}
                >
                  <AlertTriangle className={`w-4 h-4 ${location === "/admin" ? "text-secondary" : "text-muted-foreground group-hover:text-secondary"}`} />
                  <span className="text-sm font-medium">GLITCHES</span>
                  {glitchCount > 0 && (
                    <span className="ml-auto bg-secondary text-secondary-foreground text-xs px-2 py-0.5 rounded-full">
                      {glitchCount}
                    </span>
                  )}
                </div>
              </Link>
            </>
          )}
        </nav>

        {/* Search & Auth */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-sidebar-border bg-sidebar">
          {/* Search */}
          <Dialog open={searchOpen} onOpenChange={setSearchOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="w-full mb-3 justify-start gap-2 text-muted-foreground hover:text-primary">
                <Search className="w-4 h-4" />
                <span className="text-sm">Buscar...</span>
                <kbd className="ml-auto text-xs bg-muted px-1.5 py-0.5 rounded">/</kbd>
              </Button>
            </DialogTrigger>
            <DialogContent className="terminal-card border-primary/30 max-w-2xl">
              <DialogHeader>
                <DialogTitle className="text-primary neon-glow" style={{ fontFamily: 'Orbitron, sans-serif' }}>
                  BÚSQUEDA EN BASE DE DATOS
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <Input
                  placeholder="Ingrese término de búsqueda..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-input border-border focus:border-primary"
                  autoFocus
                />
                {searchQuery.length > 2 && searchResults && (
                  <div className="space-y-4 max-h-96 overflow-y-auto">
                    {searchResults.characters.length > 0 && (
                      <div>
                        <h4 className="text-xs text-muted-foreground mb-2">// PERSONAJES</h4>
                        {searchResults.characters.map((c) => (
                          <Link key={c.id} href={`/characters?id=${c.id}`} onClick={() => setSearchOpen(false)}>
                            <div className="p-2 hover:bg-muted rounded cursor-pointer">
                              <span className="text-primary">{c.name}</span>
                              {c.role && <span className="text-muted-foreground text-sm ml-2">- {c.role}</span>}
                            </div>
                          </Link>
                        ))}
                      </div>
                    )}
                    {searchResults.factions.length > 0 && (
                      <div>
                        <h4 className="text-xs text-muted-foreground mb-2">// FACCIONES</h4>
                        {searchResults.factions.map((f) => (
                          <Link key={f.id} href={`/factions?id=${f.id}`} onClick={() => setSearchOpen(false)}>
                            <div className="p-2 hover:bg-muted rounded cursor-pointer">
                              <span className="text-primary">{f.name}</span>
                            </div>
                          </Link>
                        ))}
                      </div>
                    )}
                    {searchResults.locations.length > 0 && (
                      <div>
                        <h4 className="text-xs text-muted-foreground mb-2">// UBICACIONES</h4>
                        {searchResults.locations.map((l) => (
                          <Link key={l.id} href={`/locations?id=${l.id}`} onClick={() => setSearchOpen(false)}>
                            <div className="p-2 hover:bg-muted rounded cursor-pointer">
                              <span className="text-primary">{l.name}</span>
                            </div>
                          </Link>
                        ))}
                      </div>
                    )}
                    {searchResults.events.length > 0 && (
                      <div>
                        <h4 className="text-xs text-muted-foreground mb-2">// EVENTOS</h4>
                        {searchResults.events.map((e) => (
                          <Link key={e.id} href={`/timeline?year=${e.year}`} onClick={() => setSearchOpen(false)}>
                            <div className="p-2 hover:bg-muted rounded cursor-pointer">
                              <span className="text-secondary">{e.year}</span>
                              <span className="text-primary ml-2">{e.title}</span>
                            </div>
                          </Link>
                        ))}
                      </div>
                    )}
                    {searchResults.concepts.length > 0 && (
                      <div>
                        <h4 className="text-xs text-muted-foreground mb-2">// CONCEPTOS</h4>
                        {searchResults.concepts.map((c) => (
                          <Link key={c.id} href={`/concepts?id=${c.id}`} onClick={() => setSearchOpen(false)}>
                            <div className="p-2 hover:bg-muted rounded cursor-pointer">
                              <span className="text-primary">{c.name}</span>
                            </div>
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </DialogContent>
          </Dialog>

          {/* Auth */}
          {loading ? (
            <div className="text-xs text-muted-foreground">Conectando...</div>
          ) : user ? (
            <div className="flex items-center justify-between">
              <div className="text-xs">
                <span className="text-muted-foreground">Usuario: </span>
                <span className="text-primary">{user.name || "Doctor"}</span>
                {user.role === "admin" && (
                  <span className="ml-2 text-secondary">[ADMIN]</span>
                )}
              </div>
              <Button variant="ghost" size="sm" onClick={() => logout()} className="text-muted-foreground hover:text-destructive">
                <LogOut className="w-4 h-4" />
              </Button>
            </div>
          ) : (
            <Button
              variant="outline"
              size="sm"
              className="w-full gap-2"
              onClick={() => window.location.href = getLoginUrl()}
            >
              <LogIn className="w-4 h-4" />
              Iniciar Sesión
            </Button>
          )}
        </div>
      </aside>

      {/* Main content */}
      <main className={`transition-all duration-300 ${sidebarOpen ? "lg:ml-64" : ""}`}>
        <div className="min-h-screen p-4 lg:p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
