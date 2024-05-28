import React, { useState } from 'react';
import {
    Button,
    Form,
    FormProps,
    Input,
    Pagination,
    Rate,
    Select,
    Space,
    Spin,
    Table,
    Tag,
    Tooltip,
} from 'antd';
import { useQuery } from '@tanstack/react-query';
import * as request from 'common/utils/http-request';
import { PAGE_SIZE, RATING_LIST } from 'common/constant';
import { EyeOutlined, SearchOutlined } from '@ant-design/icons';
import moment from 'moment';
import { currencyFormatter } from 'common/utils/formatter';
import Link from 'next/link';
import ProductFormModal from './product-form-modal';
import { Brand, Category, Product } from '~/types/product';
import Header from '~/components/header';

const FILTER_LIST = [
    {
        id: 'LATEST',
        name: 'Latest Create Date',
    },
    {
        id: 'OLDEST',
        name: 'Oldest Create Date',
    },
    {
        id: 'NAME_A_TO_Z',
        name: 'Name: A to Z',
    },
    {
        id: 'NAME_Z_TO_A',
        name: 'Name: Z to A',
    },
    {
        id: 'RATE_LOW_TO_HIGHT',
        name: 'Rate: Low to Hight',
    },
    {
        id: 'RATE_HIGHT_TO_LOW',
        name: 'Rate: Hight to low',
    },
    {
        id: 'PRICE_LOW_TO_HIGHT',
        name: 'Price: Low to Hight',
    },
    {
        id: 'PRICE_HIGHT_TO_LOW',
        name: 'Price: Hight to low',
    },
];

type FormType = {
    brandId?: string;
    categoryId?: string;
    search?: string;
    rating?: string;
    sortBy?: string;
    isShow?: boolean;
};

type SearchParams = FormType & {
    pageSize?: number;
    currentPage?: number;
};

const ProductList = () => {
    const [searchParams, setSearchParams] = useState<SearchParams>({
        pageSize: PAGE_SIZE,
        currentPage: 1,
    });

    const { data: categories, isLoading: categoryLoading } = useQuery({
        queryKey: ['category'],
        queryFn: () => request.get('category').then((res) => res.data),
    });
    const { data: brands, isLoading: brandLoading } = useQuery({
        queryKey: ['brand'],
        queryFn: () => request.get('brand').then((res) => res.data),
    });

    const {
        data: listProduct,
        isLoading: productLoading,
        refetch,
    } = useQuery({
        queryKey: ['product'],
        queryFn: () =>
            request
                .get('manage/product', { params: { ...searchParams } })
                .then((res) => res.data),
    });

    const columns = [
        {
            title: 'Index',
            dataIndex: 'id',
            key: 'id',
            render: (id: string, record: Product, index: number) => {
                return (
                    index +
                    1 +
                    ((searchParams?.currentPage ?? 1) - 1) *
                        (searchParams?.pageSize ?? 0)
                );
            },
            width: 70,
        },
        {
            title: 'Name',
            dataIndex: 'name',
            key: 'name',
            ellipsis: true,
        },
        {
            title: 'Brand',
            dataIndex: 'brand',
            key: 'name',
            ellipsis: true,
            render: (value: Brand) => <p>{value?.name}</p>,
        },
        {
            title: 'Category',
            dataIndex: 'category',
            key: 'name',
            ellipsis: true,
            render: (value: Category) => <p>{value?.name}</p>,
        },
        {
            title: 'Size',
            dataIndex: 'size',
            key: 'size',
        },
        {
            title: 'Quantity',
            dataIndex: 'quantity',
            key: 'quantity',
        },
        {
            title: 'Sold Quantity',
            dataIndex: 'sold_quantity',
            key: 'sold_quantity',
        },
        {
            title: 'Original Price',
            dataIndex: 'original_price',
            key: 'original_price',
            width: 150,
            render: (value: number) =>
                value && <p>{currencyFormatter(value)}</p>,
        },
        {
            title: 'Discount Price',
            dataIndex: 'discount_price',
            key: 'discount_price',
            ellipsis: true,
            width: 150,
            render: (value: number) =>
                value && <p>{currencyFormatter(value)}</p>,
        },
        {
            title: 'Rating',
            dataIndex: 'rating',
            key: 'rating',
            width: 200,
            render: (value: number) => <Rate disabled value={value ?? 0} />,
        },
        {
            title: 'Show on Client',
            dataIndex: 'isShow',
            key: 'isShow',
            render: (value: boolean) => {
                return (
                    <Tag color={value ? 'blue' : 'red'}>
                        {value ? 'SHOW' : 'HIDE'}
                    </Tag>
                );
            },
        },
        {
            title: 'Create At',
            dataIndex: 'createdAt',
            key: 'createdAt',
            ellipsis: true,
            render: (value: string) => (
                <p>{value && moment(value).format('YYYY-MM-DD')}</p>
            ),
        },
        {
            title: 'Actions',
            key: 'actions',
            render: (_: undefined, record: Product) => (
                <Space size="middle">
                    <ProductFormModal
                        productId={record?.id ?? undefined}
                        reload={() => refetch()}
                        title="Update product"
                        type="UPDATE"
                    />
                    <Tooltip arrow={false} color="#108ee9" title="Detail">
                        <Link href={`/marketer/product/${record?.id}`}>
                            <Button
                                icon={<EyeOutlined />}
                                shape="circle"
                                type="link"
                            />
                        </Link>
                    </Tooltip>
                </Space>
            ),
        },
    ];

    const filterOption = (
        input: string,
        option?: { value: string; label: string }
    ) => (option?.label ?? '').toLowerCase().includes(input.toLowerCase());

    const onFinish: FormProps<FormType>['onFinish'] = (values) => {
        setSearchParams((prev) => ({ ...prev, ...values, currentPage: 1 }));
        setTimeout(() => {
            refetch();
        });
    };

    return (
        <Spin spinning={categoryLoading || brandLoading || productLoading}>
            <Header title="Manage Product" />
            <div>
                <Form
                    className="flex gap-x-10"
                    labelCol={{ span: 6 }}
                    onFinish={onFinish}
                    wrapperCol={{ span: 18 }}
                >
                    <div className="grid flex-1 grid-cols-2 justify-end gap-x-5 xl:grid-cols-3">
                        <Form.Item<FormType> label="Brand" name="brandId">
                            <Select
                                allowClear
                                filterOption={filterOption}
                                options={brands?.data?.map((item: Brand) => ({
                                    value: item.id,
                                    label: item.name,
                                }))}
                                placeholder="Select a brand..."
                                showSearch
                            />
                        </Form.Item>
                        <Form.Item<FormType> label="Category" name="categoryId">
                            <Select
                                allowClear
                                filterOption={filterOption}
                                options={categories?.data?.map(
                                    (item: Category) => ({
                                        value: item.id,
                                        label: item.name,
                                    })
                                )}
                                placeholder="Select a category..."
                                showSearch
                            />
                        </Form.Item>
                        <Form.Item<FormType> label="Name" name="search">
                            <Input.Search placeholder="Enter product name..." />
                        </Form.Item>
                        <Form.Item<FormType> label="Rate" name="rating">
                            <Select allowClear placeholder="Select rating...">
                                {RATING_LIST.map((item) => (
                                    <Select.Option
                                        key={item.id}
                                        value={item.id}
                                    >
                                        <Rate disabled value={item.value} />
                                    </Select.Option>
                                ))}
                            </Select>
                        </Form.Item>
                        <Form.Item<FormType> label="Order by" name="sortBy">
                            <Select allowClear placeholder="Choose a filter...">
                                {FILTER_LIST.map((item) => (
                                    <Select.Option
                                        key={item.id}
                                        value={item.id}
                                    >
                                        {item.name}
                                    </Select.Option>
                                ))}
                            </Select>
                        </Form.Item>
                        <Form.Item<FormType>
                            label="Show on client"
                            name="isShow"
                        >
                            <Select
                                allowClear
                                placeholder="Choose show on client..."
                            >
                                <Select.Option value="true">
                                    <Tag color="blue">SHOW</Tag>
                                </Select.Option>
                                <Select.Option value="false">
                                    <Tag color="red">HIDE</Tag>
                                </Select.Option>
                            </Select>
                        </Form.Item>
                    </div>
                    <Form.Item>
                        <Button
                            htmlType="submit"
                            icon={<SearchOutlined />}
                            type="primary"
                        >
                            Search
                        </Button>
                    </Form.Item>
                </Form>
            </div>
            <div className="mb-10 flex justify-end">
                <ProductFormModal
                    reload={() => {
                        refetch();
                    }}
                    title="Create product"
                    type="CREATE"
                />
            </div>
            <div>
                <Table
                    columns={columns}
                    dataSource={listProduct?.data}
                    pagination={false}
                    rowKey="id"
                    tableLayout="fixed"
                />
                <div className="mt-5 flex justify-end">
                    {listProduct?.pagination?.total ? (
                        <Pagination
                            current={searchParams?.currentPage}
                            defaultCurrent={1}
                            onChange={(page, pageSize) => {
                                setSearchParams((prev) => ({
                                    ...prev,
                                    currentPage: page,
                                    pageSize,
                                }));
                                setTimeout(() => {
                                    refetch();
                                });
                            }}
                            pageSize={searchParams?.pageSize}
                            pageSizeOptions={[5, 10, 20, 50]}
                            showSizeChanger
                            total={listProduct?.pagination?.total}
                        />
                    ) : null}
                </div>
            </div>
        </Spin>
    );
};

export default ProductList;
