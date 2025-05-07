// YouTube Player
(function() {
  let player;
  let currentVideoIndex = 0;
  let isPlaying = false;

  const playlist = [
    { id: 'znQEcXKvJDE', title: 'why mona - Wannabe (Lyrics)' },
    { id: 'kXYiU_JCYtU', title: 'Linkin Park - Numb' },
    { id: '3YxaaGgTQYM', title: 'Evanescence - Bring Me To Life' }
  ];

  let currentTrack = 0;
  let ytPlayer, progressInterval;

  window.onYouTubeIframeAPIReady = function() {
    player = new YT.Player('yt-player', {
      height: '0',
      width: '0',
      videoId: playlist[currentTrack].id,
      playerVars: {
        'autoplay': 0,
        'controls': 0,
        'rel': 0
      },
      events: {
        'onReady': onPlayerReady,
        'onStateChange': onPlayerStateChange
      }
    });
  };

  function onPlayerReady(event) {
    updateMusicBoxInfo();
    setupEventListeners();
  }

  function onPlayerStateChange(event) {
    if (event.data === YT.PlayerState.PLAYING) {
      isPlaying = true;
      document.getElementById('youtube-player').classList.add('playing');
      startProgressUpdate();
    } else if (event.data === YT.PlayerState.PAUSED) {
      isPlaying = false;
      document.getElementById('youtube-player').classList.remove('playing');
      stopProgressUpdate();
    } else if (event.data === YT.PlayerState.ENDED) {
      playNext();
    }
  }

  function setupEventListeners() {
    document.getElementById('play-pause-btn').addEventListener('click', togglePlay);
    document.getElementById('next-btn').addEventListener('click', playNext);
    document.getElementById('prev-btn').addEventListener('click', playPrevious);
    document.getElementById('volume-slider').addEventListener('input', adjustVolume);
  }

  function togglePlay() {
    if (isPlaying) {
      player.pauseVideo();
    } else {
      player.playVideo();
    }
  }

  function playNext() {
    currentTrack = (currentTrack + 1) % playlist.length;
    player.loadVideoById(playlist[currentTrack].id);
    updateMusicBoxInfo();
  }

  function playPrevious() {
    currentTrack = (currentTrack - 1 + playlist.length) % playlist.length;
    player.loadVideoById(playlist[currentTrack].id);
    updateMusicBoxInfo();
  }

  function adjustVolume(event) {
    const volume = event.target.value;
    player.setVolume(volume);
  }

  function updateMusicBoxInfo() {
    const currentSong = document.getElementById('current-song');
    currentSong.textContent = playlist[currentTrack].title;
  }

  function startProgressUpdate() {
    stopProgressUpdate();
    progressInterval = setInterval(updateProgress, 1000);
  }

  function stopProgressUpdate() {
    if (progressInterval) {
      clearInterval(progressInterval);
    }
  }

  function updateProgress() {
    const currentTime = player.getCurrentTime();
    const duration = player.getDuration();
    const timeDisplay = document.getElementById('time-display');
    
    const formatTime = (time) => {
      const minutes = Math.floor(time / 60);
      const seconds = Math.floor(time % 60);
      return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    };
    
    timeDisplay.textContent = `${formatTime(currentTime)} / ${formatTime(duration)}`;
  }

  // Event Listeners
  document.addEventListener('DOMContentLoaded', function() {
    setupEventListeners();
  });
})(); 