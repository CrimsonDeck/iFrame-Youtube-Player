let playlists = {};
    let currentPlaylist = "";
    let currentVideoIndex = 0;
    let player;

    // === Playlist Functions ===
    function createPlaylist() {
      const name = document.getElementById("newPlaylistName").value.trim();
      if (!name) return alert("Enter a playlist name.");
      if (playlists[name]) return alert("Playlist already exists.");
      playlists[name] = [];
      currentPlaylist = name;
      savePlaylists();
      updatePlaylistSelector();
      loadPlaylistUI();
    }

    function deleteCurrentPlaylist() {
      if (!currentPlaylist) return;
      if (!confirm(`Delete playlist "${currentPlaylist}"?`)) return;
      delete playlists[currentPlaylist];
      currentPlaylist = "";
      savePlaylists();
      updatePlaylistSelector();
      document.getElementById("playlist").innerHTML = "";
      if (player) player.stopVideo();
    }

    function selectPlaylist() {
      currentPlaylist = document.getElementById("playlistSelector").value;
      currentVideoIndex = 0;
      loadPlaylistUI();
      if (playlists[currentPlaylist]?.length) {
        loadVideo(playlists[currentPlaylist][0]);
      } else if (player) {
        player.stopVideo();
      }
    }

    // === Video Functions ===
    function getYouTubeVideoID(url) {
      const regex = /(?:youtube\.com\/watch\?v=|youtu\.be\/)([^\s&]+)/;
      const match = url.match(regex);
      return match ? match[1] : null;
    }

    function addToPlaylist() {
      const url = document.getElementById('videoUrl').value;
      const videoId = getYouTubeVideoID(url);
      if (!currentPlaylist) return alert("Select or create a playlist first.");
      if (videoId) {
        playlists[currentPlaylist].push(videoId);
        savePlaylists();
        loadPlaylistUI();
        if (playlists[currentPlaylist].length === 1) {
          loadVideo(videoId);
        }
      } else {
        alert("Invalid YouTube URL");
      }
      document.getElementById('videoUrl').value = '';
    }

    function deleteVideo(index) {
      if (!currentPlaylist) return;
      playlists[currentPlaylist].splice(index, 1);
      if (index <= currentVideoIndex && currentVideoIndex > 0) {
        currentVideoIndex--;
      }
      savePlaylists();
      loadPlaylistUI();
      if (playlists[currentPlaylist].length === 0 && player) {
        player.stopVideo();
      } else if (currentVideoIndex < playlists[currentPlaylist].length) {
        loadVideo(playlists[currentPlaylist][currentVideoIndex]);
      }
    }

    function loadPlaylistUI() {
      const list = document.getElementById("playlist");
      list.innerHTML = "";
      if (!currentPlaylist) return;
      playlists[currentPlaylist].forEach((vid, index) => {
        const li = document.createElement("li");
        li.innerHTML = `https://youtu.be/${vid}
          <span class="delete-btn" onclick="deleteVideo(${index})">[Delete]</span>`;
        list.appendChild(li);
      });
    }

    // === Player Functions ===
    function loadVideo(videoId) {
      if (player) {
        player.loadVideoById(videoId);
      } else {
        player = new YT.Player('player', {
          height: '360',
          width: '640',
          videoId: videoId,
          events: {
            'onStateChange': onPlayerStateChange
          }
        });
      }
    }

    function onPlayerStateChange(event) {
      if (event.data === YT.PlayerState.ENDED && playlists[currentPlaylist]) {
        currentVideoIndex++;
        if (currentVideoIndex >= playlists[currentPlaylist].length) {
          currentVideoIndex = 0; // loop to start
        }
        loadVideo(playlists[currentPlaylist][currentVideoIndex]);
      }
    }

    // === Local Storage ===
    function savePlaylists() {
      localStorage.setItem("ytPlaylists", JSON.stringify(playlists));
      localStorage.setItem("ytCurrentPlaylist", currentPlaylist);
    }

    function loadPlaylists() {
      const stored = localStorage.getItem("ytPlaylists");
      if (stored) playlists = JSON.parse(stored);
      currentPlaylist = localStorage.getItem("ytCurrentPlaylist") || "";
    }

    function updatePlaylistSelector() {
      const selector = document.getElementById("playlistSelector");
      selector.innerHTML = "<option value=''>-- Select Playlist --</option>";
      for (const name in playlists) {
        const opt = document.createElement("option");
        opt.value = name;
        opt.textContent = name;
        if (name === currentPlaylist) opt.selected = true;
        selector.appendChild(opt);
      }
    }

    // === YouTube API Setup ===
    var tag = document.createElement('script');
    tag.src = "https://www.youtube.com/iframe_api";
    var firstScriptTag = document.getElementsByTagName('script')[0];
    firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

    window.onload = () => {
      loadPlaylists();
      updatePlaylistSelector();
      loadPlaylistUI();
      if (currentPlaylist && playlists[currentPlaylist]?.length) {
        loadVideo(playlists[currentPlaylist][0]);
      }
    };
