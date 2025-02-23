import Image from "next/image";
import React from "react";
import StatusButton from "./Button/StatusButton";

interface Props {
  text: string;
  handleClick: () => void;
  value: boolean;
  showStatus?: boolean;
  showEditButton?: boolean;
}

const ToggleTitle = (params: Props) => {
  return (
    <div className="flex items-center mt-4 mb-2 p-6">
      <div
        onClick={params.handleClick}
        className="flex justify-start text-sm cursor-pointer"
      >
        <p className="paragraph-semibold">{params.text}</p>
        <Image
          src={
            params.value
              ? "/assets/icons/chevron-up.svg"
              : "/assets/icons/chevron-down.svg"
          }
          alt="previous"
          width={18}
          height={18}
          className="cursor-pointer ml-2 mr-2"
        />
      </div>
      {params.showStatus ? (
        <StatusButton
          gray
          text="Chưa diễn ra"
          infoComponent="Sẽ diễn ra vào ngày 20/11/2024"
          smallText
          otherClasses="ml-4"
        />
      ) : (
        <></>
      )}
      {params.showEditButton ? (
        <Image
          src={"/assets/icons/edit-black.svg"}
          width={26}
          height={26}
          alt={"edit"}
          className={`ml-4 -translate-y-[2px] object-contain cursor-pointer`}
        />
      ) : (
        <></>
      )}
    </div>
  );
};

export default ToggleTitle;
