(function () {
  window.setupMoviePlayer = function (streamUrl) {
    var video = document.getElementById('movie-video');
    var button = document.getElementById('player-start');
    var overlay = document.getElementById('player-overlay');
    var state = document.getElementById('player-state');
    var loaded = false;
    var hls = null;

    function setState(text) {
      if (state) state.textContent = text;
    }

    function attachStream() {
      if (!video || loaded) return;
      loaded = true;
      setState('正在加载');
      if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({ enableWorker: true, lowLatencyMode: true });
        hls.loadSource(streamUrl);
        hls.attachMedia(video);
        hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
          setState('点击继续');
        });
        hls.on(window.Hls.Events.ERROR, function (event, data) {
          if (data && data.fatal) {
            setState('播放暂不可用，请稍后再试');
            if (hls) hls.destroy();
          }
        });
      } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = streamUrl;
        video.addEventListener('loadedmetadata', function () {
          setState('点击继续');
        }, { once: true });
      } else {
        setState('播放暂不可用，请稍后再试');
      }
    }

    function startPlay() {
      attachStream();
      if (!video) return;
      var playTask = video.play();
      if (playTask && playTask.then) {
        playTask.then(function () {
          if (overlay) overlay.classList.add('hidden');
          setState('正在播放');
        }).catch(function () {
          setState('点击继续');
        });
      }
    }

    if (button) button.addEventListener('click', startPlay);
    if (overlay) overlay.addEventListener('click', startPlay);
    if (video) {
      video.addEventListener('play', function () {
        if (overlay) overlay.classList.add('hidden');
        setState('正在播放');
      });
      video.addEventListener('pause', function () {
        setState('已暂停');
      });
      video.addEventListener('error', function () {
        setState('播放暂不可用，请稍后再试');
      });
    }
  };
})();
