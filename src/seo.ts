type Scope = 'world' | 'usa' | 'usaParks' | 'europe' | 'china' | 'india';

interface SeoMeta {
  title: string;
  description: string;
  keywords: string;
  canonicalPath: string;
  ogTitle: string;
  ogDescription: string;
  jsonLd: object;
}

const SITE_URL = 'https://travel-tracker.org';

const SEO_CONFIG: Record<Scope, SeoMeta> = {
  world: {
    title: 'World Travel Map - Track Visited Countries | Travel Tracker',
    description: 'Track every country you have visited on an interactive world map. Mark your travels across 240+ countries and territories, see your progress percentage, and share your travel stats with friends.',
    keywords: 'world travel map, track visited countries, countries visited tracker, scratch map online, travel bucket list, how many countries visited, interactive world map',
    canonicalPath: '/world',
    ogTitle: 'World Travel Map - Track Your Visited Countries',
    ogDescription: 'Mark every country you have visited on an interactive world map. Track your travel progress and share your journey.',
    jsonLd: {
      "@context": "https://schema.org",
      "@type": "WebPage",
      "name": "World Travel Map",
      "description": "Track every country you have visited on an interactive world map with 240+ countries and territories.",
      "url": `${SITE_URL}/world`,
      "isPartOf": { "@type": "WebSite", "name": "Travel Tracker", "url": SITE_URL },
      "breadcrumb": {
        "@type": "BreadcrumbList",
        "itemListElement": [
          { "@type": "ListItem", "position": 1, "name": "Travel Tracker", "item": SITE_URL },
          { "@type": "ListItem", "position": 2, "name": "World Map", "item": `${SITE_URL}/world` }
        ]
      }
    }
  },
  usa: {
    title: 'US States Travel Map - Track All 50 States | Travel Tracker',
    description: 'Track which US states you have visited on an interactive map. Mark all 50 states, see your completion percentage, and plan your next road trip across America.',
    keywords: 'US states visited map, 50 states tracker, states been to map, USA travel tracker, road trip planner, states visited checklist, how many states have I visited',
    canonicalPath: '/usa',
    ogTitle: 'US States Travel Map - Track All 50 States You Have Visited',
    ogDescription: 'How many US states have you been to? Mark your visited states on an interactive map and track your progress to all 50.',
    jsonLd: {
      "@context": "https://schema.org",
      "@type": "WebPage",
      "name": "US States Travel Map",
      "description": "Track which US states you have visited on an interactive map. Mark all 50 states and see your completion percentage.",
      "url": `${SITE_URL}/usa`,
      "isPartOf": { "@type": "WebSite", "name": "Travel Tracker", "url": SITE_URL },
      "breadcrumb": {
        "@type": "BreadcrumbList",
        "itemListElement": [
          { "@type": "ListItem", "position": 1, "name": "Travel Tracker", "item": SITE_URL },
          { "@type": "ListItem", "position": 2, "name": "USA States Map", "item": `${SITE_URL}/usa` }
        ]
      }
    }
  },
  usaParks: {
    title: 'US National Parks Tracker - Mark Visited Parks | Travel Tracker',
    description: 'Track which US national parks you have visited. Mark parks across America on an interactive map, from Yellowstone to Yosemite, and plan your next outdoor adventure.',
    keywords: 'national parks tracker, national parks visited map, US national parks checklist, national parks bucket list, how many national parks visited, park passport tracker',
    canonicalPath: '/usa-parks',
    ogTitle: 'US National Parks Tracker - How Many Parks Have You Visited?',
    ogDescription: 'Track your visits to US national parks on an interactive map. Mark parks you have been to and discover which ones to visit next.',
    jsonLd: {
      "@context": "https://schema.org",
      "@type": "WebPage",
      "name": "US National Parks Tracker",
      "description": "Track which US national parks you have visited on an interactive map. Mark parks from Yellowstone to Yosemite.",
      "url": `${SITE_URL}/usa-parks`,
      "isPartOf": { "@type": "WebSite", "name": "Travel Tracker", "url": SITE_URL },
      "breadcrumb": {
        "@type": "BreadcrumbList",
        "itemListElement": [
          { "@type": "ListItem", "position": 1, "name": "Travel Tracker", "item": SITE_URL },
          { "@type": "ListItem", "position": 2, "name": "US National Parks", "item": `${SITE_URL}/usa-parks` }
        ]
      }
    }
  },
  europe: {
    title: 'Europe Travel Map - Track Visited European Countries | Travel Tracker',
    description: 'Track which European countries you have visited on an interactive map. Mark your travels across Europe, see your coverage percentage, and plan your next European adventure.',
    keywords: 'Europe travel map, countries visited in Europe, European countries tracker, Europe bucket list, how many European countries visited, Europe trip planner',
    canonicalPath: '/europe',
    ogTitle: 'Europe Travel Map - Track Visited European Countries',
    ogDescription: 'How many European countries have you been to? Mark your visited countries on an interactive Europe map.',
    jsonLd: {
      "@context": "https://schema.org",
      "@type": "WebPage",
      "name": "Europe Travel Map",
      "description": "Track which European countries you have visited on an interactive map of Europe.",
      "url": `${SITE_URL}/europe`,
      "isPartOf": { "@type": "WebSite", "name": "Travel Tracker", "url": SITE_URL },
      "breadcrumb": {
        "@type": "BreadcrumbList",
        "itemListElement": [
          { "@type": "ListItem", "position": 1, "name": "Travel Tracker", "item": SITE_URL },
          { "@type": "ListItem", "position": 2, "name": "Europe Map", "item": `${SITE_URL}/europe` }
        ]
      }
    }
  },
  china: {
    title: 'China Province Map - Track Visited Provinces | Travel Tracker',
    description: 'Track which Chinese provinces and regions you have visited on an interactive map. Mark your travels across China and see how much of the country you have explored.',
    keywords: 'China province map, China travel tracker, provinces visited China, China regions map, China travel planner, Chinese provinces checklist',
    canonicalPath: '/china',
    ogTitle: 'China Province Map - Track Your Visited Provinces',
    ogDescription: 'Mark the Chinese provinces you have visited on an interactive map. Track your exploration across all of China.',
    jsonLd: {
      "@context": "https://schema.org",
      "@type": "WebPage",
      "name": "China Province Travel Map",
      "description": "Track which Chinese provinces and regions you have visited on an interactive map.",
      "url": `${SITE_URL}/china`,
      "isPartOf": { "@type": "WebSite", "name": "Travel Tracker", "url": SITE_URL },
      "breadcrumb": {
        "@type": "BreadcrumbList",
        "itemListElement": [
          { "@type": "ListItem", "position": 1, "name": "Travel Tracker", "item": SITE_URL },
          { "@type": "ListItem", "position": 2, "name": "China Map", "item": `${SITE_URL}/china` }
        ]
      }
    }
  },
  india: {
    title: 'India States Map - Track Visited States | Travel Tracker',
    description: 'Track which Indian states and union territories you have visited on an interactive map. Mark your travels across India and see your exploration percentage.',
    keywords: 'India states map, India travel tracker, states visited India, India regions map, Indian states checklist, India travel planner',
    canonicalPath: '/india',
    ogTitle: 'India States Map - Track Your Visited States',
    ogDescription: 'Mark the Indian states you have visited on an interactive map. Track your journey across all of India.',
    jsonLd: {
      "@context": "https://schema.org",
      "@type": "WebPage",
      "name": "India States Travel Map",
      "description": "Track which Indian states and union territories you have visited on an interactive map.",
      "url": `${SITE_URL}/india`,
      "isPartOf": { "@type": "WebSite", "name": "Travel Tracker", "url": SITE_URL },
      "breadcrumb": {
        "@type": "BreadcrumbList",
        "itemListElement": [
          { "@type": "ListItem", "position": 1, "name": "Travel Tracker", "item": SITE_URL },
          { "@type": "ListItem", "position": 2, "name": "India Map", "item": `${SITE_URL}/india` }
        ]
      }
    }
  }
};

export function updateSeoMeta(scope: Scope): void {
  const config = SEO_CONFIG[scope];

  document.title = config.title;

  const metaDesc = document.querySelector('meta[name="description"]');
  if (metaDesc) metaDesc.setAttribute('content', config.description);

  const metaKeywords = document.querySelector('meta[name="keywords"]');
  if (metaKeywords) metaKeywords.setAttribute('content', config.keywords);

  let canonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
  if (!canonical) {
    canonical = document.createElement('link');
    canonical.setAttribute('rel', 'canonical');
    document.head.appendChild(canonical);
  }
  canonical.setAttribute('href', `${SITE_URL}${config.canonicalPath}`);

  const ogUrl = document.querySelector('meta[property="og:url"]');
  if (ogUrl) ogUrl.setAttribute('content', `${SITE_URL}${config.canonicalPath}`);

  const ogTitle = document.querySelector('meta[property="og:title"]');
  if (ogTitle) ogTitle.setAttribute('content', config.ogTitle);

  const ogDesc = document.querySelector('meta[property="og:description"]');
  if (ogDesc) ogDesc.setAttribute('content', config.ogDescription);

  const twUrl = document.querySelector('meta[property="twitter:url"]');
  if (twUrl) twUrl.setAttribute('content', `${SITE_URL}${config.canonicalPath}`);

  const twTitle = document.querySelector('meta[property="twitter:title"]');
  if (twTitle) twTitle.setAttribute('content', config.ogTitle);

  const twDesc = document.querySelector('meta[property="twitter:description"]');
  if (twDesc) twDesc.setAttribute('content', config.ogDescription);

  let jsonLdScript = document.querySelector('script[data-seo="dynamic"]') as HTMLScriptElement | null;
  if (!jsonLdScript) {
    jsonLdScript = document.createElement('script');
    jsonLdScript.setAttribute('type', 'application/ld+json');
    jsonLdScript.setAttribute('data-seo', 'dynamic');
    document.head.appendChild(jsonLdScript);
  }
  jsonLdScript.textContent = JSON.stringify(config.jsonLd);
}
