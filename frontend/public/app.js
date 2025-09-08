// API Base URL - uses relative path for deployment
const API_URL = '/api';

// State management
let currentSection = 'dashboard';

// Initialize app
document.addEventListener('DOMContentLoaded', () => {
    loadDashboard();
    checkNetworkStatus();
});

// Navigation
function showSection(sectionId) {
    // Hide all sections
    document.querySelectorAll('.content-section').forEach(section => {
        section.style.display = 'none';
    });
    
    // Show selected section
    document.getElementById(sectionId).style.display = 'block';
    
    // Update nav buttons
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    event.target.classList.add('active');
    
    // Load section data
    switch(sectionId) {
        case 'dashboard':
            loadDashboard();
            break;
        case 'products':
            loadProducts();
            break;
        case 'stakeholders':
            loadStakeholders();
            break;
    }
}

// Dashboard functions
async function loadDashboard() {
    try {
        // Load products count
        const productsRes = await fetch(`${API_URL}/products-mock-sample`);
        const productsData = await productsRes.json();
        document.getElementById('totalProducts').textContent = productsData.count || 0;
        
        // Load stakeholders count
        const stakeholdersRes = await fetch(`${API_URL}/stakeholders-mock-sample`);
        const stakeholdersData = await stakeholdersRes.json();
        document.getElementById('totalStakeholders').textContent = stakeholdersData.count || 0;
        
        // Mock transactions count
        document.getElementById('todayTransactions').textContent = '7';
    } catch (error) {
        console.error('Error loading dashboard:', error);
    }
}

async function checkNetworkStatus() {
    try {
        const response = await fetch(`${API_URL}/health`);
        const data = await response.json();
        
        if (data.status === 'OK') {
            document.getElementById('networkStatus').textContent = 'Connected';
            document.getElementById('networkStatus').style.color = '#4caf50';
        } else {
            document.getElementById('networkStatus').textContent = 'Disconnected';
            document.getElementById('networkStatus').style.color = '#f44336';
        }
    } catch (error) {
        document.getElementById('networkStatus').textContent = 'Offline';
        document.getElementById('networkStatus').style.color = '#f44336';
    }
}

// Products functions
async function loadProducts() {
    try {
        const response = await fetch(`${API_URL}/products-mock-sample`);
        const data = await response.json();
        
        const productsGrid = document.getElementById('productsGrid');
        productsGrid.innerHTML = '';
        
        if (data.data && data.data.length > 0) {
            data.data.forEach(product => {
                const productCard = createProductCard(product);
                productsGrid.appendChild(productCard);
            });
        } else {
            productsGrid.innerHTML = '<p>No products found</p>';
        }
    } catch (error) {
        console.error('Error loading products:', error);
        document.getElementById('productsGrid').innerHTML = '<p>Error loading products</p>';
    }
}

function createProductCard(product) {
    const card = document.createElement('div');
    card.className = 'product-card';
    
    const stateNames = ['Produced', 'In Transit', 'Received', 'Sold'];
    
    card.innerHTML = `
        <h3>${product.name}</h3>
        <p>${product.description}</p>
        <div class="product-info">
            <div class="info-row">
                <span class="info-label">ID:</span>
                <span class="info-value">#${product.id}</span>
            </div>
            <div class="info-row">
                <span class="info-label">Quantity:</span>
                <span class="info-value">${product.quantity} kg</span>
            </div>
            <div class="info-row">
                <span class="info-label">Price:</span>
                <span class="info-value">₹${product.pricePerUnit}/kg</span>
            </div>
            <div class="info-row">
                <span class="info-label">Origin:</span>
                <span class="info-value">${product.origin}</span>
            </div>
            <div class="info-row">
                <span class="info-label">Status:</span>
                <span class="info-value">${stateNames[product.currentState]}</span>
            </div>
        </div>
        ${product.isOrganic ? '<span class="organic-badge">🌿 Organic</span>' : ''}
        <div style="margin-top: 15px;">
            <button class="btn-primary" onclick="generateQR('${product.id}')">Generate QR</button>
            <button class="btn-secondary" onclick="viewProductDetails('${product.id}')">View Details</button>
        </div>
    `;
    
    return card;
}

function toggleProductForm() {
    const form = document.getElementById('productForm');
    form.style.display = form.style.display === 'none' ? 'block' : 'none';
}

async function createProduct(event) {
    event.preventDefault();
    
    const productData = {
        name: document.getElementById('productName').value,
        description: document.getElementById('productDescription').value,
        quantity: document.getElementById('productQuantity').value,
        pricePerUnit: document.getElementById('productPrice').value,
        origin: document.getElementById('productOrigin').value,
        isOrganic: document.getElementById('productOrganic').checked
    };
    
    try {
        const response = await fetch(`${API_URL}/products-create`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(productData)
        });
        
        const data = await response.json();
        
        if (data.success) {
            alert('Product created successfully!');
            toggleProductForm();
            loadProducts();
            event.target.reset();
        } else {
            alert('Error creating product: ' + (data.message || 'Unknown error'));
        }
    } catch (error) {
        console.error('Error creating product:', error);
        alert('Error creating product. Please try again.');
    }
}

// Stakeholders functions
async function loadStakeholders() {
    try {
        const response = await fetch(`${API_URL}/stakeholders-mock-sample`);
        const data = await response.json();
        
        const stakeholdersGrid = document.getElementById('stakeholdersGrid');
        stakeholdersGrid.innerHTML = '';
        
        if (data.data && data.data.length > 0) {
            data.data.forEach(stakeholder => {
                const stakeholderCard = createStakeholderCard(stakeholder);
                stakeholdersGrid.appendChild(stakeholderCard);
            });
        } else {
            stakeholdersGrid.innerHTML = '<p>No stakeholders found</p>';
        }
    } catch (error) {
        console.error('Error loading stakeholders:', error);
        document.getElementById('stakeholdersGrid').innerHTML = '<p>Error loading stakeholders</p>';
    }
}

function createStakeholderCard(stakeholder) {
    const card = document.createElement('div');
    card.className = 'stakeholder-card';
    
    const typeNames = ['Farmer', 'Distributor', 'Retailer', 'Consumer'];
    
    card.innerHTML = `
        <h3>${stakeholder.name}</h3>
        <div class="stakeholder-info">
            <div class="info-row">
                <span class="info-label">ID:</span>
                <span class="info-value">#${stakeholder.id}</span>
            </div>
            <div class="info-row">
                <span class="info-label">Type:</span>
                <span class="info-value">${typeNames[stakeholder.stakeholderType]}</span>
            </div>
            <div class="info-row">
                <span class="info-label">Location:</span>
                <span class="info-value">${stakeholder.location}</span>
            </div>
            <div class="info-row">
                <span class="info-label">Contact:</span>
                <span class="info-value">${stakeholder.contactInfo}</span>
            </div>
            <div class="info-row">
                <span class="info-label">Status:</span>
                <span class="info-value">${stakeholder.isActive ? '✅ Active' : '❌ Inactive'}</span>
            </div>
        </div>
    `;
    
    return card;
}

// Registration function
async function registerStakeholder(event) {
    event.preventDefault();
    
    const stakeholderData = {
        walletAddress: document.getElementById('walletAddress').value,
        name: document.getElementById('stakeholderName').value,
        contactInfo: document.getElementById('contactInfo').value,
        stakeholderType: parseInt(document.getElementById('stakeholderType').value),
        location: document.getElementById('location').value
    };
    
    try {
        const response = await fetch(`${API_URL}/stakeholders/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(stakeholderData)
        });
        
        const data = await response.json();
        
        if (data.success) {
            alert('Registration successful!');
            event.target.reset();
            showSection('stakeholders');
        } else {
            alert('Registration failed: ' + (data.message || 'Unknown error'));
        }
    } catch (error) {
        console.error('Error registering stakeholder:', error);
        alert('Error registering. Please try again.');
    }
}

// Product tracking
async function trackProduct() {
    const productId = document.getElementById('trackProductId').value;
    
    if (!productId) {
        alert('Please enter a product ID');
        return;
    }
    
    try {
        // Get product details
        const productRes = await fetch(`${API_URL}/products/mock/sample`);
        const productData = await productRes.json();
        const product = productData.data.find(p => p.id === productId);
        
        // Get transaction history
        const transRes = await fetch(`${API_URL}/transactions/mock/sample/${productId}`);
        const transData = await transRes.json();
        
        if (product) {
            displayTrackingResult(product, transData.data);
        } else {
            alert('Product not found');
        }
    } catch (error) {
        console.error('Error tracking product:', error);
        alert('Error tracking product. Please try again.');
    }
}

function displayTrackingResult(product, transactions) {
    const resultDiv = document.getElementById('trackingResult');
    
    let html = `
        <h3>Product: ${product.name}</h3>
        <p>${product.description}</p>
        <div class="product-info">
            <div class="info-row">
                <span class="info-label">Origin:</span>
                <span class="info-value">${product.origin}</span>
            </div>
            <div class="info-row">
                <span class="info-label">Quantity:</span>
                <span class="info-value">${product.quantity} kg</span>
            </div>
            <div class="info-row">
                <span class="info-label">Organic:</span>
                <span class="info-value">${product.isOrganic ? 'Yes 🌿' : 'No'}</span>
            </div>
        </div>
        
        <h4 style="margin-top: 20px;">Supply Chain Journey</h4>
        <div class="journey-timeline">
    `;
    
    // Add harvest event
    html += `
        <div class="timeline-item">
            <h4>🌾 Harvested</h4>
            <p>Date: ${new Date(parseInt(product.harvestDate)).toLocaleDateString()}</p>
            <p>Location: ${product.origin}</p>
        </div>
    `;
    
    // Add transactions
    if (transactions && transactions.length > 0) {
        transactions.forEach(trans => {
            const date = new Date(parseInt(trans.timestamp));
            html += `
                <div class="timeline-item">
                    <h4>📦 Transfer</h4>
                    <p>From: Stakeholder #${trans.fromStakeholder} → To: Stakeholder #${trans.toStakeholder}</p>
                    <p>Date: ${date.toLocaleDateString()} ${date.toLocaleTimeString()}</p>
                    <p>Price: ₹${trans.price}</p>
                    ${trans.notes ? `<p>Notes: ${trans.notes}</p>` : ''}
                </div>
            `;
        });
    }
    
    html += '</div>';
    
    resultDiv.innerHTML = html;
    resultDiv.style.display = 'block';
}

// QR Code generation
async function generateQR(productId) {
    try {
        const response = await fetch(`${API_URL}/qr/generate/${productId}`);
        const data = await response.json();
        
        if (data.success) {
            // Create modal to display QR code
            const modal = document.createElement('div');
            modal.style.cssText = `
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0,0,0,0.5);
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 1000;
            `;
            
            modal.innerHTML = `
                <div style="background: white; padding: 30px; border-radius: 10px; text-align: center;">
                    <h3>QR Code for Product #${productId}</h3>
                    <img src="${data.qrCode}" alt="QR Code" style="margin: 20px 0;">
                    <p>Tracking URL: ${data.trackingUrl}</p>
                    <button class="btn-primary" onclick="this.parentElement.parentElement.remove()">Close</button>
                </div>
            `;
            
            document.body.appendChild(modal);
        }
    } catch (error) {
        console.error('Error generating QR code:', error);
        alert('Error generating QR code. Please try again.');
    }
}

// View product details
function viewProductDetails(productId) {
    document.getElementById('trackProductId').value = productId;
    showSection('track');
    trackProduct();
}

// Auto-refresh dashboard
setInterval(() => {
    if (currentSection === 'dashboard') {
        checkNetworkStatus();
    }
}, 30000); // Check every 30 seconds
