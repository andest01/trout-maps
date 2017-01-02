import { createSelector } from 'reselect'
import { searchTextSelector, selectedStreamIdSelector } from 'ui/core/Core.selectors'
import { LOADING_CONSTANTS } from 'ui/core/LoadingConstants'
import { isEmpty, every, keyBy, has } from 'lodash'
export const regionIndexSelector = state => state.state.regionIndex
export const regulationsSelector = state => state.state.regulations
export const roadTypesSelector = state => state.state.roadTypes
export const palTypesSelector = state => state.state.palTypes
export const streamCentroidsSelector = state => state.state.streamCentroids
export const stateDataLoadingStatusSelector = state => state.state.stateDataLoadingStatus
export const slugDictionarySelector = state => state.state.slugDictionary
export const streamIdDictionarySelector = state => state.state.streamIdDictionary
export const waterOpenersDictionarySelector = state => state.state.waterOpeners

const emptyCentroids = []
export const displayedCentroids = createSelector(
  [searchTextSelector, stateDataLoadingStatusSelector, streamCentroidsSelector],
  (searchText, stateDataLoadingStatus, streamCentroids) => {
    if (stateDataLoadingStatus !== LOADING_CONSTANTS.IS_SUCCESS) {
      return emptyCentroids
    }

    if (isEmpty(searchText)) {
      return streamCentroids
    }

    let tokens = searchText.toLocaleLowerCase()
      .split(' ')
      .filter(x => x.length > 0)

    let filteredCentroids = streamCentroids.filter(centroid => {
      let { name, altName } = centroid
      let isMatch = every(tokens, token => {
        return name.toLocaleLowerCase()
          .indexOf(token) >= 0 ||
          altName.toLocaleLowerCase()
          .indexOf(token) >= 0
      })
      return isMatch
    })

    return filteredCentroids
  })

export const displayedCentroidDictionarySelector = createSelector(
  [displayedCentroids],
  (displayedCentroids) => {
    let dictionary = keyBy(displayedCentroids, x => x.gid)
    return dictionary
  })

export const displayedStreamCentroidDataSelector = createSelector(
  [selectedStreamIdSelector, slugDictionarySelector, stateDataLoadingStatusSelector],
  (selectedStreamId, slugDictionary, stateDataLoadingStatus) => {
    if (stateDataLoadingStatus !== LOADING_CONSTANTS.IS_SUCCESS) {
      return null
    }

    if (has(slugDictionary, selectedStreamId)) {
      return slugDictionary[selectedStreamId]
    }

    console.log('cannot find stream')
    return null
  })

export const displayedStreamTitleSelector = createSelector(
  [displayedStreamCentroidDataSelector, stateDataLoadingStatusSelector],
  (displayedStreamCentroid, stateDataLoadingStatus) => {
    if (stateDataLoadingStatus !== LOADING_CONSTANTS.IS_SUCCESS) {
      return null
    }

    if (isEmpty(displayedStreamCentroid)) {
      return null
    }

    return displayedStreamCentroid.name
  })

export const displayedStreamCentroidSelector = createSelector(
  [displayedStreamCentroidDataSelector, stateDataLoadingStatusSelector],
  (displayedStreamCentroid, stateDataLoadingStatus) => {
    if (stateDataLoadingStatus !== LOADING_CONSTANTS.IS_SUCCESS) {
      return null
    }

    if (isEmpty(displayedStreamCentroid)) {
      return null
    }

    return displayedStreamCentroid.centroid
  })