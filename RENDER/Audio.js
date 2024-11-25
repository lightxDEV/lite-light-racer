var RENDER = RENDER || {};

RENDER.Audio = {};
RENDER.Audio.sounds = {};

RENDER.Audio.init = function(){
	if(window.AudioContext||window.webkitAudioContext){
		RENDER.Audio._ctx = new (window.AudioContext||window.webkitAudioContext)();
		RENDER.Audio._panner = RENDER.Audio._ctx.createPanner();
		RENDER.Audio._panner.connect(RENDER.Audio._ctx.destination);
	}
	else {
		RENDER.Audio._ctx = null;
	}

	RENDER.Audio.posMultipler = 1.5;
};

RENDER.Audio.init();

RENDER.Audio.addSound = function(src, id, loop, callback, usePanner){
	var ctx = RENDER.Audio._ctx;
	var audio = new Audio();
	
	if(ctx){
		var audio = { src: null, gainNode: null, bufferNode: null, loop: loop };
		var xhr = new XMLHttpRequest();
		xhr.responseType = 'arraybuffer';

		xhr.onload = function(){
			ctx.decodeAudioData(xhr.response, function(b){
				// Create Gain Node
				var gainNode = ctx.createGain();

				if(usePanner === true){
					gainNode.connect(RENDER.Audio._panner);
				}
				else {
					gainNode.connect(ctx.destination);
				}

				// Add the audio source
				audio.src = b;

				//Remember the gain node
				audio.gainNode = gainNode;
				
				callback();
			}, function(e){
				console.error('Audio decode failed!', e);
			});
		};

		xhr.open('GET', src, true);
		xhr.send(null);
	}
	else {
		// Workaround for old Safari
		audio.addEventListener('canplay', function(){
			audio.pause();
			audio.currentTime = 0;

			callback();
		}, false);

		audio.autoplay = true;
		audio.loop = loop;
		audio.src = src;
	}
	
	RENDER.Audio.sounds[id] = audio;
};

RENDER.Audio.play = function(id){
	var ctx = RENDER.Audio._ctx;

	if(ctx){
		var sound = ctx.createBufferSource();
		sound.connect(RENDER.Audio.sounds[id].gainNode);
		
		sound.buffer = RENDER.Audio.sounds[id].src;
		sound.loop = RENDER.Audio.sounds[id].loop;

		RENDER.Audio.sounds[id].gainNode.gain.value = 1;
		RENDER.Audio.sounds[id].bufferNode = sound;

		sound.start ? sound.start(0) : sound.noteOn(0);
	}
	else {
		if(RENDER.Audio.sounds[id].currentTime > 0){
			RENDER.Audio.sounds[id].pause();
			RENDER.Audio.sounds[id].currentTime = 0;
		}

		RENDER.Audio.sounds[id].play();
	}
};

RENDER.Audio.stop = function(id){
	var ctx = RENDER.Audio._ctx;

	if(ctx){
		if(RENDER.Audio.sounds[id].bufferNode !== null){
			var bufferNode = RENDER.Audio.sounds[id].bufferNode;
			bufferNode.stop ? bufferNode.stop(ctx.currentTime) : bufferNode.noteOff(ctx.currentTime);
		}
	}
	else {
		RENDER.Audio.sounds[id].pause();
		RENDER.Audio.sounds[id].currentTime = 0;
	}
};

RENDER.Audio.volume = function(id, volume){
	var ctx = RENDER.Audio._ctx;

	if(ctx){
		RENDER.Audio.sounds[id].gainNode.gain.value = volume;
	}
	else {
		RENDER.Audio.sounds[id].volume = volume;
	}
};

RENDER.Audio.setListenerPos = function(vec){
	if(RENDER.Audio._ctx){
		var panner = RENDER.Audio._panner;
		var vec2 = vec.normalize();
		panner.setPosition(
			vec2.x * RENDER.Audio.posMultipler,
			vec2.y * RENDER.Audio.posMultipler,
			vec2.z * RENDER.Audio.posMultipler
		);
	}
};

RENDER.Audio.setListenerVelocity = function(vec){
	if(RENDER.Audio._ctx){
		var panner = RENDER.Audio._panner;
		//panner.setVelocity(vec.x, vec.y, vec.z);
	}
};