"use client";

import Button from "@gratia/ui/components/Button";
import Dropdown, { type DropdownOption } from "@gratia/ui/components/Dropdown";
import IconThreeDotsVertical from "@gratia/ui/icons/IconThreeDotsVertical";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import HeaderCategoryLinkItem from "./HeaderCategoryLinkItem";

import styles from "./HeaderCategoryLinks.module.scss";

interface Link {
  title: string;
  href: string;
}

interface HeaderCategoryLinksClientProps {
  links: Link[];
  className?: string;
}

export default function HeaderCategoryLinksClient({
  links,
  className = "",
}: HeaderCategoryLinksClientProps) {
  const router = useRouter();
  const containerRef = useRef<HTMLElement>(null);
  const linkWidthsRef = useRef<number[]>([]);
  const [visibleCount, setVisibleCount] = useState(links.length);
  const [isMeasured, setIsMeasured] = useState(false);

  useEffect(() => {
    const container = containerRef.current;
    if (!container || isMeasured) return;

    const timer = setTimeout(() => {
      const children = Array.from(container.children) as HTMLElement[];
      const widths: number[] = [];

      children.forEach((child) => {
        if (child.classList.contains(styles.moreButtonWrapper)) return;

        widths.push(child.offsetWidth);
      });

      linkWidthsRef.current = widths;
      setIsMeasured(true);
    }, 0);

    return () => clearTimeout(timer);
  }, [isMeasured]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container || !isMeasured) return;

    const calculateVisibleItems = () => {
      const containerWidth = container.offsetWidth;
      const moreButtonWidth = 48;
      const gap = 16;
      let availableWidth = containerWidth;
      let count = 0;

      for (let i = 0; i < linkWidthsRef.current.length; i++) {
        const itemWidth = linkWidthsRef.current[i] + gap;

        const needsMoreButton = i < linkWidthsRef.current.length - 1;
        const requiredWidth = needsMoreButton
          ? itemWidth + moreButtonWidth
          : itemWidth;

        if (availableWidth >= requiredWidth) {
          availableWidth -= itemWidth;
          count++;
        } else {
          break;
        }
      }

      if (count === links.length) {
        setVisibleCount(links.length);
      } else {
        setVisibleCount(Math.max(0, count));
      }
    };

    calculateVisibleItems();

    const resizeObserver = new ResizeObserver(() => {
      calculateVisibleItems();
    });

    resizeObserver.observe(container);

    return () => {
      resizeObserver.disconnect();
    };
  }, [links.length, isMeasured]);

  const visibleLinks = links.slice(0, visibleCount);
  const hiddenLinks = links.slice(visibleCount);
  const hasHiddenLinks = hiddenLinks.length > 0;

  const dropdownOptions: DropdownOption[] = hiddenLinks.map((link) => ({
    value: link.href,
    label: link.title,
  }));

  const handleDropdownChange = (value: string) => {
    router.push(value);
  };

  if (!isMeasured) {
    return (
      <nav
        ref={containerRef}
        className={`${styles.container} ${className}`}
        style={{ visibility: "hidden" }}
      >
        {links.map((link) => (
          <HeaderCategoryLinkItem key={link.href} href={link.href}>
            {link.title}
          </HeaderCategoryLinkItem>
        ))}
      </nav>
    );
  }

  return (
    <nav ref={containerRef} className={`${styles.container} ${className}`}>
      {visibleLinks.map((link) => (
        <HeaderCategoryLinkItem key={link.href} href={link.href}>
          {link.title}
        </HeaderCategoryLinkItem>
      ))}

      {hasHiddenLinks && (
        <div className={styles.moreButtonWrapper}>
          <Dropdown
            options={dropdownOptions}
            onValueChange={handleDropdownChange}
            placeholder=""
            customTrigger={
              <Button variant="ghost" ariaLabel="More categories" size="sm">
                <IconThreeDotsVertical />
              </Button>
            }
          />
        </div>
      )}
    </nav>
  );
}
