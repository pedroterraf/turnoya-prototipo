const GEO_TREE = {
  Argentina: {
    "Buenos Aires": [
      "La Plata",
      "Mar del Plata",
      "Bahía Blanca",
      "Tandil",
      "Pilar",
      "Tigre",
      "Quilmes",
      "San Isidro",
      "Vicente López",
      "Morón",
      "Lomas de Zamora",
      "Lanús",
      "Avellaneda",
      "Merlo",
      "Moreno",
      "San Miguel",
      "Escobar",
      "Zárate",
      "Campana",
      "Luján",
      "Pergamino",
      "Olavarría",
      "Necochea",
      "Junín",
    ],
    CABA: [
      "CABA",
      "Palermo",
      "Belgrano",
      "Recoleta",
      "Caballito",
      "Almagro",
      "Villa Crespo",
      "San Telmo",
      "Puerto Madero",
      "Núñez",
      "Colegiales",
      "Villa Urquiza",
      "Flores",
      "Boedo",
      "Retiro",
      "Monserrat",
      "Barracas",
      "La Boca",
      "Villa Devoto",
      "Chacarita",
    ],
    Catamarca: ["San Fernando del Valle de Catamarca", "Belén", "Andalgalá", "Tinogasta"],
    Chaco: ["Resistencia", "Presidencia Roque Sáenz Peña", "Villa Ángela", "Barranqueras"],
    "Chubut": ["Rawson", "Trelew", "Puerto Madryn", "Comodoro Rivadavia", "Esquel"],
    Córdoba: [
      "Córdoba",
      "Villa Carlos Paz",
      "Río Cuarto",
      "Villa María",
      "San Francisco",
      "Jesús María",
      "Alta Gracia",
      "Cosquín",
      "La Falda",
      "Bell Ville",
      "Río Tercero",
      "Villa Dolores",
      "Cruz del Eje",
      "Villa Allende",
      "Unquillo",
    ],
    Corrientes: ["Corrientes", "Goya", "Paso de los Libres", "Mercedes"],
    "Entre Ríos": ["Paraná", "Concordia", "Gualeguaychú", "Concepción del Uruguay"],
    Formosa: ["Formosa", "Clorinda", "Pirané"],
    Jujuy: ["San Salvador de Jujuy", "Palpalá", "San Pedro", "Libertador General San Martín"],
    "La Pampa": ["Santa Rosa", "General Pico", "Toay"],
    "La Rioja": ["La Rioja", "Chilecito", "Chamical"],
    Mendoza: ["Mendoza", "San Rafael", "Godoy Cruz", "Guaymallén", "Luján de Cuyo", "Maipú", "Tunuyán"],
    Misiones: ["Posadas", "Oberá", "Eldorado", "Puerto Iguazú"],
    Neuquén: ["Neuquén", "Cutral Có", "Zapala", "San Martín de los Andes", "Villa La Angostura"],
    "Río Negro": ["Viedma", "Bariloche", "General Roca", "Cipolletti", "Allen"],
    Salta: ["Salta", "Orán", "Tartagal", "Metán", "Cafayate"],
    "San Juan": ["San Juan", "Rawson", "Rivadavia", "Chimbas"],
    "San Luis": ["San Luis", "Villa Mercedes", "Merlo"],
    "Santa Cruz": ["Río Gallegos", "Caleta Olivia", "El Calafate", "Pico Truncado"],
    "Santa Fe": [
      "Rosario",
      "Santa Fe",
      "Rafaela",
      "Venado Tuerto",
      "Reconquista",
      "Santo Tomé",
      "Villa Gobernador Gálvez",
      "San Lorenzo",
      "Esperanza",
    ],
    "Santiago del Estero": ["Santiago del Estero", "La Banda", "Termas de Río Hondo"],
    "Tierra del Fuego": ["Ushuaia", "Río Grande", "Tolhuin"],
    Tucumán: ["San Miguel de Tucumán", "Yerba Buena", "Tafí Viejo", "Concepción", "Aguilares"],
  },
  Bolivia: {
    "La Paz": ["La Paz", "El Alto"],
    "Santa Cruz": ["Santa Cruz de la Sierra"],
    Cochabamba: ["Cochabamba"],
    Chuquisaca: ["Sucre"],
  },
  Brasil: {
    "São Paulo": ["São Paulo", "Campinas"],
    "Rio de Janeiro": ["Rio de Janeiro"],
    "Rio Grande do Sul": ["Porto Alegre"],
    Paraná: ["Curitiba"],
    "Santa Catarina": ["Florianópolis"],
    "Minas Gerais": ["Belo Horizonte"],
    "Distrito Federal": ["Brasília"],
  },
  Chile: {
    "Región Metropolitana": ["Santiago"],
    Valparaíso: ["Valparaíso", "Viña del Mar"],
    Biobío: ["Concepción"],
    "Coquimbo": ["La Serena"],
    Antofagasta: ["Antofagasta"],
    Araucanía: ["Temuco"],
    "Los Lagos": ["Puerto Montt"],
  },
  Colombia: {
    "Cundinamarca": ["Bogotá"],
    Antioquia: ["Medellín"],
    "Valle del Cauca": ["Cali"],
    Atlántico: ["Barranquilla"],
    Bolívar: ["Cartagena"],
  },
  España: {
    Madrid: ["Madrid"],
    Cataluña: ["Barcelona"],
    "Comunidad Valenciana": ["Valencia"],
    Andalucía: ["Sevilla", "Málaga"],
    "País Vasco": ["Bilbao"],
  },
  México: {
    "Ciudad de México": ["Ciudad de México"],
    Jalisco: ["Guadalajara"],
    "Nuevo León": ["Monterrey"],
    Puebla: ["Puebla"],
    Quintana Roo: ["Cancún"],
  },
  Paraguay: {
    Asunción: ["Asunción"],
    "Alto Paraná": ["Ciudad del Este"],
    Itapúa: ["Encarnación"],
    Central: ["Luque", "San Lorenzo"],
  },
  Perú: {
    Lima: ["Lima"],
    Arequipa: ["Arequipa"],
    Cusco: ["Cusco"],
    "La Libertad": ["Trujillo"],
  },
  Uruguay: {
    Montevideo: ["Montevideo"],
    Canelones: ["Canelones", "Ciudad de la Costa"],
    Maldonado: ["Maldonado", "Punta del Este"],
    Colonia: ["Colonia del Sacramento"],
    Salto: ["Salto"],
    Paysandú: ["Paysandú"],
  },
};

function foldText(value) {
  return String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

function geoCountries() {
  return Object.keys(GEO_TREE);
}

function geoProvinces(country) {
  const node = GEO_TREE[country];
  return node ? Object.keys(node) : [];
}

function geoCities(country, province) {
  return GEO_TREE[country]?.[province] ? [...GEO_TREE[country][province]] : [];
}

function withCurrentValue(options, value) {
  if (!value || options.includes(value)) return options;
  return [value, ...options];
}

function closeSearchSelects(except) {
  document.querySelectorAll(".search-select.is-open").forEach((node) => {
    if (node !== except) node.dispatchEvent(new CustomEvent("search-select-close"));
  });
}

function mountSearchSelect(host, config) {
  const name = config.name;
  const required = config.required !== false;
  const placeholder = config.placeholder || "Escribí o elegí";
  const emptyText = config.emptyText || "No hay coincidencias";
  const emptyParent = config.emptyParent || "Elegí el campo anterior";
  let options = [...(config.options || [])];
  let value = config.value || "";
  let onChange = config.onChange || null;
  let open = false;
  let activeIndex = -1;

  host.classList.add("search-select");
  host.innerHTML = `
    <input class="search-select-query" type="search" role="combobox" autocomplete="off"
      aria-expanded="false" aria-autocomplete="list" placeholder="${placeholder}" ${
        required ? "required" : ""
      } />
    <input type="hidden" name="${name}" value="${value}" />
    <ul class="search-select-list" role="listbox" hidden></ul>
  `;
  const query = host.querySelector(".search-select-query");
  const hidden = host.querySelector(`input[name="${name}"]`);
  const list = host.querySelector(".search-select-list");

  function selectedLabel() {
    return value || "";
  }

  function filtered() {
    const needle = foldText(query.value);
    if (!open) return options;
    if (!needle || foldText(selectedLabel()) === needle) return options;
    return options.filter((item) => foldText(item).includes(needle));
  }

  function paintList() {
    const rows = filtered();
    if (!rows.length) {
      list.innerHTML = `<li class="search-select-empty">${
        options.length ? emptyText : emptyParent
      }</li>`;
      return;
    }
    list.innerHTML = rows
      .map((item, index) => {
        const on = item === value ? " is-on" : "";
        const active = index === activeIndex ? " is-active" : "";
        return `<li class="search-select-option${on}${active}" role="option" data-value="${item}">${item}</li>`;
      })
      .join("");
  }

  function setOpen(next) {
    open = next;
    host.classList.toggle("is-open", open);
    query.setAttribute("aria-expanded", open ? "true" : "false");
    list.hidden = !open;
    if (open) {
      closeSearchSelects(host);
      activeIndex = Math.max(0, filtered().indexOf(value));
      paintList();
      bindList();
      query.select();
    } else {
      query.value = selectedLabel();
      activeIndex = -1;
    }
  }

  function pick(next) {
    if (!options.includes(next)) return;
    const changed = next !== value;
    value = next;
    hidden.value = next;
    query.value = next;
    setOpen(false);
    if (changed && onChange) onChange(next);
  }

  function bindList() {
    list.querySelectorAll("[data-value]").forEach((item) => {
      item.addEventListener("mousedown", (event) => {
        event.preventDefault();
        pick(item.dataset.value);
      });
    });
  }

  const paintAndBind = () => {
    paintList();
    bindList();
  };

  query.value = selectedLabel();
  query.addEventListener("focus", () => setOpen(true));
  query.addEventListener("click", () => setOpen(true));
  query.addEventListener("input", () => {
    if (!query.value.trim()) {
      value = "";
      hidden.value = "";
    }
    if (!open) setOpen(true);
    activeIndex = 0;
    paintAndBind();
  });
  query.addEventListener("blur", () => {
    const match = options.find((item) => foldText(item) === foldText(query.value));
    if (match) {
      pick(match);
      return;
    }
    setOpen(false);
  });
  query.addEventListener("keydown", (event) => {
    const rows = filtered();
    if (event.key === "ArrowDown") {
      event.preventDefault();
      if (!open) setOpen(true);
      activeIndex = Math.min(rows.length - 1, activeIndex + 1);
      paintAndBind();
      return;
    }
    if (event.key === "ArrowUp") {
      event.preventDefault();
      activeIndex = Math.max(0, activeIndex - 1);
      paintAndBind();
      return;
    }
    if (event.key === "Enter") {
      if (!open) return;
      event.preventDefault();
      const choice = rows[activeIndex] || rows[0];
      if (choice) pick(choice);
      return;
    }
    if (event.key === "Escape") {
      setOpen(false);
      query.blur();
    }
  });
  host.addEventListener("search-select-close", () => setOpen(false));

  return {
    getValue: () => value,
    setValue(next) {
      value = options.includes(next) ? next : "";
      hidden.value = value;
      query.value = value;
    },
    setOptions(next, keep) {
      options = [...next];
      if (keep && value && !options.includes(value)) options = withCurrentValue(options, value);
      if (value && !options.includes(value)) {
        value = "";
        hidden.value = "";
        query.value = "";
      }
      if (open) paintAndBind();
    },
    setEnabled(enabled) {
      query.disabled = !enabled;
      host.classList.toggle("is-off", !enabled);
    },
  };
}

function bindGeoSelects(form, initial) {
  const paisHost = form.querySelector("[data-search-select=pais]");
  const provinciaHost = form.querySelector("[data-search-select=provincia]");
  const ciudadHost = form.querySelector("[data-search-select=ciudad]");
  if (!paisHost || !provinciaHost || !ciudadHost) return;

  const startCountry = initial.pais && GEO_TREE[initial.pais] ? initial.pais : "Argentina";
  const startProvince = withCurrentValue(geoProvinces(startCountry), initial.provincia).includes(
    initial.provincia,
  )
    ? initial.provincia
    : "";
  const startCity = withCurrentValue(geoCities(startCountry, startProvince), initial.ciudad).includes(
    initial.ciudad,
  )
    ? initial.ciudad
    : "";

  let pais;
  const ciudad = mountSearchSelect(ciudadHost, {
    name: "ciudad",
    options: withCurrentValue(geoCities(startCountry, startProvince), startCity),
    value: startCity,
    placeholder: "Escribí o elegí la ciudad",
    emptyParent: "Elegí una provincia",
  });
  const provincia = mountSearchSelect(provinciaHost, {
    name: "provincia",
    options: withCurrentValue(geoProvinces(startCountry), startProvince),
    value: startProvince,
    placeholder: "Escribí o elegí la provincia",
    emptyParent: "Elegí un país",
    onChange: (next) => {
      ciudad.setOptions(geoCities(pais.getValue(), next));
      ciudad.setValue("");
    },
  });
  pais = mountSearchSelect(paisHost, {
    name: "pais",
    options: geoCountries(),
    value: startCountry,
    placeholder: "Escribí o elegí el país",
    onChange: (next) => {
      provincia.setOptions(geoProvinces(next));
      provincia.setValue("");
      ciudad.setOptions([]);
      ciudad.setValue("");
    },
  });
}

if (!window.__searchSelectDoc) {
  window.__searchSelectDoc = true;
  document.addEventListener("click", (event) => {
    if (event.target.closest(".search-select")) return;
    closeSearchSelects(null);
  });
}
