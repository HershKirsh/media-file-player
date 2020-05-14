if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('sw.js');
};

const htmlElements = {
    container: document.querySelector('#container'),
    open: document.querySelector('#open'),
    player: document.querySelector('#player'),
    playerTitle: document.querySelector('#player>h3'),
    audio: document.querySelector('audio'),
    video: document.querySelector('video'),
    speedRange: document.querySelector('#speed-range'),
    output: document.querySelector('output')
};

const mediaPlayer = {
    currentTrack: null,
    mediaElement: '',
    skipBack: function () {
        this.mediaElement.currentTime -= 30.0;
    },
    skipForward: function () {
        this.mediaElement.currentTime += 30.0;
    },
    prev: function () {
        if (this.currentTrack > 0) {
            htmlElements.list[this.currentTrack].classList.remove('current');
            play(this.currentTrack - 1)
        }
    },
    next: function () {
        if (this.currentTrack < mediaFileList.length - 1) {
            htmlElements.list[this.currentTrack].classList.remove('current');
            play(this.currentTrack + 1)
        }
    },
    adjustSpeed: function (range) {
        this.mediaElement.playbackRate = range.value;
        htmlElements.output.innerHTML = range.value;
    }
};

let mediaFileList;
function selectMedia(files) {
    if (htmlElements.list) {
        htmlElements.list.forEach(element => {
            element.remove();
        });;
    }
    mediaFileList = files;
    for (let i = 0; i < files.length; i++) {
        appendElement(files[i].name, i);
    }
    htmlElements.open.checked = false
    htmlElements.container.classList.add('list-added');
    htmlElements.list = document.querySelectorAll('.track');
};

const notSupported = () => {
    htmlElements.open.checked = false;
    alert('This flie is not supported')
};
function play(i, retry) {
    console.log(mediaFileList[i].type);
    if (mediaFileList[i].type.match(/audio.*/)) {
        mediaPlayer.mediaElement = htmlElements.audio;
        htmlElements.video.style.display = 'none';
        htmlElements.player.classList.remove('video-playing');
        htmlElements.open.checked = true;
    } else {
        htmlElements.audio.style.display = 'none';
        htmlElements.player.classList.add('video-playing');
        mediaPlayer.mediaElement = htmlElements.video;
        htmlElements.open.checked = true;
        mediaPlayer.mediaElement.addEventListener('error', () => {
            htmlElements.video.style.display = 'none';
            htmlElements.open.checked = false;
            play(mediaPlayer.currentTrack, true)
        });
    }
    if (retry) {
        htmlElements.player.classList.remove('video-playing');
        mediaPlayer.mediaElement.style.display = 'none';
        htmlElements.open.checked = false;
        mediaPlayer.mediaElement.removeEventListener('error', notSupported)
        mediaPlayer.mediaElement = htmlElements.audio;
        mediaPlayer.mediaElement.addEventListener('error', notSupported);
    }
    mediaPlayer.mediaElement.style.display = 'block';
    const reader = new FileReader();
    reader.onload = function (d) {
        mediaPlayer.mediaElement.setAttribute("type", mediaFileList[i].type);
        mediaPlayer.mediaElement.src = d.target.result;
    };
    reader.readAsDataURL(mediaFileList[i]);
    htmlElements.playerTitle.innerHTML = mediaFileList[i].name;
    htmlElements.list[i].classList.add('current');
    mediaPlayer.currentTrack = i;
    setMediaMetadata(mediaFileList[i].name);
};

function setMediaMetadata(title) {
    if ('mediaSession' in navigator) {
        navigator.mediaSession.metadata = new MediaMetadata({
            title: title,
            artwork: [
                { src: 'logo.png', type: 'image/png' },
            ]
        });
        navigator.mediaSession.setActionHandler('seekbackward', () => mediaPlayer.skipBack());
        navigator.mediaSession.setActionHandler('seekforward', () => mediaPlayer.skipForward());
        navigator.mediaSession.setActionHandler('previoustrack', () => mediaPlayer.prev());
        navigator.mediaSession.setActionHandler('nexttrack', () => mediaPlayer.next());
    };
}

function appendElement(name, i) {
    const newElement = document.createElement('h3');
    newElement.classList.add("track")
    const textNode = name;
    newElement.innerHTML = textNode;
    newElement.addEventListener('click', () => play(i))
    htmlElements.container.insertAdjacentElement('beforeend', newElement)
};