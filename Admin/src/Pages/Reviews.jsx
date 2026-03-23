import React, { useEffect, useMemo, useState } from "react";
import "../CSS/Reviews.css";
import {
    FiChevronLeft,
    FiChevronRight,
    FiFilter,
    FiSearch,
    FiStar,
} from "react-icons/fi";
import { FaStar } from "react-icons/fa";

const REVIEW_FILTERS = [
    { key: "all", label: "All Reviews" },
    { key: "approved", label: "Approve" },
    { key: "pending", label: "Pending" },
    { key: "rejected", label: "Reject" },
];

const RATING_FILTERS = [
    { key: "all", label: "All Ratings" },
    { key: "5-4", label: "5-4 Star" },
    { key: "4-3", label: "4-3 Star" },
    { key: "3-2", label: "3-2 Star" },
    { key: "2-1", label: "2-1 Star" },
];

const REVIEW_IDENTITIES = [
    {
        orderId: "#CO1234",
        name: "Mohan Due",
        title: "Friendly Services",
        time: "12:00 PM",
        rating: 4,
    },
    {
        orderId: "#CO1235",
        name: "Riya Sen",
        title: "Quick Delivery",
        time: "12:20 PM",
        rating: 5,
    },
    {
        orderId: "#CO1236",
        name: "Arjun Das",
        title: "Great Packaging",
        time: "12:45 PM",
        rating: 4,
    },
    {
        orderId: "#CO1237",
        name: "Sneha Roy",
        title: "Friendly Services",
        time: "01:10 PM",
        rating: 3,
    },
    {
        orderId: "#CO1238",
        name: "Karan Mehta",
        title: "Very Professional",
        time: "01:35 PM",
        rating: 4,
    },
    {
        orderId: "#CO1239",
        name: "Nisha Paul",
        title: "Excellent Support",
        time: "02:00 PM",
        rating: 5,
    },
];

const reviewTemplates = [
    {
        status: "pending",
        badge: null,
    },
    {
        status: "pending",
        badge: null,
    },
    {
        status: "pending",
        badge: null,
    },
    {
        status: "pending",
        badge: null,
    },
    {
        status: "approved",
        badge: "Approved",
    },
    {
        status: "rejected",
        badge: "Rejected",
    },
];

const INITIAL_REVIEWS = Array.from({ length: 18 }, (_, index) => {
    const template = reviewTemplates[index % reviewTemplates.length];
    const identity = REVIEW_IDENTITIES[index % REVIEW_IDENTITIES.length];
    const day = 22 + Math.floor(index / 6);

    return {
        id: index + 1,
        date: `${day.toString().padStart(2, "0")}/03/2022`,
        time: identity.time,
        orderId: identity.orderId,
        name: identity.name,
        title: identity.title,
        rating: identity.rating,
        review:
            '"When service is delivered with sincerity and a positive attitude, it transforms ordinary moments into memorable experiences that inspire trust, loyalty, and lasting ..."',
        ...template,
    };
});

function ReviewStars({ rating }) {
    return (
        <div className="review-rating">
            <span className="review-rating-value">{rating.toFixed(1)}</span>
            <div className="review-stars" aria-label={`${rating} star rating`}>
                {Array.from({ length: 5 }, (_, index) =>
                    index < Math.floor(rating) ? (
                        <FaStar key={index} className="review-star filled" />
                    ) : (
                        <FiStar key={index} className="review-star" />
                    )
                )}
            </div>
        </div>
    );
}

function ReviewCard({ review, onAction }) {
    return (
        <article className="review-card">
            <div className="review-date-block">
                <p>{review.date}</p>
                <h4>{review.time}</h4>
            </div>

            <div className="review-avatar" aria-hidden="true">
                <span>MD</span>
            </div>

            <div className="review-customer">
                <p className="review-order-id">{review.orderId}</p>
                <h4>{review.name}</h4>
            </div>

            <div className="review-content">
                <div className="review-content-top">
                    <div className="review-heading-group">
                        <h3>{review.title}</h3>
                        {review.badge && (
                            <span
                                className={`review-badge ${review.badge === "Approved"
                                        ? "review-badge-approved"
                                        : "review-badge-rejected"
                                    }`}
                            >
                                {review.badge}
                            </span>
                        )}
                    </div>

                    <ReviewStars rating={review.rating} />
                </div>

                <p className="review-text">{review.review}</p>
            </div>

            <div className="review-action-area">
                <button
                    type="button"
                    className="review-action-button review-action-approve"
                    onClick={() => onAction(review.id, "Approve")}
                >
                    Approve
                </button>

                <button
                    type="button"
                    className="review-action-button review-action-reject"
                    onClick={() => onAction(review.id, "Reject")}
                >
                    Reject
                </button>
            </div>
        </article>
    );
}

const Reviews = () => {
    const [reviews, setReviews] = useState(INITIAL_REVIEWS);
    const [activeFilter, setActiveFilter] = useState("all");
    const [showFilters, setShowFilters] = useState(false);
    const [activeRatingFilter, setActiveRatingFilter] = useState("all");
    const [searchTerm, setSearchTerm] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 6;

    const filteredReviews = useMemo(() => {
        const term = searchTerm.trim().toLowerCase();

        return reviews.filter((review) => {
            const matchesFilter =
                activeFilter === "all" ? true : review.status === activeFilter;

            const matchesRating =
                activeRatingFilter === "all"
                    ? true
                    : (activeRatingFilter === "5-4" &&
                        review.rating <= 5 &&
                        review.rating >= 4) ||
                    (activeRatingFilter === "4-3" &&
                        review.rating < 4 &&
                        review.rating >= 3) ||
                    (activeRatingFilter === "3-2" &&
                        review.rating < 3 &&
                        review.rating >= 2) ||
                    (activeRatingFilter === "2-1" &&
                        review.rating < 2 &&
                        review.rating >= 1);

            const matchesSearch =
                !term ||
                review.name.toLowerCase().includes(term) ||
                review.orderId.toLowerCase().includes(term) ||
                review.title.toLowerCase().includes(term);

            return matchesFilter && matchesRating && matchesSearch;
        });
    }, [activeFilter, activeRatingFilter, reviews, searchTerm]);

    const paginatedReviews = filteredReviews.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );
    const totalPages = Math.max(1, Math.ceil(filteredReviews.length / itemsPerPage));

    useEffect(() => {
        setCurrentPage((page) => Math.min(page, totalPages));
    }, [totalPages]);

    const handleFilterChange = (filterKey) => {
        setActiveFilter(filterKey);
        setCurrentPage(1);
    };

    const handleAction = (reviewId, action) => {
        setReviews((currentReviews) =>
            currentReviews.map((review) => {
                if (review.id !== reviewId) {
                    return review;
                }

                if (action === "Approve") {
                    return {
                        ...review,
                        status: "approved",
                        badge: "Approved",
                    };
                }

                if (action === "Reject") {
                    return {
                        ...review,
                        status: "rejected",
                        badge: "Rejected",
                    };
                }

                return review;
            })
        );
    };

    return (
        <div className="reviews-page">
            <div className="reviews-shell">
                <h2 className="reviews-title">Reviews</h2>

                <div className="reviews-toolbar">
                    <label className="reviews-search">
                        <input
                            type="text"
                            placeholder="Search here....."
                            value={searchTerm}
                            onChange={(event) => {
                                setSearchTerm(event.target.value);
                                setCurrentPage(1);
                            }}
                        />
                        <FiSearch className="reviews-search-icon" />
                    </label>

                    <div className="reviews-filters">
                        <div className="reviews-filter-menu">
                            <button
                                type="button"
                                className={`reviews-filter-button reviews-filter-toggle ${showFilters ? "active" : ""
                                    }`}
                                onClick={() => setShowFilters((current) => !current)}
                            >
                                <FiFilter />
                                Filter
                            </button>

                            {showFilters && (
                                <div className="reviews-filter-dropdown">
                                    {RATING_FILTERS.map((filter) => (
                                        <button
                                            key={filter.key}
                                            type="button"
                                            className={`reviews-filter-dropdown-item ${activeRatingFilter === filter.key ? "active" : ""
                                                }`}
                                            onClick={() => {
                                                setActiveRatingFilter(filter.key);
                                                setCurrentPage(1);
                                                setShowFilters(false);
                                            }}
                                        >
                                            {filter.label}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        {REVIEW_FILTERS.map((filter) => (
                            <button
                                key={filter.key}
                                type="button"
                                className={`reviews-filter-button ${activeFilter === filter.key ? "active" : ""
                                    }`}
                                onClick={() => handleFilterChange(filter.key)}
                            >
                                {filter.label}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="reviews-list">
                    {paginatedReviews.length > 0 ? (
                        paginatedReviews.map((review) => (
                            <ReviewCard
                                key={review.id}
                                review={review}
                                onAction={handleAction}
                            />
                        ))
                    ) : (
                        <div className="reviews-empty">No reviews found.</div>
                    )}
                </div>

                <div className="reviews-pagination">
                    <button
                        type="button"
                        className="reviews-page-arrow"
                        onClick={() => setCurrentPage((page) => Math.max(page - 1, 1))}
                        disabled={currentPage === 1}
                    >
                        <FiChevronLeft />
                    </button>

                    {Array.from({ length: totalPages }, (_, index) => index + 1).map(
                        (page) => (
                            <button
                                key={page}
                                type="button"
                                className={`reviews-page-number ${currentPage === page ? "active" : ""
                                    }`}
                                onClick={() => setCurrentPage(page)}
                            >
                                {page}
                            </button>
                        )
                    )}

                    <button
                        type="button"
                        className="reviews-page-arrow"
                        onClick={() =>
                            setCurrentPage((page) => Math.min(page + 1, totalPages))
                        }
                        disabled={currentPage === totalPages}
                    >
                        <FiChevronRight />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Reviews;
