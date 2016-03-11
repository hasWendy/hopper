/**
 * Utils
 */
import moment from 'moment';

export default class Utils {
  /**
   * urlToDict
   * Author: @hasErico
   *
   * @param url : full url, will be split on '?' to get query string
   * @return dict : key:value dictionary of query string params
   */
  static urlToDict(url) {
    // get query string
    let query = url.indexOf('?') > -1 ? url.split('?')[1] : url;

    // split params up
    let params = query.split('&');

    // map items to key/value
    let dict = {};
    params.forEach((param) => {
      let kv = param.split('=');
      dict[kv[0]] = kv[1];
    });

    return dict;
  }

  /**
   * prettySeconds
   * author: @binarykitchen, modified by @hasErico
   *
   * @param seconds
   * @return human readable name, such as '4 hours, 20 minutes'
   */
  static prettySeconds(seconds) {
    let dur = moment.duration({seconds});
    let intervals = ['months', 'days', 'hours', 'minutes', 'seconds']
    let output = [];
    for (let i = 0; i < intervals.length; i++) {
      let out = dur[intervals[i]]();
      if (out >= 1) {
        let interval = out === 1 ? intervals[i].substring(0, intervals[i].length -1) : intervals[i];
        output.push(`${out} ${interval}`);
      }
    }
    return output.join(', ');
  }
}
