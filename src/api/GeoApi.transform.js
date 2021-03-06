/* eslint-disable camelcase */
const groupBy = require('lodash/groupBy')
const keyBy = require('lodash/keyBy')
const valuesIn = require('lodash/valuesIn')
const has = require('lodash/has')
const kebabCase = require('lodash/kebabCase')
const topojson = require('topojson-client')
// import * as topojson from 'topojson-client'
// import { groupBy, keyBy, valuesIn, has, kebabCase } from 'lodash'
const MINIMUM_LENGTH_MILES = 0.05
const transformGeo = (topojsonObject, stateData) => {
  var geoJsonObjects = decompress(topojsonObject, stateData)
  var dictionaries = createStreamDictionaries(geoJsonObjects)
  var streamDictionary = createStreamDictionary(geoJsonObjects, dictionaries)
    // update with tributaries.
  valuesIn(streamDictionary).forEach(stream => {
    var streamId = stream.stream.properties.gid
    var tribs = dictionaries.tributaries[streamId]
    stream.tributaries = tribs == null
      ? []
      : dictionaries.tributaries[streamId].filter(t => {
        return has(streamDictionary, t.properties.tributary_gid)
      }).map(t => {
        var tributaryId = t.properties.tributary_gid
        return Object.assign(
          t,
          {
            properties: Object.assign(
              t.properties,
              { streamData: streamDictionary[tributaryId] }
            )
          }
        )
      })
  })
  var t = Object.assign(
    { streamDictionary: streamDictionary },
    geoJsonObjects
  )
  return t
}

const createStreamDictionaries = (geoJsonObjects) => {
  var sectionsMap = groupBy(geoJsonObjects.trout_stream_section.features, 'properties.stream_gid')
  var restrictionsMap = groupBy(geoJsonObjects.restriction_section.features, 'properties.stream_gid')
  var palMap = groupBy(geoJsonObjects.pal_routes.features, 'properties.stream_gid')
  var accessMap = groupBy(geoJsonObjects.stream_access_point.features, 'properties.stream_gid')
  var tributaries = groupBy(geoJsonObjects.tributary.features
      .filter(x => x.properties.linear_offset > 0.0001 && x.properties.linear_offset < 0.999),
       'properties.stream_gid')

  var tempCircleDictionary = keyBy(geoJsonObjects.boundingCircle.features, 'properties.gid')

  return {
    sectionsMap,
    restrictionsMap,
    palMap,
    accessMap,
    tributaries,
    tempCircleDictionary
  }
}

// this
// const SIMPLIFICATION_TOLERANCE_IN_DEGREES = 0.0009
// const IS_HIGH_QUALITY = false
const createStreamDictionary = (geoJsonObjects, dictionaries) => {
  var sectionsMap = dictionaries.sectionsMap
  var restrictionsMap = dictionaries.restrictionsMap
  var palMap = dictionaries.palMap
  var accessMap = dictionaries.accessMap
  var tempCircleDictionary = dictionaries.tempCircleDictionary
  // var {
  //   sectionsMap,
  //   restrictionsMap,
  //   palMap,
  //   accessMap,
  //   tempCircleDictionary
  // } = dictionaries

  var streamDictionary = geoJsonObjects.streamProperties.features
    .reduce((dictionary, currentItem, index) => {
      var streamId = currentItem.properties.gid
      dictionary[streamId] = {}
      var entry = dictionary[streamId]
      entry.stream = currentItem

      entry.sections = sectionsMap[streamId]
        // .sort((a, b) => b.properties.start - a.properties.start)

      entry.restrictions = restrictionsMap[streamId] == null
        ? []
        : restrictionsMap[streamId]

      entry.palSections = palMap[streamId] == null
        ? []
        : palMap[streamId].sort((a, b) => b.properties.start - a.properties.start)

      entry.accessPoints = accessMap[streamId] == null
        ? []
        : accessMap[streamId]
          .sort((a, b) => b.properties.linear_offset - a.properties.linear_offset)

      entry.accessPoints = addLettersToCrossings(entry.accessPoints)
      entry.circle = tempCircleDictionary[streamId]

      return dictionary
    }, {})

  return streamDictionary
}

const decompress = (topojsonObject, stateData) => {
  var bounds = topojson.feature(topojsonObject, topojsonObject.objects.boundingCircle)
  var dictionary = {
    trout_stream_section: topojson.feature(topojsonObject, topojsonObject.objects.troutSection),
    restriction_section: topojson.feature(topojsonObject, topojsonObject.objects.restrictionSection),
    streamProperties: topojson.feature(topojsonObject, topojsonObject.objects.stream),
    pal_routes: topojson.feature(topojsonObject, topojsonObject.objects.palSection),
    pal: topojson.feature(topojsonObject, topojsonObject.objects.pal),
    boundingCircle: bounds
  }

  // time to update our objects to be more useful upstream!
  var regsDictionary = stateData.regulationsDictionary
  var watersDictionary = stateData.waterOpeners

  dictionary.restriction_section.features.forEach(feature => {
    var props = feature.properties
    if (props.start_time != null) {
      props.start_time = new Date(props.start_time)
    }

    if (props.end_time != null) {
      props.end_time = new Date(props.end_time)
    }

    // add the restriction
    props.restriction = regsDictionary[props.restriction_id]
  })

  // update waters
  dictionary.streamProperties.features.forEach(feature => {
    var props = feature.properties
    props.openers = watersDictionary[props.water_id].openers
    // let openers = watersDictionary[props.water_id]
  })

  // TODO: HACK. for some reason mapshaper and topojson aren't working for me.
  // MANUALLY turn this into a geojson point feature collection.
  updateRoadCrossingProperties(topojsonObject.objects.accessPoint.geometries, stateData.roadTypesDictionary)

  topojsonObject.objects.accessPoint.geometries = topojsonObject.objects.accessPoint.geometries
    .filter(filterBadAccessPoints)
  dictionary.stream_access_point = {
    features: topojsonObject.objects.accessPoint.geometries
      .map((x, index) => {
        return {
          geometry: {
            type: 'Point',
            coordinates: x.coordinates
          },
          id: x.id,
          properties: x.properties,
          type: 'Feature'
        }
      }),
    type: 'FeatureCollection'
  }

  dictionary.tributary = {
    features: topojsonObject.objects.tributary.geometries.map(x => {
      return {
        geometry: {
          type: 'Point',
          coordinates: x.coordinates
        },
        id: x.id,
        properties: x.properties,
        type: 'Feature'
      }
    }),
    type: 'FeatureCollection'
  }

  //  topojson.feature(topojsonObject, topojsonObject.objects.accessPoint)
  return dictionary
}

const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('')
const alphabetLength = alphabet.length
const crossingTypes = {
  publicTrout: 'publicTrout',
  permissionRequired: 'permissionRequired',
  unsafe: 'unsafe',
  uninteresting: 'uninteresting'
}

const addLettersToCrossings = (roadCrossings) => {
  var interestingRoadCrossings = roadCrossings.filter(rc => rc.properties.bridgeType !== crossingTypes.uninteresting)

  interestingRoadCrossings.forEach((feature, index) => {
    feature.properties.alphabetLetter = alphabet[index % alphabetLength]
  })
  return roadCrossings
}

const updateRoadCrossingProperties = (apFeatures, roadTypesDictionary) => {
  apFeatures.forEach((feature, index) => {
    var properties = feature.properties
    // get rid of this 0 vs 1 nonsense
    properties.is_over_publicly_accessible_land = properties.is_over_publicly_accessible_land === 1
    properties.is_over_trout_stream = properties.is_over_trout_stream === 1
    properties.is_previous_neighbor_same_road = properties.is_previous_neighbor_same_road === 1
    var roadTypeId = properties.road_type_id
    var roadType = roadTypesDictionary[roadTypeId]
    var isParkable = roadType.isParkable
    properties.isParkable = isParkable
    properties.bridgeType = determineBridgeType(properties, roadTypesDictionary)
    properties.alphabetLetter = ' '
    properties.slug = `${kebabCase(properties.street_name)}@${properties.linear_offset}`
  })
  return apFeatures
}

const determineBridgeType = (bridgeProperties, roadTypesDictionary) => {
  var is_over_publicly_accessible_land = bridgeProperties.is_over_publicly_accessible_land
  var is_over_trout_stream = bridgeProperties.is_over_trout_stream
  var isParkable = bridgeProperties.isParkable
  if (is_over_trout_stream === false) {
    return crossingTypes.uninteresting
  }

  if (isParkable === false) {
    return crossingTypes.unsafe
  }

  if (is_over_publicly_accessible_land === false) {
    return crossingTypes.permissionRequired
  }

  return crossingTypes.publicTrout
}

const filterBadAccessPoints = (ap) => {
  if (ap.properties.gid === 2678) {
  }
  var isUninteresting = ap.properties.bridgeType === crossingTypes.uninteresting
  if (isUninteresting) {
    return false
  }

  var isTooClose = ap.properties.is_previous_neighbor_same_road && ap.properties.distance_to_previous_neighbor < MINIMUM_LENGTH_MILES
  if (isTooClose) {
    return false
  }

  return true
}

module.exports = {
  transformGeo: transformGeo,
  crossingTypes: crossingTypes,
  decompress: decompress,
  createStreamDictionaries: createStreamDictionaries
}
