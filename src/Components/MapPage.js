import React, { useEffect, useRef, useState } from 'react';
import Map from '@arcgis/core/Map';
import MapView from '@arcgis/core/views/MapView';
import Graphic from '@arcgis/core/Graphic';
import Point from '@arcgis/core/geometry/Point';
import SimpleMarkerSymbol from '@arcgis/core/symbols/SimpleMarkerSymbol';
import { suggestLocations, addressToLocations } from '@arcgis/core/rest/locator';
import Config from '@arcgis/core/config';
import '@arcgis/core/assets/esri/themes/light/main.css';

const MapPage = () => {
    const mapRef = useRef();
    const [location, setLocation] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [suggestions, setSuggestions] = useState([]);

    useEffect(() => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const { longitude, latitude } = position.coords;
                    setLocation({ longitude, latitude });
                },
                (error) => {
                    console.error("Error fetching location:", error);
                }
            );
        } else {
            console.warn("Geolocation is not supported by this browser.");
        }
    }, []); // Only run once when the component is mounted

    useEffect(() => {
        if (!location) return; // Don't initialize map if location is not available yet.

        // Initialize the Map and View
        const map = new Map({
            basemap: 'streets'
        });

        const view = new MapView({
            container: mapRef.current, // Attach map to DOM element
            map: map,
            center: [location.longitude, location.latitude], // Center map at user's location
            zoom: 13
        });

        // Function to add the current location as a point
        const addPointOnGraphic = (longitude, latitude, color) => {
            const point = new Point({
                longitude: longitude,
                latitude: latitude
            });

            const symbol = new SimpleMarkerSymbol({
                color: color,
                size: 12,
                outline: {
                    color: 'white',
                    width: 2
                }
            });

            const pointGraphic = new Graphic({
                geometry: point,
                symbol: symbol
            });

            view.graphics.add(pointGraphic); // Add point graphic to the map
        };

        // Once the map is ready, add the point on the user's location
        view.when(() => {
            addPointOnGraphic(location.longitude, location.latitude, 'green');
            view.center = [location.longitude, location.latitude]; // Ensure map is centered at the location
        });

        return () => {
            view.destroy();
        };
    }, [location]);

    const handleSearchChange = (e) => {
        const value = e.target.value;
        setSearchTerm(value);

        if (value) {

            const locatorSuggestLocationsParams = {
                text: value,
                location: location ? new Point({ longitude: location.longitude, latitude: location.latitude }) : undefined  // Optionally include current location
            };
            suggestLocations(
                'https://geocode.arcgis.com/arcgis/rest/services/World/GeocodeServer',
                locatorSuggestLocationsParams
            ).then((response) => {
                setSuggestions(response);
            }).catch((error) => {
                console.error("Error fetching geocode suggestions:", error);
                setSuggestions([]);
            });
        } else {
            setSuggestions([]);
        }
    };

    const handleSuggestionSelect = (suggestion) => {
        console.log(suggestion);

        // Use magicKey to fetch detailed location information
        const magicKey = suggestion.magicKey;

        if (magicKey) {
            const locatorAddressParams = {
                magicKey: magicKey  // Use magicKey for address lookup
            };

            addressToLocations(
                'https://geocode.arcgis.com/arcgis/rest/services/World/GeocodeServer',
                locatorAddressParams
            ).then((response) => {
                console.log("response from addressToLocations:");
                console.log(response);

                if (response && response.length > 0) {
                    const { location } = response[0];  // Destructure coordinates
                    setLocation({
                        longitude: location.x,
                        latitude: location.y
                    });
                } else {
                    console.warn("No detailed location found for the selected suggestion.");
                }
            }).catch((error) => {
                console.error("Error fetching location details:", error);
            });
        }

        setSuggestions([]);  // Clear suggestions after selection
    };

    const handleBack = () => {
        window.history.back();
    };

    return (
        <div style={{ position: 'relative', height: '100vh', width: '100vw' }}>
            <button 
                onClick={handleBack}
                style={{
                    position: 'absolute', // Position the button relative to the parent div
                    bottom: '1%', // Adjust as needed
                    left: '1%', // Adjust as needed
                    zIndex: 10, // Ensure it appears above other content like the map
                    padding: '10px 20px',
                    backgroundColor: '#007BFF',
                    color: 'white',
                    border: 'none',
                    borderRadius: '5px',
                    cursor: 'pointer'
                }}
            >
                Back
            </button>
            
            {/* Search bar */}
            <input
                type="text"
                value={searchTerm}
                onChange={handleSearchChange}
                placeholder="Search for a city..."
                style={{
                    position: 'absolute',
                    top: '1%',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    padding: '8px',
                    fontSize: '16px',
                    zIndex: 10,
                    width: '300px'
                }}
            />

            {/* Suggestions dropdown */}
            {suggestions.length > 0 && (
                <ul style={{
                    position: 'absolute',
                    top: '50px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    backgroundColor: 'white',
                    boxShadow: '0px 4px 6px rgba(0,0,0,0.1)',
                    width: '300px',
                    padding: '0',
                    margin: '0',
                    listStyleType: 'none',
                    maxHeight: '200px',
                    overflowY: 'auto',
                    zIndex: 10
                }}>
                    {suggestions.map((suggestion, index) => (
                        <li
                            key={index}
                            onClick={() => handleSuggestionSelect(suggestion)}
                            style={{
                                padding: '8px',
                                cursor: 'pointer',
                                borderBottom: '1px solid #ddd'
                            }}
                        >
                            {suggestion.text}
                        </li>
                    ))}
                </ul>
            )}
            <div
                style={{ height: '100vh', width: '100vw' }}
                ref={mapRef} // Attach reference to this div
            ></div>
        </div>
    );
};

export default MapPage;
