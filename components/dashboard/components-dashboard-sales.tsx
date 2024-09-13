"use client";

import Dropdown from "@/components/dropdown";
import IconHorizontalDots from "@/components/icon/icon-horizontal-dots";
import { IRootState } from "@/store";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { useSelector } from "react-redux";
import axios from "axios";

// Dynamically import ReactApexChart with no SSR
const ReactApexChart = dynamic(() => import("react-apexcharts"), {
  ssr: false,
});

const ComponentsDashboardSales = () => {
  const isDark = useSelector(
    (state: IRootState) =>
      state.themeConfig.theme === "dark" || state.themeConfig.isDarkMode
  );
  const isRtl = useSelector(
    (state: IRootState) => state.themeConfig.rtlClass === "rtl"
  );

  const currentYear = new Date().getFullYear();
  const currentMonthIndex = new Date().getMonth(); // 0-based index for the current month
  const isYear2024 = currentYear === 2024;

  // Define months for different scenarios
  const allMonthsOptions = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  const monthsForCategories = isYear2024
    ? allMonthsOptions.slice(3, currentMonthIndex + 1) // For 2024, April to December
    : allMonthsOptions.slice(0, currentMonthIndex + 1); // For other years, January to December

  const [isMounted, setIsMounted] = useState(false);
  const [totalProfit, setTotalProfit] = useState(0);
  const [salesByCategory, setSalesByCategory] = useState<any>({
    series: [0, 0, 0],
    options: {
      chart: {
        type: "donut",
        height: 460,
        fontFamily: "Nunito, sans-serif",
      },
      dataLabels: {
        enabled: false,
      },
      stroke: {
        show: true,
        width: 25,
        colors: isDark ? "#0e1726" : "#fff",
      },
      colors: isDark
        ? ["#5c1ac3", "#e2a03f", "#e7515a", "#e2a03f"]
        : ["#e2a03f", "#5c1ac3", "#e7515a"],
      legend: {
        position: "bottom",
        horizontalAlign: "center",
        fontSize: "14px",
        markers: {
          width: 10,
          height: 10,
          offsetX: -2,
        },
        height: 50,
        offsetY: 20,
      },
      plotOptions: {
        pie: {
          donut: {
            size: "65%",
            background: "transparent",
            labels: {
              show: true,
              name: {
                show: true,
                fontSize: "29px",
                offsetY: -10,
              },
              value: {
                show: true,
                fontSize: "26px",
                color: isDark ? "#bfc9d4" : undefined,
                offsetY: 16,
                formatter: (val: any) => {
                  return val;
                },
              },
              total: {
                show: true,
                label: "Total",
                color: "#888ea8",
                fontSize: "29px",
                formatter: (w: any) => {
                  return w.globals.seriesTotals.reduce(function (
                    a: any,
                    b: any
                  ) {
                    return a + b;
                  },
                  0);
                },
              },
            },
          },
        },
      },
      labels: ["Trainee(F)", "Trainee(M)", "Football"],
      states: {
        hover: {
          filter: {
            type: "none",
            value: 0.15,
          },
        },
        active: {
          filter: {
            type: "none",
            value: 0.15,
          },
        },
      },
    },
  });

  const [revenueChart, setRevenueChart] = useState<any>({
    series: [
      {
        name: "Income",
        data: [],
      },
      {
        name: "Expense",
        data: [],
      },
    ],
    options: {
      chart: {
        height: 325,
        type: "area",
        fontFamily: "Nunito, sans-serif",
        zoom: {
          enabled: false,
        },
        toolbar: {
          show: false,
        },
      },
      dataLabels: {
        enabled: false,
      },
      stroke: {
        show: true,
        curve: "smooth",
        width: 2,
        lineCap: "square",
      },
      dropShadow: {
        enabled: true,
        opacity: 0.2,
        blur: 10,
        left: -7,
        top: 22,
      },
      colors: isDark ? ["#2196F3", "#E7515A"] : ["#1B55E2", "#E7515A"],
      markers: {
        discrete: [
          {
            seriesIndex: 0,
            dataPointIndex: 6,
            fillColor: "#1B55E2",
            strokeColor: "transparent",
            size: 7,
          },
          {
            seriesIndex: 1,
            dataPointIndex: 5,
            fillColor: "#E7515A",
            strokeColor: "transparent",
            size: 7,
          },
        ],
      },
      labels: [
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "May",
        "Jun",
        "Jul",
        "Aug",
        "Sep",
        "Oct",
        "Nov",
        "Dec",
      ],
      xaxis: {
        axisBorder: {
          show: false,
        },
        axisTicks: {
          show: false,
        },
        crosshairs: {
          show: true,
        },
        labels: {
          offsetX: isRtl ? 2 : 0,
          offsetY: 5,
          style: {
            fontSize: "12px",
            cssClass: "apexcharts-xaxis-title",
          },
        },
      },
      yaxis: {
        tickAmount: 7,
        labels: {
          formatter: (value: number) => {
            return value / 1000 + "K";
          },
          offsetX: isRtl ? -30 : -10,
          offsetY: 0,
          style: {
            fontSize: "12px",
            cssClass: "apexcharts-yaxis-title",
          },
        },
        opposite: isRtl ? true : false,
      },
      grid: {
        borderColor: isDark ? "#191E3A" : "#E0E6ED",
        strokeDashArray: 5,
        xaxis: {
          lines: {
            show: false,
          },
        },
        yaxis: {
          lines: {
            show: true,
          },
        },
        padding: {
          top: 0,
          right: 0,
          bottom: 0,
          left: 0,
        },
      },
      legend: {
        position: "top",
        horizontalAlign: "right",
        fontSize: "16px",
        markers: {
          width: 10,
          height: 10,
          offsetX: -2,
        },
        itemMargin: {
          horizontal: 10,
          vertical: 5,
        },
      },
      tooltip: {
        marker: {
          show: true,
        },
        x: {
          show: false,
        },
      },
      fill: {
        type: "gradient",
        gradient: {
          shadeIntensity: 1,
          inverseColors: false,
          opacityFrom: isDark ? 0.19 : 0.28,
          opacityTo: 0.05,
          stops: isDark ? [100, 100] : [45, 100],
        },
      },
    },
  });

  const [columnChart, setColumnChart] = useState<any>({
    series: [
      {
        name: "Paid",
        data: [],
      },
      {
        name: "Non-Paid",
        data: [],
      },
    ],
    options: {
      chart: {
        height: 300,
        type: "bar",
        zoom: {
          enabled: false,
        },
        toolbar: {
          show: false,
        },
      },
      colors: ["#805dca", "#e7515a"],
      dataLabels: {
        enabled: false,
      },
      stroke: {
        show: true,
        width: 2,
        colors: ["transparent"],
      },
      plotOptions: {
        bar: {
          horizontal: false,
          columnWidth: "55%",
          endingShape: "rounded",
        },
      },
      grid: {
        borderColor: isDark ? "#191e3a" : "#e0e6ed",
      },
      xaxis: {
        categories: monthsForCategories,
        axisBorder: {
          color: isDark ? "#191e3a" : "#e0e6ed",
        },
      },
      yaxis: {
        opposite: isRtl ? true : false,
        labels: {
          offsetX: isRtl ? -10 : 0,
        },
      },
      tooltip: {
        theme: isDark ? "dark" : "light",
        y: {
          formatter: function (val: any) {
            return val;
          },
        },
      },
    },
  });

  const [simpleColumnStacked, setSimpleColumnStacked] = useState<any>({
    series: [
      {
        name: "New Trainee(cricket)",
        data: [],
      },
      {
        name: "New Trainee(Football)",
        data: [],
      },
      {
        name: "New Clubmember",
        data: [],
      },
    ],
    options: {
      chart: {
        height: 300,
        type: "bar",
        stacked: true,
        zoom: {
          enabled: true,
        },
        toolbar: {
          show: false,
        },
      },
      colors: ["#2196f3", "#3b3f5c", "#E1C16E"],
      responsive: [
        {
          breakpoint: 480,
          options: {
            legend: {
              position: "bottom",
              offsetX: -10,
              offsetY: 5,
            },
          },
        },
      ],
      plotOptions: {
        bar: {
          horizontal: false,
        },
      },
      xaxis: {
        type: "datetime",
        categories: [],
        axisBorder: {
          color: isDark ? "#191e3a" : "#e0e6ed",
        },
      },
      yaxis: {
        opposite: isRtl ? true : false,
        labels: {
          offsetX: isRtl ? -20 : 0,
        },
      },
      grid: {
        borderColor: isDark ? "#191e3a" : "#e0e6ed",
      },
      legend: {
        position: "right",
        offsetY: 40,
      },
      tooltip: {
        theme: isDark ? "dark" : "light",
      },
      fill: {
        opacity: 0.8,
      },
    },
  });

  useEffect(() => {
    setIsMounted(true);

    const fetchSalesData = async () => {
      try {
        const res = await fetch("/api/studentform");
        const data = await res.json();

        const femaleCricketTrainees = data.studentforms.filter(
          (form: any) =>
            form.gender === "Female" && form.sportstype === "Cricket"
        ).length;

        const maleCricketTrainees = data.studentforms.filter(
          (form: any) => form.gender === "Male" && form.sportstype === "Cricket"
        ).length;

        const footballTrainees = data.studentforms.filter(
          (form: any) => form.sportstype === "Football"
        ).length;

        setSalesByCategory((prevState: any) => ({
          ...prevState,
          series: [
            femaleCricketTrainees,
            maleCricketTrainees,
            footballTrainees,
          ],
        }));
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    const fetchRevenueData = async () => {
      try {
        const res = await fetch("/api/reports");
        const data = await res.json();

        const monthlyIncome: number[] = Array(12).fill(0);
        const monthlyExpense: number[] = Array(12).fill(0);

        let totalIncome = 0;
        let totalExpense = 0;

        data.reports.forEach((report: any) => {
          const month = new Date(report.date).getMonth();
          monthlyIncome[month] += report.income;
          monthlyExpense[month] += report.expense;

          totalIncome += report.income;
          totalExpense += report.expense;
        });

        const calculatedProfit = totalIncome - totalExpense;

        setRevenueChart((prevState: any) => ({
          ...prevState,
          series: [
            { name: "Income", data: monthlyIncome },
            { name: "Expense", data: monthlyExpense },
          ],
        }));

        setTotalProfit(calculatedProfit);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    const fetchTraineeData = async () => {
      try {
        const res = await fetch("/api/reports");
        const data = await res.json();

        const currentMonth = new Date().getMonth();
        const currentYear = new Date().getFullYear();

        let cricketTrainees: number[] = Array(31).fill(0);
        let footballTrainees: number[] = Array(31).fill(0);
        let clubMembers: number[] = Array(31).fill(0);
        let categories: string[] = [];

        data.reports.forEach((report: any) => {
          const reportDate = new Date(report.date);
          if (
            reportDate.getMonth() === currentMonth &&
            reportDate.getFullYear() === currentYear
          ) {
            const day = reportDate.getDate() - 1; // Using day as index
            cricketTrainees[day] += report.noOfNewTraineeCricket;
            footballTrainees[day] += report.noOfNewTraineeFootball;
            clubMembers[day] += report.noOfNewClubMember;
            categories[day] = reportDate.toISOString().split("T")[0]; // YYYY-MM-DD format
          }
        });

        cricketTrainees = cricketTrainees.filter((val) => val !== 0);
        footballTrainees = footballTrainees.filter((val) => val !== 0);
        clubMembers = clubMembers.filter((val) => val !== 0);
        categories = categories.filter((val) => val !== undefined);

        setSimpleColumnStacked({
          series: [
            { name: "New Trainee(cricket)", data: cricketTrainees },
            { name: "New Trainee(Football)", data: footballTrainees },
            { name: "New Clubmember", data: clubMembers },
          ],
          options: {
            ...simpleColumnStacked.options,
            xaxis: {
              ...simpleColumnStacked.options.xaxis,
              categories: categories,
            },
          },
        });
      } catch (error) {
        console.error("Error fetching trainee data:", error);
      }
    };

    const fetchTraineePaymentData = async () => {
      try {
        const traineeResponse = await axios.get("/api/studentform");
        const subscriptionResponse = await axios.get("/api/subscription");

        const trainees = traineeResponse.data.studentforms;
        const subscriptions = subscriptionResponse.data.subscriptions;

        // Determine the months to check based on the year
        let monthsToCheck;
        if (isYear2024) {
          monthsToCheck = allMonthsOptions.slice(3, currentMonthIndex + 1); // April to current month
        } else {
          monthsToCheck = allMonthsOptions.slice(0, currentMonthIndex + 1); // January to current month
        }

        console.log("Months to check:", monthsToCheck);

        let paidCounts = Array(monthsToCheck.length).fill(0);
        let nonPaidCounts = Array(monthsToCheck.length).fill(0);

        trainees.forEach((trainee) => {
          const traineeSubscriptions = subscriptions.filter(
            (sub) =>
              sub.traineeid === trainee._id &&
              sub.year === currentYear.toString()
          );

          // Get all the months this trainee has paid for, including both monthsSelected and extraPracticeMonthsSelected
          let paidMonths = traineeSubscriptions.flatMap((sub) =>
            [...sub.monthsSelected, ...sub.extraPracticeMonthsSelected].map(
              (month) => month.month
            )
          );

          // Remove duplicates from paidMonths
          paidMonths = [...new Set(paidMonths)];

          console.log(`Trainee ID: ${trainee._id} - Paid months:`, paidMonths);

          // Check if the trainee has paid for each month in monthsToCheck
          monthsToCheck.forEach((month, index) => {
            if (paidMonths.includes(month)) {
              paidCounts[index] += 1;
            } else {
              nonPaidCounts[index] += 1;
            }
          });
        });

        console.log("Paid Counts:", paidCounts);
        console.log("Non-Paid Counts:", nonPaidCounts);

        setColumnChart((prevState: any) => ({
          ...prevState,
          series: [
            { name: "Paid", data: paidCounts },
            { name: "Non-Paid", data: nonPaidCounts },
          ],
          options: {
            ...prevState.options,
            xaxis: {
              ...prevState.options.xaxis,
              categories: monthsToCheck,
            },
          },
        }));
      } catch (error) {
        console.error("Error fetching trainee payment data:", error);
      }
    };

    fetchSalesData();
    fetchRevenueData();
    fetchTraineeData();
    fetchTraineePaymentData();
  }, [isDark, isRtl]);

  return (
    <>
      <div>
        <ul className="flex space-x-2 rtl:space-x-reverse">
          <li>
            <Link href="/" className="text-primary hover:underline">
              Dashboard
            </Link>
          </li>
          <li className="before:content-['/'] ltr:before:mr-2 rtl:before:ml-2">
            <span>Sales</span>
          </li>
        </ul>

        <div className="pt-5">
          <div className="mb-6 grid gap-6 xl:grid-cols-3">
            <div className="panel h-full xl:col-span-2">
              <div className="mb-5 flex items-center justify-between dark:text-white-light">
                <h5 className="text-lg font-semibold">Revenue</h5>
                <div className="dropdown">
                  <Dropdown
                    offset={[0, 1]}
                    placement={`${isRtl ? "bottom-start" : "bottom-end"}`}
                    button={
                      <IconHorizontalDots className="text-black/70 hover:!text-primary dark:text-white/70" />
                    }
                  >
                    <ul>
                      <li>
                        <button type="button">Weekly</button>
                      </li>
                      <li>
                        <button type="button">Monthly</button>
                      </li>
                      <li>
                        <button type="button">Yearly</button>
                      </li>
                    </ul>
                  </Dropdown>
                </div>
              </div>
              <p className="text-lg dark:text-white-light/90">
                Total Profit{" "}
                <span className="ml-2 text-primary">{totalProfit} INR</span>
              </p>
              <div className="relative">
                <div className="rounded-lg bg-white dark:bg-black">
                  {isMounted ? (
                    <ReactApexChart
                      series={revenueChart.series}
                      options={revenueChart.options}
                      type="area"
                      height={325}
                      width={"100%"}
                    />
                  ) : (
                    <div className="grid min-h-[325px] place-content-center bg-white-light/30 dark:bg-dark dark:bg-opacity-[0.08] ">
                      <span className="inline-flex h-5 w-5 animate-spin rounded-full  border-2 border-black !border-l-transparent dark:border-white"></span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="panel h-full">
              <div className="mb-5 flex items-center">
                <h5 className="text-lg font-semibold dark:text-white-light">
                  No of Trainee{" "}
                </h5>
              </div>
              <div>
                <div className="rounded-lg bg-white dark:bg-black">
                  {isMounted ? (
                    <ReactApexChart
                      series={salesByCategory.series}
                      options={salesByCategory.options}
                      type="donut"
                      height={460}
                      width={"100%"}
                    />
                  ) : (
                    <div className="grid min-h-[325px] place-content-center bg-white-light/30 dark:bg-dark dark:bg-opacity-[0.08] ">
                      <span className="inline-flex h-5 w-5 animate-spin rounded-full  border-2 border-black !border-l-transparent dark:border-white"></span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="mb-6 grid gap-6 xl:grid-cols-2">
            <div className="panel h-full">
              <div className="mb-5 flex items-center">
                <h5 className="text-lg font-semibold dark:text-white-light">
                  Paid vs Non Paid
                </h5>
              </div>
              <div>
                <div className="rounded-lg bg-white dark:bg-black">
                  {isMounted ? (
                    <ReactApexChart
                      series={columnChart.series}
                      options={columnChart.options}
                      type="bar"
                      height={300}
                      width={"100%"}
                    />
                  ) : (
                    <div className="grid min-h-[300px] place-content-center bg-white-light/30 dark:bg-dark dark:bg-opacity-[0.08] ">
                      <span className="inline-flex h-5 w-5 animate-spin rounded-full  border-2 border-black !border-l-transparent dark:border-white"></span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="panel h-full">
              <div className="mb-5 flex items-center">
                <h5 className="text-lg font-semibold dark:text-white-light">
                  Member Data{" "}
                </h5>
              </div>
              <div>
                <div className="rounded-lg bg-white dark:bg-black">
                  {isMounted ? (
                    <ReactApexChart
                      series={simpleColumnStacked.series}
                      options={simpleColumnStacked.options}
                      type="bar"
                      height={300}
                      width={"100%"}
                    />
                  ) : (
                    <div className="grid min-h-[300px] place-content-center bg-white-light/30 dark:bg-dark dark:bg-opacity-[0.08] ">
                      <span className="inline-flex h-5 w-5 animate-spin rounded-full  border-2 border-black !border-l-transparent dark:border-white"></span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ComponentsDashboardSales;
