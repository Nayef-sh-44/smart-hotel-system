import React, { createContext, useContext, useState, useEffect } from 'react';
import toast from 'react-hot-toast';

const ComparisonContext = createContext(null);

export const ComparisonProvider = ({ children }) => {
  const [selectedHotels, setSelectedHotels] = useState(() => {
    const saved = localStorage.getItem('comparisonHotels');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('comparisonHotels', JSON.stringify(selectedHotels));
  }, [selectedHotels]);

  const toggleComparison = (hotel) => {
    const exists = selectedHotels.some((h) => h.id === hotel.id);
    if (exists) {
      setSelectedHotels(selectedHotels.filter((h) => h.id !== hotel.id));
      toast.success(`Removed "${hotel.name}" from comparison`);
    } else {
      if (selectedHotels.length >= 4) {
        toast.error('You can compare a maximum of 4 hotels at once.');
        return;
      }
      setSelectedHotels([...selectedHotels, hotel]);
      toast.success(`Added "${hotel.name}" to comparison`);
    }
  };

  const removeHotel = (id) => {
    setSelectedHotels(selectedHotels.filter((h) => h.id !== id));
  };

  const clearComparison = () => {
    setSelectedHotels([]);
  };

  const isSelected = (id) => selectedHotels.some((h) => h.id === id);

  return (
    <ComparisonContext.Provider
      value={{
        selectedHotels,
        toggleComparison,
        removeHotel,
        clearComparison,
        isSelected,
        count: selectedHotels.length,
      }}
    >
      {children}
    </ComparisonContext.Provider>
  );
};

export const useComparison = () => {
  const context = useContext(ComparisonContext);
  if (!context) throw new Error('useComparison must be used within a ComparisonProvider');
  return context;
};
