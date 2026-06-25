// components/address/LocationMap.tsx
'use client';

import dynamic from 'next/dynamic';
import { useEffect, useState } from 'react';
import { FaSpinner } from 'react-icons/fa';

// Dynamic import for the map component to avoid SSR issues
const MapComponent = dynamic(
  () => import('./MapComponent'),
  {
    ssr: false,
    loading: () => (
      <div className="bg-gray-100 rounded-[8px]  h-80 flex items-center justify-center">
        <div className="text-center">
          <FaSpinner className="animate-spin text-4xl text-blue-500 mx-auto mb-3" />
          {/* <p className="text-gray-600">جاري تحميل الخريطة...</p> */}
        </div>
      </div>
    ),
  }
);

interface LocationMapProps {
  onLocationSelect: (location: { lat: number; lng: number; address: string }) => void;
  initialLocation?: { lat: number; lng: number };
}

export default function LocationMap(props: LocationMapProps) {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return (
      <div className="bg-gray-100 rounded-[8px]  h-80 flex items-center justify-center">
        <div className="text-center">
          <FaSpinner className="animate-spin text-4xl text-blue-500 mx-auto mb-3" />
          {/* <p className="text-gray-600">جاري تحميل الخريطة...</p> */}
        </div>
      </div>
    );
  }

  return <MapComponent {...props} />;
}