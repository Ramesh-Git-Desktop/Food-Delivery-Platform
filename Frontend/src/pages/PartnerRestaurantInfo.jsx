import React from "react";
import "../CSS/Partner.css";

const PartnerRestaurantInfo = () => {
    return (
        <div className="partner-wrapper">
            <section className="form-section">
                <div className="form-layout">
                    {/* LEFT STEPPER */}
                    <div className="form-stepper">
                        <div className="stepper-card">
                            <div className="stepper-line"></div>

                            <div className="stepper-item active">
                                <span className="stepper-dot"></span>
                                <div>
                                    <p className="step-title">STEP 1</p>
                                    <h4>Restaurant Information</h4>
                                    <small>
                                        Location, Owner details, Open & Close hrs
                                    </small>
                                </div>
                            </div>

                            <div className="stepper-item">
                                <span className="stepper-dot"></span>
                                <h4>Restaurant Documents</h4>
                            </div>

                            <div className="stepper-item">
                                <span className="stepper-dot"></span>
                                <h4>Menu Setup</h4>
                            </div>

                            <div className="stepper-item">
                                <span className="stepper-dot"></span>
                                <h4>Partner Contract</h4>
                            </div>
                        </div>
                    </div>

                    {/* RIGHT FORM */}
                    <div className="form-container">
                        <h2 className="form-main-title">Restaurant Information</h2>

                        {/* BASIC DETAILS */}
                        <div className="form-card bordered">
                            <h3>Basic Details</h3>
                            <input type="text" placeholder="Owner’s Full Name" id="ownerName" />
                            <input type="text" placeholder="Restaurant Name *" id="restaurantName" />
                            <button
                                className="location-btn"
                                onClick={() => {
                                    const restaurantName = document.getElementById('restaurantName')?.value;
                                    if (!restaurantName || restaurantName.trim() === '') {
                                        alert('Please enter restaurant name first');
                                        return;
                                    }
                                    const searchQuery = encodeURIComponent(`${restaurantName} restaurant`);
                                    window.open(`https://www.google.com/maps/search/${searchQuery}`, '_blank');
                                }}
                            >
                                Add Restaurants Location →
                            </button>
                        </div>

                        {/* OWNER CONTROL DETAILS */}
                        <div className="form-card bordered">
                            <h3>Owner Control Details</h3>
                            <p className="muted">
                                To get updates on payment, customer complaints, order acceptance, etc
                            </p>

                            <input type="email" placeholder="Email address *" />
                            <input type="tel" placeholder="+91 Mobile Number *" />

                            <div className="radio-group">
                                <label>
                                    <input type="radio" name="whatsapp" defaultChecked />
                                    <span className="radio-custom"></span>
                                    <span className="radio-text">My WhatsApp number is same as above</span>
                                </label>
                                <label>
                                    <input type="radio" name="whatsapp" />
                                    <span className="radio-custom"></span>
                                    <span className="radio-text">I have a different WhatsApp</span>
                                </label>
                            </div>
                        </div>

                        {/* WORKING DAYS */}
                        <div className="form-card bordered">
                            <h3>Working days</h3>
                            <div className="days-grid">
                                {[
                                    "Monday", "Tuesday", "Wednesday",
                                    "Thursday", "Friday", "Saturday", "Sunday"
                                ].map(day => (
                                    <label key={day} className="day-item">
                                        <input type="checkbox" />
                                        {day}
                                    </label>
                                ))}
                            </div>
                        </div>

                        {/* WORKING HOURS */}
                        <div className="form-card bordered">
                            <h3>Working hours</h3>

                            <label className="working-hours-option">
                                <input type="radio" name="timing" defaultChecked />
                                <span className="radio-custom-hour"></span>
                                <span>I open and close my restaurant at the same time on all working days</span>
                            </label>

                            <label className="radio-option-hour">
                                <input type="radio" name="timing" />
                                <span className="radio-custom-hour"></span>
                                <span>I've separate daywise timings</span>
                            </label>

                            <div id="timeSlotsContainer">
                                <div className="time-row">
                                    <button className="time-btn">Open time</button>
                                    <button className="time-btn">Close time</button>
                                </div>
                            </div>

                            <p
                                className="slot"
                                onClick={() => {
                                    const container = document.getElementById('timeSlotsContainer');
                                    const newSlot = document.createElement('div');
                                    newSlot.className = 'time-row';
                                    newSlot.style.position = 'relative';
                                    newSlot.innerHTML = `
                    <button class="time-btn">Open time</button>
                    <button class="time-btn">Close time</button>
                    <button class="remove-slot" style="
                      position: absolute;
                      right: -20px;
                      top: 50%;
                      transform: translateY(-50%);
                      background: none;
                      border: none;
                      color: #ff4444;
                      font-size: 18px;
                      cursor: pointer;
                      font-weight: bold;
                    ">×</button>
                  `;

                                    const removeBtn = newSlot.querySelector('.remove-slot');
                                    removeBtn.onclick = function () {
                                        this.parentElement.remove();
                                    };

                                    container.appendChild(newSlot);
                                }}
                                style={{ cursor: 'pointer' }}
                            >
                                + Add another slot
                            </p>

                            <div className="tip">
                                Longer operational timings ensures you get
                                1.5x more orders and helps you avoid cancellations.
                            </div>
                        </div>

                        <button
                            className="proceed"
                            onClick={() => {
                                const ownerName = document.querySelector('input[placeholder="Owner’s Full Name"]')?.value;
                                const restaurantName = document.querySelector('input[placeholder="Restaurant Name *"]')?.value;
                                const email = document.querySelector('input[type="email"]')?.value;
                                const mobile = document.querySelector('input[type="tel"]')?.value;

                                if (!ownerName || !restaurantName || !email || !mobile) {
                                    alert('Please fill all required fields');
                                    return;
                                }

                                if (!email.includes('@') || !email.includes('.')) {
                                    alert('Please enter a valid email address');
                                    return;
                                }

                                const mobileDigits = mobile.replace(/\D/g, '');
                                if (mobileDigits.length !== 10) {
                                    alert('Please enter a valid 10-digit mobile number');
                                    return;
                                }

                                const selectedDays = document.querySelectorAll('.day-item input:checked');
                                if (selectedDays.length === 0) {
                                    alert('Please select at least one working day');
                                    return;
                                }

                                alert('✅ Form submitted successfully!');
                            }}
                        >
                            Proceed
                        </button>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default PartnerRestaurantInfo;