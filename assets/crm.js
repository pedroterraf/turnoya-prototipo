function crmSetupHtml(placeId, pixel) {
  const ficha = placePublicUrl(placeId);
  const ready = Boolean(pixel.enabled && pixel.pixelId);
  return `
    <div class="caja-panel" style="margin-top:28px;">
      <div class="caja-panel-head">
        <h3>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="color:var(--enamel);"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
          Seguimiento y Píxel de Meta (Facebook / Instagram Ads)
        </h3>
        <label class="switch-wrap" for="pixel-toggle">
          <input class="switch-input" type="checkbox" id="pixel-toggle" name="on" form="pixel" ${pixel.enabled ? "checked" : ""} />
          <span class="switch-slider"></span>
          <span class="switch-status-pill ${pixel.enabled ? "is-on" : "is-off"}">${pixel.enabled ? "Pixel Activo" : "Pausado"}</span>
        </label>
      </div>

      <div class="caja-callout">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
        <div>
          Copiá la URL de tu ficha pública para ponerla en tus anuncios de Meta. El Píxel y CAPI trackean automáticamente el embudo de conversión: <em>ViewContent → InitiateCheckout → Schedule → Purchase</em>.
        </div>
      </div>

      <div class="pagos-grid-2col">
        <div>
          <label style="font-size:0.85rem; font-weight:700; color:var(--ink); display:block; margin-bottom:6px;">URL de tu ficha para anuncios</label>
          <div class="copy-field" style="margin-bottom:18px;">
            <code style="font-size:0.82rem; overflow:hidden; text-overflow:ellipsis;">${ficha}</code>
            <button class="btn btn-ghost" type="button" data-copy="${ficha}">Copiar</button>
          </div>

          <form id="pixel" class="review-form">
            <div class="arca-field-group" style="margin-bottom:12px;">
              <label>Meta Pixel ID</label>
              <input name="pixelId" value="${pixel.pixelId || ""}" inputmode="numeric" placeholder="Ej. 1234567890123456" />
            </div>
            <div class="arca-field-group" style="margin-bottom:16px;">
              <label>Token Conversions API (CAPI)</label>
              <input name="capiToken" type="password" value="${pixel.capiToken || ""}" autocomplete="new-password" placeholder="Token de acceso CAPI" />
            </div>
            <div style="display:flex; align-items:center; gap:12px;">
              <button class="btn btn-ticket" type="submit" style="min-height:38px; padding:0 20px;">Guardar Píxel</button>
              <span class="meta" style="font-size:0.82rem;">${ready ? "✓ Configuración lista" : "Falta ID"}</span>
            </div>
          </form>
        </div>

        <div>
          <label style="font-size:0.85rem; font-weight:700; color:var(--ink); display:block; margin-bottom:8px;">Eventos estándar que reportamos</label>
          <div style="background:#f8faf9; border:1px solid #e2ece6; border-radius:10px; padding:14px; font-size:0.84rem;">
            ${pixelFunnelListHtml()}
          </div>
        </div>
      </div>
    </div>
  `;
}

function crmBoardHtml(placeId, rows, openMail) {
  return `
    <div style="margin:24px 0 28px;">
      <h3 style="font-family:var(--display); font-size:1.3rem; margin:0 0 14px;">Tablero de clientes por etapa</h3>
      <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(220px, 1fr)); gap:14px;">
        ${CRM_STATUS_ORDER.map((status) => {
          const list = rows.filter((row) => row.status === status);
          return `
            <div style="background:#f8faf9; border:1px solid var(--line); border-radius:12px; padding:14px; display:flex; flex-direction:column; min-height:260px;">
              <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:12px; padding-bottom:8px; border-bottom:1px solid #e9eee9;">
                <strong style="font-size:0.88rem; color:var(--ink);">${CRM_STATUS_LABELS[status]}</strong>
                <span class="caja-badge" style="background:#ffffff; border:1px solid var(--line);">${list.length}</span>
              </div>
              <div style="display:flex; flex-direction:column; gap:10px; flex:1;">
                ${
                  list.length
                    ? list
                        .map((row) => {
                          const isSelected = row.email === openMail;
                          return `
                            <article class="caja-panel" style="margin:0; padding:12px; border-radius:8px; border-color:${isSelected ? "var(--enamel)" : "var(--line)"}; box-shadow:${isSelected ? "0 0 0 2px var(--enamel)" : "0 1px 3px rgba(18,23,20,0.04)"};">
                              <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:4px;">
                                <strong style="font-size:0.92rem; color:var(--ink);">${row.nombre}</strong>
                                ${row.tag ? `<span class="caja-badge" style="background:#fef3c7; color:#92400e; font-size:0.68rem;">${row.tag}</span>` : ""}
                              </div>
                              <p class="meta" style="font-size:0.78rem; margin:0 0 8px;">
                                ${row.visits} ${row.visits === 1 ? "visita" : "visitas"} · <span style="font-weight:700; color:var(--enamel);">${money(row.spent)}</span>
                              </p>
                              <div style="display:flex; gap:6px; flex-wrap:wrap; border-top:1px solid #f1f5f2; padding-top:8px;">
                                <a class="btn btn-ghost" href="./bo-crm.html?id=${placeId}&mail=${encodeURIComponent(row.email)}" style="font-size:0.75rem; padding:3px 8px; min-height:26px;">
                                  Ficha
                                </a>
                                ${CRM_STATUS_MOVES[status]
                                  .map(
                                    (next) => `
                                      <button class="btn btn-ghost" type="button" data-move="${row.email}" data-status="${next}" style="font-size:0.72rem; padding:3px 8px; min-height:26px;">
                                        → ${CRM_STATUS_LABELS[next]}
                                      </button>
                                    `,
                                  )
                                  .join("")}
                              </div>
                            </article>
                          `;
                        })
                        .join("")
                    : `<p class="meta" style="text-align:center; margin:auto 0; font-size:0.8rem;">Sin contactos</p>`
                }
              </div>
            </div>
          `;
        }).join("")}
      </div>
    </div>
  `;
}

function crmDetailHtml(placeId, row) {
  if (!row) return "";
  return `
    <div class="caja-panel" style="margin-bottom:24px; border-left:4px solid var(--enamel);">
      <div class="caja-panel-head">
        <div>
          <h3>Cliente: ${row.nombre}</h3>
          <p class="meta" style="margin:2px 0 0;">${row.email} ${row.phone ? `· ${row.phone}` : ""} · Estado: <strong>${CRM_STATUS_LABELS[row.status]}</strong></p>
        </div>
        <a class="btn btn-ghost" href="./bo-crm.html?id=${placeId}" style="font-size:0.84rem;">✕ Cerrar ficha</a>
      </div>

      <div class="pagos-grid-2col">
        <form id="note" class="review-form">
          <div class="arca-field-group" style="margin-bottom:12px;">
            <label>Etiqueta / Tag</label>
            <input name="tag" value="${row.tag || ""}" placeholder="Ej. VIP, Recomendado, Exigente" />
          </div>
          <div class="arca-field-group" style="margin-bottom:14px;">
            <label>Notas internas del cliente</label>
            <textarea name="note" rows="3" placeholder="Preferencias, alergias, observaciones sobre el servicio...">${row.note || ""}</textarea>
          </div>
          <button class="btn btn-ticket" type="submit" style="min-height:38px;">Guardar nota</button>
        </form>

        <div>
          <h4 style="margin:0 0 8px; font-size:0.95rem;">Historial de turnos en este local</h4>
          <div style="display:flex; flex-direction:column; gap:6px; max-height:180px; overflow-y:auto;">
            ${row.turnos
              .map(
                (t) => `
                  <div style="background:#f8faf9; padding:8px 12px; border-radius:6px; border:1px solid #e2ece6; font-size:0.82rem; display:flex; justify-content:space-between; align-items:center;">
                    <span><strong>${String(t.slot).replace("T", " ")}</strong> · ${t.serviceName}</span>
                    <span class="caja-badge is-${t.estado}">${estadoLabel(t.estado)}</span>
                  </div>
                `,
              )
              .join("")}
          </div>
        </div>
      </div>
    </div>
  `;
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
    <div class="caja-shell">
      <div class="bo-head" style="margin-bottom:20px;">
        <div>
          <h2>CRM de Clientes · ${place.name}</h2>
          <p class="band-lead">Embudo de retención y fidelización de clientes del local: contacto inicial → primera visita → cliente recurrente.</p>
        </div>
      </div>

      <div class="caja-kpi-grid">
        <div class="caja-kpi-card is-primary">
          <div class="caja-kpi-top">
            <span class="caja-kpi-label">Clientes</span>
            <span class="caja-kpi-badge">Base total</span>
          </div>
          <div class="caja-kpi-num">${summary.contacts}</div>
          <div class="caja-kpi-sub">${summary.newContacts} nuevos contactos</div>
        </div>

        <div class="caja-kpi-card">
          <div class="caja-kpi-top">
            <span class="caja-kpi-label">Recurrentes</span>
            <span class="caja-kpi-badge" style="background:#dcfce7; color:#166534;">Fidelizados</span>
          </div>
          <div class="caja-kpi-num">${summary.recurring}</div>
          <div class="caja-kpi-sub">${summary.firstVisit} en primera visita</div>
        </div>

        <div class="caja-kpi-card">
          <div class="caja-kpi-top">
            <span class="caja-kpi-label">Total gastado</span>
            <span class="caja-kpi-badge">LTV Clientes</span>
          </div>
          <div class="caja-kpi-num">${money(summary.spent)}</div>
          <div class="caja-kpi-sub">Ticket promedio: ${money(summary.ticket)}</div>
        </div>

        <div class="caja-kpi-card">
          <div class="caja-kpi-top">
            <span class="caja-kpi-label">Conversión</span>
            <span class="caja-kpi-badge">Efectividad</span>
          </div>
          <div class="caja-kpi-num">${summary.conversion}%</div>
          <div class="caja-kpi-sub">Reserva → visita concretada</div>
        </div>
      </div>

      ${crmDetailHtml(placeId, selected)}
      ${crmBoardHtml(placeId, rows, open)}
      ${crmSetupHtml(placeId, pixel)}

      <div class="caja-panel" style="margin-top:24px;">
        <div class="caja-panel-head">
          <h3>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="color:var(--enamel);"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
            Registro de eventos disparados al Píxel
          </h3>
          <span class="meta">${events.length} eventos</span>
        </div>
        ${
          events.length
            ? `<div style="display:flex; flex-direction:column; gap:6px;">
                ${events
                  .slice(0, 8)
                  .map(
                    (row) => `
                      <div style="background:#fafbfa; border:1px solid #f1f5f2; border-radius:6px; padding:8px 12px; font-size:0.82rem; display:flex; justify-content:space-between;">
                        <span><strong style="color:var(--enamel);">${row.event}</strong> · Píxel ${row.pixelId}</span>
                        <span class="meta">${new Date(row.at).toLocaleTimeString("es-AR")} hs · ${new Date(row.at).toLocaleDateString("es-AR")}</span>
                      </div>
                    `,
                  )
                  .join("")}
              </div>`
            : "<p class=\"meta\" style=\"text-align:center; padding:20px;\">Todavía no hay eventos registrados. Se disparan automáticamente con cada visita, reserva y pago.</p>"
        }
      </div>
    </div>
  `;

  const pixelForm = document.getElementById("pixel");
  if (pixelForm) {
    pixelForm.addEventListener("submit", (event) => {
      event.preventDefault();
      const data = new FormData(pixelForm);
      savePlacePixel(placeId, {
        enabled: document.getElementById("pixel-toggle")?.checked ?? false,
        pixelId: String(data.get("pixelId") || "").trim(),
        capiToken: String(data.get("capiToken") || "").trim(),
      });
      paintCrmPage(root, placeId);
    });
  }

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
        setTimeout(() => { button.textContent = "Copiar"; }, 2000);
      } catch {
        button.textContent = "No se pudo copiar";
      }
    });
  });
}
