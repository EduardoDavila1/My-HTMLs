# GAIA Universe - Exportación HTML

Este paquete contiene la estructura HTML completa del universo GAIA Universe para integrar en tu sitio web.

## Contenido

- `index.html` - Página principal (Terminal GaiOs + Biblioteca de los Antiguos)
- `assets/` - Archivos CSS y JavaScript compilados
- `data.json` - Datos del lore (personajes, facciones, ubicaciones, eventos, conceptos, glitches, historias)
- `README.md` - Este archivo

## Cómo integrar en tu sitio web

### Opción 1: Integración directa (Recomendado)

1. **Copia la carpeta `gaia-export` a tu servidor web**
   ```bash
   cp -r gaia-export/* /ruta/de/tu/sitio/web/gaia/
   ```

2. **Accede a través de tu dominio**
   ```
   https://tudominio.com/gaia/
   ```

### Opción 2: Integración como iframe

Si quieres embeber GAIA en una página existente:

```html
<iframe 
  src="https://tudominio.com/gaia/" 
  style="width: 100%; height: 100vh; border: none;">
</iframe>
```

### Opción 3: Integración modular

Para integrar solo componentes específicos:

- **Terminal GaiOs**: Accede a `/` en la carpeta gaia
- **Biblioteca de los Antiguos**: Accede a `/biblioteca` en la carpeta gaia

## Requisitos

- Servidor web con soporte para archivos estáticos (HTML, CSS, JS, JSON)
- No requiere backend ni base de datos (todo está compilado)
- Compatible con todos los navegadores modernos

## Características

✓ Terminal GaiOs con navegación interactiva
✓ Biblioteca de los Antiguos con 7 secciones
✓ Glitches narrativos públicos
✓ Sistema de búsqueda
✓ Tema cyberpunk/sci-fi
✓ Responsive design
✓ Sin dependencias externas

## Datos incluidos

El archivo `data.json` contiene:
- 6 Personajes (Doctor, Meiyil, Gregorio, etc.)
- 5 Facciones (Confederación Draco, Tempest Nacht, etc.)
- 6 Ubicaciones/Planetas
- 12 Eventos cronológicos
- 5 Conceptos fundamentales (G.A.I.A., Chaitz, etc.)
- 5 Glitches narrativos
- 3 Historias destacadas
- 2 Archivistas (Chie, Gregorio, Meiyi)

## Personalización

Para modificar datos, edita directamente el archivo `data.json` y recarga la página.

## Soporte

Para reportar errores o sugerencias, contacta al Doctor.

---

**Versión**: 1.0
**Fecha**: Febrero 2026
**Universo**: GAIA
