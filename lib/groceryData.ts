export interface GroceryItem {
  name: string;
  category: string;
  aliases?: string[]; // Alternative names/spellings
  common: boolean; // True for most common items
}

export const groceryData: GroceryItem[] = [
  // Mejeri (most common first)
  { name: "mjölk", category: "Mejeri", common: true },
  { name: "filmjölk", category: "Mejeri", common: true },
  { name: "yoghurt", category: "Mejeri", common: true },
  { name: "smör", category: "Mejeri", common: true },
  { name: "margarin", category: "Mejeri", common: true },
  { name: "ost", category: "Mejeri", common: true },
  { name: "grädde", category: "Mejeri", common: true },
  { name: "kvarg", category: "Mejeri", common: true },
  { name: "creme fraiche", category: "Mejeri", aliases: ["créme fraiche", "creme"], common: true },
  { name: "philadelphia", category: "Mejeri", common: false },

  // Frukt
  { name: "bananer", category: "Frukt", aliases: ["banan"], common: true },
  { name: "äpplen", category: "Frukt", aliases: ["äpple"], common: true },
  { name: "apelsiner", category: "Frukt", aliases: ["apelsin"], common: true },
  { name: "päron", category: "Frukt", common: true },
  { name: "kiwi", category: "Frukt", common: true },
  { name: "vindruvor", category: "Frukt", common: true },
  { name: "clementin", category: "Frukt", aliases: ["clementiner"], common: true },
  { name: "melon", category: "Frukt", common: true },
  { name: "mango", category: "Frukt", common: true },
  { name: "ananas", category: "Frukt", common: true },
  { name: "jordgubbar", category: "Frukt", common: true },
  { name: "blåbär", category: "Frukt", common: true },
  { name: "hallon", category: "Frukt", common: true },
  { name: "avokado", category: "Frukt", common: true },

  // Grönsaker
  { name: "tomater", category: "Grönsaker", aliases: ["tomat"], common: true },
  { name: "gurka", category: "Grönsaker", common: true },
  { name: "paprika", category: "Grönsaker", common: true },
  { name: "lök", category: "Grönsaker", common: true },
  { name: "vitlök", category: "Grönsaker", common: true },
  { name: "morötter", category: "Grönsaker", aliases: ["morot"], common: true },
  { name: "potatis", category: "Grönsaker", common: true },
  { name: "sallad", category: "Grönsaker", common: true },
  { name: "broccoli", category: "Grönsaker", common: true },
  { name: "blomkål", category: "Grönsaker", common: true },
  { name: "spenat", category: "Grönsaker", common: true },
  { name: "zucchini", category: "Grönsaker", common: true },
  { name: "aubergine", category: "Grönsaker", common: true },
  { name: "majs", category: "Grönsaker", common: true },
  { name: "ärtor", category: "Grönsaker", common: true },
  { name: "böror", category: "Grönsaker", common: true },

  // Kött & Fisk
  { name: "köttfärs", category: "Kött & Fisk", common: true },
  { name: "kycklingfilé", category: "Kött & Fisk", aliases: ["kyckling"], common: true },
  { name: "bacon", category: "Kött & Fisk", common: true },
  { name: "korv", category: "Kött & Fisk", common: true },
  { name: "köttbullar", category: "Kött & Fisk", common: true },
  { name: "falukorv", category: "Kött & Fisk", common: true },
  { name: "fläskfilé", category: "Kött & Fisk", common: true },
  { name: "lax", category: "Kött & Fisk", common: true },
  { name: "torsk", category: "Kött & Fisk", common: true },

  // Bröd & Spannmål
  { name: "bröd", category: "Bröd & Spannmål", common: true },
  { name: "frukostflingor", category: "Bröd & Spannmål", aliases: ["flingor"], common: true },
  { name: "pasta", category: "Bröd & Spannmål", common: true },
  { name: "ris", category: "Bröd & Spannmål", common: true },
  { name: "havregryn", category: "Bröd & Spannmål", common: true },
  { name: "mjöl", category: "Bröd & Spannmål", common: true },
  { name: "müsli", category: "Bröd & Spannmål", common: true },

  // Skafferi
  { name: "socker", category: "Skafferi", common: true },
  { name: "salt", category: "Skafferi", common: true },
  { name: "peppar", category: "Skafferi", common: true },
  { name: "olivolja", category: "Skafferi", common: true },
  { name: "rapsolja", category: "Skafferi", common: true },
  { name: "ättika", category: "Skafferi", common: true },
  { name: "ketchup", category: "Skafferi", common: true },
  { name: "majonnäs", category: "Skafferi", common: true },
  { name: "senap", category: "Skafferi", common: true },
  { name: "soja", category: "Skafferi", aliases: ["sojasås"], common: true },
  { name: "honung", category: "Skafferi", common: true },
  { name: "sylt", category: "Skafferi", common: true },
  { name: "kaffe", category: "Skafferi", common: true },
  { name: "te", category: "Skafferi", common: true },

  // Konserver & Burkar
  { name: "tomatkross", category: "Konserver", common: true },
  { name: "tonfisk", category: "Konserver", common: true },
  { name: "kikärtor", category: "Konserver", common: true },
  { name: "majs burk", category: "Konserver", common: true },
  { name: "kokosmjölk", category: "Konserver", common: true },

  // Dryck
  { name: "juice", category: "Dryck", common: true },
  { name: "läsk", category: "Dryck", common: true },
  { name: "vatten", category: "Dryck", common: true },
  { name: "öl", category: "Dryck", common: true },
  { name: "vin", category: "Dryck", common: true },

  // Hygien & Städ
  { name: "toalettpapper", category: "Hygien", aliases: ["toapapper"], common: true },
  { name: "diskmedel", category: "Hygien", common: true },
  { name: "tvål", category: "Hygien", common: true },
  { name: "schampo", category: "Hygien", common: true },
  { name: "tandkräm", category: "Hygien", common: true },

  // Godis & Snacks
  { name: "chips", category: "Snacks", common: true },
  { name: "choklad", category: "Snacks", common: true },
  { name: "godis", category: "Snacks", common: true },
  { name: "popcorn", category: "Snacks", common: true },
  { name: "nötter", category: "Snacks", common: true },
];

// Search function with fuzzy matching
export function searchGroceries(query: string, limit: number = 5): GroceryItem[] {
  if (!query || query.length < 2) return [];

  const normalizedQuery = query.toLowerCase().trim();

  // Score each item
  const scored = groceryData.map(item => {
    let score = 0;
    const itemName = item.name.toLowerCase();

    // Exact match (highest priority)
    if (itemName === normalizedQuery) {
      score = 1000;
    }
    // Starts with query
    else if (itemName.startsWith(normalizedQuery)) {
      score = 100 + (item.common ? 50 : 0);
    }
    // Contains query
    else if (itemName.includes(normalizedQuery)) {
      score = 50 + (item.common ? 25 : 0);
    }
    // Check aliases
    else if (item.aliases?.some(alias => alias.toLowerCase().includes(normalizedQuery))) {
      score = 40 + (item.common ? 20 : 0);
    }

    // Boost common items slightly
    if (item.common && score > 0) {
      score += 10;
    }

    return { item, score };
  });

  // Filter and sort by score
  return scored
    .filter(s => s.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map(s => s.item);
}
