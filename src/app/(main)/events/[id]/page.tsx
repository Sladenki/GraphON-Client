'use client'

import React from 'react';
import { useParams } from 'next/navigation';
import EventPage from './EventPage';

export default function EventPageWrapper() {
  const params = useParams();
  const eventId = params.id as string;


  return <EventPage eventId={eventId} />;
}
