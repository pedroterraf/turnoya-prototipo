# TurnoYa — prototipo UI

Flujo clickeable, sin tocar Calendar-FE ni Calendar-BE. Datos en `localStorage` (las pestañas del mismo navegador se ven).

## Cliente

1. [Mapa](http://localhost:3456/) — geo + search + pines + próximo horario real
2. Pin → [ficha](http://localhost:3456/ficha.html?id=oasis) — banner, cards, mapa, recomendaciones, turnos de ese local
3. Slot → hold 15 min (reloj) → login OTP `123456` solo si hace falta → perfil → confirmar → Mercado Pago (tarjeta mock + se puede simular un fallo). El calendario arranca hoy y se puede pasar de semana.
4. Si el hold vence, el horario se libera y volvés al calendario
5. [Mis turnos](http://localhost:3456/mi-turno.html) — reprogramar, arrepentimiento (10 días) o cancelación del local (48 h)
6. [Avisos](http://localhost:3456/avisos.html) — mail / WhatsApp mock de reserva, cancelación y concreción

Códigos de demo: mail `123456` · WhatsApp `0000`.

## Backoffice del local

- [Login dueño](http://localhost:3456/bo-login.html?id=oasis) — OTP `123456`
- [Agenda](http://localhost:3456/bo-agenda.html?id=oasis) — concretó / no vino / cancelar / reprogramar
- [Hub](http://localhost:3456/bo.html?id=oasis) — selector de local
- [Servicios](http://localhost:3456/bo-servicios.html?id=oasis) — horario, precio, capacidad, descripción e incluye
- [Cupones](http://localhost:3456/bo-cupones.html?id=oasis) — RELAX10 en Oasis
- [Soporte](http://localhost:3456/bo-soporte.html?id=oasis) — WhatsApp / mail y bandeja (hay una consulta seed)
- [Landing](http://localhost:3456/bo-landing.html?id=oasis) — canvas drag + zoom, 1440×480 / 1080×720
- [Pagos](http://localhost:3456/bo-pagos.html?id=oasis) — seña, Mercado Pago conectado, horario por día, política
- [Textos](http://localhost:3456/negocio-resenas.html?id=oasis) — no se anuncia curaduría en público
- [Alta](http://localhost:3456/alta.html) — queda en revisión hasta que Ops apruebe; MP arranca desconectado

## Ops (plataforma)

- [Login](http://localhost:3456/ops-login.html) — `ops@turnoya.com` / `123456`
- [Altas](http://localhost:3456/ops-altas.html) — aprobar / pedir datos / rechazar
- [Locales](http://localhost:3456/ops-locales.html) — destacar, plan, suspender
- [Dinero](http://localhost:3456/ops-dinero.html) — señas, no-show, reembolsos

## Guía

[Recorrido de 3 roles](http://localhost:3456/recorrido.html)

## Cómo abrir

```
npx --yes serve . -l 3456
```

`serve.json` deja `cleanUrls: false`. Si no, `serve` reescribe `ficha.html?id=estudio` a `/ficha` y pierde el query.
