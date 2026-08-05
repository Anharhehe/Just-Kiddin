export type Product = {
  id: string;
  name: string;
  pricePkr: number;
  imageUrl: string;
  description: string;
  tags: string[];
};

export const products: Product[] = [
  {
    id: "tod-boy-hoodie-01",
    name: "Comfy Dino Hoodie",
    pricePkr: 2199,
    imageUrl: "https://zimysonline.com/cdn/shop/files/1_859cffde-d88d-47a3-aed1-ce1adbac1076.jpg",
    description: "Soft fleece hoodie for active toddler boys.",
    tags: ["toddlers", "boys", "hoodies"]
  },
  {
    id: "tod-girl-sweater-01",
    name: "Candy Knit Sweater",
    pricePkr: 1999,
    imageUrl: "https://zimysonline.com/cdn/shop/files/Untitleddesign_11.jpg",
    description: "Warm knit sweater with a playful pastel look.",
    tags: ["toddlers", "girls", "sweaters"]
  },
  {
    id: "tod-boy-pants-01",
    name: "Explorer Jogger Pants",
    pricePkr: 1499,
    imageUrl: "https://zimysonline.com/cdn/shop/files/45_628b13a1-9224-4cec-8cd4-0f61032d3619.jpg",
    description: "Stretchy joggers for toddler adventures.",
    tags: ["toddlers", "boys", "pants"]
  },
  {
    id: "tod-girl-romper-01",
    name: "Peach Day Romper",
    pricePkr: 1699,
    imageUrl: "https://zimysonline.com/cdn/shop/files/2_3cee1458-39c3-45ae-84d5-a10b999ef355.jpg",
    description: "Breathable romper for daily comfort.",
    tags: ["toddlers", "girls", "rompers"]
  },
  {
    id: "new-boy-bodysuit-01",
    name: "Sky Snuggle Bodysuit",
    pricePkr: 1399,
    imageUrl: "https://zimysonline.com/cdn/shop/files/Gemini_Generated_Image_opd4ycopd4ycopd4.png",
    description: "Gentle cotton bodysuit for newborn boys.",
    tags: ["newborns", "boys", "bodysuits"]
  },
  {
    id: "new-girl-sleepsuit-01",
    name: "Little Dream Sleepsuit",
    pricePkr: 1499,
    imageUrl: "https://zimysonline.com/cdn/shop/files/little_love_final.png",
    description: "Cozy sleepsuit designed for restful nights.",
    tags: ["newborns", "girls", "sleepsuits"]
  },
  {
    id: "new-girl-blanket-01",
    name: "Rosy Receiving Blanket",
    pricePkr: 1899,
    imageUrl: "https://zimysonline.com/cdn/shop/files/zimys_posts_5.jpg",
    description: "Soft receiving blanket for delicate skin.",
    tags: ["newborns", "girls", "receiving blankets"]
  },
  {
    id: "new-boy-jacket-01",
    name: "Mini Cloud Jacket",
    pricePkr: 2099,
    imageUrl: "https://zimysonline.com/cdn/shop/files/16_dfb8f1ee-0cd2-47f5-b30c-495f2af8f76c.jpg",
    description: "Light padded jacket for newborn outings.",
    tags: ["newborns", "boys", "jackets"]
  }
];
