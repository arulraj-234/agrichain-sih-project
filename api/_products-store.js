// Simple in-memory storage for demo purposes
// In production, this would be a database

// Global storage that persists during the serverless function lifecycle
global.productsStore = global.productsStore || {
    products: [
        {
            id: '1',
            name: 'Organic Tomatoes',
            description: 'Fresh organic tomatoes from local farm',
            quantity: 100,
            pricePerUnit: 50,
            origin: 'Farm A, Maharashtra',
            currentState: 0,
            isOrganic: true,
            timestamp: Date.now()
        },
        {
            id: '2',
            name: 'Basmati Rice',
            description: 'Premium quality basmati rice',
            quantity: 500,
            pricePerUnit: 120,
            origin: 'Farm B, Punjab',
            currentState: 1,
            isOrganic: false,
            timestamp: Date.now()
        },
        {
            id: '3',
            name: 'Organic Mangoes',
            description: 'Sweet Alphonso mangoes',
            quantity: 200,
            pricePerUnit: 200,
            origin: 'Farm C, Ratnagiri',
            currentState: 2,
            isOrganic: true,
            timestamp: Date.now()
        }
    ],
    lastUpdated: Date.now()
};

export function getProducts() {
    return global.productsStore.products;
}

export function addProduct(product) {
    global.productsStore.products.push(product);
    global.productsStore.lastUpdated = Date.now();
    return product;
}

export function getProductById(id) {
    return global.productsStore.products.find(p => p.id === id);
}

export function getProductsCount() {
    return global.productsStore.products.length;
}
