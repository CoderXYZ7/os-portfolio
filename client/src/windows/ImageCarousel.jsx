import { useCarouselIndex } from './useCarouselIndex.js';

export default function ImageCarousel({ slug, images }) {
  const { index, next, prev, goTo } = useCarouselIndex(images.length);

  if (images.length === 0) return null;

  return (
    <div className="mt-3">
      <div className="relative border-2 border-dirty-white">
        <img
          src={`/api/projects/${slug}/images/${images[index]}`}
          alt={`${slug} screenshot ${index + 1}`}
          className="w-full h-48 object-cover"
        />
        <button
          onClick={prev}
          className="absolute left-0 top-0 bottom-0 px-2 bg-graphite/70 text-accent-orange"
          aria-label="previous image"
        >
          ‹
        </button>
        <button
          onClick={next}
          className="absolute right-0 top-0 bottom-0 px-2 bg-graphite/70 text-accent-orange"
          aria-label="next image"
        >
          ›
        </button>
      </div>
      <div className="flex justify-center gap-1 mt-1">
        {images.map((_, i) => (
          <button
            key={i}
            onClick={() => goTo(i)}
            className={`w-2 h-2 border border-dirty-white ${i === index ? 'bg-accent-orange' : ''}`}
            aria-label={`go to image ${i + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
