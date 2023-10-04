import React from 'react'
import Learn from '../../../../images/page/flow-learn-icon.svg'
import Quickstart from '../../../../images/page/flow-quickstart-icon.svg'
import Documentation from '../../../../images/page/flow-documentation-icon.svg'

export interface HomepageStartItemIconsProps {
  icon: string
}

export function HomepageStartItemIcons ({ icon }: HomepageStartItemIconsProps) {
  switch (icon) {
    case 'learn':
      return <Learn />
    case 'quickstart':
      return <Quickstart />
    case 'documentation':
      return <Documentation />
    default:
      throw new Error('Icon type not recognized')
  }
}
