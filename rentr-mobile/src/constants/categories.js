export const CATEGORIES = [
  { id: 'Electronics',  label: 'Electronics',   icon: 'laptop',          color: '#6366F1' },
  { id: 'Cameras',      label: 'Cameras',        icon: 'camera',          color: '#8B5CF6' },
  { id: 'Tools',        label: 'Tools',          icon: 'hammer',          color: '#F97316' },
  { id: 'Vehicles',     label: 'Vehicles',       icon: 'car',             color: '#3B82F6' },
  { id: 'Sports',       label: 'Sports',         icon: 'football',        color: '#10B981' },
  { id: 'Outdoor',      label: 'Outdoor',        icon: 'leaf',            color: '#059669' },
  { id: 'Clothing',     label: 'Clothing',       icon: 'shirt',           color: '#EC4899' },
  { id: 'Furniture',    label: 'Furniture',      icon: 'bed',             color: '#A16207' },
  { id: 'Music',        label: 'Music',          icon: 'musical-notes',   color: '#DB2777' },
  { id: 'Events',       label: 'Events',         icon: 'balloon',         color: '#F59E0B' },
  { id: 'Garden',       label: 'Garden',         icon: 'flower',          color: '#84CC16' },
  { id: 'Travel',       label: 'Travel',         icon: 'airplane',        color: '#06B6D4' },
  { id: 'Party',         label: 'Party',          icon: 'wine',            color: '#FB923C' },
  { id: 'Appliances',   label: 'Appliances',     icon: 'flash',           color: '#0EA5E9' },
  { id: 'Fitness',      label: 'Fitness',        icon: 'barbell',         color: '#10B981' },
  { id: 'Medical',      label: 'Medical',        icon: 'medkit',          color: '#EF4444' },
];

// Just the label strings — used for filter chips and backend enum
export const CATEGORY_LABELS = CATEGORIES.map((c) => c.label);
