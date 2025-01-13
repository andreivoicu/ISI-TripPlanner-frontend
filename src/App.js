import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './Components/LoginPage';
import MapPage from './Components/MapPage';
import HomePage from './Components/HomePage';
import AccountPage from './Components/AccountPage';
import SettingsPage from './Components/SettingsPage';

const App = () => {
    const [settings, setSettings] = useState({
        radius: 10000,
        sightTypes: ["museum", "tourist attraction", "historic sites", "art gallery"],
        entryNoForEachSightType: 2,
    });

    const handleSaveSettings = (newSettings) => {
        setSettings(newSettings);
        console.log("Updated Settings:", newSettings);
    };

    return (
        <Router>
            <Routes>
                <Route path="/" element={<Login />} />
                <Route path="/map" element={<MapPage settings={settings} />} />
                <Route path="/home" element={<HomePage />} />
                <Route path="/account" element={<AccountPage />} />
                <Route path="/settings" element={<SettingsPage settings={settings} onSaveSettings={handleSaveSettings} />} />
            </Routes>
        </Router>
    )
}

export default App;