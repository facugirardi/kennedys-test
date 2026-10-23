import React from 'react';

const FontDemo: React.FC = () => {
  return (
    <div className="p-8 bg-white">
      <h1 className="text-4xl font-bold mb-8 text-gray-800">Demo de Fuentes Kennedys</h1>
      
      {/* GT Super Ds Trial - Para títulos principales */}
      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4 text-gray-700">GT Super Ds Trial (font-gtsuper-ds)</h2>
        <h1 className="font-gtsuper-ds text-6xl font-light uppercase text-primary mb-4">
          Título Principal
        </h1>
        <h2 className="font-gtsuper-ds text-4xl font-light uppercase text-gray-800 mb-2">
          Subtítulo Grande
        </h2>
        <h3 className="font-gtsuper-ds text-2xl font-light uppercase text-gray-600">
          Título Mediano
        </h3>
      </section>

      {/* GT Super Txt Trial - Para subtítulos */}
      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4 text-gray-700">GT Super Txt Trial (font-gtsuper)</h2>
        <h2 className="font-gtsuper text-3xl font-light uppercase text-primary mb-4">
          Luxury Villa and Chalet Rental
        </h2>
        <h3 className="font-gtsuper text-xl font-light uppercase text-gray-800 mb-2">
          Luxury Experience
        </h3>
        <h4 className="font-gtsuper text-lg font-light uppercase text-gray-600">
          Título Pequeño
        </h4>
      </section>

      {/* Neue Haas Grotesk Display Pro - Para texto de cuerpo */}
      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4 text-gray-700">Neue Haas Grotesk Display Pro (font-haas)</h2>
        <p className="font-haas text-lg leading-7 text-gray-700 mb-4">
          Este es un párrafo de ejemplo usando Neue Haas Grotesk Display Pro. 
          Es perfecto para texto de cuerpo, descripciones y contenido general. 
          La fuente tiene una excelente legibilidad y se ve muy profesional.
        </p>
        <p className="font-haas text-base leading-6 text-gray-600 mb-4">
          Texto más pequeño para descripciones secundarias y detalles adicionales.
        </p>
        <span className="font-haas text-sm text-gray-500">
          Texto pequeño para etiquetas y información adicional.
        </span>
      </section>

      {/* GT Super Display - Para elementos de display */}
      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4 text-gray-700">GT Super Display (font-gtsuper-display)</h2>
        <h1 className="font-gtsuper-display text-8xl font-light text-primary mb-4">
          DISPLAY
        </h1>
        <h2 className="font-gtsuper-display text-6xl font-light text-gray-800">
          GRANDE
        </h2>
      </section>

      {/* Ejemplo de combinación */}
      <section className="mb-8 p-6 bg-gray-50 rounded-lg">
        <h2 className="text-2xl font-semibold mb-4 text-gray-700">Ejemplo de Combinación</h2>
        <div className="space-y-4">
          <h1 className="font-gtsuper-ds text-4xl font-light uppercase text-primary">
            Discover Your Next Adventure
          </h1>
          <h2 className="font-gtsuper text-2xl font-light uppercase text-gray-800">
            Luxury Villa and Chalet Rental
          </h2>
          <p className="font-haas text-lg leading-7 text-gray-700">
            Providing curated accommodations and personalized services for an unforgettable stay. 
            Experience luxury like never before with our premium villa collection.
          </p>
          <div className="flex gap-4 text-sm">
            <span className="font-haas text-gray-500">8 bedrooms</span>
            <span className="font-haas text-gray-500">8 bathrooms</span>
            <span className="font-haas text-gray-500">1000 sq.m</span>
          </div>
        </div>
      </section>
    </div>
  );
};

export default FontDemo;

