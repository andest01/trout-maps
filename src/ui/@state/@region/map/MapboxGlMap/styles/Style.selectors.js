import { createSelector } from 'reselect'
// import * as regionSelectors from 'ui/@state/@region/Region.selectors'
import * as streamStyles from './Stream.style'
import * as troutSectionStyles from './TroutSection.style'
import * as palStyles from './Pal.style'
import * as satelliteStyles from './Satellite.style'
import * as restrictionSectionStyles from './RestrictionSection.style'
import * as palSectionStyles from './PalSection.style'
import * as accessPointStyles from './AccessPoint.style'

const UNDER_ROAD_PLACEHOLDER = 'UNDER-ROAD-PLACEHOLDER'
const UNDER_LABEL_PLACEHOLDER = 'UNDER-LABEL-PLACEHOLDER'

export const streamLayersSelector = createSelector(
  [],
  () => {
    let quietLayer = layerGeneratorBetter(streamStyles.StreamQuietStyle, UNDER_ROAD_PLACEHOLDER)
    let activeLayer = layerGeneratorBetter(streamStyles.StreamActiveStyle, UNDER_ROAD_PLACEHOLDER)
    return [quietLayer, activeLayer]
  })

export const troutSectionsLayersSelector = createSelector(
  [],
  () => {
    let quietLayer = layerGeneratorBetter(troutSectionStyles.TroutSectionActiveStyle, UNDER_ROAD_PLACEHOLDER)
    let activeLayer = layerGeneratorBetter(troutSectionStyles.TroutSectionQuietStyle, UNDER_ROAD_PLACEHOLDER)
    return [quietLayer, activeLayer]
  })

export const palLayersSelector = createSelector(
  [],
  () => {
    let activeLayer = layerGeneratorBetter(palStyles.PalStyle, UNDER_ROAD_PLACEHOLDER)
    return [activeLayer]
  })

export const satelliteLayersSelector = createSelector(
  [],
  () => {
    let activeLayer = layerGeneratorBetter(satelliteStyles.SatelliteStyle, UNDER_ROAD_PLACEHOLDER)
    return [activeLayer]
  })

export const restrictionSectionsLayersSelector = createSelector(
  [],
  () => {
    let activeLayer = layerGeneratorBetter(restrictionSectionStyles.RestrictionSectionActiveStyle, UNDER_ROAD_PLACEHOLDER)
    let quietLayer = layerGeneratorBetter(restrictionSectionStyles.RestrictionSectionQuietStyle, UNDER_ROAD_PLACEHOLDER)
    return [activeLayer, quietLayer]
  })

export const palSectionsLayersSelector = createSelector(
  [],
  () => {
    let activeLayer = layerGeneratorBetter(palSectionStyles.PalSectionActiveStyle, UNDER_ROAD_PLACEHOLDER)
    let quietLayer = layerGeneratorBetter(palSectionStyles.PalSectionQuietStyle, UNDER_ROAD_PLACEHOLDER)
    return [activeLayer, quietLayer]
  })

export const accessPointsLayerSelector = createSelector(
  [],
  () => {
    let labelActiveLayer = layerGeneratorBetter(accessPointStyles.AccessPointLabelActiveStyle, UNDER_LABEL_PLACEHOLDER)
    let labelQuietLayer = layerGeneratorBetter(accessPointStyles.AccessPointLabelQuietStyle, UNDER_LABEL_PLACEHOLDER)
    let borderActiveLayer = layerGeneratorBetter(accessPointStyles.AccessPointMarkerBorderActiveStyle, UNDER_LABEL_PLACEHOLDER)
    let borderQuietLayer = layerGeneratorBetter(accessPointStyles.AccessPointMarkerBorderQuietStyle, UNDER_LABEL_PLACEHOLDER)
    let centerActiveLayer = layerGeneratorBetter(accessPointStyles.AccessPointMarkerCenterActiveStyle, UNDER_LABEL_PLACEHOLDER)
    let centerQuietLayer = layerGeneratorBetter(accessPointStyles.AccessPointMarkerCenterQuietStyle, UNDER_LABEL_PLACEHOLDER)
    let labelLetterActiveLayer = layerGeneratorBetter(accessPointStyles.AccessPointLetterLabelActiveStyle, UNDER_LABEL_PLACEHOLDER)
    let labelletterQuietLayer = layerGeneratorBetter(accessPointStyles.AccessPointLabelLetterQuietStyle, UNDER_LABEL_PLACEHOLDER)

    return [
      borderActiveLayer,
      borderQuietLayer,
      centerActiveLayer,
      centerQuietLayer,
      labelActiveLayer,
      labelQuietLayer,
      labelLetterActiveLayer,
      labelletterQuietLayer

    ]
  })

const layerGeneratorBetter = (layerDefinition, insertBefore, isInteractive = true) => {
  let { source, id } = layerDefinition
  let layer = layerGenerator(id, source, insertBefore, layerDefinition, isInteractive)
  return layer
}

const layerGenerator = (layerId, sourceId, insertBefore, layerDefinition, isInteractive = true) => {
  return {
    layerId,
    sourceId,
    insertBefore,
    layerDefinition,
    isInteractive
  }
}

export const layersSelector = createSelector(
  [
    streamLayersSelector,
    troutSectionsLayersSelector,
    palLayersSelector,
    restrictionSectionsLayersSelector,
    palSectionsLayersSelector,
    accessPointsLayerSelector
  ],
  (
    streamLayers,
    troutSectionsLayers,
    palLayers,
    restrictionSectionsLayers,
    palSectionsLayers,
    accessPointsLayers
  ) => {
    let layers = [].concat(
      palLayers,
      streamLayers,
      troutSectionsLayers,
      restrictionSectionsLayers,
      palSectionsLayers,
      accessPointsLayers
    )
    return layers
  })
