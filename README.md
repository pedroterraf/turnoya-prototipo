# TurnoYa — prototipo

Sitio estático para recorrer el producto. No es Calendar-FE/BE. Los datos viven en el navegador (`localStorage`): las pestañas del mismo Chrome se ven entre sí. Lo que hagas vos no lo ve tu colega en otra máquina, y al borrar datos del sitio se resetea.

## Cómo entrar

[https://pedroterraf.github.io/turnoya-prototipo/](https://pedroterraf.github.io/turnoya-prototipo/)

Códigos de demo: mail **123456** · WhatsApp **0000** · dueño `oasis@turnoya.com` · ops `ops@turnoya.com`.

Guía de 3 roles: [recorrido.html](./recorrido.html).

## Recorrido

1. [Mapa](./index.html) — buscá un servicio, abrí un pin. El “próximo” es un horario libre real.
2. [Oasis](./ficha.html?id=oasis) — servicios (horario, incluye, capacidad), cupones, soporte WhatsApp/mail.
3. Reservá un horario (se retiene 15 min) → login → perfil (WhatsApp 0000 en 4 casillas) → seña Mercado Pago. Se puede simular un pago fallido y reintentar.
4. [Mis turnos](./mi-turno.html) — reprogramar, arrepentimiento / devolución.
5. [Avisos](./avisos.html) — mail y WhatsApp mock.
6. [Dueño](./bo-login.html?id=oasis) → [Agenda](./bo-agenda.html?id=oasis) — concretó / no vino / reprogramar. [Pagos](./bo-pagos.html?id=oasis) — horario por día y Mercado Pago.
7. Si el dueño marca **Concretó** en el turno de Pedro (`pedroterraf@gmail.com`), ese cliente puede calificar.

8. [Ops](./ops-login.html) — altas (hay un “Spa Nueva Córdoba” en cola), destacar/suspender, dinero de todos los locales.

También: [alta de un local](./alta.html) y [landing para negocios](./negocios.html). El alta no publica el pin hasta que Ops apruebe. Mercado Pago arranca desconectado en un alta nueva.

## En tu máquina

```
npx --yes serve . -l 3456
```
