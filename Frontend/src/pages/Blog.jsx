import React, { useState } from "react";
import "../css/Blog.css";
import burger from "../assets/Img/Blog/blog-items/burger.jpeg"
import noodles from "../assets/Img/Blog/blog-items/noodles.jpeg"
import pizza from "../assets/Img/Blog/blog-items/pizza.jpeg"
import drinks from "../assets/Img/Blog/blog-items/drink.jpeg"
import rice from "../assets/Img/Blog/blog-items/rice.jpeg"
import cake from "../assets/Img/Blog/blog-items/cake.jpeg"
import salad from "../assets/Img/Blog/blog-items/salad.jpeg"
import tocos from "../assets/Img/Blog/blog-items/tocos.jpeg"
import sushi from "../assets/Img/Blog/blog-items/sushi.jpeg"
import pasta from "../assets/Img/Blog/blog-items/pasta.jpeg"
import grilled from "../assets/Img/Blog/blog-items/grilled.jpeg"
import desert from "../assets/Img/Blog/blog-items/desert.jpeg"

const Blog = () => {
    const [currentPage, setCurrentPage] = useState(1);
    const [isVideoPlaying, setIsVideoPlaying] = useState(false);

    // Sample blog data - you can replace with your actual data
    const blogPosts = [
        {
            id: 1,
            title: "The Delicious Burger",
            category: "FAST FOOD",
            date: "26 November 2024",
            description:
                "Juicy, flame-grilled burgers made with premium beef and fresh ingredients.",
            image: burger,
        },
        {
            id: 2,
            title: "The Chinese Platter",
            category: "CHINESE",
            date: "26 November 2024",
            description:
                "Authentic Chinese cuisine with bold flavors and traditional recipes.",
            image: noodles,
        },
        {
            id: 3,
            title: "The Delicious Pizza",
            category: "ITALIAN",
            date: "26 November 2024",
            description:
                "Wood-fired pizzas topped with the finest ingredients and melted cheese.",
            image: pizza,
        },
        {
            id: 4,
            title: "The Delicious Drink",
            category: "FAST FOOD",
            date: "26 November 2024",
            description: "Classic American drink served with ice and special choco.",
            image: drinks,
        },
        {
            id: 5,
            title: "The Chinese Platter",
            category: "CHINESE",
            date: "26 November 2024",
            description: "Exotic flavors from the Orient, prepared by expert chefs.",
            image: rice,
        },
        {
            id: 6,
            title: "The Delicious Platter",
            category: "FINE DINING",
            date: "26 November 2024",
            description:
                "Gourmet platters featuring a variety of international cuisines.",
            image: cake,
        },
        // Page 2 posts
        {
            id: 7,
            title: "Fresh Salad Bowl",
            category: "HEALTHY",
            date: "27 November 2024",
            description:
                "Crisp greens and fresh vegetables with signature dressings.",
            image: salad,
        },
        {
            id: 8,
            title: "Sushi Deluxe",
            category: "JAPANESE",
            date: "27 November 2024",
            description: "Premium sushi rolls made with the freshest seafood.",
            image: sushi,
        },
        {
            id: 9,
            title: "Pasta Carbonara",
            category: "ITALIAN",
            date: "27 November 2024",
            description: "Creamy pasta with crispy bacon and parmesan cheese.",
            image: pasta,
        },
        {
            id: 10,
            title: "Grilled Steak",
            category: "GRILL",
            date: "27 November 2024",
            description: "Perfectly grilled steaks seasoned to perfection.",
            image: grilled,
        },
        {
            id: 11,
            title: "Tacos Fiesta",
            category: "MEXICAN",
            date: "27 November 2024",
            description: "Authentic Mexican tacos with zesty flavors.",
            image: tocos,
        },
        {
            id: 12,
            title: "Dessert Paradise",
            category: "DESSERTS",
            date: "27 November 2024",
            description: "Indulgent desserts that satisfy your sweet tooth.",
            image: desert,
        },
    ];

    const postsPerPage = 6;
    const totalPages = Math.ceil(blogPosts.length / postsPerPage);

    // Get current posts
    const indexOfLastPost = currentPage * postsPerPage;
    const indexOfFirstPost = indexOfLastPost - postsPerPage;
    const currentPosts = blogPosts.slice(indexOfFirstPost, indexOfLastPost);

    const handlePageChange = (pageNumber) => {
        setCurrentPage(pageNumber);
        // Smooth scroll to cards section
        document.querySelector(".cards-section")?.scrollIntoView({
            behavior: "smooth",
            block: "start",
        });
    };

    const handlePlayVideo = () => {
        setIsVideoPlaying(true);
    };

    return (
        <div className="blog-page">
            {/* Hero Section */}
            <section className="blog-hero-section">
                <div className="blog-hero-overlay"></div>
                <div className="blog-hero-content">
                    <h1 className="blog-hero-title">READ OUR BLOG</h1>
                    <div className="hero-breadcrumb">
                        <span>HOME</span>
                        <span className="separator">/</span>
                        <span>BLOG</span>
                    </div>
                    <h2 className="blog-hero-subtitle">
                        Order Healthy and Fresh
                        <br />
                        Food Any Time
                    </h2>
                </div>
            </section>

            {/* Cards Section */}
            <section className="cards-section">
                <div className="section-label">
                    <span className="section-title">READ FROM BLOG</span>
                </div>

                <div className="cards-container">
                    {currentPosts.map((post, index) => (
                        <div
                            key={post.id}
                            className="blog-card"
                            style={{ animationDelay: `${index * 0.1}s` }}
                        >
                            <div className="card-image">
                                <img src={post.image} alt={post.title} />
                            </div>
                            <div className="card-content">
                                <div className="card-meta">
                                    <span className="card-category">{post.category}</span>
                                    <span className="card-date">
                                        <i className="calendar-icon"></i>
                                        {post.date}
                                    </span>
                                </div>
                                <h3 className="card-title">{post.title}</h3>
                                <p className="card-description">{post.description}</p>
                                <button className="read-more-btn">READ MORE</button>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Pagination */}
                <div className="pagination">
                    <button
                        className="pagination-arrow"
                        onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                        disabled={currentPage === 1}
                    >
                        ‹
                    </button>

                    {[...Array(totalPages)].map((_, index) => (
                        <button
                            key={index + 1}
                            className={`pagination-number ${currentPage === index + 1 ? "active" : ""}`}
                            onClick={() => handlePageChange(index + 1)}
                        >
                            {index + 1}
                        </button>
                    ))}

                    <button
                        className="pagination-arrow"
                        onClick={() =>
                            handlePageChange(Math.min(totalPages, currentPage + 1))
                        }
                        disabled={currentPage === totalPages}
                    >
                        ›
                    </button>
                </div>
            </section>

            {/* Video Section */}
            <section className="video-section">
                <div className="video-overlay"></div>
                {!isVideoPlaying ? (
                    <div className="video-placeholder">
                        <button className="play-button" onClick={handlePlayVideo}>
                            <svg
                                viewBox="0 0 24 24"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                            >
                                <path d="M8 5.14v14.72L19 12L8 5.14z" fill="currentColor" />
                            </svg>
                        </button>
                    </div>
                ) : (
                    <div className="video-player">
                        <video
                            controls
                            autoPlay
                            src="https://youtube.com/shorts/gimNce_NsoM?si=GWgKzysBSveX2l6C"
                            className="video-element"
                        >
                            Your browser does not support the video tag.
                        </video>
                    </div>
                )}
            </section>
        </div>
    );
};

export default Blog;
