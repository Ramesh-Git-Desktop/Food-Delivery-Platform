import React, { useState, useRef } from "react";
import { FiUser, FiMail, FiCamera, FiEdit2, FiSave, FiCheck } from "react-icons/fi";
import { BiBell, BiStore, BiTime, BiMap } from "react-icons/bi";
import {
    BsBellFill, BsStarFill, BsGraphUpArrow, BsDisplay,
    BsExclamationTriangleFill, BsPencilFill, BsCheckLg,
} from "react-icons/bs";
import "../CSS/Setting.css";

/* ─── Toast ─────────────────────────────────────────── */
function Toast({ message, type }) {
    return (
        <div className={`ml-toast ml-toast--${type}`}>
            {type === "success" ? <FiCheck size={14} /> : <BsExclamationTriangleFill size={14} />}
            <span>{message}</span>
        </div>
    );
}

/* ─── Toggle Switch ──────────────────────────────────── */
function Toggle({ checked, onChange }) {
    return (
        <button
            className={`ml-toggle ${checked ? "ml-toggle--on" : ""}`}
            onClick={() => onChange(!checked)}
            aria-checked={checked}
            role="switch"
        >
            <span className="ml-toggle__thumb" />
        </button>
    );
}

/* ─── Main Component ─────────────────────────────────── */
export default function Setting() {

    /* ── Toast ── */
    const [toast, setToast] = useState(null);
    const showToast = (message, type = "success") => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 2800);
    };

    /* ───────────────────────────────────────────────────
       PROFILE SETTINGS
    ─────────────────────────────────────────────────── */
    const [profileMode, setProfileMode] = useState("view");
    const [profileData, setProfileData] = useState({
        fullName: "Alexander Gastron",
        email: "alexander@culinaryledger.com",
        photo: null,
    });
    const [profileDraft, setProfileDraft] = useState({ ...profileData });
    const [profileErrors, setProfileErrors] = useState({});
    const photoInputRef = useRef();

    const validateProfile = (draft) => {
        const errs = {};
        if (!draft.fullName.trim() || draft.fullName.trim().length < 2)
            errs.fullName = "Name must be at least 2 characters.";
        const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!draft.email.trim() || !emailRe.test(draft.email.trim()))
            errs.email = "Please enter a valid email address.";
        return errs;
    };

    const handleSaveProfile = () => {
        const errs = validateProfile(profileDraft);
        if (Object.keys(errs).length) { setProfileErrors(errs); return; }
        setProfileErrors({});
        setProfileData({ ...profileDraft });
        setProfileMode("view");
        showToast("Profile saved successfully!");
    };

    const handleEditProfile = () => {
        setProfileDraft({ ...profileData });
        setProfileErrors({});
        setProfileMode("edit");
    };

    const handlePhotoSelect = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        if (!["image/jpeg", "image/png"].includes(file.type)) {
            setProfileErrors((p) => ({ ...p, photo: "Only JPG or PNG allowed." }));
            return;
        }
        if (file.size > 5 * 1024 * 1024) {
            setProfileErrors((p) => ({ ...p, photo: "File must be under 5 MB." }));
            return;
        }
        setProfileErrors((p) => { const n = { ...p }; delete n.photo; return n; });
        const reader = new FileReader();
        reader.onload = (ev) => setProfileDraft((p) => ({ ...p, photo: ev.target.result }));
        reader.readAsDataURL(file);
        showToast("Photo updated!");
    };

    const displayPhoto = profileMode === "edit" ? profileDraft.photo : profileData.photo;

    /* ───────────────────────────────────────────────────
       ALERTS
    ─────────────────────────────────────────────────── */
    const [alerts, setAlerts] = useState({
        orderUpdates: true,
        reviewAlerts: true,
        marketTrends: false,
        systemStatus: true,
    });

    const toggleAlert = (key) => {
        setAlerts((prev) => {
            const next = { ...prev, [key]: !prev[key] };
            showToast(next[key] ? "Alert enabled" : "Alert disabled");
            return next;
        });
    };

    const alertItems = [
        { key: "orderUpdates", label: "Order Updates", Icon: BsBellFill },
        { key: "reviewAlerts", label: "Review Alerts", Icon: BsStarFill },
        { key: "marketTrends", label: "Market Trends", Icon: BsGraphUpArrow },
        { key: "systemStatus", label: "System Status", Icon: BsDisplay },
    ];

    /* ───────────────────────────────────────────────────
       RESTAURANT IDENTITY  —  view / edit mode
    ─────────────────────────────────────────────────── */
    const cuisineOptions = [
        "Modern European", "French Bistro", "Italian Trattoria", "Mediterranean",
        "Contemporary Asian", "Pan-Asian Fusion", "Latin American", "Middle Eastern",
        "Classic American", "Farm-to-Table", "Steakhouse", "Seafood",
        "Vegan & Plant-Based", "Tasting Menu / Fine Dining",
    ];

    const [restMode, setRestMode] = useState("view");
    const [restData, setRestData] = useState({
        name: "The Gilded Truffle",
        cuisine: "Modern European",
        address: "128 Gourmet Avenue,\nCulinary District, Metro City, 90210",
    });
    const [restDraft, setRestDraft] = useState({ ...restData });
    const [restErrors, setRestErrors] = useState({});

    const validateRest = (d) => {
        const errs = {};
        if (!d.name.trim()) errs.name = "Restaurant name is required.";
        if (!d.cuisine) errs.cuisine = "Please select a cuisine style.";
        if (!d.address.trim()) errs.address = "Address is required.";
        return errs;
    };

    const handleRestDraftChange = (field, val) => {
        setRestDraft((p) => ({ ...p, [field]: val }));
        if (restErrors[field])
            setRestErrors((p) => { const n = { ...p }; delete n[field]; return n; });
    };

    const handleSaveIdentity = () => {
        const errs = validateRest(restDraft);
        if (Object.keys(errs).length) { setRestErrors(errs); return; }
        setRestErrors({});
        setRestData({ ...restDraft });
        setRestMode("view");
        showToast("Restaurant identity saved!");
    };

    const handleEditIdentity = () => {
        setRestDraft({ ...restData });
        setRestErrors({});
        setRestMode("edit");
    };

    /* ── Schedule (independent of rest identity mode) ── */
    const [scheduleEdit, setScheduleEdit] = useState(false);
    const [hours, setHours] = useState({
        monFriStart: "11:00 AM",
        monFriEnd: "10:00 PM",
        satSunStart: "10:00 AM",
        satSunEnd: "11:30 PM",
    });
    const [hoursDraft, setHoursDraft] = useState({ ...hours });

    const toggleSchedule = () => {
        if (scheduleEdit) {
            setHours({ ...hoursDraft });
            setScheduleEdit(false);
            showToast("Schedule saved!");
        } else {
            setHoursDraft({ ...hours });
            setScheduleEdit(true);
        }
    };

    /* ───────────────────────────────────────────────────
       DANGER ZONE
    ─────────────────────────────────────────────────── */
    const [showModal, setShowModal] = useState(false);
    const [deactivated, setDeactivated] = useState(false);

    const confirmDeactivate = () => {
        setShowModal(false);
        setDeactivated(true);
        showToast("Dashboard deactivated.", "error");
    };

    /* ───────────────────────────────────────────────────
       RENDER
    ─────────────────────────────────────────────────── */
    return (
        <div className="ml-page">
            {toast && <Toast message={toast.message} type={toast.type} />}

            {/* ── Page Header ── */}
            <div className="ml-header">
                <p className="ml-header__label">Configuration Control</p>
                <h1 className="ml-header__title">Manage Your Ledger</h1>
                <p className="ml-header__sub">
                    Fine-tune your gastronomic workspace. Update your profile, restaurant identity,
                    and notification preferences to maintain peak operational efficiency.
                </p>
            </div>

            {/* ── Top Row: Profile + Alerts ── */}
            <div className="row g-3 mb-3">

                {/* ── Profile Settings ── */}
                <div className="col-12 col-lg-8">
                    <div className="ml-card h-100">
                        <div className="ml-card__header">
                            <div className="ml-card__title-row">
                                <span className="ml-icon ml-icon--orange"><FiUser size={17} /></span>
                                <h2 className="ml-card__title">Profile Settings</h2>
                            </div>
                            {profileMode === "view" ? (
                                <button className="ml-btn ml-btn--outline" onClick={handleEditProfile}>
                                    <FiEdit2 size={13} /> Edit Profile
                                </button>
                            ) : (
                                <button className="ml-btn ml-btn--solid" onClick={handleSaveProfile}>
                                    <FiSave size={13} /> Save Profile
                                </button>
                            )}
                        </div>

                        <div className="row g-3 align-items-start">
                            {/* Fields */}
                            <div className="col-12 col-md-7">
                                <div className="ml-field mb-3">
                                    <label className="ml-field__label">
                                        <FiUser size={11} /> Full Name
                                    </label>
                                    <input
                                        className={`ml-field__input ${profileErrors.fullName ? "ml-field__input--error" : ""}`}
                                        type="text"
                                        value={profileMode === "edit" ? profileDraft.fullName : profileData.fullName}
                                        disabled={profileMode === "view"}
                                        onChange={(e) => {
                                            setProfileDraft((p) => ({ ...p, fullName: e.target.value }));
                                            if (profileErrors.fullName)
                                                setProfileErrors((p) => { const n = { ...p }; delete n.fullName; return n; });
                                        }}
                                        placeholder="Enter full name"
                                    />
                                    {profileErrors.fullName && (
                                        <p className="ml-field__error">{profileErrors.fullName}</p>
                                    )}
                                </div>

                                <div className="ml-field">
                                    <label className="ml-field__label">
                                        <FiMail size={11} /> Email Address
                                    </label>
                                    <input
                                        className={`ml-field__input ${profileErrors.email ? "ml-field__input--error" : ""}`}
                                        type="email"
                                        value={profileMode === "edit" ? profileDraft.email : profileData.email}
                                        disabled={profileMode === "view"}
                                        onChange={(e) => {
                                            setProfileDraft((p) => ({ ...p, email: e.target.value }));
                                            if (profileErrors.email)
                                                setProfileErrors((p) => { const n = { ...p }; delete n.email; return n; });
                                        }}
                                        placeholder="Enter email address"
                                    />
                                    {profileErrors.email && (
                                        <p className="ml-field__error">{profileErrors.email}</p>
                                    )}
                                </div>
                            </div>

                            {/* Photo */}
                            <div className="col-12 col-md-5">
                                <div className="ml-photo-box">
                                    <div className="ml-photo-box__avatar">
                                        {displayPhoto ? (
                                            <img src={displayPhoto} alt="Profile" className="ml-photo-box__img" />
                                        ) : (
                                            <div className="ml-photo-box__placeholder">
                                                <FiUser size={34} color="#b0a090" />
                                            </div>
                                        )}
                                    </div>
                                    <p className="ml-photo-box__hint">Recommended: 400×400px JPG or PNG</p>
                                    <button
                                        className="ml-photo-box__change"
                                        disabled={profileMode === "view"}
                                        onClick={() => photoInputRef.current.click()}
                                    >
                                        <FiCamera size={13} /> Change Photo
                                    </button>
                                    {profileErrors.photo && (
                                        <p className="ml-field__error">{profileErrors.photo}</p>
                                    )}
                                    <input
                                        ref={photoInputRef}
                                        type="file"
                                        accept="image/jpeg,image/png"
                                        style={{ display: "none" }}
                                        onChange={handlePhotoSelect}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* ── Alerts ── */}
                <div className="col-12 col-lg-4">
                    <div className="ml-card h-100">
                        <div className="ml-card__header mb-3">
                            <div className="ml-card__title-row">
                                <span className="ml-icon ml-icon--orange"><BiBell size={17} /></span>
                                <h2 className="ml-card__title">Alerts</h2>
                            </div>
                        </div>
                        <div className="ml-alerts">
                            {alertItems.map(({ key, label, Icon }) => (
                                <div
                                    key={key}
                                    className={`ml-alert-item ${alerts[key] ? "ml-alert-item--on" : ""}`}
                                >
                                    <Icon size={14} className="ml-alert-item__icon"
                                        color={alerts[key] ? "#e8a020" : "#b0a090"} />
                                    <span className="ml-alert-item__label">{label}</span>
                                    <Toggle checked={alerts[key]} onChange={() => toggleAlert(key)} />
                                </div>
                            ))}
                        </div>
                        <p className="ml-alerts-note">
                            Changes are saved automatically for alert preferences.
                        </p>
                    </div>
                </div>
            </div>

            {/* ── Restaurant Identity ── */}
            <div className="ml-card mb-3">
                <div className="ml-card__header mb-1">
                    <div className="ml-card__title-row">
                        <span className="ml-icon ml-icon--green"><BiStore size={17} /></span>
                        <h2 className="ml-card__title">Restaurant Identity</h2>
                    </div>

                    {/* ✅ Save ↔ Edit Identity button */}
                    {restMode === "view" ? (
                        <button className="ml-btn ml-btn--outline" onClick={handleEditIdentity}>
                            <FiEdit2 size={13} /> Edit Identity
                        </button>
                    ) : (
                        <button className="ml-btn ml-btn--solid" onClick={handleSaveIdentity}>
                            <FiSave size={13} /> Save Identity
                        </button>
                    )}
                </div>
                <p className="ml-card__sub">Publicly visible establishment details</p>

                <div className="row g-3">

                    {/* Col 1 — Name + Cuisine */}
                    <div className="col-12 col-md-4">
                        <div className="ml-field">
                            <label className="ml-field__label">
                                <BiStore size={11} /> Restaurant Name
                            </label>
                            <input
                                className={`ml-field__input ${restErrors.name ? "ml-field__input--error" : ""}`}
                                type="text"
                                value={restMode === "edit" ? restDraft.name : restData.name}
                                disabled={restMode === "view"}
                                onChange={(e) => handleRestDraftChange("name", e.target.value)}
                                placeholder="Restaurant name"
                            />
                            {restErrors.name && <p className="ml-field__error">{restErrors.name}</p>}
                        </div>

                        <div className="ml-field mt-3">
                            <label className="ml-field__label">
                                <FiEdit2 size={11} /> Cuisine Style
                            </label>

                            {/* View mode: read-only styled div */}
                            {restMode === "view" ? (
                                <div className="ml-field__input ml-field__input--readonly">
                                    {restData.cuisine || "—"}
                                </div>
                            ) : (
                                <div className="ml-select-wrap">
                                    <select
                                        className={`ml-field__select ${restErrors.cuisine ? "ml-field__input--error" : ""}`}
                                        value={restDraft.cuisine}
                                        onChange={(e) => handleRestDraftChange("cuisine", e.target.value)}
                                    >
                                        <option value="">Select cuisine…</option>
                                        {cuisineOptions.map((c) => (
                                            <option key={c} value={c}>{c}</option>
                                        ))}
                                    </select>
                                    <span className="ml-select-arrow">▾</span>
                                </div>
                            )}
                            {restErrors.cuisine && <p className="ml-field__error">{restErrors.cuisine}</p>}
                        </div>
                    </div>

                    {/* Col 2 — Address */}
                    <div className="col-12 col-md-4">
                        <div className="ml-field">
                            <label className="ml-field__label">
                                <BiMap size={11} /> Full Address
                            </label>
                            <textarea
                                className={`ml-field__textarea ${restErrors.address ? "ml-field__input--error" : ""}`}
                                value={restMode === "edit" ? restDraft.address : restData.address}
                                disabled={restMode === "view"}
                                onChange={(e) => handleRestDraftChange("address", e.target.value)}
                                placeholder="Street address, city, zip"
                                rows={4}
                            />
                            {restErrors.address && <p className="ml-field__error">{restErrors.address}</p>}
                        </div>
                    </div>

                    {/* Col 3 — Operating Hours */}
                    <div className="col-12 col-md-4">
                        <div className="ml-field">
                            <label className="ml-field__label">
                                <BiTime size={11} /> Operating Hours
                            </label>
                            <div className="ml-hours-box">
                                {/* Mon–Fri */}
                                <div className="ml-hours-row">
                                    <span className="ml-hours-day">MON–FRI</span>
                                    {scheduleEdit ? (
                                        <div className="ml-hours-inputs">
                                            <input
                                                className="ml-hours-input"
                                                value={hoursDraft.monFriStart}
                                                onChange={(e) =>
                                                    setHoursDraft((p) => ({ ...p, monFriStart: e.target.value }))
                                                }
                                            />
                                            <span className="ml-hours-dash">–</span>
                                            <input
                                                className="ml-hours-input"
                                                value={hoursDraft.monFriEnd}
                                                onChange={(e) =>
                                                    setHoursDraft((p) => ({ ...p, monFriEnd: e.target.value }))
                                                }
                                            />
                                        </div>
                                    ) : (
                                        <span className="ml-hours-time">
                                            {hours.monFriStart} – {hours.monFriEnd}
                                        </span>
                                    )}
                                </div>

                                {/* Sat–Sun */}
                                <div className="ml-hours-row">
                                    <span className="ml-hours-day">SAT–SUN</span>
                                    {scheduleEdit ? (
                                        <div className="ml-hours-inputs">
                                            <input
                                                className="ml-hours-input"
                                                value={hoursDraft.satSunStart}
                                                onChange={(e) =>
                                                    setHoursDraft((p) => ({ ...p, satSunStart: e.target.value }))
                                                }
                                            />
                                            <span className="ml-hours-dash">–</span>
                                            <input
                                                className="ml-hours-input"
                                                value={hoursDraft.satSunEnd}
                                                onChange={(e) =>
                                                    setHoursDraft((p) => ({ ...p, satSunEnd: e.target.value }))
                                                }
                                            />
                                        </div>
                                    ) : (
                                        <span className="ml-hours-time">
                                            {hours.satSunStart} – {hours.satSunEnd}
                                        </span>
                                    )}
                                </div>
                            </div>

                            <button
                                className={`ml-btn-schedule ${scheduleEdit ? "ml-btn-schedule--active" : ""}`}
                                onClick={toggleSchedule}
                            >
                                {scheduleEdit
                                    ? <><BsCheckLg size={12} /> Save Schedule</>
                                    : <><BsPencilFill size={12} /> Edit Schedule</>}
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* ── Danger Zone ── */}
            <div className={`ml-card ml-danger-card ${deactivated ? "ml-danger-card--deactivated" : ""}`}>
                <div className="ml-danger-left">
                    <p className="ml-danger-title">
                        <BsExclamationTriangleFill size={15} /> Danger Zone
                    </p>
                    <p className="ml-danger-sub">Irreversible actions for your administration account.</p>
                </div>
                <button
                    className="ml-btn-deactivate"
                    onClick={() => !deactivated && setShowModal(true)}
                    disabled={deactivated}
                >
                    {deactivated ? "Dashboard Deactivated" : "Deactivate Dashboard"}
                </button>
            </div>

            {/* ── Deactivate Modal ── */}
            {showModal && (
                <div
                    className="ml-modal-overlay"
                    onClick={(e) => e.target === e.currentTarget && setShowModal(false)}
                >
                    <div className="ml-modal">
                        <div className="ml-modal__icon">
                            <BsExclamationTriangleFill size={24} color="#c0392b" />
                        </div>
                        <h3 className="ml-modal__title">Deactivate Dashboard?</h3>
                        <p className="ml-modal__body">
                            This action is <strong>irreversible</strong>. Your restaurant dashboard, all
                            associated data, menus, and configurations will be permanently deactivated.
                            You will lose access immediately.
                        </p>
                        <div className="ml-modal__actions">
                            <button className="ml-btn ml-btn--ghost" onClick={() => setShowModal(false)}>
                                Cancel
                            </button>
                            <button className="ml-btn ml-btn--danger" onClick={confirmDeactivate}>
                                Yes, Deactivate
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}