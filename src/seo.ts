type Scope = 'world' | 'usa' | 'usaParks' | 'europe' | 'china' | 'india';

interface SeoMeta {
  title: string;
  description: string;
  keywords: string;
  canonicalPath: string;
  ogTitle: string;
  ogDescription: string;
  jsonLd: object;
  heading: string;
  semanticDescription: string;
}

const SITE_URL = 'https://travel-tracker.org';

const SEO_CONFIG: Record<Scope, SeoMeta> = {
  world: {
    title: 'World Travel Map - Track Visited Countries | Travel Tracker',
    description: 'Your countries to visit checklist. Track every country you have visited on an interactive world map. Check off 240+ countries and territories, see your travel bucket list progress, and share stats with friends.',
    keywords: 'world travel map, countries to visit checklist, travel bucket list check off, track visited countries, countries visited tracker, scratch map online, how many countries visited, interactive world map',
    canonicalPath: '/world',
    ogTitle: 'World Travel Map - Track Your Visited Countries',
    ogDescription: 'Your travel bucket list checklist. Mark every country you have visited on an interactive world map and check them off.',
    heading: 'World Travel Map - Countries to Visit Checklist',
    semanticDescription: 'Interactive world map and countries to visit checklist. Click any country to check it off your bucket list. Track 240+ countries and territories, see your completion percentage, and save your travel checklist progress across devices.',
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
    title: 'US States Travel Map - 50 States Checklist | Travel Tracker',
    description: 'The ultimate 50 states checklist. Track which US states you have visited, check them off on an interactive map, see your completion percentage, and plan your next road trip across America.',
    keywords: 'US states visited map, 50 states checklist, states to visit checklist check off, states been to map, USA travel bucket list, road trip planner, how many states have I visited',
    canonicalPath: '/usa',
    ogTitle: 'US States Travel Map - 50 States Checklist to Check Off',
    ogDescription: 'Your 50 states bucket list. Check off each state you have visited on an interactive map and track your progress.',
    heading: 'US States Travel Map - 50 States Checklist',
    semanticDescription: 'Interactive USA map and 50 states checklist. Click any state to check it off your bucket list. Track your progress across all 50 states with completion percentages. The ultimate states visited checklist to check off.',
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
    title: 'US National Parks Checklist - 63 Parks to Visit | Travel Tracker',
    description: 'Your national parks checklist. Track all 63 US national parks to visit and check off. Mark parks from Yellowstone to Yosemite on an interactive map and complete your national parks bucket list.',
    keywords: 'national parks checklist, 63 national parks to visit and check off, national parks bucket list, national parks passport checklist, US national parks tracker, how many national parks visited',
    canonicalPath: '/usa-parks',
    ogTitle: 'US National Parks Checklist - 63 Parks to Visit and Check Off',
    ogDescription: 'Your national parks bucket list. Check off all 63 parks from Yellowstone to Yosemite and track your progress.',
    heading: 'US National Parks Checklist - Parks to Visit and Check Off',
    semanticDescription: 'Interactive national parks checklist. Click any park to check it off your bucket list. Track all 63 US national parks to visit, from Yellowstone to Yosemite, Grand Canyon to Zion. The ultimate national parks passport checklist.',
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
    title: 'Europe Travel Map - European Countries Checklist | Travel Tracker',
    description: 'Your European countries checklist. Track which countries you have visited, check them off on an interactive Europe map, see your coverage percentage, and plan your next European adventure.',
    keywords: 'European countries checklist, Europe travel bucket list check off, countries visited in Europe, European countries tracker, Europe bucket list, how many European countries visited',
    canonicalPath: '/europe',
    ogTitle: 'Europe Travel Map - European Countries Checklist',
    ogDescription: 'Your Europe travel bucket list. Check off European countries you have visited on an interactive map.',
    heading: 'Europe Travel Map - European Countries Checklist',
    semanticDescription: 'Interactive Europe map and European countries checklist. Click any country to check it off your travel bucket list. Track your coverage across all European nations and see how many you have visited.',
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
    title: 'China Province Map - Chinese Provinces Checklist | Travel Tracker',
    description: 'Your Chinese provinces checklist. Track which provinces and regions you have visited, check them off on an interactive China map, and see how much of the country you have explored.',
    keywords: 'Chinese provinces checklist, China travel bucket list check off, China province map, provinces visited China, China regions map, China travel planner',
    canonicalPath: '/china',
    ogTitle: 'China Province Map - Chinese Provinces Checklist',
    ogDescription: 'Your China travel bucket list. Check off provinces you have visited on an interactive map.',
    heading: 'China Province Map - Chinese Provinces Checklist',
    semanticDescription: 'Interactive China map and Chinese provinces checklist. Click any province to check it off your travel bucket list. Track your exploration across all Chinese provinces, autonomous regions, and municipalities.',
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
    title: 'India States Map - Indian States Checklist | Travel Tracker',
    description: 'Your Indian states checklist. Track which states and union territories you have visited, check them off on an interactive India map, and see your exploration percentage.',
    keywords: 'Indian states checklist, India states to visit and check off, India travel bucket list, India states map, states visited India, India regions map',
    canonicalPath: '/india',
    ogTitle: 'India States Map - Indian States Checklist',
    ogDescription: 'Your India travel bucket list. Check off states you have visited on an interactive map.',
    heading: 'India States Map - Indian States Checklist',
    semanticDescription: 'Interactive India map and Indian states checklist. Click any state to check it off your travel bucket list. Track your exploration across all 36 Indian states and union territories.',
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

  const mapContainer = document.getElementById('map-container');
  if (mapContainer) {
    mapContainer.setAttribute('aria-label', config.heading);
    let seoBlock = document.getElementById('seo-hidden-content');
    if (!seoBlock) {
      seoBlock = document.createElement('div');
      seoBlock.id = 'seo-hidden-content';
      seoBlock.style.cssText = 'position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border:0';
      mapContainer.appendChild(seoBlock);
    }
    seoBlock.innerHTML = `<h2>${config.heading}</h2><p>${config.semanticDescription}</p>`;
  }
}
