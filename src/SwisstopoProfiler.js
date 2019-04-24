import GeoJSONFormat from 'ol/format/GeoJSON.js';
import EPSG_2056 from '@geoblocks/sources/EPSG2056.js';

// https://api3.geo.admin.ch/services/sdiservices.html#profile

/**
 * @implements {geoblocks.Profiler}
 */
class SwisstopoProfiler {

  /**
   * @param {Object} options
   * @property {ol.proj.Projection} options.projection
   */
  constructor(options) {
    /**
     * @private
     * @type {string}
     */
    this.url_ = 'https://api3.geo.admin.ch/rest/services/profile.json';

    /**
     * @private
     * @type {GeoJSONFormat}
     */
    this.geojsonFormat_ = new GeoJSONFormat({
      dataProjection: EPSG_2056,
      featureProjection: options.projection
    });
  }

  /**
   * @param {ol.Feature} segment
   * @return {Promise}
   */
  computeProfile(segment) {
    const geom = /** @type{ol.geom.LineString} */ (segment.getGeometry());

    // Round coordinate to meter precision by rounding to the fifth decimal place which equals about 1.1 meters.
    // see: https://gis.stackexchange.com/a/8674
    const lowerPrecisionCoords = /** @type{Array.<ol.Coordinate>} */
      (geom.getCoordinates().map(coord => coord.map(c => Number.parseFloat(c.toFixed(5)))));
    geom.setCoordinates(lowerPrecisionCoords);

    const geojson = this.geojsonFormat_.writeGeometry(geom);

    const request = fetch(this.url_, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: `geom=${geojson}&sr=2056&offset=1&elevation_models=COMB`
    });
    return request
      .then(response => response.json())
      .then((profile) => {
        segment.set('profile', profile);
      });
  }
}

export default SwisstopoProfiler;
