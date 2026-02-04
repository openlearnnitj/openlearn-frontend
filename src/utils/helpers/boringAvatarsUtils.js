/**
 * Boring Avatars Utilities
 * Pure JavaScript functions for avatar generation
 */

// Color palettes for different avatar styles
const colorPalettes = {
  default: ['#92A1C6', '#146A7C', '#F0AB3D', '#C271B4', '#C20D90'],
  warm: ['#F4A460', '#FF6347', '#FFD700', '#FF69B4', '#DC143C'],
  cool: ['#4682B4', '#20B2AA', '#9370DB', '#3CB371', '#6495ED'],
  earth: ['#8B4513', '#A0522D', '#CD853F', '#DEB887', '#F4A460'],
  ocean: ['#00CED1', '#4682B4', '#1E90FF', '#00BFFF', '#87CEEB'],
  sunset: ['#FF6B35', '#F7931E', '#FFD23F', '#06FFA5', '#B19CD9']
};

/**
 * Generate a hash from a string
 */
export const hashCode = (str) => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash);
};

/**
 * Get consistent colors based on seed
 */
export const getColors = (seed, palette = 'default') => {
  const colors = colorPalettes[palette] || colorPalettes.default;
  const hash = hashCode(seed);
  
  return {
    background: colors[hash % colors.length],
    accent: colors[(hash + 1) % colors.length],
    secondary: colors[(hash + 2) % colors.length]
  };
};

/**
 * Generate initials from a name
 */
export const generateInitials = (name) => {
  if (!name) return 'AN';
  
  const words = name.trim().split(' ');
  if (words.length === 1) {
    return words[0].substring(0, 2).toUpperCase();
  }
  
  return (words[0][0] + words[words.length - 1][0]).toUpperCase();
};

/**
 * Get available avatar styles
 */
export const getAvailableStyles = () => [
  'bauhaus',    // Geometric shapes
  'beam',       // Colorful beams
  'marble',     // Organic shapes
  'initials'    // Letter-based
];

/**
 * Get available color palettes
 */
export const getAvailablePalettes = () => Object.keys(colorPalettes);

/**
 * Unicode-safe Base64 encoding for SVG data URLs
 */
const unicodeSafeBase64 = (str) => {
  // Use UTF-8 encoding to handle all Unicode characters
  return btoa(encodeURIComponent(str).replace(/%([0-9A-F]{2})/g, (match, p1) => {
    return String.fromCharCode('0x' + p1);
  }));
};

/**
 * Utility function to generate avatar URL (for compatibility with existing code)
 * Creates a simple initials-based SVG as data URL
 */
export const generateBoringAvatarUrl = (seed, size = 64) => {
  const initials = generateInitials(seed);
  const { background } = getColors(seed);
  
  const svg = `<svg width="${size}" height="${size}" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
    <rect width="100" height="100" fill="${background}" rx="50"/>
    <text x="50" y="50" text-anchor="middle" dominant-baseline="central" font-size="32" font-weight="bold" fill="white" font-family="system-ui,sans-serif">
      ${initials}
    </text>
  </svg>`;
  
  return `data:image/svg+xml;base64,${unicodeSafeBase64(svg)}`;
};

/**
 * Generate user avatar URL with fallback
 */
export const getUserBoringAvatarUrl = (user, size = 64) => {
  if (!user) {
    return generateBoringAvatarUrl('anonymous-user', size);
  }
  
  const seed = user.name || user.email || user.id || 'anonymous-user';
  return generateBoringAvatarUrl(seed, size);
};

/**
 * Generate avatar URL based on service
 */
export const generateAvatarUrl = (seed, service = 'boring', style = 'bauhaus', size = 64) => {
  switch (service) {
    case 'boring': {
      return getUserBoringAvatarUrl({ name: seed }, size);
    }
    case 'dicebear': {
      const cleanSeed = encodeURIComponent(seed.toLowerCase().trim());
      return `https://api.dicebear.com/7.x/${style}/svg?seed=${cleanSeed}&size=${size}&backgroundColor=transparent`;
    }
    case 'ui-avatars': {
      return `https://ui-avatars.com/api/?name=${encodeURIComponent(seed)}&size=${size}&background=random`;
    }
    default:
      return getUserBoringAvatarUrl({ name: seed }, size);
  }
};

/**
 * Get user avatar URL with service selection
 */
export const getUserAvatarUrl = (user, service = 'boring', style = 'bauhaus', size = 64) => {
  if (!user) {
    return generateAvatarUrl('anonymous-user', service, style, size);
  }
  
  const seed = user.name || user.email || user.id || 'anonymous-user';
  return generateAvatarUrl(seed, service, style, size);
};
