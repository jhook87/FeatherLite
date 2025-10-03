export type ProductAttributes = {
  finish: 'matte' | 'radiant' | 'satin' | 'luminous' | 'velvet';
  coverage: 'sheer' | 'medium' | 'full' | 'buildable';
  texture: string;
  concerns: string[];
  bestFor: string[];
  popularityScore: number;
};

const PRODUCT_META: Record<string, ProductAttributes> = {
  'weightless-mineral-foundation': {
    finish: 'satin',
    coverage: 'buildable',
    texture: 'Feather-light loose mineral powder',
    concerns: ['sensitivity', 'redness', 'oil-control'],
    bestFor: ['sensitive skin', 'acne-prone skin'],
    popularityScore: 95,
  },
  'silk-veil-setting-powder': {
    finish: 'matte',
    coverage: 'sheer',
    texture: 'Ultra-fine finishing powder',
    concerns: ['shine', 'texture'],
    bestFor: ['combination skin', 'oily skin'],
    popularityScore: 82,
  },
  'luminous-mineral-blush': {
    finish: 'luminous',
    coverage: 'buildable',
    texture: 'Baked mineral duo compact',
    concerns: ['dullness'],
    bestFor: ['all skin types'],
    popularityScore: 76,
  },
  'horizon-eye-quartet': {
    finish: 'radiant',
    coverage: 'medium',
    texture: 'Pressed mineral shadows',
    concerns: ['creasing'],
    bestFor: ['sensitive eyes'],
    popularityScore: 68,
  },
  'sample-foundation': {
    finish: 'velvet',
    coverage: 'buildable',
    texture: 'Loose mineral powder',
    concerns: ['sensitivity', 'oil-control'],
    bestFor: ['sensitive skin'],
    popularityScore: 50,
  },
};

export function getProductMeta(slug: string) {
  return PRODUCT_META[slug];
}
