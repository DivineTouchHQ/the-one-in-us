// ../js/app.js

document.addEventListener("DOMContentLoaded", () => {
// Grab elements
const mintButton = document.getElementById("dt-mint-button");
const modal = document.getElementById("dt-account-modal");
const closeButton = document.getElementById("dt-account-close");
const form = document.getElementById("dt-account-form");

if (!mintButton || !modal || !closeButton || !form) {
// If this page doesn't have those elements, bail quietly
return;
}

const STORAGE_KEY = "dtAccount";

function openModal() {
modal.classList.add("dt-open");
}

function closeModal() {
modal.classList.remove("dt-open");
}

// Prefill from localStorage if it exists
try {
const stored = localStorage.getItem(STORAGE_KEY);
if (stored) {
const data = JSON.parse(stored);
if (data.fullName) form.elements.fullName.value = data.fullName;
if (data.email) form.elements.email.value = data.email;
if (data.address) form.elements.address.value = data.address;
if (data.city) form.elements.city.value = data.city;
if (data.country) form.elements.country.value = data.country;
if (data.postal) form.elements.postal.value = data.postal;
}
} catch (e) {
console.warn("Could not read stored DT account", e);
}

// Open modal when Mint is clicked
mintButton.addEventListener("click", (e) => {
e.preventDefault();
openModal();
});

// Close button
closeButton.addEventListener("click", (e) => {
e.preventDefault();
closeModal();
});

// Close on ESC key
document.addEventListener("keydown", (e) => {
if (e.key === "Escape") {
closeModal();
}
});

// Optional: click outside panel closes modal
modal.addEventListener("click", (e) => {
if (e.target === modal) {
closeModal();
}
});

// Handle form submit – save account locally
form.addEventListener("submit", (e) => {
e.preventDefault();

const data = {
fullName: form.elements.fullName.value.trim(),
email: form.elements.email.value.trim(),
address: form.elements.address.value.trim(),
city: form.elements.city.value.trim(),
country: form.elements.country.value.trim(),
postal: form.elements.postal.value.trim(),
};

try {
localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
} catch (err) {
console.warn("Could not save DT account", err);
}

// ✅ This is where wallet connect / contract call will later plug in
alert("Account saved. Wallet connect + on-chain mint is the next step.");

closeModal();
});
});
