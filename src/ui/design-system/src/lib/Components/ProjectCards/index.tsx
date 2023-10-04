import React from 'react'
import { ButtonLink } from '../Button'
import { HeaderWithLink } from '../HeaderWithLink'
import ProjectCard, { type ProjectCardProps } from '../ProjectCard'

export interface ProjectCardsProps {
  projects: ProjectCardProps[]
  headerLink?: string
}

const ProjectCards = ({ projects, headerLink = '' }: ProjectCardsProps) => {
  return (
    <div className="container">
      <HeaderWithLink className="text-h2 mb-10" headerLink={headerLink}>
        Featured Initiatives
      </HeaderWithLink>
      <div className="flex flex-col gap-4 md:grid md:grid-cols-2 md:gap-10">
        {projects.map((project, index) => (
          <ProjectCard key={index} {...project} />
        ))}
        <ButtonLink href="#" rightIcon="external">
          Submit a Project
        </ButtonLink>
        <ButtonLink href="#" rightIcon="right" variant="secondary">
          Go to Github
        </ButtonLink>
      </div>
    </div>
  )
}

export default ProjectCards
