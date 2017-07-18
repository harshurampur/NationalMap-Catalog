'use strict';

/*global require*/

// Given an array of the SDMX-JSON dataset ids,
// read the corresponding SDMX-JSON dataflow
// and the corresponding SDMX (XML) metadata,
// check the field names and value names match, and
// output the field names and the hierarchy of allowed values (one per line).

const fs = require('fs');
const bluebirdPromise = require("bluebird");  // Used by request-promise.
const requestp = require('request-promise');
const xml2js = require('xml2js');

const delay = 500;  // The SDMX server returns errors if you try to hit it with more than a few requests at once.

function getSdmxMetaData(ids, sdmxJsonDataFlowUrl, sdmxDataStructureUrl) {
    ids.forEach((id, index) => {
        setTimeout(() => {
            bluebirdPromise.join(
                requestp({
                    url: sdmxJsonDataFlowUrl + id,
                    json: true
                }),
                requestp({
                    url: sdmxDataStructureUrl + id
                }),
                function(dataflow, xml) {
                    if (!xml) {
                        return;
                    }
                    var parser = new xml2js.Parser();
                    parser.parseString(xml, function (err, dataStructure) {
                        if (err) {
                            console.log(id, "could not parse as xml");
                        } else {
                            doProcess(id, dataflow, dataStructure);
                        }
                    });
                }
            ).catch(function(e) {
                console.error(e.message);
            });
        }, index * delay);
    });
}

function doProcess(id, dataflow, dataStructure) {
    // dataflow.structure.dimensions.observation:
    // Eg. keyPosition: 0, id: 'MSTP', name: 'Marital status', values: [{id: '1', name: 'Never married'}, ...]

    // dataStructure["message:Structure"]["message:Concepts"][0].Concept:
    //     [{ '$': { id: 'MEASURE', agencyID: 'ABS' }, Name: [ [Object], [Object] ] }, ... }, ...]
    // dataStructure["message:Structure"]["message:CodeLists"][0].CodeList:
    //     [{ '$': { id: 'CL_ABS_CENSUS2011_B02_FREQUENCY', agencyID: 'ABS' }, Name: [ [Object], [Object] ], Code: [ [Object] ] }, ... ]
    // with Code objects:
    //     [{"$":{"value":"A",parentCode:"0"},"Description":[{"_":"Annual","$":{"xml:lang":"en"}},{"_":"Annuelle","$":{"xml:lang":"fr"}}]}]

    // if (!dataStructure || !dataflow) {
    //     return;
    // }

    console.log(id);
    const jsonDimensions = dataflow.structure.dimensions.observation;
    // console.log('JSON dimensions');
    // console.log(jsonDimensions);

    const xmlConceptIds = dataStructure["message:Structure"]["message:Concepts"][0].Concept.map(c => c['$'].id);
    // console.log('XML concept ids');
    // console.log(xmlConceptIds);
    // xmlDimensions is a nicer formatting of the available code values for each dimension.
    const xmlDimensions = dataStructure["message:Structure"]["message:CodeLists"][0].CodeList.map(c => {
        return {
            id: c['$'].id,
            values: c.Code ? c.Code.map(code => {
                return {
                    id: code['$'].value,
                    name: code.Description[0]["_"],
                    parent: code['$'].parentCode
                };
            }) : []
        };
    });

    // console.log('XML dimensions');
    // console.log(JSON.stringify(xmlDimensions[0], null, 2));

    // Now compare the two representations.
    // We are aiming to find for each dimension:
    //   - which values work, eg. to inform measureWhitelist - or the catalog item's whitelist.
    //   - which values correspond to totals, eg. to inform measureTotalValueIds, ageId, sexId - or the catalog item's totalValueIds.
    //   - give options for selectedInitially, eg. to inform measureSelectedInitially - or the catalog item's selectedInitially.
    //   - if there's multiple hierarchies of values, show them so an admin can decide how to structure as a single layer.
    //   - which dimensions should only allow a single value to be selected at a time, ie. to inform singleValuedDimensionIds.
    // And overall:
    //   - identify the region dimension, regionDimensionId.
    //   - identify if there's a "state" dimension, hasState - or the catalog item's aggregatedDimensionIds.

    const ignoreJsonDimensionIds = ["TIME_PERIOD", "STATE", "REGION", "ASGS_2011", "ASGS_2016", "LGA_2011", "LGA_2013", "LGA_2014", "LGA2014", "LGA_2015", "LGA_2016", "ASGS_2011_STATE_GCCSA_SA4_SA3_SA2", "ASGC_2010", "NRM_2012"];
    jsonDimensions.forEach(jsonDimension => {
        // Note the "id" field taken from the XML (eg. "CL_ABS_CENSUS2011_B02_LGA_TIME_FORMAT") doesn't match the id in the SDMX-JSON ("TIME_FORMAT").
        // Assume the latter id is present at the end of the former.
        const matchingXmlDimensions = xmlDimensions.filter(d => d.id.endsWith(jsonDimension.id));
        if (ignoreJsonDimensionIds.indexOf(jsonDimension.id) >= 0) {
            console.log("  ", jsonDimension.id, jsonDimension.name, "<suppressed>");
            return;
        } else if (matchingXmlDimensions.length !== 1) {
            console.warn("  Cannot find " + jsonDimension.id + " in " + xmlDimensions.map(d => d.id));
            return;
        }
        const xmlDimension = matchingXmlDimensions[0];
        console.log("  ", jsonDimension.id, jsonDimension.name, JSON.stringify(xmlDimension.values));
    });
    console.log();
}

module.exports = getSdmxMetaData;
