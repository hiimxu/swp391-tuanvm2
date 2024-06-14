import React, { useState } from 'react';
import { Button, Card, Typography } from 'antd';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { useRouter } from 'next/router'; // Import useRouter từ Next.js
import * as request from 'common/utils/http-request';
import styles from '../../styles/ProductCard.module.css';
import useLoginModal from '~/hooks/useLoginModal';
import { useAuth } from '~/hooks/useAuth';
import { Product } from '~/types/product';

import FeedbackModal from '../modals/feedback-modal';

type ProductCardProps = Omit<Product, 'updatedAt'>;

const ProductCard: React.FC<ProductCardProps> = ({
    id,
    name,
    discount_price,
    original_price,
    description,
    thumbnail,
}) => {
    const { onOpen } = useLoginModal();
    const auth = useAuth('client');
    const [isFeedbackModalVisible, setFeedbackModalVisible] = useState(false);
    const router = useRouter(); // Sử dụng useRouter từ Next.js

    const addToCart = useMutation({
        mutationFn: async (data: { productId: string; quantity: number }) => {
            if (!auth || !(auth as { access_token: string }).access_token) {
                throw new Error('No access token available');
            }

            const token = (auth as { access_token: string }).access_token;

            return request.post('/cart/add', data, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
        },
        onSuccess: () => {
            toast.success('Product added to cart successfully!');
        },
        onError: () => {
            toast.error('Failed to add product to cart.');
        },
    });

    const handleBuy = async (event: React.MouseEvent<HTMLButtonElement>) => {
        event.stopPropagation();
        if (!auth) {
            onOpen();
        } else {
            addToCart.mutate({
                productId: id,
                quantity: 1,
            });
        }
    };

    const handleFeedback = (event: React.MouseEvent<HTMLButtonElement>) => {
        event.stopPropagation();
        if (!auth) {
            onOpen();
        } else {
            setFeedbackModalVisible(true);
        }
    };

    const handleCardClick = () => {
        router.push(`/product/${id}`);
    };

    const imageUrl = thumbnail ? `/images/${thumbnail}` : '/images/sp1.jpg';

    return (
        <>
            <Card
                className={styles.productCard}
                cover={
                    <img
                        alt={name}
                        className={styles.productImage}
                        src={imageUrl}
                    />
                }
                hoverable
                onClick={handleCardClick} // Thêm sự kiện onClick cho thẻ Card
            >
                <Card.Meta
                    description={
                        <div className={styles.metaDescription}>
                            {description}
                        </div>
                    }
                    title={<div className={styles.metaTitle}>{name}</div>}
                />
                <Typography.Paragraph className={styles.originalPrice}>
                    <del>{original_price}đ</del>
                </Typography.Paragraph>
                <Typography.Paragraph className={styles.discountPrice}>
                    {discount_price}đ
                </Typography.Paragraph>
                <div className={styles.buttonContainer}>
                    <Button
                        className={styles.buyButton}
                        onClick={handleBuy}
                        type="primary"
                    >
                        Mua
                    </Button>
                    <Button
                        className={styles.feedbackButton}
                        onClick={handleFeedback}
                        type="default"
                    >
                        Phản hồi
                    </Button>
                </div>
            </Card>
            <FeedbackModal
                onClose={() => setFeedbackModalVisible(false)}
                productId={id}
                productName={name}
                visible={isFeedbackModalVisible}
            />
        </>
    );
};

export default ProductCard;
