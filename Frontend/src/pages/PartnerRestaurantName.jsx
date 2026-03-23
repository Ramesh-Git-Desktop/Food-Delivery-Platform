import React from "react";
import { Link } from 'react-router-dom';
import { BsShop } from "react-icons/bs";
import "../CSS/Partner.css";

const PartnerRestaurantName = () => {
    return (
        <div className="partner-wrapper">
            <section className="partner-hero third">
                <div className="overlay"></div>

                <div className="hero-left">
                    <p className="tag">BEFORE WE START</p>
                    <h1>Let's add your restaurants name</h1>
                </div>

                <div className="name-wrapper">
                    <div className="name-card">
                        <label className="restaurant-label">Restaurant Name</label>
                        <input
                            className="restaurant-input"
                            type="text"
                            placeholder="Enter restaurant name"
                        />

                        <div className="note-strip">
                            <div className="note-text">
                                <strong>Note</strong>
                                <p>
                                    This is the name customers will see on the Hungry Hub app.
                                </p>
                            </div>
                            <BsShop className="shop-icon" />
                        </div>

                        <button className="save-btn">Save</button>
                        </div>

                        <Link to="/partner-restaurant-info" className="text-decoration-none">
                            <button className="confirm-btn">Confirm</button>
                        </Link>
                </div>
            </section>
        </div>
    );
};

export default PartnerRestaurantName;