import ComponentsDatatablesBooking from "@/components/datatables/components-datatables-booking";
import IconBell from "@/components/icon/icon-bell";
import { Metadata } from "next";
import React from "react";
import DefaultLayout from "../layout";
export const metadata: Metadata = {};

const Export = () => {
  return (
    <DefaultLayout>
      <ComponentsDatatablesBooking />
    </DefaultLayout>
  );
};

export default Export;
