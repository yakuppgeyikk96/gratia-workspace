import useEmblaCarousel from "embla-carousel-react";
import { useCallback, useEffect, useRef } from "react";

type EmblaApi = ReturnType<typeof useEmblaCarousel>[1];

interface UseEmblaAutoplayOptions {
  emblaApi: EmblaApi;
  interval: number;
  enabled: boolean;
}

export function useEmblaAutoplay({
  emblaApi,
  interval,
  enabled,
}: UseEmblaAutoplayOptions) {
  const autoplayRef = useRef<NodeJS.Timeout | null>(null);

  const autoplay = useCallback(() => {
    if (!emblaApi) return;

    if (emblaApi.canScrollNext()) {
      emblaApi.scrollNext();
    } else {
      emblaApi.scrollTo(0);
    }
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi || !enabled) return;

    const startAutoplay = () => {
      if (autoplayRef.current) {
        clearInterval(autoplayRef.current);
      }
      autoplayRef.current = setInterval(autoplay, interval);
    };

    const stopAutoplay = () => {
      if (autoplayRef.current) {
        clearInterval(autoplayRef.current);
        autoplayRef.current = null;
      }
    };

    startAutoplay();

    const emblaNode = emblaApi.rootNode();
    emblaNode.addEventListener("mouseenter", stopAutoplay);
    emblaNode.addEventListener("mouseleave", startAutoplay);

    return () => {
      stopAutoplay();
      emblaNode.removeEventListener("mouseenter", stopAutoplay);
      emblaNode.removeEventListener("mouseleave", startAutoplay);
    };
  }, [emblaApi, autoplay, interval, enabled]);
}
