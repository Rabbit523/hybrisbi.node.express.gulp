class URLBuilder {
	constructor(url, params) {
		this.url = location.origin;
		this.params = params ? params : [];

		if (url) {
			try {
				this.url = new URL(url);
			} catch (err) { // err = error
				
				let iniPrefix = url.substring(0, 2);
				
				let _url = this.url + url.substring(url.indexOf('./') + 1);
				this.url = new URL(_url);
			} finally {
				this.addQueryParams();
			}
		}
	}

	addQueryParams(_params) { // adds each query parameter to url
		if (_params) {
			_params.forEach((param) => this.params.push(param));
		}

		this.params.forEach((qp) => { // qp = query parameter object
			var _queryString = null;

			if (Array.isArray(qp.data)) {
				var _queryObject = '(';

				qp.data.forEach((e) => { // e = element
					var _eStr = null; // element string

					if (qp.display.prop && qp.display.substring) {
						_eStr = e[qp.display.prop].substring(qp.display.substring[0], qp.display.substring[1]);
					} else if (typeof qp.display == 'string') {
						_eStr = e[qp.display];
					} else if (qp.display.prop && !qp.display.substring) {
						_eStr = e[qp.display.prop];
					} else if (qp.display.substring && !qp.display.prop) {
						_eStr = e.substring(qp.display.substring[0], qp.display.substring[1]);
					} else {
						_eStr = e;
					}

					_queryObject += "'" + _eStr + "',";
				});

				_queryObject = _queryObject.substring(0, _queryObject.lastIndexOf(',')) + ')';

				_queryString = _queryObject;
			} else if (typeof qp.data == 'object') {
				_queryString = qp.data[typeof qp.display == 'string' ? qp.display : qp.display.prop];
			} else {
				_queryString = qp.data;
			}

			if (_queryString !== undefined) {
				this.url.searchParams.append(qp.name, _queryString);
			}
		});
	}

	toString() {
		return this.url.toString();
	}
}

class QueryParam {
	constructor(name, data, display) {
		this.name = name;
		this.display = display; // may be a string or object >> { prop: "object property", substring: [0, 3] }

		if (Array.isArray(data)) {
			if (data !== undefined && data.length > 0) {
				this.data = data;
			}
		} else if (data !== undefined) {
			this.data = data;
		}
	}
}