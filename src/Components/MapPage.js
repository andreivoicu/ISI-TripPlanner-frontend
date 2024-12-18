import React, { useEffect, useRef, useState } from 'react';
import Map from '@arcgis/core/Map';
import MapView from '@arcgis/core/views/MapView';
import Graphic from '@arcgis/core/Graphic';
import Polyline from '@arcgis/core/geometry/Polyline';
import Point from '@arcgis/core/geometry/Point';
import SimpleMarkerSymbol from '@arcgis/core/symbols/SimpleMarkerSymbol';
import RouteLayer from '@arcgis/core/layers/RouteLayer';
import Directions from '@arcgis/core/widgets/Directions';
import { suggestLocations, addressToLocations } from '@arcgis/core/rest/locator';
import Config from '@arcgis/core/config';
import '@arcgis/core/assets/esri/themes/light/main.css';
import axios from 'axios';

const GOOGLE_API_KEY = process.env.REACT_APP_GOOGLE_PLACES_API_KEY;
const ARCGIS_API_KEY = process.env.REACT_APP_ARCGIS_API_KEY
const API_URL = process.env.REACT_APP_API_URL;
const PLACES_GOOGLE_API_URL = `${API_URL}/places/google`;

const ENTRIES_FOR_EACH_SIGHT_TYPE = 2;
const sightsList = [
    "museum",
    "tourist attraction",
    "historic sites",
    "art gallery"
]

const MapPage = () => {
    const mapRef = useRef();
    const viewRef = useRef();
    const [location, setLocation] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [suggestions, setSuggestions] = useState([]);
    const [view, setView] = useState(null);
    const [sights, setSights] = useState([]);

    // get device's location
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
    }, []);

    // Function to add a point on the current map
    const addPointOnGraphic = (longitude, latitude, color, label) => {
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
            symbol: symbol,
            attributes: { label },
            popupTemplate: label ? { title: label } : undefined
        });

        viewRef.current.graphics.add(pointGraphic);
    };

    // create the map
    useEffect(() => {
        if (!location) 
            return;

        const map = new Map({
            basemap: 'streets'
        });

        const view = new MapView({
            container: mapRef.current,
            map: map,
            center: [location.longitude, location.latitude],
            zoom: 13
        });
        viewRef.current = view;

        return () => {
            view.destroy();
        };
    }, [location]);

    // search bar handler
    const handleSearchChange = (e) => {
        const value = e.target.value;
        setSearchTerm(value);

        if (value) {

            const locatorSuggestLocationsParams = {
                text: value,
                location: location ? new Point({ longitude: location.longitude, latitude: location.latitude }) : undefined
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

    const calculateAndPrintRoute = async (POIs) => {

        // add the points to the map
        console.log("debug POI points");
        POIs.forEach(poi => {
            const label = `${poi.name}\nRating: ${poi.rating}`
            console.log(`label: ${label}`);
            
            addPointOnGraphic(
                poi.geometry.location.lng,
                poi.geometry.location.lat,
                'green',
                label
            );
        });

        const stops = POIs.map(poi => new Point({
            latitude: poi.geometry.location.lat,
            longitude: poi.geometry.location.lng
        }));

        const routeServiceURL = " https://route-api.arcgis.com/arcgis/rest/services/World/Route/NAServer/Route_World/solve";
        const params = {
            f: "json",
            stops: stops.map(stop => `${stop.longitude},${stop.latitude}`).join(';'),
            returnDirections: true,
            returnRouteGraphics: true,
            outSR: 4326,
            token: ARCGIS_API_KEY
        };

        try {
            const response = await axios.get(routeServiceURL, { params });

            if (response.data.routes) {
                const routeGeometry = response.data.routes.features[0].geometry;

                const polyline = new Polyline({
                    paths: routeGeometry.paths,
                    spatialReference: { wkid: 4326 }
                })

                const routeGraphic = new Graphic({
                    geometry: polyline,
                    symbol: {
                        type: 'simple-line',
                        color: [80, 130, 220],
                        width: 4
                    }
                });

                viewRef.current.graphics.add(routeGraphic);
            } else {
                console.error('Route calculation failed');
            }
        } catch (error) {
            console.error("Error fetching route:", error);
        }
    };

    const fetchPOIs = async (longitude, latitude) => {
        const url = PLACES_GOOGLE_API_URL;

        const currentLocationSightList = [];
        for (const sightType of sightsList) {
            const params = {
                location: `${latitude},${longitude}`,
                radius: 10000, // 10 km radius
                keyword: sightType,
            };
            try {
                const response = await axios.get(url, { params });
                const results = response.data.results;
    
                const uniqueResults = results.reduce((acc, current) => {
                    if (!acc.some(item => item.name === current.name) && !currentLocationSightList.includes(current.name)) {
                        acc.push(current);
                    }
                    return acc;
                }, []);
                
                // sorting the results so that the best ratings are first
                uniqueResults.sort((a, b) => b.rating - a.rating);
                console.log(uniqueResults);

                const bestResults = uniqueResults.slice(0, ENTRIES_FOR_EACH_SIGHT_TYPE);
                currentLocationSightList.push(...bestResults);

            } catch (error) {
                console.error('Error:', error);
            }
        }
        
        console.log(currentLocationSightList);

        calculateAndPrintRoute(currentLocationSightList);
    };

    // suggestion handler
    const handleSuggestionSelect = (suggestion) => {

        // Use magicKey to fetch detailed location information
        const magicKey = suggestion.magicKey;

        if (magicKey) {
            const locatorAddressParams = {
                magicKey: magicKey
            };

            addressToLocations(
                'https://geocode.arcgis.com/arcgis/rest/services/World/GeocodeServer',
                locatorAddressParams
            ).then((response) => {
                if (response && response.length > 0) {
                    const { location } = response[0];
                    setLocation({
                        longitude: location.x,
                        latitude: location.y
                    });

                    fetchPOIs(location.x, location.y);
                } else {
                    console.warn("No detailed location found for the selected suggestion.");
                }
            }).catch((error) => {
                console.error("Error fetching location details:", error);
            });
        }

        setSuggestions([]);
    };

    const handleBack = () => {
        window.history.back();
    };

    return (
        <div style={{ position: 'relative', height: '100vh', width: '100vw' }}>
            <button 
                onClick={handleBack}
                style={{
                    position: 'absolute',
                    bottom: '1%',
                    left: '1%',
                    zIndex: 10,
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
