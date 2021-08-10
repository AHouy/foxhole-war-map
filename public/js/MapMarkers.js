// https://leafletjs.com/reference-1.7.1.html#marker
import { w, k } from "./MapRegions.js";

const threshold = 0.0001;

let markers = [null, null];

export function generateMapMarkers(map) {
  // Function handlers
  map.on("click", function (e) {
    let marker = null;
    let i;
    for (i = 0; i < markers.length; i++)
      if (markers[i] === null) {
        marker = markers[i] = new L.marker(e.latlng, {
          id: i,
          draggable: "true",
        });
        break;
      }
    if (marker === null) {
      i = 1;
      map.removeLayer(markers[i]);
      marker = markers[i] = new L.marker(e.latlng, {
        id: i,
        draggable: "true",
      });
    }

    marker.on("dragend", function (event) {
      var marker = event.target;
      var position = marker.getLatLng();
      marker
        .setLatLng(position, { id: i, draggable: "true" })
        .bindPopup(position)
        .update();

      handleUpdate();
    });
    map.addLayer(marker);

    handleUpdate();
  });

  map.on("contextmenu", function (e) {
    for (let i = 0; i < markers.length; i++) {
      if (markers[i]) {
        const { lat, lng } = e.latlng;
        const { lat: markerLat, lng: markerLng } = markers[i].getLatLng();
        if (
          Math.abs(markerLat) - threshold <=
            Math.abs(lat) <=
            Math.abs(markerLat) + threshold &&
          Math.abs(markerLng) - threshold <=
            Math.abs(lng) <=
            Math.abs(markerLng) + threshold
        ) {
          map.removeLayer(markers[i]);
          markers[i] = null;
          break;
        }
      }
    }
  });
}

// Helpers
function handleUpdate() {
  if (!markers[0] || !markers[1]) return;

  console.log(getDistance(markers[0].getLatLng(), markers[1].getLatLng()));
  console.log(getAzimuth(markers[0].getLatLng(), markers[1].getLatLng()));

  document.getElementById("distance").innerText = getDistance(markers[0].getLatLng(), markers[1].getLatLng())
  document.getElementById("azimuth").innerText = getAzimuth(markers[0].getLatLng(), markers[1].getLatLng())
}

function getDistance(friendly, target) {
  const latDist = Math.abs(Math.abs(friendly.lat) - Math.abs(target.lat));
  const lngDist = Math.abs(Math.abs(friendly.lng) - Math.abs(target.lng));
  return (Math.sqrt(Math.pow(latDist * w, 2) + Math.pow(lngDist * k, 2))) * (12000/10299);
}

function getAzimuth(friendly, target) {
  const lngDiff = target.lng - friendly.lng;
  const latDiff = target.lat - friendly.lat;
  const azimuth = Math.PI * 0.5 - Math.atan(latDiff / lngDiff);

  let result;
  if (lngDiff > 0) result = azimuth;
  else if (lngDiff < 0) result = azimuth + Math.PI;
  else if (latDiff < 0) result = Math.PI;
  else result = 0;

  return result * (180 / Math.PI);
}
