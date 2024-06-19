import { Button, Card, Col, Layout, Radio, Row, Space, Spin } from 'antd';
import Link from 'next/link';
import type { RadioChangeEvent } from 'antd';
import { useEffect, useState } from 'react';
import request from 'common/utils/http-request';
import { QueryResponseType } from 'common/types';
import { Cart } from 'common/types/cart';
import { useQuery } from '@tanstack/react-query';
import Image from 'next/image';
import { currencyFormatter } from 'common/utils/formatter';
import UserDetailAll from './user-contact';
import { useAuth } from '~/hooks/useAuth';
import useCartStore from '~/hooks/useCartStore';

const { Content, Sider } = Layout;

const CartContact = () => {
    const auth = useAuth();
    const [value, setValue] = useState(1);

    const onChange = (e: RadioChangeEvent) => {
        setValue(e.target.value);
    };
    const [cartItems, setCartItems] = useState<Cart[]>([]);

    const { data: cartData, isLoading: isCartLoading } = useQuery<
        QueryResponseType<Cart>
    >({
        queryKey: ['cart'],
        queryFn: () => {
            if (auth) {
                return request.get('cart').then((res) => res.data);
            }
            return Promise.resolve({ data: null }); // Return a dummy response or handle as needed
        },
        enabled: !!auth, // Only fetch data when auth is true
    });
    const { data: cartStorage } = useCartStore();

    useEffect(() => {
        if (auth) {
            if (cartData?.data) {
                setCartItems(cartData.data);
            }
        } else {
            setCartItems(cartStorage);
        }
    }, [cartData, cartStorage, auth]);

    const totalPrice = cartItems.reduce(
        (total, item) =>
            total +
            (item.quantity ?? 0) *
                (item.product?.discount_price ??
                    item.product?.original_price ??
                    0),
        0
    );

    return (
        <Layout>
            <Content style={{ padding: '0 48px' }}>
                <Layout style={{ padding: '24px 0' }}>
                    <Sider width={200}>
                        <p>Sider</p>
                    </Sider>
                    <Content>
                        <Row gutter={16}>
                            <Col span={10}>
                                <UserDetailAll />
                            </Col>
                            <Col span={6}>
                                <Card
                                    bordered={false}
                                    title={
                                        <div className="font-bold">
                                            Hình thức thanh toán
                                        </div>
                                    }
                                >
                                    <Radio.Group
                                        onChange={onChange}
                                        value={value}
                                    >
                                        <Space direction="vertical">
                                            <Radio className="mb-2" value={1}>
                                                <div className="font-semibold ">
                                                    Thanh toán khi nhận
                                                    hàng(COD)
                                                </div>
                                            </Radio>
                                            <Radio value={2}>
                                                <div className="font-semibold">
                                                    Thanh toán qua VNPAY-QR
                                                </div>
                                            </Radio>
                                        </Space>
                                    </Radio.Group>
                                </Card>
                            </Col>
                            <Col span={8}>
                                <Card
                                    bordered={false}
                                    title={
                                        <div className="font-bold">
                                            Đơn hàng
                                        </div>
                                    }
                                >
                                    <Spin spinning={isCartLoading}>
                                        {cartItems?.map((item) => (
                                            <Card className="m-2">
                                                <Content>
                                                    <Row gutter={16}>
                                                        <Col span={6}>
                                                            <div
                                                                style={{
                                                                    height: 50,
                                                                }}
                                                            >
                                                                <Image
                                                                    alt={
                                                                        item.id ??
                                                                        ''
                                                                    }
                                                                    className="shadow-lg"
                                                                    layout="fill"
                                                                    objectFit="cover"
                                                                    src={`${process.env.NEXT_PUBLIC_IMAGE_BASE_URL}${item.product?.thumbnail}`}
                                                                />
                                                            </div>
                                                        </Col>
                                                        <Col span={6}>
                                                            <div className="text-lg font-semibold">
                                                                {
                                                                    item.product
                                                                        ?.name
                                                                }
                                                            </div>
                                                        </Col>
                                                        <Col span={6}>
                                                            <div className="font-semibol text-lg">
                                                                x{item.quantity}
                                                            </div>
                                                        </Col>
                                                        <Col span={6}>
                                                            <div className="font-semibol text-lg">
                                                                {currencyFormatter(
                                                                    item.product
                                                                        ?.discount_price ??
                                                                        item
                                                                            .product
                                                                            ?.original_price ??
                                                                        0
                                                                )}
                                                            </div>
                                                        </Col>
                                                    </Row>
                                                </Content>
                                            </Card>
                                        ))}
                                    </Spin>

                                    <div className="text-end text-xl font-bold">
                                        Tổng đơn hàng:{' '}
                                        {currencyFormatter(totalPrice)}
                                    </div>
                                    <div className="m-10 flex justify-evenly">
                                        <div>
                                            <Link href="/cart-details">
                                                <Button
                                                    block
                                                    size="large"
                                                    style={{
                                                        marginBottom: 20,
                                                    }}
                                                    type="primary"
                                                >
                                                    Continue
                                                </Button>
                                            </Link>
                                        </div>
                                        <div>
                                            <Button
                                                block
                                                size="large"
                                                type="primary"
                                            >
                                                Checkout
                                            </Button>
                                        </div>
                                    </div>
                                </Card>
                            </Col>
                        </Row>
                    </Content>
                </Layout>
            </Content>
        </Layout>
    );
};

export default CartContact;
