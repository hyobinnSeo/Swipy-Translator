import { useState, useCallback } from 'react';

const useSwipe = (onSwipeLeft, onSwipeRight, minSwipeDistance = 50) => {
    const [touchStart, setTouchStart] = useState(null);
    const [touchEnd, setTouchEnd] = useState(null);

    const onTouchStart = useCallback((e) => {
        setTouchEnd(null);
        setTouchStart(e.targetTouches[0].clientX);
    }, []);

    const onTouchMove = useCallback((e) => {
        setTouchEnd(e.targetTouches[0].clientX);
    }, []);

    const onTouchEnd = useCallback(() => {
        if (!touchStart || !touchEnd) return;

        const distance = touchStart - touchEnd;
        const isLeftSwipe = distance > minSwipeDistance;
        const isRightSwipe = distance < -minSwipeDistance;

        if (isLeftSwipe && onSwipeLeft) {
            onSwipeLeft();
        }
        if (isRightSwipe && onSwipeRight) {
            onSwipeRight();
        }
    }, [touchStart, touchEnd, minSwipeDistance, onSwipeLeft, onSwipeRight]);

    return {
        onTouchStart,
        onTouchMove,
        onTouchEnd
    };
};

export default useSwipe;
