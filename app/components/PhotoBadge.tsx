'use client';

import { useState } from 'react';
import { createPortal } from 'react-dom';
import Image from 'next/image';

interface Props {
  name: string;
  imagePath: string | null;
  className?: string;
  style?: React.CSSProperties;
  title?: string;
}

export default function PhotoBadge({ name, imagePath, className, style, title }: Props) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <span
        className={`photo-badge${imagePath ? ' photo-badge-clickable' : ''} ${className ?? ''}`}
        style={style}
        title={title}
        onClick={imagePath ? () => setOpen(true) : undefined}
        role={imagePath ? 'button' : undefined}
      >
        {name}
      </span>
      {open && imagePath && typeof window !== 'undefined' && createPortal(
        <div className="lightbox-overlay" onClick={() => setOpen(false)}>
          <Image
            src={imagePath}
            alt={name}
            fill
            style={{ objectFit: 'contain', padding: '24px' }}
          />
          <div className="lightbox-caption">{name}</div>
          <button className="lightbox-close" onClick={() => setOpen(false)}>✕</button>
        </div>,
        document.body
      )}
    </>
  );
}
