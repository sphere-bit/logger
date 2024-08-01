import { useState, useCallback } from 'react';

const useDraggable = (isAdjustingPositions) => {
  const [positions, setPositions] = useState({});

  const onMouseDown = useCallback(
    (event, id) => {
      if (!isAdjustingPositions) return;

      const el = event.target;
      const initialX = event.clientX - el.offsetLeft;
      const initialY = event.clientY - el.offsetTop;

      const onMouseMove = (moveEvent) => {
        const left = moveEvent.clientX - initialX;
        const top = moveEvent.clientY - initialY;
        setPositions((prevPositions) => ({
          ...prevPositions,
          [id]: { top, left },
        }));
      };

      const onMouseUp = () => {
        document.removeEventListener('mousemove', onMouseMove);
        document.removeEventListener('mouseup', onMouseUp);
      };

      document.addEventListener('mousemove', onMouseMove);
      document.addEventListener('mouseup', onMouseUp);
    },
    [isAdjustingPositions]
  );

  return { positions, setPositions, onMouseDown };
};

export default useDraggable;
