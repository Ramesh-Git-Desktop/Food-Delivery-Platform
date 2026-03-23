import { useState } from "react";
import {
    FaHome,
    FaBriefcase,
    FaMapMarkerAlt,
    FaPlus,
    FaCheckCircle,
    FaChevronRight,
    FaPercentage,
    FaShieldAlt,
    FaWallet,
    FaArrowLeft
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { useCart } from "../../context/CartContext";
import "./Checkout.css";

const Checkout = () => {
    const navigate = useNavigate();
    const { cartItems, restaurant, updateQuantity, cartTotal, clearCart } = useCart(); // added clearCart
    const [step, setStep] = useState("address"); // 'address' or 'payment'
    const [selectedAddress, setSelectedAddress] = useState(null);

    const addresses = [
        {
            id: 'home',
            type: 'Home',
            icon: <FaHome />,
            time: '15 Min',
            address: 'Dlf Cyber City, unit -678 Floor no - 6, Bhubaneswar, Odisha'
        },
        {
            id: 'work',
            type: 'Work',
            icon: <FaBriefcase />,
            time: '22 Min',
            address: 'Dlf Cyber City, unit -678 Floor no - 6, Bhubaneswar, Odisha'
        }
    ];

    const deliveryFee = 35;
    const gstAndCharges = 45.78;
    const totalToPay = cartTotal + deliveryFee + gstAndCharges;

    const handleBack = () => {
        if (step === 'payment') {
            setStep('address');
        } else {
            navigate(-1);
        }
    };

    if (cartItems.length === 0) {
        return (
            <div className="checkout-page d-flex flex-column align-items-center justify-content-center text-center" style={{ minHeight: '100vh', background: '#f8f9fa' }}>
                <div className="empty-cart-view p-5 bg-white rounded-4 shadow-sm border">
                    <img src="https://cdni.iconscout.com/illustration/premium/thumb/empty-cart-2130380-1800cc2.png" alt="Empty Cart" style={{ width: '200px', marginBottom: '20px' }} />
                    <h1 className="fw-900 mb-3" style={{ color: '#282c3f' }}>Your cart is empty</h1>
                    <p className="text-muted mb-4">You can go to home page to view more restaurants</p>
                    <button className="delivery-btn" style={{ maxWidth: '250px', margin: '0 auto', background: '#ff5200', color: 'white', fontWeight: '900', border: 'none', padding: '15px 30px', borderRadius: '8px' }} onClick={() => navigate('/')}>SEE RESTAURANTS NEAR YOU</button>
                </div>
            </div>
        );
    }

    return (
        <div className="checkout-page">
            <div className="checkout-container container-fluid px-4 px-md-5 px-lg-5">
                {/* Left Section: Address & Payment */}
                <div className="checkout-left">
                    <div className="checkout-header-main">
                        <div className="d-flex align-items-center gap-3 mb-2">
                            <FaArrowLeft className="cursor-pointer" onClick={handleBack} />
                            <h1>Choose a delivery address</h1>
                        </div>
                        <p>Multiple addresses in this location</p>
                    </div>

                    <div className="stepper-content">
                        {step === 'address' ? (
                            <div className="address-selection-view">
                                <div className="address-grid">
                                    {addresses.map(addr => (
                                        <div key={addr.id} className={`address-card ${selectedAddress === addr.id ? 'selected' : ''}`} onClick={() => setSelectedAddress(addr.id)}>
                                            <div className="addr-top">
                                                <div className="addr-icon">{addr.icon}</div>
                                                <div className="addr-info">
                                                    <div className="addr-type-row">
                                                        <h3>{addr.type}</h3>
                                                        {(addr.id === 'work' || selectedAddress === addr.id) && <FaCheckCircle className="check-icon" />}
                                                    </div>
                                                    <span className="addr-time">{addr.time}</span>
                                                    <p className="addr-text">{addr.address}</p>
                                                </div>
                                            </div>
                                            <button
                                                className="delivery-btn"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setSelectedAddress(addr.id);
                                                    setStep('payment');
                                                }}
                                            >
                                                DELIVERY HERE
                                            </button>
                                        </div>
                                    ))}
                                    <div className="address-card add-new-card">
                                        <div className="addr-top">
                                            <div className="addr-icon"><FaMapMarkerAlt /></div>
                                            <div className="addr-info">
                                                <h3 className="mb-3">Add New Address</h3>
                                                <button className="add-new-btn-outline">Add new</button>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="bottom-payment-placeholder">
                                    <button
                                        className={`payment-method-btn-wide ${!selectedAddress ? 'disabled' : ''}`}
                                        onClick={(e) => e.preventDefault()}
                                    >
                                        Payment Method
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="payment-selection-view">
                                <div className="stepper-visual-column">
                                    <div className="step-square-icon active">
                                        <FaMapMarkerAlt />
                                    </div>
                                    <div className="step-connector-dashed"></div>
                                    <div className="step-square-icon yellow">
                                        <FaWallet />
                                    </div>
                                </div>

                                <div className="payment-main-content">
                                    <div className="pale-yellow-section mb-4">
                                        <div className="d-flex justify-content-between align-items-start mb-2">
                                            <h2 className="section-title-small">Delivery address</h2>
                                        </div>
                                        <div className="address-summary-info">
                                            <h3 className="fw-900 mb-1">{addresses.find(a => a.id === selectedAddress)?.type}</h3>
                                            <p className="mb-2 text-muted-small">{addresses.find(a => a.id === selectedAddress)?.address}</p>
                                            <div className="d-flex align-items-center justify-content-between mt-3">
                                                <span className="fw-900">{addresses.find(a => a.id === selectedAddress)?.time}</span>
                                                <button className="change-addr-link-btn" onClick={() => setStep('address')}>CHANGE ADDRESS</button>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="pale-yellow-section">
                                        <h2 className="section-title-small mb-4">Choose payment method</h2>
                                        <button
                                            className="proceed-btn-large"
                                            onClick={() => {
                                                // Clear cart and navigate to home (or a success page)
                                                clearCart();
                                                navigate('/'); // or navigate('/order-success') if you create that route
                                            }}
                                        >
                                            PROCEED TO PAY
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Right Section: Bill Details */}
                <div className="checkout-right">
                    <div className="summary-card-premium">
                        <div className="restaurant-summary-header d-flex gap-3 mb-4 align-items-center">
                            <img src={restaurant?.image || "https://via.placeholder.com/60"} alt="res" className="item-thumbnail" style={{ width: '60px', height: '60px', objectFit: 'cover', borderRadius: '8px' }} />
                            <div>
                                <h2 className="item-title-checkout" style={{ margin: 0, fontSize: '1.2rem', fontWeight: '900' }}>{restaurant?.name || 'Restaurant'}</h2>
                                <p className="text-muted small mb-0">{restaurant?.location || 'Bhubaneswar'}</p>
                            </div>
                        </div>

                        <div className="cart-items-list mb-4">
                            {cartItems.map((item, index) => (
                                <div key={item.id} className={`item-header-row d-flex justify-content-between align-items-center ${index !== cartItems.length - 1 ? 'mb-3 border-bottom pb-3' : 'mb-3'}`}>
                                    <div className="item-info-main">
                                        <div className="d-flex align-items-center gap-2">
                                            <div className={`veg-square ${item.isVeg ? '' : 'border-danger'}`} style={{ width: '12px', height: '12px', border: '1px solid #60B246', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                <div className={`veg-dot ${item.isVeg ? '' : 'bg-danger'}`} style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#60B246' }}></div>
                                            </div>
                                            <h5 className="item-name-checkout mb-0" style={{ fontSize: '0.95rem', fontWeight: '700' }}>{item.name}</h5>
                                        </div>
                                        {item.isBestseller && <span className="text-muted" style={{ fontSize: '0.7rem' }}>⭐ Bestseller</span>}
                                    </div>
                                    <div className="price-qty-row d-flex align-items-center gap-3">
                                        <div className="qty-picker-premium d-flex align-items-center border rounded" style={{ background: 'white' }}>
                                            <button className="px-2 py-1 border-0 bg-transparent text-success fw-bold" onClick={() => updateQuantity(item.id, -1)}>-</button>
                                            <span className="qty-val px-2 font-monospace text-success fw-bold">{item.quantity}</span>
                                            <button className="px-2 py-1 border-0 bg-transparent text-success fw-bold" onClick={() => updateQuantity(item.id, 1)}>+</button>
                                        </div>
                                        <span className="price-tag-checkout fw-bold" style={{ minWidth: '60px', textAlign: 'right' }}>₹{item.price * item.quantity}</span>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="offers-section mb-4 p-3 rounded" style={{ background: '#f1f6f1', border: '1px dashed #60B246' }}>
                            <div className="d-flex align-items-center gap-2 text-success">
                                <FaPercentage />
                                <span className="fw-900" style={{ fontSize: '0.85rem' }}>OFFERS & BENEFITS</span>
                            </div>
                            <p className="mb-0 text-muted mt-1" style={{ fontSize: '0.75rem' }}>Use code WELCOME50 to get 50% off on your first order!</p>
                        </div>

                        <div className="suggestion-box mb-4">
                            <p className="label-small text-muted mb-1" style={{ fontSize: '0.8rem' }}>Any Suggestion for the restaurant?</p>
                            <div className="textarea-wrapper">
                                <textarea className="form-control" placeholder="Message Here for your orders" style={{ fontSize: '0.85rem', background: '#f9f9f9', border: '1px dashed #ccc', height: '60px' }}></textarea>
                            </div>
                        </div>

                        <div className="no-contact-box mb-4 p-3 rounded" style={{ background: '#fdfdfd', border: '1px solid #eee' }}>
                            <div className="form-check d-flex gap-2">
                                <input className="form-check-input" type="checkbox" id="nc-check" />
                                <label className="form-check-label" htmlFor="nc-check">
                                    <p className="nc-title fw-bold mb-0" style={{ fontSize: '0.9rem' }}>Opt in for No-contact Delivery</p>
                                    <p className="nc-desc text-muted mb-0" style={{ fontSize: '0.75rem' }}>Unwell, or avoiding contact? Please select no-contact delivery. Partner will safely place the order outside your door (not for COD).</p>
                                </label>
                            </div>
                        </div>

                        <div className="coupon-card mb-4 d-flex justify-content-between align-items-center p-3 rounded border" style={{ cursor: 'pointer' }} onClick={() => alert("Coupons section coming soon!")}>
                            <div className="coupon-content d-flex align-items-center gap-2">
                                <FaPercentage className="percent-icon text-muted" />
                                <span className="fw-bold" style={{ fontSize: '0.9rem' }}>Apply Coupon</span>
                            </div>
                            <FaChevronRight className="chevron text-muted" />
                        </div>

                        <div className="bill-card p-3 rounded" style={{ background: '#f9f9f9' }}>
                            <h4 className="bill-title fw-bold mb-3" style={{ fontSize: '1rem' }}>Bill Details</h4>
                            <div className="bill-line d-flex justify-content-between mb-2">
                                <span className="text-muted small">Items Total</span>
                                <span className="small">₹{cartTotal}</span>
                            </div>
                            <div className="bill-line d-flex justify-content-between mb-2">
                                <span className="text-muted small">Delivery Fee | 1.7 Kms</span>
                                <span className="small">₹{deliveryFee}</span>
                            </div>
                            <div className="bill-divider border-top my-2"></div>
                            <div className="bill-line d-flex justify-content-between mb-2">
                                <span className="text-muted small">GST & Other Charges</span>
                                <span className="small">₹{gstAndCharges.toFixed(2)}</span>
                            </div>
                            <div className="bill-total-row d-flex justify-content-between mt-3">
                                <span className="fw-900 fs-5">TO PAY</span>
                                <span className="fw-900 fs-5">₹{totalToPay.toFixed(2)}</span>
                            </div>
                        </div>
                    </div>

                    <div className="policy-alert-card mt-4 p-3 rounded border-start border-4 border-danger" style={{ background: '#fffafa' }}>
                        <div className="policy-inner">
                            <p className="policy-title fw-bold mb-1" style={{ fontSize: '0.85rem' }}>Review your order and address details to avoid cancellation</p>
                            <p className="policy-note text-muted mb-2" style={{ fontSize: '0.8rem' }}><strong>Note:</strong> Please ensure your address and order details are correct. This order, if cancelled, is non-refundable.</p>
                            <a href="#" className="read-more" style={{ color: '#ff5200', fontWeight: 'bold', textDecoration: 'none', fontSize: '0.85rem' }}>Read policy</a>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Checkout;