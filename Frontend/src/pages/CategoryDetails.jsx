import { useParams, useNavigate } from "react-router-dom";
import { FaStar, FaArrowLeft, FaShoppingBag } from "react-icons/fa";
import "../CSS/CategoryDetails.css";
import { useCart } from "../context/CartContext.jsx";

// Precise mapping of Categories from Home Page
const allAppCategories = [
    "Pizza", "Paratha / Roti", "Shakes / Drinks", "Biryani", "Burger", "Noodles",
    "Cake", "Chaat", "Ice Cream", "South Indian", "Sushi", "Salad", "Tacos",
    "Steak", "Sandwich", "Juice", "Tea/Coffee", "Wrap", "Soup", "BBQ"
];

const categoryMetadata = {
    "Pizza": {
        description: "Experience the authentic taste of Italy with our hand-stretched pizzas topped with the freshest ingredients and gourmet cheeses.",
        names: ["Domino's", "Pizza Hut", "The Pizza Box", "Italiano", "Ovenstory", "La Pino'z", "Chicago Pizza", "Pizza Express"],
        tags: "Pizza, Italian, Fast Food"
    },
    "Biryani": {
        description: "Indulge in the royal flavors of carefully aged basmati rice, slow-cooked with aromatic spices and tender choice of proteins.",
        names: ["Biryani House", "Paradise", "Behrouz", "Lucky Biryani", "Royal Kitchen", "Aminia", "Arsalan", "Biryani By Kilo"],
        tags: "Biryani, North Indian, Royal"
    },
    "Paratha / Roti": {
        description: "Savor the comfort of warm, flaky parathas and soft rotis, served with authentic side dishes and dollops of butter.",
        names: ["Paratha Junction", "Roti Ghar", "Flatbread Hub", "Punjab Grill", "Kake Di Hatti", "Pind Balluchi", "The Roti Co.", "Desi Bites"],
        tags: "North Indian, Breads, Desi"
    },
    "Burger": {
        description: "Sink your teeth into juicy, flame-grilled patties served with crisp lettuce, melted cheese, and our secret signature sauces.",
        names: ["Burger King", "Biggies", "The Burger Club", "Wat-a-Burger", "Burger Singh", "Five Guys", "The Joint", "Grill Master"],
        tags: "Burgers, Fast Food, American"
    },
    "Noodles": {
        description: "From spicy Hakka to savory ramen, explore a world of long, delicious noodles tossed with fresh vegetables and exotic sauces.",
        names: ["Noodle Point", "Wok Hei", "The Noodle Story", "Asian Soul", "Chinatown", "Dimsum & Co", "The Red Box", "Mainland China"],
        tags: "Chinese, Asian, Noodles"
    },
    "Cake": {
        description: "Celebrate every moment with our decadent cakes, freshly baked with premium cocoa, creamy frostings, and a touch of magic.",
        names: ["Cake World", "The Baking Co.", "Sweet Dreams", "Cakes & Bakes", "Parisian Bakery", "The Cake Room", "Berry Blossoms", "Cocoa Craft"],
        tags: "Desserts, Bakery, Cakes"
    },
    "Shakes / Drinks": {
        description: "Refresh your senses with our thick, creamy milkshakes, energetic fruit blends, and chilled artisanal beverages.",
        names: ["Shake Factory", "The Thickshake", "Keventers", "Fruit Lovers", "Drubk Shakes", "Bevvy", "Cooldown", "The Juice Bar"],
        tags: "Beverages, Shakes, Refreshing"
    },
    "South Indian": {
        description: "Journey to the south with crispy dosas, fluffy idlis, and aromatic sambars that bring the authentic taste of the coast to your plate.",
        names: ["Dakshin", "Sagar Ratna", "Saravana Bhavan", "Malgudi", "The Dosa Hub", "Idli Empire", "Anna's Kitchen", "Coastal Curries"],
        tags: "South Indian, Dosa, Healthy"
    },
    "Sushi": {
        description: "Masterfully crafted rolls of vinegared rice and fresh sea ingredients, served with authentic wasabi and pickled ginger.",
        names: ["Sushiya", "Wasabi", "The Rolling Pin", "Tokyo Dine", "Zen Garden", "Nippon Palace", "Sakura", "Orient Express"],
        tags: "Japanese, Sushi, Seafood"
    },
    "Chaat": {
        description: "A burst of sweet, spicy, and tangy flavors in every bite. Experience the true essence of Indian street food culture.",
        names: ["Chaat Chatore", "Haldiram's", "Bikanervala", "Street Treats", "Golgappa King", "Tikky Hut", "Indian Spices", "Chaat Bazaar"],
        tags: "Street Food, North Indian, Snacks"
    },
    "Ice Cream": {
        description: "Dive into a world of frozen bliss with our creamy artisanal ice creams, featuring exotic fruits, nuts, and chocolate swirls.",
        names: ["Baskin Robbins", "Cream Stone", "Natural's", "Cold Stone", "Gelato Vinto", "The Scoop House", "Iceberg", "Polar Bear"],
        tags: "Ice Cream, Dessert, Cold"
    },
    "Salad": {
        description: "Fresh, crunchy, and nutrient-packed bowls of seasonal greens, tossed with artisanal dressings and protein-rich toppings.",
        names: ["Salad Days", "The Green Bowl", "Healthy Bites", "Leafy Greens", "Freshly", "Go Salad", "Farm to Table", "NutriLife"],
        tags: "Healthy, Salad, Diet"
    },
    "Tacos": {
        description: "Authentic Mexican flavors folded into warm corn or flour tortillas, packed with seasoned meats, fresh salsa, and creamy guac.",
        names: ["Taco Bell", "The Taco House", "Mexican Grill", "Sombrero", "Viva Mexico", "TexMex", "Spicy Tacos", "The Salsa Bar"],
        tags: "Mexican, Tacos, Tex-Mex"
    },
    "Steak": {
        description: "Premium cuts of meat, seasoned with sea salt and herbs, flame-seared to perfection for a tender and juicy experience.",
        names: ["The Steak House", "Grill Station", "Sizzler", "Prime Cuts", "Meat lovers", "The Iron Grill", "Steak & Co", "Flame On"],
        tags: "Steak, Continental, Grill"
    },
    "Sandwich": {
        description: "Gourmet fillings layered between artisanal breads, toasted to perfection for the ultimate handcrafted lunch.",
        names: ["Subway", "The Sandwich Co.", "Fresh Deli", "Bread & Butter", "Toasted", "Panini Hub", "Morning Bites", "Deli Express"],
        tags: "Sandwich, Fast Food, Snacks"
    },
    "Juice": {
        description: "100% natural, cold-pressed juices that pack the goodness of fresh fruits and vegetables into every refreshing drop.",
        names: ["Juice World", "The Pulp Loft", "Fresh Squeeze", "Nature's Nectar", "Pure Juice", "Liquid Gold", "The Fruit Lab", "Vitamin Hub"],
        tags: "Juice, Beverages, Healthy"
    },
    "Tea/Coffee": {
        description: "Artisanal coffee beans and premium tea leaves brewed to perfection, offering a warm hug in every cup.",
        names: ["Starbucks", "Blue Tokai", "The Chai Point", "Coffee Day", "Barista", "Costa Coffee", "The Tea Leaf", "Brewed Magic"],
        tags: "Coffee, Tea, Beverages"
    },
    "Wrap": {
        description: "Freshly prepared ingredients rolled into soft flatbreads, offering a convenient and delicious meal on the go.",
        names: ["Faasos", "The Wrap Co.", "Rolls Mania", "Tasty Wraps", "Wrap It Up", "Hunger Rolls", "Quick Bites", "Roll King"],
        tags: "Wraps, Fast Food, Lebanese"
    },
    "Soup": {
        description: "Warm, soothing bowls of goodness prepared with slow-simmered broths, fresh aromatics, and wholesome ingredients.",
        names: ["The Soup Bowl", "Healthy Sips", "Broth House", "Slow Simmer", "Warm Hugs", "The Soupery", "Nourish", "Winter Warmers"],
        tags: "Soup, Healthy, Continental"
    },
    "BBQ": {
        description: "Smoky, tender, and fall-off-the-bone deliciousness, glazed with our signature hickory and honey BBQ sauces.",
        names: ["Barbeque Nation", "Absolute Barbecues", "The Smoke House", "Grilled & Smoked", "Hickory Hub", "Pitt Master", "Fire & Ice", "BBQ King"],
        tags: "BBQ, Grill, Non-Veg"
    }
};

function getPhotoIds(name) {
    const photoSets = {
        "Pizza": ["1513104890138-7c749659a591", "1574126154517-d1e0d89ef734", "1593560708920-61dd98c46a4e", "1565299624946-b28f40a0ae38", "1571407970349-bc81e7e96d47", "1541745537411-b8046dc6d66c", "1534308983496-4fabb1a015ee", "1590947132387-155cc02f3212"],
        "Biryani": ["1563379091339-03b21ab4a4f8", "1589302168068-964664d93dc0", "1633945274405-b6c8069047b0", "1631515243349-e0cb75fb8d3a", "1543353071-873f17a7a088", "1633945274421-4418af516012", "1506071289139-51539a4f1f0a", "1516714435131-245136829967"],
        "Paratha / Roti": ["1565557623262-b51c2513a641", "1626074353765-517a681e40be", "1606491956689-2ea866880c84", "1610192244261-3f33de3f55e4", "1589301760014-d929f3979dbc", "1604152135912-04a002e7713a", "1510344415842-bc05191593e9", "1626777555079-711756585f60"],
        "Burger": ["1568901346375-23c9450c58cd", "1571091718767-18b5b1457add", "1594212699903-ec8a3eca50f5", "1550547660-d9450f859349", "1551782450-a2132b4ba21d", "1561758033-d89a9ad46330", "1553979459-257aee720235", "1586816001966-79b736744398"],
        "Noodles": ["1612929633738-8fe44f7ec841", "1585032226651-759b368d7246", "1512058564366-18510be2db19", "1625220194771-7ebdea0b70b9", "1525755662778-989d0524087e", "1552611052-33e04de081de", "1569718212165-3a8278d5f624", "1582542126991-036109e51c86"],
        "Cake": ["1578985545062-69928b1d9587", "1535141192574-5d4897c12636", "1563729784474-d77dbb933a9e", "1562329265-95a6d7a83440", "1511911063855-2bf39afa5b2e", "1488477181946-6428a0291777", "1519869325930-28162b5374fb", "1551024601-bec78aea704b"],
        "Shakes / Drinks": ["1536304993881-ff6e9eefa2a6", "1513558161293-cdaf765ed2fd", "1553530666-8a9d02179b5b", "1572490122482-1e967a9a386d", "1471691114206-f831206126da", "1571407970349-bc81e7e96d47", "1540307294528-662867ef9762", "1513558161293-cdaf765ed2fd"],
        "South Indian": ["1589301760014-d929f3979dbc", "1589302168068-964664d93dc0", "1630383249896-424e482df921", "1610192244261-3f33de3f55e4", "1526318896941-782bd0175990", "1610192451319-3c7344933a8c", "1510344415842-bc05191593e9", "1601356616023-41efd4972f3a"],
        "Sushi": ["1579871494447-9811cf80d66c", "1559183011-85b545d02e3b", "1584080312781-be630739c4a7", "1553621042-f0464ea41c6d", "1579513185501-df05a23aa831", "1633519146312-71110f69953c", "1559183050-fc85785006b5", "161719224418af"],
        "Chaat": ["1601050633722-6d1232145391", "1626132646508-14886a10f16d", "1642142244261-ab602d4331aa", "1512621776951-a57141f2eefd", "1601356616023-41efd4972f3a", "161019224418af", "1588191334057-3f9f3655b376", "1516714435131-245136829967"],
        "Ice Cream": ["1497034825429-c343d7c6a68f", "1501443762641-78789c81f1c6", "1557142010-ea6c194a28f3", "1488900128322-d0460d3d5f47", "1560507518-20da5d2298a8", "1515037021171-9ec3f0f72390", "1563729784474-d77dbb933a9e", "1551024601-bec78aea704b"],
        "Salad": ["1512621776951-a57141f2eefd", "1540183511-5f28f11ec411", "1546069901-ba9599a7e63c", "1623427435753-413fe3a597bf", "1512621776951-a57141f2eefd", "1540410143128-ed4778d20ae5", "1604152135912-04a002e7713a", "1464454709821-dea9b4f4bc5a"],
        "Tacos": ["1565299585323-38d6b0865b47", "1512838242312-d81a5a069502", "1593584774127-3f1366c5db24", "1552332386-f8dd00dc2f85", "1564844026343-43c393739726", "1551326806-35ba012011f4", "1552332386-218274155a01", "1560642239860-f550ce710b93"],
        "Steak": ["1600891964092-4316c288032e", "1603048588661-83ae245b7640", "1558030006-02f45cc1fcfe", "1544025162-d44649a37c04", "1598515214211-7543a7b4693e", "1432133930836-e13781292134", "1594179047513-31f3cf60d840", "161042224418af"],
        "Sandwich": ["1528735602780-2552fd46c7af", "1538555940404-79b9f3c2bc12", "1553909481-cd209707ce4b", "1567234669003-d1df19d30a3a", "1475090122-3c8b05cf2093", "1604494002444-245c612f1703", "1519708221609-b7625161033f", "1543339308-4144e1194ac1"],
        "Juice": ["1603569283847-aa295f0d016a", "1490474418141-11a5a6ec8c7b", "1625505826508-9fd99684160e", "1610972323551-24b2024fadad", "1567839656-70e281698391", "1541011400871-9c600f90e1ea", "1525904097-8aef008e470a", "1589733955931-188b202863c8"],
        "Tea/Coffee": ["1541167760496-1628856ab772", "1509042239860-f550ce710b93", "1495474472288-57bd5d702ca9", "1514432324607-aa6f2722050b", "1498307833015-95a3d702ca16", "1497935784962-d71c828d1323", "1544233748-abbec26840a2", "1556915052-e9c451da7bcc"],
        "Wrap": ["1626700051175-6818013e1d4f", "1541592182-d241ff993c96", "1553184911-fc20d9123862", "1623334235-951598465cb3", "1565557623262-b51c2513a641", "1626733221-512058564366", "1543353071-873f17a7a088", "1601050633722-6d1232145391"],
        "Soup": ["1547592166-23ac45744acd", "1548946161834-4029bc12e75e", "1551024601-bec78aea704b", "1540422479260-01fbefd22bd2", "1603107002-3c87155cc02f", "1553530666-8a9d02179b5b", "1511911063855-2bf39afa5b2e", "1598515214211-7543a7b4693e"],
        "BBQ": ["1555939594-58d7cb561ad1", "1544145945-bef46761ab3c", "152919359118c-99f666b60e64", "1504675031-11a91e56ced2", "1482042013-11a91e56ced2", "1464454709821-dea9b4f4bc5a", "1491590878842-1e967a9a386d", "161042224418af"]
    };
    return photoSets[name] || Array(8).fill("1546069901-ba9599a7e63c");
}

// Comprehensive and Accurate Category Content
const categoryContent = {};

allAppCategories.forEach(cat => {
    const photoIds = getPhotoIds(cat);
    const meta = categoryMetadata[cat] || {
        description: `Delve into our curated selection of ${cat} favorites, where quality meets taste in every single serving.`,
        names: ["Royal", "Express", "Kitchen", "Corner", "Bistro", "Hub", "World", "Excellence"],
        tags: `${cat}, Quick Bites`
    };

    const key = cat.toLowerCase().trim();
    categoryContent[key] = {
        title: cat,
        description: meta.description,
        restaurants: Array.from({ length: 8 }, (_, i) => ({
            id: 600 + allAppCategories.indexOf(cat) * 10 + i,
            name: meta.names[i] ? `${meta.names[i]}${meta.names[i].toLowerCase().includes(cat.toLowerCase()) ? '' : ` ${cat}`}` : `${cat} Point ${i + 1}`,
            image: `https://images.unsplash.com/photo-${photoIds[i]}?auto=format&fit=crop&w=600&q=80`,
            offer: i % 2 === 0 ? "FLAT 50% OFF" : "ITEMS @ ₹199",
            rating: (4.1 + Math.random() * 0.8).toFixed(1),
            time: `${15 + i * 2}-${25 + i * 2} mins`,
            category: meta.tags,
            location: "Bhubaneswar"
        }))
    };
});

const CategoryDetails = () => {
    const { categoryId } = useParams();
    const navigate = useNavigate();
    const { itemsCount, cartTotal } = useCart();

    // Normalize incoming ID for matching
    const normalizedId = categoryId ? decodeURIComponent(categoryId).toLowerCase().trim() : "pizza";
    const categoryData = categoryContent[normalizedId] || categoryContent["pizza"];
    const displayTitle = categoryData ? categoryData.title : "Pizza";

    return (
        <div className="category-details-page">
            <div className="category-details-container">
                <button
                    className="btn-back mb-5 d-flex align-items-center gap-2 border-0 bg-transparent text-muted fw-bold"
                    onClick={() => navigate("/")}
                    style={{ cursor: "pointer", fontSize: "1.1rem" }}
                >
                    <FaArrowLeft /> Back to Home
                </button>

                <header className="category-header">
                    <h1 className="category-title">{displayTitle}</h1>
                    <p className="category-description">
                        "{categoryData.description}"
                    </p>
                </header>

                <div className="restaurant-grid">
                    {categoryData.restaurants.map((res) => (
                        <div
                            key={res.id}
                            className="premium-card"
                            onClick={() => navigate(`/restaurant/${res.id}`)}
                        >
                            <div className="card-image-wrapper">
                                <img src={res.image} alt={res.name} />
                                <div className="offer-overlay">
                                    <div className="offer-text">{res.offer}</div>
                                    <div className="blue-bar"></div>
                                </div>
                            </div>
                            <div className="card-content">
                                <h3 className="res-name">{res.name}</h3>
                                <div className="res-meta">
                                    <div className="res-rating">
                                        <FaStar size={10} />
                                        <span>{res.rating}</span>
                                    </div>
                                    <div className="dot-separator"></div>
                                    <div className="res-time">{res.time}</div>
                                </div>
                                <div className="res-tags">{res.category}</div>
                                <div className="res-location">{res.location}</div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Floating Checkout Bar */}
            {itemsCount > 0 && (
                <div className="floating-cart-bar-global shadow-lg d-flex align-items-center justify-content-between px-4 py-3 cursor-pointer" onClick={() => navigate('/cart')}>
                    <div className="cart-info d-flex align-items-center gap-3">
                        <span className="fw-900 text-white">{itemsCount} {itemsCount === 1 ? 'ITEM' : 'ITEMS'} | ₹{cartTotal}</span>
                    </div>
                    <div className="view-cart-btn d-flex align-items-center gap-2">
                        <span className="fw-900 text-white">VIEW CART</span>
                        <FaShoppingBag color="white" />
                    </div>
                </div>
            )}

            <style>{`
                .floating-cart-bar-global {
                    position: fixed;
                    bottom: 20px;
                    left: 50%;
                    transform: translateX(-50%);
                    width: 90%;
                    max-width: 800px;
                    background-color: #60B246;
                    border-radius: 8px;
                    z-index: 1000;
                    transition: all 0.3s ease;
                    cursor: pointer;
                }
                .floating-cart-bar-global:hover {
                    background-color: #56a03f;
                    transform: translateX(-50%) translateY(-2px);
                }
            `}</style>
        </div>
    );
};

export default CategoryDetails;
