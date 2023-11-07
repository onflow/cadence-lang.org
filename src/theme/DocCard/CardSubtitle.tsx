import React from 'react';
import GithubIcon from '../../ui/design-system/images/social/github.svg';
import TwitterIcon from '../../ui/design-system/images/social/twitter.svg';
import type { PropSidebarItemLink } from '@docusaurus/plugin-content-docs';

export const CardSubtitle = ({
  customProps,
}: PropSidebarItemLink): JSX.Element | null => {
  if (customProps == null || customProps === undefined) {
    return null;
  }
  const { author, twitterLink, githubLink } = customProps;
  const { name, profileImage } = author ?? {};

  return (
    <div className="flex gap-2">
      {profileImage && <img src={profileImage} className="h-6 w-6 rounded-full object-cover" />}
      <span className="text-base">{name}</span>
      {twitterLink ? (
        <a href={twitterLink}>
          <TwitterIcon />
        </a>
      ) : null}
      {githubLink ? (
        <a href={githubLink}>
          <GithubIcon />
        </a>
      ) : null}
    </div>
  );
};
