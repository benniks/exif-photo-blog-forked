'use client';

import { IMAGE_WIDTH_MEDIUM } from '@/components/image';
import { HalftoneCmyk } from '@paper-design/shaders-react';
import { clsx } from 'clsx/lite';

const SHADER_IMAGE_WIDTH = 640;
const SHADER_IMAGE_QUALITY = 75;

const shaderImageUrlForSrc = (src: string) =>
  src.startsWith('data:')
    ? src
    : `/_next/image?url=${encodeURIComponent(src)}` +
      `&w=${SHADER_IMAGE_WIDTH}&q=${SHADER_IMAGE_QUALITY}`;

export default function PhotoHalftoneOverlay({
  src,
  className,
}: {
  src: string
  className?: string
}) {
  return (
    <HalftoneCmyk
      image={shaderImageUrlForSrc(src)}
      fit="cover"
      width="100%"
      height="100%"
      maxPixelCount={IMAGE_WIDTH_MEDIUM * IMAGE_WIDTH_MEDIUM}
      colorBack="#f2f1e8"
      colorC="#6f7f82"
      colorM="#8f6565"
      colorY="#d7bd67"
      colorK="#2a2622"
      size={0.18}
      contrast={1.35}
      softness={0.35}
      grainSize={0.45}
      grainMixer={0.12}
      grainOverlay={0.22}
      gridNoise={0.5}
      floodC={0.04}
      floodM={0.02}
      floodY={0.02}
      floodK={0.08}
      gainC={0}
      gainM={0}
      gainY={0}
      gainK={0.05}
      type="dots"
      className={clsx(
        'absolute inset-0 pointer-events-none',
        'opacity-100 group-hover:opacity-0',
        'transition-opacity duration-300 ease-out',
        className,
      )}
    />
  );
}
