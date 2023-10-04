import React from "react"

export type RoundImageProps = {
  imageUri: string
  altText: string
}

const RoundImage = ({ imageUri, altText }: RoundImageProps) => (
  <img
    className="rounded-full border-2 border-white"
    alt={altText}
    src={imageUri}
    width={40}
    height={40}
  />
)

export default RoundImage
