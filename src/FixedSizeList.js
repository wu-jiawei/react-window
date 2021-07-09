// @flow

import createListComponent from './createListComponent';

import type { Props, ScrollToAlign } from './createListComponent';

const FixedSizeList = createListComponent({
  getItemOffset: ({ itemSize }: Props<any>, index: number): number =>
    index * ((itemSize: any): number),

  getItemSize: ({ itemSize }: Props<any>, index: number): number =>
    ((itemSize: any): number),

  getEstimatedTotalSize: ({ itemCount, itemSize }: Props<any>) =>
    ((itemSize: any): number) * itemCount,

  getOffsetForIndexAndAlignment: (
    { direction, height, itemCount, itemSize, layout, width }: Props<any>,
    index: number,
    align: ScrollToAlign,
    scrollOffset: number
  ): number => {
    // TODO Deprecate direction "horizontal"
    const isHorizontal = direction === 'horizontal' || layout === 'horizontal';
    const size = (((isHorizontal ? width : height): any): number);

    /**
     * the max possible offset for all the items.
     * Note that the offset of the last item should be the same with all those last
     * items that can reside in the same window with the last item.
     * When the bottom line of the last item coincides with the top line of the
     * window, the offset is itemCount * itemSize, so when the bottom line of the
     * last item coincides with the bottom line of the window (as should it),
     * the offset should be subtracted with size.
     */
    const lastItemOffset = Math.max(
      0,
      itemCount * ((itemSize: any): number) - size
    );

    /**
     * when the top line of the item coincides with that of the window
     */
    const maxOffset = Math.min(
      lastItemOffset,
      index * ((itemSize: any): number)
    );

    /**
     * when the bottom line of the item coincides with that of the window
     */
    const minOffset = Math.max(
      0,
      index * ((itemSize: any): number) - size + ((itemSize: any): number)
    );

    if (align === 'smart') {
      if (
        scrollOffset >= minOffset - size &&
        scrollOffset <= maxOffset + size
      ) {
        align = 'auto';
      } else {
        align = 'center';
      }
    }

    switch (align) {
      case 'start':
        return maxOffset;
      case 'end':
        return minOffset;
      case 'center': {
        // "Centered" offset is usually the average of the min and max.
        // But near the edges of the list, this doesn't hold true.
        const middleOffset = Math.round(
          minOffset + (maxOffset - minOffset) / 2
        );
        if (middleOffset < Math.ceil(size / 2)) {
          return 0; // near the beginning
        } else if (middleOffset > lastItemOffset + Math.floor(size / 2)) {
          return lastItemOffset; // near the end
        } else {
          return middleOffset;
        }
      }
      case 'auto':
      default:
        if (scrollOffset >= minOffset && scrollOffset <= maxOffset) {
          return scrollOffset;
        } else if (scrollOffset < minOffset) {
          return minOffset;
        } else {
          return maxOffset;
        }
    }
  },

  /**
   * offset: offset to the start of the list.
   */
  getStartIndexForOffset: (
    { itemCount, itemSize }: Props<any>,
    offset: number
  ): number =>
    Math.max(
      0,
      Math.min(itemCount - 1, Math.floor(offset / ((itemSize: any): number)))
    ),

  /**
   * startIndex is the index of the item residing on the top of the current window
   */
  getStopIndexForStartIndex: (
    { direction, height, itemCount, itemSize, layout, width }: Props<any>,
    startIndex: number,
    scrollOffset: number
  ): number => {
    // TODO Deprecate direction "horizontal"
    const isHorizontal = direction === 'horizontal' || layout === 'horizontal';
    const offset = startIndex * ((itemSize: any): number);
    const size = (((isHorizontal ? width : height): any): number);
    const numVisibleItems = Math.ceil(
      (size + scrollOffset - offset) / ((itemSize: any): number)
    );
    return Math.max(
      0,
      Math.min(
        itemCount - 1,
        startIndex + numVisibleItems - 1 // -1 is because stop index is inclusive
      )
    );
  },

  initInstanceProps(props: Props<any>): any {
    // Noop
  },

  shouldResetStyleCacheOnItemSizeChange: true,

  validateProps: ({ itemSize }: Props<any>): void => {
    if (process.env.NODE_ENV !== 'production') {
      if (typeof itemSize !== 'number') {
        throw Error(
          'An invalid "itemSize" prop has been specified. ' +
            'Value should be a number. ' +
            `"${itemSize === null ? 'null' : typeof itemSize}" was specified.`
        );
      }
    }
  },
});

export default FixedSizeList;
