import { useCallback, useRef } from 'react';
import useStore from '../store';
import { resizeBuffImage } from '../lib/imageUtils';

export function useImageRescaler() {
  const setGroups = useStore((state) => state.updateGroups);

  const timeoutRef = useRef<number | null>(null); //

  const rescaleAllGroups = useCallback(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);

    timeoutRef.current = setTimeout(async () => {
      const freshGroups = useStore.getState().groups;

      const updatedGroups = await Promise.all(
        freshGroups.map(async (group) => {
          const scaleDecimal = group.scale / 100;

          const resizedBuffs = await Promise.all(
            group.buffs.map(async (buff) => ({
              ...buff,
              scaledImageData: await resizeBuffImage(buff.imageData, scaleDecimal),
              scaledDesaturatedImageData: await resizeBuffImage(buff.desaturatedImageData, scaleDecimal),
            }))
          );

          const resizedChildren = await Promise.all(
            (group.children ?? []).map(async (child) => ({
              ...child,
              scaledImageData: await resizeBuffImage(child.imageData, scaleDecimal),
              scaledDesaturatedImageData: await resizeBuffImage(child.desaturatedImageData, scaleDecimal),
            }))
          );

          return {
            ...group,
            buffs: resizedBuffs,
            children: resizedChildren,
          };
        })
      );

      setGroups(updatedGroups);
    }, 1000);
  }, [setGroups]);

  return rescaleAllGroups;
}