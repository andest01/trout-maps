import React, { PropTypes } from 'react'
import classes from './Map.scss'
import MapboxGlContainer from './MapboxGlMap/MapboxGl.container'
import { LOADING_CONSTANTS } from 'ui/core/LoadingConstants'

const MAP_ID = 'primary_map_id'
const MapComponent = React.createClass({
  propTypes: {
    mapboxModule: PropTypes.object,
    mapboxModuleStatus: PropTypes.string.isRequired,
    isVisible: PropTypes.bool.isRequired,

    loadMapModuleAsync: PropTypes.func.isRequired
  },

  componentDidMount () {
    console.log('MAP CONTAINER MOUNTED')
  },

  componentWillUnmount () {
    if (this.state == null) {
      return
    }

    if (this.state.mapboxGl) {
      this.state.mapboxGl = null
    }
  },

  componentWillReceiveProps (nextProps) {
    let previousModuleLoadStatus = this.props.mapboxModuleStatus
    let currentlyVisible = nextProps.isVisible

    let isVisibleAndNeedsLoad = currentlyVisible && previousModuleLoadStatus === LOADING_CONSTANTS.IS_NOT_STARTED

    if (isVisibleAndNeedsLoad) {
      this.props.loadMapModuleAsync()
      return
    }
  },

  renderMap () {
    return (<MapboxGlContainer
      mapbox={this.props.mapboxModule}
      elementId={MAP_ID} />)
  },

  renderLoading () {
    return (<div>loading...</div>)
  },

  render () {
    let isMapLoaded = this.props.mapboxModuleStatus === LOADING_CONSTANTS.IS_SUCCESS
    return (<div className={this.props.isVisible ? classes.mapContainer : classes.invisible}>
      <div id={MAP_ID} className={classes.map} />
      {isMapLoaded && this.renderMap()}
      {isMapLoaded === false && this.renderLoading()}
    </div>)
  }
})

// <Link to='/mn/superior/123'>Go To superior map with stream 123</Link>
export default MapComponent

// function loadMapAsync () {
//   return new Promise((resolve, reject) => {
//     try {
//       require.ensure([], require => {
//         const key = 'pk.eyJ1IjoiYW5kZXN0MDEiLCJhIjoibW02QnJLSSJ9._I2ruvGf4OGDxlZBU2m3KQ'
//         let mapboxGl = require('mapbox-gl/dist/mapbox-gl')
//         mapboxGl.accessToken = key
//         resolve({ mapboxGl })
//       }, 'map')
//     } catch (e) {
//     }
//   }) }
