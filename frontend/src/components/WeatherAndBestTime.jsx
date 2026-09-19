import React, { useState, useEffect } from 'react';
import { Cloud, Sun, CloudRain, Wind, Thermometer, Droplets, Calendar, Info, Check } from 'lucide-react';

const getWeatherIcon = (code) => {
  if (code === 0) return <Sun className="w-8 h-8 text-amber-500" />;
  if (code > 0 && code <= 3) return <Cloud className="w-8 h-8 text-slate-400" />;
  if (code >= 51 && code <= 67) return <CloudRain className="w-8 h-8 text-blue-400" />;
  if (code >= 71 && code <= 77) return <Cloud className="w-8 h-8 text-slate-200" />;
  if (code >= 80 && code <= 82) return <CloudRain className="w-8 h-8 text-blue-500" />;
  if (code >= 95) return <CloudRain className="w-8 h-8 text-purple-500" />;
  return <Sun className="w-8 h-8 text-amber-500" />;
};

const ALL_MONTHS = [
  { short: 'Jan', full: 'January' }, { short: 'Feb', full: 'February' },
  { short: 'Mar', full: 'March' }, { short: 'Apr', full: 'April' },
  { short: 'May', full: 'May' }, { short: 'Jun', full: 'June' },
  { short: 'Jul', full: 'July' }, { short: 'Aug', full: 'August' },
  { short: 'Sep', full: 'September' }, { short: 'Oct', full: 'October' },
  { short: 'Nov', full: 'November' }, { short: 'Dec', full: 'December' }
];

export default function WeatherAndBestTime({ hotel }) {
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const fetchWeather = async () => {
      if (!hotel || !hotel.latitude || !hotel.longitude) {
        setLoading(false);
        return;
      }
      
      try {
        const url = `https://api.open-meteo.com/v1/forecast?latitude=${hotel.latitude}&longitude=${hotel.longitude}&daily=temperature_2m_max,temperature_2m_min,weather_code&timezone=auto&forecast_days=5`;
        const res = await fetch(url);
        if (!res.ok) throw new Error('Weather API error');
        const data = await res.json();
        setWeather(data);
      } catch (err) {
        console.error("Failed to fetch weather:", err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    fetchWeather();
  }, [hotel]);

  if (!hotel) return null;

  // Best Time Parsing
  if (!hotel.city?.best_visit_months) {
    console.error('Best Time data missing from hotel.city', hotel);
  }

  const rawMonths = hotel.city?.best_visit_months || '';
  let recommendedIndices = [];
  
  if (rawMonths.toLowerCase() === 'year-round') {
    recommendedIndices = [0,1,2,3,4,5,6,7,8,9,10,11];
  } else {
    const parts = rawMonths.split(',').map(p => p.trim().toLowerCase());
    parts.forEach(p => {
      const idx = ALL_MONTHS.findIndex(m => p.startsWith(m.short.toLowerCase()));
      if (idx !== -1 && !recommendedIndices.includes(idx)) {
        recommendedIndices.push(idx);
      }
    });
    recommendedIndices.sort((a, b) => a - b);
  }

  let groupedSummary = '';
  if (recommendedIndices.length === 12) {
    groupedSummary = 'Year-round';
  } else if (recommendedIndices.length === 0) {
    groupedSummary = 'Varies';
  } else {
    let groups = [];
    let start = recommendedIndices[0];
    let prev = start;

    for (let i = 1; i < recommendedIndices.length; i++) {
      if (recommendedIndices[i] === prev + 1) {
        prev = recommendedIndices[i];
      } else {
        groups.push(start === prev ? ALL_MONTHS[start].full : `${ALL_MONTHS[start].full} – ${ALL_MONTHS[prev].full}`);
        start = recommendedIndices[i];
        prev = start;
      }
    }
    groups.push(start === prev ? ALL_MONTHS[start].full : `${ALL_MONTHS[start].full} – ${ALL_MONTHS[prev].full}`);
    groupedSummary = groups.join(' & ');
  }
  
  let weatherDesc = hotel.city?.weather_description || 'Weather information unavailable.';

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 mb-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Weather Information - 5 Day Forecast */}
        <div className="glass-panel p-6 sm:p-8 relative overflow-hidden flex flex-col justify-between">
          <div className="absolute top-0 right-0 p-8 opacity-5">
            <Cloud className="w-48 h-48" />
          </div>
          
          <div className="mb-2">
            <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2 relative z-10">
              <Thermometer className="w-5 h-5 text-brand-500" />
              Weather Forecast in {hotel.city?.name || hotel.city_name}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 relative z-10">5-day upcoming forecast</p>
          </div>
          
          {loading ? (
            <div className="animate-pulse flex space-x-4 mt-4">
              <div className="flex-1 space-y-4 py-1">
                <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-3/4"></div>
                <div className="space-y-2">
                  <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded"></div>
                  <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-5/6"></div>
                </div>
              </div>
            </div>
          ) : error || !weather || !weather.daily ? (
            <div className="text-sm text-slate-500 dark:text-slate-400 mt-4 relative z-10">
              Weather information is currently unavailable.
            </div>
          ) : (
            <div className="flex justify-between items-center w-full gap-2 mt-4 relative z-10">
              {weather.daily.time.map((dateStr, index) => {
                const date = new Date(dateStr);
                const today = new Date();
                const isToday = date.toDateString() === today.toDateString();
                const dayName = isToday ? 'Today' : date.toLocaleDateString('en-US', { weekday: 'short' });
                const maxTemp = Math.round(weather.daily.temperature_2m_max[index]);
                const minTemp = Math.round(weather.daily.temperature_2m_min[index]);
                const code = weather.daily.weather_code[index];

                return (
                  <div key={dateStr} className="flex flex-col items-center p-2 bg-white/60 dark:bg-dark-800/60 rounded-xl border border-slate-100 dark:border-slate-700/50 flex-1 shadow-sm">
                    <span className="text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">{dayName}</span>
                    <div className="mb-1 transform scale-90">{getWeatherIcon(code)}</div>
                    <span className="text-sm font-bold text-slate-800 dark:text-slate-200">{maxTemp}°</span>
                    <span className="text-xs font-semibold text-slate-400 dark:text-slate-500">{minTemp}°</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Best Time to Visit - Calendar Overview */}
        <div className="glass-panel p-6 sm:p-8 relative overflow-hidden bg-gradient-to-br from-brand-50 to-white dark:from-dark-900 dark:to-dark-950 border-brand-100 dark:border-dark-800 flex flex-col justify-between">
          <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none">
            <Calendar className="w-48 h-48" />
          </div>
          
          <div className="mb-3">
            <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2 relative z-10">
              <Calendar className="w-5 h-5 text-brand-500" />
              Best Time to Visit
            </h3>
            <p className="text-xs font-bold text-brand-600 dark:text-brand-400 mt-1 relative z-10">
              {groupedSummary}
            </p>
          </div>
          
          <div className="relative z-10">
            {/* 4x3 Month Calendar Grid */}
            <div className="grid grid-cols-4 gap-1.5 mb-3">
              {ALL_MONTHS.map((m, idx) => {
                const isRec = recommendedIndices.includes(idx);
                return (
                  <div key={m.short} className={`flex flex-col items-center justify-center py-1 sm:py-1.5 rounded-lg border transition-colors ${isRec ? 'bg-brand-500 text-white border-brand-500 shadow-sm' : 'bg-slate-50/70 dark:bg-dark-800/40 text-slate-400 dark:text-slate-500 border-slate-100 dark:border-slate-700/50'}`}>
                    <span className="text-[10px] tracking-wider font-bold leading-none mt-1">{m.short.toUpperCase()}</span>
                    {isRec ? <Check className="w-3 h-3 mt-1 mb-0.5" strokeWidth={3} /> : <div className="w-3 h-3 mt-1 mb-0.5" />}
                  </div>
                );
              })}
            </div>
            
            {/* Why Visit */}
            <div className="text-[10px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-0.5">
              Why visit then?
            </div>
            <p className="text-xs font-medium text-slate-600 dark:text-slate-400 leading-snug line-clamp-2">
              {weatherDesc}
            </p>
          </div>
        </div>

      </div>
    </section>
  );
}
