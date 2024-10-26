let track_name = document.querySelector(".song_meta_data_child");
let track_album = document.querySelectorAll(".song_meta_data_child")[1];
let track_artist = document.querySelectorAll(".song_meta_data_child")[2];
let playpause_img = document.querySelector(".control_btn img[onclick='playpauseTrack()']");
let next_btn = document.querySelector(".next-track");
let prev_btn = document.querySelector(".prev-track");
let repeat_img = document.querySelector(".control_btn img[onclick='repeatmodes()']");
let isPlaying = false;
let track_list = [];
let track_index = 0;
let curr_track = new Audio();
let seekbar = document.querySelector('#seek_slider');
let expandbtn = document.querySelector('img[src="icons/expand_more.svg"]');
let expand_view = document.querySelector('.expanded_view')
let volumeControl = document.querySelector('#volume-control');
let rotated = false;
let genre_selector = document.querySelector('.genre_selector')
let repeat_count = 1
let clear_queuebtn = document.querySelector('img[src="icons/delete.svg"]');
let expanded_art = document.querySelector('.expanded_view .albumart img')
volumeControl.addEventListener('input', function () {
    curr_track.volume = this.value;
});

function playpauseTrack() {
    if (!isPlaying) playTrack();
    else pauseTrack();
}

function playTrack() {
    curr_track.play();
    isPlaying = true;
    playpause_img.src = "icons/pause.svg";
    fetchAndDisplaySongsFromTrackList()
}

function pauseTrack() {
    curr_track.pause();
    isPlaying = false;
    playpause_img.src = "icons/play_arrow.svg";
}

function nextTrack() {
    if (track_index < track_list.length - 1) {
        track_index += 1;
        loadTrack(track_index);
        playTrack();
    }
    else if (track_index == track_list.length - 1) {
        curr_track.removeEventListener('ended', playTrack);
        pauseTrack();
        playpause_img.src = "icons/play_arrow.svg";
    }
}

function repeat() {
    if (track_index < track_list.length - 1)
        track_index += 1;
    else track_index = 0;
    loadTrack(track_index);
    playTrack();
}

function repeatsong() {
    curr_track.addEventListener('ended', function () {
        playTrack()
    })
}

function repeatmodes() {
    // Attach the event listener to the repeat button
    repeat_img.addEventListener('click', function () {
        if (repeat_count == 1) {
            // Repeat all
            repeat_img.src = "icons/repeat.svg";
            curr_track.removeEventListener('ended', repeatsong);
            curr_track.addEventListener('ended', nextTrack);
        } else if (repeat_count == 2) {
            // Repeat one
            repeat_img.src = "icons/repeat_one_on.svg";
            curr_track.removeEventListener('ended', nextTrack);
            curr_track.addEventListener('ended', repeatsong);
        } else {
            // No repeat
            repeat_img.src = "icons/repeat_off.svg";
            curr_track.removeEventListener('ended', repeatsong);
            curr_track.removeEventListener('ended', nextTrack);
        }

        // Cycle through the repeat modes
        repeat_count = repeat_count % 3 + 1;
        console.log(repeat_count);
    });
}

function prevTrack() {
    if (track_index > 0) {
        track_index -= 1;
        loadTrack(track_index);
        playTrack();
    }
    else if (track_index == 0) {
        loadTrack(0)
        playTrack()
    };
}

function clearQueue() {
    // Remove all the songs after the current track from track_list
    if (track_index < track_list.length - 1) {
        track_list.splice(track_index + 1);
    }
}

clear_queuebtn.addEventListener('click', function () {
    clearQueue()
    fetchAndDisplaySongsFromTrackList()
})

function updateProgress() {
    if (curr_track.duration) { // Check if duration is not NaN
        var progress = curr_track.currentTime / curr_track.duration;
        seekbar.value = progress * 100;
    }

    // Use requestAnimationFrame to keep calling updateProgress
    // as smoothly as possible before the next repaint
    if (!curr_track.paused) {
        requestAnimationFrame(updateProgress);
    }
}



// Call updateProgress once to start it
updateProgress();

seekbar.addEventListener('input', function () {
    var progress = seekbar.value / 100;
    curr_track.currentTime = progress * curr_track.duration;
});


// Update progress bar when the audio is playing
curr_track.addEventListener('play', updateProgress);

// Reset progress bar when the audio is paused
curr_track.addEventListener('pause', function () {
    seekbar.value = 0;
});

let current_time = document.querySelector(".current_time");
let total_duration = document.querySelector(".total_duration");

curr_track.addEventListener('timeupdate', function () {
    // Update current time
    let curr_minutes = Math.floor(curr_track.currentTime / 60);
    let curr_seconds = Math.floor(curr_track.currentTime - curr_minutes * 60);
    current_time.textContent = formatTime(curr_minutes, curr_seconds);

    // Update total duration
    let total_minutes = Math.floor(curr_track.duration / 60);
    let total_seconds = Math.floor(curr_track.duration - total_minutes * 60);
    total_duration.textContent = formatTime(total_minutes, total_seconds);
});

function formatTime(minutes, seconds) {
    if (seconds < 10) {
        seconds = "0" + seconds;
    }
    return minutes + ":" + seconds;
}

curr_track.addEventListener('ended', function () {
    fetchAndDisplaySongsFromTrackList()
    nextTrack()
});

let mini_player = document.querySelector('.mini_player')
mini_player.style.display = 'none'

// Fetch JSON data based on selected genre
function fetchAndDisplaySongs() {
    var genre = document.querySelector('input[name="genre"]:checked').value;
    fetch(`json/${genre}.json`)
        .then(response => response.json())
        .then(data => {
            var songsList = document.querySelector('.songs_list');
            songsList.innerHTML = '';
            data.forEach(song => {
                var songData = document.createElement('div');
                songData.className = 'song_data';
                songData.addEventListener('click', function () {
                    track_list = data; // Assign fetched data to track_list
                    loadSongIntoMiniPlayer(song);
                    mini_player.style.display = 'flex'
                    mini_player.style.transition = '0.2s ease-in-out'
                });
                songData.addEventListener('contextmenu', function (event) {
                    event.preventDefault();  // Prevent the default right-click menu from showing
                    track_list.push(song);  // Add the song to the track list
                    fetchAndDisplaySongsFromTrackList()
                    if (mini_player.style.display === 'none') {
                        mini_player.style.display = 'flex'
                        loadSongIntoMiniPlayer(song)
                    }
                    console.log('Song added to track list:', song);
                });

                // Create album art div
                var albumArt = document.createElement('div');
                albumArt.className = 'albumart';
                var img = document.createElement('img');
                img.src = song.albumArt;
                img.alt = 'albumart';
                albumArt.appendChild(img);

                // Create song meta data div
                var songMetaData = document.createElement('div');
                songMetaData.className = 'song_meta_data';

                // Create p elements for song name, album name, and artist name
                var pSongName = document.createElement('p');
                pSongName.className = 'song_meta_data_child';
                pSongName.textContent = song.title;
                var pAlbumName = document.createElement('p');
                pAlbumName.className = 'song_meta_data_child';
                pAlbumName.textContent = song.album;
                var pArtistName = document.createElement('p');
                pArtistName.className = 'song_meta_data_child';
                pArtistName.textContent = song.artist;

                // Append p elements to song meta data div
                songMetaData.appendChild(pSongName);
                songMetaData.appendChild(pAlbumName);
                songMetaData.appendChild(pArtistName);

                // Append album art and song meta data divs to song data div
                songData.appendChild(albumArt);
                songData.appendChild(songMetaData);

                // Append song data div to songs list
                songsList.appendChild(songData);
            });
        })
        .catch(error => console.error('Error:', error));
}



// Attach event listener to radio buttons
document.querySelectorAll('input[name="genre"]').forEach(radio => {
    radio.addEventListener('change', fetchAndDisplaySongs);
});

function loadSongIntoMiniPlayer(song) {
    track_index = track_list.findIndex(track => track.title === song.title && track.album === song.album && track.artist === song.artist); // Find the index of the clicked song in track_list
    loadTrack(track_index);
    playTrack();
}

function loadTrack(index) {
    curr_track.src = track_list[index].audioFile;
    track_name.textContent = track_list[index].title;
    track_artist.textContent = track_list[index].artist;
    track_album.textContent = track_list[index].album;

    // Get the album art image element in the mini player and set its src attribute
    let albumArtImage = document.querySelector('.mini_player .albumart img');
    albumArtImage.src = track_list[index].albumArt;
    expanded_art.src = track_list[index].albumArt
    if (index < track_list.length - 1) {
        curr_track.addEventListener('ended', playTrack);
    }
}


var topBar = document.querySelector('.top_bar');
var sticky = topBar.offsetTop;

function stickyFunction() {
    if (window.pageYOffset >= sticky) {
        topBar.classList.add("sticky")
    } else {
        topBar.classList.remove("sticky");
    }
}

expandbtn.style.transition = 'transform 0.5s';
expand_view.style.display = 'none'
expandbtn.addEventListener('click', function () {
    if (expand_view.style.display === 'none') {
        expand_view.style.display = 'grid';
        genre_selector.style.display = 'none'
        songsList.style.display = 'none';
        canvasDiv.style.display = 'none';
        expand_view.style.transform = 'translateY(0)'
    }
    else {
        canvasDiv.style.display = 'none';
        expand_view.style.display = 'none';
        songsList.style.display = 'grid';
        genre_selector.style.display = 'flex'
        expand_view.style.transform = 'translateY(100%)'
    }

    // Add rotation
    if (!rotated) {
        expandbtn.style.transform = 'rotate(180deg)';
        rotated = true;
    } else {
        expandbtn.style.transform = '';
        rotated = false;
    }
});


function fetchAndDisplaySongsFromTrackList() {
    var queueList = document.querySelector('.queue_list');
    queueList.innerHTML = '';
    track_list.forEach(song => {
        var songData = document.createElement('div');
        songData.className = 'queue_song_data';
        songData.addEventListener('click', function () {
            mini_player.style.display = 'flex'
            loadSongIntoMiniPlayer(song);
            mini_player.style.transition = '0.2s ease-in-out'
        });

        // Create album art div
        var albumArt = document.createElement('div');
        albumArt.className = 'queue_albumart';
        var img = document.createElement('img');
        img.src = song.albumArt;
        img.alt = 'albumart';
        albumArt.appendChild(img);

        // Create song meta data div
        var songMetaData = document.createElement('div');
        songMetaData.className = 'queue_song_meta_data';

        // Create p elements for song name, album name, and artist name
        var pSongName = document.createElement('p');
        pSongName.className = 'queue_song_meta_data_child';
        pSongName.textContent = song.title;
        var pAlbumName = document.createElement('p');
        pAlbumName.className = 'queue_song_meta_data_child';
        pAlbumName.textContent = song.album;
        var pArtistName = document.createElement('p');
        pArtistName.className = 'queue_song_meta_data_child';
        pArtistName.textContent = song.artist;

        // Append p elements to song meta data div
        songMetaData.appendChild(pSongName);
        songMetaData.appendChild(pAlbumName);
        songMetaData.appendChild(pArtistName);

        // Append album art and song meta data divs to song data div
        songData.appendChild(albumArt);
        songData.appendChild(songMetaData);

        // Append song data div to queue list
        queueList.appendChild(songData);
        // console.log(pSongName)
    });
}

let canvasElement = document.querySelector("#waves");
let wave = new Wave(curr_track, canvasElement);
function animations() {
    wave.addAnimation(new wave.animations.Circles({
        lineColor: { gradient: ["#12c2e9", "#c471ed"], rotate: 0 },
        lineWidth: 4,
        diameter: 20,
        count: 10,
        frequencyBand: "base"
    }));
    wave.addAnimation(new wave.animations.Cubes({
        count: 100,
        cubeHeight: 10,
        fillColor: { gradient: ["#12c2e9", "#c471ed"], rotate: 0 },
        lineColor: "rgba(0,0,0,0)",
        frequencyBand: "mids"
    }));
}

var canvasDiv = document.querySelector('.__canvas');
var songsList = document.querySelector('.songs_list');
var animationImg = document.querySelector('img[src="icons/animation.svg"]');

// Initially hide the canvas
canvasDiv.style.display = 'none';

// Add the click event listener to the image
animationImg.addEventListener('click', function () {
    // If the canvas is currently hidden, show it and hide the songs list
    if (canvasDiv.style.display === 'none') {
        canvasDiv.style.display = 'block';
        songsList.style.display = 'none';
        expand_view.style.display = 'none'
        genre_selector.style.display = 'none'
        animations()
    }
    // If the canvas is currently shown, hide it and show the songs list
    else {
        canvasDiv.style.display = 'none';
        expand_view.style.display = 'none'
        songsList.style.display = 'grid';
        genre_selector.style.display = 'flex'
    }
});

let song_list = [];

window.onload = function () {
    fetch('json/songs.json')
        .then(response => response.json())
        .then(data => {
            song_list = data;  // Store the songs data for later use
        })
        .catch(error => console.error('Error:', error));
};

document.getElementById('search_bar_inp').addEventListener('input', function (e) {
    var input = e.target.value;  // Get the current value of the input field

    // Use song_list instead of fetching the data again
    var results = song_list.filter(song => song.title && typeof song.title === 'string' && song.title.toLowerCase().includes(input.toLowerCase()));  // Filter the songs based on the input

    // Clear the results div
    var resultsDiv = document.getElementById('results');
    resultsDiv.innerHTML = '';

    // If there are results, show the results div
    if (results.length > 0) {
        resultsDiv.style.display = 'block';
    } else {
        resultsDiv.style.display = 'none';
    }

    // Display the results
    results.forEach(song => {
        var div = document.createElement('div');
        div.textContent = song.title + ' by ' + song.artist;
        div.addEventListener('click', function () {
            document.getElementById('search_bar_inp').value = song.title;
            document.getElementById('results').innerHTML = '';
            document.getElementById('results').style.display = 'none';
            mini_player.style.display = 'flex'
            track_list = [song]  // Clear the song_list
            loadSongIntoMiniPlayer(song);  // Load the selected song into the mini player
        });
        div.addEventListener('contextmenu', function (event) {
            event.preventDefault();  // Prevent the default right-click menu from showing
            track_list.push(song);  // Add the song to the track list
            fetchAndDisplaySongsFromTrackList()
            if (mini_player.style.display === 'none') {
                mini_player.style.display = 'flex'
                loadSongIntoMiniPlayer(song)
            }
            console.log('Song added to track list:', song);
        });
        document.getElementById('results').appendChild(div);
    });
});

// Add an event listener to the document to hide the results div when clicking outside of it
document.addEventListener('click', function (event) {
    var isClickInside = document.getElementById('search_bar_inp').contains(event.target) || document.getElementById('results').contains(event.target);
    if (!isClickInside) {
        document.getElementById('results').style.display = 'none';
    }
});

let search_bar_inp = document.querySelector('#search_bar_inp');
let flag = 1;

window.onkeyup = function (event) {
    if (event.key == '/') {
        search_bar_inp.focus();
    }
    else if (event.key == 'Escape') {
        search_bar_inp.blur();
    }
    else if (event.shiftKey && event.key == 'N') {
        nextTrack();
    }
    else if (event.shiftKey && event.key == 'P') {
        prevTrack();
    }
    else if (event.key == ' ' && document.activeElement !== search_bar_inp) {
        if (flag == 1) {
            pauseTrack();
            flag = 0;
        }
        else {
            playTrack();
            flag = 1;
        }
        console.log(flag);
    }
}


window.addEventListener('keydown', function (event) {
    if (event.code === 'Space') {
        event.preventDefault();
    }
});


function random_bg_color() {
    // Get a random number between 64 to 256
    // (for getting lighter colors)
    let red = Math.floor(Math.random() * 256) + 64;
    let green = Math.floor(Math.random() * 256) + 64;
    let blue = Math.floor(Math.random() * 256) + 64;

    // Construct a color with the given values
    let bgColor = "rgb(" + red + ", " + green + ", " + blue + ")";

    // Set the background to the new color
    document.body.style.background = bgColor;
}