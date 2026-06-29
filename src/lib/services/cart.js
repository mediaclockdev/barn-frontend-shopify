const API_URL = "/api/cart";

export const getCart = async (cartId) => {
    if (!cartId) return { items: [] };
    const res = await fetch(`${API_URL}?cartId=${encodeURIComponent(cartId)}`, {
        headers: {
            "Content-Type": "application/json",
        }
    });
    if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        const error = new Error(err.error || `Failed to fetch cart (${res.status})`);
        error.status = res.status;
        throw error;
    }
    return res.json();
}

export const addToCart = async (cartId, variation_id, quantity) => {
    const res = await fetch(`${API_URL}/add`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ cartId, variation_id, quantity })
    });
    if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        const error = new Error(err.error || `Failed to add to cart (${res.status})`);
        error.status = res.status;
        throw error;
    }
    return res.json();
}

export const updateQuantityAPI = async (cartId, line_id, quantity) => {
    const res = await fetch(`${API_URL}/update`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ cartId, line_id, quantity })
    });
    if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        const error = new Error(err.error || `Failed to update cart (${res.status})`);
        error.status = res.status;
        throw error;
    }
    return res.json();
}

export const removeFromCartAPI = async (cartId, line_id) => {
    const res = await fetch(`${API_URL}/remove`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ cartId, line_id })
    });
    if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        const error = new Error(err.error || `Failed to remove from cart (${res.status})`);
        error.status = res.status;
        throw error;
    }
    return res.json();
}

export const clearCartAPI = async (cartId) => {
    const res = await fetch(`${API_URL}/clear`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ cartId })
    });
    if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        const error = new Error(err.error || `Failed to clear cart (${res.status})`);
        error.status = res.status;
        throw error;
    }
    return res.json();
}

export const mergeCartAPI = async (guest_cart) => {
    // Not needed for simple Shopify cart without customer login, but kept to prevent errors
    return { items: guest_cart };
}