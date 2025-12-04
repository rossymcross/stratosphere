import { useState, useEffect } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from './utils/supabase/client';
import { GroupSizeSelection } from './components/GroupSizeSelection';
import { IntentSelection } from './components/IntentSelection';
import { DateSelection } from './components/DateSelection';
import { LargeGroupInquiry } from './components/LargeGroupInquiry';
import { LargeGroupConfirmation } from './components/LargeGroupConfirmation';
import { TicketConfirmation } from './components/checkout/TicketConfirmation';
import { CheckoutSummary } from './components/checkout/CheckoutSummary';
import { EventsList } from './components/events/EventsList';
import { EventDetail } from './components/events/EventDetail';
import { PartySelection } from './components/PartySelection';
import { PartyPackageSelection } from './components/PartyPackageSelection';
import { PartyBookingDetails } from './components/PartyBookingDetails';
import { PartyCategory, PARTY_PACKAGES_DATA } from './components/partyData';
import { AnimatedBackground } from './components/ui/AnimatedBackground';
import { AuthModal } from './components/auth/AuthModal';
import { AnimatePresence, motion } from 'motion/react';

export default function App() {
  const [step, setStep] = useState<'group' | 'intent' | 'events-list' | 'event-detail' | 'party-type' | 'party-package' | 'date' | 'details' | 'large-group' | 'confirmation' | 'checkout' | 'ticket-confirmation'>('group');
  const [bookingData, setBookingData] = useState({
    groupSize: null as 'small' | 'large' | null,
    intent: null as string | null,
    selectedEventId: null as string | null,
    partyCategory: null as PartyCategory | null,
    packageId: null as string | null,
    guestCount: null as number | null,
    date: null as Date | null,
    time: null as string | null,
  });

  // Auth State
  const [user, setUser] = useState<User | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [pendingCheckoutData, setPendingCheckoutData] = useState<any>(null);
  const [checkoutData, setCheckoutData] = useState<any>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
    return () => subscription.unsubscribe();
  }, []);

  const handleGroupSelect = (size: 'small' | 'large') => {
    setBookingData(prev => ({ ...prev, groupSize: size }));
    if (size === 'small') {
      setStep('intent');
    } else {
      setStep('large-group');
    }
  };

  const handleIntentSelect = (intent: string) => {
    const resetData = {
        selectedEventId: null,
        partyCategory: null as PartyCategory | null,
        packageId: null as string | null,
        date: null,
        time: null,
        guestCount: null
    };

    switch (intent) {
      case 'events':
        setBookingData(prev => ({ ...prev, ...resetData, intent }));
        setStep('events-list');
        break;
      case 'party':
        setBookingData(prev => ({ ...prev, ...resetData, intent }));
        setStep('party-type');
        break;
      case 'axe-throwing':
        setBookingData(prev => ({ ...prev, ...resetData, intent, partyCategory: 'axe', packageId: 'axe-bowl' }));
        setStep('date'); 
        break;
      case 'bowling':
        setBookingData(prev => ({ ...prev, ...resetData, intent }));
        setStep('date'); 
        break;
      default:
        setBookingData(prev => ({ ...prev, ...resetData, intent }));
        setStep('date');
    }
  };

  const handleEventSelect = (eventId: string) => {
    setBookingData(prev => ({ ...prev, selectedEventId: eventId }));
    setStep('event-detail');
  };

  const handlePartyCategorySelect = (category: PartyCategory) => {
    setBookingData(prev => ({ ...prev, partyCategory: category }));
    setStep('party-package');
  };

  const handlePackageSelect = (packageId: string) => {
    setBookingData(prev => ({ ...prev, packageId }));
    setStep('date');
  };

  const handleCheckout = (data: any) => {
    if (!user) {
      setPendingCheckoutData(data);
      setIsAuthModalOpen(true);
      return;
    }
    processCheckout(data);
  };

  const processCheckout = (data: any) => {
    console.log('Processing checkout for user:', user?.email, 'with data:', data);
    setCheckoutData(data);
    setStep('checkout');
  };

  const handleAuthSuccess = () => {
    setIsAuthModalOpen(false);
    if (pendingCheckoutData) {
      processCheckout(pendingCheckoutData);
      setPendingCheckoutData(null);
    }
  };

  const getMinGuests = () => {
    if (bookingData.packageId && bookingData.partyCategory) {
      const pkg = PARTY_PACKAGES_DATA[bookingData.partyCategory]?.packages.find(p => p.id === bookingData.packageId);
      return pkg?.minGuests || pkg?.guestsIncluded || 1;
    }
    return 1;
  };

  const getMaxGuests = () => {
    if (bookingData.packageId && bookingData.partyCategory) {
      const pkg = PARTY_PACKAGES_DATA[bookingData.partyCategory]?.packages.find(p => p.id === bookingData.packageId);
      return pkg?.maxGuests;
    }
    return undefined;
  };

  const getLaneCapacity = () => {
    if (bookingData.packageId && bookingData.partyCategory) {
      const pkg = PARTY_PACKAGES_DATA[bookingData.partyCategory]?.packages.find(p => p.id === bookingData.packageId);
      return pkg?.laneCapacity;
    }
    return undefined;
  };

  const getAdditionalGuestPrice = () => {
    if (bookingData.packageId && bookingData.partyCategory) {
      const pkg = PARTY_PACKAGES_DATA[bookingData.partyCategory]?.packages.find(p => p.id === bookingData.packageId);
      return pkg?.additionalGuestPrice;
    }
    return undefined;
  };

  const getGuestsIncluded = () => {
    if (bookingData.packageId && bookingData.partyCategory) {
      const pkg = PARTY_PACKAGES_DATA[bookingData.partyCategory]?.packages.find(p => p.id === bookingData.packageId);
      return pkg?.guestsIncluded;
    }
    return undefined;
  };

  return (
    <div className="relative min-h-screen w-full bg-[#041C2C] overflow-x-hidden text-white font-montserrat">
      <AnimatedBackground />
      
      <AuthModal 
        isOpen={isAuthModalOpen} 
        onClose={() => setIsAuthModalOpen(false)} 
        onSuccess={handleAuthSuccess}
      />

      <AnimatePresence mode="wait">
        {/* --- Step 1: Group Size --- */}
        {step === 'group' && (
          <motion.div
            key="group"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5 }}
            className="absolute inset-0 overflow-y-auto scrollbar-stable"
          >
            <GroupSizeSelection onSelect={handleGroupSelect} />
          </motion.div>
        )}

        {/* --- Flow: Large Group Inquiry --- */}
        {step === 'large-group' && (
          <motion.div
            key="large-group"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5 }}
            className="absolute inset-0 overflow-y-auto scrollbar-stable"
          >
            <LargeGroupInquiry 
              onBack={() => setStep('group')}
              onSubmitSuccess={() => setStep('confirmation')}
            />
          </motion.div>
        )}

        {step === 'confirmation' && (
          <motion.div
            key="confirmation"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5 }}
            className="absolute inset-0 overflow-y-auto scrollbar-stable"
          >
            <LargeGroupConfirmation 
              onHome={() => {
                setBookingData({ groupSize: null, intent: null, selectedEventId: null, partyCategory: null, packageId: null, guestCount: null, date: null, time: null });
                setStep('group');
              }}
            />
          </motion.div>
        )}

        {/* --- Step 2: Intent Selection --- */}
        {step === 'intent' && (
          <motion.div
            key="intent"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5 }}
            className="absolute inset-0 overflow-y-auto scrollbar-stable"
          >
            <IntentSelection 
              onBack={() => setStep('group')}
              onSelect={handleIntentSelect}
            />
          </motion.div>
        )}

        {/* --- Flow: Events --- */}
        {step === 'events-list' && (
          <motion.div
            key="events-list"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5 }}
            className="absolute inset-0 overflow-y-auto scrollbar-stable"
          >
            <EventsList 
              onBack={() => setStep('intent')}
              onSelectEvent={handleEventSelect}
            />
          </motion.div>
        )}

        {step === 'event-detail' && bookingData.selectedEventId && (
          <motion.div
            key="event-detail"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5 }}
            className="absolute inset-0 overflow-y-auto scrollbar-stable"
          >
            <EventDetail 
              eventId={bookingData.selectedEventId}
              onBack={() => setStep('events-list')}
              onCheckout={handleCheckout}
            />
          </motion.div>
        )}

        {/* --- Flow: Party Packages --- */}
        {step === 'party-type' && (
          <motion.div
            key="party-type"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5 }}
            className="absolute inset-0 overflow-y-auto scrollbar-stable"
          >
            <PartySelection 
              onBack={() => setStep('intent')}
              onSelect={handlePartyCategorySelect}
            />
          </motion.div>
        )}

        {step === 'party-package' && bookingData.partyCategory && (
          <motion.div
            key="party-package"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5 }}
            className="absolute inset-0 overflow-y-auto scrollbar-stable"
          >
            <PartyPackageSelection 
              category={bookingData.partyCategory}
              onBack={() => setStep('party-type')}
              onSelectPackage={handlePackageSelect}
              onContactUs={() => setStep('large-group')}
            />
          </motion.div>
        )}

        {/* --- Combined: Guest Count & Date --- */}
        {step === 'date' && (
          <motion.div
            key="date"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5 }}
            className="absolute inset-0 overflow-y-auto scrollbar-stable"
          >
            <DateSelection 
              onBack={() => {
                if (bookingData.packageId) {
                  setStep('party-package');
                } else if (bookingData.intent === 'events') {
                  setStep('intent');
                } else {
                  setStep('intent');
                }
              }}
              onNext={(date, time, guestCount) => {
                setBookingData(prev => ({ ...prev, date, time, guestCount }));
                setStep('details');
              }}
              onLargeGroupInquiry={() => setStep('large-group')}
              pageNumber={
                bookingData.intent === 'bowling' ? "08" :
                bookingData.intent === 'axe-throwing' ? "11" :
                bookingData.packageId ? "07" : "03"
              }
              initialGuestCount={Math.max(getMinGuests(), Math.min(getMaxGuests() || 100, bookingData.guestCount || 4))}
              minGuests={getMinGuests()}
              maxGuests={getMaxGuests()}
              laneCapacity={getLaneCapacity()}
              additionalGuestPrice={getAdditionalGuestPrice()}
              guestsIncluded={getGuestsIncluded()}
            />
          </motion.div>
        )}

        {step === 'details' && (
          <motion.div
            key="details"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5 }}
            className="absolute inset-0 overflow-y-auto scrollbar-stable"
          >
            <PartyBookingDetails 
              bookingData={bookingData}
              onBack={() => setStep('date')}
              onCheckout={handleCheckout}
            />
          </motion.div>
        )}

        {/* --- Flow: Checkout --- */}
        {step === 'checkout' && checkoutData && (
          <motion.div
            key="checkout"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5 }}
            className="absolute inset-0 overflow-y-auto scrollbar-stable"
          >
            <CheckoutSummary
              data={checkoutData}
              onBack={() => {
                  if (bookingData.selectedEventId) {
                      setStep('event-detail');
                  } else {
                      setStep('details');
                  }
              }}
              onConfirm={() => {
                console.log('Confirming payment for:', checkoutData);
                setStep('ticket-confirmation');
              }}
            />
          </motion.div>
        )}

        {step === 'ticket-confirmation' && (
          <motion.div
            key="ticket-confirmation"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5 }}
            className="absolute inset-0 overflow-y-auto scrollbar-stable"
          >
            <TicketConfirmation 
              type={bookingData.selectedEventId ? 'ticket' : 'booking'}
              onHome={() => {
                setBookingData({ groupSize: null, intent: null, selectedEventId: null, partyCategory: null, packageId: null, guestCount: null, date: null, time: null });
                setCheckoutData(null);
                setStep('group');
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
