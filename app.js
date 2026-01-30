// Divine Touch front-end – account + mint button logic

document.addEventListener("DOMContentLoaded", () => {
const mintButtons = document.querySelectorAll(".buy-button");
const modal = document.getElementById("dt-account-modal");
const form = document.getElementById("dt-account-form");
const closeBtn = document.getElementById("dt-account-close");

// If the modal or form doesn't exist on this page, bail out quietly
if (!modal || !form || !mintButtons.length) {
console.warn("DT: account modal or mint button not found on this page.");
return;
}

// --- Wire up mint buttons ---
mintButtons.forEach((btn) => {
btn.addEventListener("click", (event) => {
event.preventDefault();
handleMintClick();
});
});

// --- Modal close handlers ---
closeBtn.addEventListener("click", hideModal);

modal.addEventListener("click", (event) => {
// click on dark backdrop closes modal
if (event.target === modal) hideModal();
});

// --- Form submit handler ---
form.addEventListener("submit", onAccountSubmit);

// ----------------- CORE LOGIC -----------------

function handleMintClick() {
const existingUser = loadUser();

if (existingUser) {
console.log("DT: existing user found", existingUser);
alert(
`Account found for ${existingUser.email}.\n\n` +
"Next step (coming next): open your wallet and mint on-chain."
);
// Later: startWalletFlow(existingUser);
} else {
showModal();
}
}

function onAccountSubmit(event) {
event.preventDefault();

const data = {
fullName: form.elements["fullName"].value.trim(),
email: form.elements["email"].value.trim(),
address: form.elements["address"].value.trim(),
city: form.elements["city"].value.trim(),
country: form.elements["country"].value.trim(),
postal: form.elements["postal"].value.trim(),
createdAt: new Date().toISOString(),
};

// simple required fields
if (!data.email || !data.address || !data.country) {
alert("Email, country, and mailing address are required.");
return;
}

try {
saveUser(data);
hideModal();

alert(
"Account saved in this browser.\n\n" +
"Next step (our next dev pass): connect wallet + run the mint."
);

console.log("DT: user saved", data);
} catch (err) {
console.error("DT: error saving DT user", err);
alert(
"Could not save your account in this browser. " +
"Try again or use a different browser."
);
}
}

// ----------------- STORAGE HELPERS -----------------

const STORAGE_KEY = "dt_user_v1";

function loadUser() {
try {
const raw = localStorage.getItem(STORAGE_KEY);
return raw ? JSON.parse(raw) : null;
} catch (err) {
console.error("DT: failed to read user from storage", err);
return null;
}
}

function saveUser(user) {
localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
}

// ----------------- MODAL HELPERS -----------------

function showModal() {
modal.classList.add("dt-open");
document.body.style.overflow = "hidden";
}

function hideModal() {
modal.classList.remove("dt-open");
document.body.style.overflow = "";
}
});