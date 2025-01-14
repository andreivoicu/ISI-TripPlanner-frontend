import React, { useEffect, useState } from "react";
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const AccountPage = () => {
    // State to store account data
    const navigate = useNavigate();
    const [accountInfo, setAccountInfo] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [routeList, setRouteList] = useState([]);

    const API_URL = process.env.REACT_APP_API_URL;
    const GET_ACCOUNT_INFO_URL = `${API_URL}/user`;
    const UPDATE_ACCOUNT_INFO_URL = `${API_URL}/user`;
    const GET_ROUTES_URL = `${API_URL}/routes`;

    const [formData, setFormData] = useState({
        first_name: "",
        last_name: "",
        username: "",
        email: "",
    });

    const handleRouteSelection = (route) => {
        console.log(`SELECTED ROUTE: ${route.city}`);
        // console.log(route);

        const POIs = route.points_of_interest
        console.log(POIs);

        // de scos starting point
        const startingPoint = POIs.filter((poi) => poi.name === "Starting location")[0];
        console.log("starting point");
        console.log(startingPoint);

        // formatat inputu sa fie la fel ca un poi
        const formattedPOIs = POIs
            .filter((poi) => poi.name !== "Starting location")
            .map((poi) => {
                return {
                    name: poi.name,
                    rating: poi.rating,
                    geometry: {
                        location: {
                            lat: poi.latitude,
                            lng: poi.longitude,
                        }
                    }
                };
            });

        // incarcat /map
        navigate('/map', {
            state: {
                startingPoint: startingPoint,
                formattedPOIs: formattedPOIs,
            }
        });
    };

    useEffect(() => {
        const token = localStorage.getItem("token");

        if (!token) {
            setError("No authentication token found.");
            setLoading(false);
            return;
        }


        const fetchRoutes = async () => {
            try {
                // Assuming the token is stored in localStorage
                const token = localStorage.getItem('token');
                if (!token) {
                    throw new Error("No token found");
                }
    
                // Sending request to fetch routes
                const response = await axios.get(GET_ROUTES_URL, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
    
                // Update routeList with data from response
                console.log("SERVER RESPONSE");
                console.log(response);
                setRouteList(response.data); // Adjust the key `routes` based on the API response
            } catch (err) {
                console.error("Failed to fetch routes:", err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };


        // Function to fetch account info
        const fetchAccountInfo = async () => {
            try {
                // Make the request to the API
                const response = await fetch(GET_ACCOUNT_INFO_URL, {
                    method: "GET",
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json",
                    },
                });

                const data = await response.json();

                if (!response.ok) {
                    throw new Error(data.error);
                }

                // Parse the JSON data from the response
                setAccountInfo(data); // Store the account info in state
                setFormData({
                    first_name: data.first_name || "",
                    last_name: data.last_name || "",
                    username: data.username || "",
                    email: data.email || "",
                }); // Update the formData with fetched data
            } catch (error) {
                setError(error.message); // Set error message if something goes wrong
            } finally {
                setLoading(false); // Stop the loading state
            }
        };

        fetchAccountInfo();
        fetchRoutes();
    }, []); // Empty dependency array to only run once when the component mounts

    if (loading) {
        return <div>Loading...</div>;
    }

    if (error) {
        return <div>Error: {error}</div>;
    }

    const handleBack = () => {
        window.history.back();
    };

    const handleChange = (e) => {
        let { name, value } = e.target;
        name = e.target.id;
        setFormData({ ...formData, [name]: value });
    };

    const handleSumbit = (e) => {
        e.preventDefault();
        updateProfileInfo(formData);
        // window.location.reload();
    };

    const updateProfileInfo = async (data) => {
        const token = localStorage.getItem("token");
        console.log(token);

        if (!token) {
            setError("No authentication token found.");
            return;
        }
        console.log(data);

        try {
            console.log(data);
            const response = await fetch(UPDATE_ACCOUNT_INFO_URL, {
                method: "PUT",
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(data),
            });
            const updatedData = await response.json();

            if (!response.ok) {
                throw new Error(updatedData.error);
            }

            setAccountInfo(updatedData);
            alert("Account information updated successfully!");
        } catch (error) {
            console.log(error);
            setError(error.message);
        }
    };

    // Display the account information
    return (
        <div
            style={{
                position: "relative",
                minHeight: "100vh",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                fontFamily: "Arial, sans-serif",
                color: "#333",
                background:
                    "url('https://images.unsplash.com/photo-1461183479101-6c14cd5299c4?fm=jpg&q=60&w=3000&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NHx8cm91dGUlMjBtYXB8ZW58MHx8MHx8fDA%3D') no-repeat center center/cover",
            }}
        >
            {/* Back Button */}
            <button
                onClick={handleBack}
                style={{
                    position: "absolute",
                    top: "30px",
                    left: "40px",
                    backgroundColor: "#28a745" /* Green color */,
                    color: "#fff",
                    padding: "10px 20px",
                    border: "none",
                    borderRadius: "8px",
                    fontSize: "25px",
                    cursor: "pointer",
                    boxShadow: "0 2px 5px rgba(0, 0, 0, 0.2)",
                }}
            >
                Back
            </button>

            <div
                style={{
                    display: "flex",
                    gap: "40px", // Space between the two rectangles
                    width: "100%",
                    justifyContent: "center",
                    alignItems: "center"
                }}
            >
            
                {/* Account Information Box */}
                <div
                    style={{
                        width: "100%",
                        maxWidth: "400px",
                        maxHeight: "500px",
                        backgroundColor: "rgba(255, 255, 255, 0.8)",
                        borderRadius: "16px",
                        boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
                        padding: "20px",
                        textAlign: "center",
                        backdropFilter: "blur(2px)",
                    }}
                >
                    {/* Profile Icon */}
                    <div
                        style={{
                            width: "80px",
                            height: "80px",
                            borderRadius: "50%",
                            overflow: "hidden",
                            margin: "0 auto 10px",
                        }}
                    >
                        <img
                            src="https://cdn-icons-png.flaticon.com/512/7816/7816916.png"
                            alt="Profile Icon"
                            style={{
                                width: "100%",
                                height: "100%",
                                objectFit: "cover",
                            }}
                        />
                    </div>

                    {/* Title */}
                    <h2
                        style={{
                            fontSize: "22px",
                            marginBottom: "20px",
                        }}
                    >
                        Account Information
                    </h2>

                    {/* Form */}
                    <form
                        style={{
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center" /* Center align all form fields */,
                        }}
                    >
                        <div style={{ width: "100%" }}>
                            <label
                                style={{
                                    display: "block",
                                    fontWeight: "bold",
                                    marginBottom: "5px",
                                    textAlign: "left",
                                }}
                            >
                                First Name
                            </label>
                            <input
                                id="first_name"
                                type="text"
                                value={formData.first_name}
                                onChange={handleChange}
                                style={{
                                    width: "100%",
                                    padding: "10px",
                                    borderRadius: "8px",
                                    border: "1px solid #ddd",
                                    marginBottom: "15px",
                                    boxSizing:
                                        "border-box" /* Ensures consistent width */,
                                }}
                            />
                        </div>
                        <div style={{ width: "100%" }}>
                            <label
                                style={{
                                    display: "block",
                                    fontWeight: "bold",
                                    marginBottom: "5px",
                                    textAlign: "left",
                                }}
                            >
                                Last Name
                            </label>
                            <input
                                id="last_name"
                                type="text"
                                value={formData.last_name}
                                onChange={handleChange}
                                style={{
                                    width: "100%",
                                    padding: "10px",
                                    borderRadius: "8px",
                                    border: "1px solid #ddd",
                                    marginBottom: "15px",
                                    boxSizing: "border-box",
                                }}
                            />
                        </div>
                        <div style={{ width: "100%" }}>
                            <label
                                style={{
                                    display: "block",
                                    fontWeight: "bold",
                                    marginBottom: "5px",
                                    textAlign: "left",
                                }}
                            >
                                Username
                            </label>
                            <input
                                id="username"
                                type="text"
                                value={formData.username}
                                onChange={handleChange}
                                style={{
                                    width: "100%",
                                    padding: "10px",
                                    borderRadius: "8px",
                                    border: "1px solid #ddd",
                                    marginBottom: "15px",
                                    boxSizing: "border-box",
                                }}
                            />
                        </div>
                        <div style={{ width: "100%" }}>
                            <label
                                style={{
                                    display: "block",
                                    fontWeight: "bold",
                                    marginBottom: "5px",
                                    textAlign: "left",
                                }}
                            >
                                Email
                            </label>
                            <input
                                id="email"
                                type="email"
                                value={formData.email}
                                onChange={handleChange}
                                style={{
                                    width: "100%",
                                    padding: "10px",
                                    borderRadius: "8px",
                                    border: "1px solid #ddd",
                                    marginBottom: "20px",
                                    boxSizing: "border-box",
                                }}
                            />
                        </div>
                        <button
                            type="submit"
                            onClick={handleSumbit}
                            style={{
                                width: "100%",
                                padding: "12px",
                                backgroundColor: "#000",
                                color: "#fff",
                                fontSize: "16px",
                                border: "none",
                                borderRadius: "8px",
                                cursor: "pointer",
                                textAlign: "center",
                            }}
                        >
                            Update
                        </button>
                    </form>
                </div>

                {/* Routes List Box */}
                <div
                    style={{
                        width: "100%",
                        maxWidth: "400px",
                        maxHeight: "500px",
                        overflowY: "auto",
                        backgroundColor: "rgba(255, 255, 255, 0.8)",
                        borderRadius: "16px",
                        boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
                        padding: "20px",
                        textAlign: "center",
                        backdropFilter: "blur(2px)",
                    }}
                >
                    <h2
                        style={{
                            fontSize: "22px",
                            marginBottom: "20px",
                        }}
                    >
                        Routes History
                    </h2>
                    <div
                        style={{
                            display: "flex",
                            flexDirection: "column",
                            gap: "10px",
                        }}
                    >
                        {routeList && routeList.length > 0 ? (
                            routeList.map((route, index) => (
                                <div
                                    key={index}
                                    style={{
                                        padding: "10px",
                                        backgroundColor: "rgba(0, 0, 0, 0.05)",
                                        borderRadius: "8px",
                                        textAlign: "left",
                                    }}
                                    onClick={() => handleRouteSelection(route)}
                                >
                                    <strong>{route.city}</strong>
                                    <p>{route.timeSTAMP}</p>
                                </div>
                            ))
                        ) : (
                            <p>No routes available.</p>
                        )}
                    </div>           
                </div>
            </div>
        </div>
    );
};

export default AccountPage;
