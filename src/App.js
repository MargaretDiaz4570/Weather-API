import {useRef, useEffect, useState } from "react";
import "./App.css";
import logo from "./mlh-prep.png";
import AutoComp from "./components/AutoComp";
import usePlacesAutocomplete from "use-places-autocomplete";
import { useLoadScript } from "@react-google-maps/api";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

function App() {
  const mapContainerRef = useRef(null);
  const [map, setMap] = useState(null);

  const [error, setError] = useState(null);
  const [isVarLoaded, setIsVarLoaded] = useState(false);
  const [city, setCity] = useState("New York City");
  const [results, setResults] = useState(null);
  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: process.env.REACT_APP_GOOGLE_API_KEY,
    libraries: ["places"],
  });



  const myIcon = L.icon({
    iconUrl: './components/icon.png',
    iconSize: [50, 50],
    iconAnchor: [25, 50],
    popupAnchor: [0, -50]
  });
  
  // const marker = L.marker([51.5, -0.09], { icon: myIcon }).addTo(map);
  // marker.bindPopup("<b>Hello world!</b><br>I am a custom marker.");


  useEffect(() => {
    fetch(
      "https://api.openweathermap.org/data/2.5/weather?q=" +
        city +
        "&units=metric" +
        "&appid=" +
        process.env.REACT_APP_APIKEY
    )
      .then((res) => res.json())
      .then(
        (result) => {
          if (result["cod"] !== 200) {
            setIsVarLoaded(false);
          } else {
            setIsVarLoaded(true);
            setResults(result);
          }
        },
        (error) => {
          setIsVarLoaded(true);
          setError(error);
        }
      );
  }, [city]);

  
  useEffect(() => {
    if (!isLoaded || !mapContainerRef.current) {
      return;
    }

    const map = L.map(mapContainerRef.current).setView([51.505, -0.09], 13);

    L.tileLayer(
      "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
      {
        attribution:
          'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, ' +
          '<a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, ' +
          'Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
        maxZoom: 18,
        tileSize: 512,
        zoomOffset: -1,
      }
    ).addTo(map);

    // Add the click event listener to the map
    map.on("click", (e) => {
    const { lat, lng } = e.latlng;
    console.log(lat, lng);
    // Use the lat and lng values to fetch weather data for the clicked location
    // Add a marker to the clicked location
    const marker = L.marker([lat, lng]).addTo(map);
    });

    setMap(map);
  }, [isLoaded]);

  const cityHandler = (city) => {
    console.log("City set to:", city);
    setCity(city);
  };

  if (error) {
    return <div>Error: {error.message}</div>;
  } else {
    return (
      <>
        <img className="logo" src={logo} alt="MLH Prep Logo"></img>
        <div>
          <h2>Enter a city below 👇</h2>
          {isLoaded && <AutoComp cityHandler={cityHandler}></AutoComp>}
          {loadError && <div>Failed to load map</div>}
          {!loadError && !isLoaded && <div>Loading map...</div>}
          {!loadError && isLoaded && (
            <div
              ref={mapContainerRef}
              style={{ height: "500px", width: "100%" }}
              >
          </div>
          )}
          <div className="Results">
            {!isVarLoaded && <h2>Loading...</h2>}
            {console.log(results)}
            {console.log(isLoaded)}
            {isVarLoaded && results && (
              <>
                <h3>{results.weather[0].main}</h3>
                <p>Feels like {results.main.feels_like}°C</p>
                <i>
                  <p>
                    {results.name}, {results.sys.country}
                  </p>
                </i>
              </>
            )}
          </div>
        </div>
      </>
    );
  }
}

export default App;
