import React, { useState, useRef, useEffect } from 'react';

export default function Whiteboard({ dragItemType }) {
  const [items, setItems] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [draggingIndex, setDraggingIndex] = useState(null);
  const whiteboardRef = useRef(null);
  const itemRefs = useRef([]);

  const handleClickOutside = (event) => {
    if (itemRefs.current.every((ref) => ref && !ref.contains(event.target))) {
      setSelectedItem(null);
    }
  };

  useEffect(() => {
    document.addEventListener('click', handleClickOutside);
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, []);

  const handleDrop = (event) => {
    event.preventDefault();
    const whiteboard = whiteboardRef.current;
    if (whiteboard) {
      const rect = whiteboard.getBoundingClientRect();
      const x = event.clientX - rect.left * 2;
      const y = event.clientY - rect.top * 2;

      if (dragItemType) {
        const newItem = {
          type: dragItemType,
          src:
            dragItemType === 'image' ? 'https://via.placeholder.com/150' : '',
          x,
          y,
        };
        setItems((prevItems) => [...prevItems, newItem]);
      }
    }
  };

  const handleDragOver = (event) => {
    event.preventDefault();
  };

  const startDragging = (index) => {
    setDraggingIndex(index);
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
      {items.map((item, index) =>
        item.type === 'image' ? (
          <img
            key={index}
            src={item.src}
            alt={`Dragged Item ${index}`}
            style={{
              position: 'absolute',
              top: item.y,
              left: item.x,
              width: '150px',
              height: '150px',
              cursor: 'move',
              border: selectedItem === index ? '2px solid red' : 'none',
            }}
            draggable
            onDragStart={() => startDragging(index)}
            onClick={() => setSelectedItem(index)}
            ref={(el) => (itemRefs.current[index] = el)}
          />
        ) : (
          item.type === 'square' && (
            <div
              key={index}
              style={{
                position: 'absolute',
                top: item.y,
                left: item.x,
                width: '150px',
                height: '150px',
                backgroundColor: 'blue', // Example color
                border: selectedItem === index ? '2px solid red' : 'none',
                cursor: 'move',
              }}
              draggable
              onDragStart={() => startDragging(index)}
              onClick={() => setSelectedItem(index)}
              ref={(el) => (itemRefs.current[index] = el)}
            />
          )
        )
      )}
    </div>
  );
}
