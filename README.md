# NationalMap-Catalog

The catalog (init files) for National Map. Please raise any issues at https://github.com/NICTA/NationalMap/issues.

## Usage

You can preview the latest version of this catalog file [here](http://nationalmap.gov.au/#clean&https://rawgit.com/TerriaJS/NationalMap-Catalog/master/build/nm.json).

## Setting up your environment for modifying the catalog

You need to download and install:
* [node.js](https://nodejs.org/en/) on your system.  The latest LTS (long-term support) release is a good choice.
* [git](https://git-scm.com/)

Then, open a git bash command prompt (installed when you installed git above), `cd` to the directory you'd like to put the NationalMap-Catalog repository (if you're on Windows, remember that your `C:` drive is found under `/c` in git bash), and type:

```
git clone https://github.com/TerriaJS/NationalMap-Catalog.git
cd NationalMap-Catalog
```

Next, install the NationalMap-Catalog dependencies by running this inside the `NationalMap-Catalog` directory that was created when you run `git clone` above:

```
npm install
```

Finally, you can build the catalog by running:

```
npm run build
```

This command compiles the catalog fragments from `datasources/` into a single, minified `build/nm.json`. A list of Geoscience Australia services used is also generated in `build/ga_services.txt`.

If you don't have commit access directly to the NationalMap-Catalog repository on GitHub, create a fork and then add your fork as a remote by running:

```
git remote add kring https://github.com/kring/NationalMap-Catalog.git
```

Replace the two occurrences of `kring` in the above command with your GitHub username.

## Making changes and committing them

Edit the files in `datasources/` using any text editor ([Visual Studio Code](https://code.visualstudio.com/) is lovely and free).  Then run:

```
npm run build
```

again to build `build/nm.json` to include your changes.  You can then try your catalog in NationalMap by visiting http://nationalmap.gov.au/#clean and then dragging/dropping your `build/nm.json` onto the map.

Once you're happy with your changes, make a branch for them with:

```
git checkout -b my-awesome-catalog-change
```

And commit them with:

```
git commit -a -m 'Put a short description of what you changed here'
```

And finally, push your changes to your fork:

```
git push --set-upstream kring my-awesome-catalog-change
```

Replace `kring` with your GitHub user name, and replace `my-awesome-catalog-change` with the name of the branch you created with `git checkout` above.

## Testing out your changes in NationalMap

You can test your changes before you even commit them to GitHub by dragging/dropping the generated catalog file, as described above.  But a slightly more "real world" test is possible once your changes are pushed to GitHub.

Use the GitHub UI to find the branch containing your changes in your NationalMap-Catalog fork.  Then navigate to the `build/nm.json` directory and click the Download button.  Copy the URL that your browser visits, and tack it onto the end of this URL: `http://nationalmap.gov.au/#clean&`.  For example: http://nationalmap.gov.au/#clean&https://github.com/kring/NationalMap-Catalog/raw/master/build/nm.json

NationalMap will open with your modified catalog.

## Syncing with catalog changes by others

Before starting new catalog changes, you should always "pull" changes that others have made to the catalog from GitHub.  To do that, first switch back to the master branch:

```
git checkout master
```

Then, pull pull new changes from GitHub:

```
git pull --rebase
```

From here you can create a new branch for some new changes:

```
git checkout -b another-set-of-awesome-changes
```
