import { useState, useEffect, useRef, useCallback } from 'react';
import * as d3 from 'd3';
import { geoMiller } from 'd3-geo-projection';
import { feature } from 'topojson-client';
import type { FeatureCollection, Feature } from 'geojson';
import type { Topology, GeometryCollection } from 'topojson-specification';
import logoImage from '/logo_tt.png';
import './App.css';

// Type definitions
type Scope = 'world' | 'usa' | 'europe' | 'china';
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
const CHINA_PROVINCES_URL = 'https://raw.githubusercontent.com/junwang23/geoCN/refs/heads/master/geojson/china_provinces.json';
const EUROPE_TOPJSON_URL = 'https://raw.githubusercontent.com/leakyMirror/map-of-europe/refs/heads/master/TopoJSON/europe.topojson';

function App() {
  // State management
  const [currentScope, setCurrentScope] = useState<Scope>('world');
  const [activeLocations, setActiveLocations] = useState<Set<string>>(new Set());
  const [showLabels, setShowLabels] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [worldCountryFeatures, setWorldCountryFeatures] = useState<GeoFeature[]>([]);
  const [usStateFeatures, setUsStateFeatures] = useState<GeoFeature[]>([]);
  const [europeCountryFeatures, setEuropeCountryFeatures] = useState<GeoFeature[]>([]);
  const [chinaProvinceFeatures, setChinaProvinceFeatures] = useState<GeoFeature[]>([]);

  // Refs for D3.js
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const listContainerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement | null>(null);
  const mapGroupRef = useRef<d3.Selection<SVGGElement, unknown, null, undefined> | null>(null);
  const labelGroupRef = useRef<d3.Selection<SVGGElement, unknown, null, undefined> | null>(null);
  const zoomRef = useRef<d3.ZoomBehavior<SVGSVGElement, unknown> | null>(null);
  const pathRef = useRef<d3.GeoPath | null>(null);
  const currentProjectionRef = useRef<d3.GeoProjection | null>(null);
  const initialTransformRef = useRef<d3.ZoomTransform>(d3.zoomIdentity);
  const isUpdatingScopeRef = useRef(false);

  // Computed values
  const currentFeatures = 
    currentScope === 'world' ? worldCountryFeatures :
    currentScope === 'usa' ? usStateFeatures :
    currentScope === 'europe' ? europeCountryFeatures :
    chinaProvinceFeatures;
  
  const locationTypeLabel = 
    currentScope === 'world' ? 'Countries' :
    currentScope === 'usa' ? 'States' :
    currentScope === 'europe' ? 'Countries' :
    'Provinces';
  
  const totalTypeLabel = 
    currentScope === 'world' ? '% World' :
    currentScope === 'usa' ? '% USA' :
    currentScope === 'europe' ? '% Europe' :
    '% China';
  
  const mapTitle = 
    currentScope === 'world' ? 'World Map' :
    currentScope === 'usa' ? 'USA Map' :
    currentScope === 'europe' ? 'Europe Map' :
    'China Map';
  
  const listTitle = 
    currentScope === 'world' ? 'Countries List' :
    currentScope === 'usa' ? 'States List' :
    currentScope === 'europe' ? 'Countries List' :
    'Provinces List';
  
  const locationsCount = activeLocations.size;
  const totalReference = currentScope === 'world' 
    ? worldCountryFeatures.length 
    : usStateFeatures.length;
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
        .filter(d => d.properties.name && d.properties.name !== 'Antarctica');
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

      if (showLabelsRef.current) {
        renderLabels();
      }
    }, 50);
  }, [currentFeatures, updateSvgDimensionsAndFit]);

  // Render labels
  const renderLabels = useCallback(() => {
    if (!labelGroupRef.current || !pathRef.current) return;

    if (showLabelsRef.current) {
      // Get currently selected locations
      const selectedFeatures = currentFeatures.filter(d => 
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
  }, [currentFeatures]);

  // Handle location toggle - optimized to prevent re-renders
  const handleLocationToggle = useCallback((locationName: string) => {
    // Show location name notification
    showLocationName(locationName);
    
    const normalizedName = locationName.replace(/\s/g, '-').replace(/[^a-zA-Z0-9-]/g, '');
    
    // Update DOM directly first (immediate visual feedback) - no React re-render
    if (mapGroupRef.current) {
      const pathElement = mapGroupRef.current.select(`path[data-name="${normalizedName}"]`);
      if (!pathElement.empty()) {
        const isCurrentlySelected = pathElement.classed('country-highlight');
        pathElement.classed('country-highlight', !isCurrentlySelected);
      }
    }
    
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
          const selectedFeatures = currentFeatures.filter(d => newSet.has(d.properties.name));
          
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
  }, [currentFeatures, showLocationName]);


  // Handle scope selection
  const handleScopeSelection = useCallback(async (scope: Scope) => {
    if (scope === currentScope) return;

    // Clear active locations
    setActiveLocations(new Set());
    
    setIsLoading(true);
    
    // Load data based on scope
    if (scope === 'usa') {
      await loadUSAData();
    } else if (scope === 'europe') {
      await loadEuropeData();
    } else if (scope === 'china') {
      await loadChinaData();
    }
    
    setIsLoading(false);

    // Update scope - the useEffect will handle all rendering with proper transform
    setCurrentScope(scope);
  }, [currentScope, loadUSAData, loadEuropeData, loadChinaData]);

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
      .style("left", "0");

    svgRef.current = svg.node();

    const mapGroup = svg.append("g").attr("id", "map-group");
    const labelGroup = svg.append("g").attr("id", "label-group");

    mapGroupRef.current = mapGroup;
    labelGroupRef.current = labelGroup;

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
        
        if (mapGroupRef.current && labelGroupRef.current) {
          mapGroupRef.current.attr("transform", event.transform);
          labelGroupRef.current.attr("transform", event.transform);
        }
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
        if (labelGroupRef.current) {
          labelGroupRef.current.selectAll('.map-label').remove();
        }
        
        const worldProjection = geoMiller();
        const usaProjection = d3.geoAlbersUsa();
        const europeProjection = d3.geoMercator().center([15, 55]).scale(800);
        // For China, use Mercator projection - will be fitted to bounds
        const chinaProjection = d3.geoMercator();
        
        const projection = 
          currentScope === 'world' ? worldProjection :
          currentScope === 'usa' ? usaProjection :
          currentScope === 'europe' ? europeProjection :
          chinaProjection;
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
            } else {
              projection.fitSize([dims.width, dims.height], featureCollection);
            }
          } catch (error) {
            console.error('Error fitting projection:', error);
            // Fallback: use default center and scale
            if (currentScope === 'china') {
              (projection as d3.GeoProjection).center([105, 35]).scale(1000);
              console.log('Using fallback projection for China');
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
            if (labelGroupRef.current) {
              labelGroupRef.current.attr("transform", initialTransformRef.current.toString());
            }
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
            .on("click", function(event: MouseEvent, d: GeoFeature) {
              event.preventDefault();
              event.stopPropagation();
              event.stopImmediatePropagation();
              if (event.type === "mousemove") return;
              if (!d.properties.name) return;
              handleLocationToggle(d.properties.name);
            })
            .on("mousedown", function(event: MouseEvent) {
              event.stopPropagation();
            })
            .classed('country-highlight', (d: GeoFeature) => activeLocationsRef.current.has(d.properties.name));
          
          console.log(`Rendered ${joined.size()} paths for ${currentScope}`);
          if (currentScope === 'china' && joined.size() === 0) {
            console.error('No paths rendered for China! Features:', currentFeatures.length);
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

  // Filter locations based on search
  const filteredLocations = currentFeatures
    .map(d => d.properties.name)
    .filter(name => name)
    .filter(name => name.toLowerCase().includes(searchQuery.toLowerCase()))
    .sort();

  return (
    <div className="p-4 min-h-screen">
      {/* Header */}
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center py-3 sm:py-4 px-4 sm:px-6 mb-4 sm:mb-6 bg-white/95 backdrop-blur-md shadow-xl rounded-2xl border border-white/20 gap-3 sm:gap-0">
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
      <div className="flex h-[calc(100vh-100px)] space-x-4">
        {/* Map Container */}
        <div className="flex-grow bg-white/95 backdrop-blur-md shadow-2xl rounded-2xl p-6 relative flex flex-col border border-white/20">
          <div className="flex justify-between items-center mb-4 border-b pb-3 flex-wrap gap-y-3">
            <h2 className="text-xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent whitespace-nowrap">{mapTitle}</h2>

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
                    const allLocationNames = currentFeatures
                      .map(d => d.properties.name)
                      .filter(name => name);
                    
                    if (activeLocations.size === allLocationNames.length) {
                      // Deselect all
                      setActiveLocations(new Set());
                      // Update DOM directly
                      if (mapGroupRef.current) {
                        mapGroupRef.current.selectAll('.country-path')
                          .classed('country-highlight', false);
                      }
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
                      // Update DOM directly
                      if (mapGroupRef.current) {
                        mapGroupRef.current.selectAll('.country-path')
                          .classed('country-highlight', true);
                      }
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
                    activeLocations.size === currentFeatures.filter(d => d.properties.name).length && activeLocations.size > 0
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

          <div id="map-container" ref={mapContainerRef} className="flex-grow w-full relative overflow-hidden bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 rounded-xl border border-white/50"></div>
          
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
          <p className="text-xs text-gray-500 text-right mt-3 font-medium">Scroll to zoom • Click/Drag to pan</p>
        </div>

        {/* Sidebar */}
        <div className="w-96 bg-white/95 backdrop-blur-md shadow-2xl rounded-2xl p-6 flex flex-col border border-white/20">
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
      </div>

      {/* Notification Container */}
      <div id="notification-container" className="fixed bottom-4 left-4 z-50"></div>
    </div>
  );
}

export default App;

