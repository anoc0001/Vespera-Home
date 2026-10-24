// Grab DOM Elements
const productCards = document.querySelectorAll('.product-card');
const resultCountSpan = document.getElementById('resultCount');
const priceRangeInput = document.getElementById('priceRange');
const maxPriceLabel = document.getElementById('maxPriceLabel');
const cartCountSpan = document.getElementById('cartCount');
const favoritesCountSpan = document.getElementById('favoritesCount');
const menuToggle = document.getElementById('menuToggle');
const menuIcon = menuToggle.querySelector('i');
const primaryNavigation = document.getElementById('primaryNavigation');
const filterSidebarToggle = document.getElementById('filterSidebarToggle');
const filterSidebarContent = document.getElementById('filterSidebarContent');
const favoritesToggleBtn = document.getElementById('favoritesToggleBtn');
const cartToggleBtn = document.getElementById('cartToggleBtn');
const shoppingPanel = document.getElementById('shoppingPanel');
const shoppingPanelTitle = document.getElementById('shoppingPanelTitle');
const shoppingPanelItems = document.getElementById('shoppingPanelItems');
const shoppingPanelClose = document.getElementById('shoppingPanelClose');
const shippingMessage = document.getElementById('shippingMessage');

let activeCategory = 'all';
let activeMaterial = 'all';
let activeQuickPick = 'all';
let activeAvailability = 'all';
let activeFinish = 'all';
let maxPrice = 2500;
const cart = new Map();
const favorites = new Set();
let activeShoppingPanel = 'cart';

setTimeout(() => {
    shippingMessage.textContent = 'Free returns within 30 days. Learn more.';
}, 3000);

function getProduct(card) {
    return {
        id: card.dataset.id,
        name: card.querySelector('.product-name').textContent.trim(),
        price: Number(card.dataset.price),
        image: card.querySelector('.product-image-wrapper img').getAttribute('src')
    };
}

function updateProductButtons() {
    let itemCount = 0;

    productCards.forEach(card => {
        const id = card.dataset.id;
        const quantity = cart.get(id) || 0;
        itemCount += quantity;

        const cartButton = card.querySelector('.cart-add-btn');
        if (cartButton) {
            cartButton.classList.toggle('in-cart', quantity > 0);
            cartButton.setAttribute('aria-label', quantity ? `Add another ${getProduct(card).name} to cart (${quantity} in cart)` : `Add ${getProduct(card).name} to cart`);
            cartButton.title = quantity ? `Add another to cart (${quantity} in cart)` : 'Add to Cart';
        }

        const favoriteButton = card.querySelector('.wishlist-btn');
        if (favoriteButton) {
            const isFavorite = favorites.has(id);
            favoriteButton.classList.toggle('active', isFavorite);
            favoriteButton.setAttribute('aria-pressed', String(isFavorite));
            favoriteButton.setAttribute('aria-label', `${isFavorite ? 'Remove' : 'Add'} ${getProduct(card).name} ${isFavorite ? 'from' : 'to'} favorites`);
            favoriteButton.title = isFavorite ? 'Remove from Favorites' : 'Add to Favorites';
        }
    });

    cartCountSpan.textContent = String(itemCount);
    cartToggleBtn.setAttribute('aria-label', `Your cart, ${itemCount} ${itemCount === 1 ? 'item' : 'items'}`);
    favoritesCountSpan.textContent = String(favorites.size);
    favoritesToggleBtn.setAttribute('aria-label', `View favorites, ${favorites.size} ${favorites.size === 1 ? 'item' : 'items'}`);
}

function renderShoppingPanel() {
    const isCart = activeShoppingPanel === 'cart';
    shoppingPanelTitle.textContent = isCart ? 'Your Cart' : 'Your Favorites';
    shoppingPanelItems.replaceChildren();

    const items = [...productCards]
        .map(getProduct)
        .filter(product => isCart ? cart.has(product.id) : favorites.has(product.id));

    if (!items.length) {
        const emptyMessage = document.createElement('p');
        emptyMessage.className = 'shopping-panel-empty';
        emptyMessage.textContent = isCart ? 'Your cart is empty.' : 'You have no favorite items yet.';
        shoppingPanelItems.append(emptyMessage);
        return;
    }

    items.forEach(product => {
        const row = document.createElement('div');
        row.className = 'shopping-item';

        const image = document.createElement('img');
        image.src = product.image;
        image.alt = product.name;

        const details = document.createElement('div');
        details.className = 'shopping-item-details';
        const name = document.createElement('strong');
        name.textContent = product.name;
        const price = document.createElement('span');
        price.textContent = `$${product.price.toLocaleString()}${isCart && cart.get(product.id) > 1 ? ` · Qty ${cart.get(product.id)}` : ''}`;
        details.append(name, price);

        const removeButton = document.createElement('button');
        removeButton.className = 'shopping-item-remove';
        removeButton.type = 'button';
        removeButton.dataset.productId = product.id;
        removeButton.dataset.removeFrom = isCart ? 'cart' : 'favorites';
        removeButton.setAttribute('aria-label', `Remove ${product.name} from ${isCart ? 'cart' : 'favorites'}`);
        removeButton.innerHTML = '<i class="fa-solid fa-trash" aria-hidden="true"></i>';

        row.append(image, details, removeButton);
        shoppingPanelItems.append(row);
    });
}

function openShoppingPanel(panel) {
    activeShoppingPanel = panel;
    renderShoppingPanel();
    shoppingPanel.hidden = false;
    cartToggleBtn.setAttribute('aria-expanded', String(panel === 'cart'));
    favoritesToggleBtn.setAttribute('aria-expanded', String(panel === 'favorites'));
}

function closeShoppingPanel() {
    shoppingPanel.hidden = true;
    cartToggleBtn.setAttribute('aria-expanded', 'false');
    favoritesToggleBtn.setAttribute('aria-expanded', 'false');
}

cartToggleBtn.setAttribute('aria-controls', 'shoppingPanel');
cartToggleBtn.setAttribute('aria-expanded', 'false');
favoritesToggleBtn.setAttribute('aria-controls', 'shoppingPanel');
favoritesToggleBtn.setAttribute('aria-expanded', 'false');
cartToggleBtn.addEventListener('click', () => openShoppingPanel('cart'));
favoritesToggleBtn.addEventListener('click', () => openShoppingPanel('favorites'));
shoppingPanelClose.addEventListener('click', closeShoppingPanel);
document.addEventListener('click', event => {
    if (!shoppingPanel.hidden && !shoppingPanel.contains(event.target) &&
        !cartToggleBtn.contains(event.target) && !favoritesToggleBtn.contains(event.target)) {
        closeShoppingPanel();
    }
});
document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && !shoppingPanel.hidden) {
        closeShoppingPanel();
    }
});

updateProductButtons();

filterSidebarToggle.addEventListener('click', () => {
    const isExpanded = filterSidebarToggle.getAttribute('aria-expanded') === 'true';
    filterSidebarToggle.setAttribute('aria-expanded', String(!isExpanded));
    filterSidebarContent.hidden = isExpanded;
});

menuToggle.addEventListener('click', () => {
    const isExpanded = menuToggle.getAttribute('aria-expanded') === 'true';
    menuToggle.setAttribute('aria-expanded', String(!isExpanded));
    menuToggle.setAttribute('aria-label', isExpanded ? 'Open navigation menu' : 'Close navigation menu');
    menuIcon.classList.toggle('fa-bars', isExpanded);
    menuIcon.classList.toggle('fa-xmark', !isExpanded);
    primaryNavigation.classList.toggle('is-open', !isExpanded);
});

function closeNavigation() {
    menuToggle.setAttribute('aria-expanded', 'false');
    menuToggle.setAttribute('aria-label', 'Open navigation menu');
    menuIcon.classList.replace('fa-xmark', 'fa-bars');
    primaryNavigation.classList.remove('is-open');
}

primaryNavigation.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', closeNavigation);
});

document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && menuToggle.getAttribute('aria-expanded') === 'true') {
        closeNavigation();
        menuToggle.focus();
    }
});

// Expand and collapse each filter group independently.
document.querySelectorAll('.filter-title-row').forEach(toggle => {
    const panel = document.getElementById(toggle.getAttribute('aria-controls'));
    const icon = toggle.querySelector('.toggle-icon');

    toggle.addEventListener('click', () => {
        const isExpanded = toggle.getAttribute('aria-expanded') === 'true';
        toggle.setAttribute('aria-expanded', String(!isExpanded));
        panel.hidden = isExpanded;
        icon.textContent = isExpanded ? '+' : '−';
    });
});

// Filter Function
function applyFilters() {
    let visibleCount = 0;

    productCards.forEach(card => {
        const cardCategory = card.getAttribute('data-category');
        const cardMaterial = card.getAttribute('data-material');
        const cardFinish = card.getAttribute('data-finish');
        const cardPrice = Number(card.getAttribute('data-price'));
        const cardAvailability = card.getAttribute('data-availability');

        // Check if card matches active filters
        const matchesCategory = (activeCategory === 'all' || cardCategory === activeCategory);
        const matchesMaterial = (activeMaterial === 'all' || cardMaterial === activeMaterial);
        const matchesFinish = activeFinish === 'all' || cardFinish === activeFinish;
        const matchesPrice = (cardPrice <= maxPrice);
        const matchesQuickPick = (
            activeQuickPick === 'all' ||
            (activeQuickPick === 'under-1000' && cardPrice < 1000) ||
            (activeQuickPick === '1000-2500' && cardPrice >= 1000 && cardPrice <= 2500)
        );
        const matchesAvailability = activeAvailability === 'all' || cardAvailability === activeAvailability;

        if (matchesCategory && matchesMaterial && matchesFinish && matchesPrice && matchesQuickPick && matchesAvailability) {
            card.style.display = 'flex';
            visibleCount++;
        } else {
            card.style.display = 'none';
        }
    });

    resultCountSpan.textContent = `${visibleCount} ${visibleCount === 1 ? 'item' : 'items'}`;
}

// Category Filter Buttons
document.querySelectorAll('#categoryFilter .filter-pill').forEach(pill => {
    pill.addEventListener('click', (e) => {
        document.querySelectorAll('#categoryFilter .filter-pill').forEach(p => p.classList.remove('active'));
        e.target.classList.add('active');
        activeCategory = e.target.getAttribute('data-category');
        applyFilters();
    });
});

// Quick Picks
document.querySelectorAll('#quickFilter .filter-pill').forEach(pill => {
    pill.addEventListener('click', (e) => {
        document.querySelectorAll('#quickFilter .filter-pill').forEach(p => p.classList.remove('active'));
        e.currentTarget.classList.add('active');
        activeQuickPick = e.currentTarget.getAttribute('data-quick');
        applyFilters();
    });
});

// Material Filter Buttons
document.querySelectorAll('#materialFilter .filter-pill').forEach(pill => {
    pill.addEventListener('click', (e) => {
        document.querySelectorAll('#materialFilter .filter-pill').forEach(p => p.classList.remove('active'));
        e.target.classList.add('active');
        activeMaterial = e.target.getAttribute('data-material');
        applyFilters();
    });
});

// Finish Filter Buttons
document.querySelectorAll('#finishFilter .finish-pill').forEach(pill => {
    pill.addEventListener('click', (e) => {
        document.querySelectorAll('#finishFilter .finish-pill').forEach(option => option.classList.remove('active'));
        e.currentTarget.classList.add('active');
        activeFinish = e.currentTarget.getAttribute('data-finish');
        applyFilters();
    });
});

// Availability Filter Buttons
document.querySelectorAll('#availabilityFilter .filter-pill').forEach(pill => {
    pill.addEventListener('click', (e) => {
        document.querySelectorAll('#availabilityFilter .filter-pill').forEach(p => p.classList.remove('active'));
        e.currentTarget.classList.add('active');
        activeAvailability = e.currentTarget.getAttribute('data-availability');
        applyFilters();
    });
});

// Price Slider
priceRangeInput.addEventListener('input', (e) => {
    maxPrice = Number(e.target.value);
    maxPriceLabel.textContent = `$${maxPrice.toLocaleString()}`;
    applyFilters();
});

// Cart and Wishlist Interactions
document.getElementById('productGrid').addEventListener('click', event => {
    const button = event.target.closest('.cart-add-btn, .wishlist-btn');
    if (!button) return;

    const card = button.closest('.product-card');
    const product = getProduct(card);

    if (button.classList.contains('cart-add-btn')) {
        cart.set(product.id, (cart.get(product.id) || 0) + 1);
    } else if (favorites.has(product.id)) {
        favorites.delete(product.id);
    } else {
        favorites.add(product.id);
    }

    updateProductButtons();
    if (!shoppingPanel.hidden) renderShoppingPanel();
});

shoppingPanelItems.addEventListener('click', event => {
    const removeButton = event.target.closest('[data-product-id]');
    if (!removeButton) return;

    const { productId, removeFrom } = removeButton.dataset;
    if (removeFrom === 'cart') {
        cart.delete(productId);
    } else if (removeFrom === 'favorites') {
        favorites.delete(productId);
    }

    updateProductButtons();
    renderShoppingPanel();
});