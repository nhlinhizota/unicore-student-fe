import Image from "next/image";
import React from "react";

const hotQuestions = [
  { _id: "1", title: "How do I use express as a custom server in NextJS?" },
  { _id: "2", title: "Next.js is an open-source web development framework?" },
  {
    _id: "3",
    title: " Vercel providing React-based web applications with SSR?",
  },
  {
    _id: "4",
    title: "Next.js enables you to create full-stack web applications?",
  },
  {
    _id: "5",
    title: "Learn how to build fullstack React apps with NextJS 14?",
  },
];

const popularTags = [
  { _id: "1", name: "Javascript", totalQuestions: 5 },
  { _id: "2", name: "Next.js", totalQuestions: 3 },
  {
    _id: "3",
    name: " Vercel",
    totalQuestions: 4,
  },
  {
    _id: "4",
    name: "Next 14",
    totalQuestions: 7,
  },
  { _id: "5", name: "React apps", totalQuestions: 4 },
];

const RightSideBar = () => {
  return (
    // <section
    //   className="
    //  flex
    // flex-col
    // background-light900_dark200
    // w-[350px]
    // max-xl:hidden
    // p-6
    // sticky

    // light-border
    // overflow-y-auto
    // right-0
    // top-0
    // border-l
    // pt-36
    // shadow-light-300
    // dark:shadow-none
    // custom-scrollbar
    //  "
    // >
    //   <div>
    //     <h3 className="h3-bold text-dark200_light900">
    //       Top Questions
    //       <div className="mt-7 flex w-full flex-col gap-[30px]">
    //         {hotQuestions.map((question) => (
    //           <Link
    //             href={`/questions/${question._id}`}
    //             key={question._id}
    //             className="flex cursor-pointer items-center justify-between gap-7"
    //           >
    //             <p className="body-medium text-dark500_light700">
    //               {question.title}
    //             </p>
    //             <Image
    //               src="/assets/icons/chevron-right.svg"
    //               alt="arrow"
    //               width={20}
    //               height={20}
    //               className="invert-colors"
    //             />
    //           </Link>
    //         ))}
    //       </div>
    //     </h3>
    //   </div>

    //   <div className="mt-16">
    //     <h3 className="h3-bold text-dark200_light900">Popular Tags</h3>
    //     <div className="mt-7 flex flex-col gap-4">
    //       {popularTags.map((tag) => (
    //         <RenderTag
    //           key={tag._id}
    //           _id={tag._id}
    //           name={tag.name}
    //           totalQuestions={tag.totalQuestions}
    //           showCount
    //         />
    //       ))}
    //     </div>
    //   </div>
    // </section>

    <div className="card-wrapper rounded-[10px]">
      <div className="relative flex w-full gap-4 p-4">
        {/* EDIT */}
        <div className="absolute top-4 right-2">
          <Image
            src={"/assets/icons/edit-black.svg"}
            width={26}
            height={26}
            alt={"edit"}
            className={`object-contain cursor-pointer`}
          />
        </div>

        {/* IMAGE */}
        <div className="w-[20%] ">
          <Image
            src={"/assets/images/department-annoucement.svg"}
            width={16}
            height={16}
            alt={"annoucement"}
            className={`w-full object-contain`}
          />
        </div>

        {/* CONTENT */}
        <div className="w-[80%] flex items-start justify-between sm:flex-row ml-2 mr-8">
          <div>
            {/* <Link href={`/announcement/${_id}`}> */}
            <p className="base-semibold text-[#1F86E8] line-clamp-1 underline flex-1">
              {"123123123"}
            </p>
            {/* </Link> */}

            <div className="mt-2 flex flex-wrap gap-2">
              {/* {tags.map((tag) => (
                <RenderTag key={tag._id} _id={tag._id} name={tag.name} />
              ))} */}
            </div>

            <span className="mt-2 small-regular italic text-[#636363] line-clamp-1 ">
              {"20/12/2022"}
            </span>

            <p className="mt-2 body-regular text-dark200_light900 line-clamp-2 flex-1">
              {"123123123123"}
            </p>

            <div className="mt-2 flex flex-wrap gap-2">
              {/* {files.map((tag) => (
                <RenderFile key={tag._id} _id={tag._id} name={tag.name} />
              ))} */}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RightSideBar;
