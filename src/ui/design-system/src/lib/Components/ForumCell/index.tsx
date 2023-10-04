import React from 'react';
import CommentIcon from '../../../../images/arrows/message-circle.svg';
import AppLink from '../AppLink';

export interface User {
  profileImage: string;
  name: string;
}

export interface ForumCellProps {
  numComments: number;
  heading: string;
  subheading: string;
  participants: User[];
  lastUpdatedDate: string;
  forumLink: string;
}

const ForumCell = ({
  heading,
  subheading,
  participants,
  numComments,
  lastUpdatedDate,
  forumLink,
}: ForumCellProps) => {
  return (
    <AppLink
      to={forumLink}
      className="flex flex-col items-center justify-around rounded-lg bg-white px-8 py-6 hover:cursor-pointer hover:shadow-2xl dark:bg-primary-gray-dark dark:hover:shadow-2xl-dark md:flex-row"
    >
      <div className="flex-1">
        <p className="mb-2 text-xl font-semibold">{heading}</p>
        <span className="text-primary-gray-300">{subheading}</span>
      </div>
      <div className="mt-8 flex justify-between md:mt-0 md:items-center">
        {/* TODO: API is returning incorrect images, hiding for now */}
        {/* <div className="relative left-0 h-12 w-[9rem]">
          {participants.map((participant, index) => (
            <div
              className="absolute inset-y-0"
              style={{ left: `${index * 26}px` }}
              key={participant.name}
            >
              <RoundImage
                imageUri={participant.profileImage}
                altText={participant.name}
              />
            </div>
          ))}
        </div> */}
        <div className="mt-2 ml-9 flex items-center text-primary-gray-300 dark:text-primary-gray-100 md:mt-0">
          <CommentIcon />
          <span className="ml-3">{numComments}</span>
        </div>
      </div>
    </AppLink>
  );
};

export default ForumCell;
