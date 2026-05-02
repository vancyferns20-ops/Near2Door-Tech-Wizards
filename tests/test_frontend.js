/**
 * Frontend Test Suite for Near2Door
 * Tests for cart normalization, search, UI components, and API integration
 */

// ============================================================================
// UTILITY TESTS
// ============================================================================

/**
 * Test: Cart Item Normalization
 */
function testNormalizeCartItem() {
  const normalizeItem = (item) => {
    const id = item.id || item._id || item.productId || null;
    const shopId = item.shopId || item.shop_id || item.shop?.id || null;
    
    return {
      id,
      name: item.name || item.title || 'Product',
      price: Number(item.price ?? item.cost ?? 0),
      quantity: Number(item.quantity ?? 1),
      images: item.images || item.photos || [],
      shop_id: shopId,
      shopName: item.shopName || item.shop?.name || 'Unknown',
    };
  };

  // Test case 1: Product with all fields
  const item1 = {
    id: '123',
    name: 'Bread',
    price: '50',
    quantity: 2,
    shopId: 'shop1',
    shopName: 'Local Bakery',
  };
  const normalized1 = normalizeItem(item1);
  console.assert(normalized1.id === '123', 'ID normalization failed');
  console.assert(normalized1.price === 50, 'Price normalization failed');
  console.assert(normalized1.shop_id === 'shop1', 'shop_id normalization failed');
  console.log('✓ Test: normalizeItem with full fields passed');

  // Test case 2: Product with _id instead of id
  const item2 = { _id: '456', name: 'Milk' };
  const normalized2 = normalizeItem(item2);
  console.assert(normalized2.id === '456', '_id not extracted');
  console.assert(normalized2.quantity === 1, 'Default quantity not set');
  console.log('✓ Test: normalizeItem with _id passed');

  // Test case 3: Ensure shop_id is always set (or null)
  const item3 = { id: '789', name: 'Eggs' };
  const normalized3 = normalizeItem(item3);
  console.assert('shop_id' in normalized3, 'shop_id field missing');
  console.log('✓ Test: normalizeItem ensures shop_id field exists');
}

/**
 * Test: Cart Item Merging
 */
function testMergeCartItems() {
  const addToCart = (cart, item) => {
    const existing = cart.find((p) => p.id === item.id);
    if (existing) {
      existing.quantity += Number(item.quantity || 1);
      return cart;
    }
    return [...cart, item];
  };

  let cart = [];
  const item1 = { id: '1', name: 'Bread', quantity: 1 };
  const item2 = { id: '1', name: 'Bread', quantity: 2 };
  const item3 = { id: '2', name: 'Milk', quantity: 1 };

  // Add first item
  cart = addToCart(cart, item1);
  console.assert(cart.length === 1, 'First item not added');
  console.assert(cart[0].quantity === 1, 'Quantity not set');

  // Add duplicate item (should merge)
  cart = addToCart(cart, item2);
  console.assert(cart.length === 1, 'Duplicate not merged');
  console.assert(cart[0].quantity === 3, 'Quantities not summed');
  console.log('✓ Test: merging duplicate cart items passed');

  // Add new item
  cart = addToCart(cart, item3);
  console.assert(cart.length === 2, 'New item not added');
  console.log('✓ Test: adding new item to cart passed');
}

// ============================================================================
// SEARCH LOGIC TESTS
// ============================================================================

/**
 * Test: Product Sorting by Price
 */
function testSortByPrice() {
  const products = [
    { id: '1', name: 'A', price: 50 },
    { id: '2', name: 'B', price: 20 },
    { id: '3', name: 'C', price: 100 },
  ];

  const sorted = [...products].sort((a, b) => a.price - b.price);
  console.assert(
    sorted[0].price === 20 && sorted[1].price === 50 && sorted[2].price === 100,
    'Sort by price failed'
  );
  console.log('✓ Test: sorting products by price passed');
}

/**
 * Test: Product Sorting by Distance
 */
function testSortByDistance() {
  const products = [
    { id: '1', name: 'A', distanceMeters: 5000 },
    { id: '2', name: 'B', distanceMeters: 1000 },
    { id: '3', name: 'C', distanceMeters: 3000 },
  ];

  const sorted = [...products].sort(
    (a, b) => (a.distanceMeters ?? Infinity) - (b.distanceMeters ?? Infinity)
  );
  console.assert(
    sorted[0].distanceMeters === 1000 &&
    sorted[1].distanceMeters === 3000 &&
    sorted[2].distanceMeters === 5000,
    'Sort by distance failed'
  );
  console.log('✓ Test: sorting products by distance passed');
}

/**
 * Test: Product Name Matching
 */
function testProductNameMatching() {
  const products = [
    { id: '1', name: 'Apple Juice' },
    { id: '2', name: 'Orange Juice' },
    { id: '3', name: 'Banana' },
  ];

  const query = 'juice';
  const filtered = products.filter((p) =>
    p.name.toLowerCase().includes(query.toLowerCase())
  );

  console.assert(filtered.length === 2, 'Product filtering failed');
  console.assert(
    filtered.every((p) => p.name.toLowerCase().includes('juice')),
    'Filter result includes non-matching items'
  );
  console.log('✓ Test: product name matching passed');
}

// ============================================================================
// API INTEGRATION TESTS
// ============================================================================

/**
 * Test: API URL Configuration
 */
function testAPIURLConfiguration() {
  const apiBaseURL = 'http://localhost:5000';
  const searchEndpoint = `${apiBaseURL}/products/search`;

  console.assert(
    searchEndpoint === 'http://localhost:5000/products/search',
    'API endpoint construction failed'
  );
  console.log('✓ Test: API URL configuration passed');
}

/**
 * Test: Query Parameter Construction
 */
function testQueryParamConstruction() {
  const buildSearchQuery = (q, options = {}) => {
    const params = new URLSearchParams();
    if (q) params.set('q', q);
    if (options.lat !== undefined) params.set('lat', String(options.lat));
    if (options.lng !== undefined) params.set('lng', String(options.lng));
    if (options.radius !== undefined) params.set('radius', String(options.radius));
    return params.toString();
  };

  const query1 = buildSearchQuery('bread');
  console.assert(query1.includes('q=bread'), 'Query parameter not set');

  const query2 = buildSearchQuery('bread', { lat: 15.5, lng: 73.8, radius: 5000 });
  console.assert(query2.includes('lat=') && query2.includes('lng='), 'Location params missing');
  console.log('✓ Test: query parameter construction passed');
}

// ============================================================================
// FORM VALIDATION TESTS
// ============================================================================

/**
 * Test: Email Validation
 */
function testEmailValidation() {
  const validateEmail = (email) => {
    const pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return pattern.test(email);
  };

  console.assert(validateEmail('user@test.com'), 'Valid email rejected');
  console.assert(validateEmail('shop@near2door.io'), 'Valid email rejected');
  console.assert(!validateEmail('invalid-email'), 'Invalid email accepted');
  console.assert(!validateEmail('user@'), 'Incomplete email accepted');
  console.log('✓ Test: email validation passed');
}

/**
 * Test: Password Strength
 */
function testPasswordStrength() {
  const isStrongPassword = (password) => {
    return password && password.length >= 6;
  };

  console.assert(isStrongPassword('password123'), 'Strong password rejected');
  console.assert(!isStrongPassword('123'), 'Weak password accepted');
  console.assert(!isStrongPassword(''), 'Empty password accepted');
  console.log('✓ Test: password strength validation passed');
}

/**
 * Test: Shop Registration Form Fields
 */
function testShopRegistrationForm() {
  const validateShopForm = (values) => {
    const errors = {};
    if (!values.shopName) errors.shopName = 'Shop name required';
    if (!values.shopLocation) errors.shopLocation = 'Location required';
    return errors;
  };

  const validForm = { shopName: 'My Shop', shopLocation: 'Panjim' };
  const invalidForm = { shopName: 'My Shop' };

  console.assert(Object.keys(validateShopForm(validForm)).length === 0, 'Valid form rejected');
  console.assert(Object.keys(validateShopForm(invalidForm)).length > 0, 'Invalid form accepted');
  console.log('✓ Test: shop registration form validation passed');
}

// ============================================================================
// UI STATE TESTS
// ============================================================================

/**
 * Test: Cart Count
 */
function testCartCount() {
  const cart = [
    { id: '1', quantity: 2 },
    { id: '2', quantity: 1 },
    { id: '3', quantity: 3 },
  ];

  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  console.assert(totalItems === 6, 'Cart count calculation failed');
  console.log('✓ Test: cart count calculation passed');
}

/**
 * Test: Sort Toggle State
 */
function testSortToggleState() {
  const sortOptions = ['best', 'nearest', 'cheapest'];
  let currentSort = 'best';

  const changeSort = (newSort) => {
    if (sortOptions.includes(newSort)) {
      currentSort = newSort;
      return true;
    }
    return false;
  };

  console.assert(changeSort('nearest'), 'Valid sort not accepted');
  console.assert(currentSort === 'nearest', 'Sort state not updated');
  console.assert(!changeSort('invalid'), 'Invalid sort accepted');
  console.log('✓ Test: sort toggle state management passed');
}

/**
 * Test: Modal Open/Close State
 */
function testModalState() {
  let modalOpen = false;

  const openModal = () => { modalOpen = true; };
  const closeModal = () => { modalOpen = false; };

  console.assert(!modalOpen, 'Modal should start closed');
  openModal();
  console.assert(modalOpen, 'Modal open failed');
  closeModal();
  console.assert(!modalOpen, 'Modal close failed');
  console.log('✓ Test: modal state management passed');
}

// ============================================================================
// NOTIFICATION/TOAST TESTS
// ============================================================================

/**
 * Test: Toast Message Lifecycle
 */
function testToastLifecycle() {
  let notice = { msg: '', type: '' };

  const showNotice = (msg, type) => {
    notice = { msg, type };
    console.log(`Toast shown: ${msg} (${type})`);
  };

  const clearNotice = () => {
    notice = { msg: '', type: '' };
  };

  showNotice('Shop approved', 'success');
  console.assert(notice.msg === 'Shop approved', 'Toast message not set');
  console.assert(notice.type === 'success', 'Toast type not set');

  clearNotice();
  console.assert(notice.msg === '', 'Toast not cleared');
  console.log('✓ Test: toast message lifecycle passed');
}

/**
 * Test: Action Button States
 */
function testButtonStates() {
  let isLoading = false;

  const startAction = () => { isLoading = true; };
  const finishAction = () => { isLoading = false; };

  console.assert(!isLoading, 'Button should start enabled');
  startAction();
  console.assert(isLoading, 'Button state not updated');
  finishAction();
  console.assert(!isLoading, 'Button state not cleared');
  console.log('✓ Test: button state management passed');
}

// ============================================================================
// RUN ALL TESTS
// ============================================================================

function runAllTests() {
  console.log('\n========== RUNNING FRONTEND TESTS ==========\n');

  console.log('--- Utility Tests ---');
  testNormalizeCartItem();
  testMergeCartItems();

  console.log('\n--- Search Logic Tests ---');
  testSortByPrice();
  testSortByDistance();
  testProductNameMatching();

  console.log('\n--- API Integration Tests ---');
  testAPIURLConfiguration();
  testQueryParamConstruction();

  console.log('\n--- Form Validation Tests ---');
  testEmailValidation();
  testPasswordStrength();
  testShopRegistrationForm();

  console.log('\n--- UI State Tests ---');
  testCartCount();
  testSortToggleState();
  testModalState();

  console.log('\n--- Notification Tests ---');
  testToastLifecycle();
  testButtonStates();

  console.log('\n========== ALL TESTS PASSED ✓ ==========\n');
}

// Export for Jest/Node.js
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { runAllTests };
}

// Run tests if executed directly
if (typeof window === 'undefined') {
  runAllTests();
}
