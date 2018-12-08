# BasiGX

[![Greenkeeper badge](https://badges.greenkeeper.io/terrestris/BasiGX.svg)](https://greenkeeper.io/) [![Build Status](https://travis-ci.org/terrestris/BasiGX.svg?branch=master)](https://travis-ci.org/terrestris/BasiGX) [![Coverage Status](https://coveralls.io/repos/terrestris/BasiGX/badge.svg?branch=master&service=github)](https://coveralls.io/github/terrestris/BasiGX?branch=master)

…pronounced `ˈbeɪsɪks/`

BasiGX is an ExtJS package used to create modern GIS-Applications based on ExtJS 6, GeoExt3 and OpenLayers > 3.
It consists of multiple components that helps the developer to put together a customized app quickly.

## Documentation

* http://terrestris.github.io/BasiGX/master/docs/
* http://terrestris.github.io/BasiGX/master/docs-w-ext/

## Installation

Assuming you already have setup or freshly created an ExtJS 6 application, you just need to

* Add the GeoExt ExtJS repository:
```bash
sencha package repo add GeoExt http://geoext.github.io/geoext3/cmd/pkgs
```

* Add the BasiGX ExtJS repository:
```bash
sencha package repo add BasiGX http://terrestris.github.io/BasiGX/cmd/pkgs
```

* Add the packages `GeoExt`, `BasiGX` & `ux` to the requirements in `app.json`.
```json
    "requires": [
        "GeoExt",
        "BasiGX",
        "ux"
    ],
```

* Call `sencha app refresh`

## Feedback

Feedback is more than welcome. Please open an issue or contact us directly via `info@terrestris.de`

## License

GPL v3
