import { ADMIN_STORAGE_DEBUG_ENABLED } from '@/app/config';
import {
  INFINITE_SCROLL_FULL_MULTIPLE,
  Photo,
} from '.';
import PhotosLarge from './PhotosLarge';
import PhotosLargeInfinite from './PhotosLargeInfinite';
import { SortBy } from './sort';
import PhotoHalftoneToggle from './PhotoHalftoneToggle';

export default function PhotoFullPage({
  photos,
  photosCount,
  sortBy,
  sortWithPriority,
  enableHalftoneEffect,
}:{
  photos: Photo[]
  photosCount: number
  sortBy: SortBy
  sortWithPriority: boolean
  enableHalftoneEffect?: boolean
}) {
  const showStorageCheck = ADMIN_STORAGE_DEBUG_ENABLED;
  return (
    <div className="space-y-1">
      {enableHalftoneEffect && <PhotoHalftoneToggle className="pb-3" />}
      <PhotosLarge {...{
        photos,
        showStorageCheck,
        enableHalftoneEffect,
      }} />
      {photosCount > photos.length &&
        <PhotosLargeInfinite
          initialOffset={photos.length}
          itemsPerPage={INFINITE_SCROLL_FULL_MULTIPLE}
          sortBy={sortBy}
          sortWithPriority={sortWithPriority}
          excludeFromFeeds
          showStorageCheck={showStorageCheck}
          enableHalftoneEffect={enableHalftoneEffect}
        />}
    </div>
  );
}
