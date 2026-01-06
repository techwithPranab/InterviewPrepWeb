export function getRarityColor(rarity: string): string {
  switch (rarity?.toLowerCase()) {
    case 'common':
      return 'text-gray-500';
    case 'uncommon':
      return 'text-green-500';
    case 'rare':
      return 'text-blue-500';
    case 'epic':
      return 'text-purple-500';
    case 'legendary':
      return 'text-yellow-500';
    default:
      return 'text-gray-500';
  }
}

export function getRarityBgColor(rarity: string): string {
  switch (rarity?.toLowerCase()) {
    case 'common':
      return 'bg-gray-100';
    case 'uncommon':
      return 'bg-green-100';
    case 'rare':
      return 'bg-blue-100';
    case 'epic':
      return 'bg-purple-100';
    case 'legendary':
      return 'bg-yellow-100';
    default:
      return 'bg-gray-100';
  }
}
