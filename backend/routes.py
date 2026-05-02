from flask import Blueprint, jsonify, request
from bson.objectid import ObjectId
from .db import users_col, shops_col, products_col, orders_col, agents_col, finances_col, audits_col
from .utils import send_email
import datetime
import cloudinary
import cloudinary.uploader
import os
import math
import re

bp = Blueprint("routes", __name__)

# ---- Cloudinary ----
cloudinary.config(
    cloud_name=os.getenv("CLOUDINARY_CLOUD_NAME"),
    api_key=os.getenv("CLOUDINARY_API_KEY"),
    api_secret=os.getenv("CLOUDINARY_API_SECRET"),
)

# ---- Helpers ----
def oid(id_str):
    try:
        return ObjectId(id_str)
    except Exception:
        return None

def to_jsonable(doc):
    if isinstance(doc, list):
        return [to_jsonable(item) for item in doc]
    if isinstance(doc, dict):
        d = {}
        for key, value in doc.items():
            if key == "_id":
                d["id"] = str(value)
            elif isinstance(value, (list, dict)):
                d[key] = to_jsonable(value)
            else:
                d[key] = value
        return d
    return doc

def extract_shop_coordinates(location):
    if not isinstance(location, dict):
        return None

    latitude = location.get("latitude", location.get("lat"))
    longitude = location.get("longitude", location.get("lng"))

    if latitude is None or longitude is None:
        return None

    try:
        return float(latitude), float(longitude)
    except (TypeError, ValueError):
        return None

def haversine_meters(lat1, lng1, lat2, lng2):
    earth_radius_m = 6371000
    phi1 = math.radians(lat1)
    phi2 = math.radians(lat2)
    delta_phi = math.radians(lat2 - lat1)
    delta_lambda = math.radians(lng2 - lng1)

    a = math.sin(delta_phi / 2) ** 2 + math.cos(phi1) * math.cos(phi2) * math.sin(delta_lambda / 2) ** 2
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    return earth_radius_m * c

# ---- Image Upload ----
@bp.route("/upload/image", methods=["POST"])
def upload_image():
    if "file" not in request.files:
        return jsonify({"error": "No file part in the request"}), 400

    file = request.files["file"]
    if file.filename == "":
        return jsonify({"error": "No selected file"}), 400

    try:
        upload_result = cloudinary.uploader.upload(file)
        return jsonify({"url": upload_result["secure_url"]}), 200
    except Exception as e:
        return jsonify({"error": "Image upload failed", "details": str(e)}), 500

# ---- AUTH ----
@bp.route("/auth/register", methods=["POST"])
def auth_register():
    try:
        payload = request.json or {}
        required = ["name", "email", "password"]
        for r in required:
            if r not in payload:
                return jsonify({"error": f"{r} is required"}), 400

        if users_col.find_one({"email": payload["email"]}):
            return jsonify({"error": "Email already registered"}), 409

        user_role = payload.get("role", "customer")
        shop_id = None
        if user_role == "shop":
            # Allow shop-specific metadata to be provided under payload['shop']
            shop_payload = payload.get('shop') or {}
            shop_doc = {
                "name": shop_payload.get('name') or payload.get('name'),
                "type": shop_payload.get('type'),
                "location": shop_payload.get('location'),
                "description": shop_payload.get('description'),
                "profileImage": shop_payload.get('profileImage'),
                "status": "pending",
                "created_at": datetime.datetime.utcnow(),
            }
            shop_res = shops_col.insert_one(shop_doc)
            shop_id = str(shop_res.inserted_id)

        user = {
            "name": payload["name"],
            "email": payload["email"],
            "password": payload["password"],
            "role": user_role,
            "created_at": datetime.datetime.utcnow(),
            "meta": payload.get("meta", {}),
            "shop_id": shop_id,
        }
        
        # New logic to set user status to "pending" for shop and agent roles
        if user_role in ["shop", "agent"]:
            user["status"] = "pending"

        res = users_col.insert_one(user)
        user["_id"] = res.inserted_id
        return jsonify({"message": "registered", "user": to_jsonable(user)}), 201
    except Exception as e:
        return jsonify({"error": "Internal server error", "details": str(e)}), 500

@bp.route("/auth/login", methods=["POST"])
def auth_login():
    try:
        payload = request.json or {}
        email = payload.get("email")
        password = payload.get("password")
        if not email or not password:
            return jsonify({"error": "email and password required"}), 400

        user = users_col.find_one({"email": email})
        if not user or user.get("password") != password:
            return jsonify({"error": "invalid credentials"}), 401
        
        # New logic to block pending users from logging in
        if user.get("status") == "pending":
            return jsonify({"error": "Your profile has not yet been verified. Kindly be patient."}), 403

        token = f"dummy-token-{str(user['_id'])}"
        return jsonify({"message": "ok", "token": token, "user": to_jsonable(user)}), 200
    except Exception as e:
        return jsonify({"error": "Internal server error", "details": str(e)}), 500

# ---- SHOPS ----
@bp.route("/shops", methods=["GET"])
def shops_get():
    try:
        status = request.args.get("status")
        q = {"status": "open"}
        if status:
            q["status"] = status
        docs = list(shops_col.find(q))
        return jsonify(to_jsonable(docs)), 200
    except Exception as e:
        return jsonify({"error": "Internal server error", "details": str(e)}), 500

@bp.route("/shops", methods=["POST"])
def shops_post():
    payload = request.json or {}
    if not payload.get("name"):
        return jsonify({"error": "name is required"}), 400
    shop = {
        "name": payload["name"],
        "owner_id": payload.get("ownerId"),
        "location": payload.get("location"),
        "status": payload.get("status", "pending"),
        "subscription": payload.get("subscription", {}),
        "created_at": datetime.datetime.utcnow(),
        "meta": payload.get("meta", {}),
    }
    res = shops_col.insert_one(shop)
    shop["_id"] = res.inserted_id
    return jsonify(to_jsonable(shop)), 201

@bp.route("/shops/<shop_id>", methods=["GET"])
def shops_get_by_id(shop_id):
    _id = oid(shop_id)
    if not _id:
        return jsonify({"error": "invalid shop id"}), 400
    shop = shops_col.find_one({"_id": _id})
    if not shop:
        return jsonify({"error": "not found"}), 404
    products_docs = list(products_col.find({"shop_id": shop_id}))
    shop["products"] = products_docs
    return jsonify(to_jsonable(shop)), 200

@bp.route("/shops/<shop_id>", methods=["PUT"])
def shops_put_by_id(shop_id):
    _id = oid(shop_id)
    if not _id:
        return jsonify({"error": "invalid shop id"}), 400
    payload = request.json or {}
    update_fields = {}
    for key in ["name", "type", "location", "status", "profileImage"]:
        if key in payload:
            update_fields[key] = payload[key]
    if not update_fields:
        return jsonify({"error": "No fields to update"}), 400

    result = shops_col.update_one({"_id": _id}, {"$set": update_fields})
    if result.matched_count == 0:
        return jsonify({"error": "Shop not found"}), 404

    updated_shop = shops_col.find_one({"_id": _id})
    return jsonify(to_jsonable(updated_shop)), 200

# ---- SHOP PRODUCTS ----
@bp.route("/shops/<shop_id>/products", methods=["GET"])
def shops_products_get(shop_id):
    _id = oid(shop_id)
    if not _id:
        return jsonify({"error": "invalid shop id"}), 400
    docs = list(products_col.find({"shop_id": shop_id}))
    return jsonify(to_jsonable(docs)), 200

@bp.route("/products/search", methods=["GET"])
def products_search_get():
    try:
        query = (request.args.get("q") or request.args.get("query") or "").strip()
        shop_id = request.args.get("shopId")
        latitude = request.args.get("lat", type=float)
        longitude = request.args.get("lng", type=float)
        radius = request.args.get("radius", type=float)
        limit = request.args.get("limit", default=48, type=int)

        mongo_query = {}
        if shop_id:
            mongo_query["shop_id"] = shop_id
        if query:
            escaped = re.escape(query)
            mongo_query["$or"] = [
                {"name": {"$regex": escaped, "$options": "i"}},
                {"description": {"$regex": escaped, "$options": "i"}},
                {"category": {"$regex": escaped, "$options": "i"}},
            ]

        fetch_limit = max(limit * 5, 100)
        product_docs = list(products_col.find(mongo_query).limit(fetch_limit))
        shop_ids = list({doc.get("shop_id") for doc in product_docs if doc.get("shop_id")})
        shops = {str(shop["_id"]): shop for shop in shops_col.find({"_id": {"$in": [oid(sid) for sid in shop_ids if oid(sid)]}})}

        results = []
        for product in product_docs:
            shop = shops.get(str(product.get("shop_id")))
            if not shop:
                continue

            shop_coordinates = extract_shop_coordinates(shop.get("location"))
            distance_m = None
            if latitude is not None and longitude is not None and shop_coordinates:
                distance_m = haversine_meters(latitude, longitude, shop_coordinates[0], shop_coordinates[1])
                if radius is not None and distance_m > radius:
                    continue

            stock = product.get("stock")
            available = True
            if stock is not None:
                try:
                    available = float(stock) > 0
                except (TypeError, ValueError):
                    available = bool(stock)

            results.append({
                "id": str(product.get("_id")),
                "name": product.get("name"),
                "description": product.get("description"),
                "price": product.get("price"),
                "stock": stock,
                "available": available,
                "images": product.get("images", []),
                "category": product.get("category"),
                "shopId": str(shop.get("_id")),
                "shopName": shop.get("name"),
                "shopLocation": shop.get("location"),
                "distanceMeters": round(distance_m, 1) if distance_m is not None else None,
            })

        if latitude is not None and longitude is not None:
            results.sort(key=lambda item: (item["distanceMeters"] is None, item["distanceMeters"] if item["distanceMeters"] is not None else float("inf")))
        else:
            results.sort(key=lambda item: (item.get("shopName") or "", item.get("name") or ""))

        return jsonify(to_jsonable(results[:limit])), 200
    except Exception as e:
        return jsonify({"error": "Failed to search products", "details": str(e)}), 500

@bp.route("/shops/<shop_id>/products", methods=["POST"])
def shops_products_post(shop_id):
    _id = oid(shop_id)
    if not _id:
        return jsonify({"error": "invalid shop id"}), 400
    payload = request.json or {}
    if not payload.get("name") or payload.get("price") is None:
        return jsonify({"error": "name and price required"}), 400
    product = {
        "name": payload["name"],
        "description": payload.get("description"),
        "price": payload["price"],
        "stock": payload.get("stock"),
        "images": payload.get("images", []),
        "shop_id": shop_id,
        "created_at": datetime.datetime.utcnow(),
    }
    res = products_col.insert_one(product)
    product["_id"] = res.inserted_id
    return jsonify(to_jsonable(product)), 201

@bp.route("/shops/<shop_id>/products/<product_id>", methods=["PUT"])
def shops_products_put(shop_id, product_id):
    p_oid = oid(product_id)
    if not p_oid:
        return jsonify({"error": "invalid product id"}), 400
    payload = request.json or {}
    update = {}
    for k in ("name", "description", "price", "stock", "images"):
        if k in payload:
            update[k] = payload[k]
    if not update:
        return jsonify({"error": "nothing to update"}), 400
    result = products_col.update_one({"_id": p_oid, "shop_id": shop_id}, {"$set": update})
    if result.matched_count == 0:
        return jsonify({"error": "Product not found or does not belong to the shop"}), 404
    prod = products_col.find_one({"_id": p_oid})
    return jsonify(to_jsonable(prod)), 200

# ---- SHOP ORDERS ----
@bp.route("/shops/<shop_id>/orders", methods=["GET"])
def shops_orders_get(shop_id):
    docs = list(orders_col.find({"shop_id": shop_id}))
    return jsonify(to_jsonable(docs)), 200

@bp.route("/shops/<shop_id>/orders/<order_id>/status", methods=["PUT"])
def shops_shop_order_status_put(shop_id, order_id):
    o_oid = oid(order_id)
    if not o_oid:
        return jsonify({"error": "invalid order id"}), 400
    payload = request.json or {}
    status = payload.get("status")
    if not status:
        return jsonify({"error": "status required"}), 400
    result = orders_col.update_one({"_id": o_oid, "shop_id": shop_id}, {"$set": {"status": status, "updated_at": datetime.datetime.utcnow()}})
    if result.matched_count == 0:
        return jsonify({"error": "Order not found or does not belong to the shop"}), 404
    o = orders_col.find_one({"_id": o_oid})
    return jsonify(to_jsonable(o)), 200

# ---- ORDERS ----
@bp.route("/orders", methods=["POST"])
def orders_post():
    try:
        payload = request.json or {}
        required = ["customer_id", "shop_id", "items", "agent_id"]
        for r in required:
            if r not in payload:
                return jsonify({"error": f"{r} required"}), 400

        shop = shops_col.find_one({"_id": oid(payload.get("shop_id"))})
        if not shop:
            return jsonify({"error": "Shop not found"}), 404

        total_price = float(payload.get("delivery_fee", 0))
        for item in payload.get("items", []):
            try:
                price = float(item.get("price", 0))
                qty = int(item.get("quantity", 0))
            except ValueError:
                return jsonify({"error": "Invalid price or quantity type"}), 400
            total_price += price * qty

        # Include agent_id
        order = {
            "customer_id": payload["customer_id"],
            "shop_id": payload["shop_id"],
            "agent_id": payload["agent_id"],
            "items": payload["items"],
            "total_price": total_price,
            "status": "pending",
            "created_at": datetime.datetime.utcnow(),
        }

        # Include customer location if provided
        customer_location = payload.get("customer_location")
        if customer_location:
            if not isinstance(customer_location, dict) or "lat" not in customer_location or "lng" not in customer_location:
                return jsonify({"error": "customer_location must be an object with lat and lng"}), 400
            order["customer_location"] = customer_location

        res = orders_col.insert_one(order)
        order["_id"] = res.inserted_id

        return jsonify({
            "message": "Order placed successfully. Waiting for confirmation by delivery agent.",
            "order": to_jsonable(order)
        }), 201

    except Exception as e:
        return jsonify({"error": "Internal server error", "details": str(e)}), 500

@bp.route("/orders/<order_id>/confirm", methods=["PUT"])
def orders_confirm(order_id):
    o_oid = oid(order_id)
    if not o_oid:
        return jsonify({"error": "invalid order id"}), 400

    result = orders_col.update_one(
        {"_id": o_oid},
        {"$set": {"status": "confirmed", "updated_at": datetime.datetime.utcnow()}}
    )

    if result.matched_count == 0:
        return jsonify({"error": "Order not found"}), 404

    o = orders_col.find_one({"_id": o_oid})
    return jsonify(to_jsonable(o)), 200

@bp.route("/orders/<order_id>/delivery-status", methods=["PUT"])
def orders_delivery_status_put(order_id):
    o_oid = oid(order_id)
    if not o_oid:
        return jsonify({"error": "invalid order id"}), 400
    payload = request.json or {}
    status = payload.get("status")
    if not status:
        return jsonify({"error": "status required"}), 400
    result = orders_col.update_one({"_id": o_oid}, {"$set": {"status": status, "updated_at": datetime.datetime.utcnow()}})
    if result.matched_count == 0:
        return jsonify({"error": "Order not found"}), 404
    o = orders_col.find_one({"_id": o_oid})
    return jsonify(to_jsonable(o)), 200

# ---- AGENTS ----
@bp.route("/agents", methods=["GET"])
def get_agents():
    try:
        agents = list(users_col.find({"role": "agent"}))
        return jsonify(to_jsonable(agents)), 200
    except Exception as e:
        return jsonify({"error": "Internal server error", "details": str(e)}), 500

@bp.route("/agents/<agent_id>/earnings", methods=["GET"])
def agents_agent_earnings(agent_id):
    docs = list(finances_col.find({"agent_id": agent_id}))
    return jsonify({
        "totalEarnings": 1000,
        "totalDeliveries": len(docs),
        "averageDeliveryTime": "30 minutes"
    }), 200

@bp.route("/agents/<agent_id>/orders", methods=["GET"])
def agents_agent_orders(agent_id):
    docs = list(orders_col.find({"agent_id": agent_id}))
    return jsonify(to_jsonable(docs)), 200

# ---- ADMIN ----
@bp.route("/admin/agents", methods=["GET"])
def admin_agents_get():
    docs = list(agents_col.find({}))
    return jsonify(to_jsonable(docs)), 200
    
@bp.route("/admin/approve-user/<user_id>", methods=["PUT"])
def approve_user(user_id):
    """
    Admin endpoint to approve a pending user (shop or agent).
    Updates the user's status from "pending" to "approved".
    """
    _id = oid(user_id)
    if not _id:
        return jsonify({"error": "invalid user id"}), 400
    
    user = users_col.find_one({"_id": _id})
    if not user:
        return jsonify({"error": "User not found"}), 404
        
    # Check the user's role to ensure we're approving an agent or shop
    if user.get("role") not in ["shop", "agent"]:
        return jsonify({"error": "Only shop and agent applications can be approved."}), 400
        
    result = users_col.update_one(
        {"_id": _id},
        {"$set": {"status": "approved", "updated_at": datetime.datetime.utcnow()}}
    )
    
    if result.matched_count == 0:
        return jsonify({"error": "User not found"}), 404
        
    updated_user = users_col.find_one({"_id": _id})
    return jsonify({"success": True, "user": to_jsonable(updated_user)}), 200

@bp.route("/admin/shops", methods=["GET"])
def admin_shops_get():
    status = request.args.get("status")
    subscription = request.args.get("subscription")
    q = {}
    if status:
        q["status"] = status
    if subscription:
        q["subscription.status"] = subscription
    docs = list(shops_col.find(q))
    return jsonify(to_jsonable(docs)), 200

@bp.route("/admin/shops/<shop_id>/approve", methods=["PUT"])
def admin_shops_approve(shop_id):
    _id = oid(shop_id)
    if not _id:
        return jsonify({"error": "invalid shop id"}), 400

    # Update shop status to "open"
    result = shops_col.update_one(
        {"_id": _id},
        {"$set": {"status": "open", "updated_at": datetime.datetime.utcnow()}}
    )
    if result.matched_count == 0:
        return jsonify({"error": "Shop not found"}), 404

    # Also update the corresponding user status to "approved"
    users_col.update_one(
        {"shop_id": shop_id},
        {"$set": {"status": "approved", "updated_at": datetime.datetime.utcnow()}}
    )

    # Persist audit log
    shop = shops_col.find_one({"_id": _id})
    audits_col.insert_one({
        "action": "approve_shop",
        "shop_id": shop_id,
        "shop_name": shop.get("name"),
        "admin": request.json.get("admin") if request.json else "system",
        "timestamp": datetime.datetime.utcnow(),
        "details": {"status": "open"},
    })

    # Notify shop owner by email (if present)
    owner = users_col.find_one({"shop_id": shop_id})
    if owner and owner.get("email"):
        subject = "Your shop has been approved"
        body = f"Hello {owner.get('name')},\n\nYour shop '{shop.get('name')}' has been approved by the admins and is now live on the platform. You can sign in and access the Shop Dashboard to list products.\n\nThanks,\nNear2Door Team"
        try:
            send_email(owner.get("email"), subject, body)
        except Exception as e:
            print("Failed to send approval email:", e)

    return jsonify(to_jsonable(shop)), 200


@bp.route("/admin/shops/<shop_id>/reject", methods=["PUT"])
def admin_shops_reject(shop_id):
    _id = oid(shop_id)
    if not _id:
        return jsonify({"error": "invalid shop id"}), 400

    payload = request.json or {}
    reason = payload.get('reason')

    result = shops_col.update_one(
        {"_id": _id},
        {"$set": {"status": "rejected", "rejection_reason": reason, "updated_at": datetime.datetime.utcnow()}}
    )
    if result.matched_count == 0:
        return jsonify({"error": "Shop not found"}), 404

    # Also update the corresponding user status to "rejected"
    users_col.update_one(
        {"shop_id": shop_id},
        {"$set": {"status": "rejected", "updated_at": datetime.datetime.utcnow()}}
    )

    shop = shops_col.find_one({"_id": _id})
    audits_col.insert_one({
        "action": "reject_shop",
        "shop_id": shop_id,
        "shop_name": shop.get("name"),
        "admin": request.json.get("admin") if request.json else "system",
        "timestamp": datetime.datetime.utcnow(),
        "details": {"reason": reason},
    })

    owner = users_col.find_one({"shop_id": shop_id})
    if owner and owner.get("email"):
        subject = "Your shop registration was not approved"
        body = f"Hello {owner.get('name')},\n\nWe reviewed your shop '{shop.get('name')}' registration and it was not approved. Reason: {reason or 'Not specified'}. Please update your application and re-submit or contact support.\n\nThanks,\nNear2Door Team"
        try:
            send_email(owner.get("email"), subject, body)
        except Exception as e:
            print("Failed to send rejection email:", e)

    return jsonify(to_jsonable(shop)), 200

@bp.route("/admin/finances", methods=["GET"])
def admin_finances_get():
    total_orders = orders_col.count_documents({})
    total_revenue = sum(o.get("total_price", 0) for o in orders_col.find({}))
    total_commission = total_revenue * 0.1
    return jsonify({
        "totalOrders": total_orders,
        "totalRevenue": total_revenue,
        "totalCommission": total_commission
    }), 200

# ---- USER ORDERS ----
@bp.route("/users/<user_id>/orders", methods=["GET"])
def users_user_orders_get(user_id):
    docs = list(orders_col.find({"customer_id": user_id}))
    return jsonify(to_jsonable(docs)), 200

# ---- CUSTOMERS ORDERS (frontend API) ----
@bp.route("/customers/<customer_id>/orders", methods=["GET"])
def customers_customer_orders_get(customer_id):
    docs = list(orders_col.find({"customer_id": customer_id}))
    return jsonify(to_jsonable(docs)), 200

# ---- ROOT ----
@bp.route("/", methods=["GET"])
def root():
    return jsonify({"message": "Near2Door minimal API (subset implemented). See /api documentation."}), 200
