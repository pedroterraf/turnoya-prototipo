# TurnoYa — prototipo UI

Flujo clickeable, sin tocar Calendar-FE ni Calendar-BE.

## Cliente

1. [Mapa](http://localhost:3456/) — geo + search + pines
2. Pin → [ficha](http://localhost:3456/ficha.html?id=oasis) — banner, cards, mapa, recomendaciones, turnos de ese local
3. Slot → hold 15 min (reloj) → login OTP `123456` solo si hace falta → perfil → confirmar → Mercado Pago
4. Si el hold vence, el horario se libera y volvés al calendario
5. [Mis turnos](http://localhost:3456/mi-turno.html) — todos los locales; arrepentimiento (10 días) o cancelación del local (48 h)

Códigos de demo: mail `123456` · WhatsApp `0000`.

## Backoffice del local

- [Login dueño](http://localhost:3456/bo-login.html?id=oasis) — OTP `123456`
- [Agenda](http://localhost:3456/bo-agenda.html?id=oasis) — concretó / no vino / cancelar / reprogramar
- [Hub](http://localhost:3456/bo.html?id=oasis) — selector de local
- [Servicios](http://localhost:3456/bo-servicios.html?id=oasis) — capacidad 1 / N / 0 (no ocupa silla)
- [Landing](http://localhost:3456/bo-landing.html?id=oasis) — canvas drag + zoom, 1440×480 / 1080×720
- [Pagos](http://localhost:3456/bo-pagos.html?id=oasis) — mínimo $3000 default, %, entero, sin seña + política
- [Textos](http://localhost:3456/negocio-resenas.html?id=oasis) — no se anuncia curaduría en público
- [Alta](http://localhost:3456/alta.html) — crea un local y abre su BO

## Cómo abrir

```
npx --yes serve . -l 3456
```

`serve.json` deja `cleanUrls: false`. Si no, `serve` reescribe `ficha.html?id=estudio` a `/ficha` y pierde el query.
