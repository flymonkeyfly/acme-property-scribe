import { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { toast } from 'sonner';

interface SuburbMapProps {
  latitude: number;
  longitude: number;
  suburbName: string;
}

export function SuburbMap({ latitude, longitude, suburbName }: SuburbMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [mapboxToken, setMapboxToken] = useState<string>('');
  const [tokenSaved, setTokenSaved] = useState(false);

  useEffect(() => {
    // Check if token is already saved in localStorage
    const savedToken = localStorage.getItem('mapbox_token');
    if (savedToken) {
      setMapboxToken(savedToken);
      setTokenSaved(true);
      initializeMap(savedToken);
    }
  }, []);

  const initializeMap = (token: string) => {
    if (!mapContainer.current || map.current) return;

    try {
      mapboxgl.accessToken = token;
      
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/streets-v12',
        center: [longitude, latitude],
        zoom: 13,
        pitch: 45,
      });

      // Add navigation controls
      map.current.addControl(
        new mapboxgl.NavigationControl({
          visualizePitch: true,
        }),
        'top-right'
      );

      // Add marker for suburb center
      new mapboxgl.Marker({ color: '#667eea' })
        .setLngLat([longitude, latitude])
        .setPopup(
          new mapboxgl.Popup({ offset: 25 })
            .setHTML(`<h3 style="margin: 0; font-weight: bold;">${suburbName}</h3>`)
        )
        .addTo(map.current);

      // Add 3D buildings
      map.current.on('load', () => {
        const layers = map.current?.getStyle().layers;
        if (!layers) return;

        const labelLayerId = layers.find(
          (layer) => layer.type === 'symbol' && layer.layout?.['text-field']
        )?.id;

        if (map.current && labelLayerId) {
          map.current.addLayer(
            {
              id: '3d-buildings',
              source: 'composite',
              'source-layer': 'building',
              filter: ['==', 'extrude', 'true'],
              type: 'fill-extrusion',
              minzoom: 15,
              paint: {
                'fill-extrusion-color': '#aaa',
                'fill-extrusion-height': [
                  'interpolate',
                  ['linear'],
                  ['zoom'],
                  15,
                  0,
                  15.05,
                  ['get', 'height'],
                ],
                'fill-extrusion-base': [
                  'interpolate',
                  ['linear'],
                  ['zoom'],
                  15,
                  0,
                  15.05,
                  ['get', 'min_height'],
                ],
                'fill-extrusion-opacity': 0.6,
              },
            },
            labelLayerId
          );
        }
      });
    } catch (error) {
      console.error('Error initializing map:', error);
      toast.error('Invalid Mapbox token. Please check and try again.');
      setTokenSaved(false);
    }
  };

  const handleSaveToken = () => {
    if (!mapboxToken.trim()) {
      toast.error('Please enter a Mapbox token');
      return;
    }

    localStorage.setItem('mapbox_token', mapboxToken);
    setTokenSaved(true);
    toast.success('Token saved! Initializing map...');
    initializeMap(mapboxToken);
  };

  if (!tokenSaved) {
    return (
      <div className="w-full h-[500px] rounded-lg border border-border bg-muted flex flex-col items-center justify-center p-8">
        <h3 className="text-lg font-semibold mb-2">Mapbox Token Required</h3>
        <p className="text-sm text-muted-foreground text-center mb-6 max-w-md">
          To display the interactive map, please enter your Mapbox public token. 
          <br />
          Get one free at{' '}
          <a 
            href="https://mapbox.com" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-primary hover:underline"
          >
            mapbox.com
          </a>
        </p>
        <div className="flex gap-2 w-full max-w-md">
          <Input
            type="text"
            placeholder="pk.eyJ1IjoiZXhhbXBsZS..."
            value={mapboxToken}
            onChange={(e) => setMapboxToken(e.target.value)}
            className="flex-1"
          />
          <Button onClick={handleSaveToken}>
            Save Token
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-[500px] rounded-lg overflow-hidden">
      <div ref={mapContainer} className="absolute inset-0" />
    </div>
  );
}
