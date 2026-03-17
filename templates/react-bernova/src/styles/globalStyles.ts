/**
 * Bernova Global Styles
 * Global CSS classes and element styles
 */

export const GLOBAL_STYLES = [
  {
    targets: 'html, body',
    styles: {
      margin: '0',
      padding: '0',
      font_family: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      font_size: '16px',
      line_height: '1.5',
      color: 'var(--colors-text-primary)',
      background_color: 'var(--colors-background)',
      _webkit_font_smoothing: 'antialiased',
      _moz_osx_font_smoothing: 'grayscale',
    },
  },
  {
    targets: '*',
    styles: {
      box_sizing: 'border-box',
    },
  },
  {
    targets: 'a',
    styles: {
      color: 'var(--colors-primary)',
      text_decoration: 'none',
      transition: 'color 0.2s ease',
    },
  },
  {
    targets: 'button',
    styles: {
      font_family: 'inherit',
      cursor: 'pointer',
    },
  },
  // Utility classes
  {
    targets: '.container',
    styles: {
      max_width: '1200px',
      margin: '0 auto',
      padding: '0 var(--spacing-md)',
    },
  },
  {
    targets: '.flex',
    styles: {
      display: 'flex',
    },
  },
  {
    targets: '.flex-col',
    styles: {
      display: 'flex',
      flex_direction: 'column',
    },
  },
  {
    targets: '.items-center',
    styles: {
      align_items: 'center',
    },
  },
  {
    targets: '.justify-center',
    styles: {
      justify_content: 'center',
    },
  },
  {
    targets: '.gap-sm',
    styles: {
      gap: 'var(--spacing-sm)',
    },
  },
  {
    targets: '.gap-md',
    styles: {
      gap: 'var(--spacing-md)',
    },
  },
  {
    targets: '.gap-lg',
    styles: {
      gap: 'var(--spacing-lg)',
    },
  },
  {
    targets: '.text-center',
    styles: {
      text_align: 'center',
    },
  },
  {
    targets: '.mt-md',
    styles: {
      margin_top: 'var(--spacing-md)',
    },
  },
  {
    targets: '.mb-md',
    styles: {
      margin_bottom: 'var(--spacing-md)',
    },
  },
  {
    targets: '.p-md',
    styles: {
      padding: 'var(--spacing-md)',
    },
  },
];
