import ComponentsDatatablesServices from '@/components/datatables/components-datatables-services';
import IconBell from '@/components/icon/icon-bell';
import { Metadata } from 'next';
import React from 'react';
import DefaultLayout from '../layout';
export const metadata: Metadata = {
   
};

const Export = () => {
    return (
       
        <DefaultLayout>
            <ComponentsDatatablesServices />
        </DefaultLayout>
     
    );
};

export default Export;
