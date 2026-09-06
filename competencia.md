# Competencia y hoja de ruta — TurnoYa

**Fecha:** 6 de septiembre de 2026  
**Para:** el equipo  
**Cómo leerlo:** primero el enemigo real, después la tabla, después la ruta. Los precios de terceros cambian; las URLs están al final.

Tres capas distintas. No las mezcles:

| Capa | Qué es | Sirve para competir hoy |
| --- | --- | --- |
| **MVP (piloto)** | Agenda + ficha + seña (MP del local o alias) + bot de menú WhatsApp + “Mi turno” | Sí, contra el cuaderno y contra Turnito |
| **Prototipo** | Mapa, planes Calle/Barrio/Ciudad/Red, CRM, cupones, ARCA, canvas | Catálogo de lo que viene. No está en producción |
| **Post-MVP** | IA, marketplace denso, ARCA real, app nativa | No se construye hasta que el piloto mida reservas |

La visión canónica está en `Calendar-BE/docs/00-vision-y-alcance.md`. El recorte del piloto está en `prototipo-turnoya/MVP.md`.

---

## 1. Quién es la competencia

No es “todas las apps de belleza del mundo”. Son tres peleas distintas.

### Pelea 1 — El cuaderno + WhatsApp (el líder)

Es el default de un spa, barbería o kinesiólogo en Argentina. El cliente escribe “tenés lugar mañana?”. El dueño anota en papel, Excel o la cabeza.

**Qué tiene:** cero fricción, cero plata, el canal que el cliente ya usa.  
**Qué no tiene:** seña automática, hold de 15 min, una sola verdad de horarios, recordatorio que no dependa de que el dueño se acuerde.

Si perdés esta pelea, perdiste el mercado. Booksy puede esperar.

### Pelea 2 — Turnitos locales (Turnito y similares)

Agenda web + link de Instagram + seña. El dueño ya entiende el producto. La diferencia es **quién se queda un % de la seña** y si el precio está en pesos.

### Pelea 3 — Suites globales (Fresha, Booksy, AgendaPro)

Agenda + app + marketplace + stock + marketing. Ganan por red de clientes y por “viene todo”. Pierden en Argentina por dólar, comisión de marketplace y setup pensado para salón con recepcionista.

**No competimos con ellos feature a feature en el piloto.** Competimos en: 0% sobre la cartera, pesos, celular, operativo el mismo día.

---

## 2. Qué tenemos nosotros

### MVP (lo que hay que hacer andar de verdad)

- Ficha pública `turnoya.com/tu-local` → calendario → reserva con hold 15 min.
- Seña: ninguna / fija / porcentaje. Mercado Pago **de la cuenta del local**. Transferencia “ya pagué” (alias / CVU / banco) y el dueño confirma.
- Backoffice de una mano: servicios, horarios, feriados, concretó / no vino / canceló, turno de mostrador.
- Cliente: “Mi turno” (ver, cancelar, `.ics`).
- WhatsApp: bot de **menú** (Servicios / Reservar / Hablar con el local) en el número compartido de TurnoYa. El dueño carga su `wa.me` para el pase humano. Cloud API oficial, no QR de WhatsApp Web.
- 0% de comisión de TurnoYa sobre la seña. La comisión de Mercado Pago la paga el local, como siempre.
- Planes en pesos (Calle / Barrio / Ciudad / Red) diseñados; en el piloto el acceso MVP es irrestricto y el cobro de suscripción es a mano.

### Prototipo (se ve, no es el producto)

Mapa de cercanía, Destacado / Patrocinado, lista de espera, huecos del día, CRM, cupones, bandeja, reseñas curadas, canvas de landing, Caja/ARCA, bot con IA.

### Lo que no tenemos (y ellos sí, o el cuaderno también)

- Densidad de locales en una ciudad (sin eso el mapa no descubre a nadie).
- App nativa para el cliente (Booksy / Fresha viven de eso).
- Recordatorio WhatsApp medido en producción (el canal existe; Meta tiene que verificar el WABA).
- Stock, caja fiscal, multi-sucursal usable, IA que charla.
- Una red de “pasaporte” del cliente entre locales.

---

## 3. Qué tiene cada uno

Precios consultados en septiembre 2026. Verificar en la fuente antes de usarlo en una venta.

### WhatsApp + cuaderno

| | Ellos | Nosotros (MVP) |
| --- | --- | --- |
| Costo | $0 | Suscripción baja / piloto gratis |
| Canal | El que el cliente ya usa | El mismo, más calendario web |
| Doble reserva | Frecuente | Hold + una grilla |
| Ausencias | El dueño persigue | Seña + (después) recordatorio |
| Plata | Efectivo / alias suelto | MP del local o alias adentro |

**Cómo les ganamos:** no pedirle al cliente una app. Pedirle un link. Que el dueño deje de copiar horarios.

### Turnito

Fuente: [turnito.app/ar](https://turnito.app/ar/).

| | Turnito | TurnoYa (MVP) |
| --- | --- | --- |
| Plan gratis | 3 agendas, 100 reservas/mes | Piloto sin tope de features MVP |
| Comisión sobre cobro | **5%** en gratis; 1% Advance; 0% Pro | **0%** de TurnoYa en todos los casos |
| Precio pago (AR, pub.) | Advance ~$24.500 · Pro ~$42.000 / mes | Calle $0 · Barrio $12.900 · Ciudad $22.900 · Red $49.900 (diseño; no se cobra auto) |
| WhatsApp | Recordatorios en planes pagos (100–250/mes) | Menú + pase humano; recordatorio en el diseño del piloto |
| Transferencia | La anunciaron; no es el default | Alias/CVU ya está en el flujo |
| Alta | Minutos, link de Instagram | Misma idea: ficha + link |

Turnito gana en **cantidad de locales ya adentro** y en “gratis para entrar”. Pierde si el local cobra seña: el 5% duele. Ejemplo de ellos mismos: 80 señas de $10.000 = **$40.000/mes** para Turnito.

Esa es la frase de venta contra Turnito.

### Fresha

Fuente: [fresha.com/pricing](https://www.fresha.com/pricing) (página global; en AR hay que mirar la local).

| | Fresha | TurnoYa |
| --- | --- | --- |
| Modelo | Suscripción por miembro del equipo (Independent ~USD 19,95/mes; Team ~USD 14,95 por persona) | Pesos, por local / plan |
| Marketplace | **20% una vez** del primer turno de un cliente nuevo que llegó por el marketplace (mín. USD 6 en la página global) | No hay marketplace cobrado. El mapa está fuera del piloto |
| Link propio | Reserva por tu link: sin esa comisión | Toda reserva es por tu ficha |
| App cliente | Fuerte | Web |
| Pensado para | Salón / cadena, iPad en recepción | Dueño con el celular entre clientes |

Fresha es mejor software de salón. Es peor negocio para un unipersonal argentino que no quiere dólares ni ceder el 20% del primer masaje.

### Booksy

Fuente: [biz.booksy.com/es-es/precios](https://biz.booksy.com/es-es/precios) (España; Argentina no publica igual de claro).

| | Booksy | TurnoYa |
| --- | --- | --- |
| Cuota | ~€34,99/mes + empleados extra (ES) | Pesos |
| Comisión | 0% si no usás Boost | 0% |
| Boost (marketplace) | **30%** de la primera visita del cliente nuevo | No existe |
| App | Cliente y negocio, muy fuerte | Web |
| Descubrimiento | Millones de usuarios de la app | Cero red hoy |

Booksy gana si el local quiere “aparecer en la app donde la gente ya busca corte”. Nosotros no tenemos esa app. No prometas “te traemos clientes” hasta tener densidad.

### AgendaPro

Fuentes: [agendapro.com/ar](https://agendapro.com/ar), ayuda de pagos.

| | AgendaPro | TurnoYa |
| --- | --- | --- |
| Precio AR | No lo publican; prueba 7 días; cotización | Publicado en el prototipo, en pesos |
| Extra sobre MP | **1–2% + IVA** arriba de lo que cobra Mercado Pago | 0% de TurnoYa |
| Producto | Stock, caja, sucursales, reportes, app | Agenda + seña + WA |
| Para quién | Centro grande / cadena | Local que atiende solo |

AgendaPro es el “SAP del turno”. Si el dueño pide stock y caja, no lo peleés con el MVP. Mandalo después o no es tu cliente del piloto.

---

## 4. Tabla única (MVP vs el mercado)

| Capacidad | Cuaderno | Turnito | Fresha | Booksy | AgendaPro | **TurnoYa MVP** | TurnoYa después |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Reserva sin app | WhatsApp | Sí | App + web | App + web | Web + app | **Sí (ficha)** | Igual |
| 0% comisión plataforma sobre seña | — | No (5% gratis) | 20% si vino del market | 30% si Boost | 1–2% extra MP | **Sí** | Sí |
| Precio en pesos, claro | $0 | Sí | USD | EUR/USD | Cotización | **Sí** | Planes |
| Seña MP del local | Manual | Sí | Su pasarela | Su pasarela | MP + extra | **Sí** | Sí |
| Alias / “ya pagué” | Manual | En camino | No típico AR | No | No el foco | **Sí** | Sí |
| Hold 15 min | No | Depende | Sí | Sí | Sí | **Sí** | Sí |
| Agenda en el celular | No | Media | Sí | Sí | Sí | **Debe ser excelente** | PWA |
| WhatsApp menú / humano | Humano | Recordatorios pagos | Mensajes medidos | Mensajes | Integraciones | **Menú + wa.me** | Recordatorio + coexistencia |
| Mapa “cerca” | No | No | Marketplace app | Marketplace app | No | Prototipo only | Cuando haya densidad |
| Reseñas verificadas (solo quien concretó) | No | Básico | Sí | Sí | Sí | Diseño | Post-piloto |
| Caja / ARCA | Contador | No | POS | POS | Caja | No (a propósito) | Post-MVP |
| IA que atiende | No | No | En evolución | En evolución | Reportes IA | No (a propósito) | Plan Ciudad/Red |

---

## 5. Dónde ya hay diferencia (si el MVP está vivo)

Tres frases que un dueño entiende:

1. **“La seña va a tu Mercado Pago. Nosotros no nos quedamos un peso.”**  
   Turnito 5%. Fresha 20% si el cliente vino de su app. AgendaPro 1–2% extra.
2. **“El cliente no instala nada. Reserva en tu link. Si quiere hablar, WhatsApp tuyo.”**
3. **“Entre turno y turno lo usás con el pulgar.”**  
   Si la agenda no se opera así, no hay diferencia: vuelve al cuaderno.

Eso **no** es “ampliamente mejor que Booksy”. Es **claramente mejor para un local argentino de 1–3 personas que cobra seña**. Ese es el mercado del piloto.

---

## 6. Dónde todavía perdemos

- **Red.** Ellos tienen clientes ya buscando. Nosotros tenemos que entrar por el Instagram / WhatsApp **del local**.
- **Marca.** “Reservá por Booksy” el cliente ya lo oyó.
- **Recordatorios.** Hasta que Meta apruebe el WABA y midamos costo/reserva, el argumento “menos ausencias” está a medias (queda la seña).
- **Percepción de suite.** Stock, caja, app, marketing: ellos muestran más pantallas. Nosotros no debemos copiarlas para empatar.
- **Mapa.** Sin 30+ locales en Córdoba (o la ciudad piloto), el mapa es marketing vacío.

---

## 7. Hoja de ruta para ser ampliamente mejor

Cada fase tiene que reforzar uno de los tres argumentos: menos ausencias, cero comisión, se usa del celular. Si no, no entra.

### Fase A — Ganarle al cuaderno (ahora, piloto 5–15 locales)

**Listo cuando:** el dueño opera un día entero sin WhatsApp-cuaderno. Hay reservas autogestionadas por semana.

1. Agenda usable con una mano (mostrador, concretó, no vino, cancelar).
2. Ficha + hold + seña MP del local **y** alias.
3. Bot menú + “hablar con el local”.
4. Panel con **ausencias evitas en pesos** (no un gráfico lindo).
5. Alta el mismo día, sin tarjeta de TurnoYa.

**No hacer acá:** mapa público, IA, ARCA, CRM, planes que recorten features.

**Métrica:** reservas/semana, % no-show vs antes, dueño activo día 30 y 60, $ de WhatsApp por reserva.

### Fase B — Ganarle a Turnito (cuando el piloto no se cae)

**Listo cuando:** un local que ya usa Turnito se cambia y no vuelve en 60 días.

1. Misma simpleza de alta (minutos, no un onboarding de cadena).
2. 0% siempre, no “0% si pagás Pro”.
3. Recordatorio WhatsApp de **un toque** (confirmar / cancelar), flujo corto (pocos mensajes: Meta cobra).
4. Transferencia tan fácil como la seña de MP.
5. Precio en pesos, publicado, más barato que Advance/Pro de Turnito **o** igual de caro pero sin comisión.

Ahí “ampliamente mejor” significa: **misma facilidad, menos plata que se llevan ellos**.

### Fase C — Traer demanda sin ser Fresha (solo con densidad)

**Listo cuando:** en **una** ciudad hay suficientes pines del mismo rubro como para que “masaje cerca” no muestre dos locales.

1. Mapa / lista por servicio + GPS (lo del prototipo).
2. Destacado / Patrocinado **etiquetado** (no esconder quién pagó).
3. Reseñas: solo califica quien concretó. El local elige textos, no el promedio.
4. “Hoy hay hueco” cuando se cancela (rellena el día, no es un descuento escondido).

Sin densidad, esto es un cementerio de pines. No adelantar.

### Fase D — Red y automatización (después de que paguen)

**Listo cuando:** el local paga suscripción sin que lo persigamos, y el cliente que escribió por WhatsApp queda atado por celular + mail.

1. Planes con IDs de feature (`feat_agenda`, `feat_wa_menu`, `feat_coupons`, `feat_crm`…). Calle = piloto. Barrio = cupones / bandeja. Ciudad = CRM + bot IA. Red = cadenas.
2. Historial de pagos → mueve al cliente en CRM (pagó / no pagó / no vino).
3. Bot por opciones siempre; IA opcional (sale más caro en Meta).
4. Coexistence: el número del local, no solo el de TurnoYa.
5. PWA, no app nativa hasta que el web no alcance.

### Fase E — No copiar el SAP (consciente)

Caja liviana (totales del mes) sí, cuando la pidan. **ARCA** no, hasta haber un contador y un abogado, no un sprint. Stock y multi-sucursal cuando el cliente sea una cadena, no Oasis de a uno.

---

## 8. Cómo se gana “ampliamente”

No juntando más tiles que AgendaPro. Así:

1. **Ser el default del unipersonal argentino** que hoy usa WhatsApp. Eso es volumen.
2. **Ser más barato en la seña que Turnito gratis.** Eso es la cuña de plata.
3. **Ser más honesto que Fresha/Booksy en el marketplace** el día que haya mapa: se etiqueta Destacado, 0% si el cliente vino por tu Instagram.
4. **Medir ausencias en pesos** mejor que cualquiera. Ese número es el cierre de venta.

Si en 90 días no hay reservas semanales en el piloto, la hoja de ruta de C–E no importa.

---

## 9. Fuentes

- Visión TurnoYa: `Calendar-BE/docs/00-vision-y-alcance.md`
- Recorte MVP: `prototipo-turnoya/MVP.md`
- Turnito planes AR: https://turnito.app/ar/ (consultado 2026-09)
- Fresha pricing: https://www.fresha.com/pricing (comisión marketplace 20%, mín. USD 6 en la página global)
- Booksy ES: https://biz.booksy.com/es-es/precios · Boost 30%: https://biz.booksy.com/es-es/funcionalidades/boost
- AgendaPro AR: https://agendapro.com/ar · comisión MP: https://ayuda.agendapro.com/es/articles/8129545-como-vender-con-agendapro-y-mercado-pago

Los montos de terceros no son un contrato. Antes de una slide de ventas, reabrir esas URLs.
