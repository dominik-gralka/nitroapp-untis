const WebUntis = require('webuntis');
const path = require('path');
require('dotenv').config();

const scriptName = path.basename(__filename);
const username = process.env.USERNAME;
const password = process.env.PASSWORD;
const school = process.env.SCHOOL;
const baseurl = process.env.BASEURL;

if (username == null) {
    console.log("Error: missing username parameter!");
    usage();
    process.exit(96);
}

if (password == null) {
    console.log("Error: missing password parameter!");
    usage();
    process.exit(97);
}

if (school == null) {
    console.log("Error: missing school parameter!");
    usage();
    process.exit(98);
}

if (baseurl == null) {
    console.log("Error: missing baseurl parameter!");
    usage();
    process.exit(99);
}

const untis = new WebUntis(
    school,
    username,
    password,
    baseurl
);

untis
    .login()
    .then(() => {
        const currentDay = currentSchoolday();
        console.log("-- " + formatDate(currentDay));

        return untis.getOwnTimetableFor(currentDay);
    })
    .then(timetable => {
        outputTimeTable(timetable);
    })
    .then(() => {
        const nextDay = nextSchoolday();
        console.log("\n-- " + formatDate(nextDay));

        return untis.getOwnTimetableFor(nextDay);
    })
    .then(timetable => {
        outputTimeTable(timetable);
    })
    .then(() => {
        const m = new Date();
        const dateString = formatDate(m) + " " + formatTime(m);
        console.log("\nLast updated " + dateString);
    });


function outputTimeTable(timetable) {
    timetable
        .sort(dynamicSort("startTime"))
        .forEach(function (element) {
            // console.log(JSON.stringify(element, null, 4));
            if (element.code != "cancelled") {
                console.log(outputTimeTableElement(element));
            }
        });
}

function usage() {
    console.log("\nCall " + scriptName + " username password school baseurl");
}

function weekday(date) {
    let weekdays = new Array(7);
    weekdays[0] = "Sonntag";
    weekdays[1] = "Montag";
    weekdays[2] = "Dienstag";
    weekdays[3] = "Mittwoch";
    weekdays[4] = "Donnerstag";
    weekdays[5] = "Freitag";
    weekdays[6] = "Samstag";
    return weekdays[date.getDay()];
}

function formatTime(m) {
    return m.getHours().toString().padStart(2, "0") + ":" + m.getMinutes().toString().padStart(2, "0") + ":" + m.getSeconds().toString().padStart(2, "0");
}

function formatDate(m) {
    return weekday(m) + ", " + m.getDate().toString().padStart(2, "0") + "." + (m.getMonth() + 1).toString().padStart(2, "0") + "." + m.getFullYear();
}

function currentSchoolday() {
    const date = new Date();

    let offset;
    // Sunday - Saturday : 0 - 6
    switch (date.getDay()) {
        case 0: // su->mo
            offset = 1;
            break;
        case 6: // sa->mo
            offset = 2;
            break;
        default:
            offset = 0;
            break;
    }

    date.setDate(date.getDate() + offset);
    date.setHours(0, 0, 0, 0);
    return date;
}

function nextSchoolday() {
    const date = new Date();

    let offset;
    // Sunday - Saturday : 0 - 6
    switch (date.getDay()) {
        case 0: // su->di
            offset = 2;
            break;
        case 5: // fr->mo
            offset = 3;
            break;
        case 6: // sa->di
            offset = 3;
            break;
        default:
            offset = 1;
            break;
    }

    date.setDate(date.getDate() + offset);
    date.setHours(0, 0, 0, 0);
    return date;
}

function outputTimeTableElement(element) {
    const activityType = element.activityType === "Unterricht" ? "" : (" " + element.activityType);

    let room = "";
    if (element.ro[0]) {
        room = element.ro[0].longname;
        if (room != element.ro[0].name) {
            room = room + " [" + element.ro[0].name + "]";
        }
    }

    let activity = "";
    let longname = "";
    if (element.su[0]) {
        activity = element.su[0].name.padEnd(3, " ");
        longname = " (" + element.su[0].longname + ")"
    }
    let ret = formatUntisTime(element.startTime) + " - " + formatUntisTime(element.endTime);
    ret = ret + " " + activity + longname;
    ret = ret + activityType + (element.substText ? " [" + element.substText + "]" : "");
    ret = ret + " - " + room;
    return ret;
}

function formatUntisTime(untisTime) {
    return WebUntis.convertUntisTime(untisTime).toTimeString().slice(0, 5);
}

function dynamicSort(property) {
    let sortOrder = 1;
    if (property[0] === "-") {
        sortOrder = -1;
        property = property.substr(1);
    }
    return function (a, b) {
        /* next line works with strings and numbers,
         * and you may want to customize it to your needs
         */
        const result = (a[property] < b[property]) ? -1 : (a[property] > b[property]) ? 1 : 0;
        return result * sortOrder;
    }
}