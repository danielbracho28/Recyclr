import { Guidance } from '../types';

const guidanceData: { [key: string]: Guidance } = {
  "Paper": {
    recyclingInstructions: "Put paper in your local recycling bin or take it to a community recycling center. Make sure it’s clean (no food stains, no greasy pizza boxes) before recycling.",
    environmentalImpact: "When thrown away, paper waste piles up in landfills, where it rots and releases methane gas, a strong greenhouse gas. Cutting more trees for new paper also harms forests and wildlife.",
    reuseSuggestions: [
      "Use scrap paper for notes or lists.",
      "Shred paper for packaging or compost.",
      "Turn old newspapers into cleaning wipes for windows."
    ]
  },
  "Plastic": {
    recyclingInstructions: "Rinse and place them in the plastic recycling bin, or drop them off at recycling collection points in supermarkets or local centers. Remove caps if your recycling program requires it.",
    environmentalImpact: "Plastic bottles that end up in nature can take up to 450 years to break down. They clog waterways, kill marine animals that mistake them for food, and release microplastics that contaminate soil, water, and even our food.",
    reuseSuggestions: [
      "Cut and use as plant pots or watering funnels.",
      "Turn into DIY storage containers.",
      "Refill and use for arts, crafts, or science projects."
    ]
  },
  "Cans": {
    recyclingInstructions: "Rinse and put cans into the metal recycling bin. You can also take them to scrap metal collection points where they may even pay you for the material.",
    environmentalImpact: "If thrown away, cans take 200–500 years to decompose. Mining new aluminum and steel uses huge amounts of energy and causes air and water pollution, making recycling much cleaner for the planet.",
    reuseSuggestions: [
      "Use cleaned cans as pen holders or mini planters.",
      "Craft lanterns, candle holders, or organizers.",
      "Flatten and use in DIY art or decoration projects."
    ]
  }
};

/**
 * Fetches recycling guidance for a given item from a local data source.
 * @param {string} itemName - The name of the item (e.g., "Paper", "Cans").
 * @returns {Promise<Guidance | null>} A promise resolving to the guidance object or a fallback.
 */
export async function fetchRecyclingGuidance(itemName: string): Promise<Guidance | null> {
  // Simulate a network request to ensure the UI's loading spinner displays correctly.
  return new Promise(resolve => {
    setTimeout(() => {
      const guidance = guidanceData[itemName];
      
      if (guidance) {
        resolve(guidance);
      } else {
        console.warn(`No static guidance found for "${itemName}". Providing a fallback.`);
        // Provide a generic fallback for unrecognized items.
        resolve({
          recyclingInstructions: "General recycling guidelines apply. Please check with your local recycling provider for specific instructions.",
          environmentalImpact: "Recycling is crucial for conserving natural resources, saving energy, and reducing landfill waste.",
          reuseSuggestions: ["Consider if this item can be repurposed or donated before recycling or discarding."]
        });
      }
    }, 300); // A short delay to mimic fetching data.
  });
}