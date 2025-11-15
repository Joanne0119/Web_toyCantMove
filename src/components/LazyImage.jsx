import React from 'react';
import { LazyLoadImage } from 'react-lazy-load-image-component';
import 'react-lazy-load-image-component/src/effects/blur.css';

const LazyImage = ({ src, alt, className, eager, ...props }) => (
  <LazyLoadImage
    alt={alt}
    effect="blur"
    src={src}
    className={className}
    visibleByDefault={eager} 
    {...props}
  />
);

export default LazyImage;
