import 'ol/ol.css';
import GeoJSON from 'ol/format/GeoJSON';
import Graticule from 'ol/layer/Graticule';
import Map from 'ol/Map';
import OSM from 'ol/source/OSM';
import Projection from 'ol/proj/Projection';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import TileLayer from 'ol/layer/Tile';
import WMTS from 'ol/source/WMTS';
import WMTSTileGrid from 'ol/tilegrid/WMTS';
import {get as getProjection} from 'ol/proj';
import {getTopLeft, getWidth} from 'ol/extent';
import View from 'ol/View';
import proj4 from 'proj4';
import {register} from 'ol/proj/proj4';
import jsonDataUrl from "url:./data/data_4326.json"


proj4.defs("EPSG:3575","+proj=laea +lat_0=90 +lon_0=10 +x_0=0 +y_0=0 +datum=WGS84 +units=m +no_defs");
register(proj4);

var pixel_ratio = parseInt(window.devicePixelRatio) || 1;
var halfWidth = 0.7653669 * 6371007.2;
var extent = [-halfWidth, -halfWidth, halfWidth, halfWidth];
var max_zoom = 16;
//var extent = [0.0000, 0.0000, 849024.0785, 4815054.8210];
var projection3575 = new Projection({
  code: 'EPSG:3575',
  units: 'm',
  extent: extent
});

var projection = getProjection(projection3575);
var projectionExtent = projection.getExtent();

var size = getWidth(projectionExtent) / 256;
var resolutions = new Array(max_zoom);
var matrixIds = new Array(max_zoom);
for (var z = 0; z < max_zoom; ++z) {
  // generate resolutions and matrixIds arrays for this WMTS
  resolutions[z] = size / Math.pow(2, z);
  matrixIds[z] = z;
}


var map = new Map({
  keyboardEventTarget: document,
  layers: [],
  target: 'map',
  view: new View({
    center: [-699820, 1320343],
    //center: [0, 0],
    projection: projection,
    zoom: 2,
  }),
});


const baseMapLayer = new TileLayer({
    opacity: 1,
    source: new WMTS({
      attributions: 'Tiles © Attribution',
      url: 'https://geoportal.arctic-sdi.org/action?action_route=GetLayerTile&id=1',
      layer: 'arctic_cascading',
      id: 1,
      action_route: "GetLayerTile",
      matrixSet: '3575',
      version: "1.0.0",
      format: 'image/png',
      projection: projection,
      tileGrid: new WMTSTileGrid({
        origin: getTopLeft(projectionExtent),
        resolutions: resolutions,
        matrixIds: matrixIds,
      }),
      tilePixelRatio: pixel_ratio,
      style: 'default',
      //wrapX: true,
    }),
});

const geoJsonSource = new VectorSource({
    url: jsonDataUrl,
    projection: projection,
    format: new GeoJSON()
});

const geoJsonLayer = new VectorLayer({
    source: geoJsonSource
});

map.addLayer(baseMapLayer);
map.addLayer(geoJsonLayer);