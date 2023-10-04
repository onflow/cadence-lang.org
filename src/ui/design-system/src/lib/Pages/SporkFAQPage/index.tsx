import LeftChevron from "../../../../images/arrows/chevron-left.svg"
import AppLink from "../../Components/AppLink"
import { Attribution } from "../../Components/Attribution/Attribution"
import { ButtonLink } from "../../Components/Button"
import { FAQ } from "../../Components/FAQ/FAQ"

const faqList = [
  {
    question: "What is a spork",
    answer:
      "In the mature Flow, new nodes can be staked and un-staked as the protocol advances from epoch to epoch. However, we are not there yet. Hence, currently every couple of weeks we turn-off the network, update the identity list to include (and exclude) nodes and then turn the network back on again. We call this process a Spork.\n\nAlso, as Flow evolves, we are continuously adding new features and discovering and fixing bugs in the Flow node software. We also utilize a Spork as an opportunity to update the nodes with the latest releases.",
  },
  {
    question: "How frequently do we spork",
    answer:
      "Lorem ipsum dolor sit amet. Et officia Quis sed vero corrupti hic fuga asperiores? Qui provident dolor hic pariatur deserunt cum mollitia rerum et tempore sint non fugiat dolor a molestiae deserunt.\n\nAut cumque internos et accusantium Quis aut obcaecati minus vel esse dolores? Sed molestiae unde a nulla amet et debitis laborum aut quidem tempora. Id fugit quia id quia distinctio in minima internos quo laboriosam possimus.\n\nCum optio autem ut velit rerum sed culpa omnis ut deleniti deleniti. Et amet quos labore quia ut ullam dolor et consequatur sint! Ut minus nostrum ea eius voluptates quo minima itaque At repellendus saepe et quasi vitae sit quia illo eos cumque omnis.",
  },
  {
    question: "This is another question",
    answer:
      "Lorem ipsum dolor sit amet. Et officia Quis sed vero corrupti hic fuga asperiores? Qui provident dolor hic pariatur deserunt cum mollitia rerum et tempore sint non fugiat dolor a molestiae deserunt.\n\nAut cumque internos et accusantium Quis aut obcaecati minus vel esse dolores? Sed molestiae unde a nulla amet et debitis laborum aut quidem tempora. Id fugit quia id quia distinctio in minima internos quo laboriosam possimus.\n\nCum optio autem ut velit rerum sed culpa omnis ut deleniti deleniti. Et amet quos labore quia ut ullam dolor et consequatur sint! Ut minus nostrum ea eius voluptates quo minima itaque At repellendus saepe et quasi vitae sit quia illo eos cumque omnis.",
  },
  {
    question: "This is another question",
    answer:
      "Lorem ipsum dolor sit amet. Et officia Quis sed vero corrupti hic fuga asperiores? Qui provident dolor hic pariatur deserunt cum mollitia rerum et tempore sint non fugiat dolor a molestiae deserunt.\n\nAut cumque internos et accusantium Quis aut obcaecati minus vel esse dolores? Sed molestiae unde a nulla amet et debitis laborum aut quidem tempora. Id fugit quia id quia distinctio in minima internos quo laboriosam possimus.\n\nCum optio autem ut velit rerum sed culpa omnis ut deleniti deleniti. Et amet quos labore quia ut ullam dolor et consequatur sint! Ut minus nostrum ea eius voluptates quo minima itaque At repellendus saepe et quasi vitae sit quia illo eos cumque omnis.",
  },
]

export function SporkFAQPage() {
  return (
    <main className="container bg-zinc-50 px-4 pb-48 dark:bg-black md:bg-white md:px-0 md:pt-16">
      <div>
        <AppLink
          className="mt-2 flex w-fit cursor-pointer items-center rounded-lg py-4 text-primary-blue dark:border-primary-purple dark:text-primary-purple md:hidden"
          to="/network"
        >
          <LeftChevron />
          Back to Network
        </AppLink>
      </div>
      <div className="grid grid-cols-1 items-start pb-6 md:flex md:pb-12">
        <div className="grow">
          <h1 className="pb-14 font-display text-4xl font-bold leading-snug md:pb-6 md:font-sans">
            <span className="hidden md:block">Spork FAQ</span>
            <span className="block md:hidden">FAQ</span>
          </h1>
          <Attribution
            updatedDate="2022-07-06T17:21:44Z"
            authorIcon="https://avatars.githubusercontent.com/u/62387156?s=64&v=4"
            commitUrl="https://github.com/onflow/fcl-js/commit/7dce2943268f9671c72e012631198792e395601b"
            authorName="@maxxP"
            otherAuthorsCount={12}
            readMinutes={4}
            difficulty="Beginners"
          />
        </div>
        <div className="hidden md:block">
          <ButtonLink variant="secondary" leftIcon="left" href="/network">
            Back to Network
          </ButtonLink>
        </div>
      </div>
      <FAQ faqList={faqList} variation="large" />
    </main>
  )
}
