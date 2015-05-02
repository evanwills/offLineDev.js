var reqquest = require('request');

module.exports = function (fileName, filePath, cssDevPath, jsDevPath) {
	// check that file exists
	// open file
	// scrape file for <script src="">, <link rel="stylesheet" href="" />, <img> & <style>... url()
	// check for local dev versions of JS & CSS files
	//		if found rewrite path to local dev file,
	//		if not, check for off-line version
	//			if no off-line version download
	//		rewrite path to offline version
	// for off-line (non-dev) css check for image & font URLs and download those if they're not already cached and rewrite URLs
	// for images, download and rewrite URLs.
	var jsRegex = new RegExp('<script.*?src="([^"]+)".*?>', 'gi'),
		linkRegex = new RegExp('<link\s.*?(?:rel="stylesheet".*?href="([^"]+)"|href="([^"]+)".*?rel="stylesheet").*?>', 'gi'),
		imgRegex = new RegExp('<img.*?src="([^"]+)".*?>', 'gi'),
		styleRegex = new RegExp('<style[^>]*>(.*?)</style>', 'gis'),
		fileContents,
		rewriteDev,
		cacheAssets,
		isLocalDevJS,
		isLocalDevCSS,
		saveToCache;

	function getDevFiles( path, extension ) {
		var tmpList = [],
			output = [],
			i = 0;

		if (!extension.match(/^[a-z]{2,4}$/i)) {
			console.error('extension ("' + extionsion + '") is not a valid file extension.' );
		}

		try {
			tmpList = fs.readdirSync(path);
		} catch (e) {
			console.log(path + ' is not a folder/directory');
		}
		for ( i = 0; i < tmpList.length; i + 1) {
			if (tmpList[i].match(/\.extension$/i)) {
				fileList.push(fileList[i]);
			}
		}
		return function(URL) {
			fileName = URL.replace(/^.*\/([^?]+)(?:\?.*)$/,'$1');
			if (fileList.inArray(fileName)) {
				return true;
			} else {
				return false;
			}
		}
	}

	function buildIsLocal( )

	this.isLocalDevCSS = getDevFiles(cssDevPath, 'css');
	this.isLocalDevJS = getDevFiles(jsDevPath, 'js');
};