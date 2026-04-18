# TopoQuizz Landing Page — Análisis Técnico y de Producto

> Revisado: 2026-04-16 | Stack: Astro 6 + Lottie + Vanilla JS | Idioma: Español

---

## Bloqueadores de Producción (Críticos — No publicar sin resolver)

### 1. Todos los botones de tiendas apuntan a `#` — Cada CTA principal está roto

**Archivos afectados:** `landing/src/pages/index.astro:13-14`, `Hero.astro`, `Download.astro`, `Footer.astro`

```js
// index.astro
const appStoreUrl = '#';
const playStoreUrl = '#';
```

Este par de variables se pasa como props a cuatro componentes distintos. El resultado es que absolutamente todos los botones de descarga de la landing —el CTA del hero, los dos botones de la sección de descarga, y los links del footer— no llevan a ningún lado. Desde la perspectiva del usuario, esto es indistinguible de una página rota.

El problema no es solo estético: si estás invirtiendo en tráfico (orgánico, social, o pagado), cada visita que intenta descargarte la app termina sin conversión y sin ninguna alternativa.

**Qué hacer:**
- Si la app no está en tiendas todavía, reemplaza los botones con un formulario de captura de email para lista de espera. Herramientas como Mailchimp, ConvertKit o incluso un simple `<form>` que envíe a un endpoint de Netlify/Vercel funcionan.
- Si quieres mantener los botones visualmente pero que no sean clicables, usa `aria-disabled="true"` y `pointer-events: none` explícitamente (ya existe la clase `.soon` en global.css que hace esto, pero el `href="#"` sigue siendo semánticamente incorrecto — usa `href` vacío o un `<button>` en lugar de `<a>`).

---

### 2. El enlace de Beta va a Google Drive — Destructor de confianza

**Archivo:** `landing/src/components/Download.astro:33`

```html
<a href="https://drive.google.com/drive/folders/1PSRJvMRLb8qFjWZ_8o2h0DOGk7B4yQJB"
   target="_red"
   rel="noopener noreferrer">
  Ver Beta
</a>
```

Hay dos problemas graves aquí:

**Problema técnico:** `target="_red"` es un typo. Los valores válidos de `target` son `_blank`, `_self`, `_parent`, `_top`, o un nombre de frame. `"_red"` crea un contexto de navegación con ese nombre, lo que puede resultar en comportamientos inconsistentes entre navegadores.

**Problema de producto:** Enviar a los usuarios a una carpeta de Google Drive para descargar una app beta es una señal muy fuerte de baja madurez del producto. Los usuarios acostumbrados a apps móviles esperan flujos de distribución beta estándar. Una carpeta de Drive levanta inmediatamente preguntas de seguridad ("¿Es esto legítimo?", "¿Habrá malware?") y muchos usuarios abandonarán sin descargar.

**Alternativas reales:**
- **iOS:** TestFlight es la solución estándar. Gratis, oficial de Apple, da hasta 10.000 testers externos, y el link de invitación es simple y reconocible.
- **Android:** Firebase App Distribution (gratis, de Google) o Expo EAS Update si usas React Native/Expo. Ambos generan links de distribución que se ven profesionales y guían al usuario paso a paso.
- **Ambas plataformas:** Expo EAS Build puede generar distribuciones para iOS y Android desde el mismo pipeline.

---

### 3. Páginas legales inexistentes — Exposición legal y bloqueo en tiendas

**Archivo:** `landing/src/components/Footer.astro:52-54`

```html
<a href="#">Privacidad</a>
<a href="#">Términos</a>
<a href="#">Soporte</a>
```

Los tres links están muertos. Esto tiene consecuencias en múltiples capas:

- **App Store Connect y Google Play Console requieren URLs de Política de Privacidad válidas** para publicar cualquier app. Sin esto, la publicación será rechazada.
- **RGPD (Europa) y LOPD (España)** exigen una política de privacidad accesible si recoges cualquier dato personal (incluso analytics o emails de lista de espera).
- **Confianza del usuario:** Los usuarios que llegan a la landing y ven links muertos en el footer — especialmente privacidad — pierden confianza inmediatamente.
- **Soporte sin email:** No hay ninguna forma de contacto real en la página. Un usuario con problemas en la beta no tiene a dónde acudir, lo que genera frustración y reviews negativas.

**Qué hacer como mínimo viable:**
- Crea `/src/pages/privacidad.astro` y `/src/pages/terminos.astro` con contenido real (existen generadores gratuitos como iubenda o termsfeed para comenzar).
- Reemplaza `href="#"` en Soporte por `href="mailto:soporte@topoquizz.com"` o similar.

---

## Problemas de SEO y Metadatos

### 4. La OG Image es el logo — Aspecto ratio incorrecto para redes sociales

**Archivo:** `landing/src/layouts/Layout.astro:15`

```js
const ogImage = `${siteUrl}/logoTopoQuizz.png`;
```

Cuando alguien comparte la URL de TopoQuizz en WhatsApp, Twitter/X, LinkedIn o Facebook, la plataforma descarga esta imagen para mostrarla en la preview. El estándar de Open Graph para imágenes es **1200×630px** (ratio 1.91:1). Un logo raramente tiene estas dimensiones — suele ser cuadrado o rectangular horizontal pero en resolución pequeña.

El resultado probable es una imagen pixelada, recortada, o mostrada con barras negras, lo que reduce significativamente el CTR (click-through rate) de esos shares. Teniendo en cuenta que el canal social (Instagram, TikTok) es exactamente la estrategia de adquisición de esta app según los links en el JSON-LD, esto es una pérdida directa de conversiones.

**Qué hacer:**
- Crea una imagen específica de 1200×630px con: captura de pantalla de la app a la izquierda, tagline a la derecha, logo pequeño arriba. Figma tarda 20 minutos en esto.
- Guárdala como `/public/og-image.jpg` (JPEG es mejor que PNG para OG images — menor peso, mismo soporte).
- Actualiza la referencia en `Layout.astro`.

---

### 5. Etiquetas SEO faltantes

**Archivo:** `landing/src/layouts/Layout.astro`

**`theme-color` ausente:**
```html
<!-- Añadir esto -->
<meta name="theme-color" content="#283143" />
```
Sin esto, la barra del navegador en Android Chrome muestra el color gris por defecto. Dado que el público objetivo (estudiantes de medicina en sus 20s) usa móvil principalmente, este detalle afecta la percepción visual de la marca en el primer contacto.

**Twitter/X incompleto:**
```html
<!-- Faltan estas -->
<meta name="twitter:site" content="@topoquizz" />
<meta name="twitter:creator" content="@topoquizz" />
```

**`og:locale` apunta a España cuando el mercado es Latinoamérica:**
```html
<meta property="og:locale" content="es_ES" />  <!-- actual -->
<meta property="og:locale" content="es_419" />  <!-- correcto para LATAM -->
```
Facebook y otras plataformas usan este valor para segmentación. Si el mercado objetivo es México, Argentina, Colombia, etc., `es_ES` es incorrecto.

---

### 6. JSON-LD incompleto — Señales de rich results desperdiciadas

**Archivo:** `landing/src/layouts/Layout.astro:17-61`

El JSON-LD está bien estructurado en general, pero le faltan campos que Google usa activamente para rich results:

```json
// Falta en SoftwareApplication:
"aggregateRating": {
  "@type": "AggregateRating",
  "ratingValue": "4.8",
  "ratingCount": "47"
},
"offers": {
  "@type": "Offer",
  "price": "0",
  "priceCurrency": "USD",
  "availability": "https://schema.org/PreOrder"  // o InStock cuando esté publicada
},
"downloadUrl": "https://topoquizz.com/#descargar"
```

`aggregateRating` es especialmente importante — es lo que hace que aparezcan las estrellas en los resultados de búsqueda, lo que aumenta el CTR orgánico considerablemente. Aunque estés en beta, puedes usar ratings reales de tus testers iniciales.

---

## Rendimiento e Imágenes

### 7. 18 imágenes PNG cargan sin lazy loading — Impacto directo en Core Web Vitals

**Archivo:** `landing/src/components/Screenshots.astro:26-36`

```astro
{screenshots.map(s => (
  <div class="phone-frame">
    <img src={s.src} alt={s.alt} class="frame-img" />  <!-- Sin loading="lazy" -->
  </div>
))}
```

El carrusel duplica el array de screenshots (9 originales + 9 `aria-hidden` para el loop infinito) = **18 imágenes PNG cargando todas al mismo tiempo**, incluyendo las que están completamente fuera del viewport. En una conexión 4G promedio esto puede traducirse en varios segundos de carga adicional.

Además, ninguna imagen tiene atributos `width` y `height`. Sin ellos, el navegador no puede reservar espacio para la imagen antes de descargarla, lo que provoca **CLS (Cumulative Layout Shift)** — el contenido "salta" mientras carga. Google penaliza esto directamente en el ranking orgánico.

**Fix inmediato:**
```astro
<img
  src={s.src}
  alt={s.alt}
  class="frame-img"
  loading="lazy"
  width="270"
  height="585"
/>
```

**Fix a largo plazo:** Usar el componente `<Image>` de `astro:assets` que convierte automáticamente a WebP, añade `srcset` para responsive, y gestiona `width`/`height`:
```astro
import { Image } from 'astro:assets';
<Image src={s.src} alt={s.alt} width={270} height={585} format="webp" loading="lazy" />
```

---

### 8. Imagen hero sin `fetchpriority` — LCP subóptimo

**Archivo:** `landing/src/components/Hero.astro:45`

```html
<img src={`${import.meta.env.BASE_URL}screenshots/init.png`}
     alt="TopoQuizz pantalla inicial"
     class="phone-img" />
```

Esta imagen es la más importante de la página — está above the fold y es probablemente el **LCP element (Largest Contentful Paint)**. Sin `fetchpriority="high"`, el navegador la trata con la misma prioridad que cualquier otra imagen, potencialmente retrasando el renderizado del contenido más visible.

```html
<img src="..."
     alt="TopoQuizz pantalla inicial"
     class="phone-img"
     fetchpriority="high"
     width="320"
     height="693" />
```

---

### 9. Lottie (`lottie-web`) para el mascote — 534KB por una animación decorativa

**Archivo:** `landing/src/components/Hero.astro:52-61`

```js
import lottie from 'lottie-web';  // ~534KB minificado, ~170KB gzipped

lottie.loadAnimation({
  container: document.getElementById('mascot-lottie'),
  renderer: 'svg',
  loop: true,
  autoplay: true,
  path: `${import.meta.env.BASE_URL}HomeMole.json`,
});
```

La librería `lottie-web` completa pesa ~534KB minificado (~170KB gzipped). Se carga síncronamente en el hero para animar un mascote decorativo. Esto bloquea el TTI (Time to Interactive) y penaliza el score de performance en Lighthouse.

El mismo Lottie se usa también en el QuizDemo (correcto/incorrecto, confetti, podium) donde sí está justificado por ser interactivo y crítico para la UX.

**Fix a corto plazo:**
- Usar el build ligero: `import lottie from 'lottie-web/build/player/lottie_light.min.js'` (~150KB menos).
- Cargar la animación del mascote con `IntersectionObserver` en lugar de `autoplay` inmediato.

**Fix a largo plazo:**
- Reemplazar el mascote con una animación CSS pura (rotate, bounce, float) o con un SVG animado. Libera completamente el peso de Lottie en el hero.

---

## Arquitectura y Código

### 10. 350 líneas de estilos `:global()` dentro de un componente — Leakage de scope

**Archivo:** `landing/src/components/QuizDemo.astro:376-730`

Astro tiene un sistema de scoping de estilos por componente. Sin embargo, al usar `:global()`, todos esos estilos afectan al documento completo, anulando el aislamiento. Actualmente hay más de 350 líneas de CSS con `:global()` dentro de `QuizDemo.astro`.

Aunque en este momento no hay colisiones visibles (los prefijos `.qd-*` son consistentes), esto es una deuda técnica importante:
- Añadir cualquier elemento con clase similar en otro componente puede romperse sin warning.
- El CSS no es tree-shakeable — siempre se incluye aunque el componente no esté en pantalla.
- Dificulta el mantenimiento cuando el proyecto crece.

**Fix:** Mover los estilos globales del quiz a `global.css` bajo la sección `/* QuizDemo */` con comentario delimitador, o convertirlos a estilos scoped eliminando `:global()` donde sea posible (principalmente en los elementos generados dinámicamente vía `innerHTML`).

---

### 11. `innerHTML` con interpolación de strings — Patrón de riesgo

**Archivo:** `landing/src/components/QuizDemo.astro:194-248`

```js
root.innerHTML = `
  ...
  <p class="qd-q-text">${q.question}</p>
  ...
`;
```

Actualmente las preguntas están hardcodeadas en el componente, por lo que no hay riesgo inmediato de XSS. Sin embargo, el patrón de interpolar variables directamente en `innerHTML` es peligroso porque:

1. Si las preguntas alguna vez vienen de una API externa, cualquier pregunta que contenga `<script>` o caracteres especiales puede ejecutar código arbitrario.
2. Si alguien añade preguntas desde un CMS sin sanitización, mismo problema.

**Fix inmediato:** Usar `textContent` para el contenido de texto puro, o crear elementos DOM programáticamente:
```js
const p = document.createElement('p');
p.className = 'qd-q-text';
p.textContent = q.question;  // textContent escapa HTML automáticamente
```

---

## Contenido y UX

### 12. Mensajes contradictorios entre secciones — El usuario no sabe qué esperar

La página comunica tres estados distintos en el mismo scroll:

| Sección | Mensaje |
|---|---|
| Hero badge | "Acceso Beta Exclusivo" — ya disponible |
| Store buttons | "Próximamente en App Store / Google Play" — no disponible |
| HowItWorks paso 1 | "Disponible gratis en App Store y Google Play. Instala en segundos." — disponible (falso) |
| Stats | "Beta Activa · iOS · Android próximamente" — solo iOS en beta |

Un usuario que lee esto en orden queda confundido sobre si puede descargar la app o no. La sección de HowItWorks en particular tiene copy que asume que la app está publicada en tiendas cuando no lo está — esto es información objetivamente incorrecta.

**Fix:** Establecer un mensaje único y consistente ("La Beta está disponible por invitación. Regístrate para acceder.") y que cada sección refuerce ese mismo mensaje en lugar de contradecirlo.

---

### 13. El H1 es genérico — No diferencia de la competencia

**Archivo:** `landing/src/components/Hero.astro:17`

```html
<h1>Practica Medicina jugando</h1>
```

"Practicar jugando" es el claim de prácticamente cualquier app de aprendizaje. No comunica:
- Para quién es (estudiantes de medicina en específico, ¿qué año?)
- Qué resultado concreto logran (¿aprobar el examen? ¿mejorar nota? ¿preparar MIR/USMLE?)
- Por qué es diferente

Ejemplos más específicos y orientados a resultado:
- `"Prepara tus parciales de Anatomía y Farmacología — con preguntas cronometradas"`
- `"El simulador de examen que estudia contigo — 1.500 preguntas, sin internet"`
- `"Domina lo que más te cuesta en Medicina — en 10 minutos al día"`

El H1 es el primer texto que lee el usuario y el más relevante para SEO en términos semánticos. Vale la pena iterar sobre él con A/B testing una vez que haya tráfico.

---

### 14. Las features describen funcionalidades, no beneficios

**Archivo:** `landing/src/components/Features.astro`

Esta es la diferencia entre feature-oriented y benefit-oriented copy:

| Feature (actual) | Benefit (sugerido) |
|---|---|
| "3 Niveles de Dificultad" | "Empieza desde cero. Llega a nivel de examen final." |
| "Sin conexión" | "Estudia en el metro, en guardia, sin WiFi." |
| "Modo Cronómetro" | "Entrena para el ritmo real de tu parcial." |
| "Progreso Detallado" | "Descubre exactamente dónde estás fallando — y arréglalo." |
| "2 materias en Beta" | "Anatomía y Farmacología ahora — más materias cada mes." |

El beneficio responde a "¿qué gano yo con esto?". La feature responde a "¿qué tiene esto?". Los usuarios toman decisiones de descarga basadas en beneficios percibidos, no en listas de características.

---

### 15. Stats sin prueba social real

**Archivo:** `landing/src/components/Stats.astro`

```
1500+ Preguntas en Beta | 2 materias | +Flashcards | 3 Niveles
```

Estas son métricas de producto, no prueba social. No generan confianza porque no hablan de personas reales usando la app. Si hay usuarios reales en la beta, datos como estos serían mucho más persuasivos:

- "847 estudiantes en Beta activa"
- "23.000+ preguntas respondidas esta semana"
- "Nota promedio mejorada un 18% en la segunda sesión"

Si aún no tienes estos datos, considera reemplazar la sección de stats por testimonios cortos de los primeros beta testers.

---

### 16. El botón "Ir a materias" del quiz lleva a la sección de descarga

**Archivo:** `landing/src/components/QuizDemo.astro:346`

```html
<a href="#descargar" class="qd-result-subjects">Ir a materias</a>
```

El texto del botón dice "Ir a materias" pero el enlace apunta a `#descargar` (la sección de descarga). Un usuario que acaba de terminar el quiz y quiere explorar otras materias, espera ir a una sección de materias o features. Ir a la sección de descarga no es lo que pide el label.

**Fix:** O cambiar el label a "Descargar la app completa" (que es lo que realmente hace), o crear un anchor `#features` que lleve a la sección de materias disponibles.

---

## Typos y Errores Textuales

| Archivo | Línea | Error | Corrección |
|---|---|---|---|
| `Download.astro` | 33 | `target="_red"` | `target="_blank"` |
| `Download.astro` | 62, 86 | `"Siguenos"` | `"Síguenos"` |
| `Stats.astro` | 9 | `"proximamente"` | `"próximamente"` |
| `Stats.astro` | 13 | `"proximamente"` | `"próximamente"` |
| `Stats.astro` | 9 | `"+Flashcards  proximamente"` (doble espacio) | `"+Flashcards próximamente"` |
| `Hero.astro` | 19 | `"MUY PRONTO MÁS MATERIAS"` en mayúsculas dentro del subtítulo | Normalizar casing |

---

## Plan de Acción Priorizado

### Hacer ahora — Antes de cualquier tráfico (< 2 horas total)

| # | Acción | Archivo | Impacto |
|---|---|---|---|
| 1 | Corregir `target="_red"` → `target="_blank"` | `Download.astro:33` | Bug funcional |
| 2 | Corregir los 4 typos de texto | `Download.astro`, `Stats.astro` | Credibilidad |
| 3 | Añadir `loading="lazy"` a todas las imágenes del carrusel | `Screenshots.astro:27,35` | Performance |
| 4 | Añadir `fetchpriority="high"` + `width`/`height` a la imagen hero | `Hero.astro:45` | LCP |
| 5 | Añadir `width`/`height` a todas las `<img>` restantes | Header, Screenshots | CLS |
| 6 | Añadir `<meta name="theme-color" content="#283143">` | `Layout.astro` | UX móvil |
| 7 | Reemplazar store buttons `href="#"` por botón deshabilitado semánticamente o formulario de lista de espera | `index.astro:13-14` | Conversión |
| 8 | Corregir el copy de HowItWorks paso 1 para reflejar el estado beta real | `HowItWorks.astro:17` | Consistencia |

### A mediano plazo — Sprint siguiente

| # | Acción | Esfuerzo estimado |
|---|---|---|
| 1 | Crear páginas `/privacidad` y `/terminos` con contenido real | Medio |
| 2 | Migrar distribución beta de Google Drive a TestFlight / Firebase App Distribution | Medio |
| 3 | Crear OG image dedicada (1200×630px) y actualizar referencia en Layout | Bajo |
| 4 | Reescribir copy de features section orientado a beneficios | Bajo |
| 5 | Añadir email de soporte real en footer | Bajo |
| 6 | Usar lottie light build + lazy load del mascote | Bajo |

### A largo plazo — Mes siguiente

| # | Acción | Esfuerzo estimado |
|---|---|---|
| 1 | Migrar todas las imágenes PNG a WebP usando `astro:assets` `<Image>` | Medio |
| 2 | Mover estilos `:global()` de QuizDemo a `global.css` | Bajo |
| 3 | Añadir `aggregateRating` y `downloadUrl` al JSON-LD | Bajo |
| 4 | Añadir `@astrojs/sitemap` para generar sitemap automático | Bajo |
| 5 | Implementar A/B testing en H1 una vez haya tráfico real | Alto |
| 6 | Reemplazar sección Stats con testimonios o métricas reales de usuarios | Medio |

---

## Resumen Ejecutivo

El stack técnico es bueno: Astro genera HTML estático rápido, la estructura de componentes es limpia, el JSON-LD está presente y bien pensado, y el demo interactivo del quiz es un diferenciador de conversión genuinamente fuerte — pocas landing pages de apps de estudiantes tienen algo así.

Sin embargo, hay **tres bloqueadores que impiden que esta página funcione** como herramienta de adquisición real:
1. Todos los CTAs de descarga están rotos (`href="#"`)
2. El enlace de beta lleva a Google Drive (destroza la confianza)
3. Las páginas legales no existen (bloquea publicación en tiendas)

Ninguna inversión en tráfico — orgánico, social o pagado — va a dar retorno hasta que estos tres puntos estén resueltos.

Después de eso, el mayor impacto en rendimiento viene de la optimización de imágenes (lazy loading + WebP + dimensiones explícitas), que directamente afecta Core Web Vitals y por ende el ranking orgánico en Google. Y el mayor impacto en conversión viene de hacer que el copy cuente historias de beneficios reales en lugar de listar funcionalidades.
