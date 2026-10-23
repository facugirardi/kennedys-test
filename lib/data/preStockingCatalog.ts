// Catálogo del formulario de Pre-Stocking (precios de bebidas por lista oficial 24/02/2026, groceries sin precio fijo — se cobran por recibo de mercado).
export interface GroceryCategory {
  c: string;
  items: string[];
}

export interface BeverageItem {
  n: string;
  p: number;
}

export interface BeverageGroup {
  g: string;
  items: BeverageItem[];
}

export interface BeverageCategory {
  c: string;
  groups: BeverageGroup[];
}

export const GROCERY_CATEGORIES: GroceryCategory[] = [
  {
    "c": "From the Bakery",
    "items": [
      "Bread Loaf",
      "White & Whole Wheat Toast Bread",
      "Croissants",
      "Brioche",
      "Bagels",
      "Tortillas",
      "Gluten-Free Bread"
    ]
  },
  {
    "c": "Cold Cuts",
    "items": [
      "Smoked Turkey",
      "Ham",
      "Bacon",
      "Prosciutto",
      "Dried Salami",
      "Smoked Salmon"
    ]
  },
  {
    "c": "Breakfast Essentials",
    "items": [
      "Jam",
      "Honey",
      "Peanut Butter",
      "Nutella",
      "Granola",
      "Oatmeal",
      "Corn Flakes",
      "All Bran",
      "Honey Hoops",
      "English Breakfast Tea",
      "Earl Grey Tea",
      "Green Tea",
      "Chamomile Tea",
      "Peppermint Tea",
      "Jasmine Tea",
      "Lemon & Ginger Tea",
      "Coffee Capsules",
      "Greek Coffee",
      "Instant Coffee",
      "Decaffeinated Coffee",
      "White Sugar",
      "Brown Sugar",
      "Stevia",
      "Agave Syrup",
      "Maple Syrup",
      "Dried Fruit & Nut Mix"
    ]
  },
  {
    "c": "Dairy",
    "items": [
      "Eggs",
      "Whole Milk",
      "Semi-Skimmed Milk",
      "Skimmed Milk",
      "Lactose-Free Milk",
      "Oat Milk",
      "Almond Milk",
      "Soy Milk",
      "Coconut Milk",
      "Butter",
      "Greek Yogurt",
      "Tahini",
      "Whipping Cream",
      "Sour Cream",
      "Cottage Cheese"
    ]
  },
  {
    "c": "Cheese",
    "items": [
      "Feta",
      "Parmesan",
      "Gouda",
      "Cheddar",
      "Cream Cheese",
      "Provolone",
      "Halloumi",
      "Graviera",
      "Mozzarella",
      "Brie / Camembert"
    ]
  },
  {
    "c": "Vegetables",
    "items": [
      "Tomatoes",
      "Cherry Tomatoes",
      "Onions",
      "Garlic",
      "Celery",
      "Cucumber",
      "Mixed Salad Leaves",
      "Rocket",
      "Carrots",
      "Mushrooms",
      "Zucchini",
      "Olives",
      "Lemons",
      "Limes",
      "Peppers",
      "Fresh Mint",
      "Fresh Basil"
    ]
  },
  {
    "c": "Fruits",
    "items": [
      "Apples",
      "Bananas",
      "Grapes",
      "Kiwis",
      "Oranges",
      "Pears",
      "Peaches",
      "Strawberries",
      "Blueberries",
      "Raspberries",
      "Watermelon",
      "Melon",
      "Mango",
      "Pineapple",
      "Avocado"
    ]
  },
  {
    "c": "Greek Meze & Dips",
    "items": [
      "Tzatziki",
      "Taramosalata",
      "Hummus",
      "Fava (Santorini)",
      "Dolmadakia",
      "Pita Bread",
      "Premium Greek Olives",
      "Spanakopita",
      "Tiropitakia (Cheese Pies)",
      "Grilled Halloumi Pack"
    ]
  },
  {
    "c": "Fish & Butcher (Pre-Order)",
    "items": [
      "Catch of the Day",
      "Sea Bass",
      "Sea Bream",
      "Prawns",
      "Octopus",
      "Beef Fillet",
      "Ribeye",
      "Lamb Chops",
      "Chicken Souvlaki",
      "Beef Burgers",
      "Sausages"
    ]
  },
  {
    "c": "Gourmet & Delicacies",
    "items": [
      "Caviar (On Request)",
      "Foie Gras (On Request)",
      "Truffle Oil",
      "Truffle Crisps",
      "Charcuterie Board",
      "Artisanal Cheese Board",
      "Smoked Salmon Platter",
      "Fresh Oysters (On Request)"
    ]
  },
  {
    "c": "Zero-Proof & Wellness",
    "items": [
      "Non-Alcoholic Spirit (Lyre's / Seedlip)",
      "Kombucha",
      "Cold Brew Coffee",
      "Matcha",
      "Protein Bars",
      "Electrolyte Sachets"
    ]
  },
  {
    "c": "Snacks",
    "items": [
      "Potato Chips",
      "Kale Chips",
      "Quinoa Chips",
      "Pistachios",
      "Mixed Nuts",
      "Breadsticks",
      "Crackers",
      "Tortilla Chips",
      "Rice Crackers",
      "Rice Cakes",
      "Pretzels",
      "Popcorn"
    ]
  },
  {
    "c": "For Your Sweet Tooth",
    "items": [
      "Dark Chocolate",
      "Milk Chocolate",
      "White Chocolate",
      "Cereal Bars",
      "Cookies",
      "Ice Cream",
      "Greek Sweets"
    ]
  },
  {
    "c": "Cupboard",
    "items": [
      "Extra Virgin Olive Oil",
      "Balsamic Vinegar",
      "Pasta",
      "Tomato Pasta Sauce",
      "Rice",
      "Flour",
      "Sea Salt",
      "Black Pepper",
      "Oregano",
      "Paprika",
      "Chili Flakes",
      "Cinnamon",
      "Mayonnaise",
      "Mustard",
      "Dijon Mustard",
      "Ketchup",
      "BBQ Sauce",
      "Soy Sauce",
      "Sweet Chili Sauce",
      "Hot Sauce",
      "Chutney",
      "Tuna",
      "Chickpeas",
      "Lentils",
      "Sweet Corn"
    ]
  },
  {
    "c": "Ice",
    "items": [
      "Ice Cubes (Bag)",
      "Crushed Ice (Bag)",
      "Large Ice Cubes for Wine Buckets"
    ]
  },
  {
    "c": "Baby & Kids",
    "items": [
      "Diapers (size in notes)",
      "Baby Wipes",
      "Baby Formula",
      "Baby Food Jars",
      "Kids' Snacks",
      "Kids' Juice Boxes"
    ]
  },
  {
    "c": "Beach & Sun",
    "items": [
      "Sunscreen SPF 30",
      "Sunscreen SPF 50",
      "Kids' Sunscreen SPF 50+",
      "After-Sun / Aloe Vera",
      "Insect Repellent",
      "Lip Balm SPF"
    ]
  }
];

export const BEVERAGE_CATEGORIES: BeverageCategory[] = [
  {
    "c": "Water, Soft Drinks & Beers",
    "groups": [
      {
        "g": "Greek Water",
        "items": [
          {
            "n": "ZAGORI MINERAL WATER 500 ml Pet",
            "p": 0.7
          },
          {
            "n": "ZAGORI MINERAL WATER 1,0 LT Pet",
            "p": 1.1
          },
          {
            "n": "ZAGORI MINERAL WATER 1,0 LT Glass",
            "p": 1.7
          },
          {
            "n": "ZAGORI MINERAL WATER 1,5 LT Pet",
            "p": 1.2
          },
          {
            "n": "SAMARIA SPARKLING WATER 1,5 LT Pet",
            "p": 1.7
          },
          {
            "n": "SAMARIA SPARKLING WATER 500ml Pet",
            "p": 1.2
          },
          {
            "n": "SOUROTI SPARKLING WATER 250ml Glass",
            "p": 1.7
          },
          {
            "n": "SOUROTI SPARKLING WATER 750ml Glass",
            "p": 2.6
          },
          {
            "n": "SOUR WATER SPARKLING 250ml Glass",
            "p": 1.8
          },
          {
            "n": "SOUR WATER SPARKLING 750ml Glass",
            "p": 3
          }
        ]
      },
      {
        "g": "Imported Water",
        "items": [
          {
            "n": "WATER EVIAN 330ml Pet",
            "p": 1.9
          },
          {
            "n": "WATER EVIAN 330 ml Glass",
            "p": 3
          },
          {
            "n": "WATER EVIAN 500ml Pet",
            "p": 2.3
          },
          {
            "n": "WATER EVIAN 750ml Glass",
            "p": 4.1
          },
          {
            "n": "WATER EVIAN 1,0 LT Pet",
            "p": 3
          },
          {
            "n": "WATER SAN PELLEGRINO 250ml Glass",
            "p": 2
          },
          {
            "n": "WATER SAN PELLEGRINO 750ml Glass",
            "p": 3.2
          },
          {
            "n": "WATER ACQUA PANNA 750ml Glass",
            "p": 3.1
          },
          {
            "n": "WATER ACQUA PANNA 250ml Glass",
            "p": 2.3
          },
          {
            "n": "WATER PERRIER 330ml Glass",
            "p": 2.5
          },
          {
            "n": "WATER FIJI ARTESIAN 500ml Pet",
            "p": 4.2
          },
          {
            "n": "WATER FIJI ARTESIAN 1,0LT Pet",
            "p": 6.8
          },
          {
            "n": "COCONUT WATER VITA COCO 330ml",
            "p": 4.8
          }
        ]
      },
      {
        "g": "Soft Drinks",
        "items": [
          {
            "n": "COCA COLA 330ml Can",
            "p": 1.45
          },
          {
            "n": "COCA COLA 500ml Pet",
            "p": 1.75
          },
          {
            "n": "COCA COLA LIGHT 330ml Can",
            "p": 1.45
          },
          {
            "n": "COCA COLA LIGHT 500ml Pet",
            "p": 1.75
          },
          {
            "n": "COCA COLA ZERO 330ml Can",
            "p": 1.45
          },
          {
            "n": "COCA COLA ZERO 500ml Pet",
            "p": 1.75
          },
          {
            "n": "FANTA ORANGE 330ml Can",
            "p": 1.45
          },
          {
            "n": "FANTA ORANGE 500ml Pet",
            "p": 1.75
          },
          {
            "n": "FANTA ORANGE BLUE 330ml Can",
            "p": 1.45
          },
          {
            "n": "FANTA LEMONADE 330ml Can",
            "p": 1.45
          },
          {
            "n": "FANTA LEMONADE 500ml Pet",
            "p": 1.75
          },
          {
            "n": "SPRITE 330ml Can",
            "p": 1.45
          },
          {
            "n": "SPRITE 500ml Pet",
            "p": 1.65
          },
          {
            "n": "SCHWEPPES TONIC 330ml Can",
            "p": 1.45
          },
          {
            "n": "SCHWEPPES TONIC 500ml Pet",
            "p": 1.75
          },
          {
            "n": "SCHWEPPES SODA 330ml Can",
            "p": 1.4
          },
          {
            "n": "SCHWEPPES SODA 500ml Pet",
            "p": 1.65
          },
          {
            "n": "SCHWEPPES GINGER ALE 330ml Can",
            "p": 1.65
          },
          {
            "n": "ROS SOLIS SODA WATER 200ml",
            "p": 2.3
          },
          {
            "n": "ROS SOLIS TONIC WATER 200ml",
            "p": 2.3
          },
          {
            "n": "ROS SOLIS PINK GRAPEFRUIT SODA 200ml",
            "p": 2.3
          },
          {
            "n": "ROS SOLIS GENTELMEN SODA 200ml",
            "p": 2.3
          },
          {
            "n": "ROS SOLIS CUCUMBER N' BASIL TONIC",
            "p": 2.3
          },
          {
            "n": "ROS SOLIS GINGER BEER 200ml",
            "p": 2.3
          },
          {
            "n": "FEVER TREE INDIAN TONIC 200ml",
            "p": 2.85
          },
          {
            "n": "FEVER TREE MEDITERRANEAN TONIC 200ml",
            "p": 2.85
          },
          {
            "n": "FEVER TREE LIGHT TONIC 200ml",
            "p": 2.85
          },
          {
            "n": "FEVER TREE SODA WATER 200ml",
            "p": 2.85
          },
          {
            "n": "FEVER TREE GINGER ALE 200ml",
            "p": 2.85
          },
          {
            "n": "FEVER TREE GINGER BEER 200ml",
            "p": 2.85
          },
          {
            "n": "THREE CENTS PINK GRAPEFRUIT 200ML",
            "p": 2.85
          },
          {
            "n": "THREE CENTS PINK GRAPEFRUIT 200ML Zero Sugar",
            "p": 2.85
          },
          {
            "n": "SELTZER PURE SPIRIT can 330ml",
            "p": 4.8
          }
        ]
      },
      {
        "g": "Ice Tea",
        "items": [
          {
            "n": "LIPTON ICE TEA PEACH 330ml Can",
            "p": 1.45
          },
          {
            "n": "LIPTON ICE TEA LEMON 330ml Can",
            "p": 1.45
          }
        ]
      },
      {
        "g": "Energy Drinks",
        "items": [
          {
            "n": "RED BULL 250ml Can",
            "p": 2.9
          },
          {
            "n": "RED BULL SUGAR FREE 250ml Can",
            "p": 2.9
          }
        ]
      },
      {
        "g": "Juices",
        "items": [
          {
            "n": "ORANGE JUICE 1,0 LT",
            "p": 3.5
          },
          {
            "n": "LEMON JUICE 1,0 LT",
            "p": 3.5
          },
          {
            "n": "PINEAPPLE JUICE 1,0 LT",
            "p": 3.5
          },
          {
            "n": "APPLE JUICE 1,0 LT",
            "p": 3.5
          },
          {
            "n": "POMEGRANATE JUICE 1,0 LT",
            "p": 4.9
          },
          {
            "n": "PEACH JUICE 1,0 LT",
            "p": 3.2
          },
          {
            "n": "SOUR CHERRY JUICE 1,0 LT",
            "p": 3
          },
          {
            "n": "GRAPEFRUIT JUICE 1,0 LT",
            "p": 3.7
          },
          {
            "n": "PAGO CRANBERRY 750ml",
            "p": 4.8
          },
          {
            "n": "TOMATO JUICE 1,0 LT",
            "p": 5
          },
          {
            "n": "CRANBERRY JUICE 1,0 LT",
            "p": 6
          }
        ]
      },
      {
        "g": "Beers",
        "items": [
          {
            "n": "BEER MYTHOS 330ml Glass O.W.",
            "p": 2.4
          },
          {
            "n": "BEER MYTHOS 330ml Can",
            "p": 1.8
          },
          {
            "n": "BEER FIX HELLAS 330ml Glass O.W",
            "p": 2.5
          },
          {
            "n": "BEER FIX HELLAS 330ml Can",
            "p": 1.8
          },
          {
            "n": "BEER ALFA 330ml Glass O.W",
            "p": 2.4
          },
          {
            "n": "BEER ALFA 330ml Can",
            "p": 1.8
          },
          {
            "n": "BEER CORONA EXTRA Glass",
            "p": 3.9
          },
          {
            "n": "BEER ESTRELLA BARCELONA 330ml Glass",
            "p": 3.3
          },
          {
            "n": "BEER PERONI 330ml Glass",
            "p": 3
          },
          {
            "n": "BEER HEINEKEN 330ml Glass O.W",
            "p": 3
          },
          {
            "n": "BEER STELLA ARTOIS 330ml Glass",
            "p": 2.8
          }
        ]
      },
      {
        "g": "Non-Alcoholic Beers",
        "items": [
          {
            "n": "BEER HEINEKEN NON ALCOHOL 330ml Glass",
            "p": 2.6
          },
          {
            "n": "BEER STELLA ARTOIS NON ALCOHOL 330ml Glass",
            "p": 3.1
          },
          {
            "n": "BEER CORONA EXTRA NON ALCOHOL Glass",
            "p": 3.2
          },
          {
            "n": "CIDER MILOKLEFTIS 330ml Glass",
            "p": 2.9
          }
        ]
      }
    ]
  },
  {
    "c": "Spirits",
    "groups": [
      {
        "g": "Whisky",
        "items": [
          {
            "n": "WH. CUTTY SARK",
            "p": 25.7
          },
          {
            "n": "WH. DEWARS WHITE LABEL",
            "p": 26.5
          },
          {
            "n": "WH.HAIG",
            "p": 27
          },
          {
            "n": "WH. GRANT'S",
            "p": 26.9
          },
          {
            "n": "WH. J & B",
            "p": 27
          },
          {
            "n": "WH. FAMOUS GROUSE",
            "p": 28
          },
          {
            "n": "WH.JOHNNIE WALKER RED LABEL",
            "p": 28.5
          },
          {
            "n": "WH.JOHNNIE WALKER BLACK",
            "p": 42.8
          },
          {
            "n": "WH. CHIVAS REGAL",
            "p": 43.5
          },
          {
            "n": "WH. DIMPLE GOLDEN EDITION",
            "p": 45.8
          },
          {
            "n": "WH.MONKEY SHOULDER BLEND.MALT",
            "p": 46.2
          },
          {
            "n": "WH. GLENFIDDICH 12YO",
            "p": 50
          },
          {
            "n": "WH. CARDHU 12 Y.O.",
            "p": 49.5
          },
          {
            "n": "WH. GLENLIVET FOUNDERS RES.G.B.",
            "p": 44
          },
          {
            "n": "WH. GLENMORANGIE 12 Y.O.",
            "p": 60
          },
          {
            "n": "WH. CRAGGANMORE 12 Y.O.",
            "p": 63
          },
          {
            "n": "WH. GLENKINCHIE 12Y.O",
            "p": 64
          },
          {
            "n": "WH. TALISKER MALT 10 Y.O.",
            "p": 68
          },
          {
            "n": "WH. JOHNNIE WALKER GREEN",
            "p": 69
          },
          {
            "n": "WH.JOHNNIE WALKER GOLD RSV",
            "p": 70
          },
          {
            "n": "WH. CAOL ILA 12YO",
            "p": 73
          },
          {
            "n": "WH. DALWHINNIE MALT 15 Y.O.",
            "p": 72.5
          },
          {
            "n": "WH. GLENALLACHIE 8 Y.O",
            "p": 78
          },
          {
            "n": "WH. GLENALLACHIE 12 Y.O",
            "p": 90
          },
          {
            "n": "WH. OBAN MALT 14 Y.O.",
            "p": 104
          },
          {
            "n": "WH. CHIVAS REGAL 18 Y.O.",
            "p": 108
          },
          {
            "n": "WH. LAGAVULIN 16 Y.O.",
            "p": 120
          },
          {
            "n": "WH. GLENALLACHIE 15 Y.O",
            "p": 126
          },
          {
            "n": "WH. MACALLAN TRIPLE CASK 12 Y.O.",
            "p": 160
          },
          {
            "n": "WH. CAOL ILA Single Malt Sp.Rel 15 YO",
            "p": 143
          },
          {
            "n": "WH. MACALLAN DOUBLE CASK 12 Y.O.",
            "p": 148
          },
          {
            "n": "WH. GLENMORANGIE 18 Y.O.",
            "p": 198
          },
          {
            "n": "WH. ROYAL SALUTE THE LOST BLEND 21 Y.O. (CHIVAS)",
            "p": 230
          },
          {
            "n": "WH. MACALLAN 15 Y.O",
            "p": 280
          },
          {
            "n": "WH.JOHNNIE WALKER BLUE 1 LT",
            "p": 320
          },
          {
            "n": "WH. MACALLAN 18 Y.O. DOUBLE CASK",
            "p": 590
          },
          {
            "n": "WH.JOHNNIE WALKER BLUE KING GEORGE V EDITION",
            "p": 690
          }
        ]
      },
      {
        "g": "Whisky — Irish Whisky",
        "items": [
          {
            "n": "WH.IRISH JAMESON",
            "p": 32
          },
          {
            "n": "WH. BUSHMILLS ORIGINAL",
            "p": 34.2
          },
          {
            "n": "WH. BUSHMILLS MALT 10 Y.O.",
            "p": 49.5
          }
        ]
      },
      {
        "g": "Whisky — Bourbon/Rye Whisky",
        "items": [
          {
            "n": "WH. BOURBON FOUR ROSES",
            "p": 34.2
          },
          {
            "n": "WH.BUFFALO TRACE",
            "p": 37.8
          },
          {
            "n": "WH.BULLEIT BURBON 70CL",
            "p": 45.5
          },
          {
            "n": "WH.BULLEIT RYE 70CL",
            "p": 50
          },
          {
            "n": "WH. WOODFORD RESERVE",
            "p": 55.9
          },
          {
            "n": "WH.MAKER'S MARK",
            "p": 56.3
          },
          {
            "n": "WH. JACK DANIELS",
            "p": 37.2
          },
          {
            "n": "WH. JACK DANIELS SINGLE BARREL",
            "p": 65
          }
        ]
      },
      {
        "g": "Whisky — Japanese Whisky",
        "items": [
          {
            "n": "WH. TOKINOKA White Blend",
            "p": 50
          },
          {
            "n": "WH. TOKINOKA BlackSherry Finish",
            "p": 75
          },
          {
            "n": "WH. NIKKA FROM THE BARREL",
            "p": 79.5
          },
          {
            "n": "WH. TOGOUCHI PREMIUM",
            "p": 70
          },
          {
            "n": "WH. ICHIRO MALT & GRAIN",
            "p": 128
          },
          {
            "n": "WH.SUNTORY ROYAL",
            "p": 145
          },
          {
            "n": "WH.HAKUSHU DISTILLERS RES. SUNTORY 700 ml",
            "p": 188
          },
          {
            "n": "WH. SUNTORY HIBIKI HARMONY",
            "p": 230
          },
          {
            "n": "WH. SUNTORY HIBIKI HARMONY Master Select",
            "p": 275
          },
          {
            "n": "WH. YAMAZAKI DISTILLER RESERVE",
            "p": 380
          },
          {
            "n": "WH.ICHIROS MALT & GRAIN WORLD BLENDED WHISKY LIM.ED.",
            "p": 380
          },
          {
            "n": "WH. YAMAZAKI 12 Y.O.",
            "p": 460
          }
        ]
      },
      {
        "g": "Liqueur",
        "items": [
          {
            "n": "LIQUEUR MASTIHA CHIOS APALARINA 500ml",
            "p": 18.5
          },
          {
            "n": "LIQUEUR SKINOS MASTIHA CHIOS",
            "p": 28.5
          },
          {
            "n": "LIQUEUR ARCHERS SCHNAPPS",
            "p": 20
          },
          {
            "n": "LIQUEUR SOURZ APPLE",
            "p": 20
          },
          {
            "n": "LIQUEUR PASSOA",
            "p": 20.7
          },
          {
            "n": "LIQUEUR BATIDA DE COCO",
            "p": 21
          },
          {
            "n": "LIQUEUR TIA MARIA",
            "p": 23.5
          },
          {
            "n": "LIQUEUR MALIBU",
            "p": 23.2
          },
          {
            "n": "LIQUEUR BAILEYS CREAM",
            "p": 23.6
          },
          {
            "n": "LIQUEUR KAHLUA",
            "p": 25
          },
          {
            "n": "LIQUEUR MONIN TRIPLE SEC",
            "p": 25.5
          },
          {
            "n": "LIQUEUR LIMONCELO DI SORRENTO BIOLOGICO 500ml",
            "p": 25
          },
          {
            "n": "LIQUEUR SAMBUCA MOLINARI",
            "p": 25.7
          },
          {
            "n": "LIQUEUR JAGERMEISTER",
            "p": 26.8
          },
          {
            "n": "LIQUEUR DISARONNO AMARETTO",
            "p": 28.5
          },
          {
            "n": "LIQUEUR FRANGELICO",
            "p": 28.7
          },
          {
            "n": "LIQUEUR SOUTHERN COMFORT",
            "p": 28.7
          },
          {
            "n": "LIQUEUR AMARO MONTENEGRO",
            "p": 31
          },
          {
            "n": "LIQUEUR FIREBALL WH. CINNAMON",
            "p": 29.9
          },
          {
            "n": "LIQUEUR COINTREAU 700ml",
            "p": 33.6
          },
          {
            "n": "LIQUEUR DRAMBUIE",
            "p": 35.7
          },
          {
            "n": "LIQUEUR CHAMBORD 500ML",
            "p": 35.5
          },
          {
            "n": "LIQUEUR GRAND MARNIER ROUGE",
            "p": 41.9
          },
          {
            "n": "LIQUEUR ST GERMAIN ELDERFLOWER",
            "p": 52
          },
          {
            "n": "BITTERS ANGOSTURA 200ml",
            "p": 25
          }
        ]
      },
      {
        "g": "Cognac - Armagnac - Brandy",
        "items": [
          {
            "n": "COGNAC COURVOISIER VSOP",
            "p": 83
          },
          {
            "n": "COGNAC MARTELL VSOP",
            "p": 78
          },
          {
            "n": "COGNAC HENNESSY VS",
            "p": 72
          },
          {
            "n": "COGNAC HENNESSY FINE VSOP",
            "p": 108
          },
          {
            "n": "COGNAC HENNESSY X.O.",
            "p": 390
          },
          {
            "n": "COGNAC REMY MARTIN X.O.",
            "p": 320
          },
          {
            "n": "COGNAC REMY MARTIN LOUIS XIII",
            "p": 4900
          },
          {
            "n": "ARMAGNAC CASTADERE X.O. 20YO",
            "p": 126
          },
          {
            "n": "BRANDY METAXA 3",
            "p": 22.5
          },
          {
            "n": "BRANDY METAXA 5",
            "p": 29.5
          },
          {
            "n": "BRANDY METAXA 7",
            "p": 35.8
          },
          {
            "n": "BRANDY METAXA PRIVATE RESERVE",
            "p": 105
          }
        ]
      },
      {
        "g": "Ouzo - Tsipouro - Grappa - Eau De Vie",
        "items": [
          {
            "n": "OUZO CHIOY APALARINA",
            "p": 14.5
          },
          {
            "n": "OUZO 35N 700ml",
            "p": 16
          },
          {
            "n": "OUZO VITHOS 700ml",
            "p": 16.4
          },
          {
            "n": "OUZO PLOMARIOU",
            "p": 20.5
          },
          {
            "n": "OUZO BARBAYIANNI BLUE 700ml",
            "p": 21
          },
          {
            "n": "OUZO BARBAYIANNI GREEN 700ml",
            "p": 21.3
          },
          {
            "n": "TSIPOURO ZACHARIA without Anise",
            "p": 18.8
          },
          {
            "n": "TSIPOURO ZACHARIA with Anise",
            "p": 18.8
          },
          {
            "n": "TSIPOURO AGIONERI",
            "p": 18.9
          },
          {
            "n": "TSIPOURO APOSTOLAKI without Anise",
            "p": 20.5
          },
          {
            "n": "TSIPOURO TSILILI DARK CAVE Aged 5 Y.O",
            "p": 54.8
          },
          {
            "n": "GRAPE DISTILLATE TSILILI HAMBURG MUSCAT",
            "p": 26.7
          },
          {
            "n": "GRAPE DISTILLATE LOST LAKE MALAGOUZIA",
            "p": 29
          },
          {
            "n": "GRAPE DISTILLATE LOST LAKE MOUXTARO",
            "p": 29
          },
          {
            "n": "GRAPE DISTILLATE LOST LAKE HEFEBRAND (GRAPE POMACE)",
            "p": 28
          },
          {
            "n": "GRAPE DISTILLATE LOST LAKE ROBOLA",
            "p": 38
          },
          {
            "n": "TSIKOUDIA 35N SYRAH 500ml",
            "p": 20
          },
          {
            "n": "TSIKOUDIA 35N OAKED 500ml",
            "p": 38
          },
          {
            "n": "GRAPPA SARPA DI POLI 70CL",
            "p": 52
          },
          {
            "n": "GRAPPA POLI BARRIQUE ORO 70CL",
            "p": 54
          },
          {
            "n": "GRAPPA POLI MORBIDA-MOSCATO",
            "p": 56
          },
          {
            "n": "GRAPPA PO'DI POLI SECCA MERLOT 70CL",
            "p": 56
          },
          {
            "n": "GRAPPA PO'DI POLI AROMATICA TRAMINER 70CL",
            "p": 56
          },
          {
            "n": "GRAPPA GAJA COSTA RUSSI 50CL",
            "p": 68
          },
          {
            "n": "GRAPPA POLI CLEOPATRA AMARONE 70CL",
            "p": 80
          },
          {
            "n": "GRAPPA POLI AMOROSA TORCOLATO 50CL",
            "p": 82
          },
          {
            "n": "GRAPPA ANTINORI TIGNANELLO",
            "p": 86
          },
          {
            "n": "GRAPPA POLI BARRILI DI SASSICAIA 50CL",
            "p": 125
          },
          {
            "n": "CALVADOS MASSENEZ VIEUX ΜΕ ΜΗΛΟ 700ML",
            "p": 76
          }
        ]
      },
      {
        "g": "Vodka",
        "items": [
          {
            "n": "VODKA URSUS ROTER",
            "p": 22
          },
          {
            "n": "VODKA SMIRNOFF NORTH",
            "p": 22
          },
          {
            "n": "VODKA SMIRNOFF RED",
            "p": 24.5
          },
          {
            "n": "VODKA SERKOVA",
            "p": 22.5
          },
          {
            "n": "VODKA STOLICHNAYA",
            "p": 25
          },
          {
            "n": "VODKA SKYY",
            "p": 26
          },
          {
            "n": "VODKA ABSOLUT",
            "p": 25.8
          },
          {
            "n": "VODKA ABSOLUT VANILLA 70CL",
            "p": 26.5
          },
          {
            "n": "VODKA FINLANDIA",
            "p": 26.9
          },
          {
            "n": "VODKA RUSSIAN STANDARD",
            "p": 28
          },
          {
            "n": "VODKA KETEL ONE",
            "p": 38.5
          },
          {
            "n": "VODKA TITOS HANDMADE 0,7LiT",
            "p": 44
          },
          {
            "n": "VODKA TITOS HANDMADE 1,75LiT",
            "p": 110
          },
          {
            "n": "VODKA BELUGA",
            "p": 57
          },
          {
            "n": "VODKA BELUGA GOLD",
            "p": 210
          },
          {
            "n": "VODKA KAUFFMAN SOFT 0,7LiT",
            "p": 56
          },
          {
            "n": "VODKA ELITE by STOLI",
            "p": 73
          },
          {
            "n": "VODKA ELITE by STOLI 1 Lit",
            "p": 96
          },
          {
            "n": "VODKA BELVEDERE 0,7LiT",
            "p": 58
          },
          {
            "n": "VODKA BELVEDERE 1 LiT",
            "p": 77
          },
          {
            "n": "VODKA BELVEDERE PURE 1,75 LiT",
            "p": 185
          },
          {
            "n": "VODKA BELVEDERE MYKONOS EDITION 1,75LT",
            "p": 215
          },
          {
            "n": "VODKA BELVEDERE 10 (TEN)",
            "p": 290
          },
          {
            "n": "VODKA BELVEDERE 3 LiT",
            "p": 380
          },
          {
            "n": "VODKA CIROC 0,7 Lit",
            "p": 56.3
          },
          {
            "n": "VODKA CRYSTAL HEAD 70cl",
            "p": 74.2
          },
          {
            "n": "VODKA CRYSTAL HEAD PRIDE LIM.ED.",
            "p": 90
          },
          {
            "n": "VODKA GREY GOOSE",
            "p": 61.5
          },
          {
            "n": "VODKA GREY GOOSE 1LiT",
            "p": 78.5
          },
          {
            "n": "VODKA GREY GOOSE MGN",
            "p": 180
          },
          {
            "n": "VODKA GREY GOOSE 3LIT",
            "p": 365
          }
        ]
      },
      {
        "g": "Gin",
        "items": [
          {
            "n": "GIN GORDONS",
            "p": 24.5
          },
          {
            "n": "GIN BEEFEATER PINK",
            "p": 28.3
          },
          {
            "n": "GIN BEEFEATER",
            "p": 29.8
          },
          {
            "n": "GIN TANQUERAY",
            "p": 32.5
          },
          {
            "n": "GIN TANQUERAY FREE 0%",
            "p": 30.7
          },
          {
            "n": "GIN BOMBAY SAPPHIRE",
            "p": 34.9
          },
          {
            "n": "GIN VOTANIKON (Greek Gin)",
            "p": 41.5
          },
          {
            "n": "GIN ROKU Japanese Gin",
            "p": 43.1
          },
          {
            "n": "GIN AMAZZONI BRAZILIAN 700ml",
            "p": 46
          },
          {
            "n": "GIN HENDRICK'S",
            "p": 51.6
          },
          {
            "n": "GIN TANQUERAY TEN 700ml",
            "p": 52.8
          },
          {
            "n": "GIN BOTANIST ISLAY DRY",
            "p": 53.5
          },
          {
            "n": "GIN AMAZZONI Rio Negro BRAZILIAN 700ml",
            "p": 55.5
          },
          {
            "n": "GIN GRACE (Greek Gin)",
            "p": 54.5
          },
          {
            "n": "GIN BROCKMANS",
            "p": 56
          },
          {
            "n": "GIN MONKEY 47",
            "p": 63
          },
          {
            "n": "GIN DEATH'S DOOR",
            "p": 66
          },
          {
            "n": "GIN COTSWOLDS DRY",
            "p": 70.8
          },
          {
            "n": "GIN MARE ULTRA PREMIUM",
            "p": 72
          },
          {
            "n": "GIN SEVENTY ONE 200ml",
            "p": 125
          },
          {
            "n": "GIN SEVENTY ONE 700ml",
            "p": 320
          }
        ]
      },
      {
        "g": "Aperitif - Vermouth",
        "items": [
          {
            "n": "MARTINI DRY 1LiT",
            "p": 15.8
          },
          {
            "n": "MARTINI ROSSO 1LiT",
            "p": 16.5
          },
          {
            "n": "MARTINI BIANCO 1LiT",
            "p": 17.3
          },
          {
            "n": "APEROL APERITIVO 1lt",
            "p": 27
          },
          {
            "n": "VERMOUTH NOILLY PRAT DRY 1 LiT",
            "p": 27.5
          },
          {
            "n": "PIMMS APERITIF 1lt",
            "p": 28.5
          },
          {
            "n": "CAMPARI BITTER",
            "p": 29.6
          },
          {
            "n": "FERNET BRANCA MENTA",
            "p": 29.5
          },
          {
            "n": "FERNET BRANCA",
            "p": 30.5
          },
          {
            "n": "APERITIF PERNOD",
            "p": 30.5
          },
          {
            "n": "APERITIF RICARD Pastis",
            "p": 30.8
          },
          {
            "n": "VERMOUTH ANTICA FORMULA CARPANO 1LIT",
            "p": 42.8
          }
        ]
      },
      {
        "g": "Rum - Cachaca",
        "items": [
          {
            "n": "RUM HAVANA CLUB AMBRE 3 Y.O.",
            "p": 27.3
          },
          {
            "n": "RUM CAPTAIN MORGAN",
            "p": 31.5
          },
          {
            "n": "RUM MOUNT GAY ECLIPSE",
            "p": 33.4
          },
          {
            "n": "RUM CAPTAIN MORGAN SPICED 70CL",
            "p": 34.8
          },
          {
            "n": "RUM HAVANA ANEJO RESERVA",
            "p": 36
          },
          {
            "n": "RUM SAILOR JERRY SPICED",
            "p": 35.5
          },
          {
            "n": "RUM BACARDI BLANCO 1LiT",
            "p": 36.5
          },
          {
            "n": "RUM LA MAISON DU RHUM DIS.PANAMA",
            "p": 45
          },
          {
            "n": "RUM KRAKEN BLACK SPICED 700ml",
            "p": 43.5
          },
          {
            "n": "RUM HAVANA CLUB 7Υ.Ο",
            "p": 44
          },
          {
            "n": "RUM BACARDI 8 ΕΤΩΝ",
            "p": 48
          },
          {
            "n": "RUM DIPLOMATICO RSV EXCLUSIVA",
            "p": 62
          },
          {
            "n": "RUM DON PAPA 7 Y.O",
            "p": 76
          },
          {
            "n": "RUM ZACAPA 23 700ML",
            "p": 94
          },
          {
            "n": "RUM MILLONARIO X.O. RSRV",
            "p": 192
          },
          {
            "n": "RUM ZACAPA X.O. 700ml",
            "p": 215
          },
          {
            "n": "CACHACA SAGATIBA SILVER",
            "p": 29.5
          },
          {
            "n": "CACHACA YPIOCA",
            "p": 33.5
          },
          {
            "n": "CACHACA PITU",
            "p": 30
          }
        ]
      },
      {
        "g": "Tequila - Mezcal",
        "items": [
          {
            "n": "TEQUILA OCHO BLANCO 50CL",
            "p": 33
          },
          {
            "n": "TEQUILA CAZADORES BLANCO",
            "p": 35
          },
          {
            "n": "TEQUILA EL JIMADOR BLANCO",
            "p": 33
          },
          {
            "n": "TEQUILA EL JIMADOR REPOSADO",
            "p": 35
          },
          {
            "n": "TEQUILA JOSE CUERVO SILVER",
            "p": 32
          },
          {
            "n": "TEQUILA JOSE CUERVO REPOSADO",
            "p": 32.8
          },
          {
            "n": "TEQUILA JOSE CUERVO RESERVA DE LA FAMILLIA ANEJO",
            "p": 225
          },
          {
            "n": "TEQUILA HERRADURA PLATA BLANCO",
            "p": 50
          },
          {
            "n": "TEQUILA HERRADURA REPOSADO",
            "p": 70
          },
          {
            "n": "TEQUILA CASAMIGOS BLANCO",
            "p": 77
          },
          {
            "n": "TEQUILA CASAMIGOS REPOSADO",
            "p": 80
          },
          {
            "n": "TEQUILA CASAMIGOS ANEJO",
            "p": 88
          },
          {
            "n": "TEQUILA KOMOS ANEJO 375 ml",
            "p": 160
          },
          {
            "n": "TEQUILA KOMOS REPOSADO ROSA 375 ml",
            "p": 130
          },
          {
            "n": "TEQUILA KOMOS REPOSADO ROSA",
            "p": 258
          },
          {
            "n": "TEQUILA KOMOS CRISTALINO ANEJO",
            "p": 292
          },
          {
            "n": "TEQUILA KOMOS ANEJO RESERVA MEXICAN",
            "p": 320
          },
          {
            "n": "TEQUILA KOMOS REPOSADO ROSA 1,75Lt",
            "p": 700
          },
          {
            "n": "TEQUILA KOMOS CRISTALINO ANEJO 1,75Lt",
            "p": 735
          },
          {
            "n": "TEQUILA KOMOS ANEJO RESERVA 1,75Lt",
            "p": 870
          },
          {
            "n": "TEQUILA KOMOS XO CRYSTAL",
            "p": 2700
          },
          {
            "n": "TEQUILA KOMOS EXTRA ANEJO",
            "p": 780
          },
          {
            "n": "TEQUILA PATRON XO CAFE",
            "p": 74
          },
          {
            "n": "TEQUILA PATRON SILVER",
            "p": 79
          },
          {
            "n": "TEQUILA PATRON REPOSADO",
            "p": 85
          },
          {
            "n": "TEQUILA PATRON ANEJO",
            "p": 89
          },
          {
            "n": "TEQUILA PATRON ''El Cielo'' Silver",
            "p": 260
          },
          {
            "n": "TEQUILA GRAND PATRON PLATINUM",
            "p": 328
          },
          {
            "n": "TEQUILA PATRON GR. PLATINUM 1,75Lt",
            "p": 690
          },
          {
            "n": "TEQUILA DON JULIO BLANCO",
            "p": 78
          },
          {
            "n": "TEQUILA DON JULIO REPOSADO",
            "p": 83
          },
          {
            "n": "TEQUILA DON JULIO ANEJO",
            "p": 89
          },
          {
            "n": "TEQUILA DON JULIO 70th",
            "p": 143
          },
          {
            "n": "TEQUILA DON JULIO Rosado",
            "p": 290
          },
          {
            "n": "TEQUILA DON JULIO 1942",
            "p": 310
          },
          {
            "n": "TEQUILA DON JULIO 1942 1,75Lt",
            "p": 880
          },
          {
            "n": "TEQUILA CASA DRAGONES JOVEN",
            "p": 380
          },
          {
            "n": "TEQUILA CLASE AZUL PLATA",
            "p": 228
          },
          {
            "n": "TEQUILA CLASE AZUL REPOSADO 200ml",
            "p": 112
          },
          {
            "n": "TEQUILA CLASE AZUL REPOSADO",
            "p": 340
          },
          {
            "n": "TEQUILA CLASE AZUL REPOSADO 1,75Lt",
            "p": 790
          },
          {
            "n": "TEQUILA CLASE AZUL GOLD",
            "p": 740
          },
          {
            "n": "TEQUILA CLASE AZUL ANEJO 700ml",
            "p": 1100
          },
          {
            "n": "TEQUILA CLASE AZUL ULTRA EXTRA ANEJO 700ml",
            "p": 4400
          },
          {
            "n": "TEQUILA CLASE AZUL 1lt REPOSADO 25 ANIVERSARIO",
            "p": 2500
          },
          {
            "n": "TEQUILA CLASE AZUL 'DIA DE MUERTOS COLORES'",
            "p": 2750
          },
          {
            "n": "TEQUILA CLASE AZUL 'DIA DE MUERTOS MUSICA'",
            "p": 4200
          },
          {
            "n": "MEZCAL GUZANO ROJO",
            "p": 52
          },
          {
            "n": "MEZCAL OAXACA SAN COSME",
            "p": 62
          },
          {
            "n": "MEZCAL DEL MAGUEY VIDA",
            "p": 86
          },
          {
            "n": "MEZCAL THE LOST EXPLORER ESPADIN 8 Y.O",
            "p": 88
          },
          {
            "n": "MEZCAL CASAMIGOS",
            "p": 98
          },
          {
            "n": "MEZCAL CLASE AZUL GUERRERO 700ml",
            "p": 690
          },
          {
            "n": "MEZCAL CLASE AZUL DURANGO 700ml",
            "p": 690
          },
          {
            "n": "MEZCAL CLASE AZUL SAN LUIS POTOSI 700ml",
            "p": 710
          }
        ]
      },
      {
        "g": "Fortified Wines",
        "items": [
          {
            "n": "MARSALA FINE DEMI SEC 75CL",
            "p": 21
          },
          {
            "n": "MADEIRA GOOD COMPANY",
            "p": 23
          },
          {
            "n": "PORT TAYLOR'S FINE TAWNY",
            "p": 21.5
          },
          {
            "n": "PORT FONSECA BRANCO WHITE",
            "p": 26
          },
          {
            "n": "PORT TAYLOR'S OLD PORT 10",
            "p": 39
          },
          {
            "n": "PORT GRAHAM'S 20 Y.O.",
            "p": 104
          },
          {
            "n": "PORT GRAHAM'S 30 Y.O.",
            "p": 182
          }
        ]
      },
      {
        "g": "Fortified Wines — Sake",
        "items": [
          {
            "n": "SAKE BIJITO JUNMAI",
            "p": 38
          },
          {
            "n": "SAKE BIJITO JUNMAI GINJO",
            "p": 42
          },
          {
            "n": "SAKE HEAVENSAKE BABY 300ml",
            "p": 49.5
          },
          {
            "n": "SAKE HEAVENSAKE JUNMAI 12",
            "p": 75
          },
          {
            "n": "SAKE HEAVENSAKE JUNMAI GINJO",
            "p": 98
          },
          {
            "n": "SAKE HEAVENSAKE JUNMAI DAIGINGO",
            "p": 165
          },
          {
            "n": "SAKE IWA 5 Shiraiwa",
            "p": 230
          }
        ]
      }
    ]
  },
  {
    "c": "Champagne & Sparkling",
    "groups": [
      {
        "g": "White Champagne",
        "items": [
          {
            "n": "CHAMP. MARTEL G.H. & C BRUT PRESTIGE",
            "p": 49
          },
          {
            "n": "CHAMP.P. GIMONNET BRUT Cuis 1er Cru",
            "p": 55
          },
          {
            "n": "CHAMP.MOET & CHANDON BRUT",
            "p": 65
          },
          {
            "n": "CHAMP.BILLECART SALMON BRUT RESERVE",
            "p": 82.5
          },
          {
            "n": "CHAMP.TAITTINGER BRUT RESERVE",
            "p": 70
          },
          {
            "n": "CHAMP.LAURENT PERRIER La Cuvee BRUT",
            "p": 73
          },
          {
            "n": "CHAMP. L.ROEDERER Collection 246",
            "p": 79
          },
          {
            "n": "CHAMP.MOET&CHANDON ICE",
            "p": 82
          },
          {
            "n": "CHAMP.VEUVE CLICQUOT BRUT",
            "p": 84
          },
          {
            "n": "CHAMP. BOLLINGER Special Cuvee BRUT",
            "p": 93
          },
          {
            "n": "CHAMP. RUINART 'R'",
            "p": 98
          },
          {
            "n": "CHAMP.BILLECART SALMON Blanc De Blanc",
            "p": 133
          },
          {
            "n": "CHAMP. RUINART Blanc de Blanc",
            "p": 166
          },
          {
            "n": "CHAMP.TAITTINGER COMTES Blanc De Blanc",
            "p": 280
          },
          {
            "n": "CHAMP.DOM PERIGNON",
            "p": 320
          },
          {
            "n": "CHAMP.KRUG",
            "p": 425
          },
          {
            "n": "CHAMP. ARMAND DE BRIGNAC BRUT GOLD",
            "p": 470
          },
          {
            "n": "CHAMP. L.ROEDERER CRISTAL",
            "p": 510
          }
        ]
      },
      {
        "g": "White Champagne — Magnum Bottles",
        "items": [
          {
            "n": "CHAMP. P.GIMONNET Brut Cuis 1er Cru MGN 1,5 Lit",
            "p": 128
          },
          {
            "n": "CHAMP.TAITTINGER BRUT MGN 1,5 Lit",
            "p": 170
          },
          {
            "n": "CHAMP.LAURENT PERRIER La Cuvee Brut MGN 1,5 LiT",
            "p": 180
          },
          {
            "n": "CHAMP.MOET & CHANDON BRUT MGN 1,5 Lit",
            "p": 190
          },
          {
            "n": "CHAMP.VEUVE CLICQUOT BRUT MGN 1,5 Lit",
            "p": 192
          },
          {
            "n": "CHAMP. BOLLINGER S.C. BRUT MGN 1,5 Lit",
            "p": 235
          },
          {
            "n": "CHAMP.MOET & CHANDON ICE MGN 1,5 Lit",
            "p": 245
          },
          {
            "n": "CHAMP. DOM PERIGNON MGN 1,5 Lit",
            "p": 910
          },
          {
            "n": "CHAMP.L.ROED. CRISTAL MGN 1,5 Lit",
            "p": 1150
          },
          {
            "n": "CHAMP.TAITTINGER BRUT 3LIT",
            "p": 400
          }
        ]
      },
      {
        "g": "Rose Champagne",
        "items": [
          {
            "n": "CHAMP.P. GIMONNET BRUT ROSE",
            "p": 68
          },
          {
            "n": "CHAMP.MOET CHANDON ROSE",
            "p": 82
          },
          {
            "n": "CHAMP.TAITTINGER ROSE",
            "p": 90
          },
          {
            "n": "CHAMP.VEUVE CLICQUOT ROSE",
            "p": 100
          },
          {
            "n": "CHAMP.BILLECART SALMON ROSE",
            "p": 130
          },
          {
            "n": "CHAMP. L. ROEDERER BRUT VINTAGE ROSE",
            "p": 135
          },
          {
            "n": "CHAMP. BOLLINGER ROSE",
            "p": 135
          },
          {
            "n": "CHAMP. RUINART ROSE",
            "p": 150
          },
          {
            "n": "CHAMP. LAURENT PERRIER ROSE Cuvee Brut",
            "p": 160
          },
          {
            "n": "CHAMP.TAITTINGER COMTES ROSE",
            "p": 380
          },
          {
            "n": "CHAMP.DOM PERIGNON ROSE",
            "p": 635
          },
          {
            "n": "CHAMP.KRUG ROSE",
            "p": 670
          },
          {
            "n": "CHAMP. ARMAND DE BRIGNAC ROSE",
            "p": 720
          },
          {
            "n": "CHAMP.L.ROEDERER CRISTAL ROSE",
            "p": 950
          }
        ]
      },
      {
        "g": "Rose Champagne — Magnum Bottles",
        "items": [
          {
            "n": "CHAMP.P. GIMONNET BRUT ROSE DE BLANCS MGN",
            "p": 140
          },
          {
            "n": "CHAMP.TAITTINGER ROSE MGN 1,5 Lit",
            "p": 190
          },
          {
            "n": "CHAMP.MOET CHANDON ROSE MGN 1,5 Lit",
            "p": 200
          },
          {
            "n": "CHAMP.TAITTINGER ROSE 3LIT",
            "p": 460
          }
        ]
      },
      {
        "g": "Sparkling Wine",
        "items": [
          {
            "n": "SPARK. PROSECCO CANTI EXTRA DRY 200 ML",
            "p": 5.5
          },
          {
            "n": "SPARK.IMPERIALE MILLESIMATO EXTRA DRY",
            "p": 11
          },
          {
            "n": "SPARK. CANTI MOSCATO D'ASTI",
            "p": 12.5
          },
          {
            "n": "SPARK.PIETRO FORNO MOSCATO D'ASTI",
            "p": 13.5
          },
          {
            "n": "SPARK. VEUVE DU VERNAY BRUT",
            "p": 13.5
          },
          {
            "n": "SPARK.CAVIT LUNETTA PROSECCO BRUT",
            "p": 14.5
          },
          {
            "n": "SPARK. PROSECCO CANTI EXTRA DRY",
            "p": 15.5
          },
          {
            "n": "SPARK. KYR YIANNI PARAGA (Greek Wine)",
            "p": 16.5
          },
          {
            "n": "SPARK. NATUREO Non Alcoholic",
            "p": 18
          },
          {
            "n": "SPARK. KYLIE MINOGUE Non Alcoholic",
            "p": 19
          },
          {
            "n": "SPARK.PROSECCO SANTA MARGHERITA DI VALDOBBIADENE",
            "p": 21
          },
          {
            "n": "SPARK. KARANIKA BRUT SPECIAL CUVEE (Greek Wine)",
            "p": 25
          },
          {
            "n": "SPARK.VILLA AMALIA TSELEPOU (Greek Wine)",
            "p": 25.5
          },
          {
            "n": "SPARK.LANGLOIS CREMANT DE LOIRE BRUT",
            "p": 33
          },
          {
            "n": "SPARK.CA'DEL BOSCO FRANCIACORTA",
            "p": 55
          },
          {
            "n": "SPARK.CA'DEL BOSCO FRANCIACORTA MGN",
            "p": 110
          }
        ]
      },
      {
        "g": "Sparkling Wine — Rose Sparkling Wine",
        "items": [
          {
            "n": "SPARK.PROSECCO CANTI EXTRA DRY ROSE",
            "p": 15.5
          },
          {
            "n": "SPARK. VEUVE DU VERNAY ROSE",
            "p": 15
          },
          {
            "n": "SPARK. KYLIE MINOGUE ROSE Non Alcoholic",
            "p": 19
          },
          {
            "n": "SPARK. KARANIKA ROSE BRUT (Greek Wine)",
            "p": 25
          },
          {
            "n": "SPARK.VILLA AMALIA TSELEPOU Rose (Greek Wine)",
            "p": 25.5
          },
          {
            "n": "SPARK. KYR YIANNI AKAKIES (Greek Wine)",
            "p": 20
          },
          {
            "n": "SPARK.LANGLOIS CREMANT DE LOIRE ROSE",
            "p": 35
          },
          {
            "n": "SPARK.CA'DEL BOSCO FRANCIACORTA ROSE",
            "p": 70
          }
        ]
      }
    ]
  },
  {
    "c": "Greek Wines",
    "groups": [
      {
        "g": "White Wines",
        "items": [
          {
            "n": "ESTATE MUSES CLIO WHITE",
            "p": 9.5
          },
          {
            "n": "ESTATE TROUPIS FTERI MOSCHOFILERO WHITE",
            "p": 9.8
          },
          {
            "n": "ESTATE MUSES 9 WHITE",
            "p": 10.7
          },
          {
            "n": "SKOURAS AKRES WHITE",
            "p": 10.9
          },
          {
            "n": "THIMIOPOULOS ATMA WHITE",
            "p": 11.4
          },
          {
            "n": "ESTATE KIR YIANNI PARAGA WHITE",
            "p": 12.6
          },
          {
            "n": "DASKALAKI SILVA VORINOS WHITE",
            "p": 13.2
          },
          {
            "n": "ESTATE PAPARGYRIOU WHITE",
            "p": 14.1
          },
          {
            "n": "ESTATE MUSES CHRISOLITHOS WHITE",
            "p": 14.3
          },
          {
            "n": "ESTATE TROUPIS TOMI MANTINIA",
            "p": 14.5
          },
          {
            "n": "SEMELI MANTINIA",
            "p": 15
          },
          {
            "n": "MOSCHOPOLIS AIORA WHITE",
            "p": 15.5
          },
          {
            "n": "ESTATE PAPAIOANNOU CHARDONNAY",
            "p": 16.4
          },
          {
            "n": "ESTATE MICHAELIDI PILI WHITE",
            "p": 16.8
          },
          {
            "n": "DIO IPSI DIALOGOS WHITE",
            "p": 16.9
          },
          {
            "n": "ARKTOS SAUVIGNON BLANC",
            "p": 17.8
          },
          {
            "n": "ARKTOS PNOE WHITE",
            "p": 17.8
          },
          {
            "n": "ESTATE ALPHA MALAGOUZIA",
            "p": 18.5
          },
          {
            "n": "SKOURAS ARMIRA CHARDONNAY- MALAGOUZIA",
            "p": 17.9
          },
          {
            "n": "ESTATE KIR YIANNI SAMAROPETRA",
            "p": 18.5
          },
          {
            "n": "ESTATE TROUPIS PITUS RITINITIS RETSINA",
            "p": 17.8
          },
          {
            "n": "ESTATE MUSES A-MUSE WHITE MALAGOUZIA",
            "p": 17.5
          },
          {
            "n": "ESTATE PALIVOU STONE HILLS",
            "p": 18.8
          },
          {
            "n": "ESTATE VOURVOUKELI CHARDONNAY",
            "p": 19.5
          },
          {
            "n": "ESTATE PAVLIDIS THEMA WHITE",
            "p": 19.5
          },
          {
            "n": "ESTATE KIR YIANNI 4 LIMNES",
            "p": 19.8
          },
          {
            "n": "KARIPIDIS SAUVIGNON BLANC",
            "p": 19.5
          },
          {
            "n": "NAVITAS Terre de Zeus MALAGOUZIA",
            "p": 19.7
          },
          {
            "n": "ESTATE BIBLIA CHORA WHITE",
            "p": 20.5
          },
          {
            "n": "ESTATE GEROVASILIOU WHITE",
            "p": 20.5
          },
          {
            "n": "Κ.LAZARIDIS CH. JULIA CHARDONNAY",
            "p": 20.5
          },
          {
            "n": "Κ.LAZARIDIS CH. JULIA ASYRTIKO",
            "p": 20.5
          },
          {
            "n": "ESTATE GEROVASILIOU MALAGOUZIA",
            "p": 22.5
          },
          {
            "n": "ESTATE PAPARGYRIOU LE VIGNEROC GREC ASSIRTIKO",
            "p": 23.2
          },
          {
            "n": "KARIPIDIS CHARDONNAY",
            "p": 23.2
          },
          {
            "n": "NAVITAS 52 Peaks CHARDONNAY",
            "p": 24.5
          },
          {
            "n": "ESTATE ALPHA WHITE SAUVIGNON BLANC",
            "p": 27
          },
          {
            "n": "ESTATE GEROVASILIOU VIOGNIER",
            "p": 27.9
          },
          {
            "n": "ESTATE GEROVASILIOU SAUVIGNON BLANC",
            "p": 28
          },
          {
            "n": "ESTATE GEROVASILIOU CHARDONNAY",
            "p": 28.8
          },
          {
            "n": "ESTATE Ν. LAZARIDIS MAGIC MOUNTAIN WHITE",
            "p": 31
          },
          {
            "n": "ESTATE BIBLIA CHORA OVILOS WHITE",
            "p": 38.8
          },
          {
            "n": "ANTONOPOULOS 'ANAX' CHARDONNAY",
            "p": 60.5
          },
          {
            "n": "ESTATE GEROVASILIOU MUSEUM COLLECTION WHITE",
            "p": 79
          }
        ]
      },
      {
        "g": "Magnum Bottles",
        "items": [
          {
            "n": "ESTATE BIBLIA CHORA WHITE MGN",
            "p": 45
          },
          {
            "n": "ESTATE ALPHA MALAGOUZIA MGN",
            "p": 49
          },
          {
            "n": "ESTATE GEROVASILIOU MALAGOUZIA MGN",
            "p": 50
          },
          {
            "n": "ESTATE ALPHA WHITE MGN",
            "p": 57
          },
          {
            "n": "ESTATE GEROVASILIOU VIOGNIER MGN",
            "p": 61
          },
          {
            "n": "ESTATE GEROVASILIOU SAUV.BL. MGN",
            "p": 65
          },
          {
            "n": "ESTATE GEROVASILIOU CHARDONNAY MGN",
            "p": 67
          },
          {
            "n": "ESTATE BIBLIA CHORA OVILOS WHITE MGN",
            "p": 86
          }
        ]
      },
      {
        "g": "Santorini Wines",
        "items": [
          {
            "n": "KARAMOLEGOS ESTATE TERRA NERA ASSYRTIKO",
            "p": 22
          },
          {
            "n": "SANTO WINES ASSYRTIKO",
            "p": 35.5
          },
          {
            "n": "ESTATE ARGYROS SANTORINI ASSYRTIKO WHITE",
            "p": 38.5
          },
          {
            "n": "VASSALTIS SANTORINI ASSYRTIKO",
            "p": 42
          },
          {
            "n": "KARAMOLEGOS SANTORINI KOULOURA 2023",
            "p": 38.5
          },
          {
            "n": "ESTATE GAIA THALASSITIS",
            "p": 41
          },
          {
            "n": "KARAMOLEGOS ESTATE ''34''",
            "p": 47
          },
          {
            "n": "ESTATE ARGYROS CUVEE PALATIA",
            "p": 48
          },
          {
            "n": "ESTATE ARGYROS CUVEE MONSIGNORI",
            "p": 55
          },
          {
            "n": "ESTATE SIGALAS ΟΙΑ SANTORINI",
            "p": 56
          },
          {
            "n": "KARAMOLEGOS ESTATE PIRITIS",
            "p": 59
          },
          {
            "n": "ESTATE ARGYROS CUVEE GERONTAMPELO",
            "p": 62
          },
          {
            "n": "ESTATE ARGYROS CUVEE EVDEMON",
            "p": 62
          },
          {
            "n": "MIKRA THIRA SANTORINI",
            "p": 60
          },
          {
            "n": "MIKRA THIRA NYKTERI",
            "p": 64
          },
          {
            "n": "VASSALTIS ALCYONE SANTORINI Cuvee Mythologique",
            "p": 68
          },
          {
            "n": "MIKRA THIRA TERRASEA",
            "p": 85
          },
          {
            "n": "T-OINOS CLOS STEGASTA ASSYRTIKO",
            "p": 128
          }
        ]
      },
      {
        "g": "Rose Wines",
        "items": [
          {
            "n": "ESTATE MUSES CLIO ROSE",
            "p": 9.5
          },
          {
            "n": "SKOURAS AKRES ROSE",
            "p": 11
          },
          {
            "n": "ESTATE TROUPIS FTERI ROSE",
            "p": 10.3
          },
          {
            "n": "LYKOS WINERY GEFIRA ROSE (Demi - Sec)",
            "p": 10.5
          },
          {
            "n": "ESTATE MUSES 9 ROSE",
            "p": 11.5
          },
          {
            "n": "THIMIOPOULOS ATMA ROSE",
            "p": 11.5
          },
          {
            "n": "LA TOUR MELAS NAUTILUS DRINK PINK",
            "p": 13
          },
          {
            "n": "ESTATE KIR YIANNI AKAKIES ROSE",
            "p": 13.5
          },
          {
            "n": "THIMIOPOULOS ROSE DE XINOMAVRO",
            "p": 17
          },
          {
            "n": "ARKTOS XINOMAVRO ROSE",
            "p": 17.5
          },
          {
            "n": "ESTATE MICHAELIDI QUEEN ROSE (Demi - Sec)",
            "p": 17.5
          },
          {
            "n": "ESTATE BIBLIA CHORA ROSE",
            "p": 19
          },
          {
            "n": "NAVITAS MOUNTCLOUD ROSE Bio",
            "p": 19.4
          },
          {
            "n": "ESTATE MUSES A-MUSE ROSE",
            "p": 20.8
          },
          {
            "n": "SKOURAS PEPLO ROSE",
            "p": 21
          },
          {
            "n": "ESTATE BIBLIA CHORA BIBLINOS ROSE",
            "p": 22.5
          },
          {
            "n": "DOMAINE Κ. LAZARIDIS ROSE",
            "p": 22.8
          },
          {
            "n": "LA TOUR MELAS IDYLLE D' ACHINOS",
            "p": 23.5
          },
          {
            "n": "ESTATE ALPHA ROSE",
            "p": 26
          }
        ]
      },
      {
        "g": "Magnum Bottles",
        "items": [
          {
            "n": "ESTATE MUSES A-MUSE ROSE MGN",
            "p": 42
          },
          {
            "n": "ESTATE ALPHA ROSE MGN",
            "p": 55
          },
          {
            "n": "DOMAINE Κ. LAZARIDIS ROSE MGN",
            "p": 57
          },
          {
            "n": "LA TOUR MELAS IDYLLE D. ACHINOS MGN",
            "p": 59
          }
        ]
      },
      {
        "g": "Red Wines",
        "items": [
          {
            "n": "ESTATE MUSES CLIO RED",
            "p": 9.5
          },
          {
            "n": "ESTATE TROUPIS FTERI AGIORGITIKO",
            "p": 10.7
          },
          {
            "n": "THIMIOPOULOS ATMA RED",
            "p": 11.5
          },
          {
            "n": "ESTATE SPIROPOULOS OREINO RED Agiorgitiko - Syrah",
            "p": 12
          },
          {
            "n": "ESTATE MUSES 9 RED",
            "p": 12.5
          },
          {
            "n": "DASKALAKI SILVA VORINOS RED",
            "p": 13.8
          },
          {
            "n": "ESTATE KIR YIANNI PARAGA RED",
            "p": 15.5
          },
          {
            "n": "ESTATE PAPAIOANNOU NEMEA",
            "p": 16
          },
          {
            "n": "THIMIOPOULOS XINOMAVRO NATURE",
            "p": 16
          },
          {
            "n": "ESTATE MUSES CHRISOLITHOS RED MERLOT",
            "p": 16.3
          },
          {
            "n": "ESTATE PALIVOS NEMEA",
            "p": 17
          },
          {
            "n": "ESTATE AIVALIS NEMEA",
            "p": 17
          },
          {
            "n": "MOSCHOPOLIS AIORA RED",
            "p": 17
          },
          {
            "n": "THIMIOPOULOS ALTA NAOUSSA",
            "p": 17.5
          },
          {
            "n": "ESTATE PAPAIOANNOU SYRAH",
            "p": 17.5
          },
          {
            "n": "ESTATE Ν. LAZARIDIS BLACK SHEEP RED",
            "p": 19.5
          },
          {
            "n": "ESTATE KIR YIANNI FALLEN OAK",
            "p": 19.5
          },
          {
            "n": "DIO IPSI DIALOGOS RED",
            "p": 19.8
          },
          {
            "n": "ESTATE PAPAIOANNOU PINOT NOIR",
            "p": 19.8
          },
          {
            "n": "ESTATE MICHAELIDI PILI RED",
            "p": 20.5
          },
          {
            "n": "ESTATE ALPHA SYRAH",
            "p": 22.7
          },
          {
            "n": "THIMIOPOULOS RAPSANI TERRA PETRA",
            "p": 22.7
          },
          {
            "n": "NAVITAS Terre de Zeus XINOMAVRO",
            "p": 23
          },
          {
            "n": "ESTATE KIR YIANNI DIO ELIES",
            "p": 23.5
          },
          {
            "n": "ESTATE BIBLIA CHORA RED",
            "p": 23.5
          },
          {
            "n": "ESTATE GEROVASILIOU SYRAH",
            "p": 24.5
          },
          {
            "n": "ESTATE GEROVASILIOU RED",
            "p": 24
          },
          {
            "n": "ESTATE PAVLIDIS THEMA RED",
            "p": 24
          },
          {
            "n": "THIMIOPOULOS EARTH & SKY RED XINOMAVRO",
            "p": 25
          },
          {
            "n": "Κ.LAZARIDIS CH. JULIA MERLOT",
            "p": 25.5
          },
          {
            "n": "ESTATE KIR YIANNI RAMNISTA",
            "p": 25.5
          },
          {
            "n": "ESTATE BIBLIA CHORA BIBLINOS RED",
            "p": 26
          },
          {
            "n": "NAVITAS 2919M CABERNET SAUVIGNON",
            "p": 26
          },
          {
            "n": "ESTATE VOGIATZIS TSAPOURNAKOS",
            "p": 26.5
          },
          {
            "n": "ESTATE MUSES MOUCHTARO RED",
            "p": 28.5
          },
          {
            "n": "Κ.LAZARIDIS OINOTRIA GI CAB.S. AGIORGITIKO",
            "p": 29
          },
          {
            "n": "MOSCHOPOLIS '18' RED",
            "p": 29
          },
          {
            "n": "ESTATE ALPHA XINOMAVRO RESERVE",
            "p": 30
          },
          {
            "n": "ESTATE ALPHA PINOT NOIR",
            "p": 30
          },
          {
            "n": "SKOURAS MEGAS OINOS RED",
            "p": 30.8
          },
          {
            "n": "LA TOUR MELAS CYRUS ONE",
            "p": 31
          },
          {
            "n": "ESTATE GEROVASILIOU AVATON",
            "p": 31
          },
          {
            "n": "ESTATE PAPARGIRIOU LE ROI DES MONTAGNES CAB.SAUV.",
            "p": 31
          },
          {
            "n": "ESTATE GAIAS NEMEA",
            "p": 33
          },
          {
            "n": "ESTATE ALPHA RED",
            "p": 34
          },
          {
            "n": "ANTONOPOULOS CABERNET NEA DRIS",
            "p": 35
          },
          {
            "n": "ESTATE PAPARGIRIOU LE ROI DES MONTAGNES SYRAH",
            "p": 35
          },
          {
            "n": "ESTATE AIVALIS 'LE SANG DE LA PIERRE'",
            "p": 36
          },
          {
            "n": "ESTATE GEROVASILIOU EVANGELO",
            "p": 43
          },
          {
            "n": "ESTATE Ν. LAZARIDIS MAGIC MOUNTAIN RED",
            "p": 48
          },
          {
            "n": "KARAMOLEGOS ESTATE MAVROTRAGANO",
            "p": 51
          },
          {
            "n": "ESTATE ARGYROS MAVROTRAGANO",
            "p": 53
          },
          {
            "n": "ESTATE BIBLIA CHORA OVILOS RED",
            "p": 54
          },
          {
            "n": "DIO IPSI TRILOGIA RED",
            "p": 55
          },
          {
            "n": "ESTATE SIGALAS MAVROTRAGANO",
            "p": 78
          },
          {
            "n": "ESTATE GEROVASILIOU MUSEUM COLLECTION RED",
            "p": 100
          },
          {
            "n": "LA TOUR MELAS",
            "p": 150
          },
          {
            "n": "Τ-OINOS CLOS STEGASTA MAVROTRAGANO",
            "p": 165
          }
        ]
      },
      {
        "g": "Magnum Bottles",
        "items": [
          {
            "n": "ESTATE GEROVASILIOU RED MGN 1.5Lt",
            "p": 55
          },
          {
            "n": "THIMIOPOULOS EARTH & SKY MGN 1.5Lt",
            "p": 60
          },
          {
            "n": "ESTATE GEROVASILIOU AVATON MGN 1.5Lt",
            "p": 67
          },
          {
            "n": "ESTATE ALPHA RED MGN 1.5Lt",
            "p": 80
          },
          {
            "n": "DIO IPSI TRILOGIA MGN 1.5Lt",
            "p": 105
          },
          {
            "n": "ESTATE BIBLIA CHORA OVILOS RED MGN 1.5Lt",
            "p": 110
          }
        ]
      },
      {
        "g": "Dessert Greek Wines",
        "items": [
          {
            "n": "SAMOS GRAND CRU",
            "p": 17
          },
          {
            "n": "SAMOS ANTHEMIS",
            "p": 19
          },
          {
            "n": "ESTATE ALPHA OMEGA 500ml",
            "p": 29.5
          },
          {
            "n": "KARAMOLEGOS ESTATE VINSANTO 2010 500ml",
            "p": 51
          },
          {
            "n": "ESTATE ARGYROS VINSANTO First Release 500ml",
            "p": 54
          },
          {
            "n": "ESTATE ARGYROS Late Release 500ml",
            "p": 100
          }
        ]
      }
    ]
  },
  {
    "c": "Foreign Wines",
    "groups": [
      {
        "g": "French Wines — White Wines",
        "items": [
          {
            "n": "ST. COSME MICRO-COSME BLANC",
            "p": 15
          },
          {
            "n": "BREDIF MARC VOUVRAY",
            "p": 27
          },
          {
            "n": "L.JADOT BOURGOGNE BLANC",
            "p": 32.5
          },
          {
            "n": "LOUIS LATOUR BOURGOGNE CHARDONNAY",
            "p": 33
          },
          {
            "n": "JEAN MAX ROGER SANCERRE LES CAILLOTES",
            "p": 36
          },
          {
            "n": "JEAN MAX ROGER POUILLY FUME",
            "p": 36
          },
          {
            "n": "AL.BICHOT BOURGOGNE BLANC",
            "p": 36
          },
          {
            "n": "CHRISTIAN MOREAU CHABLIS",
            "p": 37.5
          },
          {
            "n": "LANGLOIS-CHATEAU POUILLY FUME",
            "p": 38
          },
          {
            "n": "LAMBLIN CHABLIS",
            "p": 38
          },
          {
            "n": "AL.BICHOT CHABLIS",
            "p": 39.5
          },
          {
            "n": "LANGLOIS-CHATEAU SANCERRE CH.F. AUDON",
            "p": 39
          },
          {
            "n": "COMTE LAFOND SANCERRE",
            "p": 46
          },
          {
            "n": "QUIOT CHATEAUNEUF DU PAPE BL. DVL",
            "p": 46
          },
          {
            "n": "DROUHIN CHABLIS",
            "p": 46
          },
          {
            "n": "DE LADOUCETTE POUILLY FUME",
            "p": 49.8
          },
          {
            "n": "AL.BICHOT POUILLY FUISSE",
            "p": 53
          },
          {
            "n": "DOM. BILLAUD SIMON CHABLIS Cuvee Tete D'or",
            "p": 56
          },
          {
            "n": "LAMBLIN CHABLIS 1er CRU FOURCHAUME",
            "p": 59.5
          },
          {
            "n": "AL.BICHOT CHABLIS 1er Cru Vaillon",
            "p": 65.5
          },
          {
            "n": "DROUHIN CHABLIS 1ER CRU A.C.",
            "p": 68
          },
          {
            "n": "REGNARD GRAND REGNARD CHABLIS",
            "p": 71
          },
          {
            "n": "ST. COSME CONDRIEU BLANC",
            "p": 75
          },
          {
            "n": "LEFLAIVE MACON VERZE",
            "p": 75
          },
          {
            "n": "CHRISTIAN MOREAU CHABLIS MGN",
            "p": 75
          },
          {
            "n": "GUIGAL HERMITAGE BLANC",
            "p": 91
          },
          {
            "n": "BOUCHARD MEURSAULT LES CLOUS",
            "p": 122
          },
          {
            "n": "LAMBLIN CHABLIS GRAND CRU LES CLOS",
            "p": 130
          },
          {
            "n": "BARON DE L POUILLY FUME",
            "p": 135
          },
          {
            "n": "DROUHIN MEURSAULT",
            "p": 153
          },
          {
            "n": "L.JADOT CHASSAGNE MONTRACHET 1er Cru Grande Montagne",
            "p": 143
          },
          {
            "n": "LOUIS LATOUR PULIGNY MONTRACHET",
            "p": 148
          },
          {
            "n": "AL.BICHOT MEURSAULT",
            "p": 150
          },
          {
            "n": "REGNARD MEURSAULT TERRES BLANCHES",
            "p": 147
          },
          {
            "n": "L.JADOT PULIGNY MONTRACHET",
            "p": 155
          },
          {
            "n": "GUIGAL CONDR.LA DORIANE",
            "p": 150
          },
          {
            "n": "DROUHIN CHASSAGNE MONTRACHET",
            "p": 165
          },
          {
            "n": "LOUIS LATOUR PULIGNY MONTRACHET 1ER CRU",
            "p": 170
          },
          {
            "n": "DROUHIN PULIGNY MONTRACHET",
            "p": 179
          },
          {
            "n": "AL.BICHOT PULIGNY MONTRACHET",
            "p": 192
          },
          {
            "n": "BRUNO COLIN MORGEOT CHASSAGNE MONTRACHET 1er Cru",
            "p": 255
          },
          {
            "n": "SMITH HAUT LAFITE BLANC 2018",
            "p": 300
          },
          {
            "n": "BARON DE L POUILLY FUME MGN",
            "p": 275
          },
          {
            "n": "DROUHIN MEURSAULT MGN",
            "p": 310
          },
          {
            "n": "DROUHIN PULIGNY MONTR. MGN",
            "p": 330
          },
          {
            "n": "L.JADOT CORTON CHARLEMAGNE",
            "p": 470
          },
          {
            "n": "AL.BICHOT CORTON CHARLEM. GRAND CRU",
            "p": 670
          },
          {
            "n": "L.JADOT BATARD MONTRACHET 18",
            "p": 750
          },
          {
            "n": "AL.BICHOT BATARD MONTRACHET GR.CRU 2019",
            "p": 1050
          },
          {
            "n": "AL.BICHOT MONTRACHET GR.CRU 22",
            "p": 2050
          },
          {
            "n": "LEFLAIVE BATARD MONTRACHET",
            "p": 3800
          }
        ]
      },
      {
        "g": "Alsace Wines",
        "items": [
          {
            "n": "GUSTAVE LORENTZ GEWURZTRAMINER RSV",
            "p": 26
          },
          {
            "n": "GUSTAVE LORENTZ PINOT GRIS RSV",
            "p": 24.3
          },
          {
            "n": "GUSTAVE LORENTZ RIESLING RSV",
            "p": 23
          },
          {
            "n": "TRIMBACH MANDELBERG GRAND CRU RIESLING",
            "p": 80
          }
        ]
      },
      {
        "g": "Rose Wines",
        "items": [
          {
            "n": "CAVIT La Luna PINOT GRIGIO ROSE",
            "p": 12.5
          },
          {
            "n": "TORRES NATUREO ROSE ( Non Alcohol )",
            "p": 13.5
          },
          {
            "n": "TORRESELLA PINOT GRIGIO ROSE",
            "p": 14.5
          },
          {
            "n": "LE BIJOU DE SOPHIE VALROSE ROSE",
            "p": 18
          },
          {
            "n": "THE PALE ROSE BY SACHA LICHINE",
            "p": 22.5
          },
          {
            "n": "THE BEACH BY WHISPERING ANGEL",
            "p": 25
          },
          {
            "n": "PETALE DE ROSE",
            "p": 27.5
          },
          {
            "n": "BERNE UP URBAN ROSE",
            "p": 30
          },
          {
            "n": "CHATEAU D'ESTOUBLOOD ROSE",
            "p": 31
          },
          {
            "n": "BY OTT ROSE",
            "p": 32
          },
          {
            "n": "MINUTY M",
            "p": 35
          },
          {
            "n": "WHISPERING ANGEL 750ml",
            "p": 35
          },
          {
            "n": "MIRAVAL COTES DE PROVENCE ROSE",
            "p": 36
          },
          {
            "n": "ROCK ANGEL",
            "p": 47
          },
          {
            "n": "OTT BANDOL ROSE",
            "p": 57
          },
          {
            "n": "CH. D'ESCLANS",
            "p": 62
          },
          {
            "n": "BERNE UP URBAN ROSE MGN",
            "p": 68
          },
          {
            "n": "MINUTY 'M' ROSE MGN",
            "p": 72
          },
          {
            "n": "WHISPERING ANGEL MGN",
            "p": 80
          },
          {
            "n": "MIRAVAL ROSE MGN",
            "p": 80
          },
          {
            "n": "ROCK ANGEL MGN",
            "p": 96
          },
          {
            "n": "LES CLANS D'ESCLANS",
            "p": 100
          },
          {
            "n": "MINUTY 281 ROSE",
            "p": 110
          },
          {
            "n": "OTT BANDOL ROSE MGN",
            "p": 135
          },
          {
            "n": "WHISPERING ANGEL 3 LIT",
            "p": 190
          },
          {
            "n": "GARRUS",
            "p": 190
          },
          {
            "n": "WHISPERING ANGEL 6 LIT",
            "p": 480
          },
          {
            "n": "WHISPERING ANGEL 9 LIT",
            "p": 980
          }
        ]
      },
      {
        "g": "French Red Wines",
        "items": [
          {
            "n": "ST. COSME MICRO-COSME ROUGE",
            "p": 14
          },
          {
            "n": "CHATEAU DE TROIS TOURS BORDEAUX",
            "p": 16
          },
          {
            "n": "ST. COSME COTES DU RHONE ROUGE",
            "p": 18.5
          },
          {
            "n": "AL.BICHOT BOURGOGNE ROUGE",
            "p": 37
          },
          {
            "n": "LOUIS LATOUR BOURGOGNE ROUGE",
            "p": 39
          },
          {
            "n": "QUIOT CHATEAUNEUF DU PAPE RGE DVL",
            "p": 50
          },
          {
            "n": "ST COSME CHATEAUNEUF DU PAPE RGE",
            "p": 63
          },
          {
            "n": "CHATEAU CANTEMERLE 2019 Haut-Medoc",
            "p": 65
          },
          {
            "n": "LE PETIT MARQUISE DU CLOS DU MARQUIS St.julien",
            "p": 68
          },
          {
            "n": "BLASSON D'ISSAN 2019",
            "p": 78
          },
          {
            "n": "CHATEAU BELLEGRAVE 2018",
            "p": 75
          },
          {
            "n": "CH.CAMENSAC Haut - Medoc",
            "p": 78
          },
          {
            "n": "CHATEAU DE FERRAND 2019",
            "p": 85
          },
          {
            "n": "ST COSME COTE ROTIE",
            "p": 88
          },
          {
            "n": "AL.BICHOT POMMARD CLOS DE URSULINES",
            "p": 115
          },
          {
            "n": "GUIGAL COTE ROTIE",
            "p": 110
          },
          {
            "n": "L.JADOT GEVREY CHAMBERTIN",
            "p": 110
          },
          {
            "n": "MARGAUX DU CHATEAU MARGAUX 2019",
            "p": 120
          },
          {
            "n": "GUIGAL HERMITAGE ROUGE",
            "p": 120
          },
          {
            "n": "LOUIS LATOUR POMMARD",
            "p": 120
          },
          {
            "n": "CH.BRANAIRE DUCRU 14 St. Julien",
            "p": 120
          },
          {
            "n": "CH.CLOS DU MARQUIS 13 St Julien",
            "p": 125
          },
          {
            "n": "LES GRIFFONS DE PICHON BARON 2020",
            "p": 123
          },
          {
            "n": "L.JADOT NUITS ST.GEORGES",
            "p": 130
          },
          {
            "n": "CLOS DE SARPE 13 St. Emilion",
            "p": 140
          },
          {
            "n": "CH. D'ARMAILHAC 18 Pauillac",
            "p": 145
          },
          {
            "n": "CHATEAU BRANE CANTENAC 2017",
            "p": 150
          },
          {
            "n": "AL.BICHOT VOLNAY 1ER CRU LES SANTENOTS",
            "p": 153
          },
          {
            "n": "AL. BICHOT CHAMBOLLE MUSIGNY",
            "p": 180
          },
          {
            "n": "AL.BICHOT VOSNE ROMANEE",
            "p": 185
          },
          {
            "n": "AL.BICHOT POMMARD RUGIENS 1ER CRU",
            "p": 160
          },
          {
            "n": "CHATEAU NENIN 2011 Pomerol",
            "p": 160
          },
          {
            "n": "CHATEAU CANTENAC BROWN 2012 Margaux",
            "p": 160
          },
          {
            "n": "CLOS DES PAPES CHATEAUNEUF DU PAPE",
            "p": 175
          },
          {
            "n": "CHATEAU CLINET 2017 Pomerol",
            "p": 170
          },
          {
            "n": "CH.MONTROSE 12 St. Estephe",
            "p": 260
          },
          {
            "n": "CH.CANON LA GAFFELIERE 15 St. Emilion",
            "p": 250
          },
          {
            "n": "CH.LA MISSION HT-BRION 14 Pessac Leognan",
            "p": 450
          },
          {
            "n": "CH.CANON LA GAFFELIERE 16 MGN St. Emilion",
            "p": 400
          },
          {
            "n": "CH.DUCRU BEAUCAILLOU 15 St.Julien",
            "p": 450
          },
          {
            "n": "LES FORTS DE LATOUR 15 Pauillac",
            "p": 490
          },
          {
            "n": "CHATEAU PONTET CANET MGN 2013",
            "p": 550
          },
          {
            "n": "CH.HAUT BRION RGE 11 Pessac Leogn.",
            "p": 970
          },
          {
            "n": "CH.MOUTON ROTHSCHILD 11 Pauillac",
            "p": 1350
          },
          {
            "n": "CH.MOUTON ROTHSCHILD 17 Pauillac",
            "p": 1350
          },
          {
            "n": "LES FORTS DE LATOUR 15 MGN Pauillac",
            "p": 1100
          },
          {
            "n": "CH.CHEVAL BLANC 17 St. Emilion",
            "p": 1180
          },
          {
            "n": "CH.LATOUR 13 Pauillac",
            "p": 1250
          },
          {
            "n": "CH.MARGAUX 19",
            "p": 1450
          },
          {
            "n": "CH.LAFITE ROTHSCHILD 11 Pauillac",
            "p": 1500
          },
          {
            "n": "DOMAINE ROMANEE CONTI ECHEZEAUX Gr.Cru 2015",
            "p": 6200
          },
          {
            "n": "DOMAINE ROMANEE CONTI RICHERBOURG Gr.Cru 2016",
            "p": 7500
          },
          {
            "n": "CHATEAU PETRUS 2013",
            "p": 7100
          }
        ]
      },
      {
        "g": "Italian & Spanish — White Wines",
        "items": [
          {
            "n": "TORRESELLA PINOT GRIGIO",
            "p": 13.5
          },
          {
            "n": "TORRESELLA SAUVIGNON BLANC",
            "p": 13.5
          },
          {
            "n": "TORRESELLA CHARDONNAY",
            "p": 13.5
          },
          {
            "n": "SANTA MARGHERITA CHARDONNAY",
            "p": 18.5
          },
          {
            "n": "SANTA MARGHERITA PINOT GRIGIO",
            "p": 20
          },
          {
            "n": "SAN LEONARDO VETTE SAUV.BL.",
            "p": 24
          },
          {
            "n": "NITTARDI BEN VERMENTINO",
            "p": 23
          },
          {
            "n": "ANTINORI VERMENTINO",
            "p": 27
          },
          {
            "n": "FELLUGA PINOT GRIGIO VENETO",
            "p": 32
          },
          {
            "n": "FEUDI GRECO DI TUFO",
            "p": 28
          },
          {
            "n": "MASSOLINO CHARDONNAY",
            "p": 33
          },
          {
            "n": "JERMANN PINOT GRIGIO",
            "p": 42
          },
          {
            "n": "LA SCOLCA GAVI DEI GAVI ETICHETTA NERA",
            "p": 50.5
          },
          {
            "n": "GAJA VISTAMARE",
            "p": 80
          },
          {
            "n": "GAJA ROSSJ BASS",
            "p": 105
          },
          {
            "n": "GAJA ALTENI DI BRASSICA",
            "p": 210
          }
        ]
      },
      {
        "g": "Spanish Wines",
        "items": [
          {
            "n": "TORRES NATUREO MUSCAT ( Non Alcohol )",
            "p": 12.5
          },
          {
            "n": "TORRES VINA ESMERALDA",
            "p": 12.5
          }
        ]
      },
      {
        "g": "Spanish Wines — Red Wines",
        "items": [
          {
            "n": "RICASOLI CHIANTI DOCG",
            "p": 15
          },
          {
            "n": "IL FALCHETTO BARBERA D’ ASTI “PIAN SCORRONE”",
            "p": 17
          },
          {
            "n": "TASCA SICILY REGALEALI NERO D'AVOLA",
            "p": 19
          },
          {
            "n": "ZENATO VALPOLICELLA SUPERIORE DOC (Costalunga)",
            "p": 20.5
          },
          {
            "n": "ROMITORIO ROMITORO ROSSO TOSCANA",
            "p": 26.5
          },
          {
            "n": "NITTARDI CASANUOVA CHIANTI CLASSICO",
            "p": 38
          },
          {
            "n": "ANTINORI VILLA ANTINORI CHIANTI CLASSICO",
            "p": 37.5
          },
          {
            "n": "SASSICAIA 'LE DIFESE' SAN GUIDO",
            "p": 43.5
          },
          {
            "n": "MICHELE CHIARLO BARBARESCO 'PALAS'",
            "p": 48
          },
          {
            "n": "ORNELLAIA LE VOLTE",
            "p": 50
          },
          {
            "n": "PRUNOTTO BARBARESCO",
            "p": 53
          },
          {
            "n": "MASSOLINO BAROLO DOCG 750ml",
            "p": 61
          },
          {
            "n": "PRUNOTTO BAROLO",
            "p": 66
          },
          {
            "n": "ANTINORI MARCHESE CHIANTI CLASSICO TIGNANELLO",
            "p": 66
          },
          {
            "n": "GAJA PROMIS",
            "p": 68
          },
          {
            "n": "ALTESINO BRUNELLO DI MONTALCINO",
            "p": 68
          },
          {
            "n": "ZENATO AMARONE DELLA VALPOLICELLA CLASSICO",
            "p": 70
          },
          {
            "n": "GAJA SITO MORESCO",
            "p": 78
          },
          {
            "n": "BRUNELLO DI MONTALCINO IL POGGIONE",
            "p": 78
          },
          {
            "n": "SASSICAIA 'GUIDALBERTO'",
            "p": 77
          },
          {
            "n": "ANTINORI PIAN DELLE VIGNE Brunello Di Montalcino",
            "p": 90
          },
          {
            "n": "GAJA MAGARI",
            "p": 120
          },
          {
            "n": "ORNELLAIA LE VOLTE MGN",
            "p": 108
          },
          {
            "n": "LUCE DELLA VITE",
            "p": 130
          },
          {
            "n": "GAJA BRUNELLO DI MONTALCINO",
            "p": 145
          },
          {
            "n": "ANTINORI GUADO AL TASSO 21",
            "p": 290
          },
          {
            "n": "ANTINORI TIGNANELLO 21",
            "p": 300
          },
          {
            "n": "ORNELLAIA 2012",
            "p": 350
          },
          {
            "n": "ORNELLAIA 2020",
            "p": 440
          },
          {
            "n": "SASSICAIA 2022",
            "p": 580
          },
          {
            "n": "ANTINORI SOLAIA 11",
            "p": 750
          },
          {
            "n": "ANTINORI SOLAIA 13",
            "p": 760
          },
          {
            "n": "ANTINORI SOLAIA 14 MGN",
            "p": 1100
          }
        ]
      },
      {
        "g": "Spanish Wines",
        "items": [
          {
            "n": "TORRES SANGRE DE TORO",
            "p": 13.5
          },
          {
            "n": "TORRES NATUREO SYRAH ( Non Alcohol )",
            "p": 14.8
          },
          {
            "n": "CUNE VINA REAL RIOJA CRIANZA",
            "p": 17
          },
          {
            "n": "CUNE VINA REAL RIOJA RESERVA",
            "p": 30
          },
          {
            "n": "CUNE IMPERIAL RIOJA GRAN RESERVA",
            "p": 78
          },
          {
            "n": "AALTO RIBERA DEL DUERO",
            "p": 78
          },
          {
            "n": "VEGA SICILIA VALBUENA No 5",
            "p": 270
          },
          {
            "n": "VEGA SICILIA UNICO",
            "p": 650
          }
        ]
      },
      {
        "g": "Chile · New Zealand · Australia · USA — White Wines",
        "items": [
          {
            "n": "CONO SUR BICICLETA SAUVIGNON BLANC",
            "p": 11
          },
          {
            "n": "D' ARENBERG STUMP JUMP SLIGHTLY WOODED CHARDONNAY",
            "p": 14.5
          },
          {
            "n": "ALAMOS CHARDONNAY",
            "p": 15.8
          },
          {
            "n": "TORRES SANTA DIGNA SAUV.BL.RVE",
            "p": 16.5
          },
          {
            "n": "KAAPZICHT SAUVIGNON BLANC",
            "p": 17.5
          },
          {
            "n": "D' ARENBERG THE HERMIT CRAB VIOGNIER/MARSANNE",
            "p": 17.5
          },
          {
            "n": "CONO SUR RESERVA ESPECIAL SAUVIGNON BLANC",
            "p": 19
          },
          {
            "n": "D'ARENBERG RIESLING",
            "p": 20
          },
          {
            "n": "WILD ROCK SAUVIGNON BLANC",
            "p": 22
          },
          {
            "n": "CRAGGY RANGE TE MUNA SAUV. BLANC",
            "p": 25
          },
          {
            "n": "LAPIS LUNA CHARDONNAY",
            "p": 24.5
          },
          {
            "n": "VILLA MARIA SAUV. BL. PRIVATE BIN",
            "p": 25
          },
          {
            "n": "KAAPZICHT KLIPRUG CHENIN BLANC",
            "p": 26
          },
          {
            "n": "CCR MARLBOR.SAUV.BLANC",
            "p": 28.5
          },
          {
            "n": "KEN. JACKSON VINTER'S RSV CHARDONNAY",
            "p": 33
          },
          {
            "n": "MONDAVI PRIV.SELECTION CHARD.",
            "p": 36
          },
          {
            "n": "CLOUDY BAY SAUV.BLANC 750ml",
            "p": 48
          },
          {
            "n": "DAOU RESERVE CHARDONNAY PASO ROBLES",
            "p": 90
          }
        ]
      },
      {
        "g": "Chile · New Zealand · Australia · USA — Red Wines",
        "items": [
          {
            "n": "CONO SUR BICICLETA CARMENERE",
            "p": 11
          },
          {
            "n": "CONO SUR BICICLETA MERLOT",
            "p": 11
          },
          {
            "n": "CONO SUR BICICLETA PINOT NOIR",
            "p": 11
          },
          {
            "n": "D' ARENBERG STUMP JUMP GSM",
            "p": 14.5
          },
          {
            "n": "D' ARENBERG STUMP JUMP SHIRAZ",
            "p": 14.5
          },
          {
            "n": "ALAMOS MALBEC",
            "p": 15.8
          },
          {
            "n": "TORRES SANTA DIGNA CAB.SAUV.RS",
            "p": 18.5
          },
          {
            "n": "D' ARENBERG THE FOOTBOLT SHIRAZ",
            "p": 20.8
          },
          {
            "n": "KAAPZICHT SKRAALHANS PINOTAGE",
            "p": 21
          },
          {
            "n": "CATENA ZAPATA MALBEC",
            "p": 23
          },
          {
            "n": "LAPIS LUNA ZINFANDEL",
            "p": 25
          },
          {
            "n": "LAPIS LUNA PINOT NOIR",
            "p": 26.5
          },
          {
            "n": "WILD ROCK PINOT NOIR",
            "p": 30
          },
          {
            "n": "MONDAVI PRIV.SELEC.CAB.SAUV.",
            "p": 38
          },
          {
            "n": "CRAGGY RANGE 'TE MUNA' PINOT NOIR",
            "p": 46
          },
          {
            "n": "KEN. JACKSON VINTER'S CAB. SAUV.",
            "p": 54
          },
          {
            "n": "SANFORD PINOT NOIR",
            "p": 71
          },
          {
            "n": "CATENA ZAPATA NICASIA VINEYARD MALBEC",
            "p": 105
          },
          {
            "n": "CATENA ZAPATA ARGENTINO MALBEC",
            "p": 120
          },
          {
            "n": "BEAULIEU VIN. GEORGE De LATOUR PR. RSV CAB. SAUV.",
            "p": 210
          },
          {
            "n": "DAOU SOUL OF A LION CAB.SAUV. PASO ROBLES",
            "p": 225
          },
          {
            "n": "THE MASCOT NAPA VALLEY CAB. SAUV.",
            "p": 265
          },
          {
            "n": "OPUS ONE 2021",
            "p": 870
          },
          {
            "n": "PENFOLDS GRANGE 12",
            "p": 1000
          },
          {
            "n": "PENFOLDS GRANGE 09",
            "p": 1200
          }
        ]
      },
      {
        "g": "Chile · New Zealand · Australia · USA — Kosher Wines",
        "items": [
          {
            "n": "GOLAN HEIGHTS Mount Hermon WHITE KOSHER",
            "p": 22
          },
          {
            "n": "GOLAN HEIGHTS YARDEN CHARDONNAY KOSHER",
            "p": 38
          },
          {
            "n": "GOLAN HEIGHTS Mount Hermon ROSE KOSHER",
            "p": 22
          },
          {
            "n": "WHISPERING ANGEL KOSHER 750ml",
            "p": 35
          },
          {
            "n": "GOLAN HEIGHTS Mount Hermon RED KOSHER",
            "p": 22
          },
          {
            "n": "GOLAN HEIGHTS GAMLA CAB.SAUV. KOSHER",
            "p": 33
          }
        ]
      }
    ]
  }
];
