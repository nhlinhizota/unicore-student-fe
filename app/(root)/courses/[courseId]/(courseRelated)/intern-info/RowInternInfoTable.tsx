import InputComponent from "@/components/shared/Table/components/InputComponent";
import { StudentData, SubjectData, TeacherData } from "@/types";
import { Table } from "flowbite-react";
import React, { useEffect, useRef, useState } from "react";
import { CourseData } from "@/types/entity/Course";
import { InternInfoItem } from "@/types/entity/Topic";

interface RowParams {
  dataItem: InternInfoItem;
  isEditTable?: boolean;
  isAlreadyRegisteredGroup?: boolean;
  isMultipleDelete?: boolean;
  isHasSubCourses?: boolean;
  onClickGetOut?: () => void;
  saveSingleRow?: (item: any) => void;
  deleteSingleRow?: (itemsSelected: string[]) => void;
  onChangeRow?: (item: any) => void;
}
interface handleInputChangeParams {
  key:
    | keyof CourseData
    | keyof SubjectData
    | keyof StudentData
    | keyof TeacherData;
  newValue: any;
  isMultipleInput?: boolean;
  currentIndex?: number;
  isCheckbox?: boolean;
}

const RowInternInfoTable = React.memo(
  (params: RowParams) => {
    const [isEdit, setIsEdit] = useState(false);

    useEffect(() => {
      if (params.isEditTable) setIsEdit(false);
    }, [[params.isEditTable]]);

    const renderCellValue = ({
      key,
      value,
      keyId,
      params,
      isEdit,
    }: {
      key: string;
      value: string | number | Array<string | number>;
      keyId: string | number;
      params: any;
      isEdit: boolean;
    }) => {
      switch (key) {
        case "MSSV":
        case "Họ và tên":
        case "SĐT":
          return isEdit || params.isEditTable ? (
            Array.isArray(value) ? (
              <div className="flex flex-col gap-1">
                {value.map((item, index) => (
                  <InputComponent
                    key={`${keyId}_${item}_${index}`}
                    value={item}
                    placeholder={item as string | number}
                    onChange={(newValue) => {}}
                  />
                ))}
              </div>
            ) : (
              <InputComponent
                key={`${keyId}_input_${value}`}
                value={value as string | number}
                placeholder={value as string | number}
                onChange={(newValue) => {}}
              />
            )
          ) : Array.isArray(value) ? (
            value.map((item, index) => (
              <React.Fragment key={index}>
                {item}
                {index < value.length - 1 && <br />}
              </React.Fragment>
            ))
          ) : (
            value
          );

        default:
          return isEdit || params.isEditTable ? (
            <InputComponent
              key={`${keyId}_input_${key}_${value}`}
              value={value as string | number}
              placeholder={value as string | number}
              onChange={(newValue) => {}}
              //! NOTE: Đặt w-full cho ô input Mô tả
              isDescription={key === "Mô tả"}
            />
          ) : (
            value
          );
      }
    };

    const renderCell = ({
      key,
      value,
      keyId,
      params,
      isEdit,
    }: {
      key: string;
      value: string | number | Array<string | number>;
      keyId: string | number;
      params: any;
      isEdit: boolean;
    }) => {
      if (key === "Mã nhóm" || key === "Mã đề tài") return null;

      return (
        <Table.Cell
          key={`${keyId}_${key}_${value}`}
          theme={{
            base: `group-first/body:group-first/row:first:rounded-tl-lg
          group-first/body:group-first/row:last:rounded-tr-lg
          group-last/body:group-last/row:first:rounded-bl-lg
          group-last/body:group-last/row:last:rounded-br-lg
          px-4 py-4 text-center text-secondary-900`,
          }}
          // !: NOTE: Giới hạn ô mô tả không quá dài bằng !w-[800px] line-clamp-6
          className={`border-r-[1px] px-2 py-4 normal-case text-left min-h-[64px] ${
            key === "Mô tả"
              ? "!w-[800px] line-clamp-6 flex items-center"
              : "whitespace-nowrap"
          }`}
        >
          {renderCellValue({ key, value, keyId, params, isEdit })}
        </Table.Cell>
      );
    };

    return (
      <Table.Row
        key={params.dataItem.STT}
        onClick={() => {}}
        className={`bg-background-secondary  text-left ${
          isEdit || params.isEditTable
            ? "hover:bg-white cursor-default"
            : "hover:bg-light-800 cursor-default"
        } duration-100`}
      >
        <Table.Cell className="w-10 border-r-[1px] text-center">
          <span>{params.dataItem.STT}</span>
        </Table.Cell>

        {/* Các giá trị khác */}
        {Object.entries(params.dataItem.data).map(([key, value]) => {
          const keyId = params.dataItem.STT;

          return renderCell({
            key,
            value,
            keyId,
            params,
            isEdit,
          });
        })}
      </Table.Row>
    );
  },
  (prevProps, nextProps) => {
    // Kiểm tra nếu `dataItem` của RowInternInfoTable không thay đổi thì không cần re-render
    return (
      prevProps.dataItem === nextProps.dataItem &&
      prevProps.isEditTable === nextProps.isEditTable &&
      prevProps.isMultipleDelete === nextProps.isMultipleDelete &&
      prevProps.isAlreadyRegisteredGroup === nextProps.isAlreadyRegisteredGroup
    );
  }
);

export default RowInternInfoTable;
