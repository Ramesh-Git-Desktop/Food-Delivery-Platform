import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../../context/CartContext";
import { FaTrash, FaShoppingBag } from "react-icons/fa";
import "./Cart.css";

const Cart = () => {
    const { cartItems, updateQuantity, removeFromCart, cartTotal, clearCart } = useCart();
    const navigate = useNavigate();

    const deliveryFee = 35;
    const gst = parseFloat((cartTotal * 0.05).toFixed(2));
    const grandTotal = (cartTotal + deliveryFee + gst).toFixed(2);

    return (
        <div className="cart-page container py-5">
            <h1 className="mb-4 fw-bold">
                <FaShoppingBag style={{ marginRight: '12px', color: '#f4a225' }} />
                My Shopping Cart
            </h1>

            {cartItems.length === 0 ? (
                <div className="empty-cart text-center py-5">
                    <div style={{ fontSize: '4.5rem', marginBottom: '1.5rem', animation: 'float 3s ease-in-out infinite' }}>🛒</div>
                    <p className="lead fw-semibold">Your cart is empty</p>
                    <p className="text-muted mb-4">Time to explore our delicious menu and add some items!</p>
                    <Link to="/" className="btn btn-primary px-4 py-2">
                        Continue Shopping
                    </Link>
                </div>
            ) : (
                <div className="row g-4">

                    {/* Cart Items List */}
                    <div className="col-lg-8">
                        <div className="cart-items-wrapper border rounded-3 overflow-hidden">
                            {cartItems.map((item, index) => (
                                <div
                                    key={item.id}
                                    className={`cart-item-row d-flex align-items-center gap-3 p-3 ${index !== cartItems.length - 1 ? 'border-bottom' : ''}`}
                                >
                                    {/* Image */}
                                    <img
                                        src={item.img}
                                        alt={item.title || item.name}
                                        className="cart-item-img rounded-2"
                                        style={{ width: '80px', height: '80px', objectFit: 'cover', flexShrink: 0 }}
                                    />

                                    {/* Name + Restaurant + Price */}
                                    <div className="flex-grow-1">
                                        <h6 className="mb-1 fw-semibold">{item.title || item.name}</h6>
                                        {item.restaurant && (
                                            <p className="mb-2 small" style={{ color: '#f4a225', fontWeight: '500', textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '0.5px' }}>
                                                {item.restaurant}
                                            </p>
                                        )}
                                        <p className="mb-0 text-muted small">₹{item.price} each</p>
                                    </div>

                                    {/* Qty Controls */}
                                    <div className="qty-controls d-flex align-items-center border rounded-2 overflow-hidden">
                                        <button
                                            className="qty-btn border-0 bg-white px-3 py-2 text-success fw-bold"
                                            style={{ fontSize: '1.1rem', cursor: 'pointer' }}
                                            onClick={() => item.quantity === 1 ? removeFromCart(item.id) : updateQuantity(item.id, -1)}
                                            title="Decrease quantity"
                                        >
                                            −
                                        </button>
                                        <span
                                            className="px-3 py-2 fw-bold text-success"
                                            style={{ minWidth: '36px', textAlign: 'center', borderLeft: '1px solid #eee', borderRight: '1px solid #eee' }}
                                        >
                                            {item.quantity}
                                        </span>
                                        <button
                                            className="qty-btn border-0 bg-white px-3 py-2 text-success fw-bold"
                                            style={{ fontSize: '1.1rem', cursor: 'pointer' }}
                                            onClick={() => updateQuantity(item.id, 1)}
                                            title="Increase quantity"
                                        >
                                            +
                                        </button>
                                    </div>

                                    {/* Line Total */}
                                    <div className="text-end" style={{ minWidth: '80px' }}>
                                        <span className="fw-bold">₹{(item.price * item.quantity).toFixed(2)}</span>
                                    </div>

                                    {/* Remove */}
                                    <button
                                        className="btn btn-sm btn-outline-danger ms-2"
                                        onClick={() => removeFromCart(item.id)}
                                        title="Remove item"
                                    >
                                        <FaTrash style={{ fontSize: '0.85rem' }} />
                                    </button>
                                </div>
                            ))}
                        </div>

                        {/* Clear Cart */}
                        <div className="mt-3 d-flex justify-content-between align-items-center">
                            <Link to="/" className="text-decoration-none text-muted small">
                                ← Continue Shopping
                            </Link>
                            <button className="btn btn-sm btn-outline-secondary" onClick={clearCart}>
                                Clear Cart
                            </button>
                        </div>
                    </div>

                    {/* Order Summary Sidebar */}
                    <div className="col-lg-4">
                        <div className="cart-summary-card border rounded-3 p-4">
                            <h5 className="fw-bold mb-4">Order Summary</h5>

                            <div className="d-flex justify-content-between mb-3">
                                <span className="text-muted">Subtotal</span>
                                <span className="fw-semibold">₹{cartTotal.toFixed(2)}</span>
                            </div>
                            <div className="d-flex justify-content-between mb-3">
                                <span className="text-muted">Delivery Fee</span>
                                <span className="fw-semibold">₹{deliveryFee}</span>
                            </div>
                            <div className="d-flex justify-content-between mb-4">
                                <span className="text-muted">GST (5%)</span>
                                <span className="fw-semibold">₹{gst}</span>
                            </div>

                            <hr />

                            <div className="d-flex justify-content-between mb-4">
                                <span className="fw-bold fs-5">Grand Total</span>
                                <span className="fw-bold fs-5 text-success">₹{grandTotal}</span>
                            </div>

                            <button
                                className="btn btn-success w-100 py-3 fw-bold"
                                style={{ fontSize: '1rem', borderRadius: '8px' }}
                                onClick={() => navigate('/checkout')}
                            >
                                Proceed to Checkout
                            </button>

                            <div className="text-center mt-3">
                                <small className="text-muted">🔒 Secure Checkout</small>
                            </div>
                        </div>
                    </div>

                </div>
            )}
        </div>
    );
};

export default Cart;