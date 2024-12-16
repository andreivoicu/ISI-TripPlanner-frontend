import React from 'react';
import { Link } from 'react-router-dom';

const HomePage = () => {
    return (
        <div style={{ textAlign: 'center', marginTop: '50px' }}>
            <h1>Welcome to the Homepage</h1>
            <div>
                <button style={{ margin: '20px' }}>
                    <Link to="/account" style={{ textDecoration: 'none', color: 'white' }}>Go to Account Info</Link>
                </button>
                <button style={{ margin: '20px' }}>
                    <Link to="/map" style={{ textDecoration: 'none', color: 'white' }}>Go to Map</Link>
                </button>
            </div>
        </div>
    );
};

export default HomePage;
