class StringService {

    constructor(str) {
        this.str = str;
    }

    // https://stackoverflow.com/questions/14313183/javascript-regex-how-do-i-check-if-the-string-is-ascii-only
    isASCII(str, extended) {
        return (extended ? /^[\x00-\xFF]*$/ : /^[\x00-\x7F]*$/).test(str);
    }

    // https://developer.mozilla.org/en-US/docs/Web/API/TextEncoder
    encode(str) {
        return (new TextEncoder('utf-8').encode(str));
    }

    toHex(s) {
        // utf8 to latin1
        var s = unescape(encodeURIComponent(s))
        var h = ''
        for (var i = 0; i < s.length; i++) {
            h += s.charCodeAt(i).toString(16)
        }
        return h
    }
    
    fromHex(h) {
        var s = ''
        for (var i = 0; i < h.length; i+=2) {
            s += String.fromCharCode(parseInt(h.substr(i, 2), 16))
        }
        return decodeURIComponent(escape(s))
    }


}

module.exports = { StringService }