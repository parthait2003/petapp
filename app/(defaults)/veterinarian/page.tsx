import ComponentsDatatablesVeterinarian from "@/components/datatables/components-datatables-veterinarian";
import IconBell from "@/components/icon/icon-bell";
import { Metadata } from "next";
import React from "react";
import DefaultLayout from "../layout";
export const metadata: Metadata = {};

const Export = () => {
  return (
    <DefaultLayout>
      <ComponentsDatatablesVeterinarian />
    </DefaultLayout>
  );
};

export default Export;
