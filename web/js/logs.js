var socket = null;
var socketIsOpen = false;
var LOGS;

var runSocket = function() {
    socket = new WebSocket('wss://your-domain.com:8000');
    socket.binaryType = 'arraybuffer';

    socket.onopen = function() {
       console.log('Connected!');
       socketIsOpen = true;
       $('#socket-indicator').css('background-color', '#2DB32D');
    }

    socket.onmessage = function(e) {
        if (typeof e.data == 'string') {
            // console.log("Text message received: " + e.data);
            LOGS = JSON.parse(e.data);
            renderLOGS();
        } else {
            var arr = new Uint8Array(e.data);
            var hex = '';
            for (var i = 0; i < arr.length; i++) {
                hex += ('00' + arr[i].toString(16)).substr(-2);
            }
            console.log('Binary message received: ' + hex);
       }
    }

    socket.onclose = function (e) {
        console.log('Connection closed.');
        socket = null;
        socketIsOpen = false;
        $('#socket-indicator').css('background-color', '#F00');
    }
};


var socketSendText = function () {
    if (socketIsOpen) {
        socket.send('Hello, world!');
        console.log('Text message sent.');
    } else {
        console.log('Connection not opened.')
    }
};


var socketSendBinary = function () {
    if (socketIsOpen) {
        var buf = new ArrayBuffer(32);
        var arr = new Uint8Array(buf);
        for (i = 0; i < arr.length; ++i) arr[i] = i;
        socket.send(buf);
        console.log('Binary message sent.');
    } else {
        console.log('Connection not opened.')
    }
};


var renderLOGS = function (){
    $('#logs').html('');

    var now = new Date();
    var nowStr = now.toISOString().slice(11, 19);
    $('#update-info').text('Log rows #' + LOGS.length + ', update: ' + nowStr);

    var template = _.template($('script.log-template').html());
    var templateData;
    _.each(LOGS, function(data){
        var message = JSON.stringify(JSON.parse(data.message), null, 4);
        var response_message = JSON.stringify(JSON.parse(data.response_message), null, 4);
        templateData = {
            title: data.title,
            id: data.id,
            message: data.message,
            date: data.date,
            content: syntaxHighlight(data.content),
        };
        $('#logs').append(template(templateData));
    });
};



var syntaxHighlight = function (json) {
    json = json.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    var outStr = json.replace(/("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g, function (match) {
        var cls = 'number';
        if (/^"/.test(match)) {
            if (/:$/.test(match)) {
                cls = 'key';
            } else {
                cls = 'string';
            }
        } else if (/true|false/.test(match)) {
            cls = 'boolean';
        } else if (/null/.test(match)) {
            cls = 'null';
        }
        return '<span class="' + cls + '">' + match + '</span>';
    });
    return outStr;
};



window.onload = runSocket;



setInterval(function() {
    if (!socketIsOpen){
        runSocket();
    };
}, 3000);








