// Parse shopping list input and extract amount, unit, and item
export function parseShoppingItem(input: string): {
  amount?: string;
  unit?: string;
  text: string;
}[] {
  const items: { amount?: string; unit?: string; text: string }[] = [];

  // Split by "och" to handle multiple items in one input
  const parts = input.split(/\s+och\s+/i);

  for (const part of parts) {
    const trimmed = part.trim();
    if (!trimmed) continue;

    // Pattern: [amount] [unit] item
    // Examples: "4 apelsiner", "399g bajs", "2 kg äpplen", "fem kiwi"
    const match = trimmed.match(/^(\d+[,.]?\d*|\d+-\d+|en|ett|två|tre|fyra|fem|sex|sju|åtta|nio|tio)\s*([a-zåäö]+)?\s+(.+)$/i);

    if (match) {
      const [, rawAmount, possibleUnit, item] = match;

      // Normalize Swedish numbers to digits
      const amount = normalizeAmount(rawAmount);

      // Check if possibleUnit is actually a unit
      const unit = normalizeUnit(possibleUnit);

      // If possibleUnit wasn't a unit, include it in the item name
      const text = unit ? item : (possibleUnit ? `${possibleUnit} ${item}` : item);

      items.push({
        amount,
        unit,
        text: text.trim()
      });
    } else {
      // No amount/unit found, just add as-is
      items.push({ text: trimmed });
    }
  }

  return items.length > 0 ? items : [{ text: input.trim() }];
}

function normalizeAmount(amount: string): string {
  const swedishNumbers: Record<string, string> = {
    'en': '1',
    'ett': '1',
    'två': '2',
    'tre': '3',
    'fyra': '4',
    'fem': '5',
    'sex': '6',
    'sju': '7',
    'åtta': '8',
    'nio': '9',
    'tio': '10'
  };

  const lower = amount.toLowerCase();
  return swedishNumbers[lower] || amount.replace(',', '.');
}

function normalizeUnit(unit?: string): string | undefined {
  if (!unit) return undefined;

  const lower = unit.toLowerCase();

  // Map common units and variations
  const unitMap: Record<string, string> = {
    'st': 'st',
    'stycken': 'st',
    'styck': 'st',
    'kg': 'kg',
    'kilo': 'kg',
    'g': 'g',
    'gram': 'g',
    'hg': 'hg',
    'hekto': 'hg',
    'l': 'l',
    'liter': 'l',
    'dl': 'dl',
    'deciliter': 'dl',
    'ml': 'ml',
    'msk': 'msk',
    'matsked': 'msk',
    'tsk': 'tsk',
    'tesked': 'tsk',
    'krm': 'krm',
    'påse': 'påse',
    'påsar': 'påse',
    'burk': 'burk',
    'burkar': 'burk',
    'paket': 'paket',
    'förp': 'förp',
    'förpackning': 'förp'
  };

  return unitMap[lower];
}

// Format for display
export function formatShoppingItem(todo: {
  amount?: string;
  unit?: string;
  text: string;
}): string {
  const parts: string[] = [];

  if (todo.amount) {
    parts.push(todo.amount);
  }

  if (todo.unit) {
    parts.push(todo.unit);
  }

  parts.push(todo.text);

  return parts.join(' ');
}
