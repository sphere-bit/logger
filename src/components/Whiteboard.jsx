import React, { useState, useRef } from 'react';

export default function Whiteboard({ draggedImage }) {
  const [imagePosition, setImagePosition] = useState(null);
  const whiteboardRef = useRef(null);
  const [images, setImages] = useState([]);

  const handleDrop = (event) => {
    event.preventDefault();
    if (draggedImage) {
      const whiteboard = whiteboardRef.current;
      if (whiteboard) {
        // Calculate the drop position relative to the whiteboard
        const rect = whiteboard.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;

        // Set the image position
        setImagePosition({ x, y });

        setImages((prevImages) => [...prevImages, { src: draggedImage, x, y }]);
      }
    }
  };

  const handleDragOver = (event) => {
    event.preventDefault(); // Necessary to allow drop
  };

  return (
    <div
      ref={whiteboardRef}
      className='whiteboard'
      style={{
        position: 'relative',
        width: '70vw',
        flexGrow: 1,
        height: '500px',
        border: '2px solid #000',
        backgroundColor: '#f0f0f0',
        overflow: 'hidden',
      }}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
    >
      {images.map((img, index) => (
        <img
          key={index}
          src={img.src}
          alt={`Dragged Item ${index}`}
          style={{
            position: 'absolute',
            top: img.y,
            left: img.x,
            width: '150px',
            height: '150px',
          }}
        />
      ))}
    </div>
  );
}
