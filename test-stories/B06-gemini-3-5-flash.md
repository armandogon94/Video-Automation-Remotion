# Story #B06 — Gemini 3.5 Flash — Full Angle Detail

> **Source calendar:** [CONTENT_CALENDAR_2026-W21-v2.2.md](../CONTENT_CALENDAR_2026-W21-v2.2.md)
> **Voice contract:** VOICE.md v1.5 (esp. §3 anti-clickbait, §5 voice spine, §9 tags + caption rules, §14 translation check, §15 captivating-hook rule, §16 emotion-in-visuals, §17 no em-dashes)
> **Status:** 1 of 5 angles SHIPPING this week (Angle C, Thu 2026-05-21). 4 of 5 in BACKLOG.
> **Audience:** Spanish-speaking founders / operators / developers in Latam, 25-35, building on AI APIs.
> **Last updated:** 2026-05-19 (post-keynote, evening)

---

## Story spec

**What happened:** Google confirmed **Gemini 3.5 Flash** at I/O 2026 today (Mon 2026-05-19, ~00:35 keynote timestamp). Small/fast tier model: **4× faster** than Gemini 3.0 Flash, **~15× per-token discount vs GPT-5.5** with **90%+ coding parity**. Benchmark chart shown vs GPT-5 + Sonnet-4 during the keynote (~00:35).

**What Google deliberately held back:** Gemini **3.5 Pro**, "available next month." The keynote framed this as a sequencing choice, not a delay.

**Why this is a story for our audience:** founders building on AI APIs see their unit economics rewrite overnight. Features they'd turned off (AI summarization, async agents, typeahead) become re-affordable. The version-number jump from 3.0 to 3.5 also kills our pulled v2.1 "Gemini 3.2 Flash leak" carousel, porque Google skipped 3.2/3.3/3.4 entirely.

**Tags applicable per §9:** none required for B/C/D (confirmed product, mechanism-honest). `OPINIÓN` required on Angle A (meta-accountability). `OPINIÓN` recommended on Angle E (speculative).

**Primary sources (verify before posting):**
- `[ai.google.dev/pricing — verify]` Official Gemini API pricing page
- `[blog.google/technology/ai/gemini-3-5-flash — verify]` Official Google blog announcement
- `[deepmind.google/discover/blog — verify]` DeepMind technical post
- `[youtube.com/I/O-2026-keynote — verify timestamp ~00:35]` Benchmark chart segment
- `[developers.googleblog.com — verify]` Developer Blog rollout post

**Sibling-agent dependencies:**
- Pichai photoreal refs: already in `pichai-sundar/refs/` (surprise + intense focus poses)
- Hassabis photoreal refs: **need v6 refresh** (blocking for Angle E)
- Brand-avatar Armando: needs calm-smirk pose (Angle A) + curious-pointing pose (Angle D) + satisfied pose (Angle C CTA)

---

## Angle A — "El leak salió mal, pero la apuesta era correcta" (BACKLOG)

**Hook (slide 1 title):** "Filtramos Gemini 3.2 Flash. Google lanzó 3.5 Flash. La versión cambió. La apuesta no."
**Anchor / emotion:** brand-avatar Armando con **calm smirk**, slight head tilt, arms relaxed (§16: self-aware accountability, not defensive)
**Format:** 8 slides, 4:5, style `dark-minimal` with a small `v2.1 KILLED` sticker visual element
**Voice spine (§5):** what (we missed the version number) · why (Google skipped 3.2/3.3/3.4) · what it means (the underlying thesis survived) · what to do (trust the mechanism, not the rumor count)
**§15 hook compliance:** body delivers mechanism (which part of the call held vs. which part missed) by slide 3.
**Tag:** **OPINIÓN** on slide 1 (mandatory; this is meta-commentary on our own editorial process).

### Slide 1 — Cover
- **Type:** cover
- **Title (ES):** "El leak salió mal. La apuesta no."
- **Subtitle (ES):** "Filtramos Gemini 3.2 Flash. Google lanzó 3.5 Flash. Cuenta lo que pasó."
- **Tag:** OPINIÓN
- **Visual direction:** brand-avatar Armando, calm smirk, mirando a cámara, dark navy background, a small "v2.1 KILLED" sticker en la esquina superior, gold accent thin underline below the hook
- **Background image:** `01-cover.png`
- **Caption-to-self:** abre con accountability. Gancho honesto pre-mortem.

### Slide 2 — Lo que dijimos el lunes
- **Type:** content
- **Heading (ES):** "Lo que publicamos el lunes"
- **Body (ES):** "El lunes 18 sacamos un carrusel con tag FILTRACIÓN: Gemini 3.2 Flash, 15× más barato que GPT-5.5, 4× más rápido. Hoy en I/O, Google saltó 3.2, 3.3, 3.4 y lanzó 3.5 Flash directo."
- **Icon / number:** "1"
- **Visual direction:** screenshot stylizado del cover de v2.1, lightly desaturated, con un sello rojo translúcido "v2.1 KILLED"
- **Background image:** `02-lo-que-dijimos.png`
- **Caption-to-self:** mostrar el error en pantalla, sin esconderlo.

### Slide 3 — Qué falló y qué sobrevivió
- **Type:** comparison
- **Heading (ES):** "Qué falló. Qué sobrevivió."
- **Left label:** "Falló"
- **Left content (ES):** "El número de versión. 3.2 nunca existió. Google saltó tres releases internos y publicó 3.5 directo."
- **Right label:** "Sobrevivió"
- **Right content (ES):** "La tesis. Flash tier = descuento agresivo (~15×). Coding parity ~90%. Velocidad 4×. Los tres números del leak se confirmaron en el keynote."
- **Visual direction:** dos columnas equilibradas, izquierda rojo apagado, derecha verde gold; centro: linea vertical fina
- **Background image:** `03-fallo-vs-sobrevivio.png`
- **Caption-to-self:** mechanism por §15. Qué del leak era ruido vs qué era señal.

### Slide 4 — Por qué saltaron tres versiones
- **Type:** content
- **Heading (ES):** "Por qué Google saltó 3.2, 3.3, 3.4"
- **Body (ES):** "Versiones internas que nunca salieron al público. Reasignación de cómputo hacia Spark + Antigravity 2.0. Cuando vuelven a versionar para producción, brincan al número que refleja el salto real de capacidad."
- **Icon / number:** "2"
- **Visual direction:** timeline horizontal: 3.0 → (3.2/3.3/3.4 grises) → 3.5 en gold
- **Background image:** `04-timeline-versiones.png`
- **Caption-to-self:** humanizar el cómo decide Google sus números, sin acusar.

### Slide 5 — La lección sobre filtraciones
- **Type:** content
- **Heading (ES):** "La lección que nos llevamos"
- **Body (ES):** "Las filtraciones aciertan en el mecanismo y fallan en los detalles. Por eso a partir de esta semana esperamos 24h post-keynote antes de publicar carruseles sobre eventos confirmados. Perdemos el primer lugar. Ganamos confianza."
- **Icon / number:** "3"
- **Visual direction:** reloj estilizado mostrando "+24h," gold accent
- **Background image:** `05-leccion.png`
- **Caption-to-self:** convertir el error en regla editorial visible.

### Slide 6 — Qué hacer si compraste el leak
- **Type:** content
- **Heading (ES):** "Si construiste algo con el número 3.2"
- **Body (ES):** "El nombre del modelo en tu código cambia de `gemini-3.2-flash` a `gemini-3.5-flash`. La economía de tu producto no cambia: el descuento de 15× es real. Tu apuesta sigue de pie. Solo actualiza el string."
- **Icon / number:** "4"
- **Visual direction:** code snippet con before/after, font monospace, accent gold sobre la línea cambiada
- **Background image:** `06-codigo-actualizar.png`
- **Caption-to-self:** valor directo. Esta es la slide que la gente guarda.

### Slide 7 — Lo que cambia en nuestro proceso
- **Type:** list
- **Heading (ES):** "Nuestras tres reglas nuevas"
- **Items (ES):**
  1. "Cero carruseles de rumor en las 48h previas a un keynote confirmado."
  2. "Toda filtración se publica con tesis explícita: 'el mecanismo es X, el número puede mover ±20%.'"
  3. "Postmortem público cuando fallamos. Como este."
- **Visual direction:** tres líneas con números grandes en gold, fondo navy plano, jerarquía tipográfica clara
- **Background image:** `07-tres-reglas.png`
- **Caption-to-self:** institucionaliza la accountability. Esto es marca-trust.

### Slide 8 — CTA
- **Type:** cta
- **Heading (ES):** "Si te sirve este nivel de honestidad, quédate."
- **Body (ES):** "Mañana publicamos la matemática real de Gemini 3.5 Flash. Esta vez con la página de pricing oficial abierta al lado."
- **Button text:** "Sígueme para el carrusel del jueves"
- **Show handle:** true
- **Visual direction:** brand-avatar Armando satisfied (no smirk, calm), señalando un calendario con jueves marcado
- **Background image:** `08-cta.png`

### Caption (Instagram, Spanish, ~150-220 words)

El lunes pasado publiqué un carrusel con tag FILTRACIÓN: "Gemini 3.2 Flash, 15× más barato que GPT-5.5." Hoy en el I/O 2026, Google saltó 3.2, 3.3 y 3.4, y lanzó **3.5 Flash** directo.

Versión equivocada. Apuesta correcta.

Los tres números del leak (descuento 15×, parity ~90% en coding, 4× más rápido) se confirmaron en el keynote de Sundar (~min 35). Lo que falló fue el número de versión, porque Google no versiona en público sus releases internos.

Tres cosas cambian en mi proceso, y las dejo escritas aquí para que me las puedan recordar:

1. Cero rumores en las 48h antes de un evento confirmado.
2. Toda filtración va con tesis explícita y rango de error.
3. Postmortem público cuando me equivoco. Este carrusel es ese postmortem.

Mañana (jueves) publico la matemática real de 3.5 Flash con la página de pricing oficial al lado. Sin tags de filtración. Solo el cálculo que necesitas para decidir si vuelves a encender features que apagaste por costo.

Fuente confirmada: I/O 2026 keynote `[youtube.com/I/O-2026-keynote — verify timestamp ~00:35]`.

Si esta forma de trabajar te sirve, dale guardar.

### Hashtags (8-12)

#GeminiFlash #IO2026 #AIDevelopers #LatamFounders #AIAPIs #ProductPricing #StartupsLatam #AIEthics #GoogleAI #BuildingInPublic

---

## Angle B — "Sundar primed para la dev mindshare" (BACKLOG)

**Hook (slide 1 title):** "Pichai está comprando de regreso el cariño de los developers. Y 3.5 Flash es el cheque."
**Anchor / emotion:** Sundar Pichai photoreal, **intense focus**, leaning slightly forward, hands clasped, eyes fixed on something off-frame (§16: industry-lens, Pichai en modo estratégico)
**Format:** 8 slides, 4:5, style `dark-minimal` with a thin map-of-the-AI-industry diagram on slide 4
**Voice spine (§5):** what (Flash es agresivamente barato) · why (Google perdió dev mindshare en early 2026 a Anthropic) · what it means (este es un movimiento de recompra de atención, no solo de pricing) · what to do (úsalo, pero entiende que estás siendo cortejado)
**§15 hook compliance:** body delivers the "industry recapture" mechanism by slide 3 (the dev-mindshare timeline).
**Tag:** none required (confirmed product). Some operators may read this as opinion-leaning; if so, add `OPINIÓN` on slide 1.

### Slide 1 — Cover
- **Type:** cover
- **Title (ES):** "Pichai está comprando de regreso a los developers."
- **Subtitle (ES):** "Y 3.5 Flash es el cheque."
- **Tag:** null (o OPINIÓN si el editor lo prefiere)
- **Visual direction:** Pichai photoreal portrait, intense focus, leaning-in pose, dark navy background, gold accent line, no smile, no logo on screen, solo la frase
- **Background image:** `01-cover.png`
- **Caption-to-self:** retrato de estratega, no de CEO en escenario.

### Slide 2 — Qué lanzó hoy
- **Type:** content
- **Heading (ES):** "Qué lanzó Google hoy"
- **Body (ES):** "Gemini 3.5 Flash. Modelo pequeño y rápido. 4× la velocidad de 3.0 Flash. Más de 90% del rendimiento de coding de GPT-5.5 a aproximadamente 1/15 del precio por token. Disponible hoy en API, app, Search y Antigravity 2.0."
- **Icon / number:** "1"
- **Visual direction:** stats grandes en gold sobre fondo navy, sin decoración
- **Background image:** `02-que-lanzo.png`
- **Caption-to-self:** primero los hechos crudos, luego la interpretación.

### Slide 3 — Por qué importa (la línea de tiempo)
- **Type:** content
- **Heading (ES):** "Lo que pasó entre enero y hoy"
- **Body (ES):** "Enero 2026: Anthropic absorbe a Karpathy y la mayoría de los devs de OpenAI. Febrero-abril: Antigravity 1 no aterriza. Mayo: Google llega al I/O con Antigravity 2.0 chat-first + 3.5 Flash a 1/15 del precio. Es la jugada de recompra, no de catch-up."
- **Icon / number:** "2"
- **Visual direction:** timeline horizontal con 4 hitos: Karpathy ⇨ Antigravity 1 silencio ⇨ I/O 2026 ⇨ Flash pricing
- **Background image:** `03-timeline-mindshare.png`
- **Caption-to-self:** §15. Entrega el mecanismo (recompra de atención) acá.

### Slide 4 — El mapa de la industria
- **Type:** comparison
- **Heading (ES):** "Quién tiene a los developers en mayo 2026"
- **Left label:** "Anthropic"
- **Left content (ES):** "Claude Code, OpenClaw, talento ex-OpenAI, vibes de seguridad. Caro pero querido."
- **Right label:** "Google (después de hoy)"
- **Right content (ES):** "Antigravity 2.0 chat-first, Flash a 1/15 del precio, integración Workspace. Barato y conveniente."
- **Visual direction:** dos columnas, logos pequeños arriba, dark navy plano
- **Background image:** `04-mapa-industria.png`
- **Caption-to-self:** equilibrio explícito. No es Google vs Anthropic, es estrategias distintas.

### Slide 5 — La jugada táctica
- **Type:** content
- **Heading (ES):** "Cómo se compra atención de developers"
- **Body (ES):** "Pricing agresivo + tooling de primera (Antigravity 2.0) + un modelo que sí compite con Sonnet en coding. La táctica funciona porque los devs prueban lo barato cuando es bueno. Y se quedan cuando funciona."
- **Icon / number:** "3"
- **Visual direction:** tres íconos en línea (price tag, terminal, checkmark), gold accent
- **Background image:** `05-tactica.png`
- **Caption-to-self:** desarmar la jugada. No es solo precio.

### Slide 6 — Lo que esto significa para ti
- **Type:** content
- **Heading (ES):** "Lo que esto significa para tu stack"
- **Body (ES):** "Vas a estar siendo cortejado por 6-12 meses. Google va a abaratar más, integrar más, y empujar Flash hasta donde aguante. Aprovéchalo. Pero no dependas de un solo vendor: el cortejo termina cuando capturan el mercado."
- **Icon / number:** "4"
- **Visual direction:** brand-avatar Armando calm-certainty, brazo cruzado, mirada lateral
- **Background image:** `06-significa-para-ti.png`
- **Caption-to-self:** advertencia honesta. Usar la oferta sin atarse.

### Slide 7 — Qué hacer esta semana
- **Type:** list
- **Heading (ES):** "Tres movimientos para esta semana"
- **Items (ES):**
  1. "Cambia tus features de bajo riesgo a Flash. Empieza por summarización y embeddings."
  2. "Mide latencia + costo real durante 14 días antes de mover features críticas."
  3. "Mantén dos vendors en tu abstracción de modelo. Siempre."
- **Visual direction:** tres líneas numeradas, gold sobre navy
- **Background image:** `07-tres-movimientos.png`
- **Caption-to-self:** valor accionable. Esto se guarda.

### Slide 8 — CTA
- **Type:** cta
- **Heading (ES):** "Estás siendo cortejado. Aprovéchalo."
- **Body (ES):** "Si esta lectura industrial te sirve, mañana publico la matemática exacta de cuánto te ahorras pasando a Flash."
- **Button text:** "Sígueme para más análisis de industria"
- **Show handle:** true
- **Visual direction:** brand-avatar Armando satisfied, señalando una libreta con "MOVIMIENTOS DE LA SEMANA"
- **Background image:** `08-cta.png`

### Caption (Instagram, Spanish, ~150-220 words)

Sundar Pichai no es el tipo que regala dinero. Cuando Google lanza un modelo a 1/15 del precio de la competencia, no es generosidad. Es recompra de atención.

Mirá la línea de tiempo: en enero, Anthropic absorbió a Karpathy y a media docena de devs ex-OpenAI. En febrero, Antigravity 1 no aterrizó. Entre marzo y abril, todos los founders que conozco en Latam se mudaron a Claude Code u OpenClaw.

Hoy en el I/O 2026, Google contestó con tres cosas combinadas: **Antigravity 2.0 chat-first**, **Gemini 3.5 Flash a ~1/15 del costo de GPT-5.5**, y **90%+ de parity en coding contra Sonnet-4** (chart del keynote ~min 35).

Es la jugada de recompra. Y va a durar 6-12 meses. Durante esa ventana, vas a tener pricing agresivo, tooling pulido y soporte de DevRel. Aprovéchalo.

Pero, y esta es la parte importante: **no te ates a un solo vendor**. El cortejo termina cuando capturan el mercado.

Fuentes: I/O 2026 keynote `[youtube.com/I/O-2026-keynote — verify timestamp ~00:35]`, Google AI blog `[blog.google/technology/ai/gemini-3-5-flash — verify]`.

Si te sirve la lectura de industria, dale guardar y mañana sale la matemática exacta.

### Hashtags (8-12)

#GoogleIO #GeminiFlash #SundarPichai #AIIndustry #DevTools #LatamFounders #AntigravityCLI #AIBusiness #StartupStrategy #BuildingInPublic

---

## Angle C — "Tu API de IA se acaba de partir en 15" (SHIPPING Thu 2026-05-21)

**Hook (slide 1 title):** "Tu API de IA se acaba de partir en 15."
**Anchor / emotion:** Sundar Pichai photoreal con **surprise + leaning-in**, half-smile, hand near chin (§16: founder-impact emotion; algo grande está pasando). Brand-avatar Armando (satisfied, pointing-at-tablet) on CTA.
**Format:** 7 slides, 4:5, style `dark-minimal` with brand-accent gold on every number
**Voice spine (§5):** what (Flash a ~1/15 del precio) · why (volume play vs prestige play) · what it means (la matemática de tu producto cambió hoy) · what to do (lista de features que apagaste por costo: vuelven a encenderse)
**§15 hook compliance:** body delivers the actual per-million-token math by slide 3 (Stats slide).
**Tag:** none (confirmed product, mechanism-honest).

### Slide 1 — Cover
- **Type:** cover
- **Title (ES):** "Tu API de IA se acaba de partir en 15."
- **Subtitle (ES):** "Y la matemática de tu producto cambió hoy."
- **Tag:** null
- **Visual direction:** Pichai photoreal, surprise/leaning-in pose, dark navy background, **gold accent en el número "15"** (huge, dominante en el frame), thin gradient line debajo del subtitle
- **Background image:** `01-cover.png`
- **Caption-to-self:** el "15" es el héroe visual. Todo lo demás se subordina.

### Slide 2 — Qué lanzó hoy
- **Type:** content
- **Heading (ES):** "Qué lanzó Google hoy"
- **Body (ES):** "Gemini 3.5 Flash. Modelo pequeño, agresivamente barato. Disponible desde hoy en la API, en la app, en Search y en Antigravity 2.0. 4× más rápido que 3.0 Flash. Más del 90% del rendimiento de coding de GPT-5.5."
- **Icon / number:** "1"
- **Visual direction:** stats grandes navy + gold, Pichai pequeño en esquina inferior
- **Background image:** `02-que-lanzo.png`
- **Caption-to-self:** §15. Mecanismo arranca acá.

### Slide 3 — La matemática nueva (input)
- **Type:** stats
- **Value:** "$0.25"
- **Label (ES):** "Por millón de tokens de input"
- **Context (ES):** "Gemini 3.5 Flash. Compara contra ~$3.75 de GPT-5.5 y ~$3 de Claude Sonnet-4. Verificar en `[ai.google.dev/pricing — verify]` antes de publicar."
- **Visual direction:** número gigante en gold, label en blanco abajo, fondo navy plano, sin distracción
- **Background image:** `03-stats-input.png`
- **Caption-to-self:** esta slide es la prueba del hook. Verificar el número en la página oficial antes de publicar.

### Slide 4 — La matemática nueva (output)
- **Type:** stats
- **Value:** "$2.00"
- **Label (ES):** "Por millón de tokens de output"
- **Context (ES):** "Gemini 3.5 Flash. Compara contra ~$15 de GPT-5.5 y ~$15 de Claude Sonnet-4. Resultado: ~1/7 del costo de output, ~1/15 del costo de input. Verificar en `[ai.google.dev/pricing — verify]`."
- **Visual direction:** mismo layout que slide 3, número en gold dominante
- **Background image:** `04-stats-output.png`
- **Caption-to-self:** dos slides de stats para no apretar todo en una. El lector procesa input y output por separado.

### Slide 5 — Comparación lado-a-lado
- **Type:** comparison
- **Heading (ES):** "Por un millón de tokens de input + output mezclado (50/50)"
- **Left label:** "GPT-5.5"
- **Left content (ES):** "~$9.40 por millón de tokens. Referencia, no recomendación."
- **Right label:** "Gemini 3.5 Flash"
- **Right content (ES):** "~$1.13 por millón de tokens. ~8× más barato en mezcla, ~15× en input puro. Verificar en `[ai.google.dev/pricing — verify]`."
- **Visual direction:** dos columnas, izquierda gris apagado, derecha gold dominante, números enormes
- **Background image:** `05-comparison-50-50.png`
- **Caption-to-self:** mezcla 50/50 es lo más cercano a uso real para producto SaaS. Si la mezcla cambia mucho por uso, decirlo en la caption.

### Slide 6 — Qué features se vuelven baratas otra vez
- **Type:** list
- **Heading (ES):** "Lo que vuelve a ser viable"
- **Items (ES):**
  1. "Summarización automática en cada vista (la apagaste cuando GPT-5.5 te cobró $400 en abril)."
  2. "Agentes async que corren en background (rate limit eran $$$; Flash los hace tolerables)."
  3. "Typeahead AI en formularios (latencia + costo eran prohibitivos; ahora 4× más rápido + 8× más barato)."
  4. "Embeddings + re-ranking en cada query (vuelve a ser default, no premium)."
- **Visual direction:** lista con checkmarks en gold, fondo navy, número grande "4" arriba
- **Background image:** `06-features-vuelven.png`
- **Caption-to-self:** esta es la slide que la gente guarda y comparte. Específico, accionable.

### Slide 7 — CTA
- **Type:** cta
- **Heading (ES):** "Haz la lista. Vuelve a prender lo que apagaste."
- **Body (ES):** "Antes de cambiar producción, haz la migración por feature. Empieza con summarización y embeddings. Mide 14 días. Luego mueve lo crítico."
- **Button text:** "Sígueme para más matemática real"
- **Show handle:** true
- **Visual direction:** brand-avatar Armando satisfied, señalando una tablet con "FEATURE WISHLIST" + checkmarks en cuatro líneas
- **Background image:** `07-cta.png`

### Caption (Instagram, Spanish, ~150-220 words)

Hoy en el I/O 2026, Google lanzó Gemini 3.5 Flash. Si tienes un producto sobre AI APIs, tu unit economics cambiaron en una hora.

La matemática (verificar contra `[ai.google.dev/pricing — verify]` antes de mover producción):
- Input: ~$0.25 por millón de tokens (GPT-5.5: ~$3.75; ~15× más caro)
- Output: ~$2.00 por millón de tokens (GPT-5.5: ~$15; ~7× más caro)
- Mezcla 50/50: Flash ~$1.13 vs GPT-5.5 ~$9.40 (~8× más barato)

Más del 90% del rendimiento de coding de GPT-5.5 según el chart del keynote (~min 35).

Lo que esto significa en práctica: las features que apagaste por costo en abril vuelven a ser viables. Summarización automática. Agentes async. Typeahead. Embeddings + re-ranking en cada query.

Mi recomendación: **no cambies producción esta semana**. Haz la migración feature por feature. Empieza con summarización y embeddings (bajo riesgo, alto volumen). Mide 14 días. Luego mueve lo crítico.

Fuentes confirmadas: keynote I/O 2026 `[youtube.com/I/O-2026-keynote — verify timestamp ~00:35]`, blog oficial `[blog.google/technology/ai/gemini-3-5-flash — verify]`, página de pricing `[ai.google.dev/pricing — verify]`.

¿Cuál vas a re-encender primero? Cuéntame abajo.

### Hashtags (8-12)

#GeminiFlash #IO2026 #AIAPIs #ProductPricing #LatamFounders #AIDevelopers #UnitEconomics #StartupsLatam #GoogleAI #BuildingInPublic #SaaSPricing

---

## Angle D — "4× más rápido, y eso cambia el UX" (BACKLOG)

**Hook (slide 1 title):** "3.5 Flash es 4× más rápido. Y la velocidad cambia qué puedes construir."
**Anchor / emotion:** brand-avatar Armando con **curious**, head tilted, finger near temple, looking at a latency chart that's floating in space next to him (§16: product-design lens, curiosidad técnica)
**Format:** 7 slides, 4:5, style `dark-minimal` with a horizontal latency-comparison chart as the visual hero
**Voice spine (§5):** what (4× velocidad) · why (latencia es restricción de UX, no solo de costo) · what it means (UX patterns que eran imposibles a 800ms ahora son default) · what to do (auditar dónde la latencia es la barrera, no el modelo)
**§15 hook compliance:** body delivers the UX-mechanism (qué patterns se abren) by slide 3.
**Tag:** none (confirmed product, mechanism-honest).

### Slide 1 — Cover
- **Type:** cover
- **Title (ES):** "3.5 Flash es 4× más rápido."
- **Subtitle (ES):** "Y la velocidad cambia qué puedes construir, no solo qué cuesta."
- **Tag:** null
- **Visual direction:** brand-avatar Armando con curious, tablet en mano, una línea horizontal con dos puntos (800ms → 200ms) flotando al lado de su brazo
- **Background image:** `01-cover.png`
- **Caption-to-self:** distinción clave: costo vs latencia son dos historias separadas.

### Slide 2 — Qué cambió en velocidad
- **Type:** stats
- **Value:** "4×"
- **Label (ES):** "Velocidad de output vs Gemini 3.0 Flash"
- **Context (ES):** "Si 3.0 Flash escupía ~50 tokens por segundo, 3.5 Flash escupe ~200. Para una respuesta de 500 tokens: de ~10s a ~2.5s percibidos."
- **Visual direction:** "4×" gigante en gold, label debajo, fondo navy plano
- **Background image:** `02-4x-velocidad.png`
- **Caption-to-self:** §15. Número grande primero, contexto inmediato.

### Slide 3 — Por qué la velocidad importa más que el costo
- **Type:** content
- **Heading (ES):** "Latencia es restricción de UX, no de bolsillo"
- **Body (ES):** "El costo decide si lo construyes. La latencia decide si la gente lo usa. A 800ms+ por respuesta, los usuarios abandonan. A <300ms, el feature se siente nativo. 3.5 Flash baja la latencia debajo del umbral de abandono para clases enteras de UX."
- **Icon / number:** "1"
- **Visual direction:** dos columnas con íconos, "Costo: construir" + "Latencia: que lo usen"
- **Background image:** `03-latencia-vs-costo.png`
- **Caption-to-self:** ésta es la tesis. Mecanismo entregado por §15.

### Slide 4 — Patterns que se abren
- **Type:** list
- **Heading (ES):** "UX que ahora es viable"
- **Items (ES):**
  1. "Typeahead AI: autocompletar mientras escribes (necesita <200ms para no sentirse trabado)."
  2. "Voice agents que responden en conversación: pausas naturales en vez de 'estoy procesando.'"
  3. "Live translation: subtítulos en tiempo real sin delay perceptible."
  4. "Inline summarization mientras scrolleas: el resumen aparece antes de que termines de leer la primera oración."
- **Visual direction:** lista de 4 items con íconos pequeños (cursor, micrófono, mundo, scroll)
- **Background image:** `04-patterns-nuevos.png`
- **Caption-to-self:** esta es la slide save-magnet. Específico, técnico, accionable.

### Slide 5 — Patterns que NO se desbloquean todavía
- **Type:** content
- **Heading (ES):** "Lo que sigue requiriendo modelos más pequeños"
- **Body (ES):** "Conversación en tiempo real sub-100ms sigue siendo dominio de modelos especializados (Whisper para STT, Cartesia para TTS). Flash es para razonamiento + generación rápida, no para audio puro. Combinarlos sigue siendo la arquitectura correcta."
- **Icon / number:** "2"
- **Visual direction:** brand-avatar Armando calm-certainty, mostrando un diagrama de stack (STT → Flash → TTS)
- **Background image:** `05-lo-que-no-todavia.png`
- **Caption-to-self:** honestidad técnica. No todo se resuelve con Flash.

### Slide 6 — Cómo medir si tu feature se beneficia
- **Type:** content
- **Heading (ES):** "El test de los 14 días"
- **Body (ES):** "Toma una feature donde sospechas que la latencia es la barrera. Mide hoy: tiempo a primer token, tiempo a token completo, abandono. Cambia a 3.5 Flash. Mide los mismos números 14 días. Si abandono cae más de 15%, tienes una feature que la velocidad estaba matando."
- **Icon / number:** "3"
- **Visual direction:** timeline de 14 días, tres métricas en columnas
- **Background image:** `06-test-14-dias.png`
- **Caption-to-self:** método práctico, no opiniones.

### Slide 7 — CTA
- **Type:** cta
- **Heading (ES):** "La velocidad es una feature. Constrúyela."
- **Body (ES):** "Esta semana: audita una feature donde sospechas que la latencia te está matando. Mide. Cambia. Mide otra vez."
- **Button text:** "Sígueme para más diseño de producto AI"
- **Show handle:** true
- **Visual direction:** brand-avatar Armando satisfied, señalando una libreta con "FEATURE A AUDITAR"
- **Background image:** `07-cta.png`

### Caption (Instagram, Spanish, ~150-220 words)

Todo el mundo va a hablar del precio de Gemini 3.5 Flash. Yo quiero hablar de la velocidad, porque cambia algo distinto.

El precio decide si **construyes** la feature. La velocidad decide si **la gente la usa**.

Gemini 3.5 Flash es 4× más rápido que 3.0 Flash (chart del keynote ~min 35). Para una respuesta de 500 tokens, eso es ir de ~10 segundos a ~2.5 segundos percibidos. Y eso cruza umbrales reales de UX:

- **Typeahead AI** se siente nativo cuando responde en <200ms. Antes era un toque trabado. Ahora no.
- **Voice agents** pueden tener pausas naturales en vez del "estoy procesando, espera."
- **Live translation** sin delay perceptible. Subtítulos al ritmo del habla.
- **Inline summarization mientras scrolleas**: el resumen aparece antes de que termines de leer.

Honestidad técnica: Flash NO reemplaza modelos especializados de audio (Whisper, Cartesia). Para conversación sub-100ms sigues necesitando la arquitectura STT → LLM → TTS. Flash baja el LLM, no el stack completo.

Esta semana: audita una feature donde sospechas que la latencia te está matando. Cambia a Flash. Mide 14 días.

Fuentes: I/O 2026 keynote `[youtube.com/I/O-2026-keynote — verify timestamp ~00:35]`.

¿Cuál vas a auditar primero?

### Hashtags (8-12)

#GeminiFlash #ProductDesign #AIUX #LatencyMatters #LatamFounders #AIDevelopers #VoiceAI #BuildingInPublic #StartupsLatam #GoogleAI #UXDesign

---

## Angle E — "Lo que NO viene todavía: 3.5 Pro" (BACKLOG)

**Hook (slide 1 title):** "Lanzaron Flash. Retuvieron Pro. Y esa pausa es interesante."
**Anchor / emotion:** Demis Hassabis photoreal con **curious / thoughtful**, slight head tilt, eyes looking up-left as if reading something invisible (§16: speculative; la pregunta que nadie está haciendo). **Refs need v6 refresh, blocker.**
**Format:** 7 slides, 4:5, style `dark-minimal`. **Tag: OPINIÓN** on slide 1 (recommended; speculative angle).
**Voice spine (§5):** what (3.5 Pro retenido, "disponible próximo mes") · why (compute reallocation + Spark integration testing como hipótesis) · what it means (cuando llegue Pro, será con más capacidades que un release "normal") · what to do (no construir asumiendo que Pro llega esta semana)
**§15 hook compliance:** body delivers the speculative mechanism (por qué retener Pro tiene sentido) by slide 3.
**Tag:** **OPINIÓN** on slide 1; speculation tag required per §9.

### Slide 1 — Cover
- **Type:** cover
- **Title (ES):** "Lanzaron Flash. Retuvieron Pro."
- **Subtitle (ES):** "Y esa pausa es interesante."
- **Tag:** OPINIÓN
- **Visual direction:** Hassabis photoreal, curious/thoughtful expression, dark navy, gold accent line, "OPINIÓN" tag visible top-right
- **Background image:** `01-cover.png`
- **Caption-to-self:** tag obligatorio. Esto es especulación informada.

### Slide 2 — Qué dijeron exactamente
- **Type:** quote
- **Quote (ES):** "Gemini 3.5 Pro estará disponible el próximo mes."
- **Author:** "Google I/O 2026 keynote, ~min 35"
- **Visual direction:** quote estilizada en gold sobre navy, comillas grandes, attribution pequeña abajo
- **Background image:** `02-quote-keynote.png`
- **Caption-to-self:** citar exactamente. No inventar nada.

### Slide 3 — Por qué retener Pro es una decisión deliberada
- **Type:** content
- **Heading (ES):** "Tres hipótesis de por qué"
- **Body (ES):** "Hipótesis 1: reasignación de cómputo hacia Spark + Antigravity 2.0 antes del rollout de Pro. Hipótesis 2: Pro está siendo probado contra Spark como agent backbone. Hipótesis 3: querían que Flash dominara el ciclo de noticias del I/O sin que Pro lo opacara. Las tres son compatibles."
- **Icon / number:** "1"
- **Visual direction:** tres íconos pequeños en columna, gold + navy
- **Background image:** `03-tres-hipotesis.png`
- **Caption-to-self:** §15. Mecanismo entregado (aunque especulativo, explícito).

### Slide 4 — Lo que sabemos de Pro vs Flash
- **Type:** comparison
- **Heading (ES):** "Lo que sí sabemos"
- **Left label:** "Flash (hoy)"
- **Left content (ES):** "Modelo pequeño, rápido, barato. 4× más rápido que 3.0. ~1/15 del costo de GPT-5.5. 90%+ coding parity."
- **Right label:** "Pro (próximo mes)"
- **Right content (ES):** "Modelo grande, prestige tier. Sin números públicos todavía. Históricamente, Pro maneja contexto más largo + razonamiento más profundo. Esperar el blog oficial."
- **Visual direction:** dos columnas equilibradas, derecha con "?" gigante en gold como elemento dominante
- **Background image:** `04-flash-vs-pro.png`
- **Caption-to-self:** honestidad. Lo que sabemos es poco. Eso es parte del punto.

### Slide 5 — Por qué te debe importar (incluso si no eres dev)
- **Type:** content
- **Heading (ES):** "Por qué la pausa cambia tu planning"
- **Body (ES):** "Si estabas esperando Pro para una decisión arquitectónica (long-context, agentes complejos, razonamiento), tienes ~30 días más de Flash + GPT-5.5 + Sonnet-4 como tu universo. No bloquees decisiones por un release que aún no tiene fecha exacta."
- **Icon / number:** "2"
- **Visual direction:** brand-avatar Armando calm-certainty, mostrando un calendario con "próximo mes" sin fecha exacta marcada
- **Background image:** `05-tu-planning.png`
- **Caption-to-self:** valor accionable a pesar de la especulación.

### Slide 6 — Lo que vamos a vigilar
- **Type:** list
- **Heading (ES):** "Las tres señales del Pro release"
- **Items (ES):**
  1. "El blog post va a mencionar context window: el número decide si compite con Sonnet-4 (200k) o lo supera."
  2. "Pricing del Pro: si es <50× el costo de Flash, es ofensiva agresiva. Si es 80×+, es prestige play tradicional."
  3. "Mención explícita de Spark o Antigravity: si Pro está integrado nativo en el agent stack, confirma la hipótesis 2."
- **Visual direction:** tres líneas numeradas con íconos (libro, etiqueta de precio, conexión)
- **Background image:** `06-tres-senales.png`
- **Caption-to-self:** esto da estructura a la espera. No es solo "esperemos."

### Slide 7 — CTA
- **Type:** cta
- **Heading (ES):** "Pro llega próximo mes. Yo estoy mirando estas tres señales."
- **Body (ES):** "Cuando salga, vas a tener el análisis acá antes que en TechCrunch. Sígueme para no perderlo."
- **Button text:** "Sígueme para el análisis de Pro"
- **Show handle:** true
- **Visual direction:** brand-avatar Armando curious, señalando un calendario con "PRÓXIMO MES" como marca grande sin día específico
- **Background image:** `07-cta.png`

### Caption (Instagram, Spanish, ~150-220 words)

[OPINIÓN: especulación informada, no leak]

Google lanzó hoy Gemini 3.5 Flash. Pero deliberadamente NO lanzó 3.5 Pro. Lo dejaron para "el próximo mes." Y esa pausa dice algo.

Mi lectura, tres hipótesis compatibles entre sí:

1. **Reasignación de cómputo.** Antes de servir Pro a producción, Google necesita capacidad para Antigravity 2.0 + Spark rollouts.
2. **Testing con Spark.** Pro probablemente está siendo evaluado como el backbone de Spark (el agente personal anunciado hoy). No vas a soltar el motor antes de que el carro esté pintado.
3. **Control del ciclo de noticias.** Si Pro hubiera salido hoy, opacaba a Flash. Y Flash es la jugada de mass adoption: Google necesitaba que dominara el ciclo.

Lo que voy a vigilar cuando salga Pro:
- **Context window** (¿supera los 200k de Sonnet-4?)
- **Pricing** (¿<50× Flash = ofensiva; >80× = prestige play tradicional?)
- **Integración con Spark / Antigravity** (¿es el backbone de los agentes?)

Mientras tanto: no bloquees decisiones arquitectónicas esperando Pro. Trabaja con Flash + GPT-5.5 + Sonnet-4. Tienes ~30 días con ese universo.

Fuente: I/O 2026 keynote `[youtube.com/I/O-2026-keynote — verify timestamp ~00:35]`.

¿Cuál de las tres hipótesis te suena más probable?

### Hashtags (8-12)

#GeminiPro #IO2026 #AIIndustry #SpeculativeAnalysis #LatamFounders #AIDevelopers #StartupStrategy #GoogleAI #BuildingInPublic #AIRoadmap #OPINION

---

## Production notes

### Sequencing recommendation

Angle C (SHIPPING Thu 21) is the only confirmed slot. The other four are in BACKLOG with different ideal timings:

- **Angle A (postmortem):** ship as a postscript piece in **W22** (week of May 25). The accountability frame lands better with 1+ week of distance from v2.1's pull. Don't ship same week as Angle C; they cannibalize each other.
- **Angle B (industry lens):** ship after the **Karpathy → Anthropic carousel (Tue W22)** so it has prior context for the "OpenAI dev exodus" point. Pair them within 7 days.
- **Angle D (UX/latency lens):** evergreen. Ship 2-4 weeks out as part of a "what becomes possible with faster models" recap. No news-cycle decay.
- **Angle E (Pro speculation):** ship **before** the 3.5 Pro release ("we called the three signals") OR **after** ("here's how the three signals played out"). Either is strong; before is harder but more rewarding for trust.

### Open questions before shipping (especially Angle C)

1. **Pricing verification (BLOCKER for Angle C):** confirm exact per-million-token numbers on `[ai.google.dev/pricing — verify]` for input + output of Gemini 3.5 Flash. Compare against `[platform.openai.com/pricing]` for GPT-5.5 and `[anthropic.com/pricing]` for Sonnet-4. If any number is off by more than ~10%, redo slides 3-5 of Angle C and update the caption math. **Do not ship Angle C with placeholder numbers.**
2. **Benchmark chart citation:** the I/O 2026 keynote chart (~min 35) is the source for "90%+ coding parity vs GPT-5.5." Confirm the exact metric (HumanEval? SWE-bench? Aider?) and use the specific metric name in slide 2 of Angle C. Don't generalize to "coding."
3. **Output token speed claim:** "4× faster than 3.0 Flash" needs to be sourced from a specific Google blog post or benchmark, not from press coverage. Verify before Angle D ships.
4. **Pro release date:** the keynote said "next month." If Google publishes a more specific date before Angle E ships, update slide 7's CTA copy.
5. **Hassabis refs (BLOCKER for Angle E):** Hassabis photoreal references need v6 refresh per the user's update list (same blocker as #B07 Omni Flash and #B08 Spark). Cannot ship Angle E with photoreal Hassabis until v6 lands. Fallback: editorial-illustration style per §12.
6. **Pichai refs:** confirmed available in `pichai-sundar/refs/` for surprise + intense focus poses (Angles B + C). No blocker.
7. **Brand-avatar Armando new poses:** calm smirk (Angle A), curious-pointing (Angle D). Not yet rendered. Needs sibling-agent generation before either angle ships.

### §14 translation check — flagged terms used in this file

All confirmed Spanish Latam developer register. Notable:
- "lanzó / lanzar" used for "launched / to launch", NOT "envió/enviar" (false friend per §14).
- "biblioteca" not used in this file (no library references), but if added: use "biblioteca," never "librería."
- "actualmente" not used (would mean "currently"); when ambiguous, prefer "hoy / esta semana" for explicit timing.
- "matemática" used in Spanish singular ("la matemática de tu producto"). Correct Latam register.
- "rendimiento" used for "performance". Preferred over "performance" loanword in this register.
- "rate limit" left in English (technical loanword acceptable in dev register per §14).
- "vendor" left in English (technical loanword acceptable; alternative "proveedor" works in non-technical contexts).

### Caption tags applied per §9

- Angle A: OPINIÓN required (meta-commentary).
- Angle B: none required; flagged for editorial review (some operators may prefer OPINIÓN given industry-lens speculation).
- Angle C: none (confirmed product, mechanism-honest math).
- Angle D: none (confirmed product, mechanism-honest UX framing).
- Angle E: OPINIÓN required (speculative hypotheses).

### File version

**B06-gemini-3-5-flash.md** v1, generated 2026-05-19 evening (post-I/O keynote, alongside CONTENT_CALENDAR_2026-W21-v2.2.md).
