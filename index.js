// This is a script to calculate the best position to place
// state labels for each state polygon or multiploygon.
// In case of a multipolygon state like Alaska, the polygon with the largest
// area, calculated using turfJS, is taken to calculate the polylable point.

const fs = require('fs')
const polylabel = require('polylabel')
const turf = require('@turf/turf')

let states = JSON.parse(
  fs.readFileSync('./data/states.geojson', 'utf8')
)

let geoJSON = { 'type': 'FeatureCollection',
  'features': []
}

for (let state of states.features) {
  let polygon = state.geometry.coordinates
  if (state.geometry.type === 'MultiPolygon') {
    let area = 0
    for (let p of state.geometry.coordinates) {
      p = turf.polygon(p)
      let newArea = turf.area(p)
      area = Math.max(area, newArea)
      polygon = area === newArea ? p.geometry.coordinates : polygon
    }
  }
  let coords = polylabel(polygon, 1.0)
  let point = { 'type': 'Feature',
    'geometry': {
      'type': 'Point',
      'coordinates': coords
    },
    'properties': state.properties
  }
  geoJSON.features.push(point)
  console.log(point)
}

fs.writeFileSync('state-labels.geojson', JSON.stringify(geoJSON))
