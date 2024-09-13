"use client";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { DataTable, DataTableSortStatus } from "mantine-datatable";
import { useEffect, useState, Fragment, useRef } from "react";
import sortBy from "lodash/sortBy";
import IconFile from "@/components/icon/icon-file";
import { Dialog, Transition } from "@headlessui/react";
import IconPrinter from "@/components/icon/icon-printer";
import IconPlus from "@/components/icon/icon-plus";
import axios from "axios";
import Flatpickr from "react-flatpickr";
import "flatpickr/dist/flatpickr.css";
import { useSelector } from "react-redux";
import { IRootState } from "@/store";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import Tippy from "@tippyjs/react";
import "tippy.js/dist/tippy.css";
import IconXCircle from "@/components/icon/icon-x-circle";
import IconPencil from "@/components/icon/icon-pencil";
import Select from "react-select";

const MySwal = withReactContent(Swal);

const initialRowData = [
  {
    id: "989",
    billNo: 7500,
    trainee: "Caroline",
    date: "2004-05-28",
    monthsSelected: [{ month: "January", amount: 50 }],
    extraPracticeMonthsSelected: [{ month: "January", amount: 30 }],
    subscriptionType: [{ type: "Monthly", amount: 50 }],
    amount: "O+",
  },
];

const col = [
  "billNo",
  "id",
  "trainee",
  "year",
  "date",
  "monthsSelected",
  "extraPracticeMonthsSelected",
  "subscriptionType",
  "amount",
];

const years = ["2024", "2025", "2026", "2027", "2028", "2029", "2030"];

const subscriptionOptions = [
  { value: "Admission fees", label: "Admission fees" },
  { value: "Development Fees", label: "Development Fees" },
  { value: "Ball", label: "Ball" },
  { value: "Tshirt.", label: "Tshirt" },
  { value: "Cap", label: "Cap" },
  { value: "Hat.", label: "Hat" },
  { value: "Trackpant", label: "Trackpant" },
  { value: "Donation", label: "Donation" },
  { value: "Concession", label: "Concession" },
  { value: "Discount", label: "Discount" },
  { value: "Misc.", label: "Misc." },
];

const allMonthsOptions = [
  { value: "January", label: "January" },
  { value: "February", label: "February" },
  { value: "March", label: "March" },
  { value: "April", label: "April" },
  { value: "May", label: "May" },
  { value: "June", label: "June" },
  { value: "July", label: "July" },
  { value: "August", label: "August" },
  { value: "September", label: "September" },
  { value: "October", label: "October" },
  { value: "November", label: "November" },
  { value: "December", label: "December" },
];

const ComponentsDatatablesSubscription = () => {
  const currentYear = new Date().getFullYear().toString();
  const [file, setFile] = useState(null);
  const [message, setMessage] = useState("");
  const isRtl =
    useSelector((state: IRootState) => state.themeConfig.rtlClass) === "rtl";
  const [date1, setDate1] = useState("2022-07-05");
  const [modal1, setModal1] = useState(false);
  const [files, setFiles] = useState([]);
  const fileInputRef = useRef(null);
  const [page, setPage] = useState(1);
  const PAGE_SIZES = [10, 20, 30, 50, 100];
  const [pageSize, setPageSize] = useState(PAGE_SIZES[0]);
  const [initialRecords, setInitialRecords] = useState(
    sortBy(initialRowData, "id")
  );
  const [recordsData, setRecordsData] = useState(initialRecords);
  const [customerData, setCustomerData] = useState([]);
  const [cutomerid, setcutomerid] = useState("");
  const [cutomerName, setcutomerName] = useState("");
  const [options, setOptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [hiddenFileName, setHiddenFileName] = useState("");
  const [recordsDatasort, setRecordsDatashort] = useState("dsc");
  const [modal2, setModal2] = useState(false);
  const [editid, setEditid] = useState("");
  const [uamount, setUamount] = useState("");
  const [deleteid, setDeleteid] = useState("");
  const [traineeData, setTraineeData] = useState([]);
  const [usedMonths, setUsedMonths] = useState([]);
  const [usedExtraPracticeMonths, setUsedExtraPracticeMonths] = useState([]);
  const [usedYears, setUsedYears] = useState([]);
  const [regularMonthlyFee, setRegularMonthlyFee] = useState(0);
  const [extraPracticeFee, setExtraPracticeFee] = useState(0);
  const [admissionFee, setAdmissionFee] = useState(0);
  const [developmentFee, setDevelopmentFee] = useState(0);
  const [traineeFees, setTraineeFees] = useState({});
  const [paymentType, setPaymentType] = useState("cash");
  const [transactionNo, setTransactionNo] = useState("");
  const [utrNo, setUtrNo] = useState("");
  const [extraPractice, setExtraPractice] = useState(false); // New state for extra practice
  const [joiningDate, setJoiningDate] = useState<Date | null>(null);

  const newTraineeadded = () => {
    MySwal.fire({
      title: "New Fees has been added",
      toast: true,
      position: "bottom-start",
      showConfirmButton: false,
      timer: 5000,
      showCloseButton: true,
    });
  };

  const updatedSubscription = () => {
    MySwal.fire({
      title: "Fees has been updated",
      toast: true,
      position: "bottom-start",
      showConfirmButton: false,
      timer: 5000,
      showCloseButton: true,
    });
  };

  const deletedsubscription = () => {
    MySwal.fire({
      title: "Subscription has been deleted",
      toast: true,
      position: "bottom-start",
      showConfirmButton: false,
      timer: 5000,
      showCloseButton: true,
    });
  };

  interface Subscription {
    id: string;
    billNo: number;
    trainee: string;
    year: string;
    date: string;
    monthsSelected: { month: string; amount: number }[];
    extraPracticeMonthsSelected: { month: string; amount: number }[];
    subscriptionType: { type: string; amount: number }[];
    amount: string;
    paymentType: string;
    transactionNo: string;
    utrNo: string;
  }

  const handleDeleteClick = (value: any) => {
    setModal2(true);
    setDeleteid(value);
  };

  const fetchSettingsData = async () => {
    try {
      const response = await fetch("/api/settings");
      if (!response.ok) {
        throw new Error("Failed to fetch settings data");
      }
      const data = await response.json();
      setRegularMonthlyFee(data.regularmonthlyfee);
      setExtraPracticeFee(data.extrapractice);
      setAdmissionFee(data.admissionfee);
      setDevelopmentFee(data.developementfee);

      // Store trainee fees based on type for dynamic fee calculation
      const traineeFees = data.trainees.reduce((acc, trainee) => {
        acc[trainee.type] = {
          regularFee: trainee.payment,
          extraPracticeFee: trainee.extraPracticePayment,
        };
        return acc;
      }, {});

      setTraineeFees(traineeFees); // Store it in state for future access
    } catch (error) {
      setError(error.message);
    }
  };

  const fetchSubscriptionData = async () => {
    try {
      const response = await fetch("/api/subscription");
      if (!response.ok) {
        throw new Error("Failed to fetch fees data");
      }
      const data = await response.json();

      const formattedSubscription = data.subscriptions.map(
        (subscription: Subscription, index: number) => ({
          id: subscription._id,
          billNo: subscription.billNo || 75550 + index,
          trainee: subscription.trainee,
          year: subscription.year,
          date: formatDate(subscription.date),
          monthsSelected: Array.isArray(subscription.monthsSelected)
            ? subscription.monthsSelected
            : [],
          extraPracticeMonthsSelected: Array.isArray(
            subscription.extraPracticeMonthsSelected
          )
            ? subscription.extraPracticeMonthsSelected
            : [],
          subscriptionType: Array.isArray(subscription.subscriptionType)
            ? subscription.subscriptionType
            : [],
          amount: subscription.amount,
          paymentType: subscription.paymentType,
          transactionNo: subscription.transactionNo,
          utrNo: subscription.utrNo,
        })
      );

      setInitialRecords(formattedSubscription);
      setRecordsData(
        formattedSubscription.slice((page - 1) * pageSize, page * pageSize)
      );
      setLoading(false);
    } catch (error) {
      setError(error.message);
    }
  };

  const fetchTraineeData = async () => {
    try {
      const response = await fetch("/api/studentform");
      if (!response.ok) {
        throw new Error("Failed to fetch trainee data");
      }
      const data = await response.json();
      const trainees = Array.isArray(data.studentforms)
        ? data.studentforms
        : [];
      setTraineeData(trainees);

      const options = trainees.map((trainee) => ({
        value: trainee._id,
        label: `${trainee.name} - ${trainee.phoneno}`,
        extraPractice: trainee.extraPractice, // Include extraPractice in options
        joiningDate: trainee.joiningdate, // Include joiningDate in options
        traineeType: trainee.traineeType, // Include traineeType in options
      }));

      setOptions(options);
    } catch (error) {
      setError(error.message);
    }
  };

  const fetchTraineeSubscriptionData = async (traineeId, year) => {
    try {
      const response = await fetch(
        `/api/subscription?traineeid=${traineeId}&year=${year}`
      );
      if (!response.ok) {
        throw new Error("Failed to fetch trainee subscription data");
      }
      const data = await response.json();
      return data.subscriptions;
    } catch (error) {
      setError(error.message);
      return [];
    }
  };

  const updateUsedMonths = async (traineeId, year) => {
    const subscriptions = await fetchTraineeSubscriptionData(traineeId, year);
    const usedMonths = subscriptions.flatMap((sub) =>
      Array.isArray(sub.monthsSelected)
        ? sub.monthsSelected.map((month) => month.month)
        : []
    );
    const usedExtraPracticeMonths = subscriptions.flatMap((sub) =>
      Array.isArray(sub.extraPracticeMonthsSelected)
        ? sub.extraPracticeMonthsSelected.map((month) => month.month)
        : []
    );
    setUsedMonths(usedMonths);
    setUsedExtraPracticeMonths(usedExtraPracticeMonths);
  };

  useEffect(() => {
    fetchSettingsData();
    fetchSubscriptionData();
    fetchTraineeData();
  }, []);

  const [showAddCustomer, setShowAddCustomer] = useState(false);
  const [sortStatus, setSortStatus] = useState<DataTableSortStatus>({
    columnAccessor: "_id",
    direction: "desc",
  });

  useEffect(() => {
    setPage(1);
  }, [pageSize]);

  useEffect(() => {
    const from = (page - 1) * pageSize;
    const to = from + pageSize;
    setRecordsData([...initialRecords.slice(from, to)]);
  }, [page, pageSize, initialRecords]);

  useEffect(() => {
    const filteredRecords = initialRecords.filter((item: any) => {
      return (
        item.billNo.toString().includes(search) ||
        item.trainee.toLowerCase().includes(search.toLowerCase()) ||
        item.year.toString().includes(search.toLowerCase()) ||
        item.date.toString().includes(search.toLowerCase()) ||
        item.monthsSelected.some((month) =>
          month.month.toLowerCase().includes(search.toLowerCase())
        ) ||
        item.extraPracticeMonthsSelected.some((month) =>
          month.month.toLowerCase().includes(search.toLowerCase())
        ) ||
        item.subscriptionType.some((type) =>
          type.type.toLowerCase().includes(search.toLowerCase())
        ) ||
        item.amount.toString().includes(search.toLowerCase()) ||
        item.paymentType.toLowerCase().includes(search.toLowerCase()) ||
        item.transactionNo.toLowerCase().includes(search.toLowerCase()) ||
        item.utrNo.toLowerCase().includes(search.toLowerCase())
      );
    });

    setRecordsData(
      filteredRecords.slice((page - 1) * pageSize, page * pageSize)
    );
  }, [search, initialRecords, page, pageSize]);

  const handleAddCustomerClick = (e: any) => {
    e.stopPropagation();
    setShowAddCustomer(!showAddCustomer);
  };

  useEffect(() => {
    const sortedData = sortBy(initialRecords, sortStatus.columnAccessor);
    const finalData =
      sortStatus.direction === "desc" ? sortedData.reverse() : sortedData;
    setRecordsData(finalData.slice((page - 1) * pageSize, page * pageSize));
  }, [sortStatus, page, pageSize, initialRecords]);

  const formatDate = (date: any) => {
    if (date) {
      const dt = new Date(date);
      const month =
        dt.getMonth() + 1 < 10 ? "0" + (dt.getMonth() + 1) : dt.getMonth() + 1;
      const day = dt.getDate() < 10 ? "0" + dt.getDate() : dt.getDate();
      return day + "/" + month + "/" + dt.getFullYear();
    }
    return "";
  };

  const handleDeleteData = async () => {
    const resdel = await fetch(`/api/subscription/${deleteid}`, {
      method: "GET",
    });
    if (!resdel.ok) {
      throw new Error(`Failed to fetch data for ID: ${deleteid}`);
    }
    const data = await resdel.json();

    const reportData2 = {
      date: data.subscription.date,
      expense: parseFloat(data.subscription.amount),
    };

    await fetch("/api/reports", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(reportData2),
    });

    setModal2(false);

    const res = await fetch(`/api/subscription/${deleteid}`, {
      method: "DELETE",
    });

    if (res.ok) {
      fetchSubscriptionData();
      deletedsubscription();
    }
  };

  const getFirstName = (label: string) => label.split(" - ")[0];

  const getcustomeval = () => {
    setUsedYears([]);
    setEditid("");
    setFiles([]);
    const maxBillNo = Math.max(
      ...initialRecords.map((record) => record.billNo),
      75550
    ); // Calculate the maximum bill number
    const newBillNo = maxBillNo + 1; // Update bill number
    setFormData({
      id: "",
      billNo: newBillNo,
      trainee: "",
      traineeid: "",
      year: currentYear,
      date: formatDate(new Date()),
      monthsSelected: [],
      extraPracticeMonthsSelected: [],
      subscriptionType: [],
      amount: "",
      paymentType: "cash", // Set default payment type to cash
      transactionNo: "",
      utrNo: "",
    });
    setPaymentType("cash"); // Set default payment type to cash
    setTransactionNo("");
    setUtrNo("");
    setEditid("");
    setModal1(true);
  };

  const handleDateChange = (date: any) => {
    setFormData((prevFormData) => ({
      ...prevFormData,
      date: date[0] ? formatDate(date[0]) : "",
    }));
  };

  const exportTable = (type: any) => {
    let columns: any = col;
    let records = initialRecords;
    let filename = "table";

    let newVariable: any;
    newVariable = window.navigator;

    if (type === "csv") {
      let coldelimiter = ";";
      let linedelimiter = "\n";
      let result = columns
        .map((d: any) => {
          return capitalize(d);
        })
        .join(coldelimiter);
      result += linedelimiter;
      records.map((item: any) => {
        columns.map((d: any, index: any) => {
          if (index > 0) {
            result += coldelimiter;
          }
          let val = item[d] ? item[d] : "";
          result += val;
        });
        result += linedelimiter;
      });

      if (result == null) return;
      if (!result.match(/^data:text\/csv/i) && !newVariable.msSaveOrOpenBlob) {
        var data =
          "data:application/csv;charset=utf-8," + encodeURIComponent(result);
        var link = document.createElement("a");
        link.setAttribute("href", data);
        link.setAttribute("download", filename + ".csv");
        link.click();
      } else {
        var blob = new Blob([result]);
        if (newVariable.msSaveOrOpenBlob) {
          newVariable.msSaveBlob(blob, filename + ".csv");
        }
      }
    }
  };

  const capitalize = (text: any) => {
    return text
      .replace(/_/g, " ")
      .replace(/-/g, " ")
      .toLowerCase()
      .split(" ")
      .map((s: any) => s.charAt(0).toUpperCase() + s.substring(1))
      .join(" ");
  };

  const [formData, setFormData] = useState({
    id: "",
    billNo: "",
    trainee: "",
    traineeid: cutomerid,
    year: currentYear,
    date: formatDate(new Date()),
    monthsSelected: [],
    extraPracticeMonthsSelected: [],
    subscriptionType: [],
    amount: "",
    paymentType: "cash", // Set default payment type to cash
    transactionNo: "",
    utrNo: "",
  });

  const handleChange = (e: any) => {
    const { name, value } = e.target;

    setFormData((formData) => ({
      ...formData,
      [name]: value,
    }));
  };

  const handleMonthAmountChange = (index, value) => {
    const updatedMonths = [...formData.monthsSelected];
    updatedMonths[index].amount = value;
    setFormData((prevFormData) => ({
      ...prevFormData,
      monthsSelected: updatedMonths,
    }));
  };

  const handleExtraPracticeMonthAmountChange = (index, value) => {
    const updatedMonths = [...formData.extraPracticeMonthsSelected];
    updatedMonths[index].amount = value;
    setFormData((prevFormData) => ({
      ...prevFormData,
      extraPracticeMonthsSelected: updatedMonths,
    }));
  };

  const handleTypeAmountChange = (index, value) => {
    const updatedTypes = [...formData.subscriptionType];
    const type = updatedTypes[index].type;

    let amount = parseFloat(value);
    if (type === "Concession" || type === "Discount") {
      // Convert to negative value
      amount = -Math.abs(amount);
    }

    updatedTypes[index].amount = amount;
    setFormData((prevFormData) => ({
      ...prevFormData,
      subscriptionType: updatedTypes,
    }));
  };

  const handleShowAllOptions = (allOptions: any, selectedOptions: any) => {
    console.log("All available options:", allOptions);
    console.log("Selected options:", selectedOptions);
    // Implement your logic here for handling all options
  };

  const handleMonthsSelectedChange = (selectedOptions: any) => {
    // Retrieve all available options (filtered options)
    const allOptions = getMonthOptions(formData.year)
      .filter((month) => !usedMonths.includes(month.value))
      .map((month) => ({
        value: month.value,
        label: month.label,
      }));

    // Match traineeType and set the corresponding regularMonthlyFee
    const regularFee =
      traineeFees[formData.traineeType]?.regularFee || regularMonthlyFee;

    // Map selected options to include the month and amount
    const selectedValues = selectedOptions
      ? selectedOptions.map((option: any) => ({
          month: option.value,
          amount: regularFee,
        }))
      : [];

    // Skip the sequential check if in edit mode
    if (!editid) {
      // Check if selected options are sequential
      const isSequential = selectedValues.every((selected, index) => {
        return selected.month === allOptions[index].value;
      });

      if (!isSequential) {
        MySwal.fire({
          title: "Invalid Selection",
          text: "Selected months must start sequentially from the first available month.",
          icon: "warning",
          showConfirmButton: true,
          confirmButtonText: "OK",
          customClass: {
            popup: "animate__animated animate__shakeX", // Applying shake animation
          },
        });

        // Reset the dropdown to the last valid state
        setFormData((prevFormData) => ({
          ...prevFormData,
          monthsSelected: prevFormData.monthsSelected,
        }));

        return;
      }
    }

    // Update the form data state with the selected values
    setFormData((prevFormData) => ({
      ...prevFormData,
      monthsSelected: selectedValues,
    }));

    // Call the function to handle all available options
    handleShowAllOptions(allOptions, selectedValues);
  };

  const handleExtraPracticeMonthsSelectedChange = (selectedOptions: any) => {
    // Retrieve all available options (filtered options) for extra practice
    const extraAllOptions = getMonthOptions(formData.year)
      .filter((month) => !usedExtraPracticeMonths.includes(month.value))
      .map((month) => ({
        value: month.value,
        label: month.label,
      }));

    // Match traineeType and set the corresponding extraPracticeFee
    const extraFee =
      traineeFees[formData.traineeType]?.extraPracticeFee || extraPracticeFee;

    // Map selected options to include the month and amount for extra practice
    const selectedValues = selectedOptions
      ? selectedOptions.map((option: any) => ({
          month: option.value,
          amount: extraFee,
        }))
      : [];

    // Skip the sequential check if in edit mode
    if (!editid) {
      // Check if selected options are sequential
      const isSequential = selectedValues.every((selected, index) => {
        return selected.month === extraAllOptions[index].value;
      });

      if (!isSequential) {
        MySwal.fire({
          title: "Invalid Selection",
          text: "Selected months for Extra Practice must start sequentially from the first available month.",
          icon: "warning",
          showConfirmButton: true,
          confirmButtonText: "OK",
          customClass: {
            popup: "animate__animated animate__shakeX", // Applying animation
          },
        });

        // Reset the dropdown to the last valid state
        setFormData((prevFormData) => ({
          ...prevFormData,
          extraPracticeMonthsSelected: prevFormData.extraPracticeMonthsSelected,
        }));

        return;
      }
    }

    // Update the form data state with the selected values
    setFormData((prevFormData) => ({
      ...prevFormData,
      extraPracticeMonthsSelected: selectedValues,
    }));

    // Call the function to handle all available options for extra practice
    handleShowAllOptions(extraAllOptions, selectedValues);
  };

  const handleSubscriptionChange = (selectedOptions: any) => {
    const selectedValues = selectedOptions
      ? selectedOptions.map((option: any) => {
          let amount = 0;
          if (option.value === "Admission fees") {
            amount = admissionFee;
          } else if (option.value === "Development Fees") {
            amount = developmentFee;
          } else if (
            option.value === "Concession" ||
            option.value === "Discount"
          ) {
            // Set negative amount for Concession and Discount
            amount = -Math.abs(parseFloat(option.amount || 0));
          }
          return {
            type: option.value,
            amount,
          };
        })
      : [];
    setFormData((prevFormData) => ({
      ...prevFormData,
      subscriptionType: selectedValues,
    }));
  };

  useEffect(() => {
    setFormData((prevFormData) => ({
      ...prevFormData,
      id: editid,
    }));
  }, [editid]);

  useEffect(() => {
    const calculateTotalAmount = () => {
      const totalMonthAmount = formData.monthsSelected.reduce(
        (total, month) => total + parseFloat(month.amount || 0),
        0
      );
      const totalExtraPracticeMonthAmount =
        formData.extraPracticeMonthsSelected.reduce(
          (total, month) => total + parseFloat(month.amount || 0),
          0
        );
      const totalTypeAmount = formData.subscriptionType.reduce(
        (total, type) => total + parseFloat(type.amount || 0),
        0
      );
      return totalMonthAmount + totalExtraPracticeMonthAmount + totalTypeAmount;
    };
    setFormData((prevFormData) => ({
      ...prevFormData,
      amount: calculateTotalAmount(),
    }));
  }, [
    formData.monthsSelected,
    formData.extraPracticeMonthsSelected,
    formData.subscriptionType,
  ]);

  const handleFormSubmit = async (event: any) => {
    event.preventDefault();

    const hasValidAmount =
      formData.monthsSelected.some((month) => month.amount > 0) ||
      formData.extraPracticeMonthsSelected.some((month) => month.amount > 0) ||
      formData.subscriptionType.some((type) => type.amount > 0);

    if (!hasValidAmount) {
      alert(
        "Please select at least one of the Monthly Fees, Extra Practice Monthly Fees, or Other Fees"
      );
      return;
    }

    const formattedFormData = {
      ...formData,
      date: formData.date ? formData.date.split("/").reverse().join("-") : "",
      trainee: cutomerName,
      traineeid: cutomerid,
      paymentType,
      transactionNo,
      utrNo,
    };

    const reportData = {
      date: formattedFormData.date,
      income: parseFloat(formattedFormData.amount),
      expense: 0,
      noOfNewTraineeCricket: 0,
      noOfNewTraineeFootball: 0,
      noOfNewClubMember: 0,
      profitAndLoss: parseFloat(formattedFormData.amount),
    };

    if (!editid) {
      try {
        const res = await fetch("/api/subscription", {
          method: "POST",
          headers: {
            "Content-type": "application/json",
          },
          body: JSON.stringify(formattedFormData),
        });

        if (res.ok) {
          newTraineeadded();
          fetchSubscriptionData();
          setModal1(false);
          await fetch("/api/reports", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(reportData),
          });
        }
      } catch (error) {
        console.log(error);
      }
    } else {
      try {
        console.log("old amnount" + uamount);
        console.log("new amnount" + formattedFormData.amount);
        var newamout = formattedFormData.amount - uamount;
        console.log("change amount" + newamout);
        console.log("change date" + formattedFormData.date);
        const url = `/api/subscription/${editid}`;

        const reportData1 = {
          date: formattedFormData.date,
          income: parseFloat(newamout),
        };

        await fetch("/api/reports", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(reportData1),
        });

        const res = await fetch(url, {
          method: "PUT",
          headers: {
            "Content-type": "application/json",
          },
          body: JSON.stringify(formattedFormData),
        });

        if (!res.ok) {
          throw new Error("failed to update fees");
        }
        if (res.ok) {
          setModal1(false);
          fetchSubscriptionData();
          updatedSubscription();
        }
      } catch (error) {
        console.log(error);
      }
    }
  };

  const handleUpdateClick = async (value: any) => {
    try {
      console.log(value);
      const res = await fetch(`/api/subscription/${value}`, {
        method: "GET",
      });
      if (!res.ok) {
        throw new Error(`Failed to fetch data for ID: ${value}`);
      }
      const data = await res.json();

      const traineeOption = options.find(
        (option) => option.label.split(" - ")[0] === data.subscription.trainee
      );

      const maxBillNo = Math.max(
        ...initialRecords.map((record) => record.billNo),
        75550
      ); // Calculate the maximum bill number
      const newBillNo = maxBillNo + 1; // Update bill number
      setcutomerid(data.subscription.traineeid);
      setcutomerName(data.subscription.trainee);
      setExtraPractice(traineeOption.extraPractice === "Yes"); // Update extraPractice state
      setFormData({
        ...data.subscription,
        trainee: data.subscription.trainee,
        traineeid: data.subscription.traineeid,
        billNo: data.subscription.billNo,
        monthsSelected: Array.isArray(data.subscription.monthsSelected)
          ? data.subscription.monthsSelected.map((month) => ({
              ...month,
              amount: month.amount || regularMonthlyFee,
            }))
          : [],
        extraPracticeMonthsSelected: Array.isArray(
          data.subscription.extraPracticeMonthsSelected
        )
          ? data.subscription.extraPracticeMonthsSelected.map((month) => ({
              ...month,
              amount: month.amount || extraPracticeFee,
            }))
          : [],
        subscriptionType: Array.isArray(data.subscription.subscriptionType)
          ? data.subscription.subscriptionType.map((type) => ({
              ...type,
              amount:
                type.type === "Admission fees"
                  ? admissionFee
                  : type.type === "Development Fees"
                  ? developmentFee
                  : type.amount,
            }))
          : [],
        date: formatDate(data.subscription.date),
      });
      setUamount(data.subscription.amount);

      setEditid(data.subscription._id);
      setPaymentType(data.subscription.paymentType || "cash");
      setTransactionNo(data.subscription.transactionNo || "");
      setUtrNo(data.subscription.utrNo || "");

      const existingData = await fetchTraineeSubscriptionData(
        data.subscription.traineeid,
        data.subscription.year
      );
      const usedMonths = existingData.flatMap((sub) =>
        Array.isArray(sub.monthsSelected)
          ? sub.monthsSelected.map((month) => month.month)
          : []
      );
      const usedExtraPracticeMonths = existingData.flatMap((sub) =>
        Array.isArray(sub.extraPracticeMonthsSelected)
          ? sub.extraPracticeMonthsSelected.map((month) => month.month)
          : []
      );
      const usedYears = existingData.map((sub) => sub.year);
      setUsedMonths(usedMonths);
      setUsedExtraPracticeMonths(usedExtraPracticeMonths);
      setUsedYears(usedYears);

      setModal1(true);
      if (res.ok) {
        fetchSubscriptionData();
      }
    } catch (error) {
      console.error("Fetch error:", error);
      alert(`Error: ${error.message}`);
    }
  };

  const generatePdf = (row) => {
    const doc = new jsPDF();
    const marginY = 138;
    const shiftY = 5;
    const maxRowsPerPage = 7;

    const loadLogo = (logoUrl) => {
      return new Promise((resolve, reject) => {
        const logoImg = new Image();
        logoImg.src = logoUrl;
        logoImg.onload = () => resolve(logoImg);
        logoImg.onerror = (err) => reject(err);
      });
    };

    const addBillContent = async (startY, isNewPage) => {
      const logoUrl = "/assets/images/logo.png";
      try {
        const logoImg = await loadLogo(logoUrl);
        if (isNewPage) {
          doc.addPage();
          startY = 10; // Reset startY for the new page
        }

        doc.addImage(logoImg, "PNG", 15, startY, 20, 20);
        doc.setFontSize(10);
        doc.text(`Bill No: ${row.billNo}`, 190, startY + 5, {
          align: "right",
        });
        doc.text(`Date: ${row.date}`, 190, startY + 10, { align: "right" });
        doc.setFontSize(22);
        doc.text("PALLISREE", 105, startY + 10, { align: "center" });

        const additionalText = `ESTD: 1946\nRegd. Under Societies Act. XXVI of 1961 • Regd. No. S/5614\nAffiliated to North 24 Parganas District Sports Association through BBSZSA\nBIDHANPALLY • MADHYAMGRAM • KOLKATA - 700129`;
        doc.setFontSize(8);
        doc.text(additionalText, 105, startY + 15, { align: "center" });
        doc.setFontSize(12);
        doc.setFont("bold");
        doc.text(`Name: ${row.trainee}`, 15, startY + 30);

        let tableRows = [];

        if (row.monthsSelected.length > 0) {
          tableRows.push(["Monthly Fees", row.year, ""]);
          tableRows = tableRows.concat(
            row.monthsSelected.map((month) => [month.month, "", month.amount])
          );
        }

        if (row.extraPracticeMonthsSelected.some((month) => month.amount)) {
          tableRows.push(["Extra Practice Monthly Fees", row.year, ""]);
          tableRows = tableRows.concat(
            row.extraPracticeMonthsSelected
              .filter((month) => month.amount)
              .map((month) => [month.month, "", month.amount])
          );
        }

        if (row.subscriptionType.some((type) => type.amount)) {
          tableRows.push(["Other", row.year, ""]);
          tableRows = tableRows.concat(
            row.subscriptionType
              .filter((type) => type.amount)
              .map((type) => [type.type, "", type.amount])
          );
        }

        autoTable(doc, {
          startY: startY + 35,
          head: [["Description", "Year", "Amount"]],
          body: tableRows,
          theme: "grid",
          headStyles: { fillColor: [0, 0, 139] },
          columnStyles: { 2: { halign: "right" } },
          styles: { fontSize: 10 },
          alternateRowStyles: { fillColor: [240, 240, 240] },
        });

        const totalAmount =
          row.monthsSelected.reduce(
            (total, month) => total + parseFloat(month.amount || 0),
            0
          ) +
          row.extraPracticeMonthsSelected.reduce(
            (total, month) => total + parseFloat(month.amount || 0),
            0
          ) +
          row.subscriptionType.reduce(
            (total, type) => total + parseFloat(type.amount || 0),
            0
          );

        const totalAmountStartY = doc.autoTable.previous.finalY + 2;
        doc.setFontSize(10);
        doc.setFont("bold");
        doc.text("Total Amount", 15, totalAmountStartY + 5);
        doc.text(`Rs. ${totalAmount} INR`, 190, totalAmountStartY + 5, {
          align: "right",
        });

        doc.line(10, totalAmountStartY, 200, totalAmountStartY);
        doc.line(10, totalAmountStartY + 10, 200, totalAmountStartY + 10);

        doc.setFontSize(8);
        doc.setFont("italic");
        let paymentDetails = `Payment Type: ${row.paymentType}`;
        if (row.paymentType === "upi") {
          if (row.transactionNo) {
            paymentDetails += `, Transaction No: ${row.transactionNo}`;
          }
          if (row.utrNo) {
            paymentDetails += `, UTR No: ${row.utrNo}`;
          }
        }
        doc.text(paymentDetails, 15, totalAmountStartY + 15);

        const pageHeight = doc.internal.pageSize.height;
        doc.setFontSize(12);
        doc.text("Collector", 15, pageHeight - 10, { align: "left" });
        doc.text("General Secretary", 190, pageHeight - 10, { align: "right" });
      } catch (error) {
        console.error("Error loading logo image:", error);
      }
    };

    const generateAllBills = async () => {
      const totalTableRows =
        row.monthsSelected.length +
        row.extraPracticeMonthsSelected.length +
        row.subscriptionType.length;
      const isNewPageNeeded = totalTableRows > maxRowsPerPage;
      if (isNewPageNeeded) {
        const pmarginY = 10;
        await addBillContent(pmarginY, false);
        await addBillContent(shiftY, isNewPageNeeded);
        doc.save(`subscription_${row.trainee}.pdf`);
      } else {
        const pmarginY = 138;
        await addBillContent(pmarginY, false);
        await addBillContent(shiftY, isNewPageNeeded);
        doc.save(`subscription_${row.trainee}.pdf`);
      }
    };

    generateAllBills();
  };
  const parseDate = (dateString: string) => {
    const [day, month, year] = dateString.split("/").map(Number);
    return new Date(year, month - 1, day); // month is 0-indexed in JavaScript Date
  };
  const getMonthOptions = (year, lastSelectedMonth) => {
    if (joiningDate) {
      const joiningYear = new Date(joiningDate).getFullYear();
      const joiningMonth = new Date(joiningDate).getMonth(); // 0-indexed

      if (parseInt(year) < joiningYear) {
        // If the selected year is before the joining year, show no months
        return [];
      }

      let startMonthIndex;

      if (year === "2024") {
        // For 2024, start from April if joiningDate is before April
        const aprilIndex = 3; // April's index
        startMonthIndex =
          joiningMonth > aprilIndex ? joiningMonth + 1 : aprilIndex;
      } else if (parseInt(year) === joiningYear) {
        // If the selected year matches the joining year, start from the month after the joining month
        startMonthIndex = joiningMonth + 1;
      } else {
        // If the selected year is after the joining year, all months are available
        startMonthIndex = 0; // Allow all months
      }

      let availableMonths = allMonthsOptions.filter(
        (month, index) => index >= startMonthIndex
      );

      if (lastSelectedMonth) {
        const lastSelectedMonthIndex = allMonthsOptions.findIndex(
          (month) => month.value === lastSelectedMonth
        );

        if (lastSelectedMonthIndex !== -1) {
          availableMonths = availableMonths.filter(
            (month, index) => index >= lastSelectedMonthIndex
          );
        }
      }

      return availableMonths;
    }

    return allMonthsOptions;
  };

  return (
    <div className="panel mt-6">
      <h5 className="mb-5 text-lg font-semibold dark:text-white-light">Fees</h5>

      <div className="mb-4.5 flex flex-col justify-between gap-5 md:flex-row md:items-center">
        <div className="flex flex-wrap items-center">
          <div className="mb-5">
            <div className="flex items-center justify-center"></div>
            <Transition appear show={modal1} as={Fragment}>
              <Dialog as="div" open={modal1} onClose={() => setModal1(false)}>
                <Transition.Child
                  as={Fragment}
                  enter="ease-out duration-300"
                  enterFrom="opacity-0"
                  enterTo="opacity-100"
                  leave="ease-in duration-200"
                  leaveFrom="opacity-100"
                  leaveTo="opacity-0"
                >
                  <div className="fixed inset-0" />
                </Transition.Child>
                <div className="fixed inset-0 z-[999] overflow-y-auto bg-[black]/60">
                  <div className="flex min-h-screen items-start justify-center px-4">
                    <Transition.Child
                      as={Fragment}
                      enter="ease-out duration-300"
                      enterFrom="opacity-0 scale-95"
                      enterTo="opacity-100 scale-100"
                      leave="ease-in duration-200"
                      leaveFrom="opacity-100 scale-100"
                      leaveTo="opacity-0 scale-95"
                    >
                      <Dialog.Panel
                        as="div"
                        className="panel my-8 w-full max-w-lg overflow-hidden rounded-lg border-0 p-0 text-black dark:text-white-dark"
                      >
                        <div className="flex items-center justify-between bg-[#fbfbfb] px-5 py-3 dark:bg-[#121c2c]">
                          <div className="text-lg font-bold">
                            {editid ? "Update Fees" : "Add Fees"}
                          </div>
                          <button
                            type="button"
                            className="text-white-dark hover:text-dark"
                            onClick={() => setModal1(false)}
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="24"
                              height="24"
                              viewBox="0 0 24 24"
                            >
                              <path d="M24 20.188l-8.315-8.209 8.2-8.282-3.697-3.697-8.212 8.318-8.31-8.203-3.666 3.666 8.321 8.24-8.206 8.313 3.666 3.666 8.237-8.318 8.285 8.203z" />
                            </svg>
                          </button>
                        </div>
                        <div className="p-5">
                          <div className="mb-5">
                            <form
                              className="space-y-5"
                              onSubmit={handleFormSubmit}
                            >
                              <div>
                                <label htmlFor="billNo">Bill No</label>
                                <input
                                  id="billNo"
                                  type="text"
                                  name="billNo"
                                  placeholder="Enter Bill No"
                                  onChange={handleChange}
                                  className="form-input"
                                  value={formData.billNo}
                                  readOnly
                                  required
                                />
                              </div>
                              <div>
                                <label htmlFor="year">Year</label>
                                <select
                                  id="year"
                                  name="year"
                                  className="form-select"
                                  onChange={async (e) => {
                                    handleChange(e);
                                    await updateUsedMonths(
                                      formData.traineeid,
                                      e.target.value
                                    );
                                  }}
                                  value={formData.year}
                                  required
                                >
                                  <option value="">Select Year</option>

                                  {editid
                                    ? years
                                        .filter((year) =>
                                          usedYears.includes(year)
                                        )
                                        .map((year) => (
                                          <option key={year} value={year}>
                                            {year}
                                          </option>
                                        ))
                                    : years
                                        .filter(
                                          (year) => !usedYears.includes(year)
                                        )
                                        .map((year) => (
                                          <option key={year} value={year}>
                                            {year}
                                          </option>
                                        ))}
                                </select>
                              </div>

                              <div>
                                {editid ? (
                                  <div>
                                    <label htmlFor="trainee">Trainee</label>
                                    <div className="form-input">
                                      {formData.trainee}
                                    </div>{" "}
                                    {/* Display the trainee's name */}
                                  </div>
                                ) : (
                                  <div>
                                    <label htmlFor="trainee">Trainee</label>
                                    <Select
                                      required
                                      placeholder="Select an option"
                                      options={options}
                                      value={
                                        formData.trainee
                                          ? options.find(
                                              (option) =>
                                                option.value ===
                                                formData.trainee
                                            )
                                          : null
                                      }
                                      onChange={async (t) => {
                                        const traineeName = getFirstName(
                                          t.label
                                        );
                                        setcutomerName(traineeName);
                                        setcutomerid(t.value);
                                        setJoiningDate(
                                          parseDate(t.joiningDate)
                                        );

                                        // Set extraPractice state based on selection
                                        setExtraPractice(
                                          t.extraPractice === "Yes"
                                        );

                                        // Set traineeType and Regular Monthly Fee based on selection
                                        setFormData((prevFormData) => ({
                                          ...prevFormData,
                                          trainee: t.value,
                                          traineeid: t.value,
                                          traineeType: t.traineeType, // Capture traineeType
                                        }));

                                        await updateUsedMonths(
                                          t.value,
                                          formData.year
                                        );
                                      }}
                                    />
                                  </div>
                                )}
                              </div>

                              <div>
                                <label htmlFor="date">Date</label>
                                <div>
                                  {editid ? (
                                    <label>{formData.date}</label> // Display the date as fixed text if in edit mode
                                  ) : (
                                    <Flatpickr
                                      id="date"
                                      value={formData.date}
                                      options={{
                                        dateFormat: "d/m/Y",
                                        position: isRtl
                                          ? "auto right"
                                          : "auto left",
                                      }}
                                      className="form-input"
                                      onChange={handleDateChange}
                                      required
                                    />
                                  )}
                                </div>
                              </div>
                              <div>
                                <label htmlFor="monthsSelected">
                                  Regular Monthly
                                </label>
                                <Select
                                  id="monthsSelected"
                                  name="monthsSelected"
                                  options={getMonthOptions(
                                    formData.year
                                  ).filter(
                                    (month) => !usedMonths.includes(month.value)
                                  )}
                                  isMulti
                                  onChange={handleMonthsSelectedChange}
                                  value={formData.monthsSelected.map(
                                    (month) => ({
                                      value: month.month,
                                      label: month.month,
                                    })
                                  )}
                                  className="form-select"
                                />
                                {formData.monthsSelected.map((month, index) => (
                                  <div key={index}>
                                    <label htmlFor={`monthAmount-${index}`}>
                                      {month.month} Amount
                                    </label>
                                    <input
                                      id={`monthAmount-${index}`}
                                      type="number"
                                      name={`monthAmount-${index}`}
                                      placeholder="Enter amount"
                                      onChange={(e) =>
                                        handleMonthAmountChange(
                                          index,
                                          e.target.value
                                        )
                                      }
                                      className="form-input"
                                      value={month.amount}
                                      required
                                    />
                                  </div>
                                ))}
                              </div>

                              {/* Conditional rendering based on extraPractice value */}
                              {extraPractice && (
                                <div>
                                  <label htmlFor="extraPracticeMonthsSelected">
                                    Extra Practice Monthly Fees
                                  </label>
                                  <Select
                                    id="extraPracticeMonthsSelected"
                                    name="extraPracticeMonthsSelected"
                                    options={getMonthOptions(
                                      formData.year
                                    ).filter(
                                      (month) =>
                                        !usedExtraPracticeMonths.includes(
                                          month.value
                                        )
                                    )}
                                    isMulti
                                    onChange={
                                      handleExtraPracticeMonthsSelectedChange
                                    }
                                    value={formData.extraPracticeMonthsSelected.map(
                                      (month) => ({
                                        value: month.month,
                                        label: month.month,
                                      })
                                    )}
                                    className="form-select"
                                  />
                                  {formData.extraPracticeMonthsSelected.map(
                                    (month, index) => (
                                      <div key={index}>
                                        <label
                                          htmlFor={`extraPracticeMonthAmount-${index}`}
                                        >
                                          {month.month} Amount
                                        </label>
                                        <input
                                          id={`extraPracticeMonthAmount-${index}`}
                                          type="number"
                                          name={`extraPracticeMonthAmount-${index}`}
                                          placeholder="Enter amount"
                                          onChange={(e) =>
                                            handleExtraPracticeMonthAmountChange(
                                              index,
                                              e.target.value
                                            )
                                          }
                                          className="form-input"
                                          value={month.amount}
                                          required
                                        />
                                      </div>
                                    )
                                  )}
                                </div>
                              )}

                              <div>
                                <label htmlFor="subscriptionType">Other </label>
                                <Select
                                  id="subscriptionType"
                                  name="subscriptionType"
                                  options={subscriptionOptions}
                                  isMulti
                                  onChange={handleSubscriptionChange}
                                  value={formData.subscriptionType.map(
                                    (type) => ({
                                      value: type.type,
                                      label: type.type,
                                    })
                                  )}
                                  className="form-select"
                                />
                                {formData.subscriptionType.map(
                                  (type, index) => (
                                    <div key={index}>
                                      <label htmlFor={`typeAmount-${index}`}>
                                        {type.type} Amount
                                      </label>
                                      <input
                                        id={`typeAmount-${index}`}
                                        type="number"
                                        name={`typeAmount-${index}`}
                                        placeholder="Enter amount"
                                        onChange={(e) =>
                                          handleTypeAmountChange(
                                            index,
                                            e.target.value
                                          )
                                        }
                                        className="form-input"
                                        value={type.amount}
                                      />
                                    </div>
                                  )
                                )}
                              </div>
                              <div>
                                <label htmlFor="paymentType">
                                  Payment Type
                                </label>
                                <select
                                  id="paymentType"
                                  name="paymentType"
                                  className="form-select"
                                  onChange={(e) =>
                                    setPaymentType(e.target.value)
                                  }
                                  value={paymentType}
                                >
                                  <option value="cash">Cash</option>
                                  <option value="upi">UPI</option>
                                </select>
                              </div>

                              {paymentType === "upi" && (
                                <div>
                                  <label htmlFor="transactionNo">
                                    Transaction No
                                  </label>
                                  <input
                                    id="transactionNo"
                                    type="text"
                                    name="transactionNo"
                                    className="form-input"
                                    onChange={(e) => {
                                      setTransactionNo(e.target.value);
                                    }}
                                    value={transactionNo}
                                  />
                                </div>
                              )}

                              {paymentType === "upi" && (
                                <div>
                                  <label htmlFor="utrNo">UTR No</label>
                                  <input
                                    id="utrNo"
                                    type="text"
                                    name="utrNo"
                                    className="form-input"
                                    onChange={(e) => setUtrNo(e.target.value)}
                                    value={utrNo}
                                  />
                                </div>
                              )}

                              <div>
                                <label htmlFor="amount">Total Amount</label>
                                <input
                                  id="amount"
                                  type="text"
                                  name="amount"
                                  placeholder="Enter amount"
                                  onChange={handleChange}
                                  className="form-input"
                                  value={formData.amount}
                                  readOnly
                                />
                              </div>
                              <button
                                type="submit"
                                className="btn btn-primary !mt-6"
                              >
                                Submit
                              </button>
                            </form>
                          </div>
                        </div>
                      </Dialog.Panel>
                    </Transition.Child>
                  </div>
                </div>
              </Dialog>
            </Transition>
          </div>
          <button
            type="button"
            className="btn btn-primary my-5"
            onClick={() => getcustomeval()}
          >
            <IconPlus className="ltr:mr-2 rtl:ml-2" />
            Fees
          </button>
          <button
            type="button"
            onClick={() => exportTable("csv")}
            className="btn btn-primary btn-sm m-1 "
          >
            <IconFile className="h-5 w-5 ltr:mr-2 rtl:ml-2" />
            CSV
          </button>
        </div>

        <input
          type="text"
          className="form-input w-auto"
          placeholder="Search..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>
      <div className="datatables">
        <DataTable
          highlightOnHover
          className="table-hover whitespace-nowrap"
          records={recordsData}
          columns={[
            { accessor: "billNo", title: "Bill No", sortable: true },
            { accessor: "trainee", sortable: true },
            { accessor: "year", sortable: true },
            { accessor: "date", sortable: true },
            {
              accessor: "monthsSelected",
              title: "Monthly Fees",
              sortable: true,
              render: ({ monthsSelected }) =>
                monthsSelected
                  .map((month) => `${month.month}: ${month.amount}`)
                  .join(", "),
            },
            {
              accessor: "extraPracticeMonthsSelected",
              title: "Extra Monthly fees",
              sortable: true,
              render: ({ extraPracticeMonthsSelected }) =>
                extraPracticeMonthsSelected
                  .map((month) => `${month.month}: ${month.amount}`)
                  .join(", "),
            },
            {
              accessor: "subscriptionType",
              title: "Other",
              sortable: true,
              render: ({ subscriptionType }) =>
                subscriptionType
                  .map((type) => `${type.type}: ${type.amount}`)
                  .join(", "),
            },
            { accessor: "amount", sortable: true },
            {
              accessor: "paymentType",
              title: "Payment Type",
              sortable: true,
            },
            {
              accessor: "transactionNo",
              title: "Transaction No",
              sortable: true,
            },
            {
              accessor: "utrNo",
              title: "UTR No",
              sortable: true,
            },
            {
              accessor: "action",
              title: "Action",
              titleClassName: "!text-center",
              render: (row) => (
                <div className="mx-auto flex w-max items-center gap-4">
                  <Tippy content="Edit Fees">
                    <button
                      type="button"
                      onClick={() => handleUpdateClick(row.id)}
                      className="btn btn-primary bg-primary"
                    >
                      <IconPencil />
                    </button>
                  </Tippy>

                  <Tippy content="Delete Fees">
                    <button
                      type="button"
                      onClick={() => handleDeleteClick(row.id)}
                      className="btn btn-primary bg-red-500"
                    >
                      <IconXCircle />
                    </button>
                  </Tippy>

                  <Tippy content="Download PDF">
                    <button
                      type="button"
                      onClick={() => generatePdf(row)}
                      className="btn btn-primary bg-blue-500"
                    >
                      <IconFile />
                    </button>
                  </Tippy>
                </div>
              ),
            },
          ]}
          totalRecords={initialRecords.length}
          recordsPerPage={pageSize}
          page={page}
          onPageChange={(p) => setPage(p)}
          recordsPerPageOptions={PAGE_SIZES}
          onRecordsPerPageChange={setPageSize}
          sortStatus={sortStatus}
          onSortStatusChange={setSortStatus}
          minHeight={200}
          paginationText={({ from, to, totalRecords }) =>
            `Showing ${from} to ${to} of ${totalRecords} entries`
          }
        />
      </div>

      <Transition appear show={modal2} as={Fragment}>
        <Dialog as="div" open={modal2} onClose={() => setModal2(false)}>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0" />
          </Transition.Child>
          <div className="fixed inset-0 z-[999] overflow-y-auto bg-[black]/60">
            <div className="flex min-h-screen items-center justify-center px-4">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel
                  as="div"
                  className="panel my-8 w-full max-w-lg overflow-hidden rounded-lg border-0 p-0 text-black dark:text-white-dark"
                >
                  <div className="flex items-center justify-between bg-[#fbfbfb] px-5 py-3 dark:bg-[#121c2c]">
                    <h5 className="text-lg font-bold">Delete</h5>
                    <button
                      type="button"
                      className="text-white-dark hover:text-dark"
                      onClick={() => setModal2(false)}
                    ></button>
                  </div>
                  <div className="p-5">
                    <p>Do you want to delete this Fees?</p>
                    <div className="mt-8 flex items-center justify-end">
                      <button
                        type="button"
                        className="btn btn-outline-danger"
                        onClick={() => setModal2(false)}
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        className="btn btn-primary ltr:ml-4 rtl:mr-4"
                        onClick={handleDeleteData}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
    </div>
  );
};

export default ComponentsDatatablesSubscription;