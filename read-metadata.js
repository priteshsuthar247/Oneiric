const mm = require('music-metadata');
const fs = require('fs');
const path = require('path');

// Recursive function to get all MP3 files in a directory and its subdirectories
function getMp3Files(dir, files_) {
    files_ = files_ || [];
    let files = fs.readdirSync(dir);
    for (let i in files) {
        let name = path.join(dir, files[i]); // Use path.join for cross-platform compatibility
        if (fs.statSync(name).isDirectory()) {
            getMp3Files(name, files_);
        } else if (name.endsWith('.mp3')) {
            files_.push(name);
        }
    }
    return files_;
}

// Get a list of all MP3 files in the directory and its subdirectories
let mp3Files = getMp3Files('music');

// Create an array to store the song data
let songs = [];

// Create an array to store the Promises
let promises = [];

// Read the metadata from each file
mp3Files.forEach(file => {
    let promise = mm.parseFile(file)
        .then(metadata => {
            // Create an object to store the metadata and file path
            let songData = {
                title: metadata.common.title,
                artist: metadata.common.artist,
                album: metadata.common.album,
                genre: metadata.common.genre,
                filePath: file,
                audioFile: `http://127.0.0.1:5500/${file}`
            };

            // Check if there is album art
            if (metadata.common.picture && metadata.common.picture[0]) {
                let picture = metadata.common.picture[0];
                let imageFormat = picture.format.split('/')[1];
                let imageName = `${path.basename(file, '.mp3')}.${imageFormat}`;
                let imagePath = path.join('albumArt', imageName);

                fs.writeFile(imagePath, picture.data, (err) => {
                    if (err) {
                        console.error(err);
                        return;
                    }
                    console.log(`Album art has been written to ${imagePath}`);
                });

                songData.albumArt = `http://127.0.0.1:5500/${imagePath}`;
            }

            songs.push(songData);
            console.log(songData);
        })
        .catch(err => {
            console.error(err);
        });

    promises.push(promise);
});

// Wait for all the Promises to resolve
Promise.all(promises).then(() => {
    sorti(songs);

    // Ensure the 'json' directory exists
    const jsonDir = 'json';
    if (!fs.existsSync(jsonDir)){
        fs.mkdirSync(jsonDir);
    }

    // Write the song data to a JSON file in the 'json' directory
    fs.writeFile(path.join(jsonDir, 'songs.json'), JSON.stringify(songs), (err) => {
        if (err) {
            console.error(err);
            return;
        }
        console.log('Song data has been written to json/songs.json');
    });
});

function sorti(songs) {
    for (let i = 0; i < songs.length; i++) {
        for (let j = i + 1; j < songs.length; j++) {
            if (songs[i].title > songs[j].title) {
                let temp = songs[i];
                songs[i] = songs[j];
                songs[j] = temp;
            }
        }
    }
    return songs;
}
