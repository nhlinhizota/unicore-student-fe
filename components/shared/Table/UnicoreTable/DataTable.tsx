"use client";

import { CustomFlowbiteTheme, Dropdown, Table } from "flowbite-react";
import Row from "./Row";
import { CourseDataItem, SubjectDataItem } from "@/types";
import IconButton from "../../IconButton";
import { useState, useEffect, useMemo } from "react";
import { DetailFilter, FilterType, itemsPerPage } from "@/constants";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import NoResult from "../../NoResult";
import TableSearch from "../../search/TableSearch";
import Image from "next/image";
import useSetDebounceSearchTerm from "@/hooks/table/useSetDebounceSearchTerm";
import useDetailFilter from "@/hooks/table/useDetailFilter";
import useDebounceSearchDataTable from "@/hooks/table/useDebounceSearchDataTable";
import Footer from "./Footer";

// TODO: filteredData là để render giao diện (search, filter old new, detail filter)
// TODO: localData là để handle save (khi edit từ search, filter old new, detail filter, pagination)
// TODO: currentItems là để pagination cho dataTable (footer)

// ! KHI LÀM NÚT XÓA, THÌ CHUYỂN BIẾN DELETED = 1 => KH HIỆN TRÊN BẢNG ===> ĐỒNG NHẤT VỚI CODE HANDLE SAVE

interface DataTableParams {
  isEditTable: boolean;
  isMultipleDelete: boolean;
  onClickEditTable?: () => void;
  onSaveEditTable?: (localDataTable: any) => void;
  onClickMultipleDelete?: () => void;
  onClickDelete?: (itemsSelected: string[]) => void;
  onClickGetOut?: () => void;
  dataTable:
    | CourseDataItem[]
    | SubjectDataItem[]
    | (CourseDataItem | SubjectDataItem)[];
}

const DataTable = (params: DataTableParams) => {
  const dataTable = useMemo(() => {
    return params.dataTable.filter((dataItem) => dataItem.isDeleted !== true);
  }, [params.dataTable]);

  const saveDataTable = () => {
    // ? HÀM LƯU ĐỐI VỚI PAGINATION
    // // Kết hợp localDataTable với dataTable
    // const updatedDataTable = [
    //   ...dataTable.slice(
    //     0,
    //     (currentPage - 1) * itemsPerPage
    //   ), // Các phần trước currentItems
    //   ...localDataTable, // Dữ liệu đã chỉnh sửa (currentItems)
    //   ...dataTable.slice(currentPage * itemsPerPage), // Các phần sau currentItems
    // ];
    // params.onSaveEditTable &&
    //   params.onSaveEditTable(updatedDataTable);

    // ? HÀM LƯU ĐỐI VỚI FILTERDATA
    // params.onSaveEditTable &&
    //   params.onSaveEditTable(updatedDataTable);

    // * HÀM LƯU GỘP CHUNG
    const updatedDataTable = dataTable.map((item) => {
      // Tìm item tương ứng trong localDataTable dựa vào STT (hoặc một identifier khác)
      const localItem = localDataTable.find((local) => local.STT === item.STT);

      // * Nếu tìm thấy, cập nhật giá trị bằng localItem, ngược lại giữ nguyên item
      // * Trải item và localitem ra, nếu trùng nhau thì localItem ghi đè
      return localItem ? { ...item, ...localItem } : item;
    });

    if (params.onSaveEditTable) {
      params.onSaveEditTable(updatedDataTable);
    }
  };

  // ! FOOTER
  const [isShowFooter, setIsShowFooter] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const totalItems = dataTable.length;

  // Tính toán các items hiển thị dựa trên currentPage
  const currentItems = useMemo(() => {
    return dataTable.slice(
      (currentPage - 1) * itemsPerPage,
      currentPage * itemsPerPage
    );
  }, [dataTable, currentPage]); // * Khi dataTable thì currentItems cũng cập nhật để update dữ liệu kh bị cũ

  // * Local dataTable sử dụng để edit lại data import hoặc PATCH API
  const [localDataTable, setLocalDataTable] = useState(currentItems);

  let applyFilter = () => {
    let filteredData;

    if (
      !(
        semesterFilterSelected == 0 &&
        yearFilterSelected == 0 &&
        subjectFilterSelected == "" &&
        teacherFilterSelected == ""
      )
    ) {
      setSearchTerm("");
      filteredData = dataTable;
      setIsShowFooter(false);
    } else {
      // TODO: Nếu không có detail filter, hiển thị dữ liệu về dạng pagination (giống trong debounce search)
      filteredData = currentItems;
      setIsShowFooter(true);
      setFilteredDataTable(filteredData);
      return;
    }

    if (semesterFilterSelected !== 0) {
      filteredData = filteredData.filter((dataItem) => {
        return dataItem.data["Học kỳ"]
          .toString()
          .includes(semesterFilterSelected.toString());
      });
    }

    if (yearFilterSelected !== 0) {
      filteredData = filteredData.filter((dataItem: any) => {
        return dataItem.data["Năm học"]
          .toString()
          .includes(yearFilterSelected.toString());
      });
    }

    if (subjectFilterSelected !== "") {
      filteredData = filteredData.filter((dataItem) => {
        if (dataItem.type === "course") {
          return (dataItem as CourseDataItem).data["Tên môn học"].includes(
            subjectFilterSelected
          );
        }
      });
    }

    if (teacherFilterSelected !== "") {
      filteredData = filteredData.filter((dataItem) => {
        if (dataItem.type === "course") {
          return (dataItem as CourseDataItem).data["Tên GV"].includes(
            teacherFilterSelected
          );
        }
      });
    }

    setFilteredDataTable(filteredData);
  };

  useEffect(() => {
    // * => (HANDLE ĐƯỢC 2 TRƯỜNG HỢP)
    // TODO. TH1: CLICK SANG TRANG MỚI -> CURRENTPAGE ĐỔI -> CURRENT ITEMS ĐỔI (KHÔNG CÓ FILTER) => APPLYFILTER VẪN HANDLE ĐƯỢC
    // TODO. TH2: ĐANG Ở DETAIL FILTER DATA, THÌ DATATABLE CẬP NHẬT -> VÀO APPLY FILTER LẠI

    applyFilter();
    // setFilteredDataTable(currentItems);
  }, [currentItems]);

  const [typeFilter, setTypeFilter] = useState(FilterType.None);
  // Bộ lọc mới - cũ
  const handleChooseFilter = (type: FilterType) => {
    if (type !== FilterType.None) setSearchTerm("");
    setTypeFilter(type);
    var sortedNewerDataTable = [] as (CourseDataItem | SubjectDataItem)[];

    sortedNewerDataTable = sortDataTable(dataTable, type);

    // lấy data mới đã sort, sau đó hiển thị bằng pagination từ trang 1
    if (currentPage != 1) setCurrentPage(1);
    var updatedDataTablePagination = sortedNewerDataTable.slice(
      (currentPage - 1) * itemsPerPage,
      currentPage * itemsPerPage
    );

    setFilteredDataTable(updatedDataTablePagination);
  };

  const cancelDetailFilter = () => {
    setSemesterFilterSelected(0);
    setYearFilterSelected(0);
    setSubjectFilterSelected("");
    setTeacherFilterSelected("");
  };

  const [itemsSelected, setItemsSelected] = useState<string[]>([]);
  const [isShowDialog, setIsShowDialog] = useState(false);

  // ! SEARCH GENERAL
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState(searchTerm);
  const [filteredDataTable, setFilteredDataTable] =
    useState<(CourseDataItem | SubjectDataItem)[]>(currentItems);

  useSetDebounceSearchTerm(setDebouncedSearchTerm, searchTerm);
  useDebounceSearchDataTable(
    debouncedSearchTerm,
    setFilteredDataTable,
    applyFilter,
    cancelDetailFilter,
    handleChooseFilter,
    dataTable,
    currentItems
  );

  // TODO Đồng bộ filteredDataTable với localDataTable khi localDataTable thay đổi
  // *
  // Biến localDataTable dùng để edit data phân trang từ data gốc
  // nên data phân trang thay đổi thì cũng update localDataTable
  // *
  useEffect(() => {
    setLocalDataTable([...filteredDataTable]);
  }, [filteredDataTable]); // Chạy mỗi khi filteredDataTable thay đổi

  // ! DETAIL FILTER
  const [semesterFilterSelected, setSemesterFilterSelected] = useState(0);
  const [yearFilterSelected, setYearFilterSelected] = useState(0);
  const [subjectFilterSelected, setSubjectFilterSelected] = useState("");
  const [teacherFilterSelected, setTeacherFilterSelected] = useState("");

  // Sử dụng useMemo để tạo các giá trị chỉ một lần khi render component
  // * subject kh co detail filter
  const { semesterValues, yearValues, subjectValues, teacherValues } =
    useMemo(() => {
      if (dataTable[0].type === "subject") {
        return {
          semesterValues: [],
          yearValues: [],
          subjectValues: [],
          teacherValues: [],
        };
      }

      const semesterSet: Set<number> = new Set();
      const yearSet: Set<number> = new Set();
      const subjectSet: Set<string> = new Set();
      const teacherSet: Set<string> = new Set();

      dataTable.forEach((item) => {
        semesterSet.add(Number(item.data["Học kỳ"]));
        yearSet.add(item.data["Năm học"]);

        if (item.type === "course") {
          subjectSet.add((item as CourseDataItem).data["Tên môn học"]);

          (item as CourseDataItem).data["Tên GV"]
            .split(/\r\n|\n/)
            .forEach((name) => {
              teacherSet.add(name);
            });
        }
      });

      return {
        semesterValues: Array.from(semesterSet).sort((a, b) => a - b),
        yearValues: Array.from(yearSet).sort((a, b) => a - b),
        subjectValues: Array.from(subjectSet),
        teacherValues: Array.from(teacherSet),
      };
    }, [currentItems]); // Chỉ tính toán lại khi currentItems thay đổi

  //  ! APPLY FILTER
  useEffect(() => {
    // * Filter là filter trong dataTable
    // *
    // chỉ cần 1 trong các filter dropdown có giá trị thì tắt footer pagination
    // bật footer pagination lại nếu kh có giá trị
    // *

    applyFilter();
  }, [
    semesterFilterSelected,
    yearFilterSelected,
    subjectFilterSelected,
    teacherFilterSelected,
  ]);

  // ! SEARCH IN EACH DETAIL FILTER

  // semester
  const {
    searchTerm: searchTermSemesterFilter,
    setSearchTerm: setSearchTermSemesterFilter,
    filteredValues: filteredSemesterValues,
  } = useDetailFilter<number>(semesterValues);

  // year
  const {
    searchTerm: searchTermYearFilter,
    setSearchTerm: setSearchTermYearFilter,
    filteredValues: filteredYearValues,
  } = useDetailFilter<number>(yearValues);

  // subject
  const {
    searchTerm: searchTermSubjectFilter,
    setSearchTerm: setSearchTermSubjectFilter,
    filteredValues: filteredSubjectValues,
  } = useDetailFilter<string>(subjectValues);

  // teacher
  const {
    searchTerm: searchTermTeacherFilter,
    setSearchTerm: setSearchTermTeacherFilter,
    filteredValues: filteredTeacherValues,
  } = useDetailFilter<string>(teacherValues);

  // ! OTHERS FUNCTION

  const sortDataTable = (
    data:
      | CourseDataItem[]
      | SubjectDataItem[]
      | (CourseDataItem | SubjectDataItem)[],
    sortOrder: FilterType
  ) => {
    if (sortOrder === FilterType.None) {
      return data.sort((a, b) => {
        const noA = parseInt(a.STT);
        const noB = parseInt(b.STT);
        return noA - noB;
      });
    } else if (sortOrder === FilterType.DetailFilter) {
      return data.sort((a, b) => {
        const noA = parseInt(a.STT);
        const noB = parseInt(b.STT);
        return noA - noB;
      });
    } else {
      return data.sort((a, b) => {
        const yearA = a.data["Năm học"];
        const yearB = b.data["Năm học"];

        // Xác định thứ tự sắp xếp dựa trên sortOrder
        const orderMultiplier = sortOrder === FilterType.SortNewer ? 1 : -1;

        // So sánh năm học
        if (yearA !== yearB) {
          return (yearB - yearA) * orderMultiplier;
        }

        // Nếu năm học bằng nhau, so sánh học kỳ
        const semesterA = a.data["Học kỳ"] as number;
        const semesterB = b.data["Học kỳ"] as number;

        return (semesterB - semesterA) * orderMultiplier;
      });
    }
  };

  console.log('re-render datatable')

  return (
    <div>
      <div className="flex flex-col md:flex-row items-center justify-between space-y-3 md:space-y-0 p-4">
        {/* ACTION VỚI TABLE */}
        <div className="w-full md:w-1/2 mr-3">
          {params.isEditTable || params.isMultipleDelete ? (
            <></>
          ) : (
            <TableSearch
              setSearchTerm={(value) => setSearchTerm(value)}
              searchTerm={searchTerm}
            />
          )}
        </div>
        <div className="w-full md:w-auto flex flex-col md:flex-row space-y-2 md:space-y-0 items-stretch md:items-center justify-end flex-shrink-0">
          <div className="flex gap-2 items-center w-full md:w-auto">
            {params.isEditTable || params.isMultipleDelete ? (
              <></>
            ) : (
              <IconButton
                text="Tạo lớp học"
                onClick={() => {}}
                iconLeft={"/assets/icons/add.svg"}
              />
            )}

            {params.isEditTable ? (
              <IconButton text="Lưu" onClick={saveDataTable} />
            ) : params.isMultipleDelete ? (
              <>
                <p className="text-sm font-medium">
                  Đã chọn:
                  <span className="font-semibold">
                    {` ${itemsSelected.length}`}
                  </span>
                </p>
                <IconButton
                  text="Xóa"
                  onClick={() => {
                    setIsShowDialog(true);
                  }}
                  bgColor="bg-danger"
                />
                <IconButton
                  text="Thoát"
                  onClick={() => {
                    setItemsSelected([]);
                    params.onClickGetOut && params.onClickGetOut();
                  }}
                  bgColor="bg-gray-500"
                />
              </>
            ) : (
              <Dropdown
                className="z-30 rounded-lg"
                label=""
                dismissOnClick={false}
                renderTrigger={() => (
                  <div>
                    <IconButton
                      text="Hành động"
                      onClick={() => {}}
                      iconRight={"/assets/icons/chevron-down.svg"}
                      bgColor="bg-white"
                      textColor="text-black"
                      border
                    />
                  </div>
                )}
              >
                <Dropdown.Item onClick={params.onClickEditTable}>
                  Chỉnh sửa
                </Dropdown.Item>

                <Dropdown.Item onClick={params.onClickMultipleDelete}>
                  Xóa nhiều
                </Dropdown.Item>
              </Dropdown>
            )}

            {params.isEditTable || params.isMultipleDelete ? (
              <></>
            ) : (
              <Dropdown
                className="z-30 rounded-lg"
                label=""
                dismissOnClick={false}
                renderTrigger={() => (
                  <div>
                    <IconButton
                      text="Bộ lọc"
                      iconLeft={
                        typeFilter === FilterType.None
                          ? "/assets/icons/filter.svg"
                          : "/assets/icons/filter_active.svg"
                      }
                      iconRight={"/assets/icons/chevron-down.svg"}
                      bgColor="bg-white"
                      textColor="text-black"
                      border
                      isFilter={typeFilter === FilterType.DetailFilter}
                    />
                  </div>
                )}
              >
                <Dropdown.Header>
                  <span
                    onClick={() => {
                      cancelDetailFilter();
                      handleChooseFilter(FilterType.None);
                    }}
                    className="block truncate text-sm font-medium cursor-pointer"
                  >
                    Bỏ bộ lọc
                  </span>
                </Dropdown.Header>
                <ul className=" text-sm" aria-labelledby="filterDropdownButton">
                  <li
                    className="flex items-center
                  w-full
                  justify-start
                  px-4
                  py-2
                  text-sm
                  text-gray-700
                  focus:outline-none
                  "
                  >
                    <input
                      checked={typeFilter === FilterType.SortNewer}
                      id="SortNewer"
                      type="radio"
                      name="filterOptions"
                      value={FilterType.SortNewer}
                      onChange={() => handleChooseFilter(FilterType.SortNewer)}
                      className="w-4 h-4  cursor-pointer bg-gray-100 border-gray-300 rounded text-primary-600"
                    />
                    <label
                      htmlFor="SortNewer"
                      className="ml-2 cursor-pointer text-sm font-medium text-gray-900 dark:text-gray-100"
                    >
                      Mới nhất
                    </label>
                  </li>

                  <li
                    className="flex items-center
                  w-full
                  justify-start
                  px-4
                  py-2
                  text-sm
                  text-gray-700
                  focus:outline-none
                  "
                  >
                    <input
                      checked={typeFilter === FilterType.SortOlder}
                      id="SortOlder"
                      type="radio"
                      name="filterOptions"
                      value={FilterType.SortOlder}
                      onChange={() => handleChooseFilter(FilterType.SortOlder)}
                      className="w-4 h-4  cursor-pointer bg-gray-100 border-gray-300 rounded text-primary-600"
                    />
                    <label
                      htmlFor="SortOlder"
                      className="ml-2 cursor-pointer text-sm font-medium text-gray-900 dark:text-gray-100"
                    >
                      Cũ nhất
                    </label>
                  </li>
                  {dataTable[0].type !== "subject" ? (
                    <li
                      className="flex items-center
                  w-full
                  justify-start
                  px-4
                  py-2
                  text-sm
                  text-gray-700
                  focus:outline-none"
                    >
                      <input
                        checked={typeFilter === FilterType.DetailFilter}
                        id="DetailFilter"
                        type="radio"
                        name="filterOptions"
                        value={FilterType.DetailFilter}
                        onChange={() =>
                          handleChooseFilter(FilterType.DetailFilter)
                        }
                        className="w-4 h-4  cursor-pointer bg-gray-100 border-gray-300 rounded text-primary-600"
                      />
                      <label
                        htmlFor="DetailFilter"
                        className="ml-2 text-sm cursor-pointer font-medium text-gray-900 dark:text-gray-100"
                      >
                        Bộ lọc chi tiết
                      </label>
                    </li>
                  ) : (
                    <></>
                  )}
                </ul>
              </Dropdown>
            )}
          </div>
        </div>
      </div>
      {/* DETAIL FILTER typeFilter */}
      {dataTable[0].type !== "subject" &&
        typeFilter === FilterType.DetailFilter && (
          <div className="flex gap-2 w-full px-4 mb-4">
            {Object.values(DetailFilter)
              .filter((item) => isNaN(Number(item)))
              .map((item) => {
                let width = "";
                let text = "";
                let dataDropdown: any = [];
                let searchTermDropdown = "";
                let setSearchTermDropdown = (value: any) => {};
                let handleClickFilter = (item: any) => {};
                let checkIsActive = (item: any): boolean => {
                  return false;
                };
                let checkIsShowFilterIcon = (item: any): any => {
                  return "";
                };

                switch (item) {
                  case "Semester":
                    text = "Học kỳ";
                    width = "w-[15%]";
                    dataDropdown = filteredSemesterValues;

                    searchTermDropdown = searchTermSemesterFilter;
                    setSearchTermDropdown = (value) =>
                      setSearchTermSemesterFilter(value);

                    handleClickFilter = (i) => {
                      if (i === semesterFilterSelected) {
                        setSemesterFilterSelected(0);
                      } else setSemesterFilterSelected(i);
                    };
                    checkIsActive = (i) => {
                      return i === semesterFilterSelected;
                    };
                    checkIsShowFilterIcon = (i) => {
                      return semesterFilterSelected !== 0
                        ? "/assets/icons/filter_active.svg"
                        : undefined;
                    };

                    break;
                  case "Year":
                    text = "Năm học";
                    width = "w-[15%]";

                    dataDropdown = filteredYearValues;
                    searchTermDropdown = searchTermYearFilter;
                    setSearchTermDropdown = (value) =>
                      setSearchTermYearFilter(value);

                    handleClickFilter = (i) => {
                      if (i === yearFilterSelected) {
                        setYearFilterSelected(0);
                      } else setYearFilterSelected(i);
                    };
                    checkIsActive = (i) => {
                      return i === yearFilterSelected;
                    };
                    checkIsShowFilterIcon = (i) => {
                      return yearFilterSelected !== 0
                        ? "/assets/icons/filter_active.svg"
                        : undefined;
                    };
                    break;
                  case "Subject":
                    text = "Môn học";
                    width = "w-[35%]";

                    dataDropdown = filteredSubjectValues;
                    searchTermDropdown = searchTermSubjectFilter;
                    setSearchTermDropdown = (value) =>
                      setSearchTermSubjectFilter(value);

                    handleClickFilter = (i) => {
                      if (i === subjectFilterSelected) {
                        setSubjectFilterSelected("");
                      } else setSubjectFilterSelected(i);
                    };
                    checkIsActive = (i) => {
                      return i === subjectFilterSelected;
                    };
                    checkIsShowFilterIcon = (i) => {
                      return subjectFilterSelected !== ""
                        ? "/assets/icons/filter_active.svg"
                        : undefined;
                    };
                    break;
                  case "Teacher":
                    text = "Giảng viên";
                    width = "w-[35%]";

                    dataDropdown = filteredTeacherValues;
                    searchTermDropdown = searchTermTeacherFilter;
                    setSearchTermDropdown = (value) =>
                      setSearchTermTeacherFilter(value);

                    handleClickFilter = (i) => {
                      if (i === teacherFilterSelected) {
                        setTeacherFilterSelected("");
                      } else setTeacherFilterSelected(i);
                    };
                    checkIsActive = (i) => {
                      return i === teacherFilterSelected;
                    };
                    checkIsShowFilterIcon = (i) => {
                      return teacherFilterSelected !== ""
                        ? "/assets/icons/filter_active.svg"
                        : undefined;
                    };
                    break;
                  default:
                    width = "";
                    break;
                }

                return (
                  <div className={`${width}`}>
                    <Dropdown
                      key={item}
                      className="z-30 rounded-lg"
                      label=""
                      dismissOnClick={false}
                      renderTrigger={() => (
                        <div>
                          <IconButton
                            otherClasses="w-full"
                            text={text}
                            iconLeft={checkIsShowFilterIcon(item)}
                            iconRight={"/assets/icons/chevron-down.svg"}
                            bgColor="bg-white"
                            textColor="text-black"
                            border
                            isFilter={typeFilter === FilterType.DetailFilter}
                          />
                        </div>
                      )}
                    >
                      <TableSearch
                        setSearchTerm={setSearchTermDropdown}
                        searchTerm={searchTermDropdown}
                        otherClasses="p-2"
                      />
                      <div className="scroll-container scroll-container-dropdown-content">
                        {dataDropdown.map((item: any, index: number) => {
                          if (typeof item === "string" && item === "") {
                            return <></>;
                          }
                          return (
                            <Dropdown.Item
                              key={`${item}_${index}`}
                              onClick={() => {
                                handleClickFilter(item);
                              }}
                            >
                              <div className="flex justify-between w-full">
                                <p className="w-[80%] text-left line-clamp-1">
                                  {item}
                                </p>
                                {checkIsActive(item) && (
                                  <Image
                                    src="/assets/icons/check.svg"
                                    alt="search"
                                    width={21}
                                    height={21}
                                    className="cursor-pointer mr-2"
                                  />
                                )}
                              </div>
                            </Dropdown.Item>
                          );
                        })}
                      </div>
                    </Dropdown>
                  </div>
                );
              })}
          </div>
        )}
      {/* TABLE */}
      {currentItems.length > 0 && filteredDataTable.length === 0 ? (
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
              className="bg-gray border-b uppercase sticky top-0 z-10"
            >
              <Table.HeadCell
                theme={tableTheme?.head?.cell}
                className={`border-r-[1px] uppercase`}
              ></Table.HeadCell>

              <Table.HeadCell
                theme={tableTheme?.head?.cell}
                className={` w-10 border-r-[1px] uppercase`}
              >
                STT
              </Table.HeadCell>

              {Object.keys(filteredDataTable[0]?.data || {}).map((key) => (
                <Table.HeadCell
                  key={key}
                  theme={tableTheme?.head?.cell}
                  className={`px-2 py-4 border-r-[1px] uppercase whitespace-nowrap`}
                >
                  {key}
                </Table.HeadCell>
              ))}
            </Table.Head>

            {/* BODY */}
            <Table.Body className="divide-y text-left">
              {filteredDataTable.map((dataItem) =>
                dataItem.isDeleted ? (
                  <></>
                ) : (
                  <Row
                    key={dataItem.STT}
                    dataItem={dataItem}
                    isEditTable={params.isEditTable}
                    isMultipleDelete={params.isMultipleDelete}
                    onClickCheckBoxSelect={(item: string) => {
                      setItemsSelected((prev) => [...prev, item]);
                    }}
                    onChangeRow={(updatedDataItem: any) => {
                      var updatedDataTable = localDataTable.map((item) => {
                        if (item.STT === updatedDataItem.STT) {
                          return updatedDataItem;
                        } else {
                          return item;
                        }
                      });

                      setLocalDataTable(updatedDataTable);
                    }}
                    saveDataTable={saveDataTable}
                  />
                )
              )}
            </Table.Body>
          </Table>
        </div>
      )}
      {/* FOOTER */}
      {!isShowFooter ||
      searchTerm !== "" ||
      params.isEditTable ||
      params.isMultipleDelete ? (
        <></>
      ) : (
        <Footer
          currentPage={currentPage}
          itemsPerPage={itemsPerPage}
          totalItems={totalItems}
          onPageChange={(newPage) => setCurrentPage(newPage)} //HERE
        />
      )}
      {/* ALERT CONFIRM */}
      {isShowDialog ? (
        <AlertDialog open={isShowDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Bạn có chắc chắn muốn xóa?</AlertDialogTitle>
              <AlertDialogDescription>
                Thao tác này không thể hoàn tác, dữ liệu của bạn sẽ bị xóa vĩnh
                viễn và không thể khôi phục.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel
                onClick={() => {
                  setIsShowDialog(false);
                  params.onClickGetOut && params.onClickGetOut();
                }}
              >
                Hủy
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={() => {
                  setIsShowDialog(false);
                  setItemsSelected([]);
                  params.onClickGetOut && params.onClickGetOut();
                  params.onClickDelete && params.onClickDelete(itemsSelected);
                }}
              >
                Đồng ý
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      ) : (
        <></>
      )}
    </div>
  );
};

export default DataTable;

export const tableTheme: CustomFlowbiteTheme["table"] = {
  root: {
    base: "min-w-full text-center rounded-lg text-sm text-secondary-500",
    shadow:
      "absolute bg-background-secondary dark:bg-black w-full h-full top-0 left-0 rounded-lg drop-shadow-md -z-10",
    wrapper: "relative ",
  },
  body: {
    base: "group/body bg-background-secondary",
    cell: {
      base: `text-center group-first/body:group-first/row:first:rounded-tl-lg group-first/body:group-first/row:last:rounded-tr-lg group-last/body:group-last/row:first:rounded-bl-lg group-last/body:group-last/row:last:rounded-br-lg p-2 sm:p-3 md:p-4 font-normal text-secondary-900 `,
    },
  },
  head: {
    base: " text-center group/head bg-background-secondary text-xs border-b-2 border-secondary-200 uppercase text-secondary-700",
    cell: {
      base: "text-center  group-first/head:first:rounded-tl-lg border-b-[1px] border-secondary-200  group-first/head:last:rounded-tr-lg p-2 sm:p-3 md:p-4 sm:p-2 md:p-4",
    },
  },
  row: {
    base: "text-center group/row bg-background-secondary",
    hovered: "hover:bg-light-800",
    striped: "odd:bg-background-secondary even:bg-background-secondary ",
  },
};
