'use client';

import { useAppState } from '@/app/AppState';
import { clsx } from 'clsx/lite';

export default function PhotoHalftoneToggle({
  className,
}: {
  className?: string
}) {
  const {
    arePhotoHalftonesEnabled,
    setArePhotoHalftonesEnabled,
  } = useAppState();

  return (
    <div className={clsx(
      'flex justify-end',
      className,
    )}>
      <button
        type="button"
        role="switch"
        aria-checked={arePhotoHalftonesEnabled}
        onClick={() => setArePhotoHalftonesEnabled?.(
          isEnabled => !isEnabled,
        )}
        className={clsx(
          'link group/toggle',
          'inline-flex items-center gap-2',
          'rounded-full bg-dim px-2.5 py-1',
          'text-xs font-medium uppercase tracking-wider',
          arePhotoHalftonesEnabled ? 'text-main' : 'text-medium',
        )}
      >
        <span>Paper</span>
        <span className={clsx(
          'relative h-3.5 w-6 rounded-full',
          'bg-medium transition-colors',
          arePhotoHalftonesEnabled && 'bg-gray-900 dark:bg-gray-100',
        )}>
          <span className={clsx(
            'absolute top-0.5 h-2.5 w-2.5 rounded-full',
            'bg-main transition-transform',
            arePhotoHalftonesEnabled
              ? 'translate-x-3'
              : 'translate-x-0.5',
          )} />
        </span>
      </button>
    </div>
  );
}
