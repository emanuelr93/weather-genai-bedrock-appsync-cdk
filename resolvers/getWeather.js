import {util} from "@aws-appsync/utils";

export function request(ctx) {
    const { lat, long } = ctx.stash;
    return {
        method: "GET",
        resourcePath: `/v1/forecast?latitude=${lat}&longitude=${long}&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum,rain_sum,showers_sum,snowfall_sum&timezone=Europe%2FBerlin&forecast_days=1`,
    };
}

export function response(ctx) {
    const { result } = ctx;

    const WeatherCondition = {
        0: "CLEAR_SKY",
        1: "MAINLY_CLEAR",
        2: "PARTLY_CLOUDY",
        3: "OVERCAST",
        45: "FOG",
        48: "RIME_FOG",
        51: "DRIZZLE_LIGHT",
        53: "DRIZZLE_MODERATE",
        55: "DRIZZLE_DENSE",
        56: "FREEZING_DRIZZLE_LIGHT",
        57: "FREEZING_DRIZZLE_DENSE",
        61: "RAIN_SLIGHT",
        63: "RAIN_MODERATE",
        65: "RAIN_HEAVY",
        66: "FREEZING_RAIN_LIGHT",
        67: "FREEZING_RAIN_HEAVY",
        71: "SNOWFALL_SLIGHT",
        73: "SNOWFALL_MODERATE",
        75: "SNOWFALL_HEAVY",
        77: "SNOW_GRAINS",
        80: "RAIN_SHOWERS_SLIGHT",
        81: "RAIN_SHOWERS_MODERATE",
        82: "RAIN_SHOWERS_VIOLENT",
        85: "SNOW_SHOWERS_SLIGHT",
        86: "SNOW_SHOWERS_HEAVY",
        95: "THUNDERSTORM_SLIGHT",
        96: "THUNDERSTORM_SLIGHT_HAIL",
        99: "THUNDERSTORM_HEAVY_HAIL",
    };

    if (result.statusCode !== 200) {
        return util.appendError(result.body, `${result.statusCode}`);
    }
    const objectResult = JSON.parse(result.body);
    objectResult.daily.weather_description = objectResult.daily.weather_code.map(code => WeatherCondition[code] ? WeatherCondition[code] : "NOT_DEFINED");
    return objectResult;
}