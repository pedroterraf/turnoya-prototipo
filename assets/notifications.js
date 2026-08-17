const NOTIFICATION_TITLE_MAX_LENGTH = 100;
const NOTIFICATION_BODY_MAX_LENGTH = 500;
const NOTIFICATION_RETENTION_DAYS = 30;
const NOTIFICATION_STORE = "turnoya-notifications";
const NOTIFICATION_READS_STORE = "turnoya-notification-reads";
const NOTIFICATION_NOTES_MIGRATED = "turnoya-notes-migrated";

const NotificationMetadataType = {
  TURNO: "TURNO",
  PLACE: "PLACE",
  WAITLIST: "WAITLIST",
  INQUIRY: "INQUIRY",
  GENERIC: "GENERIC",
};

function clipNotification(value, max) {
  return String(value || "").trim().slice(0, max);
}

function notificationExpiresAt(from) {
  return Number(from || Date.now()) + NOTIFICATION_RETENTION_DAYS * 24 * 60 * 60 * 1000;
}

function placeOwnerEmail(placeId) {
  if (!placeId) return "";
  if (placeId === "oasis") return "oasis@turnoya.com";
  return `hola@${placeId}.com`;
}

function loadNotifications() {
  migrateLegacyNotes();
  try {
    const now = Date.now();
    const rows = JSON.parse(memoryGet(NOTIFICATION_STORE) ?? "[]").filter(
      (row) => !row.expiresAt || row.expiresAt > now,
    );
    return rows;
  } catch {
    return [];
  }
}

function saveNotifications(rows) {
  memorySet(NOTIFICATION_STORE, JSON.stringify(rows.slice(0, 200)));
}

function loadNotificationReads() {
  try {
    return JSON.parse(memoryGet(NOTIFICATION_READS_STORE) ?? "[]");
  } catch {
    return [];
  }
}

function saveNotificationReads(rows) {
  memorySet(NOTIFICATION_READS_STORE, JSON.stringify(rows.slice(0, 400)));
}

function migrateLegacyNotes() {
  if (memoryGet(NOTIFICATION_NOTES_MIGRATED)) return;
  const existing = (() => {
    try {
      return JSON.parse(memoryGet(NOTIFICATION_STORE) ?? "[]");
    } catch {
      return [];
    }
  })();
  Object.keys(localStorage).forEach((key) => {
    if (!key.startsWith("turnoya-notes-")) return;
    const userKey = key.slice("turnoya-notes-".length);
    let notes = [];
    try {
      notes = JSON.parse(localStorage.getItem(key) ?? "[]");
    } catch {
      notes = [];
    }
    notes.forEach((note) => {
      if (existing.some((row) => row.id === note.id)) return;
      existing.push({
        id: note.id || `n-${note.at || Date.now()}`,
        title: "Aviso",
        body: clipNotification(note.text, NOTIFICATION_BODY_MAX_LENGTH),
        metadata: { type: NotificationMetadataType.GENERIC },
        userKey,
        createdAt: note.at || Date.now(),
        expiresAt: notificationExpiresAt(note.at),
      });
    });
  });
  existing.sort((a, b) => b.createdAt - a.createdAt);
  memorySet(NOTIFICATION_STORE, JSON.stringify(existing.slice(0, 200)));
  memorySet(NOTIFICATION_NOTES_MIGRATED, "1");
}

function createNotification(payload) {
  const userKey = String(payload.userKey || "").trim().toLowerCase();
  const title = clipNotification(payload.title, NOTIFICATION_TITLE_MAX_LENGTH);
  const body = clipNotification(payload.body, NOTIFICATION_BODY_MAX_LENGTH);
  if (!userKey || !title || !body) return null;
  const createdAt = payload.createdAt || Date.now();
  const row = {
    id: payload.id || `n-${createdAt}-${Math.random().toString(36).slice(2, 7)}`,
    title,
    body,
    metadata: payload.metadata || { type: NotificationMetadataType.GENERIC },
    userKey,
    createdAt,
    expiresAt: payload.expiresAt || notificationExpiresAt(createdAt),
  };
  const rows = loadNotifications().filter((item) => item.id !== row.id);
  rows.unshift(row);
  saveNotifications(rows);
  memorySet("turnoya-notify-ping", JSON.stringify({ id: row.id, userKey, at: createdAt }));
  try {
    window.dispatchEvent(new CustomEvent("turnoya-notify", { detail: row }));
  } catch {
    /* ignore */
  }
  return row;
}

function isNotificationRead(id, userKey) {
  const key = String(userKey || "").toLowerCase();
  return loadNotificationReads().some(
    (row) => row.notificationId === id && row.userKey === key,
  );
}

function mapUserNotification(row, userKey) {
  return {
    id: String(row.id),
    title: row.title,
    body: row.body,
    metadata: row.metadata || { type: NotificationMetadataType.GENERIC },
    createdAt: row.createdAt,
    isRead: isNotificationRead(row.id, userKey),
  };
}

function findMyNotifications(userKey) {
  const key = String(userKey || "").toLowerCase();
  if (!key) return [];
  return loadNotifications()
    .filter((row) => row.userKey === key)
    .sort((a, b) => b.createdAt - a.createdAt)
    .map((row) => mapUserNotification(row, key));
}

function unreadCount(userKey) {
  return findMyNotifications(userKey).filter((row) => !row.isRead).length;
}

function setReadState(id, userKey, isRead) {
  const key = String(userKey || "").toLowerCase();
  const mine = loadNotifications().some((row) => row.id === id && row.userKey === key);
  if (!mine) return { isRead: false };
  const reads = loadNotificationReads().filter(
    (row) => !(row.notificationId === id && row.userKey === key),
  );
  if (isRead) {
    reads.push({ notificationId: id, userKey: key, readAt: Date.now() });
  }
  saveNotificationReads(reads);
  return { isRead: Boolean(isRead) };
}

function markAllRead(userKey) {
  const key = String(userKey || "").toLowerCase();
  const unread = findMyNotifications(key).filter((row) => !row.isRead);
  const reads = loadNotificationReads();
  unread.forEach((row) => {
    reads.push({ notificationId: row.id, userKey: key, readAt: Date.now() });
  });
  saveNotificationReads(reads);
  return { markedCount: unread.length };
}

function notificationHref(notification) {
  const meta = notification?.metadata || {};
  if (meta.type === NotificationMetadataType.TURNO) {
    return meta.turnoId ? `./mi-turno.html#turno-${meta.turnoId}` : "./mi-turno.html";
  }
  if (meta.type === NotificationMetadataType.PLACE && meta.placeId) {
    return `./ficha.html?id=${meta.placeId}`;
  }
  if (meta.type === NotificationMetadataType.WAITLIST && meta.placeId) {
    const query = new URLSearchParams({ id: meta.placeId });
    if (meta.serviceId) query.set("service", meta.serviceId);
    return `./reservar.html?${query}`;
  }
  if (meta.type === NotificationMetadataType.INQUIRY && meta.placeId) {
    return `./bo-soporte.html?id=${meta.placeId}`;
  }
  return "";
}

function notifyUser(userKey, title, body, metadata) {
  return createNotification({ userKey, title, body, metadata });
}

function notifyPlaceOwner(placeId, title, body, metadata) {
  const userKey = placeOwnerEmail(placeId);
  if (!userKey) return null;
  return createNotification({
    userKey,
    title,
    body,
    metadata: { ...(metadata || { type: NotificationMetadataType.PLACE }), placeId },
  });
}

function userNotes(email) {
  return findMyNotifications(email);
}

function pushNote(email, text, metadata) {
  return notifyUser(email, "Aviso", text, metadata || { type: NotificationMetadataType.GENERIC });
}

function placeNotes(placeId) {
  try {
    return JSON.parse(memoryGet(`turnoya-bo-notes-${placeId}`) ?? "[]");
  } catch {
    return [];
  }
}

function pushPlaceNote(placeId, text) {
  if (!placeId) return;
  const rows = placeNotes(placeId);
  rows.unshift({ id: `bn-${Date.now()}`, text, at: Date.now() });
  memorySet(`turnoya-bo-notes-${placeId}`, JSON.stringify(rows.slice(0, 24)));
}
