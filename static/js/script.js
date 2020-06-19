setInterval(function waves() {
    var wavers = document.getElementsByClassName("waver");
    var wavels = document.getElementsByClassName("wavel");
    for (var i=0; i < wavers.length; i++) {
	var wave = wavers[i].innerHTML;
	var last = wave.charAt(wave.length - 1);
	var therest = wave.slice(0, wave.length - 1);
	wavers[i].innerHTML = last + therest;
    }
    for (var i=0; i < wavels.length; i++) {
	var wave = wavels[i].innerHTML;
	var first = wave.charAt(0);
	var therest = wave.slice(1, wave.length);
	wavels[i].innerHTML = therest + first;
    }
    
}, 700)
