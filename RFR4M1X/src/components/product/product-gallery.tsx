import { useState } from 'react';

type ProductGalleryProps = {
  images: string[];
  alt: string;
};

export const ProductGallery = ({ images, alt }: ProductGalleryProps) => {
  const [activeImage, setActiveImage] = useState(images[0]);

  return (
    <div className="grid gap-4 lg:grid-cols-[100px_minmax(0,1fr)]">
      <div className="order-2 flex gap-3 overflow-x-auto lg:order-1 lg:flex-col">
        {images.map((image) => (
          <button
            key={image}
            type="button"
            onClick={() => setActiveImage(image)}
            className={`overflow-hidden rounded-2xl border ${
              activeImage === image
                ? 'border-ink'
                : 'border-black/10'
            }`}
          >
            <img src={image} alt={alt} className="h-24 w-20 object-cover" />
          </button>
        ))}
      </div>
      <div className="order-1 overflow-hidden rounded-[32px] bg-black/5">
        <div className="group relative aspect-[4/5] overflow-hidden">
          <img
            src={activeImage}
            alt={alt}
            className="h-full w-full object-cover transition duration-700 group-hover:scale-110"
          />
        </div>
      </div>
    </div>
  );
};
