import { useEffect, useRef, useState, useCallback } from 'react';

interface UseIntersectionObserverProps {
    root?: Element | null;
    threshold?: number | number[];
    rootMargin?: string;
    triggerOnce?: boolean;
    freezeOnceVisible?: boolean;
}

export const useIntersectionObserver = ({
    root = null,
    threshold = 0,
    rootMargin = '0px',
    triggerOnce = false,
    freezeOnceVisible = false,
}: UseIntersectionObserverProps = {}): {
    isIntersecting: boolean;
    targetRef: (node: Element | null) => void;
} => {
    const frozen = useRef<boolean>(false);

    const observedElement = useRef<Element | null>(null);

    const [isIntersecting, setIsIntersecting] = useState<boolean>(false);

    const observer = useRef<IntersectionObserver | null>(null);

    const callback = useCallback(
        (entries: IntersectionObserverEntry[]) => {
            const [entry] = entries;
            if (entry) {
                setIsIntersecting(entry.isIntersecting);

                if (freezeOnceVisible && entry.isIntersecting) {
                    frozen.current = true;
                }

                if (triggerOnce && entry.isIntersecting) {
                    if (observedElement.current && observer.current) {
                        observer.current.unobserve(observedElement.current);
                    }
                }
            }
        },
        [freezeOnceVisible, triggerOnce],
    );

    const setRef = useCallback((node: Element | null) => {
        if (frozen.current) return;

        if (observedElement.current && observer.current) {
            observer.current.unobserve(observedElement.current);
        }

        observedElement.current = node;

        if (node && observer.current) {
            observer.current.observe(node);
        }
    }, []);

    useEffect(() => {
        if (frozen.current) return;

        observer.current = new IntersectionObserver(callback, {
            root,
            rootMargin,
            threshold,
        });

        if (observedElement.current) {
            observer.current.observe(observedElement.current);
        }

        return () => {
            if (observedElement.current && observer.current) {
                observer.current.unobserve(observedElement.current);
                observer.current.disconnect();
            }
        };
    }, [root, rootMargin, threshold, callback]);

    return {
        isIntersecting,
        targetRef: setRef,
    };
};
