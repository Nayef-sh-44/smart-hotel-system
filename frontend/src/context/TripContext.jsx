import React, { createContext, useContext, useState, useEffect } from 'react';

const TripContext = createContext();

export const useTrip = () => useContext(TripContext);

export const TripProvider = ({ children }) => {
  const [tripPlan, setTripPlan] = useState(() => {
    const saved = localStorage.getItem('tripPlan');
    return saved ? JSON.parse(saved) : { name: 'My Trip', destinations: [], tripType: 'Family' };
  });

  useEffect(() => {
    localStorage.setItem('tripPlan', JSON.stringify(tripPlan));
  }, [tripPlan]);

  const addDestination = (dest) => {
    setTripPlan(prev => ({
      ...prev,
      destinations: [...(prev?.destinations || []), { ...dest, id: Date.now().toString() }]
    }));
  };

  const updateDestination = (id, updatedFields) => {
    setTripPlan(prev => ({
      ...prev,
      destinations: prev.destinations.map(d => d.id === id ? { ...d, ...updatedFields } : d)
    }));
  };

  const removeDestination = (id) => {
    setTripPlan(prev => ({
      ...prev,
      destinations: prev.destinations.filter(d => d.id !== id)
    }));
  };

  const updateTripDetails = (details) => {
    setTripPlan(prev => ({ ...prev, ...details }));
  };

  const clearTrip = () => {
    setTripPlan({ name: 'My Trip', destinations: [], tripType: 'Family' });
  };

  return (
    <TripContext.Provider value={{ tripPlan, addDestination, updateDestination, removeDestination, updateTripDetails, clearTrip }}>
      {children}
    </TripContext.Provider>
  );
};
