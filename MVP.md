# TurnoYa — MVP para probar mercado

**Para:** el equipo  
**Qué pedimos:** leé esto y decí qué te cierra, qué no, y si cambiarías quién come el costo de WhatsApp.  
**Fecha:** agosto 2026

El prototipo clickeable **no se tira**. Es el catálogo de lo que viene después. Este documento recorta qué vamos a **construir de verdad** para salir a 5–15 locales, barato, y ver si gusta.

Demo actual: [pedroterraf.github.io/turnoya-prototipo](https://pedroterraf.github.io/turnoya-prototipo/)

---

## La apuesta

En Argentina el turno se pide por WhatsApp (“che, tenés lugar mañana?”), no en una app. Turnito vive del link de Instagram y se come comisión. Fresha/Booksy cobran en dólares.

TurnoYa prueba dos cosas a la vez:

1. **El dueño** deja de anotar en el cuaderno: calendario web + bot en *su* WhatsApp.
2. **El cliente** entra por el mapa, el listado o la búsqueda, ve la ficha y reserva en el calendario.

La métrica del piloto **no** es “quedó lindo el mapa”. Es: ¿hay reservas confirmadas por semana? ¿el dueño abre la agenda sin que lo llamemos? ¿pagaría $5.000–$10.000 cuando saquemos el regalo?

El mapa es el diferenciador de después (hace falta densidad). Al principio el cliente llega sobre todo por el WhatsApp / Instagram del local.

---

## Qué ya decidimos

| Tema | Decisión |
|---|---|
| Cómo reserva el cliente | Mapa, lista o search → ficha del local → calendario → reserva. |
| Bot de WhatsApp | **Menú con botones**, no una IA que charla. Siempre hay “hablar con el local”. |
| De quién es el número | **Cada local conecta el suyo** en el backoffice. |
| API | **Cloud API oficial de Meta** (no QR tipo WhatsApp Web). |
| Quién le paga a Meta | Ideal: **el dueño**, en su cuenta. TurnoYa $0 de tráfico. |
| Pago de la seña | Mercado Pago con confirmación automática **y** “ya pagué” (alias/CVU) para que el dueño confirme. |
| Cómo se ven los servicios en el chat | Link a la ficha **y** PDF cacheado (mismo costo de producto). |
| Alcance | MVP primero. El resto del prototipo queda dormido, no se borra. |

---

## WhatsApp: por qué no IA y por qué oficial

Un bot que conversa (“Buenas Manolito…”) se siente mejor y **sale más caro**. Meta cobra por mensaje. Una IA barata (Gemini) cuesta centavos en tokens; lo caro es cada burbuja en WhatsApp.

**Menú corto (lo que vamos a hacer)**

1. El cliente escribe o toca el link `wa.me` del local.
2. Tres botones: *Servicios · Reservar · Hablar con el local*.
3. Servicios → link de la ficha y/o PDF (el PDF se genera cuando el dueño cambia el menú, no en cada chat).
4. Reservar → elige servicio en una lista de WhatsApp → lo mandamos al **calendario web** de ese servicio. El horario se elige ahí (hold 15 min, como en el prototipo).
5. Si hay seña: link de Mercado Pago. Si paga por transferencia, manda captura y queda *pendiente* hasta que el dueño confirme.
6. “Hablar con el local” → el bot se calla.

El calendario es la fuente de verdad. WhatsApp es la puerta. No duplicamos la grilla de horarios en el chat.

**Por qué no el QR de WhatsApp Web (Evolution / Baileys)**  
Es gratis para Meta y se conecta en un minuto. El riesgo es que Meta **banee el número del spa**. Si esa línea es la de atención del local, nos comemos el reclamo. Para locales reales: oficial.

**“Poner el número en el backoffice”**  
Sí. El dueño toca *Conectar WhatsApp*, carga **su** número, Meta le manda un código (o termina el alta de Facebook). No es el QR verde de WhatsApp Web. Es el alta oficial. El bot corre en *su* línea, con *su* nombre.

No existe Cloud API oficial sin Meta. El tubo es de ellos. Lo que sí se puede es que **la factura no sea nuestra**.

---

## Plata: qué nos puede salir

Cobrar $10.000 ARS o menos (y al principio casi nada) obliga a que el costo por reserva sea casi cero.

| Qué | Hasta el 30/9/2026 | Desde el 1/10/2026 |
|---|---|---|
| Cliente escribe y el bot responde (menú, 24 h) | **Gratis** | Meta cobra. Referencia actual utility AR ≈ **USD 0,026 por mensaje**. Tarifa exacta la publican el 1/9. |
| Recordatorio “mañana tenés turno” (escribimos nosotros) | ≈ USD 0,026 | Sigue cobrando |
| Promo / “volvé a reservar” | ≈ USD 0,062 | Fuera del MVP |
| Comisión Mercado Pago | La paga el **local** | TurnoYa no toca la plata |
| Hosting del MVP (front estático + API chica + DB free) | ≈ USD 0–15/mes | Igual |

Flujo corto ≈ 4 mensajes por reserva ≈ **USD 0,10 por reserva**.

| Escala del piloto | Si TurnoYa come WhatsApp | Si lo come cada local |
|---|---|---|
| 5 locales × 20 reservas | **≈ USD 10/mes** | ≈ USD 2 por local |
| 15 locales × 40 reservas | **≈ USD 62/mes** | ≈ USD 4 por local |

Un piloto que arranque en agosto puede tener **el primer mes de WhatsApp en $0** (hasta el 30/9).

**Pregunta abierta para opinar:** en el piloto gratis (octubre en adelante), ¿la factura de Meta la come **el local** (TurnoYa $0, hay que avisarle “te puede cobrar un café al mes”) o **nosotros** (USD 10–60/mes para hacernos conocidos)?

Lo que no se aguanta: bot de 10 mensajes + recordatorios + campañas. Ahí se va a USD 150–200 y se come cualquier plan barato.

---

## Qué entra en el MVP

### Cliente

- Mapa + listado + búsqueda → ficha → calendario → reserva (hold 15 min).
- Login simple.
- Seña: ninguno / mínimo / % (lo configura el dueño).
- Mercado Pago (se puede fallar y reintentar) o transferencia + espera de confirmación.
- Mis turnos: ver, cancelar según política simple.
- Avisos en la web (y mail barato). No campañas por WhatsApp.

### Dueño (backoffice básico)

Para que el local funcione solo, sin nosotros en el medio:

- Servicios: nombre, precio, duración, si se pisa o no.
- Horarios de atención.
- Agenda: concretó / no vino / cancelar.
- Regla de seña.
- **Conectar Mercado Pago** (webhook).
- **Alias, CVU, titular, banco** (para el “ya pagué”).
- **Conectar su WhatsApp**.
- Landing / ficha pública simple: foto, texto, servicios, reservar, WhatsApp.  
  El editor canvas (drag & zoom) del prototipo **no** entra ahora.
- Un cupón simple, si no pesa.

### Nosotros (Ops, mínimo)

- Alta del local (el pin no es público hasta que alguien lo apruebe).
- Ver que el local está vivo. Nada del panel Ops grande del prototipo.

---

## Qué no entra (y no se borra)

Queda en el prototipo para cuando el mercado tire:

- Planes Calle / Barrio / Ciudad / Red y la matriz de precios.
- Destacado / Patrocinado.
- Lista de espera y “hoy hay hueco” en el mapa.
- CRM, Pixel de Meta, facturas ARCA.
- Landing canvas drag & zoom.
- Curaduría de textos de reseñas (la regla “solo califica quien concretó” sí puede quedar).
- Multi-sucursal, asistencia de red, cron de planes.
- IA que lee comprobantes o que charla.

---

## Cómo lo construiríamos

- Reusar las pantallas del prototipo. No rehacer Calendar-FE/BE.
- Front liviano (lo que ya hay) + **una API chica** (turnos, locales, pagos, webhook de WhatsApp y de Mercado Pago).
- Base barata (free tier).
- WhatsApp: Cloud API **directa**, sin Cliengo ni otro intermediario.
- PDF de servicios: se genera al guardar el menú, archivo estático.
- IA: **no** en el primer corte. Si más adelante hace falta, un solo clasificador (“masaje mañana”) y de vuelta a botones.

Orden tentativo: API + calendario real → Mercado Pago → bot menú en el número del local → PDF → backoffice de arriba → 5–15 locales en Córdoba, midiendo.

---

## Qué queremos que opines

1. ¿Te cierra el recorte (web + menú WhatsApp, sin IA, sin QR no oficial)?
2. ¿La factura de Meta en el piloto la come el local o nosotros?
3. ¿Falta algo en el backoffice sin lo cual un dueño de spa/pelu/kinesio no lo usaría?
4. ¿El mapa entra en el primer piloto o lo dejamos solo como ficha + link de Instagram/WhatsApp?

Cuando esto tenga el OK, se baja a tareas de desarrollo encima del prototipo. El código actual se aprovecha; no se reescribe de cero.
