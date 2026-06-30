const ciudadInput = document.getElementById('ciudad');
const btnClima = document.getElementById('btnClima');
const estado = document.getElementById('estado');
const resultado = document.getElementById('resultado');

const setEstado = message => {
    estado.textContent = message;
};
const mostrarResultado = ({ name, temperature, windspeed, weathercode }) => {
    resultado.innerHTML = `
        <p><strong>Ciudad:</strong> ${name}</p>
        <p><strong>Temperatura actual:</strong> ${temperature} °C</p>
        <p><strong>Velocidad del viento:</strong> ${windspeed} km/h</p>
        <p><strong>Código de clima:</strong> ${weathercode}</p>
    `;
};
const consultarClima = async () => {
    const ciudad = ciudadInput.value.trim();
    if (!ciudad) {
        setEstado('Ingrese el nombre de una ciudad.');
        resultado.innerHTML = '';
        return;
    }
    setEstado('Consultando...');
    resultado.innerHTML = '';
    try {
        const geoUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(ciudad)}&count=1`;
        const geoResponse = await fetch(geoUrl);
        if (!geoResponse.ok) {
            throw new Error(`Error en geocodificación: ${geoResponse.status} ${geoResponse.statusText}`);
        }
        const geoData = await geoResponse.json();
        if (!geoData.results || geoData.results.length === 0) {
            setEstado('Ciudad no encontrada');
            return;
        }
        const { latitude, longitude, name } = geoData.results[0];
        const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true`;
        const weatherResponse = await fetch(weatherUrl);
        if (!weatherResponse.ok) {
            throw new Error(`Error al obtener el clima: ${weatherResponse.status} ${weatherResponse.statusText}`);
        }
        const weatherData = await weatherResponse.json();
        if (!weatherData.current_weather) {
            throw new Error('No se encontró información del clima actual.');
        }
        mostrarResultado({
            name,
            temperature: weatherData.current_weather.temperature,
            windspeed: weatherData.current_weather.windspeed,
            weathercode: weatherData.current_weather.weathercode,
        });
        setEstado('');
    } catch (error) {
        setEstado(`Error: ${error.message}`);
    }
};
btnClima.addEventListener('click', consultarClima);
