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
    // TODO: round to coordinate to meter precision

    const geom = this.geojsonFormat_.writeGeometry(segment.getGeometry());

    const request = fetch(this.url_, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: `geom=${geom}&sr=2056&offset=1&elevation_models=COMB`
    });
    return request
      .then(response => response.json())
      .then((profile) => {
        segment.set('profile', profile);
      });
  }
}

export default SwisstopoProfiler;
