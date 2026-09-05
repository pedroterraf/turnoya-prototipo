# Plan de mejora UI — TurnoYa prototipo

Recorrido light/dark (home, login, perfil, mi-turno, ficha, reservar, alta, agenda, servicios, pagos, WhatsApp, landing). Esto queda para la siguiente pasada.

## Ya corregido en esta ronda

- Número pintado de los pasos (1/2/3): ahora usa `--on-accent` y se ve al cambiar de paso.
- Opciones de selects en dark: texto claro sobre menú oscuro; el menú no se estira a todo el header.
- Switch sol/luna con perilla y transición de toda la vista (`View Transitions` + fallback).
- Tema en `localStorage` (`turnoya-theme`) y en el usuario (`darkMode: boolean`).
- Cards de `mi-turno` y ficha: superficie, contraste, links y paginado infinito.
- Filtro de fechas: un solo calendario de rango (primer click + segundo click).
- Calendario: flechas al lado de la fecha; `Siguiente` dentro de la card del horario.
- Home: país + provincia + ciudad; GPS escribe el lugar en perfil.
- Alta del negocio en 3 pasos, servicios por etiquetas, rubro libre.
- Banner: tamaños entre paréntesis y link a Canva / Photopea.

## Pendiente — contraste y superficies

| Vista | Qué está mal | Qué hacer |
| --- | --- | --- |
| Agenda / Feriados | Caja vacía con `background:#fafbfa` inline | Sacar inline; usar `--chalk` / `--line` |
| Servicios | Badges sobre la foto y card “Agregar otro” | Tokens dark para overlay y dashed card |
| Pagos | Labels de `.arca-field-group` y números de seña | Confirmar que el input no herede gris lavado |
| WhatsApp | Página más “light” que el resto | Misma superficie que pagos; toggle visible |
| Login dueño | `btn-enamel` sigue compitiendo con el amarillo de prueba | Primario = ticket; secundario = línea |
| Alta enviada | Botón “Armar el backoffice” | Ya usa `--on-accent`; rechequear en dark |
| Header | “Perfil / Salir” a veces finos | Subir peso a 650 y color `--ink` |

## Pendiente — textos y tipografía

- Unificar `band-lead` a 0.95rem / 1.45 de interlineado.
- Títulos de card (`bo-svc-card-title`, `agenda-card-title`) a 700, nunca gris claro sobre claro.
- Placeholder de búsqueda: `--ink-soft`, no `#999`.
- Footer de prototipo (`mail 123456…`) más chico y con menos ruido.

## Pendiente — botones

- Ghost en dark: borde `--line`, texto `--ink`, no enamel oscuro.
- “Cancelar” del modal mostrador: hoy casi invisible.
- Map HUD `Cerca` / `Seguirme`: mismo radio y misma altura.
- Rail “Ocultar lista”: ya sin radius arriba; en dark no debe quedar un filete blanco.

## Pendiente — contenedores

- Home lista: pasar de filas con divisor a cards de 12–14px de padding.
- Ficha pública: menos vacío a los costados en desktop; grid 2 cols.
- Modal mostrador: radio 16 y padding 20; inputs no “pill” negros.
- Landing banner: el preview verde plano necesita un marco `--line`.

## Pendiente — motion (siguiente agente)

Valores: `420ms cubic-bezier(0.16, 1, 0.3, 1)` enter, `140ms` press.

1. Cards de lista: `riseIn` ya está; limitar delay a 40ms * index, max 6.
2. Modal: `popIn` 220ms; backdrop fade 180ms.
3. Selects: el fade actual está bien; no animar width.
4. No animar el mapa ni el teclado iOS.

## Pendiente — producto

- Counts de tabs (`Lista de turnos 4`, `Feriados (0)`): que el número pinte al filtrar.
- WhatsApp `123123`: persistir al guardar y que el input no se vea “lavado”.
- Infinite scroll también en la lista del home (ahora el rail ya scrollea).
- Dark del mapa: el filtro CSS es provisorio; tiles dark de Carto si se quiere un mapa nativo oscuro.
