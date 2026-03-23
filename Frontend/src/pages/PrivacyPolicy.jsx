import React from "react";
import "../CSS/PrivacyPolicy.css";

const PrivacyPolicy = () => {
    return (
        <div className="pp-page">
            {/* ══════════════════════════════════════
          BANNER
      ══════════════════════════════════════ */}
            <section
                className="pp-banner"
                style={{ backgroundImage: `url('/images/bgmap.jpg')` }}
            >
                <div className="pp-banner__overlay" />
                <div className="pp-banner__content">
                    <p className="pp-banner__breadcrumb">
                        Home &nbsp;/&nbsp; Privacy Policy
                    </p>
                    <h1 className="pp-banner__heading">Privacy Policy</h1>
                    <p className="pp-banner__sub">
                        We value your trust. Read how we handle your personal data.
                    </p>
                </div>
            </section>

            {/* ══════════════════════════════════════
          MAIN CONTENT
      ══════════════════════════════════════ */}
            <div className="pp-wrapper">
                {/* Effective date bar */}


                {/* Intro */}
                <div className="pp-intro-box">
                    <p>
                        Welcome to <strong>Hungry Hub</strong>. We are committed to
                        protecting your privacy and ensuring that your personal information
                        is handled in a safe and responsible manner. This Privacy Policy
                        explains what data we collect, why we collect it, how we use it, and
                        your rights regarding your information when you use our food
                        delivery platform.
                    </p>
                    <p>
                        By using our services, you agree to the collection and use of
                        information in accordance with this policy. Please read this
                        carefully before using our platform.
                    </p>
                </div>

                {/* ── Section 1 ── */}
                <div className="pp-section">
                    <div className="pp-section__label">01</div>
                    <div className="pp-section__body">
                        <h2>Information We Collect</h2>
                        <p>
                            We collect information you provide directly when you register,
                            place an order, contact our support team, or fill out forms on our
                            platform. This includes:
                        </p>
                        <ul>
                            <li>
                                <strong>Personal Identifiers</strong> — Full name, email
                                address, phone number, and date of birth.
                            </li>
                            <li>
                                <strong>Delivery Information</strong> — Home address, saved
                                addresses, and delivery instructions.
                            </li>
                            <li>
                                <strong>Payment Information</strong> — Credit/debit card details
                                (processed securely via third-party payment providers; we do not
                                store full card numbers).
                            </li>
                            <li>
                                <strong>Account Credentials</strong> — Username and encrypted
                                password.
                            </li>
                            <li>
                                <strong>Communications</strong> — Messages, reviews, and
                                feedback you submit to us.
                            </li>
                        </ul>
                        <p>
                            We also collect information automatically when you use our
                            services, such as your IP address, device type, browser
                            information, pages visited, time spent, and referring URLs through
                            cookies and analytics tools.
                        </p>
                    </div>
                </div>

                {/* ── Section 2 ── */}
                <div className="pp-section">
                    <div className="pp-section__label">02</div>
                    <div className="pp-section__body">
                        <h2>How We Use Your Information</h2>
                        <p>We use the information we collect for the following purposes:</p>
                        <ul>
                            <li>
                                To process and fulfil your food orders and manage deliveries.
                            </li>
                            <li>To create and manage your Hungry Hub account.</li>
                            <li>
                                To communicate with you about orders, promotions, and service
                                updates.
                            </li>
                            <li>
                                To personalise your experience, including recommending
                                restaurants and dishes.
                            </li>
                            <li>To process payments and prevent fraudulent transactions.</li>
                            <li>
                                To improve and optimise our platform, app, and customer service.
                            </li>
                            <li>To comply with applicable laws and regulations.</li>
                            <li>
                                To send you marketing communications where you have provided
                                consent (you may opt out at any time).
                            </li>
                        </ul>
                    </div>
                </div>

                {/* ── Section 3 ── */}
                <div className="pp-section">
                    <div className="pp-section__label">03</div>
                    <div className="pp-section__body">
                        <h2>Sharing Your Information</h2>
                        <p>
                            We do not share your personal information with third parties
                            except in the following circumstances:
                        </p>
                        <ul>
                            <li>
                                <strong>Restaurants & Delivery Partners</strong> — We share your
                                order details and delivery address with the restaurant preparing
                                your food and the driver delivering it.
                            </li>
                            <li>
                                <strong>Payment Processors</strong> — We share payment details
                                with secure, certified payment gateways to complete
                                transactions.
                            </li>
                            <li>
                                <strong>Service Providers</strong> — We work with trusted
                                vendors (cloud hosting, analytics, customer support tools) who
                                process data on our behalf under strict confidentiality
                                agreements.
                            </li>
                            <li>
                                <strong>Legal Requirements</strong> — We may disclose your
                                information if required to do so by law or in response to valid
                                requests by public authorities.
                            </li>
                            <li>
                                <strong>Business Transfers</strong> — In the event of a merger,
                                acquisition, or asset sale, your data may be transferred as part
                                of that transaction.
                            </li>
                        </ul>
                    </div>
                </div>

                {/* ── Section 4 ── */}
                <div className="pp-section">
                    <div className="pp-section__label">04</div>
                    <div className="pp-section__body">
                        <h2>Cookies & Tracking Technologies</h2>
                        <p>
                            We use cookies and similar technologies to enhance your experience
                            on our platform. Cookies help us remember your preferences, keep
                            you signed in, and understand how you interact with our services.
                        </p>
                        <p>Types of cookies we use:</p>
                        <ul>
                            <li>
                                <strong>Essential Cookies</strong> — Required for the platform
                                to function properly (login sessions, cart management).
                            </li>
                            <li>
                                <strong>Analytics Cookies</strong> — Help us understand usage
                                patterns so we can improve our service (e.g., Google Analytics).
                            </li>
                            <li>
                                <strong>Marketing Cookies</strong> — Used to deliver
                                personalised advertisements based on your browsing behaviour.
                            </li>
                            <li>
                                <strong>Preference Cookies</strong> — Remember your settings
                                such as language and location.
                            </li>
                        </ul>
                        <p>
                            You can manage or disable cookies through your browser settings.
                            Note that disabling certain cookies may affect the functionality
                            of our platform.
                        </p>
                    </div>
                </div>

                {/* ── Section 5 ── */}
                <div className="pp-section">
                    <div className="pp-section__label">05</div>
                    <div className="pp-section__body">
                        <h2>Data Security</h2>
                        <p>
                            We take the security of your personal information seriously. We
                            implement industry-standard technical and organisational measures
                            to protect your data, including:
                        </p>
                        <ul>
                            <li>
                                SSL/TLS encryption for all data transmitted between your device
                                and our servers.
                            </li>
                            <li>
                                Encrypted storage of sensitive information such as passwords and
                                payment data.
                            </li>
                            <li>Regular security audits and vulnerability assessments.</li>
                            <li>
                                Strict access controls — only authorised personnel can access
                                personal data.
                            </li>
                            <li>
                                Incident response procedures to address any potential data
                                breaches.
                            </li>
                        </ul>
                        <p>
                            While we strive to protect your personal information, no method of
                            transmission over the Internet is 100% secure. We cannot guarantee
                            absolute security, and you should also take steps to protect your
                            account credentials.
                        </p>
                    </div>
                </div>

                {/* ── Section 6 ── */}
                <div className="pp-section">
                    <div className="pp-section__label">06</div>
                    <div className="pp-section__body">
                        <h2>Your Rights & Choices</h2>
                        <p>
                            Depending on your location, you may have the following rights
                            regarding your personal data:
                        </p>
                        <ul>
                            <li>
                                <strong>Right to Access</strong> — Request a copy of the
                                personal data we hold about you.
                            </li>
                            <li>
                                <strong>Right to Rectification</strong> — Request correction of
                                inaccurate or incomplete data.
                            </li>
                            <li>
                                <strong>Right to Erasure</strong> — Request deletion of your
                                personal data ("right to be forgotten").
                            </li>
                            <li>
                                <strong>Right to Restrict Processing</strong> — Ask us to limit
                                how we use your data in certain circumstances.
                            </li>
                            <li>
                                <strong>Right to Data Portability</strong> — Receive your data
                                in a structured, machine-readable format.
                            </li>
                            <li>
                                <strong>Right to Object</strong> — Object to processing based on
                                legitimate interests or for direct marketing.
                            </li>
                            <li>
                                <strong>Right to Withdraw Consent</strong> — Withdraw consent at
                                any time where processing is based on consent.
                            </li>
                        </ul>
                        <p>
                            To exercise any of these rights, please contact us at
                            <a href="mailto:privacy@hungryhub.com"> privacy@hungryhub.com</a>.
                            We will respond within 30 days.
                        </p>
                    </div>
                </div>

                {/* ── Section 7 ── */}
                <div className="pp-section">
                    <div className="pp-section__label">07</div>
                    <div className="pp-section__body">
                        <h2>Data Retention</h2>
                        <p>
                            We retain your personal information for as long as your account is
                            active or as needed to provide you with our services. We will also
                            retain and use your information as necessary to comply with our
                            legal obligations, resolve disputes, and enforce our agreements.
                        </p>
                        <p>
                            When you delete your account, we will delete or anonymise your
                            personal data within 90 days, unless we are required to retain it
                            for legal or regulatory purposes. Anonymised or aggregated data
                            may be retained indefinitely for analytical purposes.
                        </p>
                    </div>
                </div>

                {/* ── Section 8 ── */}
                <div className="pp-section">
                    <div className="pp-section__label">08</div>
                    <div className="pp-section__body">
                        <h2>Children's Privacy</h2>
                        <p>
                            Our platform is not directed to individuals under the age of 13.
                            We do not knowingly collect personal information from children. If
                            you are a parent or guardian and believe your child has provided
                            us with personal information, please contact us immediately.
                        </p>
                        <p>
                            Upon notification, we will take steps to remove such information
                            from our systems as quickly as possible and terminate any
                            associated account.
                        </p>
                    </div>
                </div>

                {/* ── Section 9 ── */}
                <div className="pp-section">
                    <div className="pp-section__label">09</div>
                    <div className="pp-section__body">
                        <h2>Changes to This Policy</h2>
                        <p>
                            We may update this Privacy Policy periodically to reflect changes
                            in our practices, technology, legal requirements, or other
                            factors. We will notify you of significant changes by:
                        </p>
                        <ul>
                            <li>
                                Posting the updated policy on this page with a revised "Last
                                Updated" date.
                            </li>
                            <li>
                                Sending an email notification to the address associated with
                                your account.
                            </li>
                            <li>
                                Displaying a prominent notice on our platform upon your next
                                login.
                            </li>
                        </ul>
                        <p>
                            Your continued use of our services after changes become effective
                            constitutes your acceptance of the revised Privacy Policy.
                        </p>
                    </div>
                </div>

                {/* ── Contact Box ── */}
                <div className="pp-contact-box">
                    <div className="pp-contact-box__left">
                        <h3>Questions About This Policy?</h3>
                        <p>
                            If you have any questions, concerns, or requests regarding this
                            Privacy Policy or the way we handle your data, our Privacy Team is
                            here to help.
                        </p>
                        <div className="pp-contact-box__details">
                            <div className="pp-contact-box__item">
                                <span>📧</span>
                                <a href="mailto:privacy@hungryhub.com">privacy@hungryhub.com</a>
                            </div>
                            <div className="pp-contact-box__item">
                                <span>📍</span>
                                <p>123 Food Street, Delivery District, City 10001</p>
                            </div>
                            <div className="pp-contact-box__item">
                                <span>⏱</span>
                                <p>We respond within 5 business days</p>
                            </div>
                        </div>
                    </div>
                    <div className="pp-contact-box__right">
                        <div className="pp-contact-box__badge">
                            <div className="pp-contact-box__shield">🛡</div>
                            <p>Your privacy is our priority</p>
                        </div>
                    </div>
                </div>

                {/* bottom note */}
                <p className="pp-bottom-note">
                    © 2026 <strong>Hungry Hub</strong>. All Rights Reserved. &nbsp;|&nbsp;
                    This policy is governed by applicable data protection laws.
                </p>
            </div>
        </div>
    );
};

export default PrivacyPolicy;
