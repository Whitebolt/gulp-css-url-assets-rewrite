'use strict';

const through = require('through2');
const path = require('path');
const fs = require('fs');

const xUrlValues = /\burl\((?:\"|\'|)(.*?)(?:\"|\'|)\)/g;
const xIsNotLocal = /^data\:|\w+\:\/\//;
const xQuestionOrHash = /\?|\#/;

function* urls(contents) {
	let matches;
	while (matches = xUrlValues.exec(contents)) {
		let [fullMatch, urlPath] = matches;
		if (!xIsNotLocal.test(urlPath)) yield [fullMatch, urlPath];
	}
}

function trimUrl(urlPath) {
	return urlPath.split(xQuestionOrHash).shift();
}

function untrimUrl(trimmedUrl, originalUrl) {
	return trimmedUrl + originalUrl.replace(trimUrl(originalUrl), '');
}

function makeArray(ary) {
	if (Array.isArray(ary)) return ary;
	if (ary === undefined) return [];

	try {
		if (Symbol.iterator in ary) return [...ary];
	} catch (error) {
		return [ary];
	}
}

function getTestPaths(assets, urlPath) {
	return makeArray(assets).map(assetPath=>path.resolve(assetPath, urlPath));
}

function getReplacePath(assets, roots, urlPath) {
	let _urlPath = trimUrl(urlPath);
	const testPaths = getTestPaths(assets, _urlPath);
	const found = testPaths.find(urlPath=>fs.existsSync(urlPath));
	return (found ? getRootRelativeUrl(roots, untrimUrl(found, urlPath)) : urlPath);
}

function getRootRelativeUrl(roots, urlPath) {
	const found = makeArray(roots).find(root=>urlPath.startsWith(root));
	return (found?urlPath.replace(found, ''):urlPath);
}

function plugin(options, file, encoding, callback) {
	const ext = file.extname || path.extname(file.path);
	if ((ext !== '.css') || !file.isBuffer()) return callback(null, file);
	return doReplacements(options, file, encoding, callback);
}

function doReplacements(options, file, encoding, callback) {
	let replaced, contents;
	contents = file.contents.toString();
	for (let [fullMatch, urlPath] of urls(contents)) {
		const replacePath = getReplacePath(options.assets, options.root, urlPath);
		if (replacePath !== urlPath) {
			replaced = true;
			contents = contents.replace(fullMatch, fullMatch.replace(urlPath, replacePath));
		}
	}

	if (replaced) file.contents = new Buffer(contents);
	callback(null, file);
}

module.exports = options=>{
	return through.obj(function (...params){
		plugin.bind(this)(options, ...params);
	});
};