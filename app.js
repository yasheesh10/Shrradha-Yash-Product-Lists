const config = window.SITE_CONFIG || {};
const products = Array.isArray(window.PRODUCTS) ? window.PRODUCTS : [];
const grid = document.getElementById("productGrid");
const modal = document.getElementById("productModal");
const modalImage = document.getElementById("modalImage");
let activeProduct = null;
let imageIndex = 0;
let previousFocus = null;

const categoryNames = {
  heritage: "Heritage",
  devotional: "Devotional",
  wildlife: "Wildlife",
  objects: "Objects",
  sculptural: "Sculptural forms"
};

function safeImages(product) {
  return Array.isArray(product.images) ? product.images.filter(Boolean) : [];
}

function escapeText(value) {
  return String(value == null ? "" : value).replace(/[&<>"']/g, function(ch) {
    return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[ch];
  });
}

function formatPrice(value) {
  if (typeof value !== "number" || !Number.isFinite(value)) return "";
  const currency = config.currency || "INR";
  try {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: currency,
      maximumFractionDigits: 0
    }).format(value);
  } catch (_) {
    return currency + " " + value.toLocaleString("en-IN");
  }
}

function productPriceLabel(product) {
  const variants = Array.isArray(product.variants) ? product.variants : [];
  const prices = variants
    .map(function(variant) {
      return variant && typeof variant.price === "number" ? variant.price : null;
    })
    .filter(function(price) { return price !== null; });

  if (prices.length) return "From " + formatPrice(Math.min.apply(null, prices));
  if (typeof product.price === "number") return formatPrice(product.price);
  return product.priceNote ? String(product.priceNote) : "";
}

function renderProducts(filter) {
  const visible = products.filter(function(product) {
    return filter === "all" || product.category === filter;
  });

  grid.innerHTML = visible.map(function(product) {
    const images = safeImages(product);
    if (!images.length) return "";

    const price = productPriceLabel(product);
    const category = categoryNames[product.category] || "Sculpture";
    return '<article class="product-card" id="product-' + escapeText(product.id) + '">' +
      '<button class="product-open" type="button" data-product="' + escapeText(product.id) + '" aria-label="View ' + escapeText(product.name) + '">' +
      '<div class="product-photo"><img loading="lazy" src="./assets/' + encodeURIComponent(images[0]) + '" alt="' + escapeText(product.name) + ' fibre sculpture">' +
      (images.length > 1 ? '<span class="photo-count">' + images.length + ' views</span>' : '') +
      '</div>' +
      '<div class="product-meta"><span class="product-category">' + escapeText(category) + '</span><span class="product-arrow" aria-hidden="true">↗</span></div>' +
      '<h3 class="product-name">' + escapeText(product.name) + '</h3>' +
      (product.description ? '<p class="product-description">' + escapeText(product.description) + '</p>' : '') +
      (price ? '<p class="product-price">' + escapeText(price) + '</p>' : '') +
      '</button></article>';
  }).join("");
}

function renderSpecs(product) {
  const target = document.getElementById("modalSpecs");
  const rows = [];

  if (product.material) {
    rows.push("<div><strong>Material</strong> " + escapeText(product.material) + "</div>");
  }
  if (Array.isArray(product.sizes) && product.sizes.length) {
    rows.push("<div><strong>Sizes</strong> " + product.sizes.map(escapeText).join(" · ") + "</div>");
  }

  const variants = Array.isArray(product.variants) ? product.variants.filter(Boolean) : [];
  if (variants.length) {
    const body = variants.map(function(variant) {
      const price = formatPrice(variant.price) || variant.priceNote || "Enquire";
      return "<tr><td>" + escapeText(variant.size || "Option") + "</td><td>" + escapeText(price) + "</td></tr>";
    }).join("");
    rows.push('<table class="variant-list"><thead><tr><th>Size</th><th>Price</th></tr></thead><tbody>' + body + "</tbody></table>");
  }

  target.innerHTML = rows.join("");
  const price = document.getElementById("modalPrice");
  price.textContent = productPriceLabel(product);

  if (!rows.length && !price.textContent) {
    document.getElementById("modalDescription").textContent =
      (product.description ? product.description + " " : "") + "Ask for size, price and availability.";
  }
}

function updateModalImage() {
  const images = safeImages(activeProduct || {});
  if (!images.length) return;
  modalImage.src = "./assets/" + encodeURIComponent(images[imageIndex]);
  modalImage.alt = activeProduct.name + " — view " + (imageIndex + 1);

  const hasMultiple = images.length > 1;
  document.getElementById("prevImage").style.display = hasMultiple ? "grid" : "none";
  document.getElementById("nextImage").style.display = hasMultiple ? "grid" : "none";
}

function openProduct(id) {
  activeProduct = products.find(function(product) { return product.id === id; });
  if (!activeProduct) return;

  previousFocus = document.activeElement;
  imageIndex = 0;
  modal.classList.add("is-open");
  modal.setAttribute("aria-hidden", "false");
  document.body.style.overflow = "hidden";

  const category = categoryNames[activeProduct.category] || "Sculpture";
  document.getElementById("modalCategory").textContent =
    category + " · " + (activeProduct.material || "Fibre");
  document.getElementById("modalTitle").textContent = activeProduct.name;
  document.getElementById("modalDescription").textContent = activeProduct.description || "";
  renderSpecs(activeProduct);
  updateModalImage();
  document.getElementById("enquireProduct").focus();
}

function closeModal() {
  modal.classList.remove("is-open");
  modal.setAttribute("aria-hidden", "true");
  document.body.style.overflow = "";
  activeProduct = null;
  if (previousFocus && previousFocus.focus) previousFocus.focus();
}

function stepImage(direction) {
  const images = safeImages(activeProduct || {});
  if (!images.length) return;
  imageIndex = (imageIndex + direction + images.length) % images.length;
  updateModalImage();
}

function showToast(message) {
  const toast = document.getElementById("toast");
  toast.textContent = message;
  toast.classList.add("is-visible");
  window.clearTimeout(showToast.timer);
  showToast.timer = window.setTimeout(function() {
    toast.classList.remove("is-visible");
  }, 2600);
}

async function copyText(text, confirmation) {
  try {
    await navigator.clipboard.writeText(text);
  } catch (_) {
    const field = document.createElement("textarea");
    field.value = text;
    field.style.position = "fixed";
    field.style.opacity = "0";
    document.body.appendChild(field);
    field.select();
    document.execCommand("copy");
    field.remove();
  }
  showToast(confirmation);
}

async function shareCollection() {
  const title = (config.brandName || "Fibre Sculptures") + " — Selected Collection";
  const text = "Explore this selected collection of fibre sculptures.";
  const url = location.protocol === "file:" ? "" : location.href.split("#")[0];

  if (navigator.share && url) {
    try {
      await navigator.share({title: title, text: text, url: url});
      return;
    } catch (error) {
      if (error && error.name === "AbortError") return;
    }
  }

  if (url) {
    await copyText(text + "\n" + url, "Page link copied.");
  } else {
    showToast("Publish the page first, then share its live link.");
  }
}

async function enquireAbout(product) {
  const message = "Hello, I'm interested in " + product.name + ". Could you share the size, price and availability?";
  const number = String(config.whatsappNumber || "").replace(/\D/g, "");

  if (number) {
    window.open("https://wa.me/" + number + "?text=" + encodeURIComponent(message), "_blank", "noopener,noreferrer");
    return;
  }
  if (config.email) {
    window.location.href = "mailto:" + encodeURIComponent(config.email) +
      "?subject=" + encodeURIComponent("Enquiry: " + product.name) +
      "&body=" + encodeURIComponent(message);
    return;
  }
  if (navigator.share) {
    try {
      await navigator.share({title: product.name, text: message});
      return;
    } catch (error) {
      if (error && error.name === "AbortError") return;
    }
  }
  await copyText(message, "Enquiry copied. Paste it into your message.");
}

grid.addEventListener("click", function(event) {
  const button = event.target.closest("[data-product]");
  if (button) openProduct(button.getAttribute("data-product"));
});

document.querySelectorAll("[data-filter]").forEach(function(button) {
  button.addEventListener("click", function() {
    document.querySelectorAll("[data-filter]").forEach(function(filterButton) {
      filterButton.classList.remove("is-active");
      filterButton.setAttribute("aria-pressed", "false");
    });
    button.classList.add("is-active");
    button.setAttribute("aria-pressed", "true");
    renderProducts(button.dataset.filter);
  });
});

document.querySelectorAll("[data-filter-link]").forEach(function(link) {
  link.addEventListener("click", function() {
    const target = document.querySelector('[data-filter="' + link.dataset.filterLink + '"]');
    if (target) {
      target.click();
      document.getElementById("collection").scrollIntoView({behavior: "smooth"});
    }
  });
});

document.querySelectorAll("[data-share]").forEach(function(button) {
  button.addEventListener("click", shareCollection);
});
document.getElementById("enquireProduct").addEventListener("click", function() {
  if (activeProduct) enquireAbout(activeProduct);
});
document.getElementById("modalClose").addEventListener("click", closeModal);
document.getElementById("closeDetails").addEventListener("click", closeModal);
document.getElementById("prevImage").addEventListener("click", function() { stepImage(-1); });
document.getElementById("nextImage").addEventListener("click", function() { stepImage(1); });
modal.addEventListener("click", function(event) {
  if (event.target === modal) closeModal();
});
document.addEventListener("keydown", function(event) {
  if (!modal.classList.contains("is-open")) return;
  if (event.key === "Escape") closeModal();
  if (event.key === "ArrowLeft") stepImage(-1);
  if (event.key === "ArrowRight") stepImage(1);
});

const brandName = config.brandName || "Fibre Sculptures";
document.getElementById("brandName").textContent = brandName;
document.getElementById("footerBrand").textContent = brandName;
document.getElementById("brandTagline").textContent = config.tagline || "Selected collection";
document.title = brandName + " — Selected Collection";

if (config.showBrandName === false) {
  document.querySelector(".brand-copy").style.display = "none";
}
if (config.logoImage) {
  const mark = document.getElementById("brandMark");
  const logo = document.createElement("img");
  logo.className = "brand-logo";
  logo.src = "./assets/" + encodeURIComponent(config.logoImage);
  logo.alt = "";
  mark.textContent = "";
  mark.classList.add("brand-mark-image");
  mark.appendChild(logo);
}

const copy = config.copy || {};
[
  "heroEyebrow", "heroTitle", "heroAccent", "heroDescription",
  "introEyebrow", "introTitle", "introDescription",
  "collectionEyebrow", "collectionTitle", "collectionDescription",
  "featureEyebrow", "featureTitle", "featureDescription",
  "enquiryEyebrow", "enquiryTitle", "enquiryDescription"
].forEach(function(id) {
  if (copy[id]) document.getElementById(id).textContent = copy[id];
});

const menuToggle = document.getElementById("menuToggle");
menuToggle.addEventListener("click", function() {
  const nav = document.getElementById("nav");
  const isOpen = nav.classList.toggle("is-open");
  menuToggle.setAttribute("aria-expanded", String(isOpen));
  menuToggle.setAttribute("aria-label", isOpen ? "Close menu" : "Open menu");
  menuToggle.textContent = isOpen ? "×" : "☰";
});
document.querySelectorAll(".nav a").forEach(function(link) {
  link.addEventListener("click", function() {
    document.getElementById("nav").classList.remove("is-open");
    menuToggle.setAttribute("aria-expanded", "false");
    menuToggle.textContent = "☰";
  });
});

renderProducts("all");
