"use client";
import { Marker, Popup } from "react-map-gl/maplibre";
import { useState } from "react";
import { Calendar } from "lucide-react";

export default function EventMarker({ event }: { event: any }) {
  const [showPopup, setShowPopup] = useState(false);

  return (
    <Marker
      longitude={event.lng}
      latitude={event.lat}
      anchor="bottom"
      pitchAlignment="map"
      rotationAlignment="map"
    >
      <div
        onClick={() => setShowPopup(!showPopup)}
        className="group relative flex flex-col items-center cursor-pointer"
      >
        {/* Иконка метки */}
        <div
          className={`rounded-full p-2 shadow-lg transition-all duration-300 
          ${showPopup ? "bg-blue-500 scale-110" : "bg-blue-400 hover:bg-blue-500"} 
          text-white`}
        >
          <Calendar size={18} />
        </div>

        {/* Тень под меткой */}
        <div className="w-2 h-1 bg-black/30 rounded-full mt-0.5" />

        {/* Popup */}
        {showPopup && (
          <Popup
            longitude={event.lng}
            latitude={event.lat}
            anchor="top"
            offset={15}
            closeButton={false}
            className="z-50"
          >
            <div className="p-2 text-sm">
              <div className="font-semibold text-blue-700">{event.name}</div>
              <div className="text-xs text-gray-600">{event.place}</div>
              <div className="text-xs mt-1">
                {event.timeFrom} – {event.timeTo}
              </div>
            </div>
          </Popup>
        )}
      </div>
    </Marker>
  );
}
