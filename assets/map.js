/* MapLibre map + zoom. DATA is a top-level const in index.html, not window.DATA. */
(function () {
  'use strict';

  function fail(msg) {
    var el = document.getElementById('map');
    if (el) el.innerHTML = '<p class="map-error">' + msg + '</p>';
  }

  if (typeof maplibregl === 'undefined') {
    fail('Map library did not load.');
    return;
  }
  if (typeof DATA === 'undefined' || !DATA.length) {
    fail('Intersection data did not load.');
    return;
  }

  function rasterStyle(dark) {
    return {
      version: 8,
      sources: {
        carto: {
          type: 'raster',
          tiles: [dark
            ? 'https://basemaps.cartocdn.com/dark_all/{z}/{x}/{y}@2x.png'
            : 'https://basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}@2x.png'],
          tileSize: 256,
          maxzoom: 20,
          attribution: '© OpenStreetMap © CARTO'
        }
      },
      layers: [{ id: 'carto', type: 'raster', source: 'carto' }]
    };
  }

  var US_BOUNDS = [[-125, 24], [-66, 50]];
  var map, selected = null;

  function isDark() {
    var theme = document.documentElement.getAttribute('data-theme');
    return theme === 'dark' || theme === 'matrix';
  }

  function accent() {
    var theme = document.documentElement.getAttribute('data-theme');
    if (theme === 'matrix') return '#00ff66';
    if (theme === 'dark') return '#e07a7a';
    return '#9b2c2c';
  }

  function geojson() {
    var feats = [];
    for (var i = 0; i < DATA.length; i++) {
      var r = DATA[i];
      if (typeof r.lon !== 'number' || typeof r.lat !== 'number') continue;
      feats.push({
        type: 'Feature',
        properties: { i: i },
        geometry: { type: 'Point', coordinates: [r.lon, r.lat] }
      });
    }
    return { type: 'FeatureCollection', features: feats };
  }

  function addLayers() {
    if (!map.getSource('intersections')) {
      map.addSource('intersections', { type: 'geojson', data: geojson() });
    }
    if (!map.getSource('selection')) {
      map.addSource('selection', {
        type: 'geojson',
        data: { type: 'FeatureCollection', features: [] }
      });
    }
    if (map.getLayer('dots')) {
      map.setPaintProperty('dots', 'circle-color', accent());
      map.setPaintProperty('selected-halo', 'circle-color', accent());
      map.setPaintProperty('selected-halo', 'circle-stroke-color', accent());
      map.setPaintProperty('selected-dot', 'circle-color', accent());
      drawSelection();
      return;
    }
    map.addLayer({
      id: 'dots',
      type: 'circle',
      source: 'intersections',
      paint: {
        'circle-radius': ['interpolate', ['linear'], ['zoom'], 3, 2.6, 10, 4.4, 16, 7],
        'circle-color': accent(),
        'circle-opacity': 0.92,
        'circle-stroke-color': '#fffdf8',
        'circle-stroke-width': 0.9
      }
    });
    map.addLayer({
      id: 'hit',
      type: 'circle',
      source: 'intersections',
      paint: { 'circle-radius': 16, 'circle-color': accent(), 'circle-opacity': 0 }
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
    document.getElementById('sign-a').textContent = r.na;
    document.getElementById('sign-b').textContent = r.nb;
    document.getElementById('sign-place').textContent = r.c + ', ' + r.st;
    document.getElementById('sign-score').textContent = r.l + ' · ' + r.s.toFixed(1);
    document.getElementById('sign-maps').href = 'https://maps.google.com/?q=' + r.lat + ',' + r.lon;
    document.getElementById('sign-card').hidden = false;
  }

  function highlightRow(r) {
    document.querySelectorAll('#tb tr.active').forEach(function (tr) {
      tr.classList.remove('active');
    });
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
      map.flyTo({
        center: [r.lon, r.lat],
        zoom: Math.max(map.getZoom(), 13),
        duration: matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : 900
      });
    }
  }
  window.focusPair = focusPair;

  try {
    map = new maplibregl.Map({
      container: 'map',
      style: rasterStyle(isDark()),
      bounds: US_BOUNDS,
      fitBoundsOptions: { padding: 28 },
      dragRotate: false,
      pitchWithRotate: false,
      attributionControl: true
    });
  } catch (err) {
    fail('Could not start the map.');
    return;
  }

  map.touchZoomRotate.disableRotation();
  map.addControl(new maplibregl.NavigationControl({ showCompass: false }), 'top-right');
  map.on('load', function () {
    addLayers();
    map.resize();
  });
  map.on('style.load', addLayers);

  function resize() {
    if (map) map.resize();
  }
  if (window.ResizeObserver) {
    new ResizeObserver(resize).observe(document.querySelector('.map-pane'));
  }
  window.addEventListener('resize', resize);
  setTimeout(resize, 250);
  setTimeout(resize, 1200);

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
    var rank = Number(tr.dataset.r);
    var r = DATA.find(function (x) { return x.r === rank; });
    if (r) focusPair(r, true);
  });

  document.getElementById('sign-close').addEventListener('click', function () {
    selected = null;
    document.getElementById('sign-card').hidden = true;
    drawSelection();
    document.querySelectorAll('#tb tr.active').forEach(function (tr) {
      tr.classList.remove('active');
    });
  });

  document.getElementById('map-reset').addEventListener('click', function () {
    map.fitBounds(US_BOUNDS, { padding: 28, duration: 800 });
  });

  var lastDark = isDark();
  new MutationObserver(function () {
    var dark = isDark();
    if (dark === lastDark) {
      if (map.getLayer('dots')) addLayers();
      return;
    }
    lastDark = dark;
    map.setStyle(rasterStyle(dark));
  }).observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
})();
