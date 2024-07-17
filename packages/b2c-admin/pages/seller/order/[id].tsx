import React from 'react';
import Header from '~/components/header';
import OrderDetail from '~/components/seller/order/order-detail';

const OrderDetailPage = () => {
    return (
        <div>
            <Header isBack title="Order Detail" />
            <OrderDetail />
        </div>
    );
};

export default OrderDetailPage;
