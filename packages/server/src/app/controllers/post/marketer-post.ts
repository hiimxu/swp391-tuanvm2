import { Request, Response } from 'express';
import { jwtDecode } from 'jwt-decode';
import { TokenDecoded } from '../../../types';
import { getToken } from '../../../lib/utils';
import { PAGE_SIZE } from '../../../constant';
import { db } from '../../../lib/db';

type PostFilter = {
    productId?: string;
    title?: string;
    isShow?: boolean;
};

export const getListPostManage = async (req: Request, res: Response) => {
    const { search, pageSize, currentPage, sortBy, productId, title, isShow } =
        req.query;

    const pagination = {
        skip: (Number(currentPage ?? 1) - 1) * Number(pageSize ?? PAGE_SIZE),
        take: Number(pageSize ?? PAGE_SIZE),
    };

    try {
        const whereClause: PostFilter = {};

        if (productId) {
            whereClause.productId = String(productId);
        }
        if (title) {
            whereClause.title = String(title);
        }
        if (isShow) {
            whereClause.isShow = isShow === 'true';
        }

        const select = {
            id: true,
            title: true,
            product: {
                select: {
                    name: true,
                },
            },
            createdAt: true,
            updatedAt: true,
            isShow: true,
        };

        const total = await db.post.count({
            where: {
                title: {
                    contains: String(search || ''),
                },
                ...whereClause,
            },
        });

        let listPost;

        switch (sortBy) {
            case 'LATEST':
                listPost = await db.post.findMany({
                    ...pagination,
                    where: {
                        title: {
                            contains: String(search ?? ''),
                        },
                        ...whereClause,
                    },
                    orderBy: {
                        createdAt: 'desc',
                    },
                    select,
                });
                break;
            case 'OLDEST':
                listPost = await db.post.findMany({
                    ...pagination,
                    where: {
                        title: {
                            contains: String(search ?? ''),
                        },
                        ...whereClause,
                    },
                    orderBy: {
                        createdAt: 'asc',
                    },
                    select,
                });
                break;
            case 'TITLE_A_TO_Z':
                listPost = await db.post.findMany({
                    ...pagination,
                    where: {
                        title: {
                            contains: String(search ?? ''),
                        },
                        ...whereClause,
                    },
                    orderBy: {
                        title: 'asc',
                    },
                    select,
                });
                break;
            case 'TITLE_Z_TO_A':
                listPost = await db.post.findMany({
                    ...pagination,
                    where: {
                        title: {
                            contains: String(search ?? ''),
                        },
                        ...whereClause,
                    },
                    orderBy: {
                        title: 'desc',
                    },
                    select,
                });
                break;

            default:
                listPost = await prisma.post.findMany({
                    ...pagination,
                    where: {
                        title: {
                            contains: String(search ?? ''),
                        },
                        ...whereClause,
                    },
                    orderBy: {
                        createdAt: 'desc',
                    },
                    select,
                });
        }

        return res.status(200).json({
            isOk: true,
            data: listPost,
            message: 'Get list post successfully!',
            pagination: {
                total,
            },
        });
    } catch (error) {
        return res.send(500);
    }
};

export const createPost = async (req: Request, res: Response) => {
    const { title, description, productId, thumbnail, isShow, briefInfo } =
        req.body;
    const accessToken = getToken(req);
    const tokenDecoded = jwtDecode(accessToken) as TokenDecoded;
    try {
        const post = await db.post.create({
            data: {
                title,
                description,
                productId,
                thumbnail,
                isShow,
                briefInfo,
                userId: tokenDecoded.id,
            },
        });

        return res.status(201).json({
            isOk: true,
            data: post,
            message: 'Create new post successfully!',
        });
    } catch (error) {
        return res.status(500).json({ message: 'Internal server error!' });
    }
};

export const updatePost = async (req: Request, res: Response) => {
    const { id } = req.params;
    const { title, description, productId, thumbnail, isShow, briefInfo } =
        req.body;

    try {
        const post = await db.post.update({
            where: {
                id,
            },
            data: {
                title,
                description,
                productId,
                thumbnail,
                isShow,
                briefInfo,
            },
        });

        return res.status(200).json({
            isOk: true,
            data: post,
            message: 'Update post successfully!',
        });
    } catch (error) {
        return res.send(500);
    }
};

export const deletePost = async (req: Request, res: Response) => {
    const { id } = req.params;

    try {
        const post = await db.post.delete({
            where: {
                id,
            },
        });

        return res.status(200).json({
            isOk: true,
            data: post,
            message: 'Delete post successfully!',
        });
    } catch (error) {
        return res.send(500);
    }
};
