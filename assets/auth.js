const OTP_DEMO = "123456";

function currentUser() {
  try {
    return JSON.parse(sessionStorage.getItem("turnoya-user") ?? "null");
  } catch {
    return null;
  }
}

function saveUser(user) {
  sessionStorage.setItem("turnoya-user", JSON.stringify(user));
}

function logoutUser() {
  sessionStorage.removeItem("turnoya-user");
}

function profileComplete(user) {
  if (!user) return false;
  return Boolean(user.nombre && user.apellido && user.dni && user.pais && user.provincia && user.ciudad);
}

function currentOwner() {
  try {
    return JSON.parse(sessionStorage.getItem("turnoya-owner") ?? "null");
  } catch {
    return null;
  }
}

function saveOwner(owner) {
  sessionStorage.setItem("turnoya-owner", JSON.stringify(owner));
}

function logoutOwner() {
  sessionStorage.removeItem("turnoya-owner");
}

function requireOwner(placeId, nextUrl) {
  const owner = currentOwner();
  if (!owner || owner.placeId !== placeId) {
    location.href = `./bo-login.html?id=${placeId}&next=${encodeURIComponent(nextUrl)}`;
    return null;
  }
  return owner;
}

function requireUser(nextUrl) {
  const user = currentUser();
  if (!user) {
    location.href = `./login.html?next=${encodeURIComponent(nextUrl)}`;
    return null;
  }
  if (!profileComplete(user)) {
    location.href = `./perfil.html?next=${encodeURIComponent(nextUrl)}`;
    return null;
  }
  return user;
}

function sendOtp(email) {
  sessionStorage.setItem("turnoya-otp-email", email);
  sessionStorage.setItem("turnoya-otp-code", OTP_DEMO);
  return OTP_DEMO;
}

function checkOtp(code) {
  const expected = sessionStorage.getItem("turnoya-otp-code");
  const email = sessionStorage.getItem("turnoya-otp-email");
  return Boolean(email && code.trim() === expected);
}

function verifyOtp(code) {
  if (!checkOtp(code)) return false;
  const email = sessionStorage.getItem("turnoya-otp-email");
  const existing = currentUser();
  saveUser({
    email,
    phoneVerified: existing?.phoneVerified ?? false,
    ...(existing ?? {}),
  });
  return true;
}
