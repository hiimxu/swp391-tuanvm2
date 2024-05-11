import React from 'react';

type Props = {
    children: React.ReactNode;
};

export const DefaultLayout: React.FC<Props> = ({ children }) => {
    return <div>{children}</div>;
};
