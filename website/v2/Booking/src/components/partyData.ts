import { Gamepad2, Mic, Target, Crosshair, Trophy } from 'lucide-react';
// Activity images
import bowlingImg from "../assets/activities/bowling.png";
import arcadeImg from "../assets/activities/arcade.png";
import karaokeImg from "../assets/activities/karaoke.png";
import nerfImg from "../assets/activities/nerf.png";
import arcadeRacingImg from "../assets/activities/arcade-racing.png";
import arcadeVrImg from "../assets/activities/arcade-vr.png";
import axeBowlImg from "../assets/activities/axe-bowl.png";
import themedKaraokeImg from "../assets/activities/themed-karaoke.png";
import nerfWarImg from "../assets/activities/nerf-war.png";
// Package images
import strikeImg from "../assets/packages/strike.png";
import spareImg from "../assets/packages/spare.png";
import splitImg from "../assets/packages/split.png";

export type PartyCategory = 'bowling' | 'arcade' | 'axe' | 'karaoke' | 'nerf';

export interface PartyType {
  id: PartyCategory;
  title: string;
  subtitle: string;
  icon: any; // Lucide icon component
  emoji: string;
  image: string;
  priceFrom: string;
}

export const PARTY_TYPES: PartyType[] = [
  {
    id: 'bowling',
    title: 'Bowling Packages',
    subtitle: 'Strike, Spare, or Split — bowling + food + arcade',
    icon: Trophy,
    emoji: '🎳',
    image: bowlingImg,
    priceFrom: 'From $339'
  },
  {
    id: 'arcade',
    title: 'Arcade Packages',
    subtitle: 'Supercharged, Level Up, or Press Play',
    icon: Gamepad2,
    emoji: '🕹️',
    image: arcadeImg,
    priceFrom: 'From $180'
  },
  {
    id: 'axe',
    title: 'Axe & Bowl Combo',
    subtitle: '$50/person — axe throwing + bowling (Ages 15+)',
    icon: Crosshair,
    emoji: '🪓',
    image: axeBowlImg,
    priceFrom: '$50/person'
  },
  {
    id: 'karaoke',
    title: 'Karaoke Party',
    subtitle: 'Private room + arcade time',
    icon: Mic,
    emoji: '🎤',
    image: karaokeImg,
    priceFrom: 'From $250'
  },
  {
    id: 'nerf',
    title: 'Nerf Party',
    subtitle: 'Nerf war + arcade + food',
    icon: Target,
    emoji: '🔫',
    image: nerfImg,
    priceFrom: 'From $489'
  }
];

export interface PartyPackage {
  id: string;
  title: string;
  priceDisplay: string;
  guestsIncluded?: number; // e.g., 10
  minGuests?: number; // e.g., 10 for axe
  maxGuests?: number;
  laneCapacity?: number;
  additionalGuestPrice?: number;
  includes: string[];
  ageRestriction?: string;
  image?: string;
}

export interface PartyCategoryData {
  title: string;
  subtitle: string;
  packages: PartyPackage[];
}

export const PARTY_PACKAGES_DATA: Record<PartyCategory, PartyCategoryData> = {
  bowling: {
    title: 'Bowling Packages',
    subtitle: 'All packages include bowling, shoes, food, and arcade time',
    packages: [
      {
        id: 'strike',
        title: 'STRIKE PACKAGE',
        priceDisplay: '$489 (Mon-Thu) / $515 (Fri-Sun)',
        guestsIncluded: 10,
        additionalGuestPrice: 40,
        image: strikeImg,
        includes: [
          '1 hour of bowling',
          'Bowling shoes',
          '90-minute arcade game card or $20 arcade game card',
          'Unlimited Virtual Reality & XD Theater',
          '500 E-Tickets for prize redemption',
          '2 one-topping 16" pizzas',
          'Beverage pitchers',
          'Dedicated party host',
          'Party supplies (tablecloth, plates, cups, napkins, utensils)',
          'Prize scratch-off card for guest of honor and guests (for future visit)'
        ]
      },
      {
        id: 'spare',
        title: 'SPARE PACKAGE',
        priceDisplay: '$389 (Mon-Thu) / $415 (Fri-Sun)',
        guestsIncluded: 10,
        additionalGuestPrice: 30,
        image: spareImg,
        includes: [
          '1 hour of bowling',
          'Bowling shoes',
          '60-minute arcade game card or $15 arcade game card',
          '1 game of Virtual Reality & XD Theater',
          '250 E-Tickets for prize redemption',
          '2 one-topping 16" pizzas',
          'Beverage pitchers',
          'Dedicated party host',
          'Party supplies (tablecloth, plates, cups, napkins, utensils)',
          'Prize scratch-off card for guest of honor and guests (for future visit)'
        ]
      },
      {
        id: 'split',
        title: 'SPLIT PACKAGE',
        priceDisplay: '$339 (Mon-Thu) / $365 (Fri-Sun)',
        guestsIncluded: 10,
        additionalGuestPrice: 25,
        image: splitImg,
        includes: [
          '1 hour of bowling',
          'Bowling shoes',
          '60-minute arcade game card or $15 arcade game card',
          '100 E-tickets for prize redemption',
          '2 one-topping 16" pizzas',
          'Beverage pitchers',
          'Dedicated party host',
          'Party supplies (tablecloth, plates, cups, napkins, utensils)',
          'Prize scratch-off card for guest of honor and guests (for future visit)'
        ]
      }
    ]
  },
  arcade: {
    title: 'Arcade Packages',
    subtitle: 'Game on! Choose your level of play',
    packages: [
      {
        id: 'supercharged',
        title: 'SUPERCHARGED GAME ZONE',
        priceDisplay: '$440 (Mon-Thu) / $465 (Fri-Sun)',
        guestsIncluded: 10,
        additionalGuestPrice: 35,
        image: arcadeVrImg,
        includes: [
          '120 minutes arcade card per guest',
          'Unlimited games of Virtual Reality or XD Theater per guest',
          '2 one-topping pizzas',
          'Unlimited soda pitchers',
          'Dedicated party host',
          'Party supplies (tablecloth, plates, napkins, utensils)',
          'Prize scratch-off card for guest of honor and guests (for future visit)'
        ]
      },
      {
        id: 'levelup',
        title: 'LEVEL UP GAME ZONE',
        priceDisplay: '$329 (Mon-Thu) / $340 (Fri-Sun)',
        guestsIncluded: 10,
        additionalGuestPrice: 25,
        image: arcadeRacingImg,
        includes: [
          '60 minutes arcade card per guest',
          '2 games of Virtual Reality or XD Theater per guest',
          '2 one-topping pizzas',
          'Unlimited soda pitchers',
          'Dedicated party host',
          'Party supplies (tablecloth, plates, napkins, utensils)',
          'Prize scratch-off card for guest of honor and guests (for future visit)'
        ]
      },
      {
        id: 'pressplay',
        title: 'PRESS PLAY GAME ZONE',
        priceDisplay: '$180 (all days)',
        guestsIncluded: 10,
        additionalGuestPrice: 18,
        image: arcadeRacingImg,
        includes: [
          '60 minutes arcade card per guest',
          '1 one-topping pizza',
          '3 non-refillable soda pitchers',
          'Party supplies (plates, napkins, cups, utensils)'
        ]
      }
    ]
  },
  axe: {
    title: 'Axe & Bowl Combo',
    subtitle: 'The ultimate competitive social experience',
    packages: [
      {
        id: 'axe-bowl',
        title: 'AXE & BOWL COMBO',
        priceDisplay: '$50/person',
        minGuests: 2,
        laneCapacity: 6,
        ageRestriction: 'Ages 15+',
        image: axeBowlImg,
        includes: [
          '1 hour axe throwing',
          '1 hour bowling + shoes',
          '30-minute arcade card',
          '1 VR/XD game'
        ]
      }
    ]
  },
  karaoke: {
    title: 'Karaoke Party',
    subtitle: 'Sing your heart out in a private room',
    packages: [
      {
        id: 'standard-karaoke',
        title: 'STANDARD KARAOKE',
        priceDisplay: '$250 (Mon-Thu) / $300 (Fri-Sun)',
        guestsIncluded: 15,
        image: karaokeImg,
        includes: [
          'Private Karaoke in our Greenhouse (up to 15 guests)',
          '30-minute game card per person',
          'Tue-Thu: $250 for 2 hours (Option for Additional Hour - $100)',
          'Fri-Sun: $300 for 2 hours (Option for Additional Hour - $125)',
          'Package must be booked in advance – No walk-ins'
        ]
      },
      {
        id: 'themed-karaoke',
        title: 'THEMED KARAOKE',
        priceDisplay: '$425 (Mon-Thu) / $475 (Fri-Sun)',
        guestsIncluded: 10,
        image: themedKaraokeImg,
        includes: [
          '2 hours private karaoke in Greenhouse (up to 10 guests)',
          'Choice of Theme: Taylor Swift, KPop Demon Hunters, or Wicked (Please notate choice when booking)',
          '2 cheese pizzas',
          'Unlimited soda pitchers',
          '30-minute game card per person',
          'Themed backdrop',
          'Themed centerpieces for high top tables',
          'Themed tablecloth, napkins, plates, dessert plates, cups and utensils',
          'Access to themed songs',
          'Prize scratch-off card for guest of honor and guests (for future visit)'
        ]
      }
    ]
  },
  nerf: {
    title: 'Nerf War Party',
    subtitle: 'Battle it out in our arena',
    packages: [
      {
        id: 'nerf-war',
        title: 'NERF WAR PARTY',
        priceDisplay: '$489 (Mon-Thu) / $515 (Fri-Sun)',
        guestsIncluded: 10,
        additionalGuestPrice: 40,
        image: nerfWarImg,
        includes: [
          '1 hour Nerf War (Goggles and darts are included. Kids must bring their own guns.)',
          '60 minutes arcade card per guest',
          '200 redemption tickets',
          '2 one-topping pizzas',
          'Unlimited soda pitchers',
          'Dedicated party host',
          'Party supplies (tablecloth, plates, napkins, utensils)',
          '$15 arcade player card for guest of honor (future visit)',
          '$5 arcade player card for each guest (future visit)'
        ]
      }
    ]
  }
};
