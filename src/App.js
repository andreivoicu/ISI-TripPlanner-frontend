import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './Components/LoginPage';
import MapPage from './Components/MapPage';
import HomePage from './Components/HomePage';
import AccountPage from './Components/AccountPage';

const App = () => {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<Login />} />
                <Route path="/map" element={<MapPage />} />
                <Route path="/home" element={<HomePage />} />
                <Route path="/account" element={<AccountPage />} />
            </Routes>
        </Router>
    )
}

export default App;