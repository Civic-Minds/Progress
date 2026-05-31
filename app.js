// DOM Elements
const sidebar = document.getElementById('sidebar');
const projectName = document.getElementById('project-name');
const projectList = document.getElementById('project-list');
const detailsView = document.getElementById('project-details-view');
const projectStatus = document.getElementById('project-status');
const projectDescription = document.getElementById('project-description');
const projectMilestones = document.getElementById('project-milestones');
const projectTimeline = document.getElementById('project-timeline');
const projectLink = document.getElementById('project-link');
const closeBtn = document.getElementById('close-sidebar');
const openBtn = document.getElementById('open-sidebar');
const backBtn = document.getElementById('back-to-list');

const agencyFilter = document.getElementById('agency-filter');
const statusFilter = document.getElementById('status-filter');

const tokenPrompt = document.getElementById('token-prompt');
const tokenInput = document.getElementById('token-input');
const tokenSubmit = document.getElementById('token-submit');

const DEFAULT_TITLE = 'Transit Construction';
const STATUS_ORDER = ['planning', 'approved', 'construction', 'opened', 'delayed'];
const MAP_BACKGROUND_COLOR = '#f8f1e6';

let map;
let allProjects = [];
let markers = [];

function showSidebar() {
    sidebar.classList.add('open');
    openBtn.classList.add('hidden');
}

function hideSidebar() {
    sidebar.classList.remove('open');
    openBtn.classList.remove('hidden');
}

// Check for saved token
const savedToken = localStorage.getItem('mapbox_token');
if (savedToken) {
    initializeMap(savedToken);
}

tokenSubmit.addEventListener('click', () => {
    const token = tokenInput.value.trim();
    if (token) {
        localStorage.setItem('mapbox_token', token);
        initializeMap(token);
    } else {
        alert('Please enter a valid Mapbox token.');
    }
});

async function fetchProjects() {
    try {
        const response = await fetch('data/projects.json');
        const data = await response.json();
        allProjects = data.features;
        populateFilters(allProjects);
        renderProjectList(allProjects);
        updateMapData(data);
    } catch (error) {
        console.error('Error fetching projects:', error);
    }
}

function initializeMap(token) {
    mapboxgl.accessToken = token;
    tokenPrompt.style.display = 'none';

    map = new mapboxgl.Map({
        container: 'map',
        style: 'mapbox://styles/mapbox/light-v11',
        center: [-98.5, 39.5], // North America
        zoom: 3
    });

    map.on('load', () => {
        simplifyBaseMap();
        fetchProjects();

        // Show UI elements
        sidebar.classList.remove('hidden');
        document.getElementById('legend').classList.remove('hidden');
        showSidebar();
        map.addSource('transit-projects', {
            'type': 'geojson',
            'data': { type: 'FeatureCollection', features: [] }
        });

        // Line layers
        map.addLayer({
            'id': 'transit-lines',
            'type': 'line',
            'source': 'transit-projects',
            'layout': { 'line-join': 'round', 'line-cap': 'round' },
            'paint': {
                'line-color': ['get', 'color'],
                'line-width': 2.5,
                'line-opacity': 0.85,
                'line-dasharray': [1.2, 2.2]
            },
            'filter': ['in', '$type', 'LineString', 'MultiLineString']
        });

        map.addLayer({
            'id': 'transit-lines-hover',
            'type': 'line',
            'source': 'transit-projects',
            'layout': { 'line-join': 'round', 'line-cap': 'round' },
            'paint': {
                'line-color': ['get', 'color'],
                'line-width': 7,
                'line-opacity': 0.25
            },
            'filter': ['all', ['in', '$type', 'LineString', 'MultiLineString'], ['==', 'name', '']]
        });

        map.on('click', 'transit-lines', (e) => {
            const props = e.features[0].properties;
            showProjectDetails(props);
        });

        map.on('mouseenter', 'transit-lines', () => {
            map.getCanvas().style.cursor = 'pointer';
        });

        map.on('mouseleave', 'transit-lines', () => {
            map.getCanvas().style.cursor = '';
        });
    });
}

function simplifyBaseMap() {
    if (!map) return;
    const style = map.getStyle();
    if (!style || !style.layers) return;

    style.layers.forEach(layer => {
        if (layer.type === 'background') {
            map.setPaintProperty(layer.id, 'background-color', MAP_BACKGROUND_COLOR);
        } else {
            map.setLayoutProperty(layer.id, 'visibility', 'none');
        }
    });
}

function updateMapData(data) {
    if (!map) return;
    map.getSource('transit-projects').setData(data);
    fitMapToData(data);

    // Clear existing markers
    markers.forEach(m => m.remove());
    markers = [];

    // Add point markers
    data.features.forEach(feature => {
        if (feature.geometry.type === 'Point') {
            const el = document.createElement('div');
            el.className = 'pulsing-dot';
            el.style.borderColor = feature.properties.color || '#0072bc';

            const marker = new mapboxgl.Marker(el)
                .setLngLat(feature.geometry.coordinates)
                .addTo(map);

            el.addEventListener('click', () => {
                showProjectDetails(feature.properties);
            });

            markers.push(marker);
        }
    });
}

function fitMapToData(data) {
    if (!data || !data.features || !data.features.length) return;
    const bounds = new mapboxgl.LngLatBounds();
    let hasCoords = false;

    data.features.forEach(feature => {
        if (!feature.geometry) return;
        if (feature.geometry.type === 'Point') {
            bounds.extend(feature.geometry.coordinates);
            hasCoords = true;
        } else if (feature.geometry.type === 'LineString') {
            feature.geometry.coordinates.forEach(coord => bounds.extend(coord));
            hasCoords = true;
        } else if (feature.geometry.type === 'MultiLineString') {
            feature.geometry.coordinates.forEach(line =>
                line.forEach(coord => bounds.extend(coord))
            );
            hasCoords = true;
        }
    });

    if (hasCoords) {
        map.fitBounds(bounds, { padding: 70, maxZoom: 6 });
    }
}

function populateFilters(projects) {
    const agencies = Array.from(
        new Set(projects.map(p => p.properties.agency).filter(Boolean))
    ).sort();

    agencyFilter.innerHTML = '<option value="all">All Agencies</option>';
    agencies.forEach(agency => {
        const option = document.createElement('option');
        option.value = agency;
        option.textContent = agency;
        agencyFilter.appendChild(option);
    });

    const statusMap = new Map();
    projects.forEach(project => {
        const status = project.properties.status;
        if (status) {
            statusMap.set(status, project.properties.statusText || status);
        }
    });

    const sortedStatuses = Array.from(statusMap.keys()).sort((a, b) => {
        const rankA = STATUS_ORDER.includes(a) ? STATUS_ORDER.indexOf(a) : Number.MAX_SAFE_INTEGER;
        const rankB = STATUS_ORDER.includes(b) ? STATUS_ORDER.indexOf(b) : Number.MAX_SAFE_INTEGER;
        if (rankA !== rankB) return rankA - rankB;
        return a.localeCompare(b);
    });

    statusFilter.innerHTML = '<option value="all">All Statuses</option>';
    sortedStatuses.forEach(status => {
        const option = document.createElement('option');
        option.value = status;
        option.textContent = statusMap.get(status);
        statusFilter.appendChild(option);
    });
}

function renderProjectList(projects) {
    projectList.innerHTML = '';
    projects.forEach(project => {
        const item = document.createElement('div');
        item.className = 'project-item';
        item.innerHTML = `
            <div class="project-item-header">
                <h3>${project.properties.name}</h3>
                <span class="agency-tag">${project.properties.agency}</span>
            </div>
            <div class="project-item-status status-${project.properties.status}">${project.properties.statusText}</div>
        `;
        item.addEventListener('click', () => {
            showProjectDetails(project.properties);
            flyToProject(project);
        });
        projectList.appendChild(item);
    });
}

function showProjectDetails(props) {
    projectName.textContent = props.name;
    projectStatus.textContent = props.statusText;
    projectStatus.className = `status-badge status-${props.status}`;
    projectDescription.textContent = props.description;
    projectTimeline.innerHTML = `<strong>Timeline:</strong> ${props.timeline}`;

    // Handle milestones
    projectMilestones.innerHTML = '';
    if (props.milestones) {
        let milestones = props.milestones;
        if (typeof milestones === 'string') milestones = JSON.parse(milestones);

        const h4 = document.createElement('h4');
        h4.textContent = 'Key Milestones';
        projectMilestones.appendChild(h4);

        const ul = document.createElement('ul');
        milestones.forEach(m => {
            const li = document.createElement('li');
            li.textContent = m;
            ul.appendChild(li);
        });
        projectMilestones.appendChild(ul);
    }

    // Handle link
    if (props.source_url) {
        projectLink.href = props.source_url;
        projectLink.classList.remove('hidden');
    } else {
        projectLink.classList.add('hidden');
    }

    projectList.classList.add('hidden');
    detailsView.classList.remove('hidden');
    showSidebar();

    if (map) {
        map.setFilter('transit-lines-hover', ['all', ['in', '$type', 'LineString', 'MultiLineString'], ['==', 'name', props.name]]);
    }
}

function applyFilters() {
    const agency = agencyFilter.value;
    const status = statusFilter.value;

    const filtered = allProjects.filter(p => {
        const agencyMatch = agency === 'all' || p.properties.agency === agency;
        const statusMatch = status === 'all' || p.properties.status === status;
        return agencyMatch && statusMatch;
    });

    renderProjectList(filtered);

    // Update map visibility via filter
    if (map) {
        const lineFilters = ['all', ['in', '$type', 'LineString', 'MultiLineString']];
        if (agency !== 'all') lineFilters.push(['==', 'agency', agency]);
        if (status !== 'all') lineFilters.push(['==', 'status', status]);
        map.setFilter('transit-lines', lineFilters);

        // Filter markers
        markers.forEach((marker, index) => {
            const p = allProjects.find(feat =>
                feat.geometry.type === 'Point' &&
                feat.geometry.coordinates[0] === marker.getLngLat().lng &&
                feat.geometry.coordinates[1] === marker.getLngLat().lat
            );

            if (p) {
                const agencyMatch = agency === 'all' || p.properties.agency === agency;
                const statusMatch = status === 'all' || p.properties.status === status;
                marker.getElement().style.display = (agencyMatch && statusMatch) ? 'block' : 'none';
            }
        });
    }
}

function flyToProject(project) {
    if (!map) return;
    if (project.geometry.type === 'LineString') {
        const bounds = new mapboxgl.LngLatBounds();
        project.geometry.coordinates.forEach(coord => bounds.extend(coord));
        map.fitBounds(bounds, { padding: 80, maxZoom: 11 });
        return;
    }
    if (project.geometry.type === 'MultiLineString') {
        const bounds = new mapboxgl.LngLatBounds();
        project.geometry.coordinates.forEach(line =>
            line.forEach(coord => bounds.extend(coord))
        );
        map.fitBounds(bounds, { padding: 80, maxZoom: 11 });
        return;
    }

    const coords = project.geometry.coordinates;
    map.flyTo({ center: coords, zoom: 12, essential: true });
}

agencyFilter.addEventListener('change', applyFilters);
statusFilter.addEventListener('change', applyFilters);

backBtn.addEventListener('click', () => {
    projectName.textContent = DEFAULT_TITLE;
    projectList.classList.remove('hidden');
    detailsView.classList.add('hidden');
    if (map) {
        map.setFilter('transit-lines-hover', ['all', ['in', '$type', 'LineString', 'MultiLineString'], ['==', 'name', '']]);
    }
});

closeBtn.addEventListener('click', () => {
    hideSidebar();
    if (map) {
        map.setFilter('transit-lines-hover', ['all', ['in', '$type', 'LineString', 'MultiLineString'], ['==', 'name', '']]);
    }
});

openBtn.addEventListener('click', () => {
    showSidebar();
});
