# Qué se aprovecha y qué no

**Para:** el equipo  
**Complementa:** [MVP.md](./MVP.md)  
**Repos:** `Calendar-BE`, `Calendar-FE` (hoy = OASIS MULTISPA) y este prototipo.

Regla: **no se tira Calendar ni se hace de cero.** Se aprovecha el *motor* (turnos, pagos, servicios). No se usa Oasis como si ya fuera TurnoYa. El prototipo es la UX del marketplace, no la app en producción.

---

## Resumen

| Pieza | Qué hacer |
|---|---|
| Calendar-BE (núcleo turnos / MP / servicios / horarios) | **Aprovechar.** Partir de acá, no de un Nest vacío. |
| Calendar-BE (Baileys, CRM, Meta, paquetes…) | **No portar al MVP.** Queda en el repo de Oasis. |
| Calendar-FE admin + reservar + pago + mi-turno | **Aprovechar** como backoffice del dueño y checkout. |
| Calendar-FE home de Oasis | **No.** El cliente entra por mapa / ficha de TurnoYa. |
| Prototipo (mapa, ficha, 3 roles) | **Aprovechar como especificación de UX.** |
| Prototipo (HTML + `localStorage`) | **No** como backend ni como app final. |

---

## Calendar-BE — sí

Llevar esto a una rama / copia `turnoya` y colgarlo de un `Local` (hoy todo asume un solo spa).

- Crear turno, disponibilidad, cancelar, reprogramar
- Estados de turno (`pendiente_pago`, `confirmado`, `completado`, `cancelado`, …)
- Servicios: precio, duración, `puedeSuperponerse`, fotos
- Mercado Pago: preferencia, webhook, idempotencia (`MpWebhookEvent`)
- Horarios (`diasLaborables`), feriados, bloqueos
- Auth JWT + refresh
- Landing en JSON (`LandingConfig`) → ficha pública simple
- Email transaccional (si ya está y no pesa)

Hay que **cambiar**, no reescribir:

- Agregar `Local` / `placeId` en servicios, turnos, config, pagos, WhatsApp
- Mercado Pago **por local** (tokens del dueño), no `MP_ACCESS_TOKEN` global del `.env`
- Un módulo WhatsApp **nuevo** (Cloud API). El de Baileys no se copia al MVP

---

## Calendar-BE — no (en el MVP)

No se borra del repo de Oasis. No se arrastra al primer corte de TurnoYa.

- WhatsApp con **Baileys** / `whatsapp-web.js` / QR tipo WhatsApp Web
- CRM, campañas Meta, Pixel / CAPI, `CampaignLink`
- Paquetes, lista de espera, métricas, auditoría pesada
- Configuración global de un solo negocio
- Seed / admin pensados solo para Oasis

---

## Calendar-FE — sí

Pantallas que ya resuelven el día a día del dueño y el checkout. Se reusa la lógica y se les pone “este local”, no la marca Oasis en todo el sitio.

| Ruta hoy | Para TurnoYa |
|---|---|
| `/admin/servicios` | Servicios del local |
| `/admin/calendario` y `/admin/turnos` | Agenda (concretó / no vino / cancelar) |
| `/admin/configuracion` | Horarios, seña, alias / CVU / banco |
| `/admin/feriados` | Feriados |
| `/admin/landing` | Ficha / landing **simple** (no el canvas del prototipo) |
| `/reservar` | Calendario del cliente (entra desde la ficha o el bot) |
| `/pago/*` | Mercado Pago + pendiente / éxito / error |
| `/mi-turno` | El cliente ve su turno |

---

## Calendar-FE — no (en el MVP)

- `/` home de Oasis (hero, catálogo del spa)
- `/admin/crm`, `/admin/marketing`, `/admin/whatsapp` (QR Baileys)
- `/admin/promociones` y `/admin/paquetes` (salvo un cupón mínimo si no pesa)
- `/admin/lista-espera`, `/admin/auditoria`
- Cualquier copy o SEO de “Oasis MultiSpa” como producto

---

## Prototipo TurnoYa — sí

Sirve para no rediseñar de memoria. Las pantallas se **reimplementan** hablando con la API real.

- Mapa + listado + search → ficha
- Flujo de 3 roles (cliente / dueño / ops mínimo)
- Ideas de seña, hold 15 min, “ya pagué”
- Recorte de [MVP.md](./MVP.md): qué entra y qué queda dormido
- Estética / copy si quieren que el marketplace se sienta así

---

## Prototipo TurnoYa — no

- Subir el HTML estático a producción como sistema
- `localStorage` como base de datos
- Planes Calle–Red, Destacado, Ops grande, CRM, ARCA, canvas drag & zoom
- Bot y pagos mock como si fueran la integración final

Eso **no se borra** del prototipo. Se prende después.

---

## Cómo queda el armado

```
Calendar-BE (núcleo)  →  + Local  →  MP por dueño  →  WhatsApp Cloud API
Calendar-FE (admin + reservar + pago)  →  backoffice y checkout
Prototipo (mapa / ficha)  →  páginas nuevas de descubrimiento
```

Oasis puede ser el **primer local** de prueba. No es el producto.

---

## Las tres cosas que no hay que hacer

1. **Nest + Next de cero** — se reescribe disponibilidad y MP que ya existen.
2. **Calendar sin `Local`** — el segundo negocio rompe todo; el bot sigue siendo QR baneable.
3. **Prototipo a producción** — no hay API, ni MP del dueño, ni WhatsApp oficial.
