// src/components/BlogSection.jsx
import React from "react";
import "./BlogSection.css";

const posts = [
    {
        title: "The Delicious Burger",
        img: "https://images.unsplash.com/photo-1550547660-d9450f859349?w=400",
    },
    {
        title: "The Chinese Platter",
        img: "https://images.unsplash.com/photo-1612929633738-8fe44f7ec841?w=400",
    },
    {
        title: "The Delicious Pizza",
        img: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400",
    },
];

const BlogCard = ({ post }) => (
    <div className="col-md-4 mb-4">
        <div className="blog-card fade-in-card">
            <img
                src={post.img}
                alt={post.title}
                className="blog-image"
                loading="lazy"
            />
            <div className="blog-content">
                <div className="blog-meta">
                    <span>Sept 10, 2025</span>
                    <span>Admin</span>
                    <span>
                        <i className="fas fa-comment" /> 4
                    </span>
                </div>
                <h4 className="blog-title">{post.title}</h4>
                <p className="blog-excerpt">
                    A juicy beef patty topped with melted cheese, fresh lettuce, tomatoes,
                    and crisp greens, served with a light...
                </p>
            </div>
        </div>
    </div>
);

const BlogSection = () => {
    return (
        <section className="blog-section">
            <div className="container">
                <div className="section-title">
                    <h2>RECENT FROM BLOG</h2>
                </div>
                <div className="row">
                    {posts.map((p) => (
                        <BlogCard key={p.title} post={p} />
                    ))}
                </div>
            </div>
        </section>
    );
};

export default BlogSection;
