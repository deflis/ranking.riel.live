import {
  DependencyList,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { throttle } from "mabiki";

export const useIntersection = <T extends Element>(): [
  (instance: T | null) => void,
  boolean
] => {
  const [intersecting, setIntersecting] = useState(false);
  const [element, setElement] = useState<T | null>(null);
  const setRef = useCallback((node: T | null) => {
    setElement(node);
  }, []);

  const observer = useMemo(
    () =>
      typeof window !== "undefined"
        ? new IntersectionObserver((entry) => {
            entry.forEach((entry) => setIntersecting(entry.isIntersecting));
          })
        : undefined,
    []
  );

  useEffect(() => {
    const observerRefValue = element;

    if (observerRefValue) {
      observer?.observe(observerRefValue);
    }

    return () => {
      if (observerRefValue) observer?.unobserve(observerRefValue);
    };
  }, [element, observer]);

  return [setRef, intersecting];
};

export const useWaypoint = <T extends Element>(
  callback: () => void,
  limit: number = 1000,
  deps: DependencyList
): [(instance: T | null) => void, () => void] => {
  const [ref, intersection] = useIntersection<T>();

  const throttled = useCallback(
    () => throttle(callback, limit),
    [
      callback,
      limit,
      // eslint-disable-next-line react-hooks/exhaustive-deps
      ...deps,
    ]
  );

  useEffect(() => {
    if (intersection) throttled();
  }, [intersection, throttled]);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  return [ref, useCallback(() => callback, [callback, ...deps])];
};
