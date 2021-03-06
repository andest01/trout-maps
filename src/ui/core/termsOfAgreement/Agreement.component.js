import React, { PropTypes } from 'react'
import classes from './TermsOfAgreement.scss'
import TermsOfService from './TermsOfService.component'
import Intro from './Intro.component'
import PrivacyPolicy from './PrivacyPolicy.component'
import ThankYou from './ThankYou.component'

const AgreementComponent = React.createClass({
  propTypes: {
    agreeToTerms: PropTypes.func.isRequired,
    advanceIntro: PropTypes.func.isRequired,
    advanceTermsOfService: PropTypes.func.isRequired,
    advanceToApp: PropTypes.func.isRequired,
    hasAgreedToTerms: PropTypes.bool.isRequired,
    hasSeenIntroScreen: PropTypes.bool.isRequired,
    hasSeenTermsOfService: PropTypes.bool.isRequired,
    hasSeenPrivacyPolicy: PropTypes.bool.isRequired
  },

  getProgress () {
    let { hasSeenIntroScreen, hasSeenTermsOfService, hasSeenPrivacyPolicy } = this.props
    let progress = [false, false, false]
    if (hasSeenIntroScreen === false) {
      progress[0] = true
      return progress
    }

    if (hasSeenTermsOfService === false) {
      progress[1] = true
      return progress
    }

    if (hasSeenPrivacyPolicy === false) {
      progress[2] = true
      return progress
    }

    return progress
  },

  renderMeatballs () {
    let progress = this.getProgress()

    let meatballs = progress.map((p, i) => {
      let className = p ? classes.selectedMeatball : classes.meatball
      return (<li className={className}>{i + 1}</li>)
    })

    return (<div>
      <ul className={classes.meatballs}>
        {meatballs}
      </ul>
    </div>)
  },

  renderContent () {
    let { hasSeenIntroScreen, hasSeenTermsOfService, hasSeenPrivacyPolicy } = this.props
    if (hasSeenIntroScreen === false) {
      return <Intro advance={this.onAdvanceClick} />
    }

    if (hasSeenTermsOfService === false) {
      return <TermsOfService advance={this.onAdvanceClick} />
    }

    if (hasSeenPrivacyPolicy === false) {
      return <PrivacyPolicy advance={this.onAdvanceClick} />
    }

    return <Intro />
  },

  renderButtonText () {
    let { hasSeenIntroScreen, hasSeenTermsOfService, hasSeenPrivacyPolicy } = this.props

    if (hasSeenIntroScreen === false) {
      return 'Review Terms of Service'
    }

    if (hasSeenTermsOfService === false) {
      return 'Agree and Continue'
    }

    if (hasSeenPrivacyPolicy === false) {
      return 'Agree and Continue'
    }
  },

  onAdvanceClick (time) {
    let container = document.getElementById('scrollContainer')
    container.scrollTop = 0
    let { hasSeenIntroScreen, hasSeenTermsOfService, hasSeenPrivacyPolicy } = this.props

    if (hasSeenIntroScreen === false) {
      return this.props.advanceIntro(time)
    }

    if (hasSeenTermsOfService === false) {
      return this.props.advanceTermsOfService(time)
    }

    if (hasSeenPrivacyPolicy === false) {
      return this.props.advanceToApp(time)
    }
  },

  renderThankYou () {
    return <ThankYou acceptTerms={this.props.agreeToTerms} />
  },

  render () {
    let { hasSeenIntroScreen, hasSeenTermsOfService, hasSeenPrivacyPolicy, hasAgreedToTerms } = this.props
    if (hasAgreedToTerms) {
      return null
    }

    if (hasSeenPrivacyPolicy && hasSeenTermsOfService &&
        hasSeenIntroScreen && hasAgreedToTerms === false) {
      return this.renderThankYou()
    }

    return (<div className={classes.container}>
      <div >
        <div>
          {this.renderContent()}
        </div>

      </div>
    </div>)
  }
})
export default AgreementComponent
