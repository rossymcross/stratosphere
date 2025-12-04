import React, { useState } from 'react';
import { EventDetail } from './components/events/EventDetail';
import { EVENTS } from './components/events/eventsData';

export default function App() {
  const [currentEventId, setCurrentEventId] = useState<string | null>(EVENTS[0]?.id || null);

  const handleBack = () => {
    console.log('Back clicked');
    // In a real app, this would navigate back to an event list
  };

  const handleCheckout = (data: any) => {
    console.log('Checkout:', data);
    alert(`Checkout initiated for ${data.total} USD`);
  };

  if (!currentEventId) {
    return <div className="min-h-screen bg-[#041C2C] text-white flex items-center justify-center">No events found</div>;
  }

  return (
    <div className="min-h-screen bg-[#041C2C]">
      <EventDetail 
        eventId={currentEventId} 
        onBack={handleBack} 
        onCheckout={handleCheckout} 
      />
    </div>
  );
}
