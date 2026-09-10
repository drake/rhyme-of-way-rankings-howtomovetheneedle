/* MapLibre map + zoom for rhyme rankings. Uses DATA from index.html. */
(function () {
  'use strict';
  if (!window.maplibregl || !window.DATA) return;

  var STYLES = {
    light: 'https://tiles.openfreemap.org/styles/liberty',
    dark: 'https://tiles.openfreemap.org/styles/dark'
  };
  var US_BOUNDS = [[-125, 24], [-66, 50]];
  var map, selected = null, layersReady = false;

  function currentStyle() {
    var theme = document.documentElement.getAttribute('data-theme');
    return theme === 'dark' || theme === 'matrix' ? STYLES.dark : STYLES.light;
  }

  function features() {
    return DATA.map(function (r, i) {
      return {
        type: 'Feature',
        properties: { i: i, r: r.r, na: r.na, nb: r.nb, place: r.c + ', ' + r.st },
        geometry: { type: 'Point', coordinates: [r.lon, r.lat] }
      };
    });
  }

  function accent() {
    var theme = document.documentElement.getAttribute('data-theme');
    if (theme === 'matrix') return '#00ff66';
    if (theme === 'dark') return '#e07a7a';
    return '#9b2c2c';
  }

  function addLayers() {
    if (!map.getSource('intersections')) {
      map.addSource('intersections', {
        type: 'geojson',
        data: { type: 'FeatureCollection', features: features() }
      });
    }
    if (!map.getSource('selection')) {
      map.addSource('selection', {
        type: 'geojson',
        data: { type: 'FeatureCollection', features: [] }
      });
    }
    if (!map.getLayer('dots')) {
      map.addLayer({
        id: 'dots',
        type: 'circle',
        source: 'intersections',
        paint: {
          'circle-radius': ['interpolate', ['linear'], ['zoom'], 3, 2.6, 10, 4.4, 16, 7],
          'circle-color': accent(),
          'circle-opacity': 0.9,
          'circle-stroke-color': '#fffdf8',
          'circle-stroke-width': 0.9
        }
      });
      map.addLayer({
        id: 'hit',
        type: 'circle',
        source: 'intersections',
        paint: { 'circle-radius': 14, 'circle-color': accent(), 'circle-opacity': 0 }
      });
      map.addLayer({
        id: 'selected-halo',
        type: 'circle',
        source: 'selection',
        paint: {
          'circle-radius': 16,
          'circle-color': accent(),
          'circle-opacity': 0.16,
          'circle-stroke-color': accent(),
          'circle-stroke-width': 1.6
        }
      });
      map.addLayer({
        id: 'selected-dot',
        type: 'circle',
        source: 'selection',
        paint: {
          'circle-radius': 7,
          'circle-color': accent(),
          'circle-stroke-color': '#fffdf8',
          'circle-stroke-width': 2
        }
      });
    } else {
      map.setPaintProperty('dots', 'circle-color', accent());
      map.setPaintProperty('selected-halo', 'circle-color', accent());
      map.setPaintProperty('selected-halo', 'circle-stroke-color', accent());
      map.setPaintProperty('selected-dot', 'circle-color', accent());
    }
    layersReady = true;
    drawSelection();
  }

  function drawSelection() {
    if (!map || !map.getSource('selection')) return;
    map.getSource('selection').setData({
      type: 'FeatureCollection',
      features: selected ? [{
        type: 'Feature',
        properties: {},
        geometry: { type: 'Point', coordinates: [selected.lon, selected.lat] }
      }] : []
    });
  }

  function showSign(r) {
    var panel = document.getElementById('sign-card');
    document.getElementById('sign-a').textContent = r.na;
    document.getElementById('sign-b').textContent = r.nb;
    document.getElementById('sign-place').textContent = r.c + ', ' + r.st;
    document.getElementById('sign-score').textContent = r.l + ' · ' + r.s.toFixed(1);
    document.getElementById('sign-maps').href = 'https://maps.google.com/?q=' + r.lat + ',' + r.lon;
    panel.hidden = false;
  }

  function highlightRow(r) {
    document.querySelectorAll('#tb tr.active').forEach(function (tr) { tr.classList.remove('active'); });
    var tr = document.querySelector('#tb tr[data-r="' + r.r + '"]');
    if (tr) {
      tr.classList.add('active');
      tr.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    }
  }

  function focusPair(r, zoom) {
    selected = r;
    showSign(r);
    drawSelection();
    highlightRow(r);
    if (zoom && map) {
      var z = map.getZoom();
      map.flyTo({
        center: [r.lon, r.lat],
        zoom: Math.max(z < 11 ? 13.5 : z, 12),
        duration: matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : 900
      });
    }
  }
  window.focusPair = focusPair;

  map = new maplibregl.Map({
    container: 'map',
    style: currentStyle(),
    bounds: US_BOUNDS,
    fitBoundsOptions: { padding: 28 },
    dragRotate: false,
    pitchWithRotate: false,
    attributionControl: true
  });
  map.touchZoomRotate.disableRotation();
  map.addControl(new maplibregl.NavigationControl({ showCompass: false, visualizePitch: false }), 'top-right');
  map.on('load', function () { addLayers(); map.resize(); });
  map.on('style.load', addLayers);
  if (window.ResizeObserver) {
    new ResizeObserver(function () { map.resize(); }).observe(document.getElementById('map'));
  }

  map.on('mouseenter', 'hit', function () { map.getCanvas().style.cursor = 'pointer'; });
  map.on('mouseleave', 'hit', function () { map.getCanvas().style.cursor = ''; });
  map.on('click', 'hit', function (e) {
    var i = e.features && e.features[0] && e.features[0].properties.i;
    if (i == null) return;
    focusPair(DATA[i], true);
  });

  document.getElementById('tb').addEventListener('click', function (e) {
    if (e.target.closest('a')) return;
    var tr = e.target.closest('tr[data-r]');
    if (!tr) return;
    var r = DATA.find(function (x) { return String(x.r) === tr.dataset.r; });
    if (r) focusPair(r, true);
  });

  document.getElementById('sign-close').addEventListener('click', function () {
    selected = null;
    document.getElementById('sign-card').hidden = true;
    drawSelection();
    document.querySelectorAll('#tb tr.active').forEach(function (tr) { tr.classList.remove('active'); });
  });

  document.getElementById('map-reset').addEventListener('click', function () {
    map.fitBounds(US_BOUNDS, { padding: 28, duration: 800 });
  });

  var lastStyle = currentStyle();
  new MutationObserver(function () {
    var next = currentStyle();
    if (next !== lastStyle) {
      lastStyle = next;
      layersReady = false;
      map.setStyle(next);
    } else if (layersReady) {
      addLayers();
    }
  }).observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
})();
