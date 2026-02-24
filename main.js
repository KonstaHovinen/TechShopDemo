/**
 * NovaByte Store — main.js
 * Cart, sticky header, hamburger, forms
 * Null-safe: works on all pages (index, about, contact, checkout)
 */

/* ---- PRODUCT DATA ---- */
const PRODUCTS = {
  1: { name: 'SmartWatch Pro',          emoji: '⌚', price: 199.00 },
  2: { name: 'NoiseOff Pro Headphones', emoji: '🎧', price: 149.00 },
  3: { name: 'Urban Carry Backpack',    emoji: '🎒', price: 89.00  },
  4: { name: 'Premium Tech Tee',        emoji: '👕', price: 39.00  },
  5: { name: 'Thermo Bottle 500ml',     emoji: '🍶', price: 35.00  },
  6: { name: 'MagCharge 65W Dock',      emoji: '⚡', price: 79.00  },
};

/* ---- CART STATE ---- */
let cart = JSON.parse(localStorage.getItem('nb_cart') || '{}');

function saveCart() { localStorage.setItem('nb_cart', JSON.stringify(cart)); }
function cartCount() { return Object.values(cart).reduce((s, i) => s + i.qty, 0); }
function cartTotal() { return Object.values(cart).reduce((s, i) => s + i.price * i.qty, 0); }
function fmt(n) { return '€' + n.toFixed(2); }

/* ---- TOAST ---- */
function showToast(msg, type) {
  type = type || '';
  const t = document.getElementById('toast');
  if (!t) return;
  t.textContent = msg;
  t.className = 'toast show ' + type;
  clearTimeout(t._t);
  t._t = setTimeout(function() { t.className = 'toast'; }, 2500);
}

/* ---- CART RENDER ---- */
function renderCart() {
  const items  = document.getElementById('cartItems');
  const footer = document.getElementById('cartFooter');
  const total  = document.getElementById('cartTotal');
  const badge  = document.getElementById('cartCount');
  if (!items) return; // not on a page with a cart sidebar

  const entries = Object.values(cart);
  const count   = cartCount();

  badge.textContent = count;
  badge.classList.toggle('visible', count > 0);

  if (!entries.length) {
    items.innerHTML = '<p class="cart-empty">Your cart is empty.</p>';
    footer.style.display = 'none';
    return;
  }

  footer.style.display = 'flex';
  total.textContent = fmt(cartTotal());
  items.innerHTML = entries.map(function(item) {
    return '<div class="cart-item">' +
      '<div class="cart-item-thumb">' + (PRODUCTS[item.id] ? PRODUCTS[item.id].emoji : '📦') + '</div>' +
      '<div class="cart-item-info">' +
        '<div class="cart-item-name">' + item.name + '</div>' +
        '<div class="cart-item-price">' + fmt(item.price) + '</div>' +
        '<div class="cart-item-qty">' +
          '<button class="qty-btn" data-action="dec" data-id="' + item.id + '">−</button>' +
          '<span class="qty-val">' + item.qty + '</span>' +
          '<button class="qty-btn" data-action="inc" data-id="' + item.id + '">+</button>' +
          '<button class="cart-item-remove" data-action="remove" data-id="' + item.id + '">Remove</button>' +
        '</div>' +
      '</div>' +
    '</div>';
  }).join('');
}

/* ---- CART ACTIONS ---- */
function addToCart(id) {
  var p = PRODUCTS[id];
  if (!p) return;
  if (cart[id]) {
    cart[id].qty++;
  } else {
    cart[id] = { id: id, name: p.name, price: p.price, qty: 1 };
  }
  saveCart(); renderCart(); openCart();
  showToast('✓ ' + p.name + ' added', 'success');
}
function updateQty(id, d) {
  if (!cart[id]) return;
  cart[id].qty += d;
  if (cart[id].qty <= 0) delete cart[id];
  saveCart(); renderCart();
}
function removeItem(id) { delete cart[id]; saveCart(); renderCart(); }

/* ---- CART SIDEBAR ---- */
function openCart() {
  var s = document.getElementById('cartSidebar');
  var o = document.getElementById('cartOverlay');
  if (s) s.classList.add('open');
  if (o) o.classList.add('show');
  document.body.style.overflow = 'hidden';
}
function closeCart() {
  var s = document.getElementById('cartSidebar');
  var o = document.getElementById('cartOverlay');
  if (s) s.classList.remove('open');
  if (o) o.classList.remove('show');
  document.body.style.overflow = '';
}

/* ---- STICKY HEADER ---- */
function initHeader() {
  var h = document.getElementById('header');
  if (!h) return;
  window.addEventListener('scroll', function() {
    h.classList.toggle('scrolled', window.scrollY > 20);
  }, { passive: true });
}

/* ---- HAMBURGER ---- */
function initHamburger() {
  var btn = document.getElementById('hamburger');
  var nav = document.getElementById('nav');
  if (!btn || !nav) return;
  btn.addEventListener('click', function() {
    var open = nav.classList.toggle('open');
    btn.classList.toggle('active', open);
    document.body.style.overflow = open ? 'hidden' : '';
  });
  nav.querySelectorAll('.nav__link').forEach(function(a) {
    a.addEventListener('click', function() {
      nav.classList.remove('open');
      btn.classList.remove('active');
      document.body.style.overflow = '';
    });
  });
}

/* ---- EVENTS ---- */
function initEvents() {
  // Cart controls — only if sidebar elements exist (not on checkout/success pages)
  var cartBtn     = document.getElementById('cartBtn');
  var cartClose   = document.getElementById('cartClose');
  var cartOverlay = document.getElementById('cartOverlay');
  var clearCart   = document.getElementById('clearCart');
  var cartItems   = document.getElementById('cartItems');

  if (cartBtn)     cartBtn.addEventListener('click', openCart);
  if (cartClose)   cartClose.addEventListener('click', closeCart);
  if (cartOverlay) cartOverlay.addEventListener('click', closeCart);
  if (clearCart)   clearCart.addEventListener('click', function() {
    cart = {}; saveCart(); renderCart(); showToast('Cart cleared.');
  });

  // Cart item controls
  if (cartItems) {
    cartItems.addEventListener('click', function(e) {
      var btn = e.target.closest('[data-action]');
      if (!btn) return;
      var id = btn.dataset.id;
      if (btn.dataset.action === 'inc')    updateQty(id, 1);
      if (btn.dataset.action === 'dec')    updateQty(id, -1);
      if (btn.dataset.action === 'remove') removeItem(id);
    });
  }

  // Add to cart buttons
  document.addEventListener('click', function(e) {
    var btn = e.target.closest('.add-to-cart');
    if (!btn) return;
    addToCart(btn.dataset.id);
    var orig = btn.textContent;
    btn.textContent = '✓ Added!';
    btn.style.background = 'linear-gradient(135deg,#22c55e,#16a34a)';
    setTimeout(function() { btn.textContent = orig; btn.style.background = ''; }, 1400);
  });

  // Escape key
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') closeCart();
  });

  // Contact form — only on contact.html
  var contactForm = document.getElementById('contactForm');
  if (contactForm) {
    contactForm.addEventListener('submit', function(e) {
      e.preventDefault();
      showToast("✉️ Message sent! I'll get back to you soon.", 'success');
      e.target.reset();
    });
  }
}

/* ---- INIT ---- */
document.addEventListener('DOMContentLoaded', function() {
  renderCart();
  initHeader();
  initHamburger();
  initEvents();
});
