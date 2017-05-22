
Change Log
==========

### 2017-04-13-updated-2017-05-22

* Fixed broken link to `National Datasets -> Land -> Land Cover`.
* Added `National Datasets -> Social and Economic -> Taxation Statistics 2014-2015`.
* Changed the Taxation Statistics datasets to use a different colour scheme and to default to displaying the "Average taxable income or loss" column.

### 2017-04-13

* Modified `gulp update-lga-filter` to test for `Jurisdiction=Local Government` as opposed to matching a regex and reactivated as part of gulp.

### 2017-03-15-updated-2017-03-20

* Created a catalog group for State of the Environment in the Data Providers group.
* Added a Beta Queeensland Government Group for their new webservices.
* Added `Telecommunications in New Developments` to Communications.
* Restructured `Surface Water` National Dataset and added `Dynamic Hydrology and Marine Layer`. 

### 2017-03-15

* Deprecated the old Australian Bureau of Statistics group and instead interspersed ABS items (now based on SDMX-JSON) into National Datasets.  Moved a few existing items into subfolders as appropriate.
* Moved `Agricultural exposure` from `Social and Economic` to `Land`.
* Moved ABS Statistical Boundaries datasets into the Data Providers group.
* Specified the character set for the ABC Photo Stories CSV file in order to fix a problem with incorrect display of unusual characters.

### 2017-02-15-updated-2017-03-07

* Created dga_filter.ejs to tidy data.gov.au query
* Migrated large ex-FIND sources (GA, AIMS, IMOS) to Data Providers.
* Removed erroneous NSW/SA results from data.gov.au
* Added councils missing from lgafilter to dgafilter
* Added `National Datasets -> Health`, and PHN boundaries
* Moved `Medicare Offices` to the `Health` group.

### 2017-02-15-updated-2017-03-02

* Removed `Administrative Boundaries` from the Queensland Government group because the MapServer no longer exists.

### 2017-02-15

* Updated the LGA filter.

### 2017-01-12

* Added new LGAs
* Added in LGAs with zero/protected datasets
* Added new CKAN portal - localdata.net.au
* Respecified Solr query for CKAN portals to include more formats and perform more stably.
* Included more formats explicity for CKANCatalogItem

### 2016-12-02-updated-2017-01-05

* Renamed `National Data Sets` to `National Datasets`.
* Renamed `ABS statistical boundaries` to `ABS Statistical Boundaries`.
* Added New Victorian LGAs.
* Added 2012-13 and 2013-14 Taxation Statistics.
* Updated ABS 2016 Boundaries.
* Updated Taxation Statistics ColorPalettes and ColorBins

### 2016-12-02

* Added Round 2 Mobile Black Spot Program Funded Base Stations, renamed previous dataset to Round 1.
* Updated to 2016 Catchment Scale Land Use.

### 2016-10-13

* Updated list of LGAs from data.gov.au.

### 2016-09-15

* Update 4 GA layers that have moved.

### 2016-08-09

* Update ACT catalog with new layer descriptions.
* Update type of Sunshine Coast Council to esri-group.

### 2016-07-15

* Add 62 layers from the ACT Government.
* Switch to using EJS templates instead of merging JSON files. Much simpler and more flexible.
* Generate a nm_big.json alongside nm.json, which is un-minified.
* Added ABC stories to Communications group.
* Search data.vic.gov.au for KMZs (and GeoJSON and Csv-geo-au, which there aren't any of yet).
* Added ACMA dataset.
* Added Geoscience Australia DEM datasets.
* Added Agricultural Exposure and Building Exposure datasets.
* Added ABS statistical boundary GIS layers from the ABS Esri MapServer.
* Add Local Government top-level group with councils from WA, SA, Vic, Tasmania and QLD.

### 2016-06-15

* Changed the message that is displayed the first time the ACT group is opened.  It now indicates that the data will be back after 1 July.
* Fixed an incorrect legend displayed for several datasets in `Statistical Boundaries`.
* Fixed an incorrect licence displayed for several Tasmanian Government datasets.

### 2016-05-13

* Added `Scanned 1:250K Geological Maps` to `National Data Sets` -> `Land`.
* Added `Commonwealth Electoral Divisions (2016)` to `National Boundaries`.
* Renamed `Commonwealth Electoral Divisions` to `Commonwealth Electoral Divisions (2011)`.

### 2016-04-15-updated-2016-04-28

* Added `Australia 250K Topographic Map 2008` to `National Data Sets` -> `Land`.

### 2016-04-15-updated-2016-04-27

* Updated Western Australia CKAN query to point to "_Public_Services".
* Updated URLs for `Gravity Anomaly` and `Magnetic Intensity` layers in `Land` to point to `services.ga.gov.au`.
* Updated URLs of various datasets in `Framework` to use `services.ga.gov.au`.

### 2016-04-15

* Catalog now used live by NationalMap, hosted on S3: http://static.nationalmap.nicta.com.au/init/2016-04-15.json
