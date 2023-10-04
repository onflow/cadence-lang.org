export type RoundImageProps = {
  imageUri: string
  imageCaption: string
  altText: string
}

const RoundImage = ({ imageUri, imageCaption, altText }: RoundImageProps) => (
  <div className="w-9">
    <img
      className="rounded-full border-2 border-white"
      alt={altText}
      src={imageUri}
      width={40}
      height={40}
    />
    <div className="flex items-center justify-center">
      <div className="dark:gray-400 md:leading-1 text-gray-350 whitespace-nowrap text-xs dark:text-gray-400">
        {imageCaption}
      </div>
    </div>
  </div>
)

export default RoundImage
