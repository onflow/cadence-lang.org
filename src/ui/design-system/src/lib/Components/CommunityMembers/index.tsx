import { RoundImage } from ".."

export type CommunityMembersProps = {
  authors: any
  contributors: any
}

const CommunityMembers = ({ authors, contributors }: CommunityMembersProps) => {
  return (
    <div className="container">
      <div className="flex flex-col justify-between rounded-lg bg-white px-6 py-9 dark:bg-primary-gray-dark md:flex-row md:px-20 md:py-14">
        <div className="flex min-w-[250px] flex-col">
          <div className="text-xs text-primary-gray-300">Meet the authors</div>
          <div className="mt-4 flex-col">
            {authors.map(
              (
                {
                  profileImage,
                  name,
                  title,
                }: { profileImage: string; name: string; title: string },
                index: number
              ) => (
                <div key={index} className="mb-4 flex">
                  <RoundImage imageUri={profileImage} altText={name} large />
                  <div className="ml-4 flex flex-col justify-center">
                    <h6 className="text-lg font-semibold">{name}</h6>
                    <div className="text-primary-gray-300">{title}</div>
                  </div>
                </div>
              )
            )}
          </div>
        </div>
        <div className="mt-4 flex-col md:ml-4 md:mt-0 md:pl-4">
          <div className="text-xs text-primary-gray-300">
            Community contributors
          </div>
          <div className="mt-4 flex flex-row flex-wrap gap-3 md:gap-4">
            {contributors.map(
              (
                { profileImage, name }: { profileImage: string; name: string },
                index: number
              ) => (
                <RoundImage
                  key={index}
                  imageUri={profileImage}
                  altText={name}
                  large
                />
              )
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default CommunityMembers
