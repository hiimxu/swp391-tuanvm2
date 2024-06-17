import { useMutation } from '@tanstack/react-query';
import { Button, Modal } from 'antd';
import * as request from 'common/utils/http-request';
import { useRouter } from 'next/router';
import React, { useState } from 'react';
import { toast } from 'react-toastify';

type Props = {
    orderId: string;
    productName: string[] | null;
};

const DeleteOrderAlert: React.FC<Props> = ({ orderId, productName }) => {
    const [isOpenModal, setIsOpenModal] = useState<boolean>(false);
    const { push } = useRouter();
    const { mutate, isPending } = useMutation({
        mutationFn: () =>
            request.del(`product/delete/${orderId}`).then((res) => res.data),
        onSuccess: (res) => {
            toast.success(res?.message);
            setTimeout(() => {
                push('/my-page/my-order');
                setIsOpenModal(false);
            }, 500);
        },
        onError: (error) => {
            toast.error(error.message);
        },
    });

    return (
        <div>
            <Button
                onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setIsOpenModal(true);
                }}
                size="large"
                style={{ width: '200px', zIndex: '20' }}
                type="default"
            >
                Huỷ đơn hàng
            </Button>
            <Modal
                cancelText="Hủy"
                centered
                closable={!isPending}
                maskClosable={false}
                okText="Xác nhận"
                onCancel={() => setIsOpenModal(false)}
                onOk={() => mutate()}
                open={isOpenModal}
                width={600}
            >
                <div className="text-center">
                    <div className="py-5 text-xl font-semibold text-rose-600">
                        Bạn có chắc chắn muốn huỷ đơn hàng?
                    </div>
                    <div>
                        <span className="font-semibold">Mã đơn hàng:</span>{' '}
                        {orderId}
                    </div>
                    <div>
                        <span className="font-semibold">Sản phẩm:</span>{' '}
                        {productName?.map((e, index) => (
                            <span>
                                {e}
                                {index + 1 === productName?.length ? '.' : ', '}
                            </span>
                        ))}
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default DeleteOrderAlert;
