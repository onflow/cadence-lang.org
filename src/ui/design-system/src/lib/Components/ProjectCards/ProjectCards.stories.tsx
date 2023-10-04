import { Meta, Story } from "@storybook/react"
import ProjectCards, { ProjectCardsProps } from "."
import { ProjectCardProps } from "../ProjectCard"
// import { Default as DefaultProjectCard } from "../ProjectCard/ProjectCard.stories"

export default {
  component: ProjectCards,
  title: "Components/ProjectCards",
  parameters: {
    layout: "centered",
  },
} as Meta

const Template: Story<ProjectCardsProps> = (args) => <ProjectCards {...args} />

// const projectCardArgs = DefaultProjectCard.args as ProjectCardProps
const devToArgs: ProjectCardProps = {
  projectImage:
    "https://dev-to-uploads.s3.amazonaws.com/uploads/logos/resized_logo_UQww2soKuUsjaOGNB38o.png",
  heading: "DEV.to",
  description:
    "A constructive and inclusive social network for software developers where you can interact with others in the Flow community",
  tags: ["Social Network"],
  projectLink: "https://dev.to/onflow",
  author: {
    name: "",
    profileImage: "https://avatars.githubusercontent.com/u/62387156?s=200&v=4",
  },
  numStars: 0,
  twitterLink: "https://twitter.com/flow_blockchain",
  githubLink: "https://github.com/onflow",
}

const emeraldDAO: ProjectCardProps = {
  projectImage:
    "https://www.ecdao.org/wp-content/uploads/2022/08/EC-Education.svg",
  heading: "Emerald City",
  description: "The first DAO built on the Flow Blockchain",
  tags: ["DAO"],
  projectLink: "https://www.ecdao.org/",
  author: {
    name: "",
    profileImage:
      "https://pbs.twimg.com/profile_images/1474074643866832897/zwutjUPS_400x400.jpg",
  },
  numStars: 0,
  twitterLink:
    "https://twitter.com/emerald_dao?ref_src=twsrc%5Egoogle%7Ctwcamp%5Eserp%7Ctwgr%5Eauthor",
  githubLink: "https://github.com/onflow",
}

const floats: ProjectCardProps = {
  projectImage: "https://floats.city/island.png",
  heading: "FLOAT",
  description:
    "A Flow enabled proof of attendance platform with over 2.2 million FLOATs claimed and 4600+ events created",
  tags: ["DAO"],
  projectLink: "https://floats.city/",
  author: {
    name: "Emerald City DAO",
    profileImage:
      "https://pbs.twimg.com/profile_images/1474074643866832897/zwutjUPS_400x400.jpg",
  },
  numStars: 0,
  twitterLink:
    "https://twitter.com/emerald_dao?ref_src=twsrc%5Egoogle%7Ctwcamp%5Eserp%7Ctwgr%5Eauthor",
  githubLink: "https://github.com/muttoni/float",
}

const flowEcosystemFund: ProjectCardProps = {
  projectImage:
    "https://assets.website-files.com/5f734f4dbd95382f4fdfa0ea/627a308f0e66044bed3eb6d2_Flow-Illustration_shoe%201%20(1).png",
  heading: "Flow Ecosystem Fund",
  description:
    "The $725 Million Flow Ecosystem Fund is designed to hypercharge innovation and growth across the Flow community.",
  tags: ["Ecosystem Fund", "Grant"],
  projectLink: "https://flow.com/ecosystemsupport",
  author: {
    name: "Dapper Labs",
    profileImage:
      "https://pbs.twimg.com/profile_images/1415802673278853123/gTgTeEnZ_400x400.png",
  },
  numStars: 0,
  twitterLink: "https://twitter.com/flow_blockchain",
  githubLink: "https://github.com/muttoni/float",
}

const flowBounties: ProjectCardProps = {
  projectImage:
    "https://assets.website-files.com/5f734f4dbd95382f4fdfa0ea/62763e067575490bc83fe807_Group%20822.svg",
  heading: "Flow Bug Bounty Program",
  description:
    "Get rewarded for finding security vulnerabilities in on of our products or platforms.",
  tags: ["Bounties", "Bugs"],
  projectLink: "https://flow.com/flow-responsible-disclosure",
  author: {
    name: "Flow",
    profileImage: "https://avatars.githubusercontent.com/u/62387156?s=200&v=4",
  },
  numStars: 0,
  twitterLink: "https://twitter.com/flow_blockchain",
  githubLink: "https://github.com/onflow",
}

const flowBuildspace: ProjectCardProps = {
  projectImage:
    "https://buildspace.so/_next/image?url=https%3A%2F%2Fcdn.buildspace.so%2Fcourses%2Fflow-nft%2Fposter-normal.png&w=3840&q=75",
  heading: "Build your own NFT collection on Flow",
  description:
    "Learn how to deploy your first Flow smart contract using Cadence and build a web3 React app to connect it together",
  tags: ["NFT", "Cadence", "Project"],
  projectLink: "https://buildspace.so/p/nfts-on-flow",
  author: {
    name: "Buildspace",
    profileImage:
      "https://img.api.cryptorank.io/coins/150x150.buildspace1668414728723.png",
  },
  numStars: 0,
  twitterLink: "https://twitter.com/_buildspace",
  githubLink: "https://github.com/buildspace",
}

export const Default = Template.bind({})

Default.args = {
  headerLink: "#",
  projects: [
    devToArgs,
    emeraldDAO,
    floats,
    flowEcosystemFund,
    flowBounties,
    flowBuildspace,
  ],
}

export const dark = Template.bind({})
dark.args = Default.args
dark.parameters = {
  backgrounds: {
    default: "dark",
  },
}

export const mobile = Template.bind({})
mobile.args = Default.args
mobile.parameters = {
  viewport: {
    defaultViewport: "xs",
  },
}
