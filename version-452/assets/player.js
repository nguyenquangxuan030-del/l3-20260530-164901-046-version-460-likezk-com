(function () {
  function initMoviePlayer(source) {
    var video = document.getElementById('movie-video');
    var cover = document.getElementById('play-toggle');
    if (!video || !source) {
      return;
    }
    var attached = false;
    var hlsInstance = null;

    function attachSource() {
      if (attached) {
        return;
      }
      attached = true;
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = source;
        return;
      }
      if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true,
          backBufferLength: 90
        });
        hlsInstance.loadSource(source);
        hlsInstance.attachMedia(video);
        return;
      }
      video.src = source;
    }

    function hideCover() {
      if (cover) {
        cover.classList.add('is-hidden');
      }
    }

    function showCover() {
      if (cover && video.currentTime === 0) {
        cover.classList.remove('is-hidden');
      }
    }

    function startPlayback() {
      attachSource();
      video.controls = true;
      hideCover();
      var playPromise = video.play();
      if (playPromise && typeof playPromise.catch === 'function') {
        playPromise.catch(function () {
          if (cover) {
            cover.classList.remove('is-hidden');
          }
        });
      }
    }

    if (cover) {
      cover.addEventListener('click', startPlayback);
    }
    video.addEventListener('click', function () {
      if (video.paused) {
        startPlayback();
      }
    });
    video.addEventListener('play', hideCover);
    video.addEventListener('ended', showCover);
    window.addEventListener('pagehide', function () {
      if (hlsInstance) {
        hlsInstance.destroy();
      }
    });
  }

  window.initMoviePlayer = initMoviePlayer;
})();
