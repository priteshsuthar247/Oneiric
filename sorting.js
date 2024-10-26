const fs = require('fs');
const path = require('path');

// Load the songs from the JSON file
fs.readFile('json/songs.json', 'utf8', (err, data) => {
    if (err) {
        console.error(err);
        return;
    }

    let songs = JSON.parse(data);

    // Group the songs by genre
    let songsByGenre = {};
    songs.forEach(song => {
        if (!songsByGenre[song.genre]) {
            songsByGenre[song.genre] = [];
        }
        songsByGenre[song.genre].push(song);
    });

    // Write each group to a separate JSON file in the 'json' directory
    for (let genre in songsByGenre) {
        let filename = `${genre.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.json`;
        let filePath = path.join('json', filename); // Save directly in the 'json' folder
        fs.writeFile(filePath, JSON.stringify(songsByGenre[genre], null, 2), 'utf8', err => {
            if (err) {
                console.error(err);
                return;
            }
            console.log(`Songs of genre '${genre}' have been written to ${filePath}`);
        });
    }
});
