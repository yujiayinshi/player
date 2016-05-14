/**
 * Created by HuangKai on 2016/5/14.
 */
function MusicVisualizer(obj) {
    this.source = null;

    this.count = 0;
    this.analyser = MusicVisualizer.ac.createAnalyser();
    this.size = obj.size;
    this.analyser.fftSize = this.size * 2;

    this.gainNode = MusicVisualizer.ac[ac.createGain?"createGain":"createGainNode"]();
    this.gainNode.connect(MusicVisualizer.ac.destination);
    this.analyser.connect(this.gainNode);

    this.xhr = new XMLHttpRequest();

    this.visualizer = obj.visualizer;

    this.visualize();
}

MusicVisualizer.ac = new (window.AudioContext||window.webkitAudioContext);

MusicVisualizer.prototype.load = function(url) {
    this.xhr.abort();
    this.xhr.open('GET', url);
    this.xhr.responseType = "arraybuffer";
    var self = this;
    this.xhr.onload = function() {
        fun(self.xhr.response)
    };
    this.xhr.send();
};

MusicVisualizer.prototype.decode = function(arraybuffer, fun) {
    MusicVisualizer.ac.decodeAudioData(arraybuffer, function(buffer) {
        fun(buffer);
    }, function(err) {
        console.log(err);
    });
};

MusicVisualizer.prototype.play = function(url) {
    var n = ++this.count;
    var self = this;
    this.load(url, function(arraybuffer) {
        if (n != self.count) {
            return;
        }
        self.decode(arraybuffer, function(buffer) {
            if (n != self.count) {
                return;
            }
            var bufferSource = MusicVisualizer.ac.createBufferSource();
            bufferSource.buffer = buffer;
            bufferSource[bufferSource.start?"start":"noteOn"](0);
            self.source = bufferSource;
        })
        this.source && this.stop();
    });
};

MusicVisualizer.prototype.stop = function() {
    this.source[this.source.stop ? "stop" : "noteOff"];
};

MusicVisualizer.prototype.changeVolume = function(percent) {
    this.gainNode.gain.value = percent * percent;
};

MusicVisualizer.prototype.visualize = function() {
    var arr = new Uint8Array(this.analyser.frequencyBinCount);
    analyser.getByteFrequencyData(arr);
    requestAnimationFrame = window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame

    var self = this;
    function v() {
        self.analyser.getByteFrequencyData(arr);
        self.visualizer(arr);
        draw(arr);
        requestAnimationFrame(v);
    }

    requestAnimationFrame(v);
};