import React, { useEffect, useState } from "react";

const AccountPage = () => {
    // State to store account data
    const [accountInfo, setAccountInfo] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const API_URL = process.env.REACT_APP_API_URL;
    const GET_ACCOUNT_INFO_URL = `${API_URL}/user`;

    useEffect(() => {
        const token = localStorage.getItem("token");

        if (!token) {
            setError("No authentication token found.");
            setLoading(false);
            return;
        }

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

                if (!response.ok) {
                    throw new Error("Failed to fetch account info");
                }

                // Parse the JSON data from the response
                const data = await response.json();
                setAccountInfo(data); // Store the account info in state
            } catch (error) {
                setError(error.message); // Set error message if something goes wrong
            } finally {
                setLoading(false); // Stop the loading state
            }
        };

        fetchAccountInfo();
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

    // Display the account information
    return (
        <div style={{ textAlign: "center", marginTop: "50px" }}>
            <button onClick={handleBack} style={{ marginBottom: "20px" }}>
                Back
            </button>
            <h1>Account Information</h1>
            {accountInfo ? (
                <div>
                    <p>
                        <strong>First Name:</strong> {accountInfo.first_name}
                    </p>
                    <p>
                        <strong>Last Name:</strong> {accountInfo.last_name}
                    </p>
                    <p>
                        <strong>Email:</strong> {accountInfo.email}
                    </p>
                    <p>
                        <strong>Username:</strong> {accountInfo.username}
                    </p>
                </div>
            ) : (
                <p>No account information available.</p>
            )}
        </div>
    );
};

export default AccountPage;
