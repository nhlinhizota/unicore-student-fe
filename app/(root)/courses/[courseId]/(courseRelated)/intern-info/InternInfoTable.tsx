import { Table } from "flowbite-react";
import { useMemo, useState } from "react";

import NoResult from "@/components/shared/Status/NoResult";
import { tableTheme } from "@/components/shared/Table/components/DataTable";
import MyFooter from "@/components/shared/Table/components/MyFooter";
import { itemsPerPageRegisterTable } from "@/constants";
import { InternInfoItem } from "@/types/entity/Topic";
import RowInternInfoTable from "./RowInternInfoTable";

interface DataTableParams {
  isAlreadyRegisteredGroup?: boolean;
  isEditTable: boolean;
  isMultipleDelete: boolean;
  dataTable: InternInfoItem[];
}

const InternInfoTable = (params: DataTableParams) => {
  const dataTable = useMemo(() => {
    return params.dataTable.filter((dataItem) => dataItem.isDeleted !== true);
  }, [params.dataTable]);

  const [currentPage, setCurrentPage] = useState(1);
  const [isShowFooter, setIsShowFooter] = useState(true);
  const totalItems = dataTable.length;

  const currentItems = useMemo(() => {
    return dataTable.slice(
      (currentPage - 1) * itemsPerPageRegisterTable,
      currentPage * itemsPerPageRegisterTable
    );
  }, [dataTable, currentPage]);


  console.log("intern table rerender 1", params.dataTable);
  console.log("intern table rerender 2", dataTable);

  return (
    <div>
      {/* TABLE */}
      {currentItems.length === 0 ? (
        <NoResult
          title="Không có dữ liệu!"
          description="💡 Bạn hãy thử tìm kiếm 1 từ khóa khác nhé."
        />
      ) : (
        <div
          className="
            scroll-container 
            overflow-auto
            max-w-full
            h-fit
            rounded-lg
            border-[1px]
            border-secondary-200
            "
        >
          <Table hoverable theme={tableTheme}>
            {/* HEADER */}
            <Table.Head
              theme={tableTheme?.head}
              className="sticky top-0 z-10 uppercase border-b bg-gray"
            >
              <Table.HeadCell
                theme={tableTheme?.head?.cell}
                className={` w-10 border-r-[1px] uppercase`}
              >
                STT
              </Table.HeadCell>
              {Object.keys(currentItems[0]?.data || {}).map((key) => {
                if (key === "Mã nhóm" || key === "Mã đề tài") return null;

                return (
                  <Table.HeadCell
                    key={key}
                    theme={tableTheme?.head?.cell}
                    className={`px-2 py-4 border-r-[1px] uppercase whitespace-nowrap`}
                  >
                    {key}
                  </Table.HeadCell>
                );
              })}
            </Table.Head>

            {/* BODY */}
            <Table.Body className="text-left divide-y">
              {currentItems.map((dataItem, index) =>
                dataItem.isDeleted ? (
                  <></>
                ) : (
                  <>
                    {/* //TODO: Main Row: Leader */}
                    <RowInternInfoTable
                      key={dataItem.STT}
                      dataItem={dataItem}
                      isAlreadyRegisteredGroup={params.isAlreadyRegisteredGroup}
                      isEditTable={params.isEditTable}
                      isMultipleDelete={params.isMultipleDelete}
                      onChangeRow={(updatedDataItem: any) => {
                        //   setLocalDataTable((prevTable) =>
                        //     prevTable.map((item) =>
                        //       item.STT === updatedDataItem.STT
                        //         ? updatedDataItem
                        //         : item
                        //     )
                        //   );
                      }}
                      saveSingleRow={(updatedDataItem: any) => {
                        const updatedDataTable = dataTable.map((item, index) =>
                          item.STT === updatedDataItem.STT
                            ? updatedDataItem
                            : item
                        );

                        //   if (params.onSaveEditTable) {
                        //     params.onSaveEditTable(updatedDataTable);
                        //   }
                      }}
                      onClickGetOut={() => {
                        // params.onClickGetOut
                      }}
                      deleteSingleRow={() => {
                        //  params.onClickDelete
                      }}
                    />
                  </>
                )
              )}
            </Table.Body>
          </Table>
        </div>
      )}

      {/* FOOTER */}
      {!isShowFooter || params.isEditTable || params.isMultipleDelete ? (
        <></>
      ) : (
        <MyFooter
          currentPage={currentPage}
          itemsPerPage={itemsPerPageRegisterTable}
          totalItems={totalItems}
          onPageChange={(newPage) => setCurrentPage(newPage)} //HERE
        />
      )}
    </div>
  );
};

export default InternInfoTable;
