import ComponentsDatatablesPet from '@/components/datatables/components-datatables-pet';
import IconBell from '@/components/icon/icon-bell';
import { Metadata } from 'next';
import React from 'react';
import DefaultLayout from '../layout';
export const metadata: Metadata = {
   
};

const Export = () => {
    return (
       
        <DefaultLayout>
            <ComponentsDatatablesPet />
        </DefaultLayout>
     
    );
};

export default Export;