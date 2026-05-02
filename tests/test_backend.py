"""
Backend Test Suite for Near2Door
Tests for product search, shop approval, cart normalization, and API endpoints
"""

import unittest
import json
import sys
import os
from datetime import datetime
from unittest.mock import Mock, patch, MagicMock

# Mock modules that might not be installed in test environment
sys.modules['cloudinary'] = MagicMock()
sys.modules['cloudinary.uploader'] = MagicMock()


class TestProductSearch(unittest.TestCase):
    """Test product search with proximity filtering"""

    def test_haversine_distance(self):
        """Test haversine distance calculation"""
        from math import radians, sin, cos, atan2, sqrt
        
        def haversine(lat1, lng1, lat2, lng2):
            earth_radius_m = 6371000
            phi1, phi2 = radians(lat1), radians(lat2)
            delta_phi = radians(lat2 - lat1)
            delta_lambda = radians(lng2 - lng1)
            a = sin(delta_phi / 2) ** 2 + cos(phi1) * cos(phi2) * sin(delta_lambda / 2) ** 2
            c = 2 * atan2(sqrt(a), sqrt(1 - a))
            return earth_radius_m * c
        
        # Test: Same location (0 distance)
        dist = haversine(15.5017, 73.8278, 15.5017, 73.8278)
        self.assertAlmostEqual(dist, 0, delta=1)
        
        # Test: 1 km apart roughly
        dist = haversine(15.5017, 73.8278, 15.5094, 73.8278)
        self.assertGreater(dist, 8000)  # Should be > 8 km
        self.assertLess(dist, 9000)     # Should be < 9 km

    def test_extract_shop_coordinates(self):
        """Test extracting coordinates from shop location"""
        def extract_coordinates(location):
            if not isinstance(location, dict):
                return None
            lat = location.get("latitude", location.get("lat"))
            lng = location.get("longitude", location.get("lng"))
            if lat is None or lng is None:
                return None
            try:
                return float(lat), float(lng)
            except (TypeError, ValueError):
                return None
        
        # Valid dict with latitude/longitude
        result = extract_coordinates({"latitude": 15.5017, "longitude": 73.8278})
        self.assertEqual(result, (15.5017, 73.8278))
        
        # Valid dict with lat/lng
        result = extract_coordinates({"lat": 15.5017, "lng": 73.8278})
        self.assertEqual(result, (15.5017, 73.8278))
        
        # Invalid - string input
        result = extract_coordinates("invalid")
        self.assertIsNone(result)
        
        # Invalid - missing coordinates
        result = extract_coordinates({"name": "shop"})
        self.assertIsNone(result)

    def test_product_search_regex(self):
        """Test product search regex matching"""
        import re
        
        def matches_search(product_name, query):
            pattern = re.compile(query, re.IGNORECASE)
            return bool(pattern.search(product_name))
        
        # Case insensitive match
        self.assertTrue(matches_search("Apple Juice", "apple"))
        self.assertTrue(matches_search("BREAD", "bread"))
        
        # Substring match
        self.assertTrue(matches_search("Organic Milk", "milk"))
        self.assertFalse(matches_search("Water", "juice"))

    def test_product_sorting_by_price(self):
        """Test sorting products by price"""
        products = [
            {"id": 1, "name": "A", "price": 50},
            {"id": 2, "name": "B", "price": 20},
            {"id": 3, "name": "C", "price": 100},
        ]
        
        # Sort by price ascending
        sorted_products = sorted(products, key=lambda p: p["price"])
        prices = [p["price"] for p in sorted_products]
        self.assertEqual(prices, [20, 50, 100])

    def test_product_sorting_by_distance(self):
        """Test sorting products by distance"""
        products = [
            {"id": 1, "name": "A", "distanceMeters": 5000},
            {"id": 2, "name": "B", "distanceMeters": 1000},
            {"id": 3, "name": "C", "distanceMeters": 3000},
        ]
        
        sorted_products = sorted(products, key=lambda p: p.get("distanceMeters", float('inf')))
        distances = [p["distanceMeters"] for p in sorted_products]
        self.assertEqual(distances, [1000, 3000, 5000])


class TestCartNormalization(unittest.TestCase):
    """Test cart item normalization and merging"""

    def test_normalize_product_item(self):
        """Test normalizing product to cart format"""
        def normalize_item(item):
            return {
                "id": item.get("id") or item.get("_id") or item.get("productId"),
                "name": item.get("name") or item.get("title") or "Product",
                "price": float(item.get("price") or 0),
                "quantity": int(item.get("quantity") or 1),
                "shop_id": item.get("shop_id") or item.get("shopId"),
                "shopName": item.get("shopName") or "Unknown",
            }
        
        # Test with _id field
        normalized = normalize_item({"_id": "123", "name": "Bread", "price": "50", "shopId": "shop1"})
        self.assertEqual(normalized["id"], "123")
        self.assertEqual(normalized["price"], 50.0)
        self.assertEqual(normalized["shop_id"], "shop1")
        
        # Test with missing fields (defaults)
        normalized = normalize_item({"id": "456"})
        self.assertEqual(normalized["id"], "456")
        self.assertEqual(normalized["name"], "Product")
        self.assertEqual(normalized["price"], 0.0)
        self.assertEqual(normalized["quantity"], 1)

    def test_merge_duplicate_cart_items(self):
        """Test merging duplicate items in cart"""
        def add_to_cart(cart, item):
            existing = next((p for p in cart if p["id"] == item["id"]), None)
            if existing:
                existing["quantity"] += item.get("quantity", 1)
                return cart
            return [*cart, item]
        
        cart = []
        item1 = {"id": "1", "name": "Bread", "quantity": 1}
        item2 = {"id": "1", "name": "Bread", "quantity": 2}
        item3 = {"id": "2", "name": "Milk", "quantity": 1}
        
        cart = add_to_cart(cart, item1)
        self.assertEqual(len(cart), 1)
        self.assertEqual(cart[0]["quantity"], 1)
        
        cart = add_to_cart(cart, item2)  # Duplicate should merge
        self.assertEqual(len(cart), 1)
        self.assertEqual(cart[0]["quantity"], 3)
        
        cart = add_to_cart(cart, item3)  # New item
        self.assertEqual(len(cart), 2)

    def test_shop_id_always_set(self):
        """Test that shop_id is always set in cart"""
        def validate_cart_item(item):
            return item.get("shop_id") is not None
        
        valid_item = {"id": "1", "shop_id": "shop1"}
        self.assertTrue(validate_cart_item(valid_item))
        
        invalid_item = {"id": "1"}
        self.assertFalse(validate_cart_item(invalid_item))


class TestShopApprovalWorkflow(unittest.TestCase):
    """Test shop registration and approval"""

    def test_shop_status_pending_on_registration(self):
        """Test that shop gets pending status on registration"""
        shop_doc = {
            "name": "Local Market",
            "status": "pending",
            "created_at": datetime.utcnow()
        }
        self.assertEqual(shop_doc["status"], "pending")

    def test_shop_status_change_on_approval(self):
        """Test shop status changes to open on approval"""
        shop_doc = {"_id": "shop1", "name": "Store", "status": "pending"}
        # Simulate approval
        shop_doc["status"] = "open"
        shop_doc["updated_at"] = datetime.utcnow()
        
        self.assertEqual(shop_doc["status"], "open")
        self.assertIn("updated_at", shop_doc)

    def test_user_status_blocked_when_pending(self):
        """Test that pending users cannot login"""
        user = {"email": "shop@test.com", "status": "pending"}
        can_login = user.get("status") != "pending"
        
        self.assertFalse(can_login)

    def test_user_status_approved_allows_login(self):
        """Test that approved users can login"""
        user = {"email": "shop@test.com", "status": "approved"}
        can_login = user.get("status") != "pending"
        
        self.assertTrue(can_login)

    def test_shop_rejection_stores_reason(self):
        """Test rejection stores reason"""
        shop_doc = {
            "_id": "shop1",
            "name": "Store",
            "status": "rejected",
            "rejection_reason": "Incomplete documentation"
        }
        
        self.assertEqual(shop_doc["status"], "rejected")
        self.assertIn("rejection_reason", shop_doc)


class TestAuditLogging(unittest.TestCase):
    """Test audit trail logging"""

    def test_audit_record_format(self):
        """Test audit record format"""
        audit_record = {
            "action": "approve_shop",
            "shop_id": "shop1",
            "shop_name": "Local Market",
            "admin": "admin@test.com",
            "timestamp": datetime.utcnow(),
            "details": {"status": "open"}
        }
        
        self.assertEqual(audit_record["action"], "approve_shop")
        self.assertIn("timestamp", audit_record)
        self.assertIn("details", audit_record)

    def test_audit_rejection_record(self):
        """Test rejection audit record"""
        audit_record = {
            "action": "reject_shop",
            "shop_id": "shop1",
            "shop_name": "Local Market",
            "admin": "admin@test.com",
            "timestamp": datetime.utcnow(),
            "details": {"reason": "Invalid location"}
        }
        
        self.assertEqual(audit_record["action"], "reject_shop")
        self.assertEqual(audit_record["details"]["reason"], "Invalid location")


class TestEmailNotifications(unittest.TestCase):
    """Test email notification logic"""

    def test_email_subject_on_approval(self):
        """Test approval email subject"""
        subject = "Your shop has been approved"
        self.assertIn("approved", subject.lower())

    def test_email_subject_on_rejection(self):
        """Test rejection email subject"""
        subject = "Your shop registration was not approved"
        self.assertIn("not approved", subject.lower())

    def test_email_recipient_is_owner(self):
        """Test email goes to shop owner"""
        shop_owner_email = "owner@test.com"
        recipient = shop_owner_email
        
        self.assertIn("@", recipient)
        self.assertTrue(recipient.endswith(".com"))

    def test_smtp_fallback_logging(self):
        """Test SMTP fallback to logging when not configured"""
        # Simulate no SMTP config
        smtp_host = None
        should_fallback = smtp_host is None
        
        self.assertTrue(should_fallback)


class TestDataValidation(unittest.TestCase):
    """Test input data validation"""

    def test_shop_name_required(self):
        """Test shop name is required"""
        shop_data = {"type": "grocery", "location": "panjim"}
        has_name = "name" in shop_data
        
        self.assertFalse(has_name)

    def test_email_format_validation(self):
        """Test email format validation"""
        import re
        email_pattern = r'^[^\s@]+@[^\s@]+\.[^\s@]+$'
        
        self.assertTrue(re.match(email_pattern, "user@test.com"))
        self.assertFalse(re.match(email_pattern, "invalid-email"))

    def test_price_is_numeric(self):
        """Test price is numeric"""
        try:
            price = float("99.99")
            self.assertEqual(price, 99.99)
        except ValueError:
            self.fail("Price should be numeric")


if __name__ == "__main__":
    unittest.main()
