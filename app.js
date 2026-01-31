// app.js
console.log("DT app.js loaded");

// --- Divine Touch on-chain config ---

// Your deployed ERC1155 contract on Ethereum mainnet
const DT_CONTRACT_ADDRESS = "0x65b4Ce250693A9F5FD6B1CEa31A2c4660f8914C9";

// Minimal ABI: only what we actually call/read
const DT_CONTRACT_ABI = [
"function prices(uint256) view returns (uint256)",
"function mint(uint256 tokenId) payable",
];

// Where to send buyer info (Formspree endpoint)
const DT_FORM_ENDPOINT = "https://formspree.io/f/xvzrlnzo"; // ⬅️ replace with your real Formspree URL

document.addEventListener("DOMContentLoaded", () => {
// Grab elements
const mintButton = document.getElementById("dt-mint-button");
const modal = document.getElementById("dt-account-modal");
const closeButton = document.getElementById("dt-account-close");
const form = document.getElementById("dt-account-form");

// If this page doesn't have the modal/mint (e.g. some other page), bail
if (!mintButton || !modal || !closeButton || !form) {
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
if (data.fullName && form.elements.fullName) {
form.elements.fullName.value = data.fullName;
}
if (data.email && form.elements.email) {
form.elements.email.value = data.email;
}
if (data.address && form.elements.address) {
form.elements.address.value = data.address;
}
if (data.city && form.elements.city) {
form.elements.city.value = data.city;
}
if (data.country && form.elements.country) {
form.elements.country.value = data.country;
}
if (data.postal && form.elements.postal) {
form.elements.postal.value = data.postal;
}
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

// --- On-chain mint helper ---
async function performMintFromBrowser() {
if (typeof window.ethereum === "undefined") {
throw new Error("No wallet detected. Please install MetaMask or a compatible wallet.");
}

const tokenIdAttr = mintButton.dataset.tokenId;
const tokenId = parseInt(tokenIdAttr, 10);

if (!tokenId || Number.isNaN(tokenId)) {
throw new Error("Missing token id on this page.");
}

// Connect to wallet
const provider = new ethers.providers.Web3Provider(window.ethereum);

// Ask user to connect accounts
await provider.send("eth_requestAccounts", []);

// Enforce Ethereum mainnet (chainId = 1)
const network = await provider.getNetwork();
if (network.chainId !== 1) {
throw new Error("Please switch your wallet to Ethereum Mainnet.");
}

const signer = provider.getSigner();
const contract = new ethers.Contract(
DT_CONTRACT_ADDRESS,
DT_CONTRACT_ABI,
signer
);

// Ask contract for price (always source of truth)
const price = await contract.prices(tokenId);
if (price.lte(0)) {
throw new Error("Price not set for this token.");
}

// Send mint transaction
const tx = await contract.mint(tokenId, { value: price });
console.log("Mint tx sent:", tx.hash);

// Wait for confirmation
const receipt = await tx.wait();
console.log("Mint confirmed:", receipt.transactionHash);
}

// Handle form submit – save account locally, send to Formspree, then mint on-chain
form.addEventListener("submit", async (e) => {
e.preventDefault();

const data = {
fullName: form.elements.fullName.value.trim(),
email: form.elements.email.value.trim(),
address: form.elements.address.value.trim(),
city: form.elements.city.value.trim(),
country: form.elements.country.value.trim(),
postal: form.elements.postal.value.trim(),
};

// Grab tokenId from the mint button on this page
const tokenIdAttr = mintButton.dataset.tokenId;
const tokenId = parseInt(tokenIdAttr, 10);

// 1) Save locally (for user convenience)
try {
localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
} catch (err) {
console.warn("Could not save DT account", err);
}

// 2) Send to Formspree so YOU have the data
if (DT_FORM_ENDPOINT && DT_FORM_ENDPOINT.startsWith("http")) {
try {
await fetch(DT_FORM_ENDPOINT, {
method: "POST",
headers: {
"Content-Type": "application/json",
"Accept": "application/json",
},
body: JSON.stringify({
tokenId: tokenId,
fullName: data.fullName,
email: data.email,
address: data.address,
city: data.city,
country: data.country,
postal: data.postal,
}),
});
} catch (err) {
console.warn("Could not send account to Formspree", err);
// don't block mint on a one-off email failure
}
} else {
console.warn("DT_FORM_ENDPOINT not set or invalid; skipping Formspree send.");
}

// 3) Run on-chain mint
try {
await performMintFromBrowser();
alert("Mint successful. Welcome to Divine Touch.");
closeModal();
} catch (err) {
console.error(err);
const msg = err && err.message ? err.message : String(err);
alert("Mint failed or cancelled:\n" + msg);
// Leave modal open so they can retry
}
});
});



