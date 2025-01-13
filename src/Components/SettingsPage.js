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

    const handleSave = () => {
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
        <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
            <h1>Settings</h1>
            <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '10px' }}>
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
                        padding: '8px',
                        fontSize: '16px',
                        width: '100%',
                        boxSizing: 'border-box',
                    }}
                />
            </div>
            <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '10px' }}>
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
                        padding: '8px',
                        fontSize: '16px',
                        width: '100%',
                        boxSizing: 'border-box',
                    }}
                />
            </div>
            <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '10px' }}>
                    Types of Sights to Search For:
                </label>
                <select
                    multiple
                    value={sightTypes}
                    onChange={handleSightTypeChange}
                    style={{
                        padding: '8px',
                        fontSize: '16px',
                        width: '100%',
                        boxSizing: 'border-box',
                        height: '150px',
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
                    padding: '10px 20px',
                    fontSize: '16px',
                    color: 'white',
                    backgroundColor: '#007BFF',
                    border: 'none',
                    borderRadius: '5px',
                    cursor: 'pointer',
                }}
            >
                Save Settings
            </button>
            <button
                onClick={() => navigate('/home')} // Navigate to homepage on Back button click
                style={{
                    padding: '10px 20px',
                    fontSize: '16px',
                    color: 'white',
                    backgroundColor: '#6c757d',
                    border: 'none',
                    borderRadius: '5px',
                    cursor: 'pointer',
                }}
            >
                Back
            </button>
        </div>
    );
};

export default SettingsPage;
