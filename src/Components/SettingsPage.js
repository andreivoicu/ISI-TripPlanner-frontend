import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const SettingsPage = ({ settings, onSaveSettings }) => {
    const [radius, setRadius] = useState(settings.radius); // Default radius: 10 km
    const [sightTypes, setSightTypes] = useState(settings.sightTypes);
    const [entryNoForEachSightType, setEntryNoForEachSightType] = useState(settings.entryNoForEachSightType);
    const navigate = useNavigate();

    const availableSightTypes = [
        "museum",
        "tourist attraction",
        "historic sites",
        "art gallery",
        "park",
        "zoo",
        "restaurant",
        "shopping mall"
    ];

    const handleSave = (e) => {
        e.preventDefault();
        const updatedSettings  = { radius, sightTypes, entryNoForEachSightType };
        onSaveSettings(updatedSettings); // Pass settings to the parent
        alert("Settings saved!");
    };

    const handleSightTypeChange = (e) => {
        const options = Array.from(e.target.options);
        const selected = options.filter(option => option.selected).map(option => option.value);
        console.log(`selected: ${selected}`);
        setSightTypes(selected);
    };

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
            onClick={() => navigate('/home')}
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
                    width: "90%",
                    maxWidth: "400px",
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
                    Settings
                </h2>

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
                                display: 'block',
                                fontWeight: "bold",
                                marginBottom: '5px',
                                textAlign: "left" }}
                        >
                            Maximum Search Radius (meters):
                        </label>
                        <input
                            type="number"
                            value={radius === null ? '' : radius}
                            onChange={(e) => {
                                const value = e.target.value;
                                setRadius(value === '' ? null : Number(value));
                            }}
                            style={{
                                padding: '10px',
                                width: '100%',
                                borderRadius: "8px",
                                border: "1px solid #ddd",
                                marginBottom: "15px",
                                boxSizing: "border-box"
                            }}
                        />
                    </div>
                    <div style={{ width: "100%" }}>
                        <label 
                            style={{ 
                                display: 'block',
                                fontWeight: "bold",
                                marginBottom: '5px',
                                textAlign: "left" }}
                        >
                            Number of entries for each type of sight:
                        </label>
                        <input
                            type="number"
                            value={entryNoForEachSightType === null ? '' : entryNoForEachSightType}
                            onChange={(e) => {
                                const value = e.target.value;
                                setEntryNoForEachSightType(value === '' ? null : Number(value));
                            }}
                            style={{
                                padding: '10px',
                                width: '100%',
                                borderRadius: "8px",
                                border: "1px solid #ddd",
                                marginBottom: "15px",
                                boxSizing: "border-box"
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
                            Types of Sights to Search For:
                        </label>
                        <select
                            multiple
                            value={sightTypes}
                            onChange={handleSightTypeChange}
                            style={{
                                width: "100%",
                                padding: "10px",
                                borderRadius: "8px",
                                border: "1px solid #ddd",
                                marginBottom: "15px",
                                boxSizing:
                                    "border-box" /* Ensures consistent width */,
                            }}
                        >
                            {availableSightTypes.map((type, index) => (
                                <option key={index} value={type}>
                                    {type}
                                </option>
                            ))}
                        </select>
                    </div>
                    <button
                        onClick={handleSave}
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
                        Save Settings
                    </button>
                </form>
            </div>
        </div>
    );
};

export default SettingsPage;
