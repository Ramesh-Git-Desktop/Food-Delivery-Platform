import React, { useState } from "react";
import "../CSS/FAQ.css";

function FAQ() {
    const [activeCategory, setActiveCategory] = useState("payment");
    const [openIndex, setOpenIndex] = useState(null);

    const toggle = (index) => {
        setOpenIndex(openIndex === index ? null : index);
    };

    const paymentQuestions = [
        {
            q: "What payment methods do you accept?",
            a: "We accept credit/debit cards, UPI, net banking and cash on delivery.",
        },
        {
            q: "Is online payment secure?",
            a: "Yes, all transactions are secured with encrypted payment gateways.",
        },
        {
            q: "Can I get a refund?",
            a: "Refunds are processed for cancelled orders or valid complaints.",
        },
        {
            q: "How long does refund take?",
            a: "Refunds usually take 5–7 business days.",
        },
        {
            q: "Can I change my payment method after ordering?",
            a: "No, once payment is completed, it cannot be changed.",
        },
        {
            q: "Do you charge any extra service fee?",
            a: "A small service fee may apply depending on the restaurant.",
        },
        {
            q: "What if my payment fails?",
            a: "If payment fails, the amount will be refunded automatically within 3–5 days.",
        },
        {
            q: "Do you provide payment invoices?",
            a: "Yes, invoices are available in your order history section.",
        },
    ];

    const bookingQuestions = [
        {
            q: "How long does delivery take?",
            a: "Delivery usually takes 30–45 minutes depending on location.",
        },
        {
            q: "Can I cancel my order?",
            a: "Yes, before preparation starts.",
        },
        {
            q: "Can I schedule my order?",
            a: "Yes, you can schedule for a future date and time.",
        },
        {
            q: "How can I track my order?",
            a: "You can track your order in real-time from dashboard.",
        },
        {
            q: "Is there a minimum order value?",
            a: "Some restaurants may require a minimum order value.",
        },
        {
            q: "What if my order is delayed?",
            a: "If delayed, contact support and we will assist immediately.",
        },
        {
            q: "Can I modify items after placing the order?",
            a: "Changes are allowed only before the restaurant starts preparing the order.",
        },
        {
            q: "Do you offer contactless delivery?",
            a: "Yes, contactless delivery is available for your safety.",
        },
    ];

    const questions =
        activeCategory === "payment" ? paymentQuestions : bookingQuestions;

    return (
        <div>
            {/* Banner */}
            <section className="faq-banner d-flex align-items-center justify-content-center text-white text-center">
                <div>
                    <h1 className="faq-title">Frequently Asked Questions</h1>
                    <p className="faq-subtitle">
                        Everything you need to know about our service
                    </p>
                </div>
            </section>

            {/* Intro Section */}
            <section className="faq-intro-section py-5">
                <div className="container text-center">
                    <h4 className="intro-title">Need Help?</h4>
                    <div className="intro-line mx-auto"></div>
                    <p className="faq-intro mx-auto mt-4">
                        We understand you may have questions regarding orders, delivery,
                        payments, and refunds. Below are the most commonly asked questions
                        to help you quickly find answers.
                    </p>
                </div>
            </section>

            {/* FAQ Section */}
            <div className="container py-5">
                <div className="row">
                    {/* Left Category Menu */}
                    <div className="col-md-3 mb-4">
                        <div
                            className={`faq-category ${activeCategory === "payment" ? "active" : ""
                                }`}
                            onClick={() => {
                                setActiveCategory("payment");
                                setOpenIndex(null);
                            }}
                        >
                            Payments
                        </div>

                        <div
                            className={`faq-category ${activeCategory === "booking" ? "active" : ""
                                }`}
                            onClick={() => {
                                setActiveCategory("booking");
                                setOpenIndex(null);
                            }}
                        >
                            Booking
                        </div>
                    </div>

                    {/* Right Questions */}
                    <div className="col-md-9">
                        {questions.map((item, index) => (
                            <div className="faq-item" key={index}>
                                <div className="faq-question" onClick={() => toggle(index)}>
                                    {item.q}
                                    <span className="faq-icon">
                                        {openIndex === index ? "−" : "+"}
                                    </span>
                                </div>

                                <div
                                    className={`faq-answer ${openIndex === index ? "show" : ""}`}
                                >
                                    {item.a}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Support Section */}
            <section className="support-section text-center py-5">
                <div className="container">
                    <h3>Still Have Questions?</h3>
                    <p>Our support team is available 24/7.</p>
                    <button className="support-btn mt-3">Contact Support</button>
                </div>
            </section>
        </div>
    );
}

export default FAQ;
