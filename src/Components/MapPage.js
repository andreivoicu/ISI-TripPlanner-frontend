import React, { useEffect, useRef, useState, useImperativeHandle, forwardRef } from 'react';
import { useLocation } from 'react-router-dom';
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

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const ARCGIS_API_KEY = process.env.REACT_APP_ARCGIS_API_KEY
const API_URL = process.env.REACT_APP_API_URL;
const PLACES_GOOGLE_API_URL = `${API_URL}/places/google`;
const ADD_ROUTE_URL = `${API_URL}/routes`;

const MapPage = ({ settings }) => {
    const { state } = useLocation();

    const radius = settings.radius
    const sightsList = settings.sightTypes;
    const entryNo = settings.entryNoForEachSightType;


    const mapRef = useRef();
    const viewRef = useRef();
    const [location, setLocation] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [suggestions, setSuggestions] = useState([]);
    const [view, setView] = useState(null);
    const [sights, setSights] = useState([]);
    const [directions, setDirections] = useState([]);
    const [isEditingArea, setIsEditingArea] = useState(false);
    const [hasToken, setHasToken] = useState(false);
    const [isRouteAddedMessageVisible, setIsRouteAddedMessageVisible] = useState(false);
    const [currentCityName, setCurrentCityName] = useState("");
    const [isRouteAddSuccessful, setIsRouteAddSuccessful] = useState(false);

    const [isAddRouteButtonClicked, setIsAddRouteButtonClicked] = useState(false);

    // get device's location and check for token
    useEffect(() => {
        const token = localStorage.getItem('token');
        // set to true if the token is set
        setHasToken(!!token);

        if (navigator.geolocation && !state) {
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
    }, [state]);

    useEffect(() => {
        if (!state && !location) {
            return;
        }

        const map = new Map({
            basemap: 'streets'
        });

        let latitude = null, longitude = null;
        let formattedPOIs = null;
             
        if (state) {
            const startingPoint = state.startingPoint;
            formattedPOIs = state.formattedPOIs;
            
            longitude = startingPoint.longitude;
            latitude = startingPoint.latitude; 
        }
        
        if (location) {
            longitude = location.longitude;
            latitude = location.latitude;
        }

        const view = new MapView({
            container: mapRef.current,
            map: map,
            center: [longitude, latitude],
            zoom: 13
        });

        viewRef.current = view;
        // view.on('click', handleMapClick);

        view.when(() => {
            addPointOnGraphic(longitude, latitude, 'red');
            view.center = [longitude, latitude];

            if (formattedPOIs) {
                try {
                    calculateAndPrintRoute(
                        formattedPOIs,
                        longitude,
                        latitude,
                    );
                } catch (error) {
                    console.error('Error calculating LOADED route:', error);
                }
            }
        });

        // setLocation({ longitude, latitude });

        return () => {
            view.destroy();
        };
    }, [state, location]);

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
            popupTemplate: { title: label }
        });

        viewRef.current.graphics.add(pointGraphic);
    };

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

    // clear the current map
    const clearGraphics = () => {
        if (viewRef.current) {
            viewRef.current.graphics.removeAll();
        }
        setDirections([]);
        setSights([]);
    };

    const calculateAndPrintRoute = async (POIs, startLongitude, startLatitude) => {
        const POIsAndStartingLocation = [
            ...POIs,
            {
                name: "Starting location",
                rating: 5,
                geometry: {
                    location: {
                        lat: startLatitude,
                        lng: startLongitude,
                    }
                }
            }
        ];
        setSights(POIsAndStartingLocation);

        // add the points to the map
        POIs.forEach(poi => {
            const label = `${poi.name}\nRating: ${poi.rating}`

            
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

        // adding the starting point (current location) at the beggining
        stops.unshift(new Point({
            latitude: startLatitude,
            longitude: startLongitude
        }));

        const routeServiceURL = "https://route-api.arcgis.com/arcgis/rest/services/World/Route/NAServer/Route_World/solve";
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

                if (response.data.directions && response.data.directions[0].features) {
                    const directions = response.data.directions[0].features;
                    
                    const directionsAsText = directions.map((direction, index) => ({
                        index: index,
                        text: direction.attributes.text
                    }));

                    setDirections(directionsAsText);
                } else {
                    console.error("No directions found in the response.");
                }
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

        console.log("RADIUS: ");
        console.log(radius);

        console.log("SIGHTS LIST: ");
        console.log(sightsList);
        for (const sightType of sightsList) {
            const params = {
                location: `${latitude},${longitude}`,
                radius: radius,
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

                console.log("MAX ENTRY NO. FOR EACH CATEGORY");
                console.log(entryNo);
                const bestResults = uniqueResults.slice(0, entryNo);
                currentLocationSightList.push(...bestResults);

            } catch (error) {
                console.error('Error:', error);
            }
        }

        clearGraphics();
        setSights(currentLocationSightList);
        calculateAndPrintRoute(currentLocationSightList, longitude, latitude);
    };

    // handle clicks on the map
    useEffect(() => {
        if (!isEditingArea) return;

        const handleMapClick = async (event) => {
            event.stopPropagation();
            
            try {
                const { longitude, latitude } = event.mapPoint;

                addPointOnGraphic(longitude, latitude, 'red');
                setIsEditingArea(false);
                await fetchPOIs(longitude, latitude);
            } catch (error) {
                console.error(`useEffect isEditingArea error: ${error}`);
            }
        };

        const mapView = viewRef.current;
        const clickHandler = mapView.on('click', handleMapClick);

        return () => {
            clickHandler.remove();
        }

    }, [isEditingArea, fetchPOIs]);

    // suggestion handler
    const handleSuggestionSelect = (suggestion) => {
        setCurrentCityName(suggestion.text.split(',')[0]);

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

    // saving route
    useEffect(() => {
        const saveRoute = async () => {
            if (!isAddRouteButtonClicked || sights.length === 0) {
                return;
            }

            const token = localStorage.getItem('token');
            if (!token) {
                console.error('No token found in localStorage.');
                return;
            }

            const sightListForExport = sights.map(sight => {
                return {
                    name: sight.name,
                    rating: sight.rating,
                    longitude: sight.geometry.location.lng,
                    latitude: sight.geometry.location.lat,
                }
            });

            const sightListAndCityNameForExport = {
                city: currentCityName,
                sites: sightListForExport
            };

            try {
                const response = await axios.post(ADD_ROUTE_URL, {
                    ...sightListAndCityNameForExport
                }, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                });

                if (response.status == 201) {
                    setIsRouteAddSuccessful(true);
                }

            } catch (error) {
                console.error(`Error from sending post request to save route: ${error}`);
            }

            setIsRouteAddedMessageVisible(true);
            setTimeout(() => {
                setIsRouteAddedMessageVisible(false);
                setIsRouteAddSuccessful(false);
                setIsAddRouteButtonClicked(false);
            }, 1500);
        }

        saveRoute();
    }, [sights, isAddRouteButtonClicked]);

    const handleSaveRoute = () => {
        setIsAddRouteButtonClicked(true);        
    };

    const handleBack = () => {
        window.history.back();
    };

    return (
        <div style={{ position: 'relative', height: '100vh', width: '100vw' }}>

            {/* route successfully added message */}
            {isRouteAddedMessageVisible && (
                <div style={{
                    position: 'fixed',
                    bottom: '20px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    backgroundColor: isRouteAddSuccessful ? '#4CAF50' : '#F44336',
                    color: 'white',
                    padding: '10px 20px',
                    borderRadius: '5px',
                    boxShadow: '0 0 10px rgba(0, 0, 0, 0.2)',
                    zIndex: 1000
                }}>
                    {isRouteAddSuccessful ? 'Route has been saved!' : 'Failed to save the route!'}
                </div>
            )}

            {/* save the route button */}
            {hasToken && directions.length > 0 && (
                <button
                    onClick={handleSaveRoute}
                    style={{
                        position: 'absolute',
                        top: '10%',
                        right: '10%',
                        zIndex: 10,
                        padding: '10px 20px',
                        backgroundColor: '#4CAF50',
                        color: 'white',
                        border: 'none',
                        borderRadius: '5px',
                        cursor: 'pointer',
                    }}
                >
                    Save route
                </button>
            )}

            {/* change the area button */}
            {directions.length > 0 && (
                <button
                    onClick={() => {
                        setIsEditingArea(true);
                        clearGraphics(); // Clear graphics when entering edit mode
                    }}
                    style={{
                        position: 'absolute',
                        bottom: '1%',
                        left: '50%',
                        transform: 'translateX(-50%)',
                        padding: '10px 20px',
                        backgroundColor: '#28a745',
                        color: 'white',
                        border: 'none',
                        borderRadius: '5px',
                        cursor: 'pointer',
                        zIndex: 10
                    }}
                >
                    Change the Area
                </button>
            )}            

            {/* back button */}
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
            {directions.length > 0 && (
                <div style={{
                    position: 'absolute',
                    top: '15%',
                    right: '1%',
                    width: '300px',
                    maxHeight: '80vh',
                    overflowY: 'scroll',
                    border: '1px solid #ccc',
                    backgroundColor: '#f9f9f9',
                    boxShadow: '0 0 10px rgba(0, 0, 0, 0.1)',
                    zIndex: 10
                }}>
                    <h3>Directions:</h3>
                    <ul>
                        {directions.map((direction) => (
                            <li key={direction.index}>
                                <strong>Step {direction.index + 1}:</strong> {direction.text}
                            </li>
                        ))}
                    </ul>
                </div>
            )}
            <div
                style={{ height: '100vh', width: '100vw' }}
                ref={mapRef} // Attach reference to this div
            ></div>
        </div>
    );
};

export default MapPage;
