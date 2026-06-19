function initVideoPlayer(url, videoId, buttonId) {
    const video = document.getElementById(videoId);
    const button = document.getElementById(buttonId);

    if (!video || !button || !url) {
        return;
    }

    let ready = false;

    function attachStream() {
        if (ready) {
            return;
        }

        if (video.canPlayType("application/vnd.apple.mpegurl")) {
            video.src = url;
            ready = true;
            return;
        }

        if (window.Hls && window.Hls.isSupported()) {
            const hls = new window.Hls({
                enableWorker: true,
                lowLatencyMode: true
            });
            hls.loadSource(url);
            hls.attachMedia(video);
            ready = true;
        } else {
            video.src = url;
            ready = true;
        }
    }

    function playVideo() {
        attachStream();
        button.classList.add("is-hidden");
        const promise = video.play();
        if (promise && typeof promise.catch === "function") {
            promise.catch(function () {
                button.classList.remove("is-hidden");
            });
        }
    }

    button.addEventListener("click", playVideo);
    video.addEventListener("click", function () {
        if (video.paused) {
            playVideo();
        }
    });
    video.addEventListener("play", function () {
        button.classList.add("is-hidden");
    });
    video.addEventListener("pause", function () {
        if (!video.ended) {
            button.classList.remove("is-hidden");
        }
    });
}
