function crmSetupHtml(placeId, pixel) {
  const ficha = placePublicUrl(placeId);
  const ready = Boolean(pixel.enabled && pixel.pixelId);
  return `<section class="crm-setup">
    <h3 class="ficha-sub">Cómo medir con Meta</h3>
    <p class="band-lead">Son copiar y pegar. En el prototipo no se pega el script real: queda el log de lo que se habría disparado.</p>
    <ol class="setup-steps">
      <li class="setup-step">
        <div class="setup-step-head"><span class="setup-badge">1</span><strong>URL de tu ficha para el anuncio</strong></div>
        <p class="meta">Este es el link que va en el anuncio de Meta. Cuando alguien toca, cae a tu ficha de TurnoYa.</p>
        <div class="copy-field">
          <code>${ficha}</code>
          <button class="btn btn-ghost" type="button" data-copy="${ficha}">Copiar</button>
        </div>
      </li>
      <li class="setup-step">
        <div class="setup-step-head"><span class="setup-badge">2</span><strong>Pixel ID y token</strong></div>
        <p class="meta">Los sacás del Administrador de eventos de Meta, en Origen de datos. El token es de la Conversions API del mismo Pixel.</p>
        <form id="pixel" class="pixel-form">
          <label class="pixel-switch">
            <input type="checkbox" name="on" ${pixel.enabled ? "checked" : ""} />
            <span>Pixel activo</span>
          </label>
          <label>Pixel ID
            <input name="pixelId" value="${pixel.pixelId || ""}" inputmode="numeric" placeholder="1234567890123456" />
          </label>
          <label>Token CAPI
            <input name="capiToken" type="password" value="${pixel.capiToken || ""}" autocomplete="new-password" placeholder="Token de Conversions API" />
          </label>
          <button class="btn btn-enamel" type="submit">Guardar Pixel</button>
        </form>
        <p class="setup-note ${ready ? "is-ok" : "is-warn"}">${
          ready
            ? "Pixel y token cargados. Los eventos quedan en el log de abajo."
            : "Falta el Pixel ID o no está activo. La ficha funciona igual, pero Meta no recibiría eventos."
        }</p>
      </li>
      <li class="setup-step">
        <div class="setup-step-head"><span class="setup-badge">3</span><strong>Eventos que le mandamos a Meta</strong></div>
        ${pixelFunnelListHtml()}
      </li>
    </ol>
  </section>`;
}

function crmBoardHtml(placeId, rows, openMail) {
  return `<div class="crm-board">
    ${CRM_STATUS_ORDER.map((status) => {
      const list = rows.filter((row) => row.status === status);
      return `<section class="crm-col">
        <h3 class="crm-col-title">${CRM_STATUS_LABELS[status]} <em>${list.length}</em></h3>
        ${
          list.length
            ? list
                .map(
                  (row) => `<article class="crm-card${row.email === openMail ? " is-on" : ""}">
                    <strong>${row.nombre}</strong>
                    <p class="meta">${row.visits} visitas · ${money(row.spent)}${row.tag ? ` · ${row.tag}` : ""}</p>
                    <div class="crm-card-actions">
                      <a class="btn-line" href="./bo-crm.html?id=${placeId}&mail=${encodeURIComponent(row.email)}">Ver</a>
                      ${CRM_STATUS_MOVES[status]
                        .map(
                          (next) =>
                            `<button class="btn btn-ghost" type="button" data-move="${row.email}" data-status="${next}">${CRM_STATUS_LABELS[next]}</button>`,
                        )
                        .join("")}
                    </div>
                  </article>`,
                )
                .join("")
            : "<p class=\"meta\">Vacío</p>"
        }
      </section>`;
    }).join("")}
  </div>`;
}

function crmDetailHtml(placeId, row) {
  if (!row) return "";
  return `<section class="bo-panel crm-detail">
    <h3 class="ficha-sub">${row.nombre}</h3>
    <p class="meta">${row.email}${row.phone ? ` · ${row.phone}` : ""} · ${CRM_STATUS_LABELS[row.status]}</p>
    <form id="note" class="review-form">
      <label>Tag <input name="tag" value="${row.tag}" placeholder="VIP" /></label>
      <label>Nota <input name="note" value="${row.note}" /></label>
      <button class="btn btn-ticket" type="submit">Guardar ficha</button>
    </form>
    <h4 class="ficha-sub">Historial en este local</h4>
    ${row.turnos
      .map(
        (turno) =>
          `<p class="meta">${String(turno.slot).replace("T", " ")} · ${turno.serviceName} · ${estadoLabel(
            turno.estado,
          )}</p>`,
      )
      .join("")}
  </section>`;
}

function paintCrmPage(root, placeId) {
  const place = findPlace(placeId);
  const pixel = placePixel(placeId);
  const events = pixelLog(placeId);
  const rows = placeCrmRows(placeId);
  const summary = placeCrmSummary(placeId);
  const open = new URLSearchParams(location.search).get("mail");
  const selected = rows.find((row) => row.email === open);
  seedPlaceAgenda(placeId);
  root.innerHTML = `
    <h2>CRM de ${place.name}</h2>
    <p class="band-lead">Embudo del local: reserva → visita → recurrente. Cada dueño ve solo sus clientes.</p>
    <div class="ops-stats">
      <div class="ops-stat"><b>${summary.contacts}</b><span class="meta">Clientes</span></div>
      <div class="ops-stat"><b>${summary.newContacts}</b><span class="meta">Nuevos</span></div>
      <div class="ops-stat"><b>${summary.firstVisit}</b><span class="meta">Primera visita</span></div>
      <div class="ops-stat"><b>${summary.recurring}</b><span class="meta">Recurrentes</span></div>
      <div class="ops-stat"><b>${summary.lost}</b><span class="meta">Perdidos</span></div>
      <div class="ops-stat"><b>${money(summary.spent)}</b><span class="meta">Gastado</span></div>
      <div class="ops-stat"><b>${money(summary.ticket)}</b><span class="meta">Ticket promedio</span></div>
      <div class="ops-stat"><b>${summary.conversion}%</b><span class="meta">Reserva → concretado</span></div>
    </div>
    ${crmBoardHtml(placeId, rows, open)}
    ${crmDetailHtml(placeId, selected)}
    ${crmSetupHtml(placeId, pixel)}
    <h3 class="ficha-sub">Eventos que se habrían disparado</h3>
    ${
      events.length
        ? events
            .slice(0, 8)
            .map(
              (row) =>
                `<p class="meta">${row.event} · ${new Date(row.at).toLocaleString("es-AR")} · ${row.pixelId}</p>`,
            )
            .join("")
        : "<p class=\"meta\">Todavía no hay eventos. Se disparan al reservar, pagar o concretar.</p>"
    }
  `;
  document.getElementById("pixel").addEventListener("submit", (event) => {
    event.preventDefault();
    const data = new FormData(event.target);
    savePlacePixel(placeId, {
      enabled: data.get("on") === "on",
      pixelId: String(data.get("pixelId") || "").trim(),
      capiToken: String(data.get("capiToken") || "").trim(),
    });
    paintCrmPage(root, placeId);
  });
  const note = document.getElementById("note");
  if (note && selected) {
    note.addEventListener("submit", (event) => {
      event.preventDefault();
      const data = Object.fromEntries(new FormData(note));
      saveCrmNote(placeId, selected.email, { tag: data.tag, note: data.note });
      paintCrmPage(root, placeId);
    });
  }
  root.querySelectorAll("[data-move]").forEach((button) => {
    button.addEventListener("click", () => {
      saveCrmNote(placeId, button.dataset.move, { status: button.dataset.status });
      paintCrmPage(root, placeId);
    });
  });
  root.querySelectorAll("[data-copy]").forEach((button) => {
    button.addEventListener("click", async () => {
      try {
        await navigator.clipboard.writeText(button.dataset.copy);
        button.textContent = "Copiado";
      } catch {
        button.textContent = "No se pudo copiar";
      }
    });
  });
}
