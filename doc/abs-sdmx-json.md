# Adding new ABS SDMX-JSON data items to the catalog

## Why is this so hard?

Ideally APIs should be fully machine-readable and "just work".

Unfortunately the SDMX-JSON API needs a fair bit of customisation to work with TerriaJS. In particular:

1. There is no SDMX-JSON API endpoint that lists the available datasets - so the catalog cannot self-update. This means adding new and removing datasets is a manual process. In particular when datasets are removed from the API, they continue to appear in the NationalMap catalog, but give an error message when opened (eg. a number of LGA ERP datasets were removed in mid 2017).
2. The datasets are not categorised in any way, so we have to define ahead of time where each one should appear in the NationalMap catalog hierarchy.
3. SDMX-JSON does not support hierarchical dimension values (eg. Age -> 0-4 year olds -> 0,1,2,3,4 year olds). However, the datasets are organised with hierarchical dimension values; the SDMX-JSON server simply ignores that detail. As a result, a user could get very confused, eg. “Buddhism” appears three times as a religion at different levels of the "religious affiliation" hierarchy, meaning different things.
4. The API doesn’t reliably return data for every possible value (eg. its metadata may include 0-4 years as a possibility, but it doesn't have any data).
5. When the API doesn't have any data, instead of returning no data, it returns badly formed JSON.
6. The region dimension is identified inconsistently across datasets.
7. Some datasets have an extra STATE dimension that needs to be aggregated over explicitly.
8. Some datasets have dimensions with values like "GDP (market exchange rates)", "GDP (PPP)", "GDP (USD)". These are alternatives, not values you can add together. This is not indicated in the SDMX-JSON.
9. There is no explanatory description of the dataset in the SDMX-JSON.

The hierarchical values issue (#3) means the values for every dataset have to be checked against a more definitive SDMX (XML) source and remapped. This can't be fully automated at runtime because we also have to suppress those values for which no data will be returned (issue #4). Also, I don't want to introduce a runtime dependency on an exactly equivalent SDMX version of the data.

## Additional issues
- The service should return error codes when it has an error. Eg. for a short period on the morning of 10 November 2017 http://stat.data.abs.gov.au/sdmx-json/dataflow/ABS_C16_T20_SA returned an html error page, but with a 200 success code. That's a problem - the internet relies on these codes, eg. for caching (in this case the error page was cached by National Map and shown for the next 2 hours, when the underlying problem was fixed much sooner).  It would also be better if that URL did not switch from json to html in the case of an error.
- Lack of a supported SDK for SDMX-JSON. I built TerriaJS's capability using https://github.com/airosa/sdmxjsonlib. This mostly works, but is labelled "experimental" and has not been updated in 3 years.

## Compilation process overview

The source of truth is this file: [datasources/sdmx-abs.csv](../datasources/sdmx-abs.csv).  Changes to this file are picked up by `gulp build` and incorporated into `build/nm.json`. The rows of this file are reformatted by [datasources/includes/sdmx-abs-item.ejs](../datasources/includes/sdmx-abs-item.ejs), which briefly explains the meaning of each column.

Some enrichment also occurs in sdmx-abs-item.ejs, unfortunately. In particular this adds generic `totalValueIds` and `whitelists` to every item.

## Sample ABS SDMX-JSON endpoints

- Sample SDMX-JSON metadata endpoint: http://stat.data.abs.gov.au/sdmx-json/dataflow/ABS_C16_T02_LGA
- Sample SDMX (XML) metadata endpoint: http://stat.data.abs.gov.au/restsdmx/sdmx.ashx/GetDataStructure/ABS_C16_T02_LGA
- Sample data endpoint: http://stat.data.abs.gov.au/sdmx-json/data/ABS_C16_T02_LGA/TOT.TT.3..LGA2016./all

## A How-To Guide

### 1. Add the new datasets to sdmx-abs.csv

Manually find newly available datasets by looking at the source code of [http://stat.data.abs.gov.au/sdmx-json/](http://stat.data.abs.gov.au/sdmx-json/), and comparing to the datasets currently listed.

Add the ids to the appropriate column of [datasources/sdmx-abs.csv](../datasources/sdmx-abs.csv).

### 2. Configure where and how each dataset should appear in the catalog

The columns which determine position in the catalog are:

- `outerGroups`: An optional array of group names into which this item should be placed, eg. ["National Datasets", "Social and Economic"].
- `nameOutsideCatalog`: Optional value for the name of the item outside the catalog, if different from `name` below. You won't need this much, but can be useful when the ultimate name in the catalog is just something like "Size", so that we get a more descriptive name in the legend (eg. "Labour Force Size").
- `group`: The group name to include this in, eg. "Person". This could have gone into `outerGroups` but is here for legacy reasons.
- `subgroup`: An optional subgroup name, eg. "Education".
- `name`: The name of the item, eg. "Number of Motor Vehicles".
- `bys`: A string with the "by" variables, eg. "By Age by Sex".
- `geoType`: One of '', 'SAx', 'LGA####', 'SA1_SA' or something else. This generates a [level of hierarchy](../datasources/includes/sdmx-abs-geo-name.ejs), eg. named "By Statistical Area" (for "SAx").
- `series`: One of '', 'B', 'T' or something else. This affects the [name](../datasources/includes/sdmx-abs-name.ejs) of the item ('B' => '2011 Census', 'T' => 'Over time'), and the [description](../datasources/includes/sdmx-abs-description.ejs) of the item.

The compilation process follows an overly complicated process to convert all that information into a position in the catalog hierarchy. Sorry - this could be rewritten much more clearly.

### 3. Configure hierarchical and missing values

As written, the gulp task `gulp get-abs-sdmx-metadata` will read the metadata for every dataset in the csv file from both the SDMX-JSON and the SDMX XML.

You probably don't want to do this for all the existing datasets. You can either:
- temporarily put "FALSE" in the first `#include` column for all the datasets you don't want it to run; or,
- modify the task in `gulpfile.js` so that the variable `ids` only includes the new dataset ids.

Then run the task. The output just goes to stdout in yaml format (some irrelevant output is suppressed to remove clutter, eg. all the region codes). Copy the output to the end of [sdmx-abs-metadata-for-reference.yaml](../datasources/sdmx-abs-metadata-for-reference.yaml), for reference.

You can scan this `yaml` output to quickly find hierarchical dimension values. Eg. the output below shows that the `sex` dimension has a total value (id 3, name Persons), with males (id 1) and females (id 2) as children:

```
- id: ABS_C16_T11_LGA
  dimensions:
    - id: SEX_ABS
      name: Sex
      values:
        - id: '3'
          name: Persons
          children:
            - id: '1'
              name: Males
            - id: '2'
              name: Females
```

You now need to tell NationalMap which values to show and which to ignore, and which values correspond to the grand total for each dimension - often this is `TOT`, but for `sex` it's `3`, as above.  We need to do this so TerriaJS can show percentages of regional totals properly, and so the user can't select "persons" and "male" together, which wouldn’t make sense.

The following columns determine how each dimension is presented to the user:

- `sexId`: The sex dimension id, if present - usually "SEX_ABS", but in older datasets can be "SEX" or "MEASURE". The sole impact of this is that the ejs file automatically sets id "3" as the total measure for this dimension.
- `ageId`: The age dimension id, if present. The ejs file adds "TT" and "O15" as totals, and sets a whitelist on the dimension to `["A[0-9]+", "T.*", "O.*"]`, so that only five-year ranges and totals, not individual years, are available.
- `measureWhitelist`, `measureTotalValueIds`, `measureSelectedInitially`: These all apply only to the "measure" dimension.
- `blacklist`: A custom blacklist, as an object whose keys are dimension ids, and values are arrays of blacklisted values.

However, a big part of this process happens in [datasources/includes/sdmx-abs-item.ejs](../datasources/includes/sdmx-abs-item.ejs) - see the `totalValueIds` and `whitelist` sections. So you will probably need to add to those sections too. Please add comments to connect any changes to specific dataset ids. D'oh!

Also, as mentioned earlier, the API doesn’t reliably return data for every possible dimension value, so once you have it all loaded into NationalMap, you'll need to manually check as many combinations of values as possible and check they work (eg. it might not return data when you choose a particular level of hierarchy in the dimension, eg. age in 5 year ranges, but work fine for 1-year ranges and for the total across all ages).

### 4. Identify regions and region types

Identify the region dimension.  In the 2016 datasets these always have id LGA_2016 or ASGS_2016, which is a big improvement on before. Place this name in the `regionDimensionId` column.  The region type is derived from the `geoType` column you filled in earlier.  For `SAx`, you need to tell it how to convert the region type name to a [csv-geo-au](https://github.com/TerriaJS/nationalmap/wiki/csv-geo-au) code via the `regionNameTemplate` column, eg. `{{name}}_code_2016`.

If the region type is something else, put the csv-geo-au-compliant region type code in the `regionType` column, eg. `ste` for states and territories.

Finally, some of the older datasets have a `STATE` dimension which makes the display confusing - eg. LGAs in NSW all have STATE = NSW, LGAs in Victoria all have STATE = Victoria, etc.  As a result, by default NationalMap cannot show all LGAs at once. By setting `hasState` to TRUE, `ejs` directs TerriaJS to aggregate over this dimension, effectively removing it from consideration.

Ideally we would agree with the ABS on a way of identifying the region dimension that's constant across region types and time, eg. `id=REGION` or `role=REGION` (preferably without losing the region-type information).

### 5. Single-valued dimensions

Some datasets have dimensions with values like "GDP (market exchange rates)", "GDP (PPP)", "GDP (USD)". These are alternatives, not values you can add together.

Tell TerriaJS about such dimensions by setting `singleValuedDimensionIds` to an array of dimensions which can only take a single value, eg. ["SPC"].

### 6. Add a dataset-specific description

Finally, anything in the  `description` column is placed at the front of the default description generated by [sdmx-abs-description.ejs](../datasources/includes/sdmx-abs-description.ejs).

### 7. Compile and test!

Type `gulp build` and try it out in your local NationalMap.
