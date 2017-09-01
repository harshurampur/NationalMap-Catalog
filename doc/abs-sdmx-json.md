# Adding new ABS SDMX-JSON data items to the catalog

## Why is this so hard?

Ideally APIs should be fully machine-readable and "just work".

Unfortunately the SDMX-JSON API needs a fair bit of customisation to work with TerriaJS. In particular:

- There is no SDMX-JSON API endpoint that lists the available datasets - so the catalog cannot self-update.
- The datasets are not categorised in any way, so we have to define ahead of time where each one should appear in the NationalMap catalog hierarchy.
- SDMX-JSON does not support hierarchical dimension values (eg. Age -> 0-4 year olds -> 0,1,2,3,4 year olds). However, the datasets are organised with hierarchical dimension values; the SDMX-JSON server simply ignores that detail. As a result, a user could get very confused, eg. “Buddhism” appears three times as a religion at different levels of the "religious affiliation" hierarchy, meaning different things.
- The API doesn’t reliably return data for every possible value (eg. its metadata may include 0-4 years as a possibility, but it doesn't have any data).
- When the API doesn't have any data, instead of returning no data, it returns badly formed JSON.
- The region dimension is identified inconsistently across datasets.
- Some datasets have an extra STATE dimension that needs to be aggregated over explicitly.

The hierarchical value problem is the most painful one, because the values for every dataset have to be checked against the more definitive SDMX (XML) source and remapped. This can't be fully automated at runtime because we also have to suppress those values for which no data will be returned. Also, I don't want to require that an exactly equivalent SDMX version of the data is available.

## Compilation process overview

The source of truth is this file: [datasources/sdmx-abs.csv](../datasources/sdmx-abs.csv).  Changes to this file are picked up by `gulp build` and incorporated into `build/nm.json`. The rows of this file are reformatted by [datasources/includes/sdmx-abs-item.ejs](../datasources/includes/sdmx-abs-item.ejs), which briefly explains the meaning of each column.

Some enrichment also occurs in [datasources/includes/sdmx-abs-item.ejs](../datasources/includes/sdmx-abs-item.ejs). In particular this adds generic `totalValueIds` and `whitelists` to every item.

## Sample ABS SDMX-JSON endpoints

Sample SDMX-JSON metadata endpoint: http://stat.data.abs.gov.au/sdmx-json/dataflow/ABS_C16_T02_LGA
Sample SDMX (XML) metadata endpoint: http://stat.data.abs.gov.au/restsdmx/sdmx.ashx/GetDataStructure/ABS_C16_T02_LGA
Sample data endpoint: http://stat.data.abs.gov.au/sdmx-json/data/ABS_C16_T02_LGA/TOT.TT.3..LGA2016./all

## The How-To Guide

### Add the new datasets to sdmx-abs.csv

Manually find newly available datasets by looking at the source code of (http://stat.data.abs.gov.au/sdmx-json/)[http://stat.data.abs.gov.au/sdmx-json/], and comparing to the datasets currently listed.

Add the ids to the appropriate column of [datasources/sdmx-abs.csv](../datasources/sdmx-abs.csv).

### Work out where and how each dataset should appear in the catalog

Let's take `ABS_C16_T12_LGA`, "Highest Year of School Completed by Age by Sex", as an example. The columns which determine position in the catalog are:
- `outerGroups`: An optional array of group names into which this item should be placed, eg. ["National Datasets", "Social and Economic"].
- `nameOutsideCatalog`: Optional value for the name of the item outside the catalog, if different from `name` below. You won't need this much, but can be useful when the ultimate name in the catalog is just something like "Size", so that we get a more descriptive name in the legend (eg. "Labour Force Size").
- `group`: The group name to include this in, eg. "Person". This could have gone into `outerGroups` but is here for legacy reasons.
- `subgroup`: An optional subgroup name, eg. "Education".
- `name`: The name of the item, eg. "Number of Motor Vehicles".
- `bys`: A string with the "by" variables, eg. "By Age by Sex".
- `geoType`: One of '', 'SAx', 'LGA', 'SA1_SA' or something else. This generates a [level of hierarchy](../datasources/includes/sdmx-abs-geo-name.ejs), eg. named "By Statistical Area" (for "SAx").
- `series`: One of '', 'B', 'T' or something else. This affects the [name](../datasources/includes/sdmx-abs-name.ejs) of the item ('B' => '2011 Census', 'T' => 'Over time'), and the [description](../datasources/includes/sdmx-abs-description.ejs) of the item.

The compilation process follows an overly complicated process to convert all that information into a position in the catalog hierarchy. I apologise for how complicated it is. It could be rewritten much more clearly.

### Deal with hierarchical and missing values

As written, the gulp task `gulp get-abs-sdmx-metadata` will read the metadata for every dataset in the csv file from both the SDMX-JSON and the SDMX XML.

You probably don't want to do this for all the existing datasets. You can either:
- temporarily put "FALSE" in the first `#include` column for all the datasets you don't want it to run; or,
- modify the task in `gulpfile.js` so that the variable `ids` only includes the new dataset ids.

Then run the task. The output just goes to stdout in yaml format. Copy the output to the end of (sdmx-abs-metadata-for-reference.yaml)[../datasources/sdmx-abs-metadata-for-reference.yaml], for reference.

You can scan this yaml output to quickly find hierarchical dimension values.



So I had to tell NationalMap which values to show and which to ignore, and which values correspond to the grand total for each dimension - often “TOT”, but eg. for sex it’s “3”.  That’s needed so the map can show %s of regional totals properly, and so the user can’t select “total” and “male” together, which wouldn’t make sense.
• Also, as I mentioned before, the API doesn’t reliably return data for every possible value, so I have to manually check as many combinations as possible.

### ...

• I also had to manually identify the region dimension.  In the new datasets these always have id LGA_2016 or ASGS_2016, which is a big improvement on before… but it would be even better if we agreed on a way of identifying the region dimension that’s constant across region types and time, eg. id=REGION instead, or role=REGION.