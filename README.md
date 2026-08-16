# TurnoYa — prototipo

Sitio estático para recorrer el producto. No es Calendar-FE/BE. Los datos viven en el navegador (`sessionStorage`): lo que hagas vos no lo ve tu colega, y al borrar datos del sitio se resetea.

## Cómo entrar

[https://pedroterraf.github.io/turnoya-prototipo/](https://pedroterraf.github.io/turnoya-prototipo/)

Códigos de demo: mail **123456** · WhatsApp **0000** · dueño `oasis@turnoya.com`.

## Recorrido

1. [Mapa](./index.html) — buscá un servicio, abrí un pin.
2. [Oasis](./ficha.html?id=oasis) — banner, cards, mapa, recomendaciones.
3. Reservá un horario (se retiene 15 min) → login → perfil → seña Mercado Pago.
4. [Mis turnos](./mi-turno.html) — arrepentimiento / devolución.
5. [Dueño](./bo-login.html?id=oasis) → [Agenda](./bo-agenda.html?id=oasis) — concretó / no vino / reprogramar.
6. Si el dueño marca **Concretó** en el turno de Pedro (`pedroterraf@gmail.com`), ese cliente puede calificar.

También: [alta de un local](./alta.html) y [landing para negocios](./negocios.html).

## En tu máquina

```
npx --yes serve . -l 3456
```
