/* eslint max-len: 0 */
import React, { PropTypes } from 'react'
import classes from './SvgBubble.scss'
import * as d3 from 'd3-geo'
import { concat, sortBy } from 'lodash'
import StreamComponent from './stream/Stream.component'
import { getProjectionFromFeature, getTiming } from './SvgBubble.selectors'
import RingComponent from './ring/Ring.component'
import RingWaypointAccessPointComponent from './waypoint/RingWaypoint.component.accessPoint'
import RingWaypointStreamComponent from './waypoint/RingWaypoint.component.stream'

const DIMENSIONS = 500
const SQUISH_FACTOR = 0.95
const ROTATE_PHASE = Math.PI / 2
const RADIUS = 160

const SvgBubbleComponent = React.createClass({
  propTypes: {
    streamPackage: React.PropTypes.shape({
      stream: PropTypes.object.isRequired,
      sections: PropTypes.array.isRequired,
      restrictions: PropTypes.array.isRequired,
      palSections: PropTypes.array.isRequired,
      accessPoints: PropTypes.array.isRequired,
      tributaries: PropTypes.array.isRequired,
      circle: PropTypes.object.isRequired
    }).isRequired,
    index: PropTypes.number.isRequired
  },

  componentWillMount () {
    this.width = DIMENSIONS
    this.height = DIMENSIONS

    this.projection = getProjectionFromFeature(this.props.streamPackage.circle,
        { width: DIMENSIONS, height: DIMENSIONS, radius: RADIUS })

    this.pathGenerator = d3.geoPath()
      .projection(this.projection)
      .pointRadius(1)

    this.layout = {
      width: this.width,
      height: this.height,
      radius: RADIUS,
      arcCompressionRatio: SQUISH_FACTOR,
      rotatePhase: ROTATE_PHASE
    }

    this.timing = getTiming(this.props)
  },

  renderWaypoints () {
    let { accessPoints, tributaries } = this.props.streamPackage
    let waypoints = sortBy(concat(accessPoints, tributaries), 'properties.linear_offset')

    return waypoints.map((waypoint, index) => {
      let isAccessPoint = waypoint.properties.street_name != null
      return isAccessPoint
        ? this.renderAccessPoint(waypoint, index)
        : this.renderTributary(waypoint, index)
    })
  },

  renderOuterCircleAxis () {
    return <RingComponent
      timing={this.timing}
      streamPackage={this.props.streamPackage}
      pathGenerator={this.pathGenerator}
      index={this.props.index}
      layout={this.layout} />
  },

  renderAccessPoints () {
    return this.props.streamPackage.accessPoints.map(this.renderAccessPoint)
  },

  renderAccessPoint (accessPoint, accessPointsIndex) {
    return <RingWaypointAccessPointComponent
      accessPoint={accessPoint}
      key={accessPoint.properties.gid}
      timing={this.timing}
      projection={this.projection}
      layout={this.layout} />
  },

  renderTributaries () {
    return this.props.streamPackage.tributaries.map(this.renderTributary)
  },

  renderTributary (tributary, tributaryIndex) {
    return <RingWaypointStreamComponent
      stream={tributary}
      key={tributary.properties.gid}
      timing={this.timing}
      projection={this.projection}
      pathGenerator={this.pathGenerator}
      layout={this.layout} />
  },

  render () {
    let name = this.props.streamPackage.stream.properties.name
    let id = this.props.streamPackage.stream.properties.gid
    return (
      <div className={classes.container}>
        <svg
          viewBox={`0 0 ${this.width} ${this.height}`}
          preserveAspectRatio='xMinYMin meet'
          version='1.1'
          xmlns='http://www.w3.org/2000/svg'
          id={'trout_stream_' + name + '_' + id} >
          <title>{name} {id}</title>
          <defs>
            <clipPath id='circle-stencil'>
              <circle cx={this.width / 2} cy={this.height / 2} r={RADIUS - 3} />
            </clipPath>
            <symbol
              id='mn-highway'>
              <g className='mnHighway'>
                <path className='background' d='M1.5,0.9h8.4c0.3,0,0.6,0.3,0.6,0.6v8.4c0,0.3-0.3,0.6-0.6,0.6H1.5c-0.3,0-0.6-0.3-0.6-0.6
                  V1.5C0.9,1.2,1.2,0.9,1.5,0.9z' />
                <path className='state' d='M1.1,1.3L1.1,1.3L1.1,1.3L1.1,1.3l0,0.1v0l0,0l0,0.1l0,0l0,0l0,0.1l0,0l0,0.1l0,0v0.1V2l0,0v0
                  v0.1l0,0l0,0l0,0l0,0l0,0v0l0,0v0l0,0v0l0,0l0,0v0v0v0l0,0l0,0l0,0l0,0v0l0,0v0v0.6h1.3v0V3l0,0l0,0l0,0l0,0h0l0,0l0,0l0,0l0,0l0,0
                  l0,0l0,0h0l0,0l0,0l0,0l0,0h0l0,0h0h0h0l0,0l0,0l0,0l0,0v0v0V2.6v0l0,0v0l0,0v0v0v0l0,0l0,0v0l0,0v0l0,0l0,0v0l0,0l0.1,0v0l0,0V2.1
                  l0,0l0.1-0.1l0.1-0.1l0,0l0,0l0,0l0,0l0.1,0h0l0.1,0h0l0.1-0.1h0h0h0h0h0h0l0,0l0,0H2.6h0l0,0l0,0h0l0,0h0l0,0l0,0h0l0,0l0,0h0h0
                  l0,0l0,0v0l0,0v0l0,0l0,0l0,0l0,0h0v0h0h0l0,0h0v0v0h0h0v0l0,0v0l0,0h0v0v0v0l-0.1,0h0h0h0l0,0h0l0,0l0,0v0h0l0,0h0l0,0v0l0,0v0l0,0
                  h0l-0.1,0h0v0h0h0h0h0h0h0l0,0l0,0v0l0-0.2c0,0,0,0,0,0c0,0,0,0,0,0l0,0h0v0.1L1.1,1.3z' />
                <path className='backdrop' d='M1.1,3.3h9.2c0,0,0,4.5,0,6.6c0,0.2-0.2,0.4-0.4,0.4H1.5c-0.2,0-0.4-0.2-0.4-0.4
                  C1.1,9.9,1.1,3.3,1.1,3.3L1.1,3.3z' />
                <g className='minnesota' transform='translate(6.4257813e-7,-0.66808414)'>
                  <path id='path3776' d='M3.8,3.4V2.7L3.6,3.4L3.4,2.7v0.7H3.2V2.2h0.2l0.2,0.7l0.2-0.7H4v1.2H3.8' />
                  <path id='path3778' d='M4.2,3.4V2.2h0.2v1.2H4.2' />
                  <path id='path3780' d='M5.1,3.4L4.8,2.6v0.8H4.6V2.2h0.2l0.3,0.7V2.2h0.2v1.2H5.1' />
                  <path id='path3782' d='M6,3.4L5.7,2.6v0.8H5.5V2.2h0.2L6,2.9V2.2h0.2v1.2H6' />
                  <path id='path3784' d='M6.4,3.4V2.2H7v0.2H6.6v0.3h0.2v0.2H6.6v0.4H7v0.2H6.4' />
                  <path id='path3786' d='M7.8,3.1c0,0,0,0.1,0,0.1c0,0,0,0.1-0.1,0.1c0,0-0.1,0.1-0.1,0.1c0,0-0.1,0-0.1,0
                    c-0.1,0-0.1,0-0.1,0c0,0-0.1,0-0.1-0.1c0,0-0.1-0.1-0.1-0.1c0,0,0-0.1,0-0.1h0.2c0,0,0,0,0,0.1c0,0,0,0,0,0.1c0,0,0,0,0.1,0
                    c0,0,0,0,0.1,0c0,0,0,0,0.1,0c0,0,0,0,0.1,0c0,0,0,0,0-0.1c0,0,0,0,0-0.1c0,0,0-0.1,0-0.1c0,0,0-0.1-0.1-0.1c0,0,0,0,0,0
                    c0,0,0,0,0,0c0,0,0,0-0.1,0c0,0-0.1,0-0.1-0.1c0,0-0.1-0.1-0.1-0.1c0,0,0-0.1,0-0.1c0,0,0-0.1,0-0.1c0,0,0-0.1,0.1-0.1
                    c0,0,0.1-0.1,0.1-0.1c0,0,0.1,0,0.1,0c0,0,0.1,0,0.1,0c0,0,0.1,0,0.1,0.1c0,0,0,0.1,0.1,0.1c0,0,0,0.1,0,0.1H7.6c0,0,0-0.1,0-0.1
                    c0,0-0.1,0-0.1,0c0,0-0.1,0-0.1,0c0,0,0,0.1,0,0.1c0,0,0,0.1,0,0.1c0,0,0,0,0.1,0.1c0.1,0.1,0.2,0.1,0.3,0.2C7.8,2.9,7.8,3,7.8,3.1
                    ' />
                  <path id='path3788' d='M8.6,2.8c0,0.1,0,0.2,0,0.2c0,0.1,0,0.1-0.1,0.2c0,0.1-0.1,0.1-0.1,0.2c0,0-0.1,0-0.2,0
                    c-0.1,0-0.1,0-0.2,0c0,0-0.1-0.1-0.1-0.2c0-0.1,0-0.1-0.1-0.2c0-0.1,0-0.1,0-0.2c0-0.1,0-0.2,0-0.2c0-0.1,0-0.1,0.1-0.2
                    c0-0.1,0.1-0.1,0.1-0.2c0,0,0.1,0,0.2,0c0.1,0,0.1,0,0.2,0c0,0,0.1,0.1,0.1,0.2c0,0,0,0.1,0,0.1c0,0,0,0.1,0,0.1c0,0,0,0.1,0,0.1
                    C8.6,2.7,8.6,2.8,8.6,2.8 M8.5,2.8C8.5,2.8,8.5,2.7,8.5,2.8c0-0.1,0-0.1,0-0.2c0,0,0,0,0-0.1c0,0,0,0,0-0.1c0-0.1,0-0.1-0.1-0.1
                    c0,0-0.1,0-0.1,0c-0.1,0-0.1,0-0.2,0.1c0,0,0,0.1,0,0.1c0,0,0,0.1,0,0.2c0,0,0,0.1,0,0.1c0,0,0,0.1,0,0.1c0,0,0,0,0,0.1
                    c0,0,0,0,0,0.1c0,0.1,0.1,0.1,0.2,0.1c0,0,0.1,0,0.1,0c0,0,0-0.1,0.1-0.1c0,0,0,0,0-0.1c0,0,0,0,0-0.1C8.5,3,8.5,2.9,8.5,2.8
                    C8.5,2.9,8.5,2.8,8.5,2.8' />
                  <path id='path3790' d='M9.1,2.4v1H9v-1H8.7V2.2h0.6v0.2H9.1' />
                  <path id='path3792' d='M10,3.4L9.9,3.1H9.6L9.6,3.4H9.4l0.3-1.2h0.2l0.3,1.2H10 M9.8,2.6L9.7,2.9h0.2L9.8,2.6' />
                </g>
                <g className='roadNumber'>
                  <path id='path4089' d='M5.3,7.3c0,0.2,0,0.4-0.1,0.6C5.1,8.1,5,8.3,4.8,8.4C4.7,8.6,4.5,8.7,4.3,8.7
                    C4.1,8.8,3.8,8.9,3.6,8.9c-0.2,0-0.3,0-0.5-0.1c-0.2,0-0.3-0.1-0.5-0.2l0.3-0.6c0.1,0,0.2,0.1,0.3,0.1c0.1,0,0.3,0,0.4,0
                    c0.1,0,0.3,0,0.4-0.1C4.2,8.1,4.3,8,4.4,8c0.1-0.1,0.2-0.2,0.2-0.3c0.1-0.1,0.1-0.2,0.1-0.4c0-0.1,0-0.2-0.1-0.3
                    c0-0.1-0.1-0.2-0.2-0.2C4.4,6.8,4.3,6.7,4.3,6.7C4.2,6.6,4.1,6.6,4,6.6c-0.1,0-0.1,0-0.2,0c-0.1,0-0.1,0-0.1,0.1
                    c0,0-0.1,0.1-0.1,0.1C3.5,6.9,3.4,7,3.3,7L2.7,6.9l0.1-2.1h2.3v0.6H3.4l0,0.7C3.5,6,3.6,6,3.7,6C3.8,6,3.9,6,4,6
                    c0.2,0,0.4,0,0.5,0.1c0.2,0.1,0.3,0.2,0.4,0.3c0.1,0.1,0.2,0.3,0.3,0.4C5.3,7,5.3,7.1,5.3,7.3' />
                  <path id='path4091' d='M8.8,7.3c0,0.2,0,0.4-0.1,0.6C8.6,8.1,8.5,8.3,8.3,8.4C8.2,8.6,8,8.7,7.8,8.7
                    C7.6,8.8,7.3,8.9,7.1,8.9c-0.2,0-0.3,0-0.5-0.1c-0.2,0-0.3-0.1-0.5-0.2l0.3-0.6c0.1,0,0.2,0.1,0.3,0.1c0.1,0,0.3,0,0.4,0
                    c0.1,0,0.3,0,0.4-0.1C7.7,8.1,7.8,8,7.9,8C8,7.9,8.1,7.8,8.1,7.7c0.1-0.1,0.1-0.2,0.1-0.4c0-0.1,0-0.2-0.1-0.3C8.1,7,8,6.9,8,6.8
                    C7.9,6.8,7.8,6.7,7.8,6.7c-0.1,0-0.2-0.1-0.3-0.1c-0.1,0-0.1,0-0.2,0c-0.1,0-0.1,0-0.1,0.1c0,0-0.1,0.1-0.1,0.1
                    C6.9,6.9,6.9,7,6.8,7L6.2,6.9l0.1-2.1h2.3v0.6H6.9l0,0.7C7,6,7.1,6,7.2,6c0.1,0,0.2,0,0.3,0C7.7,6,7.8,6,8,6.1
                    c0.2,0.1,0.3,0.2,0.4,0.3c0.1,0.1,0.2,0.3,0.3,0.4C8.8,7,8.8,7.1,8.8,7.3' />
                </g>
              </g>
            </symbol>
            <symbol id='us-interstate'>
              <g className='usInterstate' id='g1600'>
                <g id='g1600' transform='matrix(0.9983361,0,0,0.9983377,0.4991681,0.4986859)'>
                  <path id='path1604' fill='#FFFFFF' stroke='#010101' strokeWidth='1.734374e-02' strokeLinecap='round' strokeLinejoin='round' d='
                  M1.7,0.3C2.3,0.5,3,0.6,3.6,0.6c0.7,0,1.3-0.1,1.9-0.3c0.6,0.2,1.2,0.3,1.9,0.3s1.3-0.1,1.9-0.3c0.9,1.1,1.4,2.5,1.4,4
                  c0,3.2-2.2,5.8-5.2,6.4c-3-0.6-5.2-3.2-5.2-6.4C0.3,2.8,0.8,1.4,1.7,0.3z' />
                </g>
                <g id='g1606' transform='matrix(1.0070935,0,0,1.0102847,-2.1280324,-3.66885)'>
                  <path id='path1608' fill='#1E4384' d='M3.1,8.4c0-0.6,0.1-1.1,0.2-1.6h9.5C13,7.3,13,7.8,13,8.4c0,3-2.1,5.5-5,6.1
                    C5.3,13.9,3.1,11.4,3.1,8.4z' />
                </g>
                <g id='g1610' transform='matrix(1.0125461,0,0,1.0271486,-3.7638021,-3.1017482)'>
                  <path id='path1612' fill='#AF1F2D' d='M5,5.9c0.2-0.7,0.5-1.3,1-1.9c0.6,0.2,1.2,0.2,1.8,0.2c0.7,0,1.3-0.1,1.9-0.3
                    c0.6,0.2,1.2,0.3,1.9,0.3c0.6,0,1.2-0.1,1.8-0.2c0.4,0.6,0.7,1.2,1,1.9H5L5,5.9z' />
                </g>
              </g>
            </symbol>
            <symbol id='us-highway'>
              <g className='usHighway'>
                <path d='M6,0c0.5,0.4,1.1,0.7,1.8,0.7S9.1,0.4,9.6,0L12,2.4c-0.4,0.6-0.7,1.4-0.7,2.2c0,0.6,0.1,1.1,0.4,1.6
                  C11.9,6.7,12,7.1,12,7.7c0,1.8-1.5,3.3-3.3,3.3H8.2c-0.9,0-1.7,0.4-2.2,1c-0.5-0.6-1.3-1-2.2-1H3.3C1.5,11,0,9.5,0,7.7
                  c0-0.5,0.1-1,0.3-1.4c0.2-0.5,0.4-1.1,0.4-1.6C0.7,3.8,0.4,3,0,2.4L2.4,0c0.5,0.4,1.1,0.7,1.8,0.7C4.9,0.7,5.5,0.4,6,0z' />
              </g>
            </symbol>
            <symbol id='mn-county'>
              <g className='mnCounty'>
                <path id='rect4130_1_' d='M1.4,0.8h9.3c0.3,0,0.5,0.2,0.5,0.5v9.3c0,0.3-0.2,0.5-0.5,0.5H1.4
    c-0.3,0-0.5-0.2-0.5-0.5V1.3C0.9,1.1,1.1,0.8,1.4,0.8z' />
              </g>
            </symbol>
            <symbol id='externalLink'>
              <g className='externalLink'>
                <path d='M10.1,1.5l0.5,0.5l-5,5L5.1,6.5L10.1,1.5z' />
                <g className='externalLink_arrow'>
                  <path d='M10.6,4.7H10V2H7.3V1.4h3.3V4.7z' />
                  <path d='M9,10.7H2.3c-0.6,0-1-0.4-1-1V3c0-0.6,0.4-1,1-1H6v0.7H2.3C2.1,2.7,2,2.8,2,3v6.7C2,9.9,2.1,10,2.3,10H9
                    c0.2,0,0.3-0.1,0.3-0.3V6H10v3.7C10,10.3,9.5,10.7,9,10.7z' />
                </g>
              </g>
            </symbol>
            <symbol id='railroad'>
              <g className='railroad'>
                <path id='path3435' className='railroad_highlight' d='M2.5,2.4c2-2,5.2-2,7.1,0c2,2,2,5.2,0,7.1c-2,2-5.2,2-7.1,0
                  C0.5,7.5,0.5,4.3,2.5,2.4' />
                <path id='path3443' className='railroad_border' d='M2.6,2.5c1.9-1.9,5-1.9,7,0c1.9,1.9,1.9,5,0,7
                  c-1.9,1.9-5,1.9-7,0C0.7,7.5,0.7,4.4,2.6,2.5' />
                <path id='path3447' className='railroad_highlight' d='M2.3,2.9c-1.4,1.7-1.4,4.3,0,6l3-3L2.3,2.9z' />
                <path id='path3451' className='railroad_highlight' d='M3.1,2.2c1.7-1.4,4.3-1.4,6,0l-3,3L3.1,2.2z' />
                <path id='path3455' className='railroad_highlight' d='M9.1,9.7c-1.7,1.4-4.3,1.4-6,0l3-3L9.1,9.7z' />
                <path id='path3459' className='railroad_highlight' d='M9.8,8.9c1.4-1.7,1.4-4.3,0-6l-3,3L9.8,8.9z' />
                <path id='path3463' className='railroad_border' d='M3.5,5.5c0,0.1-0.1,0.2-0.3,0.2H2.7V5.3h0.6
                  C3.4,5.3,3.5,5.4,3.5,5.5 M3.9,6.9L3.5,6.1C3.7,6,3.9,5.8,3.9,5.5c0-0.2-0.1-0.4-0.3-0.5C3.5,5,3.4,4.9,3.2,4.9H2.3v2h0.4V6.2h0.5
                  l0.3,0.8C3.5,6.9,3.9,6.9,3.9,6.9z' />
                <path id='path3467' className='railroad_border' d='M9.7,5.5c0,0.1-0.1,0.2-0.3,0.2H8.8V5.3h0.6
                  C9.6,5.3,9.7,5.4,9.7,5.5 M10.1,6.9L9.7,6.1C9.9,6,10,5.8,10,5.5C10,5.3,9.9,5.1,9.7,5C9.6,5,9.5,4.9,9.4,4.9H8.5v2h0.4V6.2h0.5
                  l0.3,0.8C9.7,6.9,10.1,6.9,10.1,6.9z' />
              </g>
            </symbol>
          </defs>
          <g id='stream' clipPath='url(#circle-stencil)'>
            <StreamComponent
              streamPackage={this.props.streamPackage}
              pathGenerator={this.pathGenerator}
              projection={this.projection}
              timing={getTiming(this.props)}
              index={this.props.index}
              layout={this.layout} />
          </g>
          {this.renderOuterCircleAxis()}
          <g id={'waypoints_' + id}>
            {this.renderWaypoints()}
          </g>
          }
        </svg>
      </div>
    )
  }
})

export default SvgBubbleComponent
