'use client';

import { useState } from 'react';

interface CascinaGalleryProps {
  photos?: string[];
}

export default function CascinaGallery({ photos = [] }: CascinaGalleryProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  // Se no photos provided, use default paths
  const galleryPhotos = photos.length > 0 ? photos : [
    '/cascina-argentera/1.jpeg',
    '/cascina-argentera/2.jpeg',
    '/cascina-argentera/3.jpeg',
    '/cascina-argentera/4.jpeg',
    '/cascina-argentera/5.jpeg',
    '/cascina-argentera/6.jpeg'
  ];

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % galleryPhotos.length);
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + galleryPhotos.length) % galleryPhotos.length);
  };

  return (
    <div className="bg-white p-8 rounded-lg shadow-lg border-t-4 border-purple-900">
      <h4 className="text-2xl font-bold text-black mb-6">Cascina Argentera</h4>

      <div className="relative mb-6">
        <div className="relative h-[400px] rounded-lg overflow-hidden bg-gray-100">
          <img
            src={galleryPhotos[currentIndex]}
            alt={`Cascina foto ${currentIndex + 1}`}
            className="w-full h-full object-cover"
          />

          {/* Navigation Buttons */}
          <button
            onClick={prevSlide}
            className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition z-10"
          >
            <i className="mdi mdi-chevron-left text-2xl" />
          </button>
          <button
            onClick={nextSlide}
            className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition z-10"
          >
            <i className="mdi mdi-chevron-right text-2xl" />
          </button>

          {/* Slide Counter */}
          <div className="absolute bottom-4 right-4 bg-black/70 text-white px-3 py-1 rounded text-sm">
            {currentIndex + 1} / {galleryPhotos.length}
          </div>
        </div>
      </div>

      {/* Thumbnails */}
      <div className="grid grid-cols-3 md:grid-cols-6 gap-3 mb-6">
        {galleryPhotos.map((photo, index) => (
          <button
            key={index}
            onClick={() => setCurrentIndex(index)}
            className={`relative h-20 rounded-lg overflow-hidden border-2 transition ${index === currentIndex ? 'border-blue-900' : 'border-gray-300'
              }`}
          >
            <img
              src={photo}
              alt={`Thumbnail ${index + 1}`}
              className="w-full h-full object-cover"
            />
          </button>
        ))}
      </div>

      <p className="text-gray-700">
        Una location meravigliosa e accogliente perfetta per i nostri eventi e attività alle porte di Torino. Uno spazio dove la natura incontra la creatività, un'oasi di pace e ispirazione.
      </p>
    </div>
  );
}
