import { useEffect, useRef } from 'react';

/** Pilha de camadas abertas: Esc fecha só a de cima (ex.: lightbox dentro de um modal). */
const stack: { current: () => void }[] = [];

function onKey(e: KeyboardEvent) {
  if (e.key !== 'Escape' || stack.length === 0) return;
  e.stopPropagation();
  stack[stack.length - 1].current();
}

export function useEscape(handler: () => void) {
  const ref = useRef(handler);
  ref.current = handler;
  useEffect(() => {
    const entry = { current: () => ref.current() };
    if (stack.length === 0) window.addEventListener('keydown', onKey, true);
    stack.push(entry);
    return () => {
      stack.splice(stack.indexOf(entry), 1);
      if (stack.length === 0) window.removeEventListener('keydown', onKey, true);
    };
  }, []);
}
