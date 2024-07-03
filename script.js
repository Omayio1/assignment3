
document.addEventListener('DOMContentLoaded', () => {
    const map = L.map('map').setView([0, 37], 6);
    const parks = [];
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 18,
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);


    fetch('data.json')
        .then(response => response.json())
        .then(data => {
            data.features.forEach(feature => {
                const park = feature;
                parks.push(park);


                const marker = L.marker([park.geometry.coordinates[1], park.geometry.coordinates[0]])
                    .addTo(map)
                    .bindPopup(`
                        <strong>${park.properties.name}</strong><br>
                        ${park.properties.description}<br>
                       
                    `);


                marker.on('click', () => showParkDetails(park));
            });


            const fuse = new Fuse(parks, {
                keys: ['properties.name'],
                includeScore: true
            });

            const searchInput = document.getElementById('search');
            const suggestions = document.getElementById('suggestions');

            searchInput.addEventListener('input', () => {
                const query = searchInput.value;
                const results = fuse.search(query).map(result => result.item);
                suggestions.innerHTML = '';
                results.forEach(park => {
                    const li = document.createElement('li');
                    li.textContent = park.properties.name;
                    li.addEventListener('click', () => {
                        showParkDetails(park);
                        searchInput.value = park.properties.name;
                        suggestions.innerHTML = '';
                    });
                    suggestions.appendChild(li);
                });
            });

            if (parks.length > 0) {
                showParkDetails(parks[0]);
            }
        });

    window.showParkDetails = function (park) {
        const parkDetails = document.getElementById('park-details');
        parkDetails.innerHTML = `
            <h2>${park.properties.name}</h2>
            <p><strong>Description:</strong> ${park.properties.description}</p>
            <p><strong>Attractions:</strong> ${park.properties.attractions.join(', ')}</p>
            <p><strong>Hours:</strong> ${park.properties.hours || 'N/A'}</p>
            <p><strong>Entry Fee:</strong> ${park.properties.entryFee || 'N/A'}</p>
          
        `;


        map.setView([park.geometry.coordinates[1], park.geometry.coordinates[0]], 10);
    }
});
