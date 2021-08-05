var XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;
const xhr = new XMLHttpRequest();
const url = "https://stundenplan.hamburg.de/WebUntis/jsonrpc.do?school=hh5098";

var session_id;

var authenticate = `{"id":"1","method":"authenticate","params":{"user":"11a",
"password":"Schule-1", "client":"CLIENT"},"jsonrpc":"2.0"}`;

var timetable = `{"id":"1","method":"getStatusData","params":{},"jsonrpc":"2.0"}`;

function request(params) {
    // configure a `POST` request
    xhr.open('POST', url);

    // set `Content-Type` header
    xhr.setRequestHeader('Content-Type', 'application/json');

    // add session id if present
    if (params ==! authenticate) {
        xhr.setRequestHeader('sessionId', session_id);
        data.append('JSESSIONID', session_id);
    }

    // pass `params` to `send()` method
    xhr.send(params);

    // listen for `load` event
    xhr.onload = () => {
        //console.log(xhr.responseText);
        var result = JSON.parse(xhr.responseText);
        //console.log(result);
        if (params == authenticate) {
        session_id = result.result;
        session_id = session_id.sessionId;
        //session_id = session_id.replace(".nodeTC01", "");
        }
        else {
            console.log(result);
        }
        
    }
}

request(authenticate);

setTimeout(function(){
    console.log(session_id);
    request(timetable, session_id);
},100);


