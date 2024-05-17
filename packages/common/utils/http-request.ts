/* eslint-disable @typescript-eslint/no-explicit-any */
import axios, { AxiosRequestConfig } from 'axios';
import Cookies from 'js-cookie';

const token = Cookies.get('accessToken');

const request = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_BASE_URL,
    headers: { common: { Authorization: `Bearer ${token}` } },
});

export const get = async (path: string, req?: AxiosRequestConfig<any>) => {
    const response = await request.get(path, req);
    return response;
};

export const post = async (
    path: string,
    req?: any,
    headers?: AxiosRequestConfig<AxiosRequestConfig<any>>
) => {
    const response = await request.post(path, req, headers);
    return response;
};

export const put = async (
    path: string,
    req: any,
    headers?: AxiosRequestConfig<AxiosRequestConfig<any>>
) => {
    const response = await request.put(path, req, headers);
    return response;
};

export const del = async (path: string) => {
    const response = await request.delete(path);
    return response;
};

export default request;
