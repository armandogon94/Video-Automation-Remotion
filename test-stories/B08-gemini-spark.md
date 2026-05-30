# Story #B08 — Gemini Spark — Per-Angle Slide Detail

> **Story:** Gemini Spark, Google's cloud-resident personal AI agent, confirmed at I/O 2026.
> **Voice contract:** [VOICE.md](../../VOICE.md) v1.5. Apply §3, §5, §9, §14, §15, §16, §17 (no em-dashes) all binding.
> **Calendar slot:** Sat 23 May 2026 (Angle B). Angles A, C, D, E are BACKLOG.
> **Last updated:** 2026-05-19 evening, post-I/O keynote.

---

## Story spec

| Field | Value |
|---|---|
| **Story #** | B08 |
| **Confirmed at** | Google I/O 2026 keynote, ~01:14–01:22 (May 19, 2026) |
| **Product** | Gemini Spark, 24/7 personal AI agent |
| **Category** | Browser / personal-assistant agent (OpenClaw competitor, Anthropic Cowork competitor) |
| **Key mechanism** | **Cloud-resident execution.** Runs on Google's servers asynchronously, NOT on the user's phone or laptop |
| **Stack** | Antigravity harness + Gemini 3.5 + Workspace integrations |
| **Day-one integrations** | Workspace, Canva, OpenTable, Instacart |
| **Demos shown** | "Put Gemini Spark to work for you" task list; "Daily Brief"; live phone-control demo (Nishtha's phone) |
| **Rollout** | "Available next week to Google AI Ultra subscribers in the US" |
| **Pre-keynote codename** | Remy (was the rumor we pulled from v2.1) |

### Source URLs (placeholders, fill before posting)

- Primary: Google I/O 2026 keynote replay: `https://youtube.com/watch?v=wYSncx9zLIU` (Spark segment 01:14–01:22)
- Primary: Google Blog (Gemini Spark launch post): `https://blog.google/products/gemini/spark/` *(verify URL)*
- Primary: Google AI Ultra subscription page: `https://gemini.google/ai-ultra/` *(verify URL)*
- Supporting: TechCrunch / The Verge / 9to5Google coverage of Spark *(fill specific URLs day-of)*
- Supporting: OpenClaw product page, for comparison slides *(fill URL)*

---

## Angle A — "Era Remy. Es Spark. Y es real." (BACKLOG)

**Hook (ES):** "Era Remy. Es Spark. Y es real."
**Anchor / emotion:** brand-avatar Armando, **satisfied / delighted** per §16 (small genuine smile, eye contact with camera, holding phone with Spark UI).
**Format:** 7 slides, 4:5, style preset `dark-minimal`.
**Voice spine (§5):** what (Remy era rumor, Google lo confirmó como Spark) · why (timing post-Antigravity; Google necesitaba un agente al lado del usuario) · what it means (la categoría "personal agent" ya no es solo de OpenAI/Anthropic) · what to do (únete a la lista de espera si tienes AI Ultra; si no, espera el rollout).
**§15 hook compliance:** "Era Remy. Es Spark. Y es real." es captivating + cero exageración. Slide 2 confirma qué es Spark, slide 3 entrega el mecanismo (cloud-resident + Workspace-native). Body delivers mechanism by slide 3. Pasa.

### Slide 1 — Cover
- **Type:** cover
- **Title (ES):** "Era Remy. Es Spark. Y es real."
- **Subtitle (ES):** "Google confirmó hoy en I/O lo que era rumor desde febrero."
- **Tag:** none (no es opinión, no es rumor; es confirmación. Per §9 no tag is needed.)
- **Visual direction:** Armando avatar centrado, leve sonrisa de satisfacción, mirando a cámara, sosteniendo un teléfono con la UI de Spark visible. Fondo oscuro `dark-minimal` con un acento gold sutil. Top third = quiet zone para el headline.
- **Background image:** `01-cover.png`
- **Caption-to-self:** Abre con el arco "rumor → confirmado". Es el ángulo más limpio para audiencia que vio nuestro pull de v2.1.

### Slide 2 — Qué se confirmó hoy
- **Type:** content
- **Heading (ES):** "Gemini Spark: el asistente personal 24/7 de Google"
- **Body (ES):** "Se anunció hoy en el escenario de I/O 2026. Es el competidor directo de OpenClaw y Anthropic Cowork. Vive en la nube, no en tu teléfono."
- **Icon / number:** number `1`
- **Visual direction:** Fondo oscuro con la palabra "SPARK" en grande detrás, leve glow. No people on this slide; pura tipografía.
- **Background image:** `02-confirmed.png`
- **Caption-to-self:** Cierra la pregunta del hook en 5 segundos: quién es y qué hace.

### Slide 3 — Cómo funciona (mecanismo)
- **Type:** content
- **Heading (ES):** "Corre en la nube de Google. No en tu MacBook."
- **Body (ES):** "Spark se ejecuta en los servidores de Google de forma asíncrona. Le das una tarea, cierras la laptop, y sigue trabajando. Esa es la diferencia técnica con OpenClaw."
- **Icon / number:** number `2`
- **Visual direction:** Diagrama simple: izquierda un teléfono apagado/sleeping, derecha unos servidores con el logo de Google trabajando. Flecha entre ambos. Brand-avatar Armando esquina inferior con leve sonrisa.
- **Background image:** `03-cloud-resident.png`
- **Caption-to-self:** Entrega el mecanismo real por §15. Ya no es solo "es un agente," es "es un agente que corre sin ti."

### Slide 4 — Lo que se demostró en I/O
- **Type:** list
- **Heading (ES):** "Lo que Google mostró hoy en vivo"
- **Body / items (ES):**
  - "Daily Brief: Spark te entrega un resumen del día cada mañana"
  - "Phone-control: control en vivo del teléfono de Nishtha desde el escenario"
  - "Task list: 'Put Gemini Spark to work for you' con tareas multi-paso"
  - "Integraciones: Workspace, Canva, OpenTable, Instacart desde día uno"
- **Visual direction:** Lista limpia con leves íconos a la izquierda de cada item. Fondo oscuro, accent gold en los íconos.
- **Background image:** `04-demos.png`
- **Caption-to-self:** Documenta los demos reales del keynote, sin fabricar. Solo lo que se vio.

### Slide 5 — Quién lo puede usar
- **Type:** content
- **Heading (ES):** "Disponible la próxima semana, pero con condiciones"
- **Body (ES):** "Rollout para suscriptores de Google AI Ultra ($100/mes) en Estados Unidos. Latam y resto del mundo: sin fecha confirmada. Google AI Ultra: $100 USD/mes según el slide del keynote."
- **Icon / number:** number `3`
- **Visual direction:** Pantalla mostrando un paywall con badge "AI Ultra · US only." Brand-avatar Armando viendo el badge con expresión calm certainty (ceja levantada).
- **Background image:** `05-availability.png`
- **Caption-to-self:** Mecha-honesta sobre el gating geográfico + pricing. La audiencia es Latam, esto importa.

### Slide 6 — Por qué importa para ti
- **Type:** content
- **Heading (ES):** "Por qué importa: la categoría 'agente personal' acaba de duplicarse"
- **Body (ES):** "Hasta hoy, si querías un agente personal serio, tenías OpenClaw o Anthropic Cowork. Ahora son tres jugadores grandes, y Google llega con la integración más profunda con Workspace que nadie tiene."
- **Icon / number:** number `4`
- **Visual direction:** Tres logos lado a lado (OpenClaw, Cowork, Spark); Spark con un leve glow indicando el nuevo. Brand-avatar Armando esquina con sonrisa pequeña.
- **Background image:** `06-category.png`
- **Caption-to-self:** Founder-implication line per §5: "what it means for you."

### Slide 7 — CTA
- **Type:** cta
- **Heading (ES):** "Tu acción esta semana"
- **Body (ES):** "Si ya vives en Workspace y te alcanza Google AI Ultra, únete a la lista de espera el lunes. Si tu trabajo es privado o regulado, espera mi carrusel del miércoles sobre cuándo elegir cuál."
- **Button text:** "Ver la lista de espera"
- **Show handle:** true
- **Visual direction:** Brand-avatar Armando satisfied, con teléfono en mano. Fondo oscuro, accent gold en el botón.
- **Background image:** `07-cta.png`

### Caption (Instagram, ES, ~150–220 palabras)

Google confirmó hoy en I/O 2026 lo que era rumor desde febrero. El nombre interno era Remy. Lo lanzaron como **Gemini Spark**: un asistente personal 24/7 que vive en la nube de Google y se conecta de día uno con Workspace, Canva, OpenTable e Instacart.

Lo que me sorprendió no fue que existiera. Era que **corre en los servidores de Google, no en tu teléfono**. Le das una tarea, cierras la laptop, y sigue trabajando. Esa es la diferencia técnica concreta con OpenClaw o Cowork, que necesitan tu dispositivo prendido y desbloqueado.

En el escenario mostraron tres cosas: el Daily Brief (resumen diario cada mañana), una task list multi-paso, y un demo en vivo controlando el teléfono de Nishtha desde el escenario.

Rollout la próxima semana, **solo para suscriptores de Google AI Ultra en Estados Unidos**. Latam todavía espera, pero la categoría de agente personal acaba de duplicarse.

Esta semana: si ya estás en Workspace y te alcanza AI Ultra, únete a la lista de espera. Si tu trabajo es privado o sensible, espérate al carrusel del miércoles donde comparo Spark vs OpenClaw, y cuándo cada uno gana.

Fuente: keynote de Google I/O 2026 (link en perfil).

### Hashtags
#GeminiSpark #GoogleIO #GoogleIO2026 #AIAgents #Gemini #Workspace #OpenClaw #IAparaFounders #Latam #ProductividadIA #AsistenteIA #AIUltra

---

## Angle B — "El agente que no necesita tu teléfono encendido" (SHIPPING Sat 23)

**Hook (ES):** "Google confirmó Gemini Spark. Y tiene una ventaja sobre OpenClaw que nadie está mencionando."
**Anchor / emotion:** **Demis Hassabis** photoreal portrait, **calm certainty** per §16 (direct gaze, slight smirk, body relaxed) en cover. Brand-avatar Armando demoing on slides 4–6 (calm certainty + satisfied).
**Format:** 7 slides, 4:5, style preset `dark-minimal` with neon accents.
**Voice spine (§5):** what (Spark confirmado, corre en la nube) · why (arquitectura cloud-resident vs phone-resident) · what it means (trabaja mientras duermes, sin tu MacBook prendida) · what to do (inscribirse en la lista de espera si Workspace-heavy; mantener OpenClaw si privacidad importa).
**§15 hook compliance:** "ventaja que nadie está mencionando" está en el borde. Se rescata porque slide 2 nombra la ventaja específica (cloud-resident) y slide 3 muestra el mecanismo side-by-side. Pasa, pero no escalamos más en el hook register esta semana.

### Slide 1 — Cover
- **Type:** cover
- **Title (ES):** "El agente que no necesita tu teléfono encendido"
- **Subtitle (ES):** "Google confirmó Gemini Spark hoy. La ventaja sobre OpenClaw es de arquitectura."
- **Tag:** none (es confirmación, no opinión ni rumor)
- **Visual direction:** Demis Hassabis photoreal portrait, calm certainty (leve smirk, mirada directa). Top third quiet, headline overlay. Neon-gold accent al ~8% del frame en una franja vertical derecha con la palabra "SPARK." Fondo oscuro editorial.
- **Background image:** `01-cover.png`
- **Caption-to-self:** Hassabis carga la autoridad técnica + el smirk transmite "sabemos lo que hicimos." El hook va al diferenciador estructural directo.

### Slide 2 — Qué se confirmó (mecanismo en 1 línea)
- **Type:** content
- **Heading (ES):** "Spark corre en la nube. No en tu teléfono."
- **Body (ES):** "Gemini Spark es un agente personal 24/7. Se ejecuta en los servidores de Google de forma asíncrona: le das una tarea y sigue trabajando incluso si tu laptop está cerrada o tu teléfono en el bolsillo."
- **Icon / number:** number `1`
- **Visual direction:** Pantalla dividida vertical: izquierda un teléfono apagado/en bolsillo, derecha una serie de servidores con un leve glow trabajando. Fondo oscuro `dark-minimal`. Sin personas.
- **Background image:** `02-mechanism.png`
- **Caption-to-self:** Entrega el mecanismo en slide 2 (supera el §15 smell test ya aquí).

### Slide 3 — Spark vs OpenClaw (la diferencia clave)
- **Type:** comparison
- **Heading (ES):** "Dónde corre cada agente"
- **Left label (ES):** "OpenClaw (phone-resident)"
- **Left content (ES):** "Necesita tu teléfono prendido, desbloqueado y con sesión activa de Chrome. Si tu teléfono se duerme, el agente se duerme."
- **Right label (ES):** "Spark (cloud-resident)"
- **Right content (ES):** "Corre en los servidores de Google. Tu teléfono apagado, tu MacBook cerrada, y el agente sigue ejecutando tareas."
- **Visual direction:** Comparación 50/50. Izquierda: ícono de teléfono con un candado. Derecha: ícono de servidor con un leve glow gold. Sin avatares en esta slide; la comparación carga sola.
- **Background image:** `03-comparison.png`
- **Caption-to-self:** Esta es la slide ancla del carrusel. La que más se va a screenshot. Diseño tiene que ser ultra-limpio.

### Slide 4 — Lo que esto te permite hacer
- **Type:** content
- **Heading (ES):** "Tareas que antes requerían tu computadora prendida"
- **Body (ES):** "Investigar 30 restaurantes en OpenTable mientras duermes. Generar 20 variantes en Canva mientras estás en el gym. Reservar Instacart mientras manejas. Spark las ejecuta en paralelo sin tu dispositivo."
- **Icon / number:** number `2`
- **Visual direction:** Brand-avatar Armando en una hamaca o durmiendo, expresión calm/satisfied. En pantalla flotante al lado: tres tarjetas con los logos de OpenTable, Canva, Instacart "Completed."
- **Background image:** `04-use-cases.png`
- **Caption-to-self:** Aterriza el mecanismo en uso real: "qué hago el lunes con esto."

### Slide 5 — El trade-off honesto
- **Type:** content
- **Heading (ES):** "El precio de la nube: Google ve más de tu trabajo"
- **Body (ES):** "Cloud-resident = menos privado. Google procesa el contexto de tus tareas en sus servidores. Para trabajo público o de marketing, no importa. Para trabajo legal, médico o sensible, sí importa."
- **Icon / number:** number `3`
- **Visual direction:** Brand-avatar Armando calm certainty, ceja levantada (la expresión de "esto es importante decirlo"). Fondo más oscuro, sin neon en esta slide para señalar el tono más sobrio.
- **Background image:** `05-tradeoff.png`
- **Caption-to-self:** Slide obligatoria por §3. Mechanism-honest. No esconder el costo.

### Slide 6 — Cuándo elegir Spark vs OpenClaw
- **Type:** list
- **Heading (ES):** "Elige Spark si..."
- **Body / items (ES):**
  - "Vives en Workspace (Gmail + Drive + Calendar diariamente)"
  - "Te alcanza Google AI Ultra ($100 USD/mes)"
  - "Tu trabajo es público / marketing / contenido / operaciones"
  - "Necesitas tareas asíncronas largas (research, monitoreo, generación batch)"
  - "Elige OpenClaw si tu trabajo es privado / regulado / cliente-confidencial"
- **Visual direction:** Lista limpia con check verde en los primeros 4 items, check amarillo en el último (cambio de recomendación). Brand-avatar Armando esquina inferior con calm certainty.
- **Background image:** `06-decision.png`
- **Caption-to-self:** Da la decisión accionable, coherente con §5 "what to do."

### Slide 7 — CTA
- **Type:** cta
- **Heading (ES):** "Tu acción esta semana"
- **Body (ES):** "Si Spark es para ti, únete a la lista de espera el lunes (rollout AI Ultra US la próxima semana). Si no, sigue con OpenClaw. El agente correcto depende de tu tipo de trabajo, no del hype."
- **Button text:** "Ir a la lista de espera"
- **Show handle:** true
- **Visual direction:** Brand-avatar Armando satisfied, teléfono en mano mostrando la página del waitlist. Neon-gold accent en el botón.
- **Background image:** `07-cta.png`

### Caption (Instagram, ES, ~150–220 palabras)

Google confirmó hoy **Gemini Spark** en I/O 2026, su agente personal 24/7 que compite directamente con OpenClaw y Anthropic Cowork. Pero hay una ventaja arquitectónica que casi nadie está mencionando:

**Spark corre en la nube. No en tu teléfono.**

OpenClaw necesita tu teléfono prendido, desbloqueado y con Chrome activo. Si tu dispositivo se duerme, el agente se duerme. Spark se ejecuta en los servidores de Google de forma asíncrona: le das una tarea, cierras la laptop, y sigue trabajando.

Eso cambia qué le puedes pedir. Investigar 30 restaurantes en OpenTable mientras duermes. Generar 20 variantes en Canva mientras estás en el gym. Reservar Instacart mientras manejas. Tareas asíncronas largas que antes requerían tu computadora prendida.

**El trade-off honesto:** cloud-resident equivale a menos privado. Google procesa el contexto de tus tareas en sus servidores. Para marketing o operaciones públicas, no importa. Para trabajo legal o médico, sí importa.

**Cómo decidir:** si vives en Workspace y te alcanza Google AI Ultra ($100/mes), únete a la lista de espera el lunes. Si tu trabajo es privado o regulado, mantén OpenClaw. El agente correcto depende de tu tipo de trabajo, no del hype.

Rollout próxima semana: AI Ultra, US-only por ahora. Latam: sin fecha confirmada.

Fuente: keynote Google I/O 2026.

### Hashtags
#GeminiSpark #GoogleIO2026 #OpenClaw #AIAgents #CloudAgent #Workspace #Gemini #IAparaFounders #ProductividadIA #AsistenteIA #AntropicCowork #Latam

---

## Angle C — "Spark vs OpenClaw: depende de TU trabajo" (BACKLOG)

**Hook (ES):** "Si tu trabajo es privado, OpenClaw gana. Si es Workspace-heavy, Spark. Decisión real, no marketing."
**Anchor / emotion:** brand-avatar Armando, **intense focus** per §16 (narrow eyes, jaw set, body leaning forward over a desk with a flowchart on a tablet).
**Format:** 9 slides, 4:5, style preset `dark-minimal` (decision-tool aesthetic).
**Voice spine (§5):** what (dos agentes serios ahora compiten por tu workflow) · why (arquitectura diferente → trabajos diferentes) · what it means (no hay agente "mejor"; hay agente "correcto para X") · what to do (correr el flowchart de slide 8 y decidir).
**§15 hook compliance:** hook declarativo con condicionales, sin exageración. Slide 2 confirma que ambos productos son reales y producción-ready; slide 3 entrega el mecanismo arquitectónico. Pasa.

### Slide 1 — Cover
- **Type:** cover
- **Title (ES):** "Spark vs OpenClaw: depende de TU trabajo"
- **Subtitle (ES):** "Decisión real para founders. Sin marketing, sin tribu."
- **Tag:** none (comparación factual, no opinión)
- **Visual direction:** Brand-avatar Armando intense focus, inclinado sobre un escritorio con una tablet mostrando un flowchart simplificado. Fondo oscuro, accent gold en el flowchart. Top third quiet para el headline.
- **Background image:** `01-cover.png`
- **Caption-to-self:** El ángulo evergreen, diseñado para save/share. Cover tiene que comunicar "esto es una decisión real, no un take."

### Slide 2 — Las dos opciones reales
- **Type:** content
- **Heading (ES):** "Los dos agentes personales serios en 2026"
- **Body (ES):** "Spark (Google, lanzado hoy en I/O) y OpenClaw (Anthropic, en producción desde marzo). Cowork de Anthropic es un tercero pero más enfocado en equipos. Para uso personal, son Spark y OpenClaw."
- **Icon / number:** number `1`
- **Visual direction:** Dos logos grandes lado a lado: Spark izquierda, OpenClaw derecha. Una línea vertical fina divide. Sin personas. Fondo oscuro limpio.
- **Background image:** `02-options.png`
- **Caption-to-self:** Centra el campo de decisión antes de comparar. Esto es lo que existe, no lo que se rumora.

### Slide 3 — La diferencia arquitectónica clave
- **Type:** comparison
- **Heading (ES):** "Dónde corre cada uno"
- **Left label (ES):** "Spark"
- **Left content (ES):** "Cloud-resident. Corre en servidores de Google. Asíncrono. Trabaja sin tu dispositivo."
- **Right label (ES):** "OpenClaw"
- **Right content (ES):** "Phone-resident. Corre en Chrome dentro de tu teléfono. Síncrono. Necesita tu dispositivo activo."
- **Visual direction:** 50/50 split, íconos de servidor (izq) y teléfono (der). Accent gold en el lado Spark, accent blue en el lado OpenClaw, diferenciación visual clara.
- **Background image:** `03-architecture.png`
- **Caption-to-self:** El mecanismo en slide 3, §15 satisfecho. Es la slide más screenshot-able.

### Slide 4 — Integraciones
- **Type:** comparison
- **Heading (ES):** "Qué herramientas tocan de día uno"
- **Left label (ES):** "Spark"
- **Left content (ES):** "Workspace (Gmail, Drive, Calendar, Docs, Sheets), Canva, OpenTable, Instacart. Más Workspace de las que un agente ha tenido nunca."
- **Right label (ES):** "OpenClaw"
- **Right content (ES):** "Cualquier web app que abras en Chrome. Sin integraciones nativas: opera por la UI como un humano. Más universal, menos profundo."
- **Visual direction:** Grid de logos a cada lado. Spark: 4 logos concretos. OpenClaw: un logo Chrome con "infinitas" en texto.
- **Background image:** `04-integrations.png`
- **Caption-to-self:** Comparación honesta. Spark profundo, OpenClaw ancho. No favoritism.

### Slide 5 — Privacidad
- **Type:** comparison
- **Heading (ES):** "Quién ve tu trabajo"
- **Left label (ES):** "Spark"
- **Left content (ES):** "Google procesa contexto en sus servidores. Política Workspace aplica. No usar con datos regulados o cliente-confidenciales."
- **Right label (ES):** "OpenClaw"
- **Right content (ES):** "Anthropic ve menos: el agente opera localmente sobre tu sesión. Más privado por arquitectura."
- **Visual direction:** Íconos de candado a la derecha (OpenClaw) en gold, ícono de candado abierto a la izquierda (Spark) en blanco. Sin caricaturizar; es un trade-off real.
- **Background image:** `05-privacy.png`
- **Caption-to-self:** §3 obligatorio. Mechanism-honest sobre privacidad. No vender Spark sin nombrar este costo.

### Slide 6 — Pricing y disponibilidad
- **Type:** comparison
- **Heading (ES):** "Qué cuestan y dónde están"
- **Left label (ES):** "Spark"
- **Left content (ES):** "$100 USD/mes (Google AI Ultra). Solo US la próxima semana. Latam: sin fecha."
- **Right label (ES):** "OpenClaw"
- **Right content (ES):** "Incluido en Claude Pro ($20/mes) o Max ($200/mes). Disponible global desde marzo."
- **Visual direction:** Pricing tags grandes a cada lado. Mapa pequeño con US sombreado solo en el lado Spark.
- **Background image:** `06-pricing.png`
- **Caption-to-self:** Latam-relevance crítico. Esta audiencia ve esto antes que cualquier otra cosa.

### Slide 7 — Para qué trabajos cada uno gana
- **Type:** list
- **Heading (ES):** "Casos donde cada uno gana claro"
- **Body / items (ES):**
  - "Spark gana: marketing, contenido, research público, planeación, operaciones Workspace-heavy"
  - "Spark gana: tareas largas asíncronas (overnight, multi-paso)"
  - "OpenClaw gana: trabajo cliente-confidencial, legal, médico, financiero"
  - "OpenClaw gana: investigación competitiva en apps fuera de Workspace"
  - "OpenClaw gana: uso global (Latam, EU, Asia)"
- **Visual direction:** Lista con check gold para Spark y check blue para OpenClaw, color-coded a las slides anteriores. Brand-avatar Armando esquina con intense focus.
- **Background image:** `07-use-cases.png`
- **Caption-to-self:** Concreta los casos. La lista que la audiencia va a screenshot y mandar al equipo.

### Slide 8 — Flowchart de decisión
- **Type:** list
- **Heading (ES):** "El flowchart en 4 preguntas"
- **Body / items (ES):**
  - "1. ¿Tu trabajo toca datos privados / regulados / cliente-confidenciales? → OpenClaw."
  - "2. ¿Vives en Workspace todo el día? Si no → OpenClaw."
  - "3. ¿Estás fuera de US y necesitas el agente ya? → OpenClaw."
  - "4. ¿Te alcanzan $100 USD/mes y todas las anteriores fueron no? → Spark."
- **Visual direction:** Flowchart visual: 4 cajas conectadas con flechas. Caja final muestra "Spark" o "OpenClaw" según el path. Brand-avatar Armando esquina inferior con intense focus, señalando con el dedo.
- **Background image:** `08-flowchart.png`
- **Caption-to-self:** El ancla del carrusel. La slide diseñada para save. Diseño ultra-limpio.

### Slide 9 — CTA
- **Type:** cta
- **Heading (ES):** "Corre tu flowchart"
- **Body (ES):** "Guarda este carrusel. Cuando Spark abra waitlist el lunes, vuelve, corre las 4 preguntas, y decide. Sin marketing, sin tribu."
- **Button text:** "Guardar y decidir"
- **Show handle:** true
- **Visual direction:** Brand-avatar Armando satisfied con leve sonrisa de "te lo dejé claro." Botón con ícono de bookmark.
- **Background image:** `09-cta.png`

### Caption (Instagram, ES, ~150–220 palabras)

Google lanzó **Gemini Spark** ayer en I/O. **OpenClaw** de Anthropic existe desde marzo. Dos agentes personales serios, dos arquitecturas diferentes. No hay agente "mejor". Hay agente correcto para TU trabajo.

**La diferencia clave:** Spark corre en la nube de Google (asíncrono, trabaja sin tu dispositivo). OpenClaw corre en tu Chrome (síncrono, necesita tu teléfono activo).

Eso cambia todo lo demás:

→ **Spark gana** si tu trabajo es Workspace-heavy, público, marketing/contenido/research. Y si te alcanzan los $100 USD/mes de AI Ultra.

→ **OpenClaw gana** si tu trabajo es privado, regulado, cliente-confidencial. O si estás fuera de US (Spark es US-only la próxima semana, sin fecha para Latam).

**El flowchart en 4 preguntas (slide 8):**
1. ¿Datos privados / regulados? → OpenClaw.
2. ¿Vives en Workspace todo el día? Si no → OpenClaw.
3. ¿Estás fuera de US y necesitas el agente ya? → OpenClaw.
4. ¿Te alcanzan $100/mes y todo lo anterior fue no? → Spark.

Guarda el carrusel. Cuando Spark abra waitlist el lunes, vuelve, corre las 4 preguntas, decide. Sin hype, sin tribu, sin caer en el ruido del lanzamiento.

Fuentes: keynote Google I/O 2026 (Spark) + Anthropic OpenClaw docs.

### Hashtags
#GeminiSpark #OpenClaw #AIAgents #AnthropicCowork #Workspace #Gemini #ClaudeAI #IAparaFounders #ProductividadIA #DecisionesIA #AgentesIA #Latam

---

## Angle D — "Workspace + Canva + OpenTable: el moat real" (BACKLOG)

**Hook (ES):** "Spark no es interesante por la IA. Es interesante por la lista de integraciones."
**Anchor / emotion:** brand-avatar Armando, **calm certainty** per §16 (direct gaze, slight smirk, body relaxed in front of an integrations grid).
**Format:** 7 slides, 4:5, style preset `dark-minimal` with integration-grid layout.
**Voice spine (§5):** what (Spark llega con Workspace + Canva + OpenTable + Instacart día uno) · why (modelo solo no es moat; integraciones es moat) · what it means (Google está construyendo el agente con la superficie de trabajo más grande del mercado) · what to do (mapear cuál de tus workflows toca esos 4 servicios; esos son los primeros candidatos a delegar).
**§15 hook compliance:** "no es interesante por la IA, es interesante por X" es captivating + contrarian. Slide 2 nombra las 4 integraciones, slide 3 explica por qué integraciones gana al modelo en esta era. Pasa.

### Slide 1 — Cover
- **Type:** cover
- **Title (ES):** "Spark no es interesante por la IA"
- **Subtitle (ES):** "Es interesante por la lista de integraciones."
- **Tag:** none
- **Visual direction:** Brand-avatar Armando calm certainty, sosteniendo un tablet que muestra un grid de logos (Workspace, Canva, OpenTable, Instacart). Leve smirk. Fondo oscuro, accent gold en el grid.
- **Background image:** `01-cover.png`
- **Caption-to-self:** Hook contrarian. Pasa §15 si slide 2 entrega los 4 nombres y slide 3 explica el por qué.

### Slide 2 — Las cuatro integraciones de día uno
- **Type:** list
- **Heading (ES):** "Lo que Spark toca desde el lunes"
- **Body / items (ES):**
  - "Google Workspace: Gmail, Drive, Calendar, Docs, Sheets, Meet"
  - "Canva: generar y editar assets visuales directamente"
  - "OpenTable: reservar y modificar restaurantes"
  - "Instacart: pedir groceries y delivery"
- **Visual direction:** Grid 2x2 de logos grandes con un check gold debajo de cada uno. Sin avatares en esta slide.
- **Background image:** `02-integrations.png`
- **Caption-to-self:** Slide ancla. La lista concreta de la que la audiencia hace captura de pantalla.

### Slide 3 — Por qué integraciones > modelo en 2026
- **Type:** content
- **Heading (ES):** "El modelo se commoditiza. Las integraciones no."
- **Body (ES):** "GPT, Claude, Gemini: la diferencia entre los modelos top se mide en puntos de benchmark. La diferencia entre los agentes top se mide en cuántas apps tocan de forma nativa. Google tiene Workspace. Eso no se replica."
- **Icon / number:** number `1`
- **Visual direction:** Diagrama: izquierda un gráfico de benchmarks aplanado (modelos convergiendo). Derecha una barra creciente de "integraciones nativas" con Spark arriba. Sin personas.
- **Background image:** `03-mechanism.png`
- **Caption-to-self:** El mecanismo. §15 satisfecho en slide 3. Es la tesis del carrusel.

### Slide 4 — Por qué Workspace es el moat más grande
- **Type:** content
- **Heading (ES):** "Workspace = 3+ billones de usuarios + tu día completo de trabajo"
- **Body (ES):** "Gmail, Drive, Calendar, Docs, Sheets, Meet: para 3 billones de personas, esto ES el día de trabajo. Un agente que opera nativamente sobre esa superficie no compite con OpenClaw, compite con tu asistente humano."
- **Icon / number:** number `2`
- **Visual direction:** Brand-avatar Armando calm certainty viendo una pantalla con un calendar/inbox/drive abierto en paralelo. Accent gold en los timestamps activos.
- **Background image:** `04-workspace-moat.png`
- **Caption-to-self:** Aterriza por qué Workspace específicamente es el moat, no cualquier integración.

### Slide 5 — Qué se puede delegar el lunes
- **Type:** list
- **Heading (ES):** "Tareas reales que se delegan a Spark desde día uno"
- **Body / items (ES):**
  - "Inbox triage: Gmail + reply drafts mientras duermes"
  - "Calendar coordination: encontrar slots entre 5 personas + agendar"
  - "Asset generation: 10 variantes de un anuncio en Canva sin abrir Canva"
  - "Cliente dinner: reservar OpenTable con preferencias del cliente"
  - "Office groceries: pedir Instacart semanal para la oficina"
- **Visual direction:** Lista con íconos de los logos respectivos. Brand-avatar Armando esquina con calm certainty.
- **Background image:** `05-tasks.png`
- **Caption-to-self:** Aterriza el mecanismo en tareas concretas. La pregunta "qué hago el lunes" responde aquí.

### Slide 6 — Lo que falta (mechanism-honest)
- **Type:** content
- **Heading (ES):** "Lo que Spark todavía NO toca"
- **Body (ES):** "Slack, Notion, Linear, Figma, Salesforce, HubSpot, Stripe, Mercury. Si tu día vive más en esas apps que en Workspace, Spark no es tu agente todavía. Espera la fase 2, o usa OpenClaw que opera por UI sobre cualquier app."
- **Icon / number:** number `3`
- **Visual direction:** Grid de logos en gris con un símbolo "no disponible" sutil. Brand-avatar Armando con expresión neutral/calm; esto no es para juzgar.
- **Background image:** `06-missing.png`
- **Caption-to-self:** §3 obligatoria. No esconder lo que no funciona. Audiencia distingue creators honestos.

### Slide 7 — CTA
- **Type:** cta
- **Heading (ES):** "Mapea tu workflow"
- **Body (ES):** "Esta semana: lista las 5 apps donde pasas más tiempo. Si Workspace + Canva + OpenTable + Instacart cubren 3+ de ellas, únete a la lista de espera de Spark. Si no, espera fase 2 o mantén OpenClaw."
- **Button text:** "Mapear workflow"
- **Show handle:** true
- **Visual direction:** Brand-avatar Armando satisfied con un cuaderno mostrando una lista de 5 apps marcadas. Accent gold en los 3 checks coincidentes.
- **Background image:** `07-cta.png`

### Caption (Instagram, ES, ~150–220 palabras)

Todos hablan de Gemini Spark por la IA. Pero **el modelo no es lo interesante.** En 2026 los modelos top (Gemini 3.5, GPT-5, Claude) convergen: los benchmarks ya están casi en empate.

**Lo que separa los agentes ahora son las integraciones nativas.** Spark llega de día uno con:

→ **Google Workspace** (Gmail, Drive, Calendar, Docs, Sheets, Meet): el día de trabajo de 3+ billones de personas.
→ **Canva**: generar assets sin abrir Canva.
→ **OpenTable**: reservas con preferencias.
→ **Instacart**: groceries y delivery.

Eso es más Workspace que cualquier otro agente ha tenido nunca. Y Workspace no se replica: Google la construyó por 20 años.

**Lo que Spark todavía NO toca:** Slack, Notion, Linear, Figma, Salesforce, HubSpot, Stripe, Mercury. Si tu día vive más ahí que en Workspace, Spark no es tu agente todavía. Espera fase 2 o usa OpenClaw que opera por UI sobre cualquier app.

**Esta semana:** lista las 5 apps donde pasas más tiempo. Si Workspace + Canva + OpenTable + Instacart cubren 3+ de ellas, únete a la lista de espera de Spark (rollout AI Ultra US la próxima semana). Si no, mantén OpenClaw mientras.

El moat real no es el modelo. Es la superficie que toca.

Fuente: keynote Google I/O 2026.

### Hashtags
#GeminiSpark #GoogleWorkspace #Canva #OpenTable #Instacart #AIAgents #Gemini #IAparaFounders #ProductividadIA #Integraciones #Latam #SaaSstack

---

## Angle E — "Antigravity es el cerebro. Spark es la cara." (BACKLOG)

> **Dependency:** este ángulo asume que la audiencia ya entendió Antigravity (#B05). Solo publicar DESPUÉS de #B05 chat-first el miércoles 20. Si #B05 no se publicó, este ángulo confunde más de lo que aclara.

**Hook (ES):** "Spark corre en la harness de Antigravity. Si entiendes esa pieza, entiendes hacia dónde va Google."
**Anchor / emotion:** **Demis Hassabis** photoreal portrait, **intense focus** per §16 (narrow eyes, jaw set, looking at a stack diagram).
**Format:** 8 slides, 4:5, style preset `dark-minimal` (technical / research aesthetic).
**Voice spine (§5):** what (Spark = Antigravity harness + Gemini 3.5 + integraciones) · why (Google está unificando su stack de agentes; una sola harness para CLI, Spark, y futuros agentes) · what it means (las apuestas de stack que hagas ahora se vuelven más sticky; el ecosistema de Google es una sola cosa, no productos separados) · what to do (si construyes con Antigravity SDK, ya estás construyendo para Spark; no hay rework).
**§15 hook compliance:** hook técnico pero declarativo. Promete una pieza arquitectónica clara. Slide 2 dibuja el stack, slide 3 entrega el mecanismo de unificación. Pasa.

### Slide 1 — Cover
- **Type:** cover
- **Title (ES):** "Antigravity es el cerebro. Spark es la cara."
- **Subtitle (ES):** "Y si entiendes esa pieza, entiendes hacia dónde va Google."
- **Tag:** none
- **Visual direction:** Demis Hassabis photoreal portrait, intense focus, jaw set, mirando ligeramente hacia abajo a un stack diagram que flota en el frame. Fondo editorial oscuro, accent gold sutil.
- **Background image:** `01-cover.png`
- **Caption-to-self:** Hassabis como anchor técnico, el frame "research / architecture." Hook promete pieza arquitectónica.

### Slide 2 — El stack de Google explicado
- **Type:** content
- **Heading (ES):** "El stack de agentes de Google en 1 frame"
- **Body (ES):** "Capa 1: Gemini 3.5 (el modelo). Capa 2: Antigravity (la harness: orquestación, subagentes, herramientas, scheduling). Capa 3: Spark (la cara: el usuario final habla con Spark, Spark llama Antigravity, Antigravity llama Gemini)."
- **Icon / number:** number `1`
- **Visual direction:** Stack diagram vertical: 3 cajas apiladas con labels Gemini 3.5 (abajo), Antigravity (medio), Spark (arriba). Conectores claros. Sin avatares.
- **Background image:** `02-stack.png`
- **Caption-to-self:** Esta es la slide ancla, la imagen mental que toda la carrusel construye.

### Slide 3 — Por qué Google está unificando (mecanismo)
- **Type:** content
- **Heading (ES):** "Una harness, muchas caras"
- **Body (ES):** "Antigravity es la harness compartida. Spark la usa para tareas personales. Antigravity 2.0 chat-first la usa para developers. La CLI la usa para terminal. Mismas herramientas, mismos subagentes, mismos protocolos. Una sola superficie de plataforma para Google."
- **Icon / number:** number `2`
- **Visual direction:** Hub-and-spoke: Antigravity en el centro, con flechas a Spark, Antigravity 2.0 IDE, CLI, y "futuros productos." Brand-avatar Armando esquina con intense focus.
- **Background image:** `03-unification.png`
- **Caption-to-self:** Mechanism en slide 3. §15 satisfecho. Es el "por qué" de la apuesta de Google.

### Slide 4 — Qué significa que Spark corra en Antigravity
- **Type:** content
- **Heading (ES):** "Spark hereda todo lo que mostraron en Antigravity 2.0"
- **Body (ES):** "Multi-agent orchestration: Spark puede correr 5 subagentes en paralelo. Scheduled tasks: Spark puede ejecutar tareas diariamente sin que tú las inicies. Native tools: Spark usa el mismo tool-calling que Antigravity. Si Antigravity es production-grade, Spark también."
- **Icon / number:** number `3`
- **Visual direction:** Brand-avatar Armando intense focus, viendo una pantalla con 5 sub-procesos corriendo en paralelo. Cada uno con un mini-label (research, write, schedule, etc.).
- **Background image:** `04-inheritance.png`
- **Caption-to-self:** Aterriza la implicación técnica. Spark no es un producto separado, es Antigravity con UX de usuario.

### Slide 5 — Qué significa para developers
- **Type:** content
- **Heading (ES):** "Si construyes con Antigravity SDK, construyes para Spark"
- **Body (ES):** "Esta es la jugada estratégica: cualquier developer que use Antigravity SDK hoy está construyendo extensiones que pueden correr en Spark mañana. Google está reclutando developers al cerebro, no a la cara."
- **Icon / number:** number `4`
- **Visual direction:** Diagrama: developer escribiendo SDK code → caja de Antigravity → flecha a Spark + flecha a Antigravity 2.0 + flecha a CLI. Mismo código, múltiples destinos.
- **Background image:** `05-developers.png`
- **Caption-to-self:** Implicación para developers. La slide de la que la audiencia técnica hace captura de pantalla.

### Slide 6 — Comparación con la estrategia de Anthropic / OpenAI
- **Type:** comparison
- **Heading (ES):** "Strategia de stack: Google vs el resto"
- **Left label (ES):** "Google"
- **Left content (ES):** "Una sola harness (Antigravity) → múltiples productos (Spark, IDE, CLI). Stack unificado."
- **Right label (ES):** "OpenAI / Anthropic"
- **Right content (ES):** "Productos separados (ChatGPT, Codex, Operator / Claude, Claude Code, Cowork, OpenClaw). Sin harness unificada pública."
- **Visual direction:** 50/50 comparación. Izquierda: un cerebro central con líneas a 3 ramas. Derecha: 3 cerebros separados con líneas independientes.
- **Background image:** `06-strategy.png`
- **Caption-to-self:** Diferencia estratégica clara. No juzgar cuál es "mejor," nombrar la diferencia.

### Slide 7 — Lo que esto te dice del 2027
- **Type:** content
- **Heading (ES):** "La señal: Google va a apilar todo sobre Antigravity"
- **Body (ES):** "Si Spark corre en Antigravity hoy, lo que viene también: Google Search agente, agentes empresariales, futuros productos. Si quieres apostar al ecosistema Google, no apuestas a Spark, apuestas a Antigravity."
- **Icon / number:** number `5`
- **Visual direction:** Brand-avatar Armando intense focus, viendo un horizonte de productos futuros con Antigravity como base. Tono editorial.
- **Background image:** `07-future.png`
- **Caption-to-self:** La línea OPINIÓN del carrusel: la implicación a 18 meses. Tag OPINIÓN no necesario porque la inferencia es directa del anuncio de hoy, pero la línea de "apuestas a Antigravity" puede ser más punteada.

### Slide 8 — CTA
- **Type:** cta
- **Heading (ES):** "Tu acción esta semana"
- **Body (ES):** "Si eres developer y construyes agentes, juega con Antigravity SDK esta semana: estás construyendo para Spark sin saberlo. Si no construyes, mira el carrusel del miércoles sobre Antigravity 2.0 chat-first para el contexto completo."
- **Button text:** "Antigravity SDK"
- **Show handle:** true
- **Visual direction:** Brand-avatar Armando satisfied con la terminal abierta mostrando código Antigravity SDK. Accent gold en el botón.
- **Background image:** `08-cta.png`

### Caption (Instagram, ES, ~150–220 palabras)

Google lanzó **Gemini Spark** hoy. Pero la pieza que casi nadie nombró: **Spark corre en la harness de Antigravity.**

El stack es así:
- Capa 1: **Gemini 3.5** (el modelo)
- Capa 2: **Antigravity** (la harness: orquestación, subagentes, scheduling)
- Capa 3: **Spark** (la cara que ve el usuario)

Y eso significa que la **misma harness** corre Spark, Antigravity 2.0 chat-first (lanzado también hoy), el Antigravity CLI, y cualquier producto futuro. Una sola plataforma, múltiples caras.

**La jugada estratégica:** si construyes con Antigravity SDK hoy, estás construyendo extensiones que pueden correr en Spark mañana. Google está reclutando developers al cerebro, no a la cara.

**Cómo se compara:** OpenAI tiene productos separados (ChatGPT, Codex, Operator). Anthropic igual (Claude, Claude Code, Cowork, OpenClaw). Sin harness unificada pública. Google está apilando todo sobre Antigravity, y eso lo hace una apuesta diferente.

**La señal a 18 meses:** si quieres apostar al ecosistema Google, no apuestas a Spark, apuestas a Antigravity.

**Esta semana:** si eres developer, juega con Antigravity SDK. Estás construyendo para Spark sin saberlo. Si no, mira mi carrusel del miércoles sobre Antigravity 2.0 chat-first.

Fuente: keynote Google I/O 2026.

### Hashtags
#GeminiSpark #Antigravity #GoogleIO2026 #AIAgents #AgentStack #Gemini #IAparaFounders #AntigravitySDK #DevTools #Architecture #Anthropic #OpenAI

---

## Production notes — Story #B08

### Dependencies and blockers

| Item | Blocker | Mitigation |
|---|---|---|
| **Spark disponibilidad fuera de US** | Solo US la próxima semana, sin fecha para Latam. | Cada angle nombra el gating geográfico explícitamente (slides 5 / 6 según el ángulo). No se posiciona como "únete ya a la lista de espera" sin disclaimer. |
| **AI Ultra subscription requirement** | $100 USD/mes, pricing-pesado para Latam. | Cada CTA cualifica el target con "si te alcanzan los $100/mes" o "si vives en Workspace." No vender el producto a quien no lo va a poder usar. |
| **Angle E depende de #B05 Antigravity** | El stack diagram en Angle E asume que la audiencia ya entendió Antigravity 2.0 chat-first. | **Solo publicar Angle E DESPUÉS de #B05 chat-first (miércoles 20). Si #B05 no se publicó o no funcionó, posponer Angle E indefinidamente o reescribir slides 2-5 para explicar Antigravity desde cero.** |
| **OpenClaw side de la comparación (Angles B + C)** | Necesitamos las screenshots / claims oficiales de OpenClaw para la comparación honesta. | Fetch OpenClaw product page + 2-3 reviews independientes. Si la doc no soporta la claim phone-resident con esta precisión, suavizar el lenguaje a "depende del browser activo." |
| **Hassabis refs photoreal** | Refs need v6 refresh per CONTENT_CALENDAR §sibling-agent dependencies. | Mientras se hace v6, usar editorial-illustration style por §12. Both photoreal y editorial-illustration están permitidos. |
| **Demo content** | Per §3 + brief: no fabricar contenido de demos. | Cada slide que referencia demo cita el demo real del keynote: Daily Brief, phone-control (Nishtha), task list. Sin inventar tareas que Spark "puede hacer" sin source. |
| **Spark vs Anthropic Cowork** | Cowork es team-focused; Angle B + C lo mencionan brevemente pero no lo comparan en detalle. | Si la audiencia pide más comparación contra Cowork, hacer carrusel separado en W22. |
| **Pricing exact (Google AI Ultra)** | Slide del keynote dice "$100"; verificar contra la página oficial antes de postear. | Cada angle dice "$100 USD/mes (Google AI Ultra)"; confirmar contra `https://gemini.google/ai-ultra/` el día del post. |

### Cross-angle production hygiene

- **One angle per week max.** No publicar 2 angles del mismo story en la misma semana. Angle B sale sábado 23; los otros (A / C / D / E) entran a backlog para W22+ o reshuffle.
- **Angle C es el evergreen save-magnet.** El flowchart en slide 8 está diseñado para screenshot/save. Si Angle B (cloud-resident) recibe respuesta positiva el sábado, Angle C puede shipear en W22 como follow-up "decisión real."
- **Angle E necesita más tiempo de design.** El stack diagram (slide 2) y el hub-and-spoke (slide 3) son slides técnicas complejas. Allocar tiempo extra a producción visual.
- **Angle D es el más founder-friendly:** bajo riesgo, alta retención. Buen candidato para semana sin news peg fuerte.
- **Angle A es el más generic.** Solo publicar si quieres una reaparición simple del story sin frame nuevo. No es el primer ángulo a salvar para reshuffle.

### Sibling-agent handoff

- **Image-gen agent:** generar primero Hassabis (calm certainty para Angle B cover; intense focus para Angle E cover) en pose photoreal editorial. Refs v6 idealmente, fallback a editorial-illustration. Brand-avatar Armando en 3 poses: satisfied (Angles A + D CTAs), calm certainty (Angles B + D), intense focus (Angles C + E).
- **Source-fetch agent:** confirmar la URL oficial del Spark launch post de Google + screenshot de la slide "$100" + OpenClaw product page para comparación.
- **Translation check:** todos los ángulos usan `lanzar` (no `enviar`), `nube` (no `nube de`), `actualmente` correctamente (no aparece; `today / hoy` se usa directamente). Pasa §14.

### Hook smell-test final (§15)

| Angle | Hook | Body delivers mechanism by slide | §15 status |
|---|---|---|---|
| A | "Era Remy. Es Spark. Y es real." | Slide 3 (cloud-resident) | Pass |
| B | "Ventaja sobre OpenClaw que nadie está mencionando" | Slide 2 (cloud-resident) + Slide 3 (comparison) | Pass (borderline, rescued by slide 2/3 mechanism) |
| C | "Si tu trabajo es privado, OpenClaw gana. Si es Workspace-heavy, Spark." | Slide 3 (arquitectura) | Pass |
| D | "Spark no es interesante por la IA. Es la lista de integraciones." | Slide 2 (4 integraciones) + Slide 3 (mecanismo modelo vs moat) | Pass |
| E | "Antigravity es el cerebro. Spark es la cara." | Slide 2 (stack) + Slide 3 (unificación) | Pass |

### Emotion-in-visuals check (§16)

| Angle | Cover anchor | Emotion | Match to story register |
|---|---|---|---|
| A | brand-avatar Armando | satisfied / delighted | Founder-empowerment / confirmation arc; match |
| B | Demis Hassabis | calm certainty | Opinion / "I'm not afraid to say this" → here it's "this is the structural advantage"; match |
| C | brand-avatar Armando | intense focus | Drama / competition / war (agent wars); match |
| D | brand-avatar Armando | calm certainty | Opinion / contrarian frame ("not the IA"); match |
| E | Demis Hassabis | intense focus | Drama / competition (stack strategy); match |

All anchors and emotions locked per §16.

---

## Version

**B08-gemini-spark.md** v1.0 (2026-05-19 evening, post-I/O keynote).

- v1.0 (2026-05-19): initial 5-angle detail file for Story #B08 Gemini Spark. Angle B is SHIPPING Sat 23. Angles A, C, D, E in backlog. All angles pass VOICE.md §3 + §15 + §16. Production notes flag US-only rollout, AI Ultra pricing, and Angle E dependency on #B05.
