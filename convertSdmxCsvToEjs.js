'use strict';

/*global require*/

// Translates the sdmx-abs csv master file into an ejs file.

var fs = require('fs');
var csv = require('terriajs/lib/ThirdParty/csv');
var replacements = [
    {old: new RegExp("\n {8}{", "g"), new: '\n        <%- include("../datasources/includes/sdmx-abs-item", {'},
    {old: new RegExp("\n {8}}", "g"), new: "\n        }) %>"}
];

function convertSdmxCsvToEjs(csvPath, outPath) {
    var stringData = fs.readFileSync(csvPath, "utf8");
    var rowsAsObjects = csv.toObjects(stringData, {onParseValue: processElement});
    // Strip out any rows with false in a column titled "#include", if present.
    rowsAsObjects = rowsAsObjects.filter(row => row['#include'] !== null);
    rowsAsObjects.forEach(removeCommentColumns);
    var out = { catalog: [{
        homeCamera: {
            north: -8,
            east: 158,
            south: -45,
            west: 109
        },
        name: "ABS SDMX-JSON (testing only)",
        type: "group",
        isOpen: true,
        items: rowsAsObjects
    }]};
    var result = JSON.stringify(out, undefined, 2);
    replacements.forEach(replacement => {
        result = result.replace(replacement.old, replacement.new);
    });
    fs.writeFileSync(outPath, result);
}

function removeCommentColumns(row) {
    // Remove any keys that start with #, and ignore the row if #include = true.
    Object.keys(row).forEach(key => {
        if (!key || key.indexOf('#') === 0) {
            delete row[key];
        }
    });
}

function processElement(raw) {
    // Converts empty strings to null, true (case insensitive) to Boolean true,
    // false (case insensitive) to null (because onParseValue interprets a return value of false to mean "skip the value"!)
    // Objects and arrays to dictionaries and lists, interpreting single quotes as double (so ensure no apostrophes!);
    // Anything else is returned as a string.
    // Notably, does not convert numbers (since we don't need that).
    var lowercase = raw.toLowerCase().trim();
    if (raw === '' || lowercase === 'false') {
        return null;
    }
    if (lowercase === 'true') {
        return true;
    }
    try {
        return JSON.parse(raw.replace(/'/g,'"'));
    } catch (e) {
        return raw;
    }
}


module.exports = convertSdmxCsvToEjs;