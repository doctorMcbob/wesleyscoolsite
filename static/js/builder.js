function hash_to_hex(rule) {
    var hash = "";
    for (var i=0; i<rule.length; i+=4) {
	var b = parseInt(rule.slice(i, i+4), 2).toString(16);
	hash += b;
    }
    return hash;
}
function dehash_to_bin(hash) {
    var bin = "";
    for (var i=0; i<hash.length; i++) {
	var h = "0000" + parseInt(hash[i], 16).toString(2);
	h = h.slice(h.length - 4, h.length);
	bin += h;
    }
    return bin;
}

function update_rule() {
    var rule = "";
    for (var i = 0; i < 256; i++) {
	if ( document.getElementById(i.toString()).checked ) {
	    rule += "1";
	} else {
	    rule += "0";
	}
    }
    document.getElementById("rule").innerHTML = hash_to_hex(rule);
}

var checkboxes = document.getElementsByTagName("input");
for (var i = 0; i < checkboxes.length; i++) {
    checkboxes[i].onclick = update_rule;
}

update_rule()
