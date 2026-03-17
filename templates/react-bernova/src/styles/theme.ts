/**
 * Bernova Theme Styles
 * Component-specific styles using Bernova syntax
 */

export const THEME_STYLES = {
  Button: {
    base: {
      display: 'inline-flex',
      align_items: 'center',
      justify_content: 'center',
      padding: 'var(--spacing-sm) var(--spacing-md)',
      border: 'none',
      border_radius: 'var(--borderRadius-md)',
      font_size: 'var(--fontSize-base)',
      font_weight: 'var(--fontWeight-medium)',
      cursor: 'pointer',
      transition: 'all 0.2s ease',
      outline: 'none',
    },
    variants: {
      primary: {
        background_color: 'var(--colors-primary)',
        color: 'var(--colors-text-inverse)',
        ':hover': {
          opacity: '0.9',
        },
        ':active': {
          opacity: '0.8',
        },
        ':disabled': {
          background_color: 'var(--colors-neutral-300)',
          cursor: 'not-allowed',
        },
      },
      secondary: {
        background_color: 'var(--colors-secondary)',
        color: 'var(--colors-text-inverse)',
        ':hover': {
          opacity: '0.9',
        },
      },
      outline: {
        background_color: 'transparent',
        color: 'var(--colors-primary)',
        border: '1px solid var(--colors-primary)',
        ':hover': {
          background_color: 'var(--colors-primary)',
          color: 'var(--colors-text-inverse)',
        },
      },
    },
    sizes: {
      small: {
        padding: 'var(--spacing-xs) var(--spacing-sm)',
        font_size: 'var(--fontSize-sm)',
      },
      medium: {
        padding: 'var(--spacing-sm) var(--spacing-md)',
        font_size: 'var(--fontSize-base)',
      },
      large: {
        padding: 'var(--spacing-md) var(--spacing-lg)',
        font_size: 'var(--fontSize-lg)',
      },
    },
  },
  Card: {
    base: {
      background_color: 'var(--colors-surface)',
      border_radius: 'var(--borderRadius-lg)',
      padding: 'var(--spacing-lg)',
      box_shadow: 'var(--shadows-md)',
    },
  },
  Input: {
    base: {
      width: '100%',
      padding: 'var(--spacing-sm) var(--spacing-md)',
      border: '1px solid var(--colors-neutral-300)',
      border_radius: 'var(--borderRadius-md)',
      font_size: 'var(--fontSize-base)',
      transition: 'border-color 0.2s ease',
      ':focus': {
        outline: 'none',
        border_color: 'var(--colors-primary)',
      },
      ':disabled': {
        background_color: 'var(--colors-neutral-100)',
        cursor: 'not-allowed',
      },
    },
  },
};
