import { useState, useEffect, useRef, useCallback } from 'react';
import * as d3 from 'd3';
import { geoMiller } from 'd3-geo-projection';
import { feature } from 'topojson-client';
import { union } from '@turf/turf';
import type { FeatureCollection, Feature } from 'geojson';
import type { Topology, GeometryCollection } from 'topojson-specification';
import logoImage from '/logo_tt.png';
import nationalParksGeoJsonUrl from '../public/data/geojson/national-parks.geojson?url';
import './App.css';

// Type definitions
type Scope = 'world' | 'usa' | 'usaParks' | 'europe' | 'china' | 'india';
type NotificationType = 'success' | 'error';

interface GeoFeature extends Feature {
  properties: {
    name: string;
    [key: string]: unknown;
  };
}

interface TopoData extends Topology {
  objects: {
    states: GeometryCollection;
  };
}

// Constants
// Using Natural Earth 110m data which includes ~177 countries (standard for most world maps)
// Note: Different datasets have different counts. UN recognizes 195 countries total.
const WORLD_GEOJSON_URL = 'https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/world.geojson';
const USA_STATES_URL = 'https://unpkg.com/us-atlas@3.0.0/states-10m.json';
const NATIONAL_PARKS_GEOJSON_URL = nationalParksGeoJsonUrl;
const CHINA_PROVINCES_URL = 'https://raw.githubusercontent.com/junwang23/geoCN/refs/heads/master/geojson/china_provinces.json';
const EUROPE_TOPJSON_URL = 'https://raw.githubusercontent.com/leakyMirror/map-of-europe/refs/heads/master/TopoJSON/europe.topojson';
const INDIA_STATES_URL = 'https://raw.githubusercontent.com/adarshbiradar/maps-geojson/refs/heads/master/india.json';

function App() {
  // State management
  const [currentScope, setCurrentScope] = useState<Scope>('world');
  const [activeLocations, setActiveLocations] = useState<Set<string>>(new Set());
  const [showLabels, setShowLabels] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showListOnMobile, setShowListOnMobile] = useState(false);
  const [worldCountryFeatures, setWorldCountryFeatures] = useState<GeoFeature[]>([]);
  const [usStateFeatures, setUsStateFeatures] = useState<GeoFeature[]>([]);
  const [usNationalParkFeatures, setUsNationalParkFeatures] = useState<GeoFeature[]>([]);
  const [europeCountryFeatures, setEuropeCountryFeatures] = useState<GeoFeature[]>([]);
  const [chinaProvinceFeatures, setChinaProvinceFeatures] = useState<GeoFeature[]>([]);
  const [indiaStateFeatures, setIndiaStateFeatures] = useState<GeoFeature[]>([]);

  // Refs for D3.js
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const listContainerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement | null>(null);
  const mapGroupRef = useRef<d3.Selection<SVGGElement, unknown, null, undefined> | null>(null);
  const labelGroupRef = useRef<d3.Selection<SVGGElement, unknown, null, undefined> | null>(null);
  const hoverLabelGroupRef = useRef<d3.Selection<SVGGElement, unknown, null, undefined> | null>(null);
  const parkGroupRef = useRef<d3.Selection<SVGGElement, unknown, null, undefined> | null>(null);
  const zoomRef = useRef<d3.ZoomBehavior<SVGSVGElement, unknown> | null>(null);
  const pathRef = useRef<d3.GeoPath | null>(null);
  const currentProjectionRef = useRef<d3.GeoProjection | null>(null);
  const initialTransformRef = useRef<d3.ZoomTransform>(d3.zoomIdentity);
  const isUpdatingScopeRef = useRef(false);

  // Computed values
  const currentFeatures = 
    currentScope === 'world' ? worldCountryFeatures :
    currentScope === 'usa' ? usStateFeatures :
    currentScope === 'usaParks' ? usStateFeatures :
    currentScope === 'europe' ? europeCountryFeatures :
    currentScope === 'china' ? chinaProvinceFeatures :
    indiaStateFeatures;

  const selectableFeatures = currentScope === 'usaParks'
    ? usNationalParkFeatures
    : currentFeatures;
  
  const locationTypeLabel = 
    currentScope === 'world' ? 'Countries' :
    currentScope === 'usa' ? 'States' :
    currentScope === 'usaParks' ? 'National Parks' :
    currentScope === 'europe' ? 'Countries' :
    currentScope === 'china' ? 'Provinces' :
    'States';
  
  const totalTypeLabel = 
    currentScope === 'world' ? '% World' :
    currentScope === 'usa' ? '% USA' :
    currentScope === 'usaParks' ? '% Parks' :
    currentScope === 'europe' ? '% Europe' :
    currentScope === 'china' ? '% China' :
    '% India';
  
  const mapTitle = 
    currentScope === 'world' ? 'World Map' :
    currentScope === 'usa' ? 'USA Map' :
    currentScope === 'usaParks' ? 'US National Parks Map' :
    currentScope === 'europe' ? 'Europe Map' :
    currentScope === 'china' ? 'China Map' :
    'India Map';
  
  const listTitle = 
    currentScope === 'world' ? 'Countries List' :
    currentScope === 'usa' ? 'States List' :
    currentScope === 'usaParks' ? 'National Parks List' :
    currentScope === 'europe' ? 'Countries List' :
    currentScope === 'china' ? 'Provinces List' :
    'States List';
  
  const locationsCount = activeLocations.size;
  const totalReference = 
    currentScope === 'world' ? worldCountryFeatures.length :
    currentScope === 'usa' ? usStateFeatures.length :
    currentScope === 'usaParks' ? usNationalParkFeatures.length :
    currentScope === 'europe' ? europeCountryFeatures.length :
    currentScope === 'china' ? chinaProvinceFeatures.length :
    indiaStateFeatures.length;
  const percentage = totalReference > 0 
    ? ((locationsCount / totalReference) * 100).toFixed(1) 
    : '0.0';

  // Show location name notification
  const showLocationName = useCallback((locationName: string) => {
    const container = document.getElementById('notification-container');
    if (!container) return;

    // Remove any existing notifications
    container.innerHTML = '';

    const notification = document.createElement('div');
    notification.className = 'location-name-notification bg-white/95 backdrop-blur-md shadow-2xl rounded-xl px-6 py-4 border border-white/20';
    notification.innerHTML = `
      <div class="flex items-center space-x-3">
        <svg class="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
        </svg>
        <span class="text-lg font-bold text-gray-800">${locationName}</span>
      </div>
    `;

    container.appendChild(notification);

    // Auto-remove after 2 seconds with fade out
    setTimeout(() => {
      notification.style.transition = 'opacity 0.5s ease-out, transform 0.5s ease-out';
      notification.style.opacity = '0';
      notification.style.transform = 'translateX(-100px)';
      setTimeout(() => {
        if (notification.parentNode) {
          notification.parentNode.removeChild(notification);
        }
      }, 500);
    }, 2000);
  }, []);

  // Notification system
  const showNotification = useCallback((message: string, type: NotificationType = 'success') => {
    const container = document.getElementById('notification-container');
    if (!container) return;

    const color = type === 'success' ? 'bg-emerald-500' : 'bg-red-500';
    const icon = type === 'success' 
      ? '<svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>'
      : '<svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>';
    
    const notification = document.createElement('div');
    notification.className = `flex items-center ${color} text-white text-sm font-bold px-4 py-3 rounded-lg shadow-lg mb-3 transform translate-x-full transition-all duration-300`;
    notification.innerHTML = icon + `<span>${message}</span>`;
    
    container.prepend(notification);

    setTimeout(() => {
      notification.style.transform = 'translateX(0)';
    }, 10);

    setTimeout(() => {
      notification.style.transform = 'translateX(100%)';
      setTimeout(() => {
        notification.remove();
      }, 300);
    }, 3000);
  }, []);

  // Load world data
  const loadWorldData = useCallback(async () => {
    try {
      const geoJsonData = await d3.json<FeatureCollection>(WORLD_GEOJSON_URL);
      if (!geoJsonData) throw new Error('Failed to load world data');
      const features = (geoJsonData.features as GeoFeature[])
        .filter(d => d.properties.name && d.properties.name !== 'Antarctica')
        .map(feature => {
          // Update Taiwan label to Taiwan (China)
          if (feature.properties.name === 'Taiwan') {
            return {
              ...feature,
              properties: {
                ...feature.properties,
                name: 'Taiwan (China)'
              }
            };
          }
          return feature;
        });
      setWorldCountryFeatures(features);
      console.log(`World GeoJSON map data loaded successfully. Found ${features.length} countries (excluding Antarctica).`);
      console.log("Note: This dataset includes ~177 countries. UN recognizes 195 countries total.");
    } catch (error) {
      console.error("Error loading world map data:", error);
      throw error;
    }
  }, []);

  // Load USA data
  const loadUSAData = useCallback(async () => {
    if (usStateFeatures.length > 0) return;

    try {
      const topoData = await d3.json<TopoData>(USA_STATES_URL);
      if (!topoData) throw new Error('Failed to load USA data');
      const featureCollection = feature(topoData, topoData.objects.states);
      const features = (featureCollection.type === 'FeatureCollection' 
        ? featureCollection.features 
        : [featureCollection]) as GeoFeature[];
      
      // List of 50 US states (excluding territories like DC, Puerto Rico, etc.)
      const usStates = new Set([
        'Alabama', 'Alaska', 'Arizona', 'Arkansas', 'California', 'Colorado', 'Connecticut',
        'Delaware', 'Florida', 'Georgia', 'Hawaii', 'Idaho', 'Illinois', 'Indiana', 'Iowa',
        'Kansas', 'Kentucky', 'Louisiana', 'Maine', 'Maryland', 'Massachusetts', 'Michigan',
        'Minnesota', 'Mississippi', 'Missouri', 'Montana', 'Nebraska', 'Nevada', 'New Hampshire',
        'New Jersey', 'New Mexico', 'New York', 'North Carolina', 'North Dakota', 'Ohio',
        'Oklahoma', 'Oregon', 'Pennsylvania', 'Rhode Island', 'South Carolina', 'South Dakota',
        'Tennessee', 'Texas', 'Utah', 'Vermont', 'Virginia', 'Washington', 'West Virginia',
        'Wisconsin', 'Wyoming'
      ]);
      
      // Filter to only include the 50 states
      const filteredFeatures = features.filter(d => {
        const name = d.properties.name;
        return name && usStates.has(name);
      });
      
      setUsStateFeatures(filteredFeatures);
      console.log(`USA states map data loaded successfully. Found ${filteredFeatures.length} states.`);
    } catch (error) {
      console.error("Error loading USA states map data:", error);
      showNotification("Failed to load US states map data. Check the console.", 'error');
      setUsStateFeatures([]);
    }
  }, [usStateFeatures.length, showNotification]);

  const loadNationalParksData = useCallback(async () => {
    if (usNationalParkFeatures.length > 0) return;

    try {
      const geoJsonData = await d3.json<FeatureCollection>(NATIONAL_PARKS_GEOJSON_URL);
      if (!geoJsonData) throw new Error('Failed to load US national parks data');

      const features = (geoJsonData.features as GeoFeature[])
        .filter(d => d.properties && d.properties.name && d.geometry)
        .map(feature => ({
          ...feature,
          properties: {
            ...feature.properties,
            name: String(feature.properties?.name ?? 'Unknown Park')
          }
        })) as GeoFeature[];

      setUsNationalParkFeatures(features);
      console.log(`US National Parks data loaded successfully. Found ${features.length} parks.`);
    } catch (error) {
      console.error('Error loading US national parks data:', error);
      showNotification('Failed to load US national parks data. Check the console.', 'error');
      setUsNationalParkFeatures([]);
    }
  }, [usNationalParkFeatures.length, showNotification]);


  // Load Europe data from TopoJSON
  const loadEuropeData = useCallback(async () => {
    if (europeCountryFeatures.length > 0) return;

    try {
      console.log('Loading Europe data from:', EUROPE_TOPJSON_URL);
      const topoData = await d3.json<Topology>(EUROPE_TOPJSON_URL);
      if (!topoData) throw new Error('Failed to load Europe TopoJSON data');
      
      console.log('TopoJSON data loaded, objects:', Object.keys(topoData.objects));
      
      // Convert TopoJSON to GeoJSON
      const europeObject = topoData.objects.europe as GeometryCollection;
      if (!europeObject) throw new Error('Europe object not found in TopoJSON');
      
      const geoJsonData = feature(topoData, europeObject);
      if (!geoJsonData || !geoJsonData.features) throw new Error('Failed to convert TopoJSON to GeoJSON');
      
      console.log('Converted to GeoJSON, total features:', geoJsonData.features.length);
      
      // Process the features - ensure name property exists
      const features = (geoJsonData.features as GeoFeature[])
        .filter(d => {
          if (!d.properties) return false;
          if (!d.geometry) return false;
          return true;
        })
        .map(feature => {
          const props = feature.properties;
          // The TopoJSON uses "NAME" property, ensure we have "name"
          if (!props.name && props.NAME) {
            props.name = String(props.NAME);
          }
          if (!props.name || typeof props.name !== 'string') {
            props.name = String(props.name || props.NAME || 'Unknown');
          }
          return feature as GeoFeature;
        });
      
      console.log(`Europe map data loaded successfully. Found ${features.length} countries.`);
      if (features.length > 0) {
        console.log('Sample country:', features[0].properties.name);
        console.log('Sample geometry type:', features[0].geometry.type);
      }
      
      setEuropeCountryFeatures(features);
    } catch (error) {
      console.error("Error loading Europe map data:", error);
      showNotification("Failed to load Europe map data. Check the console.", 'error');
      setEuropeCountryFeatures([]);
    }
  }, [showNotification]);

  // Load China provinces data
  const loadChinaData = useCallback(async () => {
    if (chinaProvinceFeatures.length > 0) return;

    try {
      console.log('Loading China provinces data from:', CHINA_PROVINCES_URL);
      const geoJsonData = await d3.json<FeatureCollection>(CHINA_PROVINCES_URL);
      if (!geoJsonData) throw new Error('Failed to load China provinces data');
      
      console.log('Raw data loaded, total features:', geoJsonData.features.length);
      
      // Process the features - this data source already has English names
      const features = (geoJsonData.features as GeoFeature[])
        .filter(d => {
          if (!d.properties || !d.properties.name) return false;
          // Filter out any invalid features - check if geometry exists and has valid type
          if (!d.geometry) return false;
          const geom = d.geometry;
          if (geom.type === 'GeometryCollection') return false; // Skip geometry collections
          return true;
        })
        .map(feature => {
          const props = feature.properties;
          // Ensure name property exists (this data source already has English names)
          if (!props.name || typeof props.name !== 'string') {
            props.name = String(props.name || 'Unknown');
          }
          return feature as GeoFeature;
        });
      
      console.log(`China provinces map data loaded successfully. Found ${features.length} provinces.`);
      if (features.length > 0) {
        console.log('Sample province:', features[0].properties.name);
        console.log('Sample geometry type:', features[0].geometry.type);
      }
      
      setChinaProvinceFeatures(features);
    } catch (error) {
      console.error("Error loading China provinces map data:", error);
      showNotification("Failed to load China provinces map data. Check the console.", 'error');
      setChinaProvinceFeatures([]);
    }
  }, [showNotification]);

  // Load India states data
  const loadIndiaData = useCallback(async () => {
    if (indiaStateFeatures.length > 0) return;

    try {
      console.log('Loading India states data from:', INDIA_STATES_URL);
      const geoJsonData = await d3.json<FeatureCollection>(INDIA_STATES_URL);
      if (!geoJsonData) throw new Error('Failed to load India states data');
      
      console.log('Raw data loaded, total features:', geoJsonData.features.length);
      
      // Process features - this data already has state-level boundaries
      // First, separate the two union territories that need to be merged
      let dadraFeature: GeoFeature | null = null;
      let damanFeature: GeoFeature | null = null;
      
      const processedFeatures = (geoJsonData.features as GeoFeature[])
        .filter(d => {
          if (!d.properties || !d.properties.st_nm) return false;
          if (!d.geometry) return false;
          const geom = d.geometry;
          if (geom.type === 'GeometryCollection') return false;
          
          const stateName = String(d.properties.st_nm || '');
          // Check if this is one of the territories to merge
          if (stateName === 'Dadra and Nagar Haveli') {
            dadraFeature = {
              ...d,
              properties: { name: stateName }
            } as GeoFeature;
            return false; // Don't include in main list yet
          }
          if (stateName === 'Daman and Diu') {
            damanFeature = {
              ...d,
              properties: { name: stateName }
            } as GeoFeature;
            return false; // Don't include in main list yet
          }
          
          return true;
        })
        .map(feature => {
          const props = feature.properties;
          // Use st_nm as the name property
          const stateName = props.st_nm || 'Unknown';
          return {
            ...feature,
            properties: {
              name: String(stateName)
            }
          } as GeoFeature;
        });
      
      // Merge Dadra and Nagar Haveli with Daman and Diu if both exist
      if (dadraFeature && damanFeature) {
        // Store in local variables with explicit types to help TypeScript
        const dadra: GeoFeature = dadraFeature;
        const daman: GeoFeature = damanFeature;
        
        try {
          // Use turf.union to properly merge the geometries
          const merged = union(dadra as any, daman as any);
          if (merged && merged.geometry) {
            const mergedFeature: GeoFeature = {
              type: 'Feature',
              properties: {
                name: 'Dadra and Nagar Haveli and Daman and Diu'
              },
              geometry: merged.geometry
            };
            processedFeatures.push(mergedFeature);
            console.log('Merged Dadra and Nagar Haveli with Daman and Diu into single Union Territory');
          } else {
            throw new Error('Union returned no geometry');
          }
        } catch (error) {
          console.warn('Error merging territories with union, using MultiPolygon fallback:', error);
          // Fallback: combine as MultiPolygon
          const dadraGeom = dadra.geometry;
          const damanGeom = daman.geometry;
          
          const dadraCoords = dadraGeom.type === 'Polygon' 
            ? [dadraGeom.coordinates]
            : dadraGeom.type === 'MultiPolygon'
            ? dadraGeom.coordinates
            : [];
          
          const damanCoords = damanGeom.type === 'Polygon'
            ? [damanGeom.coordinates]
            : damanGeom.type === 'MultiPolygon'
            ? damanGeom.coordinates
            : [];
          
          const mergedGeometry: any = {
            type: 'MultiPolygon',
            coordinates: [...dadraCoords, ...damanCoords]
          };
          
          const mergedFeature: GeoFeature = {
            type: 'Feature',
            properties: {
              name: 'Dadra and Nagar Haveli and Daman and Diu'
            },
            geometry: mergedGeometry
          };
          processedFeatures.push(mergedFeature);
        }
      } else if (dadraFeature) {
        // If only Dadra exists, keep it as is
        processedFeatures.push(dadraFeature);
      } else if (damanFeature) {
        // If only Daman exists, keep it as is
        processedFeatures.push(damanFeature);
      }
      
      const features = processedFeatures;
      
      console.log(`India states map data loaded successfully. Found ${features.length} states.`);
      if (features.length > 0) {
        console.log('Sample state:', features[0].properties.name);
      }
      
      setIndiaStateFeatures(features);
    } catch (error) {
      console.error("Error loading India states map data:", error);
      showNotification("Failed to load India states map data. Check the console.", 'error');
      setIndiaStateFeatures([]);
    }
  }, [showNotification, indiaStateFeatures.length]);

  // Update SVG dimensions
  const updateSvgDimensions = useCallback(() => {
    if (!mapContainerRef.current || !svgRef.current) return { width: 0, height: 0 };

    const container = mapContainerRef.current;
    const width = container.clientWidth || container.offsetWidth;
    const height = container.clientHeight || container.offsetHeight;

    if (width === 0 || height === 0) {
      // Fallback: use parent dimensions
      const parent = container.parentElement;
      if (parent) {
        const parentWidth = parent.clientWidth - 48;
        const parentHeight = parent.clientHeight - 80;
        d3.select(svgRef.current).attr("viewBox", `0 0 ${parentWidth} ${parentHeight}`);
        return { width: parentWidth, height: parentHeight };
      }
      return { width: 0, height: 0 };
    }

    d3.select(svgRef.current).attr("viewBox", `0 0 ${width} ${height}`);
    return { width, height };
  }, []);

  // Update SVG dimensions and fit projection
  const updateSvgDimensionsAndFit = useCallback(() => {
    if (!currentProjectionRef.current || !pathRef.current || currentFeatures.length === 0) return;

    const { width, height } = updateSvgDimensions();
    if (width === 0 || height === 0) return;

    const featureCollection: FeatureCollection = {
      type: "FeatureCollection",
      features: currentFeatures
    };

    currentProjectionRef.current.fitSize([width, height], featureCollection);

    const [[x0, y0], [x1, y1]] = pathRef.current.bounds(featureCollection);

    if (x0 === Infinity || x1 === -Infinity || y0 === Infinity || y1 === -Infinity) {
      initialTransformRef.current = d3.zoomIdentity;
      return;
    }

    const scale = Math.min(width / (x1 - x0), height / (y1 - y0));
    const translateX = (width - scale * (x0 + x1)) / 2;
    const translateY = (height - scale * (y0 + y1)) / 2;

    initialTransformRef.current = d3.zoomIdentity.translate(translateX, translateY).scale(scale);
  }, [currentFeatures, updateSvgDimensions]);

  // Reset view
  const resetView = useCallback(() => {
    if (!svgRef.current || !zoomRef.current || !mapGroupRef.current || !pathRef.current) return;

    setTimeout(() => {
      updateSvgDimensionsAndFit();

      const svg = d3.select(svgRef.current!);
      svg.transition()
        .duration(750)
        .call(zoomRef.current!.transform, initialTransformRef.current);

      if (currentFeatures.length > 0 && pathRef.current) {
        mapGroupRef.current!.selectAll<SVGPathElement, GeoFeature>(".country-path")
          .attr("d", (d: GeoFeature) => pathRef.current!(d));
      }
      if (currentScope === 'usaParks' && parkGroupRef.current && pathRef.current) {
        parkGroupRef.current.selectAll<SVGPathElement, GeoFeature>(".park-path")
          .attr("d", (d: GeoFeature) => pathRef.current!(d));
      }

      if (showLabelsRef.current) {
        renderLabels();
      }
    }, 50);
  }, [currentFeatures, currentScope, updateSvgDimensionsAndFit]);

  const updatePathHighlights = useCallback((names: string[], highlight: boolean) => {
    const targetGroups = currentScope === 'usaParks'
      ? [mapGroupRef.current, parkGroupRef.current]
      : [mapGroupRef.current];

    names.forEach(name => {
      const normalizedName = name.replace(/\s/g, '-').replace(/[^a-zA-Z0-9-]/g, '');
      targetGroups.forEach(group => {
        if (!group) return;
        const path = group.select<SVGPathElement>(`path[data-name="${normalizedName}"]`);
        if (!path.empty()) {
          path.classed('country-highlight', highlight);
        }
      });
    });
  }, [currentScope]);

  // Render labels
  const renderLabels = useCallback(() => {
    if (!labelGroupRef.current || !pathRef.current) return;

    if (showLabelsRef.current) {
      // Get currently selected locations
      const selectedFeatures = selectableFeatures.filter(d => 
        activeLocationsRef.current.has(d.properties.name)
      );

      const selection = labelGroupRef.current.selectAll<SVGTextElement, GeoFeature>(".map-label")
        .data(selectedFeatures, (d: GeoFeature) => d.properties.name);
      
      // Enter: add new labels
      const enter = selection.enter()
        .append("text")
        .attr("class", "map-label")
        .attr("opacity", 0)
        .text(d => d.properties.name);
      
      // Update: merge enter and update selections
      enter.merge(selection)
        .attr("transform", d => {
          const centroid = pathRef.current!.centroid(d);
          return `translate(${centroid[0]},${centroid[1]})`;
        })
        .transition()
        .duration(300)
        .attr("opacity", 1);
      
      // Exit: remove labels for deselected locations
      selection.exit()
        .transition()
        .duration(300)
        .attr("opacity", 0)
        .remove();
    } else {
      // Hide all labels when showLabels is false
      labelGroupRef.current.selectAll(".map-label")
        .transition()
        .duration(300)
        .attr("opacity", 0)
        .remove();
    }
  }, [selectableFeatures]);

  const hoverLabelTimeoutRef = useRef<number | null>(null);
  const currentHoverNameRef = useRef<string | null>(null);
  const lastClickTimeRef = useRef<number>(0);
  const isTouchDeviceRef = useRef<boolean>(false);

  // Detect touch device
  useEffect(() => {
    isTouchDeviceRef.current = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  }, []);

  // Prevent text selection on map container
  useEffect(() => {
    const container = mapContainerRef.current;
    if (!container) return;

    const preventSelection = (e: Event) => {
      e.preventDefault();
      e.stopPropagation();
    };

    container.addEventListener('selectstart', preventSelection, true);
    container.addEventListener('dragstart', preventSelection, true);
    container.addEventListener('contextmenu', preventSelection, true);
    container.addEventListener('mousedown', (e) => {
      // Prevent text selection on long press
      if (e.detail > 1) {
        e.preventDefault();
      }
    }, true);

    return () => {
      container.removeEventListener('selectstart', preventSelection, true);
      container.removeEventListener('dragstart', preventSelection, true);
      container.removeEventListener('contextmenu', preventSelection, true);
    };
  }, []);

  // Show hover label for a location
  const showHoverLabel = useCallback((locationName: string, isTouch: boolean = false) => {
    // Don't show label if we just clicked (within 800ms)
    if (Date.now() - lastClickTimeRef.current < 800) return;
    
    // Clear any pending hide timeout
    if (hoverLabelTimeoutRef.current) {
      clearTimeout(hoverLabelTimeoutRef.current);
      hoverLabelTimeoutRef.current = null;
    }
    
    // If already showing the same label, don't recreate
    if (currentHoverNameRef.current === locationName) return;
    currentHoverNameRef.current = locationName;
    
    if (!hoverLabelGroupRef.current || !pathRef.current || !svgRef.current || !mapContainerRef.current) return;
    
    let x: number, y: number;
    
    if (isTouch) {
      // Position at absolute bottom left for touch devices
      // Use viewBox coordinates since hoverLabelGroup is not transformed
      const svg = svgRef.current;
      const viewBox = svg.viewBox.baseVal;
      
      // Position at most left, with padding only from bottom
      const paddingY = 15;
      
      x = 0;
      y = viewBox.height - paddingY;
    } else {
      // Find the feature by name and use centroid for mouse hover
      const feature = selectableFeatures.find(d => d.properties.name === locationName);
      if (!feature) return;
      const centroid = pathRef.current.centroid(feature);
      [x, y] = centroid;
    }
    
    hoverLabelGroupRef.current.selectAll(".hover-label, .hover-label-bg, .hover-label-shadow").remove();
    
    // Create shadow filter for depth
    let defsSelection = d3.select(svgRef.current).select<SVGDefsElement>("defs");
    if (defsSelection.empty()) {
      defsSelection = d3.select(svgRef.current).append<SVGDefsElement>("defs");
    }
    if (defsSelection.select("#label-shadow").empty()) {
      const filter = defsSelection.append("filter")
        .attr("id", "label-shadow")
        .attr("x", "-50%")
        .attr("y", "-50%")
        .attr("width", "200%")
        .attr("height", "200%");
      filter.append("feGaussianBlur")
        .attr("in", "SourceAlpha")
        .attr("stdDeviation", "2");
      filter.append("feOffset")
        .attr("dx", "0")
        .attr("dy", "2")
        .attr("result", "offsetblur");
      const feComponentTransfer = filter.append("feComponentTransfer")
        .attr("in", "offsetblur");
      feComponentTransfer.append("feFuncA")
        .attr("type", "linear")
        .attr("slope", "0.3");
      const feMerge = filter.append("feMerge");
      feMerge.append("feMergeNode");
      feMerge.append("feMergeNode")
        .attr("in", "SourceGraphic");
    }
    
    const paddingX = isTouch ? 12 : 10;
    const paddingY = isTouch ? 8 : 6;
    
    // For touch, position entire frame (background) at leftmost (x=0)
    // Text will be positioned inside with padding
    const textY = y;
    
    // First create background rectangle at leftmost position
    if (isTouch) {
      // For touch, we need to estimate width first, then position text inside
      // Create a temporary text element to measure
      const tempText = hoverLabelGroupRef.current.append("text")
        .attr("class", "temp-measure")
        .attr("x", 0)
        .attr("y", 0)
        .attr("font-size", "14px")
        .attr("font-weight", "600")
        .attr("font-family", "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif")
        .text(locationName);
      
      const tempBbox = (tempText.node() as SVGTextElement)?.getBBox();
      tempText.remove();
      
      if (tempBbox) {
        // Create background at x=0
        const rect = hoverLabelGroupRef.current.insert("rect", ".hover-label")
          .attr("class", "hover-label-bg")
          .attr("x", 0)
          .attr("y", textY - tempBbox.height / 2 - paddingY)
          .attr("width", tempBbox.width + paddingX * 2)
          .attr("height", tempBbox.height + paddingY * 2);
        
        // Position text inside with padding on both sides
        const label = hoverLabelGroupRef.current.append("text")
          .attr("class", "hover-label")
          .attr("x", paddingX)
          .attr("y", textY)
          .attr("text-anchor", "start")
          .attr("font-size", "14px")
          .attr("font-weight", "600")
          .attr("font-family", "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif")
          .attr("fill", "#111827")
          .attr("pointer-events", "none")
          .attr("filter", "url(#label-shadow)")
          .style("opacity", 1)
          .style("user-select", "none")
          .style("-webkit-user-select", "none")
          .style("-moz-user-select", "none")
          .style("-ms-user-select", "none")
          .on("mousedown", (e) => e.preventDefault())
          .on("selectstart", (e) => e.preventDefault())
          .on("dragstart", (e) => e.preventDefault())
          .text(locationName);
        
        // Add event handlers to prevent text selection on the text element
        const labelNode = label.node();
        if (labelNode) {
          labelNode.addEventListener('selectstart', (e) => e.preventDefault(), false);
          labelNode.addEventListener('mousedown', (e) => e.preventDefault(), false);
          labelNode.addEventListener('dragstart', (e) => e.preventDefault(), false);
        }
        
        // Update background with actual text bbox and add styling
        const bbox = (label.node() as SVGTextElement)?.getBBox();
        if (bbox) {
          rect.attr("x", 0)  // Ensure background is always at leftmost position
              .attr("width", bbox.width + paddingX * 2)
              .attr("height", bbox.height + paddingY * 2)
              .attr("y", bbox.y - paddingY)
              .attr("fill", "rgba(255, 255, 255, 0.98)")
              .attr("stroke", "rgba(0, 0, 0, 0.1)")
              .attr("stroke-width", "1")
              .attr("rx", "8")
              .attr("ry", "8")
              .attr("pointer-events", "none")
              .attr("filter", "url(#label-shadow)")
              .style("opacity", 1)
              .style("user-select", "none")
              .style("-webkit-user-select", "none")
              .style("-moz-user-select", "none")
              .style("-ms-user-select", "none")
              .on("mousedown", (e) => e.preventDefault())
              .on("selectstart", (e) => e.preventDefault())
              .on("dragstart", (e) => e.preventDefault());
          
          // Add event handlers to prevent text selection on the background element
          const rectNode = rect.node();
          if (rectNode) {
            rectNode.addEventListener('selectstart', (e) => e.preventDefault(), false);
            rectNode.addEventListener('mousedown', (e) => e.preventDefault(), false);
            rectNode.addEventListener('dragstart', (e) => e.preventDefault(), false);
          }
          
          // Add gradient if not exists
          if (defsSelection.select("#label-gradient").empty()) {
            const gradient = defsSelection.append("linearGradient")
              .attr("id", "label-gradient")
              .attr("x1", "0%")
              .attr("y1", "0%")
              .attr("x2", "0%")
              .attr("y2", "100%");
            gradient.append("stop")
              .attr("offset", "0%")
              .attr("stop-color", "rgba(255, 255, 255, 0.98)")
              .attr("stop-opacity", 1);
            gradient.append("stop")
              .attr("offset", "100%")
              .attr("stop-color", "rgba(249, 250, 251, 0.98)")
              .attr("stop-opacity", 1);
          }
          rect.attr("fill", "url(#label-gradient)");
        }
        
        // Add event handlers to the hover label group to prevent text selection
        if (hoverLabelGroupRef.current) {
          const groupNode = hoverLabelGroupRef.current.node();
          if (groupNode) {
            const preventSelection = (e: Event) => {
              e.preventDefault();
              e.stopPropagation();
            };
            groupNode.addEventListener('selectstart', preventSelection, true);
            groupNode.addEventListener('mousedown', preventSelection, true);
            groupNode.addEventListener('touchstart', preventSelection, true);
            groupNode.addEventListener('dragstart', preventSelection, true);
          }
        }
      }
    } else {
      // For mouse hover, use original positioning
      const label = hoverLabelGroupRef.current.append("text")
        .attr("class", "hover-label")
        .attr("x", x)
        .attr("y", y)
        .attr("text-anchor", "middle")
        .attr("font-size", "13px")
        .attr("font-weight", "600")
        .attr("font-family", "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif")
        .attr("fill", "#111827")
        .attr("pointer-events", "none")
        .attr("filter", "url(#label-shadow)")
        .style("opacity", 1)
        .style("user-select", "none")
        .style("-webkit-user-select", "none")
        .style("-moz-user-select", "none")
        .style("-ms-user-select", "none")
        .on("mousedown", (e) => e.preventDefault())
        .on("selectstart", (e) => e.preventDefault())
        .on("dragstart", (e) => e.preventDefault())
        .text(locationName);
      
      // Add event handlers to prevent text selection on the text element
      const labelNode = label.node();
      if (labelNode) {
        labelNode.addEventListener('selectstart', (e) => e.preventDefault(), false);
        labelNode.addEventListener('mousedown', (e) => e.preventDefault(), false);
        labelNode.addEventListener('dragstart', (e) => e.preventDefault(), false);
      }
      
      const bbox = (label.node() as SVGTextElement)?.getBBox();
      if (bbox) {
        const rect = hoverLabelGroupRef.current.insert("rect", "text")
          .attr("class", "hover-label-bg")
          .attr("x", bbox.x - paddingX)
          .attr("y", bbox.y - paddingY)
          .attr("width", bbox.width + paddingX * 2)
          .attr("height", bbox.height + paddingY * 2)
          .attr("fill", "rgba(255, 255, 255, 0.98)")
          .attr("stroke", "rgba(0, 0, 0, 0.1)")
          .attr("stroke-width", "1")
          .attr("rx", "8")
          .attr("ry", "8")
          .attr("pointer-events", "none")
          .attr("filter", "url(#label-shadow)")
          .style("opacity", 1)
          .style("user-select", "none")
          .style("-webkit-user-select", "none")
          .style("-moz-user-select", "none")
          .style("-ms-user-select", "none");
        
        // Add subtle gradient for depth
        if (defsSelection.select("#label-gradient").empty()) {
          const gradient = defsSelection.append("linearGradient")
            .attr("id", "label-gradient")
            .attr("x1", "0%")
            .attr("y1", "0%")
            .attr("x2", "0%")
            .attr("y2", "100%");
          gradient.append("stop")
            .attr("offset", "0%")
            .attr("stop-color", "rgba(255, 255, 255, 0.98)")
            .attr("stop-opacity", 1);
          gradient.append("stop")
            .attr("offset", "100%")
            .attr("stop-color", "rgba(249, 250, 251, 0.98)")
            .attr("stop-opacity", 1);
        }
        rect.attr("fill", "url(#label-gradient)");
      }
    }
  }, [selectableFeatures]);

  // Hide hover label
  const hideHoverLabel = useCallback(() => {
    // Clear any pending show
    if (hoverLabelTimeoutRef.current) {
      clearTimeout(hoverLabelTimeoutRef.current);
    }
    
    // Add small delay to prevent flickering when moving between items
    hoverLabelTimeoutRef.current = setTimeout(() => {
      if (!hoverLabelGroupRef.current) return;
      currentHoverNameRef.current = null;
      hoverLabelGroupRef.current.selectAll(".hover-label, .hover-label-bg").remove();
      hoverLabelTimeoutRef.current = null;
    }, 50);
  }, []);

  // Handle location toggle - optimized to prevent re-renders
  const handleLocationToggle = useCallback((locationName: string) => {
    // Show location name notification
    showLocationName(locationName);
    
    const normalizedName = locationName.replace(/\s/g, '-').replace(/[^a-zA-Z0-9-]/g, '');
    
    // Update DOM directly first (immediate visual feedback) - no React re-render
    const targetGroups = currentScope === 'usaParks'
      ? [parkGroupRef.current]
      : [mapGroupRef.current];

    targetGroups.forEach(group => {
      if (!group) return;
      const pathElement = group.select<SVGPathElement>(`path[data-name="${normalizedName}"]`);
      if (!pathElement.empty()) {
        const isCurrentlySelected = pathElement.classed('country-highlight');
        pathElement.classed('country-highlight', !isCurrentlySelected);
      }
    });
    
    const listItem = d3.select(`#list-${normalizedName}`);
    if (!listItem.empty()) {
      const isCurrentlySelected = listItem.classed('selected');
      listItem.classed('selected', !isCurrentlySelected);
      const checkbox = listItem.select('input');
      if (!checkbox.empty()) {
        checkbox.property('checked', !isCurrentlySelected);
      }
    }
    
    // Update state asynchronously using a ref to track without causing re-render
    // Use a longer delay to batch updates and prevent visual refresh
    setTimeout(() => {
      setActiveLocations(prev => {
        const newSet = new Set(prev);
        const isSelected = newSet.has(locationName);
        
        if (isSelected) {
          newSet.delete(locationName);
        } else {
          newSet.add(locationName);
        }
        
        // Update labels if needed (only if labels are shown)
        if (showLabels && labelGroupRef.current && pathRef.current) {
        const selectedFeatures = selectableFeatures.filter(d => newSet.has(d.properties.name));
          
          labelGroupRef.current.selectAll<SVGTextElement, GeoFeature>(".map-label")
            .data(selectedFeatures, (d: GeoFeature) => d.properties.name)
            .join(
              enter => enter.append("text")
                .attr("class", "map-label")
                .attr("transform", d => `translate(${pathRef.current!.centroid(d)})`)
                .text(d => d.properties.name)
                .attr("opacity", 0)
                .transition()
                .duration(200)
                .attr("opacity", 1),
              update => update,
              exit => exit
                .transition()
                .duration(200)
                .attr("opacity", 0)
                .remove()
            );
        }
        
        return newSet;
      });
      
      // Update labels if they're enabled
      if (showLabelsRef.current) {
        setTimeout(() => renderLabels(), 0);
      }
    }, 0); // Use setTimeout instead of requestAnimationFrame to batch better
  }, [selectableFeatures, currentScope, showLocationName]);


  // Handle scope selection
  const handleScopeSelection = useCallback(async (scope: Scope) => {
    if (scope === currentScope) return;

    // Clear active locations
    setActiveLocations(new Set());
    
    setIsLoading(true);
    
    // Load data based on scope
    if (scope === 'usa' || scope === 'usaParks') {
      await loadUSAData();
      if (scope === 'usaParks') {
        await loadNationalParksData();
      }
    } else if (scope === 'europe') {
      await loadEuropeData();
    } else if (scope === 'china') {
      await loadChinaData();
    } else if (scope === 'india') {
      await loadIndiaData();
    }
    
    setIsLoading(false);

    // Update scope - the useEffect will handle all rendering with proper transform
    setCurrentScope(scope);
  }, [currentScope, loadUSAData, loadNationalParksData, loadEuropeData, loadChinaData, loadIndiaData]);

  // Save map as PNG
  const saveMapAsPNG = useCallback(() => {
    if (!svgRef.current || !mapContainerRef.current || !mapGroupRef.current) return;

    try {
      const svgNode = svgRef.current;
      const container = mapContainerRef.current;
      const mapGroup = mapGroupRef.current.node();
      
      if (!mapGroup) return;
      
      // Get bounding box of the actual map content (tight crop)
      const mapBounds = (mapGroup as SVGGElement).getBBox();
      
      // Add small padding (2% of width/height)
      const padding = Math.max(mapBounds.width, mapBounds.height) * 0.02;
      const cropX = Math.max(0, mapBounds.x - padding);
      const cropY = Math.max(0, mapBounds.y - padding);
      const cropWidth = mapBounds.width + (padding * 2);
      const cropHeight = mapBounds.height + (padding * 2);
      
      // Get container dimensions for reference
      const containerWidth = container.clientWidth || container.offsetWidth;
      const containerHeight = container.clientHeight || container.offsetHeight;
      
      if (containerWidth === 0 || containerHeight === 0 || cropWidth === 0 || cropHeight === 0) {
        showNotification('Map container has no dimensions. Please wait for the map to load.', 'error');
        return;
      }

      // Clone the SVG to avoid modifying the original
      const clonedSvg = svgNode.cloneNode(true) as SVGSVGElement;
      
      // Calculate new viewBox for tight crop
      const newViewBox = `${cropX} ${cropY} ${cropWidth} ${cropHeight}`;
      
      // Set explicit dimensions and viewBox on the cloned SVG
      clonedSvg.setAttribute('width', cropWidth.toString());
      clonedSvg.setAttribute('height', cropHeight.toString());
      clonedSvg.setAttribute('viewBox', newViewBox);
      clonedSvg.removeAttribute('style'); // Remove any inline styles that might interfere
      
      // Ensure all paths have explicit fill colors (not relying on CSS classes)
      // Get paths from original SVG to read computed styles
      const originalPaths = svgNode.querySelectorAll('.country-path');
      const clonedPaths = clonedSvg.querySelectorAll('.country-path');
      
      originalPaths.forEach((originalPath, index) => {
        const clonedPath = clonedPaths[index] as SVGPathElement;
        if (!clonedPath) return;
        
        // Get computed style from original element
        const computedStyle = window.getComputedStyle(originalPath as Element);
        const fill = computedStyle.fill;
        const stroke = computedStyle.stroke;
        const strokeWidth = computedStyle.strokeWidth;
        
        // Set explicit attributes on cloned path
        if (fill && fill !== 'none' && fill !== 'transparent' && fill !== 'rgba(0, 0, 0, 0)') {
          clonedPath.setAttribute('fill', fill);
        } else {
          // Check if it's highlighted
          if (originalPath.classList.contains('country-highlight')) {
            clonedPath.setAttribute('fill', '#10b981'); // emerald-500
            clonedPath.setAttribute('stroke', '#047857'); // darker emerald
            clonedPath.setAttribute('stroke-width', '0.75');
          } else {
            clonedPath.setAttribute('fill', '#E8EDF1'); // default light gray
            clonedPath.setAttribute('stroke', '#ffffff');
            clonedPath.setAttribute('stroke-width', '0.5');
          }
        }
        
        if (stroke && stroke !== 'none' && !clonedPath.hasAttribute('stroke')) {
          clonedPath.setAttribute('stroke', stroke);
        }
        
        if (strokeWidth && !clonedPath.hasAttribute('stroke-width')) {
          clonedPath.setAttribute('stroke-width', strokeWidth);
        }
      });
      
      // Add white background rectangle as first child
      const bgRect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
      bgRect.setAttribute('x', cropX.toString());
      bgRect.setAttribute('y', cropY.toString());
      bgRect.setAttribute('width', cropWidth.toString());
      bgRect.setAttribute('height', cropHeight.toString());
      bgRect.setAttribute('fill', '#ffffff');
      clonedSvg.insertBefore(bgRect, clonedSvg.firstChild);
      
      // Serialize the cloned SVG
      const svgString = new XMLSerializer().serializeToString(clonedSvg);
      
      // Create data URL with proper encoding
      const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
      const svgDataUrl = URL.createObjectURL(svgBlob);

      // Create canvas with high resolution (3x scale for high quality)
      const scale = 3; // 3x resolution for high quality
      const canvas = document.createElement('canvas');
      canvas.width = cropWidth * scale;
      canvas.height = cropHeight * scale;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        showNotification('Could not create canvas context.', 'error');
        URL.revokeObjectURL(svgDataUrl);
        return;
      }

      // Scale the context for high resolution
      ctx.scale(scale, scale);

      // Fill white background
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, cropWidth, cropHeight);

      const img = new Image();
      
      img.onload = function() {
        try {
          // Clear and redraw with white background
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(0, 0, cropWidth, cropHeight);
          ctx.drawImage(img, 0, 0, cropWidth, cropHeight);
          
          // Export at high quality (no compression)
          const pngDataUrl = canvas.toDataURL('image/png', 1.0);

          const downloadLink = document.createElement('a');
          downloadLink.href = pngDataUrl;
          const date = new Date().toISOString().split('T')[0];
          downloadLink.download = `${currentScope}_travel_map_${date}.png`;
          
          document.body.appendChild(downloadLink);
          downloadLink.click();
          document.body.removeChild(downloadLink);
          
          URL.revokeObjectURL(svgDataUrl);
          showNotification('Map exported as PNG!', 'success');
        } catch (e) {
          console.error("Error drawing SVG to canvas or exporting:", e);
          URL.revokeObjectURL(svgDataUrl);
          showNotification('Error exporting map. Please try again.', 'error');
        }
      };

      img.onerror = function(err) {
        console.error("Error loading SVG into image object.", err);
        URL.revokeObjectURL(svgDataUrl);
        showNotification('Error loading map data for export. Please try again.', 'error');
      };

      img.src = svgDataUrl;
    } catch (error) {
      console.error("Error in saveMapAsPNG:", error);
      showNotification('Error exporting map. Please try again.', 'error');
    }
  }, [currentScope, showNotification]);

  // Zoom handlers
  const handleZoomIn = useCallback((e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    if (!svgRef.current || !zoomRef.current) return;
    const svg = d3.select(svgRef.current);
    svg.transition()
      .duration(300)
      .call(zoomRef.current.scaleBy, 1.5);
  }, []);

  const handleZoomOut = useCallback((e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    if (!svgRef.current || !zoomRef.current) return;
    const svg = d3.select(svgRef.current);
    svg.transition()
      .duration(300)
      .call(zoomRef.current.scaleBy, 0.67); // 1/1.5 for consistent zoom steps
  }, []);

  // Initialize D3
  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Create SVG
    const svg = d3.select(mapContainerRef.current)
      .append("svg")
      .attr("width", '100%')
      .attr("height", '100%')
      .style("position", "absolute")
      .style("top", "0")
      .style("left", "0")
      .style("user-select", "none")
      .style("-webkit-user-select", "none")
      .style("-moz-user-select", "none")
      .style("-ms-user-select", "none")
      .style("-webkit-touch-callout", "none")
      .on("selectstart", (e) => e.preventDefault())
      .on("mousedown", (e) => {
        // Prevent text selection on long press
        if (e.detail > 1) {
          e.preventDefault();
        }
      })
      .on("dragstart", (e) => e.preventDefault())
      .on("contextmenu", (e) => e.preventDefault());

    svgRef.current = svg.node();
    
    // Add event listeners directly to SVG element
    if (svgRef.current) {
      const preventSelection = (e: Event) => {
        e.preventDefault();
        e.stopPropagation();
      };
      svgRef.current.addEventListener('selectstart', preventSelection, true);
      svgRef.current.addEventListener('dragstart', preventSelection, true);
      svgRef.current.addEventListener('contextmenu', preventSelection, true);
    }

    const mapGroup = svg.append("g").attr("id", "map-group");
    const parkGroup = svg.append("g").attr("id", "park-group");
    const labelGroup = svg.append("g").attr("id", "label-group");
    const hoverLabelGroup = svg.append("g").attr("id", "hover-label-group");

    mapGroupRef.current = mapGroup;
    parkGroupRef.current = parkGroup;
    labelGroupRef.current = labelGroup;
    hoverLabelGroupRef.current = hoverLabelGroup;

    // Set up projections
    const worldProjection = geoMiller();
    currentProjectionRef.current = worldProjection;

    const path = d3.geoPath().projection(worldProjection);
    pathRef.current = path;

    // Set up zoom
    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.5, 20]) // Allow more zoom range
      .filter((event) => {
        const target = event.target as HTMLElement;
        
        // Always allow wheel zoom
        if (event.type === 'wheel') {
          return true;
        }
        
        // Prevent zoom/pan when clicking on map paths (country paths)
        if (event.type === 'mousedown' && target?.classList.contains('country-path')) {
          return false;
        }
        
        // Prevent zoom/pan when clicking on buttons (but allow button clicks to work)
        if (event.type === 'mousedown' && target?.closest('button')) {
          return false;
        }
        
        // Allow drag/pan on empty areas
        if (event.type === 'mousedown') {
          return true;
        }
        
        // Allow all other interactions
        return true;
      })
      .on("zoom", (event) => {
        // Skip zoom event handling during scope updates to prevent visible jump
        if (isUpdatingScopeRef.current) return;
        
        if (mapGroupRef.current) {
          mapGroupRef.current.attr("transform", event.transform);
        }
        if (parkGroupRef.current) {
          parkGroupRef.current.attr("transform", event.transform);
        }
        if (labelGroupRef.current) {
          labelGroupRef.current.attr("transform", event.transform);
        }
        // Don't transform hoverLabelGroup - keep labels fixed in screen space
        // if (hoverLabelGroupRef.current) {
        //   hoverLabelGroupRef.current.attr("transform", event.transform);
        // }
      })
      .wheelDelta((event) => {
        // Custom wheel delta for smoother zooming
        return -event.deltaY * (event.deltaMode === 1 ? 0.05 : event.deltaMode ? 1 : 0.002);
      });

    svg.call(zoom);
    zoomRef.current = zoom;

    // Load initial data
    const initialize = async () => {
      setIsLoading(true);
      try {
        // Wait a bit for container to have dimensions
        await new Promise(resolve => setTimeout(resolve, 100));
        await loadWorldData();
        // Ensure container has dimensions before rendering
        if (mapContainerRef.current) {
          const rect = mapContainerRef.current.getBoundingClientRect();
          if (rect.width === 0 || rect.height === 0) {
            console.warn('Map container has no dimensions, waiting...');
            await new Promise(resolve => setTimeout(resolve, 200));
          }
        }
        
        // Hide container during initial setup to prevent visible jump
        if (mapContainerRef.current) {
          mapContainerRef.current.style.display = 'none';
        }
        
        // Set flag to prevent zoom event handler from interfering
        isUpdatingScopeRef.current = true;
        
        // Wait for state to update and useEffect to run
        await new Promise(resolve => setTimeout(resolve, 50));
        
        // The useEffect will handle rendering with proper transform
        // Just ensure everything is set up
        requestAnimationFrame(() => {
          if (mapContainerRef.current) {
            mapContainerRef.current.style.display = '';
          }
          isUpdatingScopeRef.current = false;
        });
      } catch (error) {
        console.error("Initialization failed:", error);
        isUpdatingScopeRef.current = false;
      } finally {
        setIsLoading(false);
      }
    };

    initialize();

    // Handle resize
    const handleResize = () => {
      if (currentFeatures.length > 0) {
        updateSvgDimensionsAndFit();
        if (mapGroupRef.current && pathRef.current) {
          mapGroupRef.current.selectAll<SVGPathElement, GeoFeature>(".country-path")
            .attr("d", (d: GeoFeature) => pathRef.current!(d));
        }
        if (currentScopeRef.current === 'usaParks' && parkGroupRef.current && pathRef.current) {
          parkGroupRef.current.selectAll<SVGPathElement, GeoFeature>(".park-path")
            .attr("d", (d: GeoFeature) => pathRef.current!(d));
        }
        if (svgRef.current && zoomRef.current) {
          const svg = d3.select(svgRef.current);
          svg.call(zoomRef.current.transform, d3.zoomTransform(svgRef.current));
        }
        if (showLabels) {
          renderLabels();
        }
      }
    };

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []); // Only run once on mount

  // Store latest values in refs to avoid re-renders
  const activeLocationsRef = useRef<Set<string>>(new Set());
  const showLabelsRef = useRef(false);
  const currentScopeRef = useRef<Scope>(currentScope);
  
  // Keep refs in sync with state (but don't trigger re-renders)
  useEffect(() => {
    activeLocationsRef.current = activeLocations;
    // Update labels when active locations change
    if (showLabelsRef.current && pathRef.current && labelGroupRef.current) {
      renderLabels();
    }
  }, [activeLocations, renderLabels]);
  
  useEffect(() => {
    showLabelsRef.current = showLabels;
    // Re-render labels when showLabels changes
    if (pathRef.current && labelGroupRef.current) {
      renderLabels();
    }
  }, [showLabels, renderLabels]);

  useEffect(() => {
    currentScopeRef.current = currentScope;
  }, [currentScope]);

  // Update map when scope or features change (NOT on clicks)
  useEffect(() => {
    if (currentFeatures.length > 0 && mapGroupRef.current && svgRef.current && zoomRef.current) {
      // Set flag to prevent zoom event handler from interfering
      isUpdatingScopeRef.current = true;
      
      // Use requestAnimationFrame to ensure everything happens in a single frame
      requestAnimationFrame(() => {
        if (!mapGroupRef.current || !svgRef.current || !zoomRef.current) {
          isUpdatingScopeRef.current = false;
          return;
        }
        
        // Hide map container temporarily to prevent visible jump
        if (mapContainerRef.current) {
          mapContainerRef.current.style.display = 'none';
        }
        
        // Clear old paths immediately
        if (mapGroupRef.current) {
          mapGroupRef.current.selectAll('.country-path').remove();
        }
        if (parkGroupRef.current) {
          parkGroupRef.current.selectAll('.park-path').remove();
        }
        if (labelGroupRef.current) {
          labelGroupRef.current.selectAll('.map-label').remove();
        }
        if (hoverLabelGroupRef.current) {
          hoverLabelGroupRef.current.selectAll('.hover-label, .hover-label-bg').remove();
        }
        if (hoverLabelTimeoutRef.current) {
          clearTimeout(hoverLabelTimeoutRef.current);
          hoverLabelTimeoutRef.current = null;
        }
        currentHoverNameRef.current = null;
        
        const worldProjection = geoMiller();
        const usaProjection = d3.geoAlbersUsa();
        const europeProjection = d3.geoMercator().center([15, 55]).scale(800);
        // For China, use Mercator projection - will be fitted to bounds
        const chinaProjection = d3.geoMercator();
        // For India, use Mercator projection - will be fitted to bounds
        const indiaProjection = d3.geoMercator();
        
        const projection = 
          currentScope === 'world' ? worldProjection :
          currentScope === 'usa' ? usaProjection :
          currentScope === 'usaParks' ? usaProjection :
          currentScope === 'europe' ? europeProjection :
          currentScope === 'china' ? chinaProjection :
          indiaProjection;
        currentProjectionRef.current = projection;

        const path = d3.geoPath().projection(projection);
        pathRef.current = path;

        // Calculate and apply transform FIRST (before rendering) to prevent jump
        const dims = updateSvgDimensions();
        console.log(`Rendering ${currentScope} map with ${currentFeatures.length} features, dimensions:`, dims);
        if (dims.width > 0 && dims.height > 0 && pathRef.current && currentFeatures.length > 0) {
          const featureCollection: FeatureCollection = {
            type: "FeatureCollection",
            features: currentFeatures
          };
          
          // Fit projection to features
          try {
            if (currentScope === 'china') {
              // Calculate geographic bounds
              const bounds = d3.geoBounds(featureCollection);
              console.log('China geographic bounds:', bounds);
              
              // Use fitSize with some padding
              const padding = 60;
              projection.fitSize([dims.width - padding * 2, dims.height - padding * 2], featureCollection);
              
              // Get current translate and adjust for padding
              const currentTranslate = projection.translate();
              projection.translate([currentTranslate[0] + padding, currentTranslate[1] + padding]);
              
              console.log('China projection after fit:', {
                center: projection.center(),
                scale: projection.scale(),
                translate: projection.translate()
              });
            } else if (currentScope === 'india') {
              // For India, use fitSize similar to China
              const bounds = d3.geoBounds(featureCollection);
              console.log('India geographic bounds:', bounds);
              
              // Use fitSize with some padding
              const padding = 60;
              projection.fitSize([dims.width - padding * 2, dims.height - padding * 2], featureCollection);
              
              // Get current translate and adjust for padding
              const currentTranslate = projection.translate();
              projection.translate([currentTranslate[0] + padding, currentTranslate[1] + padding]);
              
              console.log('India projection after fitSize:', {
                translate: projection.translate(),
                scale: projection.scale()
              });
            } else {
              projection.fitSize([dims.width, dims.height], featureCollection);
            }
          } catch (error) {
            console.error('Error fitting projection:', error);
            // Fallback: use default center and scale
            if (currentScope === 'china') {
              (projection as d3.GeoProjection).center([105, 35]).scale(1000);
              console.log('Using fallback projection for China');
            } else if (currentScope === 'india') {
              (projection as d3.GeoProjection).center([77, 23]).scale(1000);
              console.log('Using fallback projection for India');
            }
          }
          
          // Calculate initial transform
          const [[x0, y0], [x1, y1]] = pathRef.current.bounds(featureCollection);
          console.log(`Bounds for ${currentScope}:`, { x0, y0, x1, y1 });
          if (x0 !== Infinity && x1 !== -Infinity && y0 !== Infinity && y1 !== -Infinity) {
            const scale = Math.min(dims.width / (x1 - x0), dims.height / (y1 - y0));
            const translateX = (dims.width - scale * (x0 + x1)) / 2;
            const translateY = (dims.height - scale * (y0 + y1)) / 2;
            console.log(`Transform for ${currentScope}:`, { scale, translateX, translateY });
            initialTransformRef.current = d3.zoomIdentity.translate(translateX, translateY).scale(scale);
            
            // Reset zoom state completely first
            const svg = d3.select(svgRef.current);
            svg.property('__zoom', null);
            
            // Update zoom behavior's internal state (without triggering zoom event)
            svg.property('__zoom', initialTransformRef.current);
            
            // Set transform directly on mapGroup and labelGroup
            // This ensures the visual transform matches the zoom state immediately
            if (mapGroupRef.current) {
              mapGroupRef.current.attr("transform", initialTransformRef.current.toString());
            }
            if (parkGroupRef.current) {
              parkGroupRef.current.attr("transform", initialTransformRef.current.toString());
            }
            if (labelGroupRef.current) {
              labelGroupRef.current.attr("transform", initialTransformRef.current.toString());
            }
            // Don't transform hoverLabelGroup - keep labels fixed in screen space
            // if (hoverLabelGroupRef.current) {
            //   hoverLabelGroupRef.current.attr("transform", initialTransformRef.current.toString());
            // }
          }
        }
        
        // Render map synchronously (no async, no delays)
        if (mapGroupRef.current && pathRef.current) {
          const paths = mapGroupRef.current.selectAll<SVGPathElement, GeoFeature>(".country-path")
            .data(currentFeatures, (d: GeoFeature) => d.properties.name);

          const joined = paths.join("path")
            .attr("class", "country-path")
            .attr("data-name", (d: GeoFeature) => d.properties.name.replace(/\s/g, '-').replace(/[^a-zA-Z0-9-]/g, ''))
            .attr("d", (d: GeoFeature) => {
              const pathData = pathRef.current!(d);
              if (!pathData && currentScope === 'china') {
                console.warn('Null path data for:', d.properties.name, d.geometry.type);
              }
              return pathData || '';
            })
            .classed('country-highlight', (d: GeoFeature) => currentScope !== 'usaParks' && activeLocationsRef.current.has(d.properties.name));

          if (currentScope === 'usaParks') {
            joined
              .on("click", null)
              .on("mousedown", null)
              .style("pointer-events", 'none');
          } else {
            joined
              .on("click", function(event: MouseEvent, d: GeoFeature) {
                event.preventDefault();
                event.stopPropagation();
                event.stopImmediatePropagation();
                if (event.type === "mousemove") return;
                if (!d.properties.name) return;
                
                // Hide label and record click time to prevent showing immediately after
                hideHoverLabel();
                lastClickTimeRef.current = Date.now();
                
                handleLocationToggle(d.properties.name);
              })
              .on("mousedown", function(event: MouseEvent) {
                event.stopPropagation();
                // Record mousedown time to prevent label showing on click
                lastClickTimeRef.current = Date.now();
                hideHoverLabel();
              })
              .on("mouseenter", function(_event: MouseEvent, d: GeoFeature) {
                // Don't show label on touch devices (mouse events can fire after touch on some browsers)
                if (isTouchDeviceRef.current) return;
                // Don't show label if we just clicked (within 800ms)
                if (Date.now() - lastClickTimeRef.current < 800) return;
                if (d.properties.name) {
                  showHoverLabel(d.properties.name);
                }
              })
              .on("mouseleave", hideHoverLabel)
              .on("touchstart", function(_event: TouchEvent, d: GeoFeature) {
                if (!d.properties.name) return;
                
                const pathElement = d3.select(this);
                let touchTimeout: number | null = null;
                
                // Prevent text selection during press and hold
                const preventSelection = (e: Event) => {
                  e.preventDefault();
                };
                
                // Only show label on long press (after 300ms), not on quick tap
                touchTimeout = window.setTimeout(() => {
                  showHoverLabel(d.properties.name, true);
                  touchTimeout = null;
                  
                  // Prevent text selection when label is showing
                  document.addEventListener('selectstart', preventSelection);
                  document.addEventListener('contextmenu', preventSelection);
                }, 300);
                
                const handleTouchEnd = () => {
                  if (touchTimeout !== null) {
                    clearTimeout(touchTimeout);
                  }
                  
                  // Immediately hide label on touch release (no delay)
                  if (hoverLabelGroupRef.current) {
                    currentHoverNameRef.current = null;
                    hoverLabelGroupRef.current.selectAll(".hover-label, .hover-label-bg").remove();
                  }
                  if (hoverLabelTimeoutRef.current) {
                    clearTimeout(hoverLabelTimeoutRef.current);
                    hoverLabelTimeoutRef.current = null;
                  }
                  
                  // Re-enable text selection
                  document.removeEventListener('selectstart', preventSelection);
                  document.removeEventListener('contextmenu', preventSelection);
                  
                  pathElement.on("touchend.touchlabel", null);
                  pathElement.on("touchcancel.touchlabel", null);
                  document.removeEventListener('touchend', handleTouchEnd);
                  document.removeEventListener('touchcancel', handleTouchEnd);
                };
                
                // Attach to element and document for reliability
                pathElement.on("touchend.touchlabel", handleTouchEnd);
                pathElement.on("touchcancel.touchlabel", handleTouchEnd);
                document.addEventListener('touchend', handleTouchEnd, { once: true });
                document.addEventListener('touchcancel', handleTouchEnd, { once: true });
              })
              .style("pointer-events", 'auto');
          }
          
          console.log(`Rendered ${joined.size()} paths for ${currentScope}`);
          if (currentScope === 'china' && joined.size() === 0) {
            console.error('No paths rendered for China! Features:', currentFeatures.length);
          }
          
          if (currentScope === 'usaParks' && parkGroupRef.current && pathRef.current) {
            const parkPaths = parkGroupRef.current.selectAll<SVGPathElement, GeoFeature>(".park-path")
              .data(usNationalParkFeatures, (d: GeoFeature) => d.properties.name);

            parkPaths.join("path")
              .attr("class", "park-path")
              .attr("data-name", (d: GeoFeature) => d.properties.name.replace(/\s/g, '-').replace(/[^a-zA-Z0-9-]/g, ''))
              .attr("d", (d: GeoFeature) => pathRef.current!(d) || '')
              .on("click", function(event: MouseEvent, d: GeoFeature) {
                event.preventDefault();
                event.stopPropagation();
                event.stopImmediatePropagation();
                if (event.type === "mousemove") return;
                if (!d.properties.name) return;
                
                // Hide label and record click time to prevent showing immediately after
                hideHoverLabel();
                lastClickTimeRef.current = Date.now();
                
                handleLocationToggle(d.properties.name);
              })
              .on("mousedown", function(event: MouseEvent) {
                event.stopPropagation();
                // Record mousedown time to prevent label showing on click
                lastClickTimeRef.current = Date.now();
                hideHoverLabel();
              })
              .on("mouseenter", function(_event: MouseEvent, d: GeoFeature) {
                // Don't show label on touch devices (mouse events can fire after touch on some browsers)
                if (isTouchDeviceRef.current) return;
                // Don't show label if we just clicked (within 800ms)
                if (Date.now() - lastClickTimeRef.current < 800) return;
                if (d.properties.name) {
                  showHoverLabel(d.properties.name);
                }
              })
              .on("mouseleave", hideHoverLabel)
              .on("touchstart", function(_event: TouchEvent, d: GeoFeature) {
                if (!d.properties.name) return;
                
                const pathElement = d3.select(this);
                let touchTimeout: number | null = null;
                
                // Prevent text selection during press and hold
                const preventSelection = (e: Event) => {
                  e.preventDefault();
                };
                
                // Only show label on long press (after 300ms), not on quick tap
                touchTimeout = window.setTimeout(() => {
                  showHoverLabel(d.properties.name, true);
                  touchTimeout = null;
                  
                  // Prevent text selection when label is showing
                  document.addEventListener('selectstart', preventSelection);
                  document.addEventListener('contextmenu', preventSelection);
                }, 300);
                
                const handleTouchEnd = () => {
                  if (touchTimeout !== null) {
                    clearTimeout(touchTimeout);
                  }
                  
                  // Immediately hide label on touch release (no delay)
                  if (hoverLabelGroupRef.current) {
                    currentHoverNameRef.current = null;
                    hoverLabelGroupRef.current.selectAll(".hover-label, .hover-label-bg").remove();
                  }
                  if (hoverLabelTimeoutRef.current) {
                    clearTimeout(hoverLabelTimeoutRef.current);
                    hoverLabelTimeoutRef.current = null;
                  }
                  
                  // Re-enable text selection
                  document.removeEventListener('selectstart', preventSelection);
                  document.removeEventListener('contextmenu', preventSelection);
                  
                  pathElement.on("touchend.touchlabel", null);
                  pathElement.on("touchcancel.touchlabel", null);
                  document.removeEventListener('touchend', handleTouchEnd);
                  document.removeEventListener('touchcancel', handleTouchEnd);
                };
                
                // Attach to element and document for reliability
                pathElement.on("touchend.touchlabel", handleTouchEnd);
                pathElement.on("touchcancel.touchlabel", handleTouchEnd);
                document.addEventListener('touchend', handleTouchEnd, { once: true });
                document.addEventListener('touchcancel', handleTouchEnd, { once: true });
              })
              .classed('country-highlight', (d: GeoFeature) => activeLocationsRef.current.has(d.properties.name));
          }

          if (showLabelsRef.current) {
            renderLabels();
          }
        }
        
        // Show map container after everything is rendered (in next frame to ensure rendering is complete)
        requestAnimationFrame(() => {
          if (mapContainerRef.current) {
            mapContainerRef.current.style.display = '';
          }
          // Re-enable zoom event handler
          isUpdatingScopeRef.current = false;
        });
      });
    }
    // Only depend on scope and feature count, NOT on functions or activeLocations
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentScope, currentFeatures.length]);

  const listItems: string[] = selectableFeatures
    .map(d => d.properties.name)
    .filter((name): name is string => Boolean(name));

  // Filter locations based on search
  const filteredLocations = listItems
    .filter(name => name.toLowerCase().includes(searchQuery.toLowerCase()))
    .slice()
    .sort();

  return (
    <div className="h-screen flex flex-col py-4 md:px-4 overflow-hidden box-border">
      {/* Header */}
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center py-2 sm:py-3 px-4 sm:px-6 mb-2 sm:mb-3 bg-white/95 backdrop-blur-md shadow-xl rounded-2xl border border-white/20 gap-3 sm:gap-0 mx-4 md:mx-0 flex-shrink-0">
        <div className="flex items-center flex-wrap gap-x-3 sm:gap-x-4 gap-y-2 w-full sm:w-auto">
          <div className="flex items-center space-x-2">
            <img 
              src={logoImage} 
              alt="Travel Tracker Logo" 
              className="w-8 h-8 object-contain flex-shrink-0"
            />
            <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">Travel Tracker</h1>
          </div>

          <div className="relative w-28 sm:w-32">
            <select
              value={currentScope}
              onChange={(e) => handleScopeSelection(e.target.value as Scope)}
              className="custom-select block w-full text-sm py-2.5 px-4 border-2 border-indigo-300 bg-white/95 backdrop-blur-sm rounded-xl shadow-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-800 font-semibold transition-all hover:border-indigo-400 hover:shadow-xl hover:scale-105 active:scale-100 relative z-10"
            >
              <option value="world">🌍 World</option>
              <option value="usa">🇺🇸 USA</option>
              <option value="europe">🇪🇺 Europe</option>
              <option value="china">🇨🇳 China</option>
              <option value="india">🇮🇳 India</option>
              <option value="usaParks">🏞️ US NPs</option>
            </select>
          </div>

        </div>

        <div className="flex items-center space-x-2 sm:space-x-4 text-xs sm:text-sm font-medium">
          <div className="flex items-center space-x-1 sm:space-x-2 px-2 sm:px-4 py-1.5 sm:py-2 bg-gradient-to-r from-amber-50 to-yellow-50 rounded-lg sm:rounded-xl border border-amber-200">
            <span className="text-lg sm:text-2xl font-extrabold bg-gradient-to-r from-amber-600 to-yellow-600 bg-clip-text text-transparent">{locationsCount}</span>
            <span className="text-amber-700 font-semibold hidden sm:inline">{locationTypeLabel}</span>
          </div>
          <div className="flex items-center space-x-1 sm:space-x-2 px-2 sm:px-4 py-1.5 sm:py-2 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg sm:rounded-xl border border-indigo-200">
            <span className="text-lg sm:text-2xl font-extrabold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              {percentage}%
            </span>
            <span className="text-indigo-700 font-semibold hidden sm:inline">{totalTypeLabel.replace('%', '')}</span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex flex-1 space-x-4 relative pl-4 pr-0 md:pl-0 min-h-0">
        {/* Map Container */}
        <div className="flex-grow bg-white/95 backdrop-blur-md shadow-2xl rounded-2xl px-4 py-4 sm:px-6 sm:py-6 relative flex flex-col border border-white/20">
          <div className="flex justify-between items-center mb-4 border-b pb-3 flex-wrap gap-y-3">
            <div className="flex items-center gap-3">
              <h2 className="text-xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent whitespace-nowrap">{mapTitle}</h2>
              {/* Mobile List Toggle Button */}
              <button
                onClick={() => setShowListOnMobile(!showListOnMobile)}
                className="lg:hidden flex items-center justify-center w-10 h-10 bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white rounded-xl shadow-md hover:shadow-lg transition-all"
                title="Toggle locations list"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path>
                </svg>
              </button>
            </div>

            <div className="flex items-center space-x-3">
              <div className="flex items-center gap-1 bg-gradient-to-r from-slate-50 to-gray-50 p-1.5 rounded-xl border border-slate-200 shadow-sm">
                <button
                  onClick={handleZoomIn}
                  className="p-2 hover:bg-white rounded-lg shadow-md transition-all hover:scale-110 active:scale-95"
                  title="Zoom In"
                >
                  <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path>
                  </svg>
                </button>

                <button
                  onClick={handleZoomOut}
                  className="p-2 hover:bg-white rounded-lg shadow-md transition-all hover:scale-110 active:scale-95"
                  title="Zoom Out"
                >
                  <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 12H4"></path>
                  </svg>
                </button>

                <button
                  onClick={resetView}
                  className="p-2 hover:bg-white rounded-lg shadow-md transition-all hover:scale-110 active:scale-95"
                  title="Reset View (Return to initial position)"
                >
                  <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 0a8.001 8.001 0 01-15.356 2M4 4h5"></path>
                  </svg>
                </button>
              </div>

              <div className="h-8 w-px bg-gradient-to-b from-transparent via-gray-300 to-transparent"></div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={() => {
                    const allLocationNames = listItems;
                    
                    if (activeLocations.size === allLocationNames.length) {
                      // Deselect all
                      setActiveLocations(new Set());
                      updatePathHighlights(allLocationNames, false);
                      // Update list items
                      allLocationNames.forEach(name => {
                        const normalizedName = name.replace(/\s/g, '-').replace(/[^a-zA-Z0-9-]/g, '');
                        const listItem = d3.select(`#list-${normalizedName}`);
                        if (!listItem.empty()) {
                          listItem.classed('selected', false);
                          const checkbox = listItem.select('input');
                          if (!checkbox.empty()) {
                            checkbox.property('checked', false);
                          }
                        }
                      });
                    } else {
                      // Select all
                      setActiveLocations(new Set(allLocationNames));
                      updatePathHighlights(allLocationNames, true);
                      // Update list items
                      allLocationNames.forEach(name => {
                        const normalizedName = name.replace(/\s/g, '-').replace(/[^a-zA-Z0-9-]/g, '');
                        const listItem = d3.select(`#list-${normalizedName}`);
                        if (!listItem.empty()) {
                          listItem.classed('selected', true);
                          const checkbox = listItem.select('input');
                          if (!checkbox.empty()) {
                            checkbox.property('checked', true);
                          }
                        }
                      });
                    }
                  }}
                  className={`text-sm flex items-center gap-1.5 px-4 py-2 rounded-xl transition-all font-semibold shadow-md hover:shadow-lg ${
                    activeLocations.size === listItems.length && activeLocations.size > 0
                      ? 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white hover:from-blue-600 hover:to-indigo-600' 
                      : 'bg-gradient-to-r from-slate-100 to-gray-100 hover:from-slate-200 hover:to-gray-200 text-slate-700'
                  }`}
                  title={activeLocations.size === currentFeatures.filter(d => d.properties.name).length && activeLocations.size > 0 ? "Deselect all locations" : "Select all locations"}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>
                  <span className="hidden sm:inline">Select All</span>
                </button>
                
                <button
                  onClick={() => setShowLabels(!showLabels)}
                  className={`text-sm flex items-center gap-1.5 px-4 py-2 rounded-xl transition-all font-semibold shadow-md hover:shadow-lg ${
                    showLabels 
                      ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white hover:from-emerald-600 hover:to-teal-600' 
                      : 'bg-gradient-to-r from-slate-100 to-gray-100 hover:from-slate-200 hover:to-gray-200 text-slate-700'
                  }`}
                  title="Toggle country/state labels for selected locations"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 7h.01M7 3h5m-5 4v10a1 1 0 001 1h6a1 1 0 001-1V4a1 1 0 00-1-1h-2"></path>
                  </svg>
                  <span className="hidden sm:inline">Labels</span>
                </button>

                <button
                  onClick={saveMapAsPNG}
                  className="text-sm flex items-center gap-1.5 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-4 py-2 rounded-xl transition-all font-semibold shadow-md hover:shadow-lg"
                  title="Export map as PNG image (high quality)"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path>
                  </svg>
                  <span className="hidden sm:inline">Save</span>
                </button>
              </div>
            </div>
          </div>

          <div 
            id="map-container" 
            ref={mapContainerRef} 
            className="flex-grow w-full relative overflow-hidden bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 rounded-xl border border-white/50"
            style={{ userSelect: 'none', WebkitUserSelect: 'none', MozUserSelect: 'none', msUserSelect: 'none', WebkitTouchCallout: 'none' }}
            onMouseDown={(e) => {
              // Prevent text selection on long press
              if (e.detail > 1) {
                e.preventDefault();
              }
            }}
            onDragStart={(e) => e.preventDefault()}
            onContextMenu={(e) => e.preventDefault()}
          ></div>
          
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-white/70 backdrop-blur-sm z-50 rounded-xl pointer-events-none">
              <div className="flex items-center">
                <svg className="animate-spin h-6 w-6 mr-3 text-indigo-500" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span className="text-gray-600">Loading map data...</span>
              </div>
            </div>
          )}
          <p 
            className="text-xs text-gray-500 text-right mt-3 font-medium" 
            style={{ userSelect: 'none', WebkitUserSelect: 'none', MozUserSelect: 'none', msUserSelect: 'none' }}
            onMouseDown={(e) => e.preventDefault()}
            onDragStart={(e) => e.preventDefault()}
          >Scroll to zoom • Click/Drag to pan</p>
        </div>

        {/* Sidebar */}
        <div className={`fixed lg:static top-0 bottom-0 right-0 lg:right-auto z-50 lg:z-auto w-80 lg:w-96 max-w-[85vw] lg:max-w-none bg-white/95 backdrop-blur-md shadow-2xl rounded-l-2xl lg:rounded-2xl p-4 sm:p-6 flex flex-col border border-white/20 transform transition-transform duration-300 ease-in-out ${
          showListOnMobile ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'
        }`}>
          {/* Close button for mobile */}
          <button
            onClick={() => setShowListOnMobile(false)}
            className="lg:hidden absolute top-4 right-4 w-8 h-8 flex items-center justify-center bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors z-10"
            title="Close list"
          >
            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
          <h2 className="text-xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent border-b border-gray-200 pb-3 mb-4">{listTitle}</h2>
          <div className="relative mb-4">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search locations..."
              className="w-full pl-10 pr-4 py-3 border-2 border-indigo-200 bg-white/90 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm shadow-md transition-all hover:border-indigo-300"
            />
            <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
            </svg>
          </div>

          <div ref={listContainerRef} className="flex-grow overflow-y-auto border-2 border-gray-100 rounded-xl divide-y divide-gray-100 bg-gradient-to-b from-white to-gray-50/50">
            {filteredLocations.map((name) => {
              const normalizedName = name.replace(/\s/g, '-').replace(/[^a-zA-Z0-9-]/g, '');
              // Use a ref to track selection state to avoid re-renders
              const isSelected = activeLocations.has(name);
              return (
                <div
                  key={name}
                  id={`list-${normalizedName}`}
                  className={`country-list-item flex justify-between items-center ${isSelected ? 'selected' : ''}`}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    e.nativeEvent.stopImmediatePropagation();
                    
                    // Hide label and record click time to prevent showing immediately after
                    hideHoverLabel();
                    lastClickTimeRef.current = Date.now();
                    
                    // Update DOM directly first
                    const listItem = d3.select(`#list-${normalizedName}`);
                    if (!listItem.empty()) {
                      const currentlySelected = listItem.classed('selected');
                      listItem.classed('selected', !currentlySelected);
                      const checkbox = listItem.select('input');
                      if (!checkbox.empty()) {
                        checkbox.property('checked', !currentlySelected);
                      }
                    }
                    // Then update state asynchronously
                    handleLocationToggle(name);
                  }}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                  }}
                  onMouseEnter={() => {
                    // Don't show label on touch devices
                    if (isTouchDeviceRef.current) return;
                    showHoverLabel(name);
                  }}
                  onMouseLeave={hideHoverLabel}
                  onTouchStart={(e) => {
                    // Only show label on long press (after 300ms), not on quick tap
                    let touchTimeout: number | null = window.setTimeout(() => {
                      showHoverLabel(name, true);
                      touchTimeout = null;
                    }, 300);
                    
                    const handleTouchEnd = () => {
                      if (touchTimeout !== null) {
                        clearTimeout(touchTimeout);
                      }
                      hideHoverLabel();
                      document.removeEventListener('touchend', handleTouchEnd);
                      document.removeEventListener('touchcancel', handleTouchEnd);
                    };
                    
                    // Store handler on element for cleanup
                    (e.currentTarget as HTMLElement).addEventListener('touchend', handleTouchEnd, { once: true });
                    (e.currentTarget as HTMLElement).addEventListener('touchcancel', handleTouchEnd, { once: true });
                    document.addEventListener('touchend', handleTouchEnd, { once: true });
                    document.addEventListener('touchcancel', handleTouchEnd, { once: true });
                  }}
                  onTouchEnd={() => {
                    hideHoverLabel();
                  }}
                >
                  <span>{name}</span>
                  <input
                    type="checkbox"
                    checked={isSelected}
                    readOnly
                    tabIndex={-1}
                    className="form-checkbox text-emerald-500 h-5 w-5 border-2 border-gray-300 rounded-full focus:ring-emerald-400 pointer-events-none shadow-sm"
                  />
                </div>
              );
            })}
          </div>
        </div>
        
        {/* Mobile overlay when list is open */}
        {showListOnMobile && (
          <div
            className="lg:hidden fixed inset-0 bg-black/50 z-40"
            onClick={() => setShowListOnMobile(false)}
            style={{ top: 0, left: 0, right: 0, bottom: 0 }}
          ></div>
        )}
      </div>

      {/* Notification Container */}
      <div id="notification-container" className="fixed bottom-4 left-4 z-50"></div>
    </div>
  );
}

export default App;

