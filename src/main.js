const L = require('leaflet')
const terrBounds = require('./territory_bounds')


let theMap = L.map('map', { 
    attributionControl: false,
    crs: L.CRS.Simple,
    center: [1024, 1024],
    inertia: false,
    minZoom: -1.5,
    maxZoom: 1,
    zoom: -.5,
    zoomDelta: .5,
    zoomSnap: .5
})

let attribution = L.control.attribution({ prefix: "Map Image &copy; Muse Games" }).addTo(theMap)
attribution.addAttribution('<a href="https://leafletjs.com" target="_blank">Leaflet</a>')

let bounds = [[0, 0], [2048, 2048]]
let mapImage = L.imageOverlay('map.png', bounds).addTo(theMap)

theMap.setMaxBounds(bounds)

let mapTerrs = L.layerGroup().addTo(theMap)


terrBounds.forEach(item => {
    L.polygon(item[1], { color: 'blue' }).addTo(mapTerrs)
})