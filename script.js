/**
 * THE HUNGRY SPOT – Pure Veg Fast Food
 * Cloud Kitchen Menu Manager
 * Uses localStorage so changes persist across page reloads.
 */

/* ============================================================
   DEFAULT MENU ITEMS
   ============================================================ */
const DEFAULT_ITEMS = [
  { id: 1,  name: "Paneer Burger",       category: "Burger",  price: 89,  badge: "bestseller", desc: "Crispy paneer patty with fresh veggies & spicy mayo.", emoji: "🍔" },
  { id: 2,  name: "Veg Club Sandwich",   category: "Sandwich", price: 69, badge: "healthy",    desc: "Triple-decker sandwich loaded with garden fresh veggies.", emoji: "🥪" },
  { id: 3,  name: "Masala French Fries", category: "Snacks",  price: 59,  badge: "spicy",      desc: "Crispy fries tossed in our secret masala blend.", emoji: "🍟" },
  { id: 4,  name: "Cheese Corn Pizza",   category: "Pizza",   price: 149, badge: "bestseller", desc: "Hand-stretched base with sweet corn, cheese & jalapeños.", emoji: "🍕" },
  { id: 5,  name: "Mango Lassi",         category: "Drinks",  price: 49,  badge: "new",        desc: "Thick & creamy yoghurt shake made with Alphonso mangoes.", emoji: "🥛" },
  { id: 6,  name: "Veg Wrap",            category: "Wrap",    price: 79,  badge: "healthy",    desc: "Whole-wheat wrap stuffed with grilled veggies & hummus.", emoji: "🌯" },
  { id: 7,  name: "Paneer Tikka Roll",   category: "Wrap",    price: 99,  badge: "bestseller", desc: "Tender paneer tikka chunks rolled in a soft chapati.", emoji: "🫔" },
  { id: 8,  name: "Cold Coffee",         category: "Drinks",  price: 55,  badge: "",           desc: "Chilled blended coffee with a creamy frothy top.", emoji: "☕" },
  { id: 9,  name: "Aloo Tikki Burger",   category: "Burger",  price: 59,  badge: "spicy",      desc: "Spiced potato patty with tangy chutneys & onion rings.", emoji: "🍔" },
  { id: 10, name: "Spring Rolls",        category: "Snacks",  price: 69,  badge: "new",        desc: "Crunchy rolls filled with seasoned mixed vegetables.", emoji: "🥢" },
  { id: 11, name: "Rajma Rice Bowl",     category: "Meals",   price: 119, badge: "healthy",    desc: "Protein-packed red kidney beans curry with steamed rice.", emoji: "🍛" },
  { id: 12, name: "Pav Bhaji",           category: "Meals",   price: 89,  badge: "bestseller", desc: "Classic Mumbai street-food with buttery pav & spicy bhaji.", emoji: "🍲" },
];

/* ============================================================
   STATE
   ============================================================ */
let menuItems   = loadItems();
let activeCategory = "All";
let editingId   = null;

/* ============================================================
   PERSISTENCE
   ============================================================ */
function loadItems() {
  try {
    const saved = localStorage.getItem("hungryspot_menu");
    return saved ? JSON.parse(saved) : JSON.parse(JSON.stringify(DEFAULT_ITEMS));
  } catch (_) {
    return JSON.parse(JSON.stringify(DEFAULT_ITEMS));
  }
}

function saveItems() {
  localStorage.setItem("hungryspot_menu", JSON.stringify(menuItems));
}

/* ============================================================
   CATEGORY FILTER CHIPS
   ============================================================ */
function buildFilterChips() {
  const cats = ["All", ...new Set(menuItems.map(i => i.category).sort())];
  const container = document.getElementById("filterChips");
  container.innerHTML = cats.map(c =>
    `<button class="chip${c === activeCategory ? " active" : ""}"
             data-cat="${escHtml(c)}">${escHtml(c)}</button>`
  ).join("");
}

function setCategory(cat) {
  activeCategory = cat;
  buildFilterChips();
  renderMenu();
}

/* ============================================================
   MENU RENDER
   ============================================================ */
function renderMenu() {
  const query    = (document.getElementById("searchInput")?.value || "").toLowerCase();
  const grid     = document.getElementById("menuGrid");
  const emptyMsg = document.getElementById("emptyMsg");

  const filtered = menuItems.filter(item => {
    const matchCat  = activeCategory === "All" || item.category === activeCategory;
    const matchSearch = !query ||
      item.name.toLowerCase().includes(query) ||
      item.category.toLowerCase().includes(query) ||
      (item.desc || "").toLowerCase().includes(query);
    return matchCat && matchSearch;
  });

  grid.innerHTML = filtered.map(cardHTML).join("");
  emptyMsg.style.display = filtered.length ? "none" : "block";
}

function cardHTML(item) {
  const badgeMap = {
    bestseller: "⭐ Best Seller",
    new:        "🆕 New",
    spicy:      "🌶 Spicy",
    healthy:    "💚 Healthy",
  };
  const badgeHTML = item.badge && badgeMap[item.badge]
    ? `<span class="badge badge-${item.badge}">${badgeMap[item.badge]}</span>`
    : "";
  const catBadge = `<span class="badge badge-cat">${item.category}</span>`;

  return `
  <div class="card">
    <div class="card-thumb">${item.emoji || "🍽"}</div>
    <div class="card-body">
      <div class="card-badges">${catBadge}${badgeHTML}</div>
      <div class="card-name">${escHtml(item.name)}</div>
      <div class="card-desc">${escHtml(item.desc || "")}</div>
      <div class="card-footer">
        <div class="card-price">₹${item.price} <span>per plate</span></div>
      </div>
    </div>
  </div>`;
}

/* ============================================================
   ADMIN PANEL
   ============================================================ */
function toggleAdminPanel() {
  const overlay = document.getElementById("adminOverlay");
  const isOpen  = overlay.classList.toggle("open");
  if (isOpen) renderAdminList();
}

/* ---------- Admin List ---------- */
function renderAdminList() {
  const container = document.getElementById("adminList");
  if (!menuItems.length) {
    container.innerHTML = "<p style='color:var(--muted);font-size:.9rem;'>No items yet.</p>";
    return;
  }
  container.innerHTML = `
    <p class="admin-list-title">Current Menu (${menuItems.length} items)</p>
    ${menuItems.map(item => `
    <div class="admin-row">
      <div class="admin-row-emoji">${item.emoji || "🍽"}</div>
      <div class="admin-row-info">
        <div class="admin-row-name">${escHtml(item.name)}</div>
        <div class="admin-row-meta">₹${item.price} · ${escHtml(item.category)}</div>
      </div>
      <div class="admin-row-actions">
        <button class="btn-edit" data-action="edit" data-id="${item.id}">Edit</button>
        <button class="btn-danger" data-action="delete" data-id="${item.id}">Del</button>
      </div>
    </div>`).join("")}`;
}

/* ---------- Save (Add / Edit) ---------- */
function saveItem(e) {
  e.preventDefault();

  const name     = document.getElementById("itemName").value.trim();
  const price    = parseInt(document.getElementById("itemPrice").value, 10);
  const category = document.getElementById("itemCategory").value.trim();
  const badge    = document.getElementById("itemBadge").value;
  const desc     = document.getElementById("itemDesc").value.trim();
  const emoji    = document.getElementById("itemEmoji").value.trim();

  if (!name || !category || isNaN(price)) {
    showToast("⚠ Please fill in all required fields.");
    return;
  }

  if (editingId !== null) {
    const idx = menuItems.findIndex(i => i.id === editingId);
    if (idx !== -1) {
      menuItems[idx] = { ...menuItems[idx], name, price, category, badge, desc, emoji };
    }
    editingId = null;
    document.getElementById("formSubmitBtn").textContent = "Add Item";
    showToast("✅ Item updated successfully!");
  } else {
    const newId = menuItems.length ? Math.max(...menuItems.map(i => i.id)) + 1 : 1;
    menuItems.push({ id: newId, name, price, category, badge, desc, emoji });
    showToast("🎉 New item added to the menu!");
  }

  saveItems();
  resetItemForm();
  buildFilterChips();
  renderMenu();
  renderAdminList();
}

/* ---------- Edit ---------- */
function startEdit(id) {
  const item = menuItems.find(i => i.id === id);
  if (!item) return;
  editingId = id;
  document.getElementById("itemName").value     = item.name;
  document.getElementById("itemPrice").value    = item.price;
  document.getElementById("itemCategory").value = item.category;
  document.getElementById("itemBadge").value    = item.badge || "";
  document.getElementById("itemDesc").value     = item.desc || "";
  document.getElementById("itemEmoji").value    = item.emoji || "";
  document.getElementById("formSubmitBtn").textContent = "Save Changes";
  document.getElementById("itemForm").scrollIntoView({ behavior: "smooth" });
}

/* ---------- Delete ---------- */
function deleteItem(id) {
  if (!confirm("Remove this item from the menu?")) return;
  menuItems = menuItems.filter(i => i.id !== id);
  saveItems();
  buildFilterChips();
  renderMenu();
  renderAdminList();
  showToast("🗑 Item removed.");
}

/* ---------- Reset form ---------- */
function resetItemForm() {
  editingId = null;
  document.getElementById("itemForm").reset();
  document.getElementById("editId").value = "";
  document.getElementById("formSubmitBtn").textContent = "Add Item";
}

/* ============================================================
   ORDER FORM
   ============================================================ */
function submitOrder(e) {
  e.preventDefault();
  const name    = document.getElementById("custName").value.trim();
  const phone   = document.getElementById("custPhone").value.trim();
  const address = document.getElementById("custAddress").value.trim();
  const order   = document.getElementById("custOrder").value.trim();

  if (!name || !phone || !address || !order) {
    showToast("⚠ Please fill in all fields.");
    return;
  }

  // In a real app this would POST to a backend / cloud function.
  // Here we simulate success and log the order.
  const orderObj = {
    id: Date.now(),
    name, phone, address, order,
    placedAt: new Date().toLocaleString(),
  };
  const orders = JSON.parse(localStorage.getItem("hungryspot_orders") || "[]");
  orders.push(orderObj);
  localStorage.setItem("hungryspot_orders", JSON.stringify(orders));

  showToast(`🛒 Order placed, ${name}! We'll call you shortly.`);
  document.getElementById("custName").value    = "";
  document.getElementById("custPhone").value   = "";
  document.getElementById("custAddress").value = "";
  document.getElementById("custOrder").value   = "";
}

/* ============================================================
   UTILITIES
   ============================================================ */
let toastTimer;
function showToast(msg) {
  const el = document.getElementById("toast");
  el.textContent = msg;
  el.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.remove("show"), 3200);
}

function escHtml(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/* ============================================================
   INIT
   ============================================================ */
document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("year").textContent = new Date().getFullYear();

  // Category filter chips – event delegation
  document.getElementById("filterChips").addEventListener("click", e => {
    const chip = e.target.closest(".chip");
    if (chip) setCategory(chip.dataset.cat);
  });

  // Admin list actions – event delegation
  document.getElementById("adminList").addEventListener("click", e => {
    const btn = e.target.closest("[data-action]");
    if (!btn) return;
    const id = parseInt(btn.dataset.id, 10);
    if (btn.dataset.action === "edit")   startEdit(id);
    if (btn.dataset.action === "delete") deleteItem(id);
  });

  // Admin panel toggle
  document.getElementById("adminToggleBtn").addEventListener("click", toggleAdminPanel);
  document.getElementById("adminCloseBtn").addEventListener("click", toggleAdminPanel);
  document.getElementById("adminOverlay").addEventListener("click", e => {
    if (e.target === document.getElementById("adminOverlay")) toggleAdminPanel();
  });

  // Item form submit
  document.getElementById("itemForm").addEventListener("submit", saveItem);
  document.getElementById("clearFormBtn").addEventListener("click", resetItemForm);

  // Order form submit
  document.getElementById("orderForm").addEventListener("submit", submitOrder);

  // Search input
  document.getElementById("searchInput").addEventListener("input", renderMenu);

  buildFilterChips();
  renderMenu();
});
