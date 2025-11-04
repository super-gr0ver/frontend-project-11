/* eslint-disable semi */
import instance from './instance.js'

const getUrl = (url) => {
  const encodedUrl = encodeURIComponent(url)
  return instance.get(`/get?disableCache=true&url=${encodedUrl}`)
};

export default getUrl
