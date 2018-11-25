const L = require('leaflet')
const terrBounds = require('./territory_bounds')
const terrMeta = require('./territory_meta')


let theMap = L.map('map', { 
    attributionControl: false,
    crs: L.CRS.Simple,
    center: [1024, 1024],
    inertia: false,
    minZoom: -2,
    maxZoom: 1,
    zoom: -.5,
    zoomDelta: .5,
    zoomSnap: .5
})

let mapTerrCanvas = L.canvas()

let attribution = L.control.attribution({ prefix: "Map Image &copy; Muse Games" }).addTo(theMap)
attribution.addAttribution('<a href="https://leafletjs.com" target="_blank">Leaflet</a>')

let bounds = [[0, 0], [2048, 2048]]
let mapImage = L.imageOverlay('map_comp.png', bounds).addTo(theMap)

theMap.setMaxBounds([[-150, -250], [2198, 2298]])

let mapTerrs = L.layerGroup().addTo(theMap)
let mapCapitols = L.layerGroup().addTo(theMap)


terrBounds.forEach(item => {
    L.polygon(item[1], { color: '#aaa', weight: 1, renderer: mapTerrCanvas, interactive: false }).addTo(mapTerrs)
})

terrMeta.forEach(meta => {
    L.circleMarker(meta.capitol, { radius: 5, color: '#fff', fillOpacity: 1, weight: 1, interactive: false }).addTo(theMap)
})

