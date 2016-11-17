import { createSelector } from 'reselect'
import { isSearchVisibleSelector } from '../search/Search.selectors'
import { isRootPageSelector } from 'ui/Location.selectors'
import { selectedStateSelector, selectedRegionSelector } from 'ui/core/Core.selectors'
import { toUpper, isEmpty } from 'lodash'
export const isTitleVisibleSelector = createSelector([isSearchVisibleSelector], (isSearchVisible) => {
  return !isSearchVisibleSelector
})

const PLACEHOLDER_TITLE = ''
const SELECT_REGION = 'Select Region'
export const subtitleSelector = createSelector(
  [isRootPageSelector, selectedRegionSelector, selectedStateSelector],
  (isRootPage, selectedRegion, selectedState) => {
    if (isRootPage) {
      return SELECT_REGION
    }
    let isOnlyStateSelected = selectedState != null && selectedRegion == null
    if (isOnlyStateSelected) {
      let state = selectedState.properties.name
      return `${state}`
    }

    let isBothStateAndRegionSelected = !isEmpty(selectedState) && !isEmpty(selectedRegion)
    if (isBothStateAndRegionSelected) {
      let state = toUpper(selectedState.properties.short_name)
      let region = selectedRegion.properties.long_name
      return `${state}, ${region}`
    }

    return PLACEHOLDER_TITLE
  })
