const menuItems = [
  { id: "taco-pizza", name: "Taco Pizza (Small)", price: 9.99 },
  { id: "taco-pizza-large", name: "Taco Pizza (Large)", price: 17.49 },
  { id: "ck-calzone-small", name: "CK Ranch Calzone (Small)", price: 9.99 },
  { id: "ck-calzone-large", name: "CK Ranch Calzone (Large)", price: 17.49 },
  { id: "sandwich-bubba", name: "Bubba Burger", price: 5.25 },
  { id: "sandwich-philly", name: "Philly Steak", price: 5.89 },
  { id: "app-fries", name: "French Fries", price: 1.89 },
  { id: "app-tenders", name: "Chicken Tenders (3pc)", price: 3.75 },
  { id: "salad-grilled", name: "Grilled Chicken Salad", price: 6.99 },
  { id: "salad-taco", name: "Taco Salad", price: 6.99 },
  { id: "daily-special", name: "Daily Specials", price: 6.99 },
  { id: "dessert", name: "Dessert", price: 2.0 },
  { id: "milkshake", name: "Milkshake", price: 3.99 },
  { id: "catfish-dinner", name: "Catfish Dinner", price: 6.99 },
  { id: "chicken-dinner", name: "Chicken Tender Dinner", price: 6.99 },
  { id: "drink-bottle", name: "Bottle Drink", price: 1.59 },
];

const paymentConfig = {
  stripe: { enabled: false, checkoutUrl: "" },
  paypal: { enabled: false, checkoutUrl: "" },
  venmo: { enabled: false, checkoutUrl: "" },
  cashapp: { enabled: false, checkoutUrl: "" },
  square: { enabled: false, checkoutUrl: "" },
  card: { enabled: false, checkoutUrl: "" },
};

const taxRate = 0.07;
const cart = new Map();

const menuGrid = document.getElementById("order-menu-grid");
const cartItems = document.getElementById("cart-items");
const cartSubtotal = document.getElementById("cart-subtotal");
const cartTax = document.getElementById("cart-tax");
const cartTotal = document.getElementById("cart-total");
const summaryItems = document.getElementById("summary-items");
const summaryTotal = document.getElementById("summary-total");
const paymentStatus = document.getElementById("payment-status");
const serviceType = document.getElementById("service-type");
const addressField = document.getElementById("address-field");

const formatCurrency = (value) => `$${value.toFixed(2)}`;

const renderMenu = () => {
  menuGrid.innerHTML = menuItems
    .map(
      (item) => `
      <article class="menu-item">
        <h3>${item.name}</h3>
        <p>${formatCurrency(item.price)}</p>
        <button class="btn btn-outline add-btn" data-id="${item.id}">
          Add to Cart
        </button>
      </article>
    `,
    )
    .join("");
};

const updateTotals = () => {
  const subtotal = Array.from(cart.values()).reduce(
    (sum, item) => sum + item.price * item.qty,
    0,
  );
  const tax = subtotal * taxRate;
  const total = subtotal + tax;
  cartSubtotal.textContent = formatCurrency(subtotal);
  cartTax.textContent = formatCurrency(tax);
  cartTotal.textContent = formatCurrency(total);
  summaryTotal.textContent = formatCurrency(total);
};

const renderCart = () => {
  if (cart.size === 0) {
    cartItems.innerHTML = `<p class="muted">Your cart is empty.</p>`;
    summaryItems.innerHTML = `<p class="muted">Add items to see your summary.</p>`;
    updateTotals();
    return;
  }

  cartItems.innerHTML = Array.from(cart.values())
    .map(
      (item) => `
      <div class="cart-item">
        <div>
          <strong>${item.name}</strong>
          <span>${formatCurrency(item.price)}</span>
        </div>
        <div class="qty-controls">
          <button class="qty-btn" data-id="${item.id}" data-action="decrease">-</button>
          <span>${item.qty}</span>
          <button class="qty-btn" data-id="${item.id}" data-action="increase">+</button>
        </div>
      </div>
    `,
    )
    .join("");

  summaryItems.innerHTML = Array.from(cart.values())
    .map(
      (item) => `
      <div class="summary-line">
        <span>${item.qty} × ${item.name}</span>
        <strong>${formatCurrency(item.price * item.qty)}</strong>
      </div>
    `,
    )
    .join("");

  updateTotals();
};

const addToCart = (id) => {
  const item = menuItems.find((menuItem) => menuItem.id === id);
  if (!item) return;
  const existing = cart.get(id);
  if (existing) {
    existing.qty += 1;
  } else {
    cart.set(id, { ...item, qty: 1 });
  }
  renderCart();
};

const updateQuantity = (id, action) => {
  const item = cart.get(id);
  if (!item) return;
  if (action === "increase") {
    item.qty += 1;
  } else if (action === "decrease") {
    item.qty -= 1;
    if (item.qty <= 0) {
      cart.delete(id);
    }
  }
  renderCart();
};

const handlePayment = (method) => {
  const config = paymentConfig[method];
  if (!config || !config.enabled || !config.checkoutUrl) {
    paymentStatus.textContent =
      "Payment gateway not connected yet. Add your provider checkout link in order.js.";
    return;
  }
  window.location.href = config.checkoutUrl;
};

menuGrid.addEventListener("click", (event) => {
  const button = event.target.closest(".add-btn");
  if (button) {
    addToCart(button.dataset.id);
  }
});

cartItems.addEventListener("click", (event) => {
  const button = event.target.closest(".qty-btn");
  if (button) {
    updateQuantity(button.dataset.id, button.dataset.action);
  }
});

serviceType.addEventListener("change", () => {
  if (serviceType.value === "delivery") {
    addressField.classList.remove("hidden");
  } else {
    addressField.classList.add("hidden");
  }
});

document.querySelectorAll(".payment-btn").forEach((button) => {
  button.addEventListener("click", () => handlePayment(button.dataset.method));
});

renderMenu();
renderCart();
