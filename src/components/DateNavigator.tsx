"use client";

import React from 'react';

interface DateNavigatorProps {
  currentDate: string;
  onDateChange: (newDate: string) => void;
}

const DateNavigator: React.FC<DateNavigatorProps> = ({ currentDate, onDateChange }) => {
  const handleDateChange = (days: number) => {
    const date = new Date(currentDate);
    date.setDate(date.getDate() + days);
    onDateChange(date.toISOString().split('T')[0]);
  };

  return (
    <div className="flex items-center justify-center space-x-4">
      <button
        onClick={() => handleDateChange(-1)}
        className="px-4 py-2 bg-gray-200 rounded-md hover:bg-gray-300"
      >
        &lt;
      </button>
      <span className="text-lg font-semibold">{currentDate}</span>
      <button
      disabled={currentDate >= new Date().toISOString().split('T')[0]}
        onClick={() => handleDateChange(1)}
        className={`px-4 py-2 bg-gray-200 rounded-md hover:bg-gray-300` + (currentDate >= new Date().toISOString().split('T')[0] ? ' opacity-50 cursor-not-allowed' : '')}
      >
        &gt;
      </button>
    </div>
  );
};

export default DateNavigator;
