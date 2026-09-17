
const products = [
  {
    id: 1,
    name: "Classic Milk",
    description: "Smooth, creamy milk chocolate.",
    price: 149,
    category: "milk",
    color: "milk"
  },
  {
    id: 2,
    name: "Midnight Dark",
    description: "Rich dark chocolate with deep cocoa flavor.",
    price: 179,
    category: "dark",
    color: "dark"
  },
  {
    id: 3,
    name: "Crunch Attack",
    description: "Milk chocolate with a satisfying crunch.",
    price: 159,
    category: "crunchy",
    color: "crunchy"
  },
  {
    id: 4,
    name: "Caramel Dream",
    description: "Creamy chocolate with caramel notes.",
    price: 169,
    category: "milk",
    color: "milk"
  },
  {
    id: 5,
    name: "Cocoa 70",
    description: "Bold, intense dark chocolate.",
    price: 199,
    category: "dark",
    color: "dark"
  },
  {
    id: 6,
    name: "Hazelnut Pop",
    description: "Crunchy chocolate with hazelnut flavor.",
    price: 189,
    category: "crunchy",
    color: "crunchy"
  }
];

let cart = [];
let currentFilter = "all";

const $ = (selector) => document.querySelector(selector);

const money = (amount) =>
  "₹" + amount.toLocaleString("en-IN");

function makeMiniBar() {
  return `
    <div class="mini-bar">
      <span></span><span></span><span></span>
      <span></span><span></span><span></span>
    </div>
  `;
}

// Loader
window.addEventListener("load", () => {
  setTimeout(() => $("#loader").classList.add("hidden"), 1200);
});

// Mobile menu
$("#menuToggle").addEventListener("click", () => {
  $(".nav-links").classList.toggle("open");
});

document.querySelectorAll(".nav-links a").forEach(link => {
  link.addEventListener("click", () => $(".nav-links").classList.remove("open"));
});

// Products
function renderProducts() {
  const filtered = currentFilter === "all"
    ? products
    : products.filter(p => p.category === currentFilter);

  $("#productsGrid").innerHTML = filtered.map(product => `
    <article class="product-card reveal">
      <div class="product-image ${product.color}">
        ${makeMiniBar()}
      </div>
      <div class="product-info">
        <h3>${product.name}</h3>
        <p>${product.description}</p>
        <div class="product-bottom">
          <span class="product-price">${money(product.price)}</span>
          <button class="add-btn" data-add="${product.id}">
            Add to bag +
          </button>
        </div>
      </div>
    </article>
  `).join("");

  document.querySelectorAll("[data-add]").forEach(button => {
    button.addEventListener("click", () => {
      addToCart(Number(button.dataset.add));
    });
  });

  observeReveals();
}

document.querySelectorAll(".filter").forEach(button => {
  button.addEventListener("click", () => {
    currentFilter = button.dataset.filter;

    document.querySelectorAll(".filter").forEach(b =>
      b.classList.toggle("active", b === button)
    );

    renderProducts();
  });
});

// Cart
function addToCart(id) {
  const existing = cart.find(item => item.id === id);

  if (existing) {
    existing.quantity++;
  } else {
    cart.push({ id, quantity: 1 });
  }

  renderCart();
  openCart();
}

function updateQuantity(id, change) {
  const item = cart.find(item => item.id === id);
  if (!item) return;

  item.quantity += change;

  if (item.quantity <= 0) {
    cart = cart.filter(item => item.id !== id);
  }

  renderCart();
}

function removeFromCart(id) {
  cart = cart.filter(item => item.id !== id);
  renderCart();
}

function getTotal() {
  return cart.reduce((sum, item) => {
    const product = products.find(p => p.id === item.id);
    return sum + product.price * item.quantity;
  }, 0);
}

function getCount() {
  return cart.reduce((sum, item) => sum + item.quantity, 0);
}

function renderCart() {
  $("#cartCount").textContent = getCount();
  $("#cartTitleCount").textContent = getCount();
  $("#cartTotal").textContent = money(getTotal());

  if (cart.length === 0) {
    $("#cartItems").innerHTML = `
      <div class="empty-cart">
        <p>Your bag is waiting for something delicious 🍫</p>
      </div>
    `;
    $("#checkoutOpen").disabled = true;
    $("#checkoutOpen").style.opacity = ".5";
    return;
  }

  $("#checkoutOpen").disabled = false;
  $("#checkoutOpen").style.opacity = "1";

  $("#cartItems").innerHTML = cart.map(item => {
    const product = products.find(p => p.id === item.id);

    return `
      <div class="cart-item">
        <div class="cart-thumb">
          ${makeMiniBar()}
        </div>

        <div>
          <h4>${product.name}</h4>
          <p>${money(product.price)}</p>

          <div class="qty-controls">
            <button data-minus="${product.id}" aria-label="Decrease quantity">−</button>
            <span>${item.quantity}</span>
            <button data-plus="${product.id}" aria-label="Increase quantity">+</button>
          </div>

          <button class="remove-btn" data-remove="${product.id}">
            Remove
          </button>
        </div>

        <strong>${money(product.price * item.quantity)}</strong>
      </div>
    `;
  }).join("");

  document.querySelectorAll("[data-minus]").forEach(btn => {
    btn.addEventListener("click", () =>
      updateQuantity(Number(btn.dataset.minus), -1)
    );
  });

  document.querySelectorAll("[data-plus]").forEach(btn => {
    btn.addEventListener("click", () =>
      updateQuantity(Number(btn.dataset.plus), 1)
    );
  });

  document.querySelectorAll("[data-remove]").forEach(btn => {
    btn.addEventListener("click", () =>
      removeFromCart(Number(btn.dataset.remove))
    );
  });
}

function openCart() {
  $("#cartDrawer").classList.add("open");
  $("#overlay").classList.add("open");
  document.body.style.overflow = "hidden";
}

function closeCart() {
  $("#cartDrawer").classList.remove("open");
  $("#overlay").classList.remove("open");
  document.body.style.overflow = "";
}

$("#cartOpen").addEventListener("click", openCart);
$("#cartClose").addEventListener("click", closeCart);
$("#overlay").addEventListener("click", closeCart);

// Checkout
$("#checkoutOpen").addEventListener("click", () => {
  if (cart.length === 0) return;

  $("#checkoutSummary").innerHTML = `
    <div class="checkout-summary">
      ${cart.map(item => {
        const product = products.find(p => p.id === item.id);
        return `<p><span>${product.name} × ${item.quantity}</span>
        <strong>${money(product.price * item.quantity)}</strong></p>`;
      }).join("")}
      <hr>
      <p><strong>Total</strong><strong>${money(getTotal())}</strong></p>
    </div>
  `;

  $("#checkoutModal").classList.add("open");
});

$("#checkoutClose").addEventListener("click", () => {
  $("#checkoutModal").classList.remove("open");
});

$("#checkoutForm").addEventListener("submit", (event) => {
  event.preventDefault();

  const formData = new FormData(event.target);
  const name = formData.get("name");

  $("#checkoutForm").hidden = true;
  $(".checkout-card .demo-note").hidden = true;

  $("#orderSuccess").hidden = false;
  $("#orderSuccess").innerHTML = `
    <strong>Order preview created 🎉</strong><br>
    Thanks, ${name}! Your demo order total is ${money(getTotal())}.
    <br><br>
    No payment was processed. Connect a backend and payment provider
    before using this for real orders.
  `;
});

// Flavor switcher
const flavorData = {
  milk: { label: "MILK CHOCOLATE", className: "milk-bar" },
  dark: { label: "DARK CHOCOLATE", className: "dark-bar" },
  crunchy: { label: "CRUNCHY CHOCOLATE", className: "crunchy-bar" }
};

document.querySelectorAll(".flavor-tab").forEach(button => {
  button.addEventListener("click", () => {
    const flavor = flavorData[button.dataset.flavor];

    document.querySelectorAll(".flavor-tab").forEach(b =>
      b.classList.toggle("active", b === button)
    );

    const bar = $("#flavorDisplay .flavor-bar");
    bar.className = "flavor-bar " + flavor.className;
    $("#flavorLabel").textContent = flavor.label;
  });
});

// 3D chocolate mouse movement
const heroVisual = $("#heroVisual");
const chocolate = $("#chocolate");

heroVisual.addEventListener("pointermove", (event) => {
  if (event.pointerType === "touch") return;

  const rect = heroVisual.getBoundingClientRect();
  const x = (event.clientX - rect.left) / rect.width - .5;
  const y = (event.clientY - rect.top) / rect.height - .5;

  chocolate.style.transform =
    `rotateX(${12 - y * 25}deg) rotateY(${-28 + x * 35}deg) rotateZ(-5deg)`;
});

heroVisual.addEventListener("pointerleave", () => {
  chocolate.style.transform =
    "rotateX(12deg) rotateY(-28deg) rotateZ(-5deg)";
});

// Scroll animation
function observeReveals() {
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: .12 });

  document.querySelectorAll(".reveal:not(.visible)").forEach(el =>
    observer.observe(el)
  );
}

// Add reveal classes to content
document.querySelectorAll(
  ".intro h2, .values-grid article, .shop h2, .flavor-section, .promise-card, .cta-section h2"
).forEach(el => el.classList.add("reveal"));

observeReveals();

// Scroll-driven hero rotation
let ticking = false;

window.addEventListener("scroll", () => {
  if (ticking) return;

  ticking = true;

  requestAnimationFrame(() => {
    const scroll = window.scrollY;
    const heroHeight = $(".hero").offsetHeight;

    if (scroll < heroHeight) {
      const rotation = -28 + scroll * .09;
      const scale = 1 - scroll * .00015;

      chocolate.style.transform =
        `rotateX(12deg) rotateY(${rotation}deg) rotateZ(-5deg) scale(${scale})`;
    }

    ticking = false;
  });
});

// Start
renderProducts();
renderCart();
