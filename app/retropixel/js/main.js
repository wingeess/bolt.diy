document.addEventListener('DOMContentLoaded', () => {
    const cartItemsBody = document.getElementById('cart-items-body');
    const cartSubtotalEl = document.getElementById('cart-subtotal');
    const cartShippingEl = document.getElementById('cart-shipping'); // Assuming fixed shipping for now
    const cartTotalEl = document.getElementById('cart-total');
    const addToCartButtons = document.querySelectorAll('.add-to-cart');

    // Initialize cart from localStorage or as an empty array
    let cart = JSON.parse(localStorage.getItem('retroPixelCart')) || [];

    // --- Cart Management Functions ---
    function saveCart() {
        localStorage.setItem('retroPixelCart', JSON.stringify(cart));
    }

    function addToCart(productId, quantity = 1) {
        const existingProductIndex = cart.findIndex(item => item.id === productId);
        if (existingProductIndex > -1) {
            cart[existingProductIndex].quantity += quantity;
        } else {
            // In a real app, product details (name, price) would be fetched from a source
            // For now, we'll use placeholder data if adding from a non-catalog context
            let productData = getProductDetails(productId); // Helper to get product details
            cart.push({ ...productData, quantity });
        }
        saveCart();
        updateCartDisplay(); // Update display if on cart page
        alert(`${productId} added to cart!`); // Simple feedback
    }

    function updateQuantity(productId, newQuantity) {
        const productIndex = cart.findIndex(item => item.id === productId);
        if (productIndex > -1) {
            if (newQuantity > 0) {
                cart[productIndex].quantity = newQuantity;
            } else {
                cart.splice(productIndex, 1); // Remove if quantity is 0 or less
            }
            saveCart();
            updateCartDisplay();
        }
    }

    function removeFromCart(productId) {
        cart = cart.filter(item => item.id !== productId);
        saveCart();
        updateCartDisplay();
    }

    // --- Helper to get product details (simulated) ---
    // In a real app, this would come from an API or a predefined product list
    function getProductDetails(productId) {
        const products = {
            'snes': { id: 'snes', name: 'Super Nintendo', price: 150 },
            'megadrive': { id: 'megadrive', name: 'Sega Mega Drive', price: 120 },
            'ps1': { id: 'ps1', name: 'PlayStation 1', price: 100 },
            'n64': { id: 'n64', name: 'Nintendo 64 Console', price: 180 },
            'zelda_oot': { id: 'zelda_oot', name: 'Zelda: Ocarina of Time (N64)', price: 60 },
            'snes_sf2': { id: 'snes_sf2', name: 'Street Fighter II (SNES)', price: 45 },
            'ps1_ff7': { id: 'ps1_ff7', name: 'Final Fantasy VII (PS1)', price: 50 },
            'snes_console_detail': { id: 'snes_console_detail', name: 'Super Nintendo Entertainment System', price: 150},
            'snes_mario_world': {id: 'snes_mario_world', name: 'Super Mario World (SNES)', price: 50},
            'snes_controller': {id: 'snes_controller', name: 'SNES Controller', price: 25}
            // Add other products referenced by data-id attributes here
        };
        return products[productId] || { id: productId, name: `Product ${productId}`, price: 0 }; // Default if not found
    }


    // --- Display Functions (primarily for cart.html) ---
    function updateCartDisplay() {
        if (!cartItemsBody || !cartSubtotalEl || !cartTotalEl) {
            // Not on cart page or elements are missing
            return;
        }

        cartItemsBody.innerHTML = ''; // Clear existing items
        let subtotal = 0;

        if (cart.length === 0) {
            cartItemsBody.innerHTML = '<tr><td colspan="5">Your cart is empty.</td></tr>';
        } else {
            cart.forEach(item => {
                const itemTotal = item.price * item.quantity;
                subtotal += itemTotal;

                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td>${item.name}</td>
                    <td>€${item.price.toFixed(2)}</td>
                    <td><input type="number" value="${item.quantity}" min="1" class="item-quantity" data-id="${item.id}"></td>
                    <td>€${itemTotal.toFixed(2)}</td>
                    <td><button class="remove-item btn" data-id="${item.id}">Remove</button></td>
                `;
                cartItemsBody.appendChild(tr);
            });
        }

        const shippingCost = cart.length > 0 ? 10 : 0; // Fixed shipping if cart not empty
        if(cartShippingEl) cartShippingEl.textContent = `€${shippingCost.toFixed(2)}`;

        cartSubtotalEl.textContent = `€${subtotal.toFixed(2)}`;
        cartTotalEl.textContent = `€${(subtotal + shippingCost).toFixed(2)}`;

        // Re-attach event listeners for new quantity inputs and remove buttons
        attachCartItemEventListeners();
    }

    function attachCartItemEventListeners() {
        document.querySelectorAll('.item-quantity').forEach(input => {
            input.addEventListener('change', (e) => {
                const newQuantity = parseInt(e.target.value, 10);
                const productId = e.target.dataset.id;
                updateQuantity(productId, newQuantity);
            });
        });

        document.querySelectorAll('.remove-item').forEach(button => {
            button.addEventListener('click', (e) => {
                const productId = e.target.dataset.id;
                removeFromCart(productId);
            });
        });
    }

    // --- Event Listeners ---
    // Add to cart buttons (typically on catalog or product pages)
    addToCartButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            const productId = e.target.dataset.id;
            const quantityInput = document.getElementById('quantity'); // For product details page
            const quantity = quantityInput ? parseInt(quantityInput.value, 10) : 1;
            addToCart(productId, quantity);
        });
    });

    // Initial display update for cart page
    if (window.location.pathname.endsWith('cart.html')) {
        updateCartDisplay();
    }

    // Price range filter display update on catalog page
    const priceFilter = document.getElementById('price-filter');
    const priceValue = document.getElementById('price-value');
    if (priceFilter && priceValue) {
        priceFilter.addEventListener('input', function() {
            priceValue.textContent = `€${this.value}`;
        });
    }
});
