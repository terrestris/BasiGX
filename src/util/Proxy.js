/*eslint-env node*/
/* Copyright (c) 2015 terrestris GmbH & Co. KG
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */
/**
 * Simple NodeJS Proxy
 *
 * A simple proxy used to enable CORS on requests.
 * Use it if you want to use e.g. a Feature Info.
 *
 * Listens on port 3000 per default.
 *
 */
var http = require('http');

function onRequest(clientReq, clientRes) {

  var split = clientReq.url.split('/?url=')[1];
  var url = decodeURIComponent(split);

  http.get(url, function(res) {
      clientRes.setHeader('Access-Control-Allow-Origin', '*');
      clientRes.setHeader('Access-Control-Allow-Headers',
          'Origin, X-Requested-With, Content-Type, Accept');
      res.pipe(clientRes, {
          end: true
      });
  }).on('error', function(e) {
      /*eslint-disable */
      console.log("Got error: " + e.message);
      /*eslint-enable */
  });
}
http.createServer(onRequest).listen(3000);
