# Near2Door Frontend Tests

This directory contains comprehensive test suites for the Near2Door frontend application, covering unit tests, integration tests, and various testing scenarios.

## Test Files

### `test_frontend.js`
**Unit tests for frontend components and utilities**

Covers:
- **Utility Tests**: Cart item normalization, merging duplicate items
- **Search Logic**: Sorting by price and distance, product name matching
- **API Integration**: URL configuration, query parameter construction
- **Form Validation**: Email validation, password strength, shop registration form
- **UI State**: Cart count, sort toggle, modal management
- **Notifications**: Toast lifecycle, button state management

**Key Test Cases:**
- `testNormalizeCartItem()` - Ensures consistent item structure from various API responses
- `testMergeCartItems()` - Verifies duplicate items are merged with quantities summed
- `testSortByPrice()` - Tests ascending price sorting
- `testSortByDistance()` - Tests distance-based shop sorting
- `testProductNameMatching()` - Tests search query filtering
- `testEmailValidation()` - Validates email format
- `testPasswordStrength()` - Checks minimum password requirements
- `testCartCount()` - Calculates total items in cart
- `testModalState()` - Tests modal open/close lifecycle

### `test_frontend_integration.js`
**Integration tests for complete workflows and feature interactions**

Covers:
- **Workflow Integration**: Complete customer shopping flow, shop management, admin approval
- **Data Transformation**: Cart to order conversion, API response normalization, location processing
- **Error Handling**: Search error handling, cart validation
- **Performance**: Large cart handling, filtering performance

**Key Test Cases:**
- `testCustomerShoppingFlow()` - Tests complete customer journey from sign-in to order
- `testShopManagementFlow()` - Tests shop owner operations
- `testAdminApprovalFlow()` - Tests admin approval workflow for new shops
- `testCartToOrderConversion()` - Verifies cart is correctly converted to order
- `testAPIResponseNormalization()` - Tests normalization of inconsistent API responses
- `testLocationDataProcessing()` - Tests distance calculation and location enrichment
- `testSearchErrorHandling()` - Tests error scenarios in search
- `testCartValidationErrors()` - Tests cart item validation
- `testLargeCartHandling()` - Performance test with 1000 items
- `testFilteringPerformance()` - Performance test with 5000 products

## Running the Tests

### Run All Tests
```bash
# From the project root
node tests/run_tests.js

# Or from the tests directory
node run_tests.js
```

### Run Individual Test Files
```bash
# Frontend unit tests only
node tests/test_frontend.js

# Integration tests only
node tests/test_frontend_integration.js
```

### Run Specific Tests (using Node.js)
```bash
# Extract and run a specific test
node -e "const tests = require('./tests/test_frontend.js'); tests.runAllTests();"
```

## Test Coverage

### Unit Testing Coverage
- ✅ Cart management utilities
- ✅ Product search and filtering
- ✅ Form validation
- ✅ UI state management
- ✅ Notification system
- ✅ Authentication flows

### Integration Testing Coverage
- ✅ End-to-end customer shopping workflow
- ✅ Shop management operations
- ✅ Admin approval processes
- ✅ Data transformation pipelines
- ✅ Error handling and recovery
- ✅ Performance with large datasets

## Test Statistics

| Category | Tests | Coverage |
|----------|-------|----------|
| Unit Tests | 13 | Core utilities & components |
| Integration Tests | 10 | Complete workflows |
| **Total** | **23** | **Full application flow** |

## Testing Approach

### Assertion-Based Testing
All tests use `console.assert()` for validation:
```javascript
console.assert(condition, 'Error message if assertion fails');
```

### Logging
Tests provide clear output:
- ✓ marks indicate successful tests
- Error messages describe failures
- Grouped output by test category

### Performance Testing
Includes benchmarks for:
- Large cart calculations (1000 items)
- Product filtering (5000 items)
- Distance calculations
- Data transformations

## Example Test Output

```
========== RUNNING FRONTEND TESTS ==========

--- Utility Tests ---
✓ Test: normalizeItem with full fields passed
✓ Test: normalizeItem with _id passed
...

========== ALL TESTS PASSED ✓ ==========
```

## Test Scenarios

### Customer Journey
1. Sign in
2. Search for products
3. Select shop
4. Add items to cart
5. Calculate total
6. Proceed to checkout
7. Clear cart

### Shop Operations
1. Sign in as shop owner
2. Load shop profile
3. Add products
4. Receive orders
5. Update order status
6. Manage inventory

### Admin Functions
1. Sign in as admin
2. Review pending shops
3. Approve/reject applications
4. Manage approvals

## Data Validation

### Cart Item Requirements
- `id` or `_id` (product identifier)
- `name` or `title`
- `price` or `cost` (must be numeric)
- `quantity` (defaults to 1)
- `shopId` or `shop_id`

### Form Validation
- **Email**: Must match pattern `^\S+@\S+\.\S+$`
- **Password**: Minimum 6 characters
- **Shop Name**: Required non-empty string
- **Location**: Required non-empty string

### API Response Normalization
Handles multiple field name conventions:
- `id` / `_id` / `productId`
- `name` / `title`
- `price` / `cost`
- `images` / `photos`
- `shopId` / `shop_id` / `shop.id`

## Performance Benchmarks

| Operation | Scale | Target | Status |
|-----------|-------|--------|--------|
| Cart calculation | 1000 items | < 10ms | ✓ |
| Product filtering | 5000 items | < 50ms | ✓ |
| Search operation | 100 results | < 100ms | ✓ |

## Debugging Failed Tests

### Check Error Details
```bash
# Run tests with expanded error logging
node tests/run_tests.js 2>&1 | tee test_output.log
```

### Debug Specific Test
```bash
# Add console.log statements
node -p "var t = require('./tests/test_frontend.js'); t.runAllTests()"
```

### Verify Test Independence
Each test is independent and can be run in any order. Tests modify local variables only, not global state.

## Adding New Tests

### Template for New Test
```javascript
/**
 * Test: [Description]
 */
function testMyFeature() {
  // Setup
  let state = {};
  
  // Execute
  state.value = computeValue();
  
  // Assert
  console.assert(state.value === expected, 'My test failed');
  console.log('✓ Test: my feature passed');
}
```

### Add to Test Runner
1. Create test function
2. Call it in `runAllTests()` or `runAllIntegrationTests()`
3. Run full test suite to verify

## CI/CD Integration

### GitHub Actions Example
```yaml
- name: Run Frontend Tests
  run: node tests/run_tests.js
```

### Pre-commit Hook
```bash
#!/bin/sh
node tests/run_tests.js || exit 1
```

## Dependencies

- **Node.js**: v14+ (uses standard JavaScript features)
- **No external dependencies**: Pure JavaScript, no npm packages required

## Notes

- Tests are independent and idempotent
- No database or API calls (all mocked)
- Can run thousands of tests < 1 second
- Suitable for integration into any CI/CD pipeline
- Browser-compatible code (no Node.js-specific features except exports)

## Support

For issues or questions about tests:
1. Check test output for specific assertion failures
2. Review test file comments for implementation details
3. Refer to `test_frontend.js` for utility patterns
4. Refer to `test_frontend_integration.js` for workflow examples
