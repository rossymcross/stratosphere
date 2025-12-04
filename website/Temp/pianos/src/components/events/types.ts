import React from 'react';

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
