import 'dotenv/config';
import mongoose from 'mongoose';
import Blog from '../models/Blog';

const blogs = [
  {
    title: 'How to Combine Your Daily Outfit to Look Fresh and Cool',
    slug: 'how-to-combine-daily-outfit-fresh-cool',
    excerpt:
      "Maybe you don't need to buy new clothes to have a nice, cool, fresh-looking outfit every day. What you need is to combine your clothes collections — mix and match is the key.",
    image: '/blog/blogImg.png',
    author: { name: 'Priya Sharma', role: 'Style Editor' },
    tags: ['outfit', 'style tips', 'mix and match', 'fashion basics'],
    category: 'Style Tips',
    readTime: 5,
    featured: true,
    publishedAt: new Date('2026-05-20'),
    content: [
      { type: 'paragraph', text: "Getting dressed every morning doesn't have to feel like a chore — and it certainly doesn't mean you need a wardrobe bursting with the latest trends. The secret to looking stylish every single day lies in knowing how to work with what you already own." },
      { type: 'heading', text: 'Start With Neutrals as Your Foundation' },
      { type: 'paragraph', text: 'The easiest way to mix and match is to build your base outfits around neutral colours: white, black, grey, navy, and beige. These pieces pair effortlessly with almost anything, making your decisions in the morning much simpler.' },
      { type: 'heading', text: 'The Rule of Three' },
      { type: 'paragraph', text: 'When putting an outfit together, try the rule of three — top, bottom, and one accent piece (a jacket, scarf, or statement shoe). This keeps your look intentional without being overdone.' },
      { type: 'quote', text: '"Style is a way to say who you are without having to speak." — Rachel Zoe' },
      { type: 'heading', text: 'Invest in Versatile Pieces' },
      { type: 'list', items: ['A crisp white shirt that transitions from casual to formal', 'Well-fitted dark jeans that pair with anything', 'A simple blazer that elevates every look', 'Clean white sneakers that work with both casual and smart-casual outfits', 'A quality leather belt that ties everything together'] },
      { type: 'heading', text: 'Colour Pairing Made Simple' },
      { type: 'paragraph', text: "If you're unsure about colour combinations, stick to analogous colours (colours next to each other on the colour wheel) or classic contrasts like navy and white or black and camel. Avoid mixing more than three colours in a single outfit to keep things clean and cohesive." },
      { type: 'paragraph', text: 'Remember: confidence is the most important thing you can wear. When you feel good in what you are wearing, it shows.' }
    ]
  },
  {
    title: '10 Must-Have Wardrobe Essentials for Every Season',
    slug: '10-must-have-wardrobe-essentials-every-season',
    excerpt:
      'A capsule wardrobe built on the right essentials means you are always ready for any occasion — without the clutter. Here are the 10 pieces every wardrobe needs.',
    image: '/blog/blogImg.png',
    author: { name: 'Arjun Mehta', role: "Men's Fashion Editor" },
    tags: ['wardrobe essentials', 'capsule wardrobe', 'fashion basics', 'must-have'],
    category: 'Fashion Guide',
    readTime: 6,
    featured: true,
    publishedAt: new Date('2026-05-15'),
    content: [
      { type: 'paragraph', text: 'The idea of a capsule wardrobe — a small collection of timeless, versatile pieces — has been around since the 1970s. Today it is more relevant than ever. With fast fashion cluttering our closets and decision fatigue a real phenomenon, a well-curated set of essentials is your best investment.' },
      { type: 'heading', text: 'The Essential 10' },
      { type: 'list', items: [
        'White Oxford Shirt — the cornerstone of any wardrobe',
        'Dark Slim-Fit Jeans — dresses up or down effortlessly',
        'Tailored Blazer — instantly elevates any outfit',
        'Classic Trench Coat — the ultimate layering piece',
        'Neutral Crewneck Sweater — cosy and versatile',
        'Well-Fitted Chinos — smarter than jeans, more relaxed than trousers',
        'Plain White T-Shirt — the most versatile item you will ever own',
        'Clean White Sneakers — pairs with nearly everything',
        'Leather Oxford Shoes — for formal occasions',
        'Quality Leather Belt — ties every look together'
      ]},
      { type: 'heading', text: 'Quality Over Quantity' },
      { type: 'paragraph', text: 'When building your essentials, always prioritise quality. A well-made white shirt will last you years and look better with every wash, while a cheap alternative falls apart after a few seasons. Look for natural fibres like cotton, wool, and linen — they breathe better, last longer, and look more refined.' },
      { type: 'quote', text: '"Buy less, choose well, make it last." — Vivienne Westwood' },
      { type: 'heading', text: 'Adapting for the Season' },
      { type: 'paragraph', text: 'These 10 essentials work across all four seasons — the key is layering. Add a light linen shirt in summer, a chunky knit sweater in winter, and a trench coat for transitional months. With the right essentials, you will never stand in front of your wardrobe wondering what to wear.' }
    ]
  },
  {
    title: "Summer Fashion Trends 2026: What's Hot This Season",
    slug: 'summer-fashion-trends-2026',
    excerpt:
      "From oversized linen sets to bold colour blocking, summer 2026 is all about making a statement. Here's everything that's trending this season.",
    image: '/blog/blogImg.png',
    author: { name: 'Neha Gupta', role: 'Trend Reporter' },
    tags: ['trends', 'summer 2026', 'fashion', 'colour blocking', 'linen'],
    category: 'Trends',
    readTime: 4,
    featured: false,
    publishedAt: new Date('2026-05-10'),
    content: [
      { type: 'paragraph', text: 'Summer 2026 runways were dominated by one overarching theme: joyful dressing. After years of muted palettes and subdued minimalism, designers are finally giving us permission to go bold, go bright, and go big.' },
      { type: 'heading', text: '1. Oversized Linen Co-ords' },
      { type: 'paragraph', text: 'Matching linen sets — wide-leg trousers paired with relaxed blazers or shirts — are everywhere this summer. They are breathable, stylish, and effortlessly put-together. Opt for earthy tones like terracotta, sage, and ochre for a sophisticated edge.' },
      { type: 'heading', text: '2. Bold Colour Blocking' },
      { type: 'paragraph', text: 'Gone are the days of playing it safe. Summer 2026 embraces fearless colour combinations: electric blue with tangerine orange, cobalt with lime green, hot pink with red. The bolder, the better.' },
      { type: 'heading', text: '3. Sheer Fabrics & Layering' },
      { type: 'paragraph', text: 'Sheer organza shirts, mesh tops, and translucent skirts are making a big comeback. Style them over a simple slip dress or bralette for an effortlessly chic look that works from daytime brunch to evening dinner.' },
      { type: 'heading', text: '4. Platform Sandals' },
      { type: 'paragraph', text: '70s-inspired platform sandals continue their reign. In leather, raffia, or bold metallic finishes, these shoes add instant height and drama to any summer outfit.' },
      { type: 'quote', text: '"Fashion is the armour to survive the reality of everyday life." — Bill Cunningham' },
      { type: 'heading', text: '5. Relaxed Tailoring' },
      { type: 'paragraph', text: 'Workwear gets a summer refresh with relaxed-fit blazers, flowy wide-leg trousers, and unstructured suit jackets. Think soft shoulders, breathable fabrics, and easy silhouettes that feel as comfortable as loungewear but look polished.' }
    ]
  },
  {
    title: "The Ultimate Guide to Men's Casual Wear",
    slug: 'ultimate-guide-mens-casual-wear',
    excerpt:
      "Smart casual, business casual, weekend casual — the terminology is confusing. This guide breaks down every level of men's casual dress so you always look the part.",
    image: '/blog/blogImg.png',
    author: { name: 'Arjun Mehta', role: "Men's Fashion Editor" },
    tags: ["men's fashion", 'casual wear', 'smart casual', 'style guide'],
    category: 'Fashion Guide',
    readTime: 7,
    featured: false,
    publishedAt: new Date('2026-05-05'),
    content: [
      { type: 'paragraph', text: "Men's dress codes can feel like a minefield. Smart casual, business casual, resort casual — what does it all mean, and how do you navigate these murky waters without either overdressing or looking sloppy? This guide breaks it all down clearly." },
      { type: 'heading', text: 'Weekend Casual' },
      { type: 'paragraph', text: 'This is the most relaxed end of the spectrum: jeans or chinos, a plain t-shirt or casual shirt, and clean trainers or loafers. The key is fit — even the most casual outfit looks intentional when the clothes fit well.' },
      { type: 'heading', text: 'Smart Casual' },
      { type: 'paragraph', text: 'Smart casual sits between formal and relaxed. Think tailored chinos or slim trousers, a button-down shirt (tucked in), a blazer, and leather shoes or clean white sneakers. This is the dress code for most upscale restaurants, gallery openings, and evening events.' },
      { type: 'heading', text: 'Business Casual' },
      { type: 'paragraph', text: 'In a modern office setting, business casual means well-fitted trousers, a collared shirt (no tie), and leather shoes or neat loafers. A blazer is optional but always a good idea.' },
      { type: 'quote', text: '"Dress for where you want to be, not where you are."' },
      { type: 'heading', text: 'Key Rules for Every Level' },
      { type: 'list', items: [
        'Fit is everything — tailor your clothes if necessary',
        'Keep shoes clean — they define the dress code more than anything else',
        'Layer intelligently — a blazer or jacket instantly smarts up any outfit',
        'Avoid logos — branded pieces look casual; plain pieces look refined',
        'Invest in quality basics — they last longer and photograph better'
      ]},
      { type: 'paragraph', text: 'Remember: knowing your dress code and dressing appropriately for it is a sign of emotional intelligence. It shows respect for the occasion and the people around you.' }
    ]
  },
  {
    title: 'Building a Capsule Wardrobe on a Budget',
    slug: 'building-capsule-wardrobe-on-budget',
    excerpt:
      "You don't need to spend a fortune to dress well. With the right strategy and a handful of versatile pieces, you can build a capsule wardrobe that lasts for years.",
    image: '/blog/blogImg.png',
    author: { name: 'Priya Sharma', role: 'Style Editor' },
    tags: ['capsule wardrobe', 'budget fashion', 'style tips', 'shopping guide'],
    category: 'Style Tips',
    readTime: 6,
    featured: false,
    publishedAt: new Date('2026-04-28'),
    content: [
      { type: 'paragraph', text: 'There is a persistent myth that dressing well requires a large budget. The truth is, a strategically built wardrobe of 20 versatile pieces beats a closet overflowing with impulse purchases every single time.' },
      { type: 'heading', text: 'Audit What You Already Have' },
      { type: 'paragraph', text: 'Before spending a single rupee, take everything out of your wardrobe. Sort into three piles: love it, maybe, and out. You will almost certainly find forgotten gems that fit your capsule perfectly.' },
      { type: 'heading', text: 'The Priority Purchase Order' },
      { type: 'list', items: [
        'First: Well-fitting bottoms (1–2 pairs of dark jeans, 1 pair of chinos)',
        'Second: Tops that pair with everything (white shirts, plain tees, a neutral sweater)',
        'Third: One quality outer layer (a coat or jacket)',
        'Fourth: Two pairs of shoes (one casual, one slightly dressy)',
        'Fifth: Accessories (one belt, a simple watch)'
      ]},
      { type: 'heading', text: 'Where to Shop Smart' },
      { type: 'paragraph', text: 'End-of-season sales are your best friend. Retailers clear up to 70% off quality pieces in January and July. Second-hand shopping apps and thrift stores also yield incredible finds — the key is to look for natural fabrics and check stitching quality before buying.' },
      { type: 'quote', text: '"It is not about having less. It is about making room for what matters." — Marie Kondo' },
      { type: 'heading', text: 'Cost Per Wear' },
      { type: 'paragraph', text: 'When evaluating a purchase, calculate the cost per wear: price divided by the number of times you will wear it. A ₹3000 white shirt worn 100 times costs ₹30 per wear. A ₹500 trendy top worn twice costs ₹250 per wear. The economics of quality are clear.' }
    ]
  },
  {
    title: 'The Art of Accessorizing: Elevate Any Outfit',
    slug: 'art-of-accessorizing-elevate-outfit',
    excerpt:
      'The right accessories can transform a basic outfit into a memorable look. From watches and belts to bags and jewellery — here is how to accessorize like a pro.',
    image: '/blog/blogImg.png',
    author: { name: 'Sneha Patel', role: 'Accessories Editor' },
    tags: ['accessories', 'watches', 'jewellery', 'bags', 'style tips'],
    category: 'Style Tips',
    readTime: 5,
    featured: false,
    publishedAt: new Date('2026-04-20'),
    content: [
      { type: 'paragraph', text: 'Accessories are the punctuation marks of an outfit — they bring clarity, personality, and polish to even the most basic look. The secret is knowing how to use them without going overboard.' },
      { type: 'heading', text: 'The Golden Rule: Less Is More' },
      { type: 'paragraph', text: 'As a general rule, choose one statement piece per outfit and let everything else play a supporting role. If you are wearing a bold statement necklace, keep earrings minimal. If you are carrying a colourful bag, keep your shoes and belt neutral.' },
      { type: 'heading', text: 'For Men: The Core Four' },
      { type: 'list', items: [
        'A quality watch — the single most impactful accessory for men',
        'A leather belt that matches your shoes',
        'A pocket square for formal occasions',
        'Sunglasses that suit your face shape'
      ]},
      { type: 'heading', text: 'For Women: The Layering Approach' },
      { type: 'paragraph', text: 'Women have more licence to layer accessories — the key is cohesion. Stack delicate gold necklaces of different lengths, mix rings of similar metals, and choose a bag that complements rather than matches your outfit.' },
      { type: 'quote', text: '"Accessories are like vitamins to fashion — as with the proper dosage, they can be absolutely vital." — Anna Dello Russo' },
      { type: 'heading', text: 'Matching Metals' },
      { type: 'paragraph', text: 'Stick to one metal tone per outfit: either gold or silver (or rose gold), not both. This creates a cohesive, intentional look. Your belt buckle, watch case, rings, and necklace chains should all be in the same family.' },
      { type: 'heading', text: 'The Power of a Good Bag' },
      { type: 'paragraph', text: 'A quality leather bag — whether a tote, crossbody, or structured handbag — is one of the best wardrobe investments you can make. It is immediately noticed and remembered. Choose a neutral colour (black, tan, or cognac) and it will work with 90% of your wardrobe.' }
    ]
  },
  {
    title: 'How to Care for Your Clothes: Expert Washing & Storage Tips',
    slug: 'how-to-care-for-clothes-washing-storage-tips',
    excerpt:
      'The best way to save money on clothes is to make the ones you own last longer. These expert care tips will extend the life of your garments and keep them looking new.',
    image: '/blog/blogImg.png',
    author: { name: 'Ritu Verma', role: 'Sustainable Fashion Writer' },
    tags: ['clothing care', 'laundry tips', 'sustainable fashion', 'wardrobe maintenance'],
    category: 'Care & Maintenance',
    readTime: 6,
    featured: false,
    publishedAt: new Date('2026-04-12'),
    content: [
      { type: 'paragraph', text: "Most clothing damage does not happen through wear — it happens through improper washing and storage. Follow these expert tips to dramatically extend the life of your garments and reduce your clothing waste." },
      { type: 'heading', text: 'Read the Care Label First' },
      { type: 'paragraph', text: 'The care label is the garment manufacturer telling you exactly how not to ruin their product. Ignoring it is the single biggest cause of clothing damage. Before washing anything new, take 30 seconds to read the symbols on the label.' },
      { type: 'heading', text: 'Washing Best Practices' },
      { type: 'list', items: [
        'Wash dark colours inside out to prevent fading',
        'Use cold water for most garments — it is gentler and saves energy',
        'Separate lights and darks — always',
        'Wash delicates in a mesh laundry bag',
        'Do not over-stuff the washing machine — clothes need room to move',
        'Air dry instead of tumble drying whenever possible'
      ]},
      { type: 'heading', text: 'Stain Removal 101' },
      { type: 'paragraph', text: 'Act quickly — the longer a stain sits, the harder it is to remove. For most stains, dab (never rub) with cold water and a gentle detergent. For protein stains (blood, sweat), always use cold water — hot water sets protein stains permanently.' },
      { type: 'quote', text: '"Taking care of your clothes is one of the most sustainable things you can do."' },
      { type: 'heading', text: 'Storage Tips' },
      { type: 'list', items: [
        'Hang knitwear flat rather than on a hanger — hangers stretch the shoulders',
        'Use cedar blocks in your wardrobe to deter moths naturally',
        'Store seasonal clothing in breathable cotton bags, not plastic',
        'Leave some space between hanging garments — they need airflow',
        'Button shirts before hanging to maintain collar shape'
      ]},
      { type: 'heading', text: 'Ironing & Steaming' },
      { type: 'paragraph', text: 'A garment steamer is one of the best investments for a clothes-conscious person. It is faster than ironing, gentler on fabrics, kills bacteria, and works on items you cannot easily iron (like tailored jackets and silk blouses).' }
    ]
  },
  {
    title: 'Street Style vs Smart Casual: Knowing the Difference',
    slug: 'street-style-vs-smart-casual-knowing-the-difference',
    excerpt:
      'Both street style and smart casual are beloved dress codes — but they follow very different rules. Understanding the distinction will help you dress appropriately for every occasion.',
    image: '/blog/blogImg.png',
    author: { name: 'Karan Nair', role: 'Street Style Correspondent' },
    tags: ['street style', 'smart casual', 'dress code', 'style guide', "men's fashion"],
    category: 'Fashion Guide',
    readTime: 5,
    featured: false,
    publishedAt: new Date('2026-04-05'),
    content: [
      { type: 'paragraph', text: 'Street style and smart casual are two of the most popular dress codes in modern fashion — but they are often confused with each other, or worse, used interchangeably. Understanding the nuances between them will make you a more confident and contextually appropriate dresser.' },
      { type: 'heading', text: 'What Is Street Style?' },
      { type: 'paragraph', text: 'Street style emerged from urban youth culture and is characterised by self-expression, subculture references, and a DIY aesthetic. It often features: oversized silhouettes, graphic tees and hoodies, statement sneakers (often limited edition), unconventional layering, and visible brand logos (especially streetwear labels).' },
      { type: 'heading', text: 'What Is Smart Casual?' },
      { type: 'paragraph', text: 'Smart casual is a more polished, professional look that retains comfort and approachability. It features: well-fitted chinos or tailored trousers, collared shirts (polo, Oxford, or casual button-down), loafers or clean leather sneakers, minimal accessories, and structured outerwear.' },
      { type: 'heading', text: 'The Key Differences at a Glance' },
      { type: 'list', items: [
        'Fit: Street style embraces oversized; smart casual favours fitted',
        'Shoes: Chunky sneakers vs. clean trainers or loafers',
        'Occasion: Street style for social/creative settings; smart casual for offices and restaurants',
        'Graphics: Street style welcomes bold graphics; smart casual avoids them',
        'Formality: Smart casual is one step above street; both are below business casual'
      ]},
      { type: 'quote', text: '"Fashion is about dressing according to what\'s fashionable. Style is more about being yourself." — Oscar de la Renta' },
      { type: 'heading', text: 'Can You Mix Them?' },
      { type: 'paragraph', text: "Absolutely — and this hybrid is called 'elevated streetwear'. A great example: well-fitted dark jeans + a plain fitted tee + a structured blazer + premium leather sneakers. It sits comfortably between both worlds and works for a surprisingly wide range of occasions." }
    ]
  }
];

async function seedBlogs(): Promise<void> {
  try {
    await mongoose.connect(process.env.MONGODB_URI as string);
    console.log('Connected to MongoDB');

    await Blog.deleteMany({});
    console.log('Cleared existing blogs');

    const inserted = await Blog.insertMany(blogs);
    console.log(`Inserted ${inserted.length} blog posts`);

    await mongoose.disconnect();
    console.log('Done');
    process.exit(0);
  } catch (err) {
    console.error('Seed failed:', err);
    process.exit(1);
  }
}

seedBlogs();
