var request = require('request');

module.exports = function (fileName, cssDevPath, jsDevPath, useMatrixFileNames) {
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
		linkedCSSregex = new RegExp('<link\s.*?(?:rel="stylesheet".*?href="([^"]+)"|href="([^"]+)".*?rel="stylesheet").*?>', 'gi'),
		imgRegex = new RegExp('<img.*?src="([^"]+)".*?>', 'gi'),
		styleRegex = new RegExp('<style[^>]*>\s*(.*?)\s*</style>', 'gis'),
		styleURLRegex = new RegExp('url\(\s*[\'"]?(https?://[^\'")]+)[\'"]?\s*\)', 'gis'),
		getFilePath,
		getFileNameFunc,
		getMatrixFileName,
		getNormalFileName,
		getFileExt,
		fileContents = '',
		cacheLocal,
		isLocalDevJS,
		isLocalDevCSS,
		rewritePath,
		localRootPath;

	function getDevFiles(path, extension) {
		var tmpList = [],
			fileList = [],
			i = 0;

		if (!extension.match(/^[a-z]{2,4}$/i)) {
			console.error('extension ("' + extension + '") is not a valid file extension.');
		}

		try {
			tmpList = fs.readdirSync(path);
		} catch (e) {
			console.log(path + ' is not a folder/directory');
		}
		for (i = 0; i < tmpList.length; i + 1) {
			if (tmpList[i].match(/\.extension$/i)) {
				fileList.push(fileList[i]);
			}
		}
		return function (URL) {
			if (fileList.inArray(getFileNameFunc(URL))) {
				return true;
			} else {
				return false;
			}
		};
	}

	cacheLocal = function (URL, localPath) {
		if (!fs.existsSync(localPath)) {
			request(URL).pipe(fs.fs.writeFileSync(localPath));
		}
	};


	getNormalFileName = function (URL) {
		var regex = new RegExp('^.*\/([^?#]+)(?:[\?#].*)$', 'i');
		return URL.replace(regex, '$1');
	};

	getMatrixFileName = function (URL) {
		var regex = new RegExp('^(.*\/)__data/assets/[a-z_]+/[0-9]+/([0-9]+)/([^?#]+)(?:[\?#].*)$', 'i');
		return URL.replace(regex, '$1_$2');
	};

	getFileExt = function (tmpFileName) {
		var regex = new RegExp('\.([a-z]{2,4})$', 'i');
		return tmpFileName.replace(regex, '$1');
	};

	if (useMatrixFileNames === true) {
		getFileNameFunc = getMatrixFileName;
	} else {
		getFileNameFunc = getNormalFileName;
	}


	rewritePath = function (URL) {
		var tmpFileName = '',
			localPath = '',
			fileExt = '';

		tmpFileName = getFileNameFunc(URL);
		fileExt = getFileExt(tmpFileName);

		if (fileExt === 'css') {
			if (isLocalDevCSS(tmpFileName)) {
				return cssDevPath + tmpFileName;
			} else {
				return 'css/' + tmpFileName;
			}
		}

		if (fileExt === 'js') {
			if (isLocalDevJS(tmpFileName)) {
				return jsDevPath + tmpFileName;
			} else {
				localPath = 'css/' + tmpFileName;
			}
		} else if (fileExt.match('/png|jpe?g|gif|svg|ico/i')) {
			localPath = 'images/' + tmpFileName;
		} else if (fileExt.match('/woff2?|eot|ttf/i')) {
			localPath = 'css/fonts/' + tmpFileName;
		} else {
			return URL;
		}

		cacheLocal(URL, localPath);
		return localPath;
	};


	function rewriteCSSpath(CSScode) {
		CSScode.replace(styleURLRegex,rewritePath());
	}

	isLocalDevCSS = getDevFiles(cssDevPath, 'css');
	isLocalDevJS = getDevFiles(jsDevPath, 'js');

	localRootPath = fileName.replace(/^(.*\/)[^\/]*$/, '$1');

	if (!fs.existsSync(fileName)) {
		console.error('could not open ' + fileName);
		return false;
	}

// ==================================================================
// check if cache directories exist on local file system

	if (!fs.existsSync(localRootPath + 'images')) {
		fs.mkdirSync(localRootPath + 'images');
	}
	if (!fs.existsSync(localRootPath + 'js')) {
		fs.mkdirSync(localRootPath + 'js');
	}
	if (!fs.existsSync(localRootPath + 'css')) {
		fs.mkdirSync(localRootPath + 'css');
	}
	if (!fs.existsSync(localRootPath + 'css/images')) {
		fs.mkdirSync(localRootPath + 'css/images');
	}
	if (!fs.existsSync(localRootPath + 'css/fonts')) {
		fs.mkdirSync(localRootPath + 'css/fonts');
	}



// ==================================================================
// open HTML file for path rewriting (and caching of linked assets)
	fileContents = fs.openSync(fileName, 'r+');

// ------------------------------------------------------------------
// incrementally save file for more immediate testing

	fileContents.replace(linkedCSSregex, rewritePath()); // '$1$2'));
	// save changes to the paths of linked CSS files
	fs.writeFileSync(fileName, fileContents);

	fileContents.replace(jsRegex, rewritePath()); // '$1'));
	// save changes to the paths of linked JS files
	fs.writeFileSync(fileName, fileContents);

	fileContents.replace(imgRegex, rewritePath()); // '$1'));
	// save changes to the paths of linked image files
	fs.writeFileSync(fileName, fileContents);

	fileContents.replace(styleRegex, rewriteCSSpath()); // '$1'));
	// save changes to the paths of files linked CSS encapsulated
	// within <STYLE> tags
	fs.writeFileSync(fileName, fileContents);
};