(function () {
    var MoviePlayer = {
        init: function (playerId, streamUrl) {
            var box = document.getElementById(playerId);
            if (!box) {
                return;
            }
            var video = box.querySelector("video");
            var layer = box.querySelector(".player-poster-layer");
            var ready = false;
            var hls = null;

            function attach() {
                if (!video || ready) {
                    return;
                }
                ready = true;
                if (video.canPlayType("application/vnd.apple.mpegurl")) {
                    video.src = streamUrl;
                } else if (window.Hls && window.Hls.isSupported()) {
                    hls = new window.Hls({
                        enableWorker: true,
                        lowLatencyMode: false,
                        backBufferLength: 90
                    });
                    hls.loadSource(streamUrl);
                    hls.attachMedia(video);
                } else {
                    video.src = streamUrl;
                }
            }

            function hideLayer() {
                if (layer) {
                    layer.classList.add("is-hidden");
                }
            }

            function start() {
                attach();
                hideLayer();
                video.controls = true;
                var attempt = video.play();
                if (attempt && typeof attempt.catch === "function") {
                    attempt.catch(function () {
                        video.controls = true;
                    });
                }
            }

            if (!video) {
                return;
            }
            if (layer) {
                layer.addEventListener("click", start);
            }
            video.addEventListener("click", function () {
                if (video.paused) {
                    start();
                } else {
                    video.pause();
                }
            });
            video.addEventListener("play", hideLayer);
            window.addEventListener("beforeunload", function () {
                if (hls && typeof hls.destroy === "function") {
                    hls.destroy();
                }
            });
        }
    };

    window.MoviePlayer = MoviePlayer;
})();
