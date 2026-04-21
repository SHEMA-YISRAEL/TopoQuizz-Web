# CLAUDE.md

Este archivo proporciona orientación a Claude Code (claude.ai/code) al trabajar con el código de este repositorio.

## Descripción del proyecto

TopoQuizz es una app de preguntas para estudiantes de medicina hispanohablantes (anatomía, farmacología, etc.). Este repositorio contiene una **landing page** en el subdirectorio `landing/` — todo el trabajo ocurre ahí.

## Comandos

Todos los comandos deben ejecutarse desde el directorio `landing/`:

```bash
cd landing
npm run dev      # Servidor de desarrollo en localhost:4321
npm run build    # Compilar a ./dist/
npm run preview  # Vista previa del build de producción
```

No hay scripts de lint ni tests configurados.

## Arquitectura

**Framework:** Astro 6 (generador de sitios estáticos, solo SSG — sin SSR)  
**Lenguaje:** TypeScript (modo estricto)  
**Despliegue:** GitHub Actions → GitHub Pages en `https://topoquizz.com`

### Directorios clave

- `landing/src/pages/index.astro` — La única página; la navegación es por anclas (`#features`, `#screenshots`, `#como-funciona`, `#descargar`)
- `landing/src/components/` — Un componente por sección de la página (Header, Hero, Stats, Features, Screenshots, QuizDemo, HowItWorks, Download, Footer)
- `landing/src/layouts/Layout.astro` — Layout base HTML; contiene metadatos SEO, datos estructurados JSON-LD, Google Fonts y el Intersection Observer para animaciones de scroll
- `landing/src/styles/global.css` — Variables CSS (paleta de colores, espaciado); los estilos de componentes viven en el bloque `<style>` de cada archivo `.astro`
- `landing/public/` — Assets estáticos: animaciones Lottie JSON (`*.json`), capturas (`screenshots/`), códigos QR (`qrs/`)

### Contenido y datos

Todo el contenido está hardcodeado en los componentes — sin CMS, API ni base de datos. Valores clave:
- Preguntas de demo: `QuizDemo.astro`
- Estadísticas de la app: `Stats.astro`
- Links de App Store / Play Store: actualmente `"#"` (pendientes del lanzamiento beta)

### Animaciones

Las animaciones Lottie (`lottie-web`) se cargan desde archivos JSON en `/public/`. Las animaciones de scroll usan un Intersection Observer global definido en `Layout.astro` que apunta a elementos `.anim-item`, añadiendo la clase `.visible` al entrar en pantalla.

### Configuración de Astro

La URL del sitio es `https://topoquizz.com`. La integración `@astrojs/sitemap` genera `sitemap.xml` automáticamente en el build.

### Idioma

Todo el contenido de la UI está en español (`lang="es"`). Mantener el español al editar textos.
