"use client";

import { useEffect, useState } from "react";
import { GlassCard } from "./GlassCard";

interface ResortWeatherProps {
  lat: number;
  lng: number;
  topM?: number;
  labels: {
    title: string;
    loading: string;
    error: string;
    temperature: string;
    apparentTemp: string;
    snowfall: string;
    windSpeed: string;
    updatedAt: string;
    topElevationText?: string;
    conditions?: {
      clearSky: string;
      partlyCloudy: string;
      overcast: string;
      fog: string;
      drizzle: string;
      rain: string;
      snow: string;
      powderSnow: string;
      showers: string;
      snowShowers: string;
      thunderstorm: string;
      mountainWeather: string;
    };
  };
}

interface WeatherData {
  temp: number;
  apparentTemp: number;
  snowfall: number;
  weatherCode: number;
  windSpeed: number;
  time: string;
}

function getWeatherText(code: number, conditions?: ResortWeatherProps["labels"]["conditions"]) {
  if (!conditions) return "Weather";
  switch (code) {
    case 0:
      return conditions.clearSky;
    case 1:
    case 2:
      return conditions.partlyCloudy;
    case 3:
      return conditions.overcast;
    case 45:
    case 48:
      return conditions.fog;
    case 51:
    case 53:
    case 55:
      return conditions.drizzle;
    case 61:
    case 63:
    case 65:
      return conditions.rain;
    case 71:
    case 73:
    case 75:
      return conditions.snow;
    case 77:
      return conditions.powderSnow;
    case 80:
    case 81:
    case 82:
      return conditions.showers;
    case 85:
    case 86:
      return conditions.snowShowers;
    case 95:
    case 96:
    case 99:
      return conditions.thunderstorm;
    default:
      return conditions.mountainWeather;
  }
}

export function ResortWeatherCard({ lat, lng, topM, labels }: ResortWeatherProps) {
  const [data, setData] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<boolean>(false);

  useEffect(() => {
    let isMounted = true;
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&current=temperature_2m,apparent_temperature,snowfall,weather_code,wind_speed_10m&timezone=Asia%2FTokyo`;

    fetch(url)
      .then((res) => {
        if (!res.ok) throw new Error("Network error");
        return res.json();
      })
      .then((json) => {
        if (isMounted && json.current) {
          setData({
            temp: Math.round(json.current.temperature_2m * 10) / 10,
            apparentTemp: Math.round(json.current.apparent_temperature * 10) / 10,
            snowfall: json.current.snowfall || 0,
            weatherCode: json.current.weather_code ?? 0,
            windSpeed: Math.round(json.current.wind_speed_10m * 10) / 10,
            time: json.current.time ? json.current.time.replace("T", " ") : "",
          });
          setLoading(false);
        }
      })
      .catch(() => {
        if (isMounted) {
          setError(true);
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [lat, lng]);

  const weatherText = data ? getWeatherText(data.weatherCode, labels.conditions) : null;

  return (
    <GlassCard className="p-6 h-full flex flex-col justify-between" frost={false}>
      <div className="flex items-center justify-between">
        <h3 className="font-bold text-[15px] flex items-center gap-2">
          <span className="px-2.5 py-0.5 rounded-full bg-accent-ice/10 text-accent-ice text-[10px] font-mono tracking-widest font-bold">
            LIVE
          </span>
          <span>{labels.title}</span>
        </h3>
        {labels.topElevationText ? (
          <span className="text-[11px] text-ink-faint font-data">{labels.topElevationText}</span>
        ) : (
          topM && <span className="text-[11px] text-ink-faint font-data">山顶海拔 {topM}m 实时实测</span>
        )}
      </div>

      {loading && (
        <div className="my-auto py-6 animate-pulse flex flex-col gap-3">
          <div className="h-8 bg-white/10 rounded w-1/3"></div>
          <div className="h-4 bg-white/5 rounded w-1/2"></div>
        </div>
      )}

      {error && (
        <div className="my-auto py-6 text-xs text-ink-faint">
          {labels.error}
        </div>
      )}

      {data && weatherText && (
        <div className="my-auto py-3">
          <div className="flex items-baseline justify-between gap-4 flex-wrap">
            <div className="flex items-baseline gap-2.5">
              <span className="font-data text-4xl sm:text-5xl font-black tracking-tight text-accent-ice">
                {data.temp > 0 ? `+${data.temp}` : data.temp}°C
              </span>
              <span className="px-3 py-1 rounded-full bg-white/10 text-xs font-semibold text-ink-main">
                {weatherText}
              </span>
            </div>
            <span className="text-xs text-ink-muted">
              {labels.apparentTemp}: <span className="font-data font-semibold text-ink-main">{data.apparentTemp}°C</span>
            </span>
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 gap-3 pt-3 border-t border-white/10 text-xs mt-auto">
        <div className="flex items-center justify-between p-2.5 rounded-lg bg-white/5">
          <span className="text-ink-muted">{labels.snowfall}</span>
          <span className="font-data font-semibold">{data ? `${data.snowfall} cm/h` : "-"}</span>
        </div>
        <div className="flex items-center justify-between p-2.5 rounded-lg bg-white/5">
          <span className="text-ink-muted">{labels.windSpeed}</span>
          <span className="font-data font-semibold">{data ? `${data.windSpeed} km/h` : "-"}</span>
        </div>
      </div>
    </GlassCard>
  );
}
