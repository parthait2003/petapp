import ComponentsDashboardSales from "@/components/dashboard/components-dashboard-sales";
import { Metadata } from "next";
import React from "react";
import Loginpage from "./login/page";

export const metadata: Metadata = {
  title: "Cause for Paws Login",
};

const Sales = () => {
  return <Loginpage />;
};

export default Sales;
