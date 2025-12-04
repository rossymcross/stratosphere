import React from 'react';
// Event images
import duelingPianosImg from '../../assets/events/dueling-pianos.png';
import brewsImg from '../../assets/events/brews.png';
import nyeImg from '../../assets/events/nye.png';
import triviaImg from '../../assets/events/trivia.png';
import pintsPuntsImg from '../../assets/events/pints-punts.png';
import axesAlesImg from '../../assets/events/axes-ales.png';

// Gallery images - Dueling Pianos (placeholder URLs until real images are provided)
const duelingPianosGallery = [
  'https://images.unsplash.com/photo-1520523839897-bd0b52f945a0?w=800&q=80', // Piano keys
  'https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?w=800&q=80', // Concert crowd
  'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800&q=80', // Live music stage
  'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=800&q=80', // Music performance
  'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?w=800&q=80', // Concert atmosphere
  'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=800&q=80', // Party crowd
];

// Gallery images - Trivia Night (placeholder URLs until real images are provided)
const triviaGallery = [
  'https://images.unsplash.com/photo-1606326608606-aa0b62935f2b?w=800&q=80', // Quiz night
  'https://images.unsplash.com/photo-1543269865-cbf427effbad?w=800&q=80', // Friends at bar
  'https://images.unsplash.com/photo-1517457373958-b7bdd4587205?w=800&q=80', // Team celebration
  'https://images.unsplash.com/photo-1528605248644-14dd04022da1?w=800&q=80', // Group having fun
  'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=800&q=80', // Person thinking
];

// Gallery images - Pints & Punts (placeholder URLs until real images are provided)
const pintsPuntsGallery = [
  'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=800&q=80', // Football fans
  'https://images.unsplash.com/photo-1567696911980-2eed69a46042?w=800&q=80', // Beer glasses
  'https://images.unsplash.com/photo-1489753735160-2cbf3d9106be?w=800&q=80', // Sports bar
  'https://images.unsplash.com/photo-1566417713940-fe7c737a9ef2?w=800&q=80', // Cheering crowd
  'https://images.unsplash.com/photo-1436891620584-47fd0e565afb?w=800&q=80', // Beer toast
  'https://images.unsplash.com/photo-1461896836934- voices-7ea6a42ff?w=800&q=80', // Game day
];

// Gallery images - Axes & Ales (placeholder URLs until real images are provided)
const axesAlesGallery = [
  'https://images.unsplash.com/photo-1590333748338-d629e4564ad9?w=800&q=80', // Axe throwing action
  'https://images.unsplash.com/photo-1535958636474-b021ee887b13?w=800&q=80', // Beer flight
  'https://images.unsplash.com/photo-1608270586620-248524c67de9?w=800&q=80', // Craft beers
  'https://images.unsplash.com/photo-1566633806327-68e152aaf26d?w=800&q=80', // Beer tap
  'https://images.unsplash.com/photo-1571613316887-6f8d5cbf7ef7?w=800&q=80', // Axe target bullseye
  'https://images.unsplash.com/photo-1436891620584-47fd0e565afb?w=800&q=80', // Beer cheers
];

// Gallery images - Brews & Bites
import brewsGallery1 from '../../assets/galleries/brews/brews-1.png';
import brewsGallery2 from '../../assets/galleries/brews/brews-2.png';
import brewsGallery3 from '../../assets/galleries/brews/brews-3.png';
// brews-4.jpg is duplicate of brews-3.png (removed)
import brewsGallery5 from '../../assets/galleries/brews/brews-5.jpg';
// brews-6.jpg is duplicate of brews-1.png (removed)
// brews-7.jpg is duplicate of brews-2.png (removed)
import brewsGallery8 from '../../assets/galleries/brews/brews-8.jpg';
import brewsGallery9 from '../../assets/galleries/brews/brews-9.jpg';
import brewsGallery10 from '../../assets/galleries/brews/brews-10.jpg';
import brewsGallery11 from '../../assets/galleries/brews/brews-11.jpg';
// Gallery images - New Year's Eve
import nyeGallery1 from '../../assets/galleries/nye/nye-1.png';
import nyeGallery2 from '../../assets/galleries/nye/nye-2.png';
import nyeGallery3 from '../../assets/galleries/nye/nye-3.png';
import { TriviaDescription } from './TriviaDescription';

export interface Event {
  id: string;
  title: string;
  subheading?: string;
  priceDisplay: string;
  shortDescription: string;
  longDescription: string | React.ReactNode;
  image: string;
  type: 'table' | 'ticket' | 'info';
  date?: string;
  buttonText?: string;
  isComingSoon?: boolean;
  galleryImages?: string[];
  galleryTitle?: string;
  options?: Array<{
    id: string;
    label: string;
    price: number;
    unit: string;
    description: string;
  }>;
}

export const EVENTS: Event[] = [
  {
    id: 'dueling-pianos',
    title: 'Dueling Pianos',
    subheading: 'An immersive live music experience',
    priceDisplay: 'From $15/person',
    shortDescription: 'Live music entertainment',
    longDescription: 'Whether you\'re looking for a fun night out with friends, celebrating a special occasion or a date night with your significant other, Dueling Pianos is a high-energy show that\'s a must see!\n\nSing along with our performers, request your favorite songs and enjoy delicious food & drinks!\n\nVIP tables must be reserved in advance to guarantee your spot.',
    image: duelingPianosImg,
    type: 'table',
    date: 'Friday, Feb 13, 2026 • 8:00 PM',
    buttonText: 'Coming Soon',
    isComingSoon: true,
    galleryImages: duelingPianosGallery,
    galleryTitle: 'Past Performances',
    options: [
      {
        id: 'community',
        label: 'Community Seating',
        price: 15,
        unit: 'person',
        description: 'Open seating in shared area'
      },
      {
        id: 'vip-4',
        label: 'VIP 4-Top Table',
        price: 80,
        unit: 'table',
        description: 'Guaranteed seating for 4'
      },
      {
        id: 'vip-8',
        label: 'VIP 8-Top Table',
        price: 160,
        unit: 'table',
        description: 'Guaranteed seating for 8'
      }
    ]
  },
  {
    id: 'brews-with-bites',
    title: 'Brews with Bites',
    subheading: 'great FOOD. GREAT BEER. great PEOPLE.',
    priceDisplay: '$60/person',
    shortDescription: 'FEATURING BEST DISHES FROM 2025!',
    longDescription: 'If you love great food and local craft beers then you won’t want to miss our monthly Brews with Bites beer dinners! Join us once a month to enjoy a chef-crafted 4 course meal paired with 4 beers from a featured local brewery. This is a great way to expand your palate and enjoy a fun night out with friends!',
    image: brewsImg,
    type: 'ticket',
    date: 'Tuesday, Dec 9 • 7:00 PM',
    galleryImages: [brewsGallery1, brewsGallery2, brewsGallery3, brewsGallery5, brewsGallery8, brewsGallery9, brewsGallery10, brewsGallery11],
    galleryTitle: 'Check out our past beer dinners!',
    options: [
        {
            id: 'standard',
            label: 'Standard Ticket',
            price: 60,
            unit: 'person',
            description: '4-course meal + 4 brews + souvenir glass'
        },
        {
            id: 'non-alcoholic',
            label: 'Non-Alcoholic Ticket',
            price: 45,
            unit: 'person',
            description: 'Includes food only, cannot share beer'
        }
    ]
  },
  {
    id: 'nye-party',
    title: "New Year's Eve Party",
    subheading: 'Ring in the new year with us!',
    priceDisplay: 'Tickets from $40',
    shortDescription: 'Ring in the new year!',
    longDescription: 'Say goodbye to 2025 in style and welcome 2026 with an unforgettable night of fun, music, and celebration! Join us for our New Year’s Eve Party featuring unlimited attractions from 8PM–1AM — bowl, play, and game your way into the new year! All ages welcome!',
    image: nyeImg,
    type: 'ticket',
    date: 'Dec 31 • 8:00 PM',
    galleryImages: [nyeGallery1, nyeGallery2, nyeGallery3],
    galleryTitle: "Last Year's Celebration",
    options: [
      {
        id: 'dd-under21',
        label: 'DD / Under 21 Ticket',
        price: 40,
        unit: 'person',
        description: 'Unlimited Bowling, Axe Throwing (15+), Arcade, VR & XD Theater\nParty Hat & Horn\nLive DJ\nBalloon Drop at Midnight\nSparkling Cider Toast'
      },
      {
        id: 'standard-21',
        label: 'Standard Ticket (21+)',
        price: 60,
        unit: 'person',
        description: '2 drink tickets (beer, house wine, house liquors)\nChampagne Toast\nUnlimited Bowling, Axe Throwing (15+), Arcade, VR & XD Theater\nParty Hat & Horn\nLive DJ\nBalloon Drop at Midnight'
      }
    ]
  },
  {
    id: 'trivia-night',
    title: 'Trivia Night',
    priceDisplay: 'Free to Play!',
    shortDescription: 'knowledge wanted, but not required.',
    longDescription: <TriviaDescription />,
    image: triviaImg,
    type: 'info',
    date: 'Every Thursday • 7:00 PM - 9:00 PM',
    isComingSoon: false,
    galleryImages: triviaGallery,
    galleryTitle: 'Trivia Night Memories'
  },
  {
    id: 'pints-and-punts',
    title: 'Pints & Punts Squad',
    subheading: 'Football Beer Pass',
    priceDisplay: '$20/person',
    shortDescription: 'Football Season Pass',
    longDescription: (
      <>
        <p className="mb-4">Calling all football fans! Get ready to huddle up for the ultimate football experience at Stratosphere Social! With our Football Season Pass, you can enjoy beer discounts all season long!</p>
        <p className="font-bold mb-4 text-[#71D2EB] text-xl">Only $20 per person.</p>
        
        <div className="bg-white/10 rounded-xl p-6 border border-white/10 mb-6">
          <h4 className="font-bold text-xl text-white uppercase mb-4">PASS INCLUDES:</h4>
          <ul className="space-y-3">
            <li className="flex items-start gap-3">
              <span className="text-[#71D2EB] mt-1 font-bold">✓</span>
              <span className="text-white font-medium">1 FREE 20oz MILLER LITE DRAFT</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-[#71D2EB] mt-1 font-bold">✓</span>
              <div>
                <span className="font-bold text-white">$2 OFF 20oz MILLER LITE DRAFTS EVERY GAME DAY!</span>
                <p className="text-sm text-white/70 mt-1">Mondays, Thursdays and Sundays during football season.</p>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-[#71D2EB] mt-1 font-bold">✓</span>
              <span className="text-white font-medium">MILLER LITE FOOTBALL SHIRT & REUSABLE CUP</span>
            </li>
          </ul>
        </div>

        <div className="mb-6 p-4 rounded-lg bg-[#71D2EB]/10 border border-[#71D2EB]/30">
          <p className="font-bold text-lg text-[#71D2EB] uppercase mb-1">WE WILL STAY OPEN FOR ALL RAVENS GAMES!</p>
          <p className="text-white/90 font-medium">& WE HAVE REDZONE!</p>
        </div>

        <p className="text-sm text-white/60 italic">Must be 21+ to purchase</p>
      </>
    ),
    image: pintsPuntsImg,
    type: 'ticket',
    date: 'Football Season • Mon, Thu, Sun',
    isComingSoon: false,
    galleryImages: pintsPuntsGallery,
    galleryTitle: 'Game Day Highlights',
    options: [
      {
        id: 'season-pass',
        label: 'Season Pass',
        price: 20,
        unit: 'person',
        description: 'Includes free draft, discounts, shirt & cup'
      }
    ]
  },
  {
    id: 'axes-and-ales',
    title: 'Axes & Ales',
    priceDisplay: '$10/hour',
    shortDescription: 'Start your week with a BULLSEYE!',
    longDescription: (
      <>
        <h4 className="font-bold text-xl text-[#71D2EB] mb-3">Start your week with a bang – or better yet, a BULLSEYE!</h4>
        <p className="mb-6">
          Join us every Monday night at Stratosphere Social for Axes & Ales, the ultimate way to unwind, socialize, and chuck some axes (safely, of course).
        </p>

        <p className="mb-6">
          For only <span className="font-bold text-[#71D2EB]">$10 for an hour</span> or <span className="font-bold text-[#71D2EB]">$20 for 3 hours</span>, you'll get tons of axe-throwing action, beer specials that'll make you hoppy, and a chance to win cool stuff in our raffle giveaways! Plus a chance to socialize, mingle with friends and maybe even meet some new people!
        </p>

        <p className="italic text-white/80">
          Whether you're a seasoned axe-slinger or just here for the brews and good vibes, this is your night to let loose and hit the bullseye—literally and socially.
        </p>
      </>
    ),
    image: axesAlesImg,
    type: 'info',
    date: 'Every Monday • 6:00 PM - 9:00 PM',
    isComingSoon: false,
    galleryImages: axesAlesGallery,
    galleryTitle: 'Axes & Ales Action'
  }
];
