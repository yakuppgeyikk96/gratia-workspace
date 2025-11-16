"use client";

import classNames from "classnames";
import styles from "./Pagination.module.scss";

export interface PaginationInfo {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

interface PaginationProps {
  pagination: PaginationInfo;
  onPaginationChange: (page: number) => void;
  className?: string;
}

export default function Pagination({
  pagination,
  onPaginationChange,
  className,
}: PaginationProps) {
  const { page, totalPages } = pagination;

  const getVisiblePages = () => {
    const delta = 2;
    const range = [];
    const rangeWithDots = [];

    for (
      let i = Math.max(2, page - delta);
      i <= Math.min(totalPages - 1, page + delta);
      i++
    ) {
      range.push(i);
    }

    if (page - delta > 2) {
      rangeWithDots.push(1, "...");
    } else {
      rangeWithDots.push(1);
    }

    rangeWithDots.push(...range);

    if (page + delta < totalPages - 1) {
      rangeWithDots.push("...", totalPages);
    } else if (totalPages > 1) {
      rangeWithDots.push(totalPages);
    }

    return rangeWithDots;
  };

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages && newPage !== page) {
      onPaginationChange(newPage);
    }
  };

  if (totalPages <= 1) {
    return null;
  }

  const visiblePages = getVisiblePages();
  // const isPrevDisabled = page <= 1;
  // const isNextDisabled = page >= totalPages;

  return (
    <nav
      className={classNames(styles.pagination, className)}
      aria-label="Pagination"
    >
      <div className={styles.paginationContainer}>
        {/* <button
          type="button"
          onClick={() => handlePageChange(page - 1)}
          className={classNames(styles.pageButton, styles.prevButton, {
            [styles.disabled as string]: isPrevDisabled,
          })}
          aria-label="Previous page"
          aria-disabled={isPrevDisabled}
          disabled={isPrevDisabled}
        >
          <IconChevronLeft size={16} />
        </button> */}

        <div className={styles.pageNumbers}>
          {visiblePages.map((pageNum, index) => {
            if (pageNum === "...") {
              return (
                <span key={`ellipsis-${index}`} className={styles.ellipsis}>
                  ...
                </span>
              );
            }

            const pageNumber = pageNum as number;
            const isActive = pageNumber === page;

            return (
              <button
                key={pageNumber}
                type="button"
                onClick={() => handlePageChange(pageNumber)}
                className={classNames(styles.pageButton, styles.numberButton, {
                  [styles.active as string]: isActive,
                })}
                aria-label={`Go to page ${pageNumber}`}
                aria-current={isActive ? "page" : undefined}
              >
                {pageNumber}
              </button>
            );
          })}
        </div>

        {/* <button
          type="button"
          onClick={() => handlePageChange(page + 1)}
          className={classNames(styles.pageButton, styles.nextButton, {
            [styles.disabled as string]: isNextDisabled,
          })}
          aria-label="Next page"
          aria-disabled={isNextDisabled}
          disabled={isNextDisabled}
        >
          <IconChevronRight size={16} />
        </button> */}
      </div>
    </nav>
  );
}
