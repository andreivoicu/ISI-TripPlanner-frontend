import React from "react";
import { Link } from "react-router-dom";

const HomePage = () => {
    return (
        <div
            style={{
                height: "100vh", // Make the container take up the full height of the viewport
                backgroundImage:
                    'url("https://images.unsplash.com/photo-1461183479101-6c14cd5299c4?fm=jpg&q=60&w=3000&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NHx8cm91dGUlMjBtYXB8ZW58MHx8MHx8fDA%3D")', // Replace with your background image URL
                backgroundSize: "cover", // Ensure the background image covers the entire screen
                backgroundPosition: "center", // Center the background image
                display: "flex",
                justifyContent: "center", // Center content horizontally
                alignItems: "center", // Center content vertically
            }}
        >
            <div
                style={{
                    textAlign: "center",
                    padding: "40px",
                    backgroundColor: "rgba(255, 255, 255, 0.8)", // Semi-transparent white background for content
                    borderRadius: "8px",
                    width: "35%", // Adjust width of the content container
                    backdropFilter: "blur(2px)",
                }}
            >
                <div
                    style={{
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                    }}
                >
                    <h1 style={{ color: "black", marginRight: "10px" }}>
                        Welcome to Trip Planner
                    </h1>
                    <img
                        src="https://icon-park.com/imagefiles/paper_plane_green.png" // Replace with your paper airplane icon URL
                        alt="Paper Airplane"
                        style={{
                            width: "60px",
                            height: "60px",
                            objectFit: "contain",
                        }}
                    />
                </div>
                <div
                    style={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                    }}
                >
                    <button
                        style={{
                            margin: "10px",
                            padding: "15px 30px",
                            backgroundColor: "#4CAF50", // Green background for the button
                            color: "white",
                            border: "none",
                            borderRadius: "5px",
                            cursor: "pointer",
                            fontSize: "20px",
                            display: "block",
                        }}
                    >
                        <Link
                            to="/account"
                            style={{
                                textDecoration: "none",
                                color: "white",
                            }}
                        >
                            Account Info
                        </Link>
                    </button>
                    <button
                        style={{
                            margin: "10px",
                            padding: "15px 30px",
                            backgroundColor: "#4CAF50", // Green background for the button
                            color: "white",
                            border: "none",
                            borderRadius: "5px",
                            cursor: "pointer",
                            fontSize: "20px",
                        }}
                    >
                        <Link
                            to="/map"
                            style={{
                                textDecoration: "none",
                                color: "white",
                            }}
                        >
                            Map
                        </Link>
                    </button>
                    <button
                        style={{
                            margin: "10px",
                            padding: "15px 30px",
                            backgroundColor: "#4CAF50", // Green background for the button
                            color: "white",
                            border: "none",
                            borderRadius: "5px",
                            cursor: "pointer",
                            fontSize: "20px",
                        }}
                    >
                        <Link
                            to="/settings"
                            style={{
                                textDecoration: "none",
                                color: "white",
                            }}
                        >
                            Settings 
                        </Link>
                    </button>
                    
                </div>
            </div>
        </div>
    );
};

export default HomePage;
