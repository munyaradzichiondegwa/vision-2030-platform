import { useRef, useEffect } from 'react';

function shallowCompare(
  nextValue: any, 
  prevValue: any
): boolean {
  if (nextValue === prevValue) return true;
  
  if (typeof nextValue !== 'object' || typeof prevValue !== 'object') {
    return false;
  }

  const nextKeys = Object.keys(nextValue);
  const prevKeys = Object.keys(prevValue);

  if (nextKeys.length !== prevKeys.length) return false;

  return nextKeys.every(
    key => nextValue[key] === prevValue[key]
  );
}

function useShallowCompareEffect(
  effect: () => void, 
  dependencies: any[]
) {
  const prevDepsRef = useRef<any[]>();

  useEffect(() => {
    const shouldUpdate = !prevDepsRef.current || 
      !shallowCompare(dependencies, prevDepsRef.current);

    if (shouldUpdate) {
      effect();
      prevDepsRef.current = dependencies;
    }
  }, dependencies);
}

export default useShallowCompareEffect;