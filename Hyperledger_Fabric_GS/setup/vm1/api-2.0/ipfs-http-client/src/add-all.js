'use strict'

const { CID } = require('multiformats/cid')
const toCamel = require('./lib/object-to-camel')
const configure = require('./lib/configure')
const multipartRequest = require('./lib/multipart-request')
const toUrlSearchParams = require('./lib/to-url-search-params')
const abortSignal = require('./lib/abort-signal')
const { AbortController } = require('native-abort-controller')


/**
 * @typedef {import('ipfs-utils/src/types').ProgressFn} IPFSUtilsHttpUploadProgressFn
 * @typedef {import('ipfs-core-types/src/root').AddProgressFn} IPFSCoreAddProgressFn
 * @typedef {import('./types').HTTPClientExtraOptions} HTTPClientExtraOptions
 * @typedef {import('ipfs-core-types/src/root').API<HTTPClientExtraOptions>} RootAPI
 * @typedef {import('ipfs-core-types/src/root').AddResult} AddResult
 */

module.exports = configure((api) => {
  /**
   * @type {RootAPI["addAll"]}
   */
  async function * addAll (source, options = {}) {
     console.log("1")
    // console.log("source : " + JSON.stringify(source))
    // allow aborting requests on body errors
    const controller = new AbortController()
    console.log("controller : " + controller)
    const signal = abortSignal(controller.signal, options.signal)
    console.log("signal : " + signal)
    const { headers, body, total, parts } =
      await multipartRequest(source, controller, options.headers)
    console.log("headers : " + JSON.stringify(headers))
    console.log("total : " + JSON.stringify(total))
    console.log("parts : " + JSON.stringify(parts))

    // In browser response body only starts streaming once upload is
    // complete, at which point all the progress updates are invalid. If
    // length of the content is computable we can interpret progress from
    // `{ total, loaded}` passed to `onUploadProgress` and `multipart.total`
    // in which case we disable progress updates to be written out.


    const [progressFn, onUploadProgress] = typeof options.progress === 'function'
      // @ts-ignore tsc picks up the node codepath
      ? createProgressHandler(total, parts, options.progress)
      : [undefined, undefined]


	console.log(options.progress)


    const res = await api.post('add', {
      searchParams: toUrlSearchParams({
        'stream-channels': true,
        ...options,
        progress: Boolean(progressFn)
      }),
      onUploadProgress,
      signal,
      headers,
      body
    })


    console.log("##############################################")
    console.log(res)
    console.log("##############################################")
    console.log(res.ndjson())
    console.log("##############################################")

    for await (let file of res.ndjson()) {
	console.log(file)
      file = toCamel(file)

      if (file.hash !== undefined) {
	console.log(file)
	console.log("2")
        yield toCoreInterface(file)
      } else if (progressFn) {
	console.log("3")
        progressFn(file.bytes || 0, file.name)
      }
    }
  }
  return addAll
})

/**
 * Returns simple progress callback when content length isn't computable or a
 * progress event handler that calculates progress from upload progress events.
 *
 * @param {number} total
 * @param {{name:string, start:number, end:number}[]|null} parts
 * @param {IPFSCoreAddProgressFn} progress
 * @returns {[IPFSCoreAddProgressFn|undefined, IPFSUtilsHttpUploadProgressFn|undefined]}
 */
const createProgressHandler = (total, parts, progress) =>
  parts ? [undefined, createOnUploadProgress(total, parts, progress)] : [progress, undefined]

/**
 * Creates a progress handler that interpolates progress from upload progress
 * events and total size of the content that is added.
 *
 * @param {number} size - actual content size
 * @param {{name:string, start:number, end:number}[]} parts
 * @param {IPFSCoreAddProgressFn} progress
 * @returns {IPFSUtilsHttpUploadProgressFn}
 */
const createOnUploadProgress = (size, parts, progress) => {
  console.log("4")
  let index = 0
  const count = parts.length
  return ({ loaded, total }) => {
    // Derive position from the current progress.
    const position = Math.floor(loaded / total * size)
    while (index < count) {
	console.log("5")
      const { start, end, name } = parts[index]
      // If within current part range report progress and break the loop
      if (position < end) {
	console.log("6")
        progress(position - start, name)
        break
      // If passed current part range report final byte for the chunk and
      // move to next one.
      } else {
	console.log("7")
        progress(end - start, name)
        index += 1
      }
    }
  }
}

/**
 * @param {object} input
 * @param {string} input.name
 * @param {string} input.hash
 * @param {string} input.size
 * @param {string} [input.mode]
 * @param {number} [input.mtime]
 * @param {number} [input.mtimeNsecs]
 */
function toCoreInterface ({ name, hash, size, mode, mtime, mtimeNsecs, digitalzone_nft_timestamp, digitalzone_nft_minter, digitalzone_nft_owner, digitalzone_nft_uri, digitalzone_nft_category, digitalzone_nft_title, digitalzone_nft_num, digitalzone_nft_fcn }) {
  /** @type {AddResult} */

  const output = {
    path: name,
    cid: CID.parse(hash),
    size: parseInt(size),
    digitalzone_NFT_timestamp : digitalzone_nft_timestamp,
    digitalzone_NFT_minter : digitalzone_nft_minter,
    digitalzone_nft_owner : digitalzone_nft_owner,
    digitalzone_NFT_uri : digitalzone_nft_uri,
    digitalzone_NFT_category : digitalzone_nft_category,
    digitalzone_NFT_title : digitalzone_nft_title,
    digitalzone_NFT_num : digitalzone_nft_num,
    digitalzone_NFT_fcn : digitalzone_nft_fcn
  }

  if (mode != null) {
    output.mode = parseInt(mode, 8)
  }

  if (mtime != null) {
    output.mtime = {
      secs: mtime,
      nsecs: mtimeNsecs || 0
    }
  }

  return output
}
