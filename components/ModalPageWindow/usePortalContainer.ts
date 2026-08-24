import { useEffect, useState } from 'react';

export const usePortalContainer = (selector: string): HTMLDivElement | null => {
  const [portalContainerElement, setPortalContainerElement] = useState<HTMLDivElement | null>(null);

  useEffect(() => {
    const portalContainer = document.body.querySelector<HTMLDivElement>(`.${selector}`);

    const element =
      portalContainer ??
      (() => {
        const newPortalContainer = document.createElement('div');

        newPortalContainer.className = selector;
        document.body.append(newPortalContainer);

        return newPortalContainer;
      })();

    queueMicrotask(() => {
      setPortalContainerElement(element);
    });
  }, [selector]);

  return portalContainerElement;
};
